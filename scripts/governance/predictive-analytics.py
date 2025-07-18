#!/usr/bin/env python3
"""
🔮 Predictive Analytics Framework - Phase 3 Implementation
Advanced trend analysis and future problem prediction

CRITICAL Implementation of Principle #108 - Predictive Analytics
"""

import os
import sys
import json
import sqlite3
import logging
import asyncio
import threading
import math
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict
import numpy as np
import scipy.stats as stats
from collections import defaultdict, deque
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Add governance directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

@dataclass
class PredictionModel:
    """Represents a predictive model"""
    model_id: str
    model_type: str
    target_metric: str
    algorithm: str
    parameters: Dict[str, Any]
    training_data_size: int
    accuracy_score: float
    last_trained: datetime
    prediction_horizon: int  # hours
    confidence_interval: float
    created_at: datetime

@dataclass
class Prediction:
    """Represents a future prediction"""
    prediction_id: str
    model_id: str
    metric_type: str
    predicted_value: float
    confidence_score: float
    prediction_time: datetime
    target_time: datetime
    context: Dict[str, Any]
    risk_level: str
    early_warning: bool
    intervention_recommended: bool

@dataclass
class TrendForecast:
    """Represents a trend forecast"""
    forecast_id: str
    trend_type: str
    current_value: float
    predicted_values: List[float]
    time_horizon: List[datetime]
    confidence_bands: List[Tuple[float, float]]
    trend_direction: str
    trend_strength: float
    seasonality_detected: bool
    anomaly_probability: float
    created_at: datetime

@dataclass
class EarlyWarning:
    """Represents an early warning alert"""
    warning_id: str
    alert_type: str
    predicted_issue: str
    probability: float
    estimated_time_to_issue: int  # hours
    severity: str
    affected_components: List[str]
    recommended_actions: List[str]
    prevention_window: int  # hours
    created_at: datetime

