#!/usr/bin/env python3
"""
Predictive Analytics for Compliance Monitoring
Machine learning-based violation pattern prediction and prevention
MANDATORY: Predictive accuracy ≥85% for violation prevention
"""

import json
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from pathlib import Path
import pickle
import logging
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.linear_model import LogisticRegression
import warnings
warnings.filterwarnings('ignore')

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
MODELS_DIR = PROJECT_ROOT / 'scripts/results/compliance/models'
PREDICTIONS_DIR = PROJECT_ROOT / 'scripts/results/compliance/predictions'
DB_PATH = PROJECT_ROOT / 'scripts/results/compliance/metrics/compliance_monitoring.db'
MODEL_ACCURACY_THRESHOLD = 0.85
PREDICTION_HORIZON_HOURS = 24

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class PredictionResult:
    """Prediction result data class"""
    timestamp: datetime
    violation_type: str
    probability: float
    confidence: float
    risk_level: str
    contributing_factors: List[str]
    recommended_actions: List[str]
    time_to_violation: Optional[int] = None  # hours

@dataclass
class ModelMetrics:
    """Model performance metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    feature_importance: Dict[str, float]
    training_date: datetime

class FeatureEngineering:
    """Feature engineering for compliance prediction"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
    
    def extract_features(self, metrics_df: pd.DataFrame, alerts_df: pd.DataFrame) -> pd.DataFrame:
        """Extract features from metrics and alerts data"""
        
        # Create time-based features
        metrics_df['timestamp'] = pd.to_datetime(metrics_df['timestamp'])
        metrics_df['hour'] = metrics_df['timestamp'].dt.hour
        metrics_df['day_of_week'] = metrics_df['timestamp'].dt.dayofweek
        metrics_df['is_weekend'] = metrics_df['day_of_week'].isin([5, 6]).astype(int)
        
        # Create rolling windows for trend analysis
        metrics_df = metrics_df.sort_values('timestamp')
        
        # Group by metric type and create rolling statistics
        feature_df = pd.DataFrame()
        
        for metric_type in metrics_df['metric_type'].unique():
            metric_data = metrics_df[metrics_df['metric_type'] == metric_type].copy()
            
            # Rolling statistics (last 5 measurements)
            metric_data['value_mean_5'] = metric_data['metric_value'].rolling(5, min_periods=1).mean()
            metric_data['value_std_5'] = metric_data['metric_value'].rolling(5, min_periods=1).std()
            metric_data['value_trend_5'] = metric_data['metric_value'].rolling(5, min_periods=1).apply(
                lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) > 1 else 0
            )
            
            # Rolling statistics (last 10 measurements)
            metric_data['value_mean_10'] = metric_data['metric_value'].rolling(10, min_periods=1).mean()
            metric_data['value_std_10'] = metric_data['metric_value'].rolling(10, min_periods=1).std()
            
            # Threshold proximity
            metric_data['threshold_distance'] = metric_data['metric_value'] - metric_data['threshold_value']
            metric_data['threshold_proximity'] = np.abs(metric_data['threshold_distance']) / metric_data['threshold_value']
            
            # Compliance streak
            metric_data['compliance_streak'] = metric_data['is_compliant'].groupby(
                (metric_data['is_compliant'] != metric_data['is_compliant'].shift()).cumsum()
            ).cumsum()
            
            # Add metric type suffix to columns
            metric_data.columns = [f"{col}_{metric_type}" if col not in ['timestamp', 'hour', 'day_of_week', 'is_weekend'] 
                                 else col for col in metric_data.columns]
            
            # Merge with feature dataframe
            if feature_df.empty:
                feature_df = metric_data
            else:
                feature_df = feature_df.merge(metric_data, on=['timestamp', 'hour', 'day_of_week', 'is_weekend'], 
                                            how='outer', suffixes=('', f'_{metric_type}'))
        
        # Add alert-based features
        if not alerts_df.empty:
            alerts_df['timestamp'] = pd.to_datetime(alerts_df['timestamp'])
            
            # Count recent alerts by severity
            for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
                severity_alerts = alerts_df[alerts_df['severity'] == severity]
                
                # Count alerts in last 1, 6, 24 hours
                for hours in [1, 6, 24]:
                    cutoff_time = datetime.now() - timedelta(hours=hours)
                    recent_count = len(severity_alerts[severity_alerts['timestamp'] > cutoff_time])
                    feature_df[f'alerts_{severity.lower()}_{hours}h'] = recent_count
            
            # Average response time by violation type
            for violation_type in alerts_df['violation_type'].unique():
                violation_alerts = alerts_df[alerts_df['violation_type'] == violation_type]
                avg_response_time = violation_alerts['response_time_ms'].mean()
                feature_df[f'avg_response_time_{violation_type}'] = avg_response_time
        
        # Fill missing values
        feature_df = feature_df.fillna(0)
        
        # Store feature columns
        self.feature_columns = [col for col in feature_df.columns 
                               if col not in ['timestamp']]
        
        return feature_df
    
    def prepare_training_data(self, feature_df: pd.DataFrame, alerts_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare training data with labels"""
        
        # Create labels based on future violations
        labels = []
        
        for idx, row in feature_df.iterrows():
            current_time = row['timestamp']
            future_time = current_time + timedelta(hours=PREDICTION_HORIZON_HOURS)
            
            # Check if there's a violation in the next 24 hours
            future_violations = alerts_df[
                (alerts_df['timestamp'] > current_time) & 
                (alerts_df['timestamp'] <= future_time)
            ]
            
            if len(future_violations) > 0:
                # Use the most severe violation as label
                severity_order = {'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0}
                max_severity = future_violations['severity'].map(severity_order).max()
                labels.append(max_severity)
            else:
                labels.append(0)  # No violation
        
        X = feature_df[self.feature_columns]
        y = pd.Series(labels)
        
        return X, y
    
    def scale_features(self, X: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Scale features for training"""
        if fit:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return pd.DataFrame(X_scaled, columns=X.columns, index=X.index)

class CompliancePredictionModel:
    """Machine learning model for compliance prediction"""
    
    def __init__(self):
        self.models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'logistic_regression': LogisticRegression(random_state=42, max_iter=1000)
        }
        self.best_model = None
        self.best_model_name = None
        self.feature_engineering = FeatureEngineering()
        self.metrics = {}
    
    def train_models(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, ModelMetrics]:
        """Train multiple models and select the best one"""
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.feature_engineering.scale_features(X_train, fit=True)
        X_test_scaled = self.feature_engineering.scale_features(X_test, fit=False)
        
        best_accuracy = 0
        
        for model_name, model in self.models.items():
            logger.info(f"Training {model_name}...")
            
            # Train model
            model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True)
            cm = confusion_matrix(y_test, y_pred)
            
            # Feature importance
            if hasattr(model, 'feature_importances_'):
                feature_importance = dict(zip(X.columns, model.feature_importances_))
            else:
                feature_importance = {}
            
            # Store metrics
            self.metrics[model_name] = ModelMetrics(
                accuracy=accuracy,
                precision=report['weighted avg']['precision'],
                recall=report['weighted avg']['recall'],
                f1_score=report['weighted avg']['f1-score'],
                confusion_matrix=cm.tolist(),
                feature_importance=feature_importance,
                training_date=datetime.now()
            )
            
            # Select best model
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                self.best_model = model
                self.best_model_name = model_name
            
            logger.info(f"{model_name} accuracy: {accuracy:.4f}")
        
        logger.info(f"Best model: {self.best_model_name} with accuracy: {best_accuracy:.4f}")
        
        return self.metrics
    
    def predict_violations(self, X: pd.DataFrame) -> List[PredictionResult]:
        """Predict violations for given features"""
        
        if self.best_model is None:
            raise ValueError("No trained model available")
        
        # Scale features
        X_scaled = self.feature_engineering.scale_features(X, fit=False)
        
        # Make predictions
        predictions = self.best_model.predict(X_scaled)
        probabilities = self.best_model.predict_proba(X_scaled)
        
        results = []
        severity_map = {0: 'NONE', 1: 'MEDIUM', 2: 'HIGH', 3: 'CRITICAL'}
        
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            if pred > 0:  # Violation predicted
                max_prob = prob.max()
                confidence = max_prob
                
                # Determine risk level
                if max_prob > 0.8:
                    risk_level = 'HIGH'
                elif max_prob > 0.6:
                    risk_level = 'MEDIUM'
                else:
                    risk_level = 'LOW'
                
                # Get contributing factors (top features)
                contributing_factors = self._get_contributing_factors(X.iloc[i])
                
                # Generate recommendations
                recommended_actions = self._generate_recommendations(severity_map[pred], contributing_factors)
                
                result = PredictionResult(
                    timestamp=datetime.now(),
                    violation_type=severity_map[pred],
                    probability=max_prob,
                    confidence=confidence,
                    risk_level=risk_level,
                    contributing_factors=contributing_factors,
                    recommended_actions=recommended_actions,
                    time_to_violation=PREDICTION_HORIZON_HOURS
                )
                
                results.append(result)
        
        return results
    
    def _get_contributing_factors(self, features: pd.Series) -> List[str]:
        """Get top contributing factors for prediction"""
        
        if not hasattr(self.best_model, 'feature_importances_'):
            return []
        
        feature_importance = self.metrics[self.best_model_name].feature_importance
        
        # Sort by importance
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        # Get top 5 features with their values
        contributing_factors = []
        for feature, importance in sorted_features[:5]:
            if importance > 0.01:  # Only include significant features
                value = features.get(feature, 0)
                contributing_factors.append(f"{feature}: {value:.2f} (importance: {importance:.3f})")
        
        return contributing_factors
    
    def _generate_recommendations(self, violation_type: str, contributing_factors: List[str]) -> List[str]:
        """Generate recommended actions based on prediction"""
        
        recommendations = []
        
        # Base recommendations by violation type
        if violation_type == 'CRITICAL':
            recommendations.extend([
                "Immediate attention required",
                "Activate emergency compliance protocols",
                "Review and execute critical remediation actions"
            ])
        elif violation_type == 'HIGH':
            recommendations.extend([
                "Schedule immediate compliance review",
                "Implement preventive measures",
                "Monitor compliance metrics closely"
            ])
        elif violation_type == 'MEDIUM':
            recommendations.extend([
                "Plan compliance improvement activities",
                "Review current processes",
                "Implement incremental improvements"
            ])
        
        # Factor-specific recommendations
        for factor in contributing_factors:
            if 'tool_execution' in factor:
                recommendations.append("Increase tool execution rate and reduce simulation")
            elif 'script_execution' in factor:
                recommendations.append("Ensure mandatory scripts are executed")
            elif 'transparency' in factor:
                recommendations.append("Improve P56 transparency compliance")
            elif 'threshold_proximity' in factor:
                recommendations.append("Address metrics approaching thresholds")
        
        return list(set(recommendations))  # Remove duplicates
    
    def save_model(self, filename: str):
        """Save trained model to file"""
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        
        model_data = {
            'best_model': self.best_model,
            'best_model_name': self.best_model_name,
            'feature_engineering': self.feature_engineering,
            'metrics': self.metrics
        }
        
        with open(MODELS_DIR / filename, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Model saved to {MODELS_DIR / filename}")
    
    def load_model(self, filename: str):
        """Load trained model from file"""
        
        with open(MODELS_DIR / filename, 'rb') as f:
            model_data = pickle.load(f)
        
        self.best_model = model_data['best_model']
        self.best_model_name = model_data['best_model_name']
        self.feature_engineering = model_data['feature_engineering']
        self.metrics = model_data['metrics']
        
        logger.info(f"Model loaded from {MODELS_DIR / filename}")

class PredictiveAnalyticsEngine:
    """Main predictive analytics engine"""
    
    def __init__(self):
        self.db_path = DB_PATH
        self.model = CompliancePredictionModel()
        self.predictions_cache = {}
    
    def load_data(self, days_back: int = 30) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Load historical data for training"""
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        with sqlite3.connect(self.db_path) as conn:
            # Load metrics
            metrics_query = """
                SELECT * FROM compliance_metrics 
                WHERE timestamp > ? 
                ORDER BY timestamp
            """
            metrics_df = pd.read_sql(metrics_query, conn, params=(cutoff_date,))
            
            # Load alerts
            alerts_query = """
                SELECT * FROM compliance_alerts 
                WHERE timestamp > ? 
                ORDER BY timestamp
            """
            alerts_df = pd.read_sql(alerts_query, conn, params=(cutoff_date,))
        
        return metrics_df, alerts_df
    
    def train_prediction_model(self, retrain: bool = False):
        """Train or retrain the prediction model"""
        
        logger.info("Loading training data...")
        metrics_df, alerts_df = self.load_data(days_back=30)
        
        if len(metrics_df) < 100:
            logger.warning("Insufficient data for training. Need at least 100 samples.")
            return
        
        logger.info(f"Training with {len(metrics_df)} metrics and {len(alerts_df)} alerts")
        
        # Feature engineering
        logger.info("Extracting features...")
        feature_df = self.model.feature_engineering.extract_features(metrics_df, alerts_df)
        
        # Prepare training data
        X, y = self.model.feature_engineering.prepare_training_data(feature_df, alerts_df)
        
        # Train models
        logger.info("Training models...")
        metrics = self.model.train_models(X, y)
        
        # Check if model meets accuracy threshold
        best_accuracy = metrics[self.model.best_model_name].accuracy
        if best_accuracy < MODEL_ACCURACY_THRESHOLD:
            logger.warning(f"Model accuracy {best_accuracy:.4f} below threshold {MODEL_ACCURACY_THRESHOLD}")
        else:
            logger.info(f"Model meets accuracy threshold: {best_accuracy:.4f}")
        
        # Save model
        model_filename = f"compliance_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        self.model.save_model(model_filename)
        
        # Save metrics report
        self._save_training_report(metrics)
        
        return metrics
    
    def predict_future_violations(self, hours_ahead: int = 24) -> List[PredictionResult]:
        """Predict violations for the specified time horizon"""
        
        # Load recent data
        metrics_df, alerts_df = self.load_data(days_back=7)
        
        if len(metrics_df) < 10:
            logger.warning("Insufficient recent data for prediction")
            return []
        
        # Get latest features
        feature_df = self.model.feature_engineering.extract_features(metrics_df, alerts_df)
        
        # Use only the latest features for prediction
        latest_features = feature_df.tail(1)
        
        # Make predictions
        predictions = self.model.predict_violations(latest_features[self.model.feature_engineering.feature_columns])
        
        # Cache predictions
        self.predictions_cache[datetime.now()] = predictions
        
        # Save predictions
        self._save_predictions(predictions)
        
        return predictions
    
    def get_model_performance(self) -> Dict[str, Any]:
        """Get current model performance metrics"""
        
        if not self.model.metrics:
            return {}
        
        performance = {}
        for model_name, metrics in self.model.metrics.items():
            performance[model_name] = {
                'accuracy': metrics.accuracy,
                'precision': metrics.precision,
                'recall': metrics.recall,
                'f1_score': metrics.f1_score,
                'training_date': metrics.training_date.isoformat(),
                'top_features': dict(list(sorted(metrics.feature_importance.items(), 
                                                key=lambda x: x[1], reverse=True))[:10])
            }
        
        return performance
    
    def _save_training_report(self, metrics: Dict[str, ModelMetrics]):
        """Save training report to file"""
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'model_performance': {},
            'best_model': self.model.best_model_name,
            'accuracy_threshold': MODEL_ACCURACY_THRESHOLD,
            'prediction_horizon_hours': PREDICTION_HORIZON_HOURS
        }
        
        for model_name, model_metrics in metrics.items():
            report['model_performance'][model_name] = {
                'accuracy': model_metrics.accuracy,
                'precision': model_metrics.precision,
                'recall': model_metrics.recall,
                'f1_score': model_metrics.f1_score,
                'confusion_matrix': model_metrics.confusion_matrix,
                'feature_importance': model_metrics.feature_importance,
                'training_date': model_metrics.training_date.isoformat()
            }
        
        # Save report
        PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
        report_file = PREDICTIONS_DIR / f"training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Training report saved to {report_file}")
    
    def _save_predictions(self, predictions: List[PredictionResult]):
        """Save predictions to file"""
        
        if not predictions:
            return
        
        predictions_data = {
            'timestamp': datetime.now().isoformat(),
            'prediction_horizon_hours': PREDICTION_HORIZON_HOURS,
            'total_predictions': len(predictions),
            'predictions': [
                {
                    'timestamp': pred.timestamp.isoformat(),
                    'violation_type': pred.violation_type,
                    'probability': pred.probability,
                    'confidence': pred.confidence,
                    'risk_level': pred.risk_level,
                    'contributing_factors': pred.contributing_factors,
                    'recommended_actions': pred.recommended_actions,
                    'time_to_violation': pred.time_to_violation
                }
                for pred in predictions
            ]
        }
        
        # Save predictions
        PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
        predictions_file = PREDICTIONS_DIR / f"predictions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(predictions_file, 'w') as f:
            json.dump(predictions_data, f, indent=2)
        
        logger.info(f"Predictions saved to {predictions_file}")

def main():
    """Main function for command-line usage"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='Predictive Analytics for Compliance Monitoring')
    parser.add_argument('action', choices=['train', 'predict', 'performance'], 
                       help='Action to perform')
    parser.add_argument('--retrain', action='store_true', 
                       help='Force model retraining')
    parser.add_argument('--hours', type=int, default=24, 
                       help='Hours ahead for prediction')
    
    args = parser.parse_args()
    
    engine = PredictiveAnalyticsEngine()
    
    if args.action == 'train':
        logger.info("Training compliance prediction model...")
        metrics = engine.train_prediction_model(retrain=args.retrain)
        
        if metrics:
            print(f"Training completed. Best model: {engine.model.best_model_name}")
            print(f"Best accuracy: {metrics[engine.model.best_model_name].accuracy:.4f}")
        else:
            print("Training failed or insufficient data")
    
    elif args.action == 'predict':
        logger.info(f"Predicting violations for next {args.hours} hours...")
        
        # Load latest model
        model_files = list(MODELS_DIR.glob("compliance_model_*.pkl"))
        if model_files:
            latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
            engine.model.load_model(latest_model.name)
            
            predictions = engine.predict_future_violations(args.hours)
            
            if predictions:
                print(f"Found {len(predictions)} potential violations:")
                for pred in predictions:
                    print(f"  - {pred.violation_type} (Risk: {pred.risk_level}, "
                          f"Probability: {pred.probability:.3f})")
            else:
                print("No violations predicted")
        else:
            print("No trained model found. Please train first.")
    
    elif args.action == 'performance':
        logger.info("Getting model performance metrics...")
        
        # Load latest model
        model_files = list(MODELS_DIR.glob("compliance_model_*.pkl"))
        if model_files:
            latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
            engine.model.load_model(latest_model.name)
            
            performance = engine.get_model_performance()
            
            if performance:
                print("Model Performance:")
                for model_name, metrics in performance.items():
                    print(f"  {model_name}:")
                    print(f"    Accuracy: {metrics['accuracy']:.4f}")
                    print(f"    Precision: {metrics['precision']:.4f}")
                    print(f"    Recall: {metrics['recall']:.4f}")
                    print(f"    F1-Score: {metrics['f1_score']:.4f}")
            else:
                print("No performance metrics available")
        else:
            print("No trained model found")

if __name__ == "__main__":
    main()