class AdvancedPredictor:
    """Advanced prediction algorithms with machine learning"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.db_path = "scripts/results/governance/predictive_analytics.db"
        self.setup_database()
        
        # Prediction models
        self.models = {}
        self.scalers = {}
        
        # Trend detection parameters
        self.trend_window = config.get('trend_window', 50)
        self.prediction_horizon = config.get('prediction_horizon', 24)  # hours
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        
        # Anomaly detection
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.anomaly_threshold = config.get('anomaly_threshold', 0.8)
        
        # Early warning thresholds
        self.warning_thresholds = {
            'file_size_violation': {'hours': 48, 'probability': 0.8},
            'performance_degradation': {'hours': 24, 'probability': 0.75},
            'resource_exhaustion': {'hours': 12, 'probability': 0.85},
            'technical_debt_accumulation': {'hours': 72, 'probability': 0.7},
            'system_instability': {'hours': 6, 'probability': 0.9}
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for predictive analytics"""
        logger = logging.getLogger('predictive_analytics')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            os.makedirs("scripts/results/governance/logs", exist_ok=True)
            
            handler = logging.FileHandler('scripts/results/governance/logs/predictive_analytics.log')
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        return logger
    
    def setup_database(self):
        """Initialize predictive analytics database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS prediction_models (
                    model_id TEXT PRIMARY KEY,
                    model_type TEXT NOT NULL,
                    target_metric TEXT NOT NULL,
                    algorithm TEXT NOT NULL,
                    parameters TEXT NOT NULL,
                    training_data_size INTEGER NOT NULL,
                    accuracy_score REAL NOT NULL,
                    last_trained TIMESTAMP NOT NULL,
                    prediction_horizon INTEGER NOT NULL,
                    confidence_interval REAL NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS predictions (
                    prediction_id TEXT PRIMARY KEY,
                    model_id TEXT NOT NULL,
                    metric_type TEXT NOT NULL,
                    predicted_value REAL NOT NULL,
                    confidence_score REAL NOT NULL,
                    prediction_time TIMESTAMP NOT NULL,
                    target_time TIMESTAMP NOT NULL,
                    context TEXT NOT NULL,
                    risk_level TEXT NOT NULL,
                    early_warning BOOLEAN NOT NULL,
                    intervention_recommended BOOLEAN NOT NULL,
                    FOREIGN KEY (model_id) REFERENCES prediction_models (model_id)
                );
                
                CREATE TABLE IF NOT EXISTS trend_forecasts (
                    forecast_id TEXT PRIMARY KEY,
                    trend_type TEXT NOT NULL,
                    current_value REAL NOT NULL,
                    predicted_values TEXT NOT NULL,
                    time_horizon TEXT NOT NULL,
                    confidence_bands TEXT NOT NULL,
                    trend_direction TEXT NOT NULL,
                    trend_strength REAL NOT NULL,
                    seasonality_detected BOOLEAN NOT NULL,
                    anomaly_probability REAL NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS early_warnings (
                    warning_id TEXT PRIMARY KEY,
                    alert_type TEXT NOT NULL,
                    predicted_issue TEXT NOT NULL,
                    probability REAL NOT NULL,
                    estimated_time_to_issue INTEGER NOT NULL,
                    severity TEXT NOT NULL,
                    affected_components TEXT NOT NULL,
                    recommended_actions TEXT NOT NULL,
                    prevention_window INTEGER NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS prediction_accuracy (
                    accuracy_id TEXT PRIMARY KEY,
                    model_id TEXT NOT NULL,
                    prediction_id TEXT NOT NULL,
                    actual_value REAL,
                    predicted_value REAL NOT NULL,
                    accuracy_score REAL,
                    error_magnitude REAL,
                    validation_time TIMESTAMP NOT NULL,
                    FOREIGN KEY (model_id) REFERENCES prediction_models (model_id),
                    FOREIGN KEY (prediction_id) REFERENCES predictions (prediction_id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_predictions_metric ON predictions(metric_type);
                CREATE INDEX IF NOT EXISTS idx_predictions_time ON predictions(target_time);
                CREATE INDEX IF NOT EXISTS idx_forecasts_type ON trend_forecasts(trend_type);
                CREATE INDEX IF NOT EXISTS idx_warnings_severity ON early_warnings(severity);
                CREATE INDEX IF NOT EXISTS idx_accuracy_model ON prediction_accuracy(model_id);
            """)
    
    async def start_predictive_analytics(self):
        """Start predictive analytics system"""
        self.logger.info("🔮 Starting Predictive Analytics Framework")
        
        try:
            # Start analytics tasks
            tasks = [
                asyncio.create_task(self._model_training_loop()),
                asyncio.create_task(self._prediction_generation_loop()),
                asyncio.create_task(self._trend_forecasting_loop()),
                asyncio.create_task(self._early_warning_loop()),
                asyncio.create_task(self._model_validation_loop())
            ]
            
            await asyncio.gather(*tasks)
            
        except Exception as e:
            self.logger.error(f"❌ Error in predictive analytics: {e}")
        finally:
            self.logger.info("🔮 Predictive analytics stopped")
    
    async def _model_training_loop(self):
        """Continuous model training and improvement"""
        while True:
            try:
                self.logger.info("🧠 Training predictive models")
                
                # Get historical data for training
                training_data = await self._get_training_data()
                
                # Train models for each metric type
                for metric_type, data in training_data.items():
                    if len(data) >= 20:  # Minimum data points for training
                        await self._train_prediction_model(metric_type, data)
                
                # Wait for next training cycle
                await asyncio.sleep(self.config.get('model_training_interval', 3600))  # 1 hour
                
            except Exception as e:
                self.logger.error(f"Error in model training: {e}")
                await asyncio.sleep(300)
    
    async def _get_training_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get historical data for model training"""
        training_data = defaultdict(list)
        
        try:
            # Get data from performance optimization database
            perf_db_path = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db_path):
                with sqlite3.connect(perf_db_path) as conn:
                    cursor = conn.execute("""
                        SELECT metric_type, value, timestamp, context
                        FROM performance_metrics
                        WHERE timestamp > datetime('now', '-7 days')
                        ORDER BY metric_type, timestamp
                    """)
                    
                    for row in cursor.fetchall():
                        metric_type, value, timestamp, context = row
                        training_data[metric_type].append({
                            'value': value,
                            'timestamp': datetime.fromisoformat(timestamp),
                            'context': json.loads(context) if context else {}
                        })
            
            # Get data from governance database
            governance_db_path = "scripts/results/governance/governance.db"
            if os.path.exists(governance_db_path):
                with sqlite3.connect(governance_db_path) as conn:
                    cursor = conn.execute("""
                        SELECT metric_name, value, timestamp
                        FROM governance_metrics
                        WHERE timestamp > datetime('now', '-7 days')
                        ORDER BY metric_name, timestamp
                    """)
                    
                    for row in cursor.fetchall():
                        metric_name, value, timestamp = row
                        training_data[metric_name].append({
                            'value': value,
                            'timestamp': datetime.fromisoformat(timestamp),
                            'context': {}
                        })
                        
        except Exception as e:
            self.logger.error(f"Error getting training data: {e}")
            
        return dict(training_data)
    
    async def _train_prediction_model(self, metric_type: str, data: List[Dict[str, Any]]):
        """Train prediction model for specific metric"""
        try:
            # Prepare data
            timestamps = [d['timestamp'] for d in data]
            values = [d['value'] for d in data]
            
            # Convert timestamps to numerical features
            base_time = min(timestamps)
            time_features = [(t - base_time).total_seconds() / 3600 for t in timestamps]  # Hours since base
            
            # Create additional features
            X_features = []
            for i, (time_val, timestamp) in enumerate(zip(time_features, timestamps)):
                features = [
                    time_val,  # Time since base
                    timestamp.hour,  # Hour of day
                    timestamp.weekday(),  # Day of week
                    i % 24,  # Position in 24-hour cycle
                    i % 168,  # Position in weekly cycle
                ]
                
                # Add lag features
                if i >= 3:
                    features.extend([
                        values[i-1],  # Previous value
                        values[i-2],  # Value 2 periods ago
                        values[i-3],  # Value 3 periods ago
                        np.mean(values[max(0, i-5):i]) if i >= 5 else values[i]  # 5-period moving average
                    ])
                else:
                    features.extend([values[i]] * 4)  # Fill with current value
                
                X_features.append(features)
            
            # Convert to numpy arrays
            X = np.array(X_features)
            y = np.array(values)
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train multiple models and select best
            models_to_try = {
                'linear_regression': LinearRegression(),
                # Could add more models here like RandomForest, SVR, etc.
            }
            
            best_model = None
            best_score = -float('inf')
            best_algorithm = None
            
            for algorithm, model in models_to_try.items():
                try:
                    # Simple train/test split (last 20% as test)
                    split_idx = int(len(X_scaled) * 0.8)
                    X_train, X_test = X_scaled[:split_idx], X_scaled[split_idx:]
                    y_train, y_test = y[:split_idx], y[split_idx:]
                    
                    # Train model
                    model.fit(X_train, y_train)
                    
                    # Evaluate
                    if len(X_test) > 0:
                        score = model.score(X_test, y_test)
                        if score > best_score:
                            best_score = score
                            best_model = model
                            best_algorithm = algorithm
                            
                except Exception as e:
                    self.logger.warning(f"Error training {algorithm} for {metric_type}: {e}")
                    continue
            
            if best_model is not None:
                # Store model
                model_id = f"model_{metric_type}_{int(datetime.now().timestamp())}"
                self.models[metric_type] = {
                    'model': best_model,
                    'scaler': scaler,
                    'model_id': model_id,
                    'base_time': base_time
                }
                self.scalers[metric_type] = scaler
                
                # Store model metadata
                await self._store_prediction_model(PredictionModel(
                    model_id=model_id,
                    model_type="time_series",
                    target_metric=metric_type,
                    algorithm=best_algorithm,
                    parameters={'features': X.shape[1], 'training_samples': len(X)},
                    training_data_size=len(data),
                    accuracy_score=max(best_score, 0.0),
                    last_trained=datetime.now(),
                    prediction_horizon=self.prediction_horizon,
                    confidence_interval=0.95,
                    created_at=datetime.now()
                ))
                
                self.logger.info(f"✅ Trained {best_algorithm} model for {metric_type} (score: {best_score:.3f})")
            else:
                self.logger.warning(f"❌ Failed to train model for {metric_type}")
                
        except Exception as e:
            self.logger.error(f"Error training model for {metric_type}: {e}")
    
    async def _store_prediction_model(self, model: PredictionModel):
        """Store prediction model metadata"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO prediction_models
                    (model_id, model_type, target_metric, algorithm, parameters,
                     training_data_size, accuracy_score, last_trained,
                     prediction_horizon, confidence_interval, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    model.model_id,
                    model.model_type,
                    model.target_metric,
                    model.algorithm,
                    json.dumps(model.parameters),
                    model.training_data_size,
                    model.accuracy_score,
                    model.last_trained.isoformat(),
                    model.prediction_horizon,
                    model.confidence_interval,
                    model.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing prediction model: {e}")
    
    async def _prediction_generation_loop(self):
        """Generate predictions using trained models"""
        while True:
            try:
                self.logger.info("🔮 Generating predictions")
                
                # Generate predictions for each metric with trained models
                for metric_type, model_info in self.models.items():
                    predictions = await self._generate_predictions(metric_type, model_info)
                    
                    for prediction in predictions:
                        await self._store_prediction(prediction)
                        
                        # Check for early warnings
                        if prediction.early_warning:
                            await self._generate_early_warning(prediction)
                
                # Wait for next prediction cycle
                await asyncio.sleep(self.config.get('prediction_interval', 1800))  # 30 minutes
                
            except Exception as e:
                self.logger.error(f"Error in prediction generation: {e}")
                await asyncio.sleep(300)
    
    async def _generate_predictions(self, metric_type: str, model_info: Dict[str, Any]) -> List[Prediction]:
        """Generate predictions for a specific metric"""
        predictions = []
        
        try:
            model = model_info['model']
            scaler = model_info['scaler']
            model_id = model_info['model_id']
            base_time = model_info['base_time']
            
            # Get recent data for context
            recent_data = await self._get_recent_metric_data(metric_type, hours=24)
            if len(recent_data) < 5:
                return predictions
            
            # Generate predictions for next several time points
            current_time = datetime.now()
            prediction_times = [
                current_time + timedelta(hours=h) 
                for h in [1, 3, 6, 12, 24]
            ]
            
            for target_time in prediction_times:
                try:
                    # Prepare features for prediction
                    time_since_base = (target_time - base_time).total_seconds() / 3600
                    features = [
                        time_since_base,
                        target_time.hour,
                        target_time.weekday(),
                        int(time_since_base) % 24,
                        int(time_since_base) % 168,
                    ]
                    
                    # Add lag features from recent data
                    if len(recent_data) >= 3:
                        features.extend([
                            recent_data[-1]['value'],
                            recent_data[-2]['value'],
                            recent_data[-3]['value'],
                            np.mean([d['value'] for d in recent_data[-5:]])
                        ])
                    else:
                        current_val = recent_data[-1]['value'] if recent_data else 0
                        features.extend([current_val] * 4)
                    
                    # Scale and predict
                    X_pred = scaler.transform([features])
                    predicted_value = model.predict(X_pred)[0]
                    
                    # Calculate confidence (simplified)
                    confidence_score = model_info.get('accuracy_score', 0.5)
                    
                    # Determine risk level
                    risk_level = self._assess_risk_level(metric_type, predicted_value)
                    
                    # Check if early warning needed
                    early_warning = self._check_early_warning_criteria(metric_type, predicted_value, target_time)
                    
                    prediction = Prediction(
                        prediction_id=f"pred_{metric_type}_{int(target_time.timestamp())}",
                        model_id=model_id,
                        metric_type=metric_type,
                        predicted_value=predicted_value,
                        confidence_score=confidence_score,
                        prediction_time=current_time,
                        target_time=target_time,
                        context={'features_used': len(features), 'recent_trend': self._calculate_trend(recent_data)},
                        risk_level=risk_level,
                        early_warning=early_warning,
                        intervention_recommended=early_warning and risk_level in ['high', 'critical']
                    )
                    
                    predictions.append(prediction)
                    
                except Exception as e:
                    self.logger.warning(f"Error generating prediction for {target_time}: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error generating predictions for {metric_type}: {e}")
            
        return predictions
    
    async def _get_recent_metric_data(self, metric_type: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent data for a metric"""
        data = []
        
        try:
            # Check performance optimization database
            perf_db_path = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db_path):
                with sqlite3.connect(perf_db_path) as conn:
                    cursor = conn.execute("""
                        SELECT value, timestamp
                        FROM performance_metrics
                        WHERE metric_type = ? AND timestamp > datetime('now', '-{} hours')
                        ORDER BY timestamp
                    """.format(hours), (metric_type,))
                    
                    for row in cursor.fetchall():
                        data.append({
                            'value': row[0],
                            'timestamp': datetime.fromisoformat(row[1])
                        })
                        
        except Exception as e:
            self.logger.error(f"Error getting recent data for {metric_type}: {e}")
            
        return data
    
    def _assess_risk_level(self, metric_type: str, predicted_value: float) -> str:
        """Assess risk level based on predicted value"""
        # Define risk thresholds by metric type
        risk_thresholds = {
            'cognitive_steps': {'low': 2.0, 'medium': 2.5, 'high': 3.0, 'critical': 4.0},
            'file_access_time': {'low': 2000, 'medium': 5000, 'high': 10000, 'critical': 20000},
            'cpu_usage': {'low': 50, 'medium': 75, 'high': 90, 'critical': 95},
            'memory_usage': {'low': 500, 'medium': 1000, 'high': 1500, 'critical': 2000},
            'disk_io_latency': {'low': 100, 'medium': 200, 'high': 500, 'critical': 1000}
        }
        
        thresholds = risk_thresholds.get(metric_type, {'low': 0, 'medium': 50, 'high': 75, 'critical': 90})
        
        if predicted_value >= thresholds['critical']:
            return 'critical'
        elif predicted_value >= thresholds['high']:
            return 'high'
        elif predicted_value >= thresholds['medium']:
            return 'medium'
        else:
            return 'low'
    
    def _check_early_warning_criteria(self, metric_type: str, predicted_value: float, target_time: datetime) -> bool:
        """Check if early warning should be triggered"""
        hours_ahead = (target_time - datetime.now()).total_seconds() / 3600
        
        # Define early warning criteria
        warning_criteria = {
            'cognitive_steps': {'threshold': 3.0, 'max_hours': 24},
            'file_access_time': {'threshold': 8000, 'max_hours': 12},
            'cpu_usage': {'threshold': 85, 'max_hours': 6},
            'memory_usage': {'threshold': 1500, 'max_hours': 8},
            'disk_io_latency': {'threshold': 400, 'max_hours': 4}
        }
        
        criteria = warning_criteria.get(metric_type, {'threshold': float('inf'), 'max_hours': 0})
        
        return (predicted_value >= criteria['threshold'] and 
                hours_ahead <= criteria['max_hours'])
    
    def _calculate_trend(self, data: List[Dict[str, Any]]) -> str:
        """Calculate trend direction from recent data"""
        if len(data) < 3:
            return 'stable'
        
        values = [d['value'] for d in data]
        
        # Simple trend calculation
        recent_avg = np.mean(values[-3:])
        earlier_avg = np.mean(values[:-3]) if len(values) > 3 else values[0]
        
        change_pct = (recent_avg - earlier_avg) / max(abs(earlier_avg), 0.001)
        
        if change_pct > 0.1:
            return 'increasing'
        elif change_pct < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    async def _store_prediction(self, prediction: Prediction):
        """Store prediction in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO predictions
                    (prediction_id, model_id, metric_type, predicted_value,
                     confidence_score, prediction_time, target_time, context,
                     risk_level, early_warning, intervention_recommended)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    prediction.prediction_id,
                    prediction.model_id,
                    prediction.metric_type,
                    prediction.predicted_value,
                    prediction.confidence_score,
                    prediction.prediction_time.isoformat(),
                    prediction.target_time.isoformat(),
                    json.dumps(prediction.context),
                    prediction.risk_level,
                    prediction.early_warning,
                    prediction.intervention_recommended
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing prediction: {e}")
    
    async def _trend_forecasting_loop(self):
        """Generate trend forecasts"""
        while True:
            try:
                self.logger.info("📈 Generating trend forecasts")
                
                # Generate forecasts for key metrics
                metrics_to_forecast = [
                    'cognitive_steps', 'file_access_time', 'cpu_usage', 
                    'memory_usage', 'disk_io_latency'
                ]
                
                for metric_type in metrics_to_forecast:
                    forecast = await self._generate_trend_forecast(metric_type)
                    if forecast:
                        await self._store_trend_forecast(forecast)
                
                await asyncio.sleep(self.config.get('forecast_interval', 3600))  # 1 hour
                
            except Exception as e:
                self.logger.error(f"Error in trend forecasting: {e}")
                await asyncio.sleep(600)
    
    async def _generate_trend_forecast(self, metric_type: str) -> Optional[TrendForecast]:
        """Generate trend forecast for metric"""
        try:
            # Get historical data
            data = await self._get_recent_metric_data(metric_type, hours=168)  # 1 week
            if len(data) < 20:
                return None
            
            values = [d['value'] for d in data]
            timestamps = [d['timestamp'] for d in data]
            
            # Current value
            current_value = values[-1]
            
            # Generate forecast for next 24 hours
            forecast_hours = 24
            forecast_times = [
                timestamps[-1] + timedelta(hours=h) 
                for h in range(1, forecast_hours + 1)
            ]
            
            # Simple trend-based forecast
            if len(values) >= 10:
                # Calculate trend using recent points
                recent_values = values[-10:]
                trend_slope = (recent_values[-1] - recent_values[0]) / len(recent_values)
                
                # Generate predictions
                predicted_values = []
                confidence_bands = []
                
                for i, future_time in enumerate(forecast_times):
                    # Simple linear extrapolation with noise
                    predicted_val = current_value + (trend_slope * (i + 1))
                    
                    # Add uncertainty (grows with time)
                    uncertainty = np.std(values[-20:]) * (1 + i * 0.1)
                    lower_bound = predicted_val - 1.96 * uncertainty
                    upper_bound = predicted_val + 1.96 * uncertainty
                    
                    predicted_values.append(predicted_val)
                    confidence_bands.append((lower_bound, upper_bound))
                
                # Assess trend characteristics
                trend_direction = 'increasing' if trend_slope > 0.01 else ('decreasing' if trend_slope < -0.01 else 'stable')
                trend_strength = min(abs(trend_slope) / (np.std(values) + 0.001), 1.0)
                
                # Simple seasonality detection (check for patterns)
                seasonality_detected = self._detect_seasonality(values)
                
                # Anomaly probability
                anomaly_probability = self._calculate_anomaly_probability(values)
                
                forecast = TrendForecast(
                    forecast_id=f"forecast_{metric_type}_{int(datetime.now().timestamp())}",
                    trend_type=metric_type,
                    current_value=current_value,
                    predicted_values=predicted_values,
                    time_horizon=forecast_times,
                    confidence_bands=confidence_bands,
                    trend_direction=trend_direction,
                    trend_strength=trend_strength,
                    seasonality_detected=seasonality_detected,
                    anomaly_probability=anomaly_probability,
                    created_at=datetime.now()
                )
                
                return forecast
                
        except Exception as e:
            self.logger.error(f"Error generating forecast for {metric_type}: {e}")
            
        return None
    
    def _detect_seasonality(self, values: List[float]) -> bool:
        """Simple seasonality detection"""
        if len(values) < 24:
            return False
        
        try:
            # Check for daily pattern (24-hour cycle)
            daily_correlation = 0.0
            if len(values) >= 48:
                recent_24 = values[-24:]
                previous_24 = values[-48:-24]
                daily_correlation = np.corrcoef(recent_24, previous_24)[0, 1]
            
            # Check for weekly pattern (168-hour cycle)
            weekly_correlation = 0.0
            if len(values) >= 168:
                recent_week = values[-168:]
                # Simple autocorrelation at lag 24 (daily pattern)
                if len(recent_week) >= 48:
                    lag_24_values = recent_week[:-24]
                    current_values = recent_week[24:]
                    if len(lag_24_values) == len(current_values):
                        weekly_correlation = np.corrcoef(lag_24_values, current_values)[0, 1]
            
            # Seasonality if correlation > 0.3
            return max(abs(daily_correlation), abs(weekly_correlation)) > 0.3
            
        except Exception:
            return False
    
    def _calculate_anomaly_probability(self, values: List[float]) -> float:
        """Calculate probability of anomalous behavior"""
        if len(values) < 10:
            return 0.0
        
        try:
            # Use statistical measures
            recent_value = values[-1]
            historical_mean = np.mean(values[:-1])
            historical_std = np.std(values[:-1])
            
            if historical_std > 0:
                z_score = abs(recent_value - historical_mean) / historical_std
                # Convert z-score to probability (rough approximation)
                anomaly_prob = min(z_score / 3.0, 1.0)
                return anomaly_prob
            
        except Exception:
            pass
            
        return 0.0
    
    async def _store_trend_forecast(self, forecast: TrendForecast):
        """Store trend forecast in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO trend_forecasts
                    (forecast_id, trend_type, current_value, predicted_values,
                     time_horizon, confidence_bands, trend_direction,
                     trend_strength, seasonality_detected, anomaly_probability,
                     created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    forecast.forecast_id,
                    forecast.trend_type,
                    forecast.current_value,
                    json.dumps(forecast.predicted_values),
                    json.dumps([t.isoformat() for t in forecast.time_horizon]),
                    json.dumps(forecast.confidence_bands),
                    forecast.trend_direction,
                    forecast.trend_strength,
                    forecast.seasonality_detected,
                    forecast.anomaly_probability,
                    forecast.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing trend forecast: {e}")
    
    async def _early_warning_loop(self):
        """Generate early warning alerts"""
        while True:
            try:
                self.logger.info("⚠️ Checking for early warning conditions")
                
                # Check recent predictions for warning conditions
                warnings = await self._check_early_warning_conditions()
                
                for warning in warnings:
                    await self._store_early_warning(warning)
                    await self._send_early_warning_alert(warning)
                
                await asyncio.sleep(self.config.get('warning_check_interval', 600))  # 10 minutes
                
            except Exception as e:
                self.logger.error(f"Error in early warning loop: {e}")
                await asyncio.sleep(300)
    
    async def _check_early_warning_conditions(self) -> List[EarlyWarning]:
        """Check for early warning conditions"""
        warnings = []
        
        try:
            # Get recent predictions with early warning flags
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT prediction_id, metric_type, predicted_value, target_time,
                           risk_level, intervention_recommended
                    FROM predictions
                    WHERE early_warning = 1 
                    AND target_time > datetime('now')
                    AND prediction_time > datetime('now', '-1 hour')
                    ORDER BY target_time
                """)
                
                warning_predictions = cursor.fetchall()
            
            # Group by issue type
            issue_groups = defaultdict(list)
            for pred in warning_predictions:
                pred_id, metric_type, pred_value, target_time, risk_level, intervention = pred
                issue_type = self._classify_issue_type(metric_type, pred_value, risk_level)
                issue_groups[issue_type].append({
                    'prediction_id': pred_id,
                    'metric_type': metric_type,
                    'predicted_value': pred_value,
                    'target_time': datetime.fromisoformat(target_time),
                    'risk_level': risk_level,
                    'intervention_recommended': intervention
                })
            
            # Generate warnings for each issue type
            for issue_type, predictions in issue_groups.items():
                if issue_type in self.warning_thresholds:
                    threshold_config = self.warning_thresholds[issue_type]
                    
                    # Calculate aggregate probability
                    risk_levels = [p['risk_level'] for p in predictions]
                    risk_weights = {'low': 0.2, 'medium': 0.5, 'high': 0.8, 'critical': 1.0}
                    probability = np.mean([risk_weights.get(r, 0.5) for r in risk_levels])
                    
                    if probability >= threshold_config['probability']:
                        # Find earliest prediction time
                        earliest_time = min(p['target_time'] for p in predictions)
                        time_to_issue = int((earliest_time - datetime.now()).total_seconds() / 3600)
                        
                        # Determine severity
                        severity = 'critical' if any(p['risk_level'] == 'critical' for p in predictions) else \
                                  'high' if any(p['risk_level'] == 'high' for p in predictions) else 'medium'
                        
                        # Get affected components
                        affected_components = list(set(p['metric_type'] for p in predictions))
                        
                        # Generate recommendations
                        recommendations = self._generate_prevention_recommendations(issue_type, predictions)
                        
                        warning = EarlyWarning(
                            warning_id=f"warning_{issue_type}_{int(datetime.now().timestamp())}",
                            alert_type=issue_type,
                            predicted_issue=f"Predicted {issue_type} in {time_to_issue} hours",
                            probability=probability,
                            estimated_time_to_issue=time_to_issue,
                            severity=severity,
                            affected_components=affected_components,
                            recommended_actions=recommendations,
                            prevention_window=max(time_to_issue - 2, 1),  # At least 1 hour
                            created_at=datetime.now()
                        )
                        
                        warnings.append(warning)
                        
        except Exception as e:
            self.logger.error(f"Error checking early warning conditions: {e}")
            
        return warnings
    
    def _classify_issue_type(self, metric_type: str, predicted_value: float, risk_level: str) -> str:
        """Classify the type of issue based on metric and predicted value"""
        if metric_type == 'cognitive_steps' and predicted_value > 3.0:
            return 'performance_degradation'
        elif metric_type in ['cpu_usage', 'memory_usage'] and risk_level in ['high', 'critical']:
            return 'resource_exhaustion'
        elif metric_type == 'file_access_time' and predicted_value > 10000:
            return 'file_size_violation'
        elif 'debt' in metric_type:
            return 'technical_debt_accumulation'
        else:
            return 'system_instability'
    
    def _generate_prevention_recommendations(self, issue_type: str, predictions: List[Dict[str, Any]]) -> List[str]:
        """Generate prevention recommendations based on issue type"""
        recommendations = {
            'file_size_violation': [
                "Implement file modularization before size limits are exceeded",
                "Review and optimize large files proactively",
                "Set up automated file size monitoring"
            ],
            'performance_degradation': [
                "Optimize navigation structure to reduce cognitive complexity",
                "Implement performance caching mechanisms",
                "Review and simplify complex workflows"
            ],
            'resource_exhaustion': [
                "Scale system resources before reaching critical thresholds",
                "Optimize memory usage patterns",
                "Implement resource monitoring and alerting"
            ],
            'technical_debt_accumulation': [
                "Schedule technical debt cleanup sessions",
                "Implement stricter code review processes",
                "Automate debt detection and resolution"
            ],
            'system_instability': [
                "Perform comprehensive system health check",
                "Review recent changes for stability impact",
                "Implement additional monitoring and failsafes"
            ]
        }
        
        return recommendations.get(issue_type, ["Investigate issue and implement appropriate fixes"])
    
    async def _store_early_warning(self, warning: EarlyWarning):
        """Store early warning in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO early_warnings
                    (warning_id, alert_type, predicted_issue, probability,
                     estimated_time_to_issue, severity, affected_components,
                     recommended_actions, prevention_window, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    warning.warning_id,
                    warning.alert_type,
                    warning.predicted_issue,
                    warning.probability,
                    warning.estimated_time_to_issue,
                    warning.severity,
                    json.dumps(warning.affected_components),
                    json.dumps(warning.recommended_actions),
                    warning.prevention_window,
                    warning.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing early warning: {e}")
    
    async def _send_early_warning_alert(self, warning: EarlyWarning):
        """Send early warning alert"""
        self.logger.warning(f"🚨 EARLY WARNING [{warning.severity.upper()}]: {warning.predicted_issue}")
        self.logger.warning(f"   Probability: {warning.probability:.1%}")
        self.logger.warning(f"   Time to issue: {warning.estimated_time_to_issue} hours")
        self.logger.warning(f"   Affected: {', '.join(warning.affected_components)}")
        self.logger.warning(f"   Prevention window: {warning.prevention_window} hours")
        
        # Store alert file
        os.makedirs("scripts/results/governance/alerts", exist_ok=True)
        alert_file = f"scripts/results/governance/alerts/early_warning_{warning.warning_id}.json"
        
        try:
            with open(alert_file, 'w') as f:
                json.dump(asdict(warning), f, indent=2, default=str)
        except Exception as e:
            self.logger.error(f"Error storing alert file: {e}")
    
    async def _model_validation_loop(self):
        """Validate prediction accuracy"""
        while True:
            try:
                self.logger.info("✅ Validating prediction accuracy")
                
                # Validate predictions that have reached their target time
                await self._validate_recent_predictions()
                
                # Update model accuracy scores
                await self._update_model_accuracy()
                
                await asyncio.sleep(self.config.get('validation_interval', 7200))  # 2 hours
                
            except Exception as e:
                self.logger.error(f"Error in model validation: {e}")
                await asyncio.sleep(600)
    
    async def _validate_recent_predictions(self):
        """Validate predictions against actual values"""
        try:
            current_time = datetime.now()
            
            # Get predictions that should have occurred by now
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT prediction_id, model_id, metric_type, predicted_value, target_time
                    FROM predictions
                    WHERE target_time <= datetime('now')
                    AND prediction_id NOT IN (SELECT prediction_id FROM prediction_accuracy)
                    ORDER BY target_time DESC
                    LIMIT 50
                """)
                
                predictions_to_validate = cursor.fetchall()
            
            for pred_id, model_id, metric_type, pred_value, target_time_str in predictions_to_validate:
                target_time = datetime.fromisoformat(target_time_str)
                
                # Get actual value near target time
                actual_value = await self._get_actual_value(metric_type, target_time)
                
                if actual_value is not None:
                    # Calculate accuracy
                    error_magnitude = abs(actual_value - pred_value)
                    relative_error = error_magnitude / max(abs(actual_value), 0.001)
                    accuracy_score = max(0, 1 - relative_error)  # Simple accuracy metric
                    
                    # Store validation result
                    accuracy_id = f"acc_{pred_id}_{int(current_time.timestamp())}"
                    with sqlite3.connect(self.db_path) as conn:
                        conn.execute("""
                            INSERT INTO prediction_accuracy
                            (accuracy_id, model_id, prediction_id, actual_value,
                             predicted_value, accuracy_score, error_magnitude,
                             validation_time)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            accuracy_id,
                            model_id,
                            pred_id,
                            actual_value,
                            pred_value,
                            accuracy_score,
                            error_magnitude,
                            current_time.isoformat()
                        ))
                        
        except Exception as e:
            self.logger.error(f"Error validating predictions: {e}")
    
    async def _get_actual_value(self, metric_type: str, target_time: datetime) -> Optional[float]:
        """Get actual metric value near target time"""
        try:
            # Look for values within ±30 minutes of target time
            time_window = timedelta(minutes=30)
            start_time = target_time - time_window
            end_time = target_time + time_window
            
            # Check performance database
            perf_db_path = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db_path):
                with sqlite3.connect(perf_db_path) as conn:
                    cursor = conn.execute("""
                        SELECT value, timestamp
                        FROM performance_metrics
                        WHERE metric_type = ?
                        AND timestamp BETWEEN ? AND ?
                        ORDER BY ABS(julianday(timestamp) - julianday(?))
                        LIMIT 1
                    """, (metric_type, start_time.isoformat(), end_time.isoformat(), target_time.isoformat()))
                    
                    row = cursor.fetchone()
                    if row:
                        return row[0]
                        
        except Exception as e:
            self.logger.error(f"Error getting actual value for {metric_type}: {e}")
            
        return None
    
    async def _update_model_accuracy(self):
        """Update model accuracy scores based on validation results"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Calculate average accuracy for each model
                cursor = conn.execute("""
                    SELECT model_id, AVG(accuracy_score) as avg_accuracy
                    FROM prediction_accuracy
                    WHERE validation_time > datetime('now', '-7 days')
                    GROUP BY model_id
                """)
                
                for model_id, avg_accuracy in cursor.fetchall():
                    # Update model accuracy
                    conn.execute("""
                        UPDATE prediction_models
                        SET accuracy_score = ?
                        WHERE model_id = ?
                    """, (avg_accuracy, model_id))
                    
        except Exception as e:
            self.logger.error(f"Error updating model accuracy: {e}")

def main():
    """Main entry point for predictive analytics"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Predictive Analytics Framework - Phase 3")
    parser.add_argument("--config", default="scripts/governance/predictive-analytics-config.json",
                       help="Configuration file path")
    parser.add_argument("--daemon", action="store_true",
                       help="Run as daemon process")
    
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    try:
        if os.path.exists(args.config):
            with open(args.config, 'r') as f:
                config = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load config {args.config}: {e}")
        
    # Default configuration
    default_config = {
        "model_training_interval": 3600,    # 1 hour
        "prediction_interval": 1800,        # 30 minutes
        "forecast_interval": 3600,          # 1 hour
        "warning_check_interval": 600,      # 10 minutes
        "validation_interval": 7200,        # 2 hours
        "trend_window": 50,
        "prediction_horizon": 24,
        "confidence_threshold": 0.7,
        "anomaly_threshold": 0.8
    }
    
    config = {**default_config, **config}
    
    if args.daemon:
        # Run as daemon
        predictor = AdvancedPredictor(config)
        try:
            asyncio.run(predictor.start_predictive_analytics())
        except KeyboardInterrupt:
            print("\n🔮 Predictive analytics interrupted by user")
    else:
        # Single analysis run
        async def single_run():
            predictor = AdvancedPredictor(config)
            
            print("🔮 Running predictive analytics analysis")
            
            # Get training data
            training_data = await predictor._get_training_data()
            print(f"Found training data for {len(training_data)} metrics")
            
            # Train models
            for metric_type, data in training_data.items():
                if len(data) >= 20:
                    await predictor._train_prediction_model(metric_type, data)
                    print(f"Trained model for {metric_type}")
            
            # Generate predictions
            for metric_type in predictor.models.keys():
                predictions = await predictor._generate_predictions(metric_type, predictor.models[metric_type])
                print(f"Generated {len(predictions)} predictions for {metric_type}")
            
            print("✅ Predictive analytics complete")
        
        asyncio.run(single_run())

if __name__ == "__main__":
    main()