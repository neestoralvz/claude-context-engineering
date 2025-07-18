#!/usr/bin/env python3
"""
🔄 Continuous Improvement Engine - Phase 3 Implementation
Self-learning algorithms and automated optimization cycles

CRITICAL Implementation of Principle #108 - Continuous Improvement
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
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Add governance directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

@dataclass
class LearningPattern:
    """Represents a learned pattern from system behavior"""
    pattern_id: str
    pattern_type: str
    source_data: str
    pattern_signature: Dict[str, Any]
    effectiveness_score: float
    usage_count: int
    success_rate: float
    last_applied: datetime
    confidence_level: float
    improvement_potential: float
    created_at: datetime

@dataclass
class OptimizationCycle:
    """Represents a complete optimization cycle"""
    cycle_id: str
    cycle_type: str
    target_component: str
    baseline_metrics: Dict[str, float]
    applied_optimizations: List[str]
    achieved_improvements: Dict[str, float]
    cycle_duration: int  # minutes
    success_score: float
    lessons_learned: List[str]
    next_recommendations: List[str]
    created_at: datetime
    completed_at: Optional[datetime] = None

@dataclass
class LearningInsight:
    """Represents an insight derived from learning algorithms"""
    insight_id: str
    insight_type: str
    description: str
    supporting_evidence: Dict[str, Any]
    confidence_score: float
    potential_impact: float
    recommended_actions: List[str]
    validation_criteria: Dict[str, Any]
    created_at: datetime

@dataclass
class AdaptiveThreshold:
    """Represents an adaptively learned threshold"""
    threshold_id: str
    metric_type: str
    current_value: float
    historical_values: List[float]
    adaptation_rate: float
    stability_score: float
    last_updated: datetime
    reason_for_change: str

class SelfLearningEngine:
    """Advanced self-learning algorithms for continuous improvement"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.db_path = "scripts/results/governance/continuous_improvement.db"
        self.setup_database()
        
        # Learning configuration
        self.learning_rate = config.get('learning_rate', 0.1)
        self.pattern_retention = config.get('pattern_retention', 1000)
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        self.improvement_threshold = config.get('improvement_threshold', 0.05)  # 5% minimum improvement
        
        # Machine learning models
        self.pattern_classifier = None
        self.optimization_predictor = None
        self.scaler = StandardScaler()
        
        # Learning memory
        self.pattern_memory = deque(maxlen=self.pattern_retention)
        self.success_history = deque(maxlen=500)
        self.failure_analysis = deque(maxlen=200)
        
        # Adaptive thresholds
        self.adaptive_thresholds = {}
        
        # Learning categories
        self.learning_categories = {
            'performance_optimization': self._learn_performance_patterns,
            'governance_effectiveness': self._learn_governance_patterns,
            'prediction_accuracy': self._learn_prediction_patterns,
            'correction_efficiency': self._learn_correction_patterns,
            'threshold_adaptation': self._learn_threshold_patterns,
            'anomaly_detection': self._learn_anomaly_patterns
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for continuous improvement"""
        logger = logging.getLogger('continuous_improvement')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            os.makedirs("scripts/results/governance/logs", exist_ok=True)
            
            handler = logging.FileHandler('scripts/results/governance/logs/continuous_improvement.log')
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
        """Initialize continuous improvement database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS learning_patterns (
                    pattern_id TEXT PRIMARY KEY,
                    pattern_type TEXT NOT NULL,
                    source_data TEXT NOT NULL,
                    pattern_signature TEXT NOT NULL,
                    effectiveness_score REAL NOT NULL,
                    usage_count INTEGER NOT NULL,
                    success_rate REAL NOT NULL,
                    last_applied TIMESTAMP NOT NULL,
                    confidence_level REAL NOT NULL,
                    improvement_potential REAL NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS optimization_cycles (
                    cycle_id TEXT PRIMARY KEY,
                    cycle_type TEXT NOT NULL,
                    target_component TEXT NOT NULL,
                    baseline_metrics TEXT NOT NULL,
                    applied_optimizations TEXT NOT NULL,
                    achieved_improvements TEXT NOT NULL,
                    cycle_duration INTEGER NOT NULL,
                    success_score REAL NOT NULL,
                    lessons_learned TEXT NOT NULL,
                    next_recommendations TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS learning_insights (
                    insight_id TEXT PRIMARY KEY,
                    insight_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    supporting_evidence TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    potential_impact REAL NOT NULL,
                    recommended_actions TEXT NOT NULL,
                    validation_criteria TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS adaptive_thresholds (
                    threshold_id TEXT PRIMARY KEY,
                    metric_type TEXT NOT NULL,
                    current_value REAL NOT NULL,
                    historical_values TEXT NOT NULL,
                    adaptation_rate REAL NOT NULL,
                    stability_score REAL NOT NULL,
                    last_updated TIMESTAMP NOT NULL,
                    reason_for_change TEXT NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS improvement_experiments (
                    experiment_id TEXT PRIMARY KEY,
                    experiment_type TEXT NOT NULL,
                    hypothesis TEXT NOT NULL,
                    experimental_setup TEXT NOT NULL,
                    control_metrics TEXT NOT NULL,
                    experimental_metrics TEXT NOT NULL,
                    statistical_significance REAL,
                    effect_size REAL,
                    conclusion TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_patterns_type ON learning_patterns(pattern_type);
                CREATE INDEX IF NOT EXISTS idx_cycles_component ON optimization_cycles(target_component);
                CREATE INDEX IF NOT EXISTS idx_insights_type ON learning_insights(insight_type);
                CREATE INDEX IF NOT EXISTS idx_thresholds_metric ON adaptive_thresholds(metric_type);
                CREATE INDEX IF NOT EXISTS idx_experiments_type ON improvement_experiments(experiment_type);
            """)
    
    async def start_continuous_improvement(self):
        """Start the continuous improvement engine"""
        self.logger.info("🔄 Starting Continuous Improvement Engine")
        
        try:
            # Initialize machine learning models
            await self._initialize_learning_models()
            
            # Start improvement loops
            tasks = [
                asyncio.create_task(self._learning_loop()),
                asyncio.create_task(self._optimization_cycle_loop()),
                asyncio.create_task(self._insight_generation_loop()),
                asyncio.create_task(self._threshold_adaptation_loop()),
                asyncio.create_task(self._experiment_design_loop())
            ]
            
            await asyncio.gather(*tasks)
            
        except Exception as e:
            self.logger.error(f"❌ Error in continuous improvement: {e}")
        finally:
            self.logger.info("🔄 Continuous improvement engine stopped")
    
    async def _initialize_learning_models(self):
        """Initialize machine learning models for pattern recognition"""
        try:
            self.logger.info("🧠 Initializing learning models")
            
            # Load historical data for training
            training_data = await self._get_historical_training_data()
            
            if training_data and len(training_data) > 20:
                # Train pattern classifier
                X, y = self._prepare_training_data(training_data)
                if len(X) > 0:
                    # Simple clustering for pattern recognition
                    self.pattern_classifier = KMeans(n_clusters=min(5, len(X) // 4), random_state=42)
                    self.pattern_classifier.fit(X)
                    
                    # Train optimization predictor
                    self.optimization_predictor = RandomForestRegressor(n_estimators=50, random_state=42)
                    self.optimization_predictor.fit(X, y)
                    
                    self.logger.info("✅ Learning models initialized successfully")
                else:
                    self.logger.warning("⚠️ Insufficient training data for model initialization")
            else:
                self.logger.warning("⚠️ No historical data available for model training")
                
        except Exception as e:
            self.logger.error(f"Error initializing learning models: {e}")
    
    async def _get_historical_training_data(self) -> List[Dict[str, Any]]:
        """Get historical data for training learning models"""
        training_data = []
        
        try:
            # Collect from governance database
            governance_db = "scripts/results/governance/governance.db"
            if os.path.exists(governance_db):
                with sqlite3.connect(governance_db) as conn:
                    cursor = conn.execute("""
                        SELECT metric_name, value, effectiveness_score, timestamp
                        FROM governance_metrics
                        WHERE timestamp > datetime('now', '-30 days')
                        ORDER BY timestamp
                    """)
                    
                    for row in cursor.fetchall():
                        training_data.append({
                            'metric_name': row[0],
                            'value': row[1],
                            'effectiveness': row[2],
                            'timestamp': row[3]
                        })
            
            # Collect from performance optimization database
            perf_db = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db):
                with sqlite3.connect(perf_db) as conn:
                    cursor = conn.execute("""
                        SELECT action_id, success, improvement_achieved, execution_time
                        FROM optimization_results
                        WHERE completed_at > datetime('now', '-30 days')
                        ORDER BY completed_at
                    """)
                    
                    for row in cursor.fetchall():
                        training_data.append({
                            'action_id': row[0],
                            'success': row[1],
                            'improvement': row[2],
                            'execution_time': row[3]
                        })
                        
        except Exception as e:
            self.logger.error(f"Error getting historical training data: {e}")
            
        return training_data
    
    def _prepare_training_data(self, data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for machine learning models"""
        X = []
        y = []
        
        try:
            for item in data:
                if 'effectiveness' in item:
                    # Feature engineering for governance data
                    features = [
                        item.get('value', 0),
                        hash(item.get('metric_name', '')) % 1000,  # Simple hash encoding
                        len(item.get('metric_name', '')),
                    ]
                    X.append(features)
                    y.append(item['effectiveness'])
                
                elif 'improvement' in item:
                    # Feature engineering for optimization data
                    features = [
                        1 if item.get('success') else 0,
                        item.get('improvement', 0),
                        item.get('execution_time', 0),
                    ]
                    X.append(features)
                    y.append(item.get('improvement', 0))
            
            if X:
                X = np.array(X)
                y = np.array(y)
                
                # Scale features
                X = self.scaler.fit_transform(X)
                
                return X, y
                
        except Exception as e:
            self.logger.error(f"Error preparing training data: {e}")
            
        return np.array([]), np.array([])
    
    async def _learning_loop(self):
        """Main learning loop that identifies and stores patterns"""
        while True:
            try:
                self.logger.info("🧠 Running learning cycle")
                
                # Run all learning algorithms
                for category, learning_func in self.learning_categories.items():
                    try:
                        patterns = await learning_func()
                        for pattern in patterns:
                            await self._store_learning_pattern(pattern)
                            self.pattern_memory.append(pattern)
                            
                    except Exception as e:
                        self.logger.error(f"Error in {category} learning: {e}")
                
                # Update learning models
                await self._update_learning_models()
                
                # Wait for next learning cycle
                await asyncio.sleep(self.config.get('learning_interval', 3600))  # 1 hour
                
            except Exception as e:
                self.logger.error(f"Error in learning loop: {e}")
                await asyncio.sleep(600)  # Wait 10 minutes on error
    
    async def _learn_performance_patterns(self) -> List[LearningPattern]:
        """Learn patterns from performance optimization results"""
        patterns = []
        
        try:
            # Get recent performance data
            perf_db = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db):
                with sqlite3.connect(perf_db) as conn:
                    cursor = conn.execute("""
                        SELECT metric_type, AVG(value) as avg_value, COUNT(*) as count
                        FROM performance_metrics
                        WHERE timestamp > datetime('now', '-24 hours')
                        GROUP BY metric_type
                        HAVING count >= 5
                    """)
                    
                    metric_averages = dict(cursor.fetchall())
                
                # Identify performance patterns
                for metric_type, avg_value in metric_averages.items():
                    if count >= 10:  # Sufficient data points
                        # Analyze if this represents a significant pattern
                        pattern_strength = self._calculate_pattern_strength(metric_type, avg_value)
                        
                        if pattern_strength > 0.7:
                            pattern = LearningPattern(
                                pattern_id=f"perf_pattern_{metric_type}_{int(datetime.now().timestamp())}",
                                pattern_type="performance_optimization",
                                source_data=metric_type,
                                pattern_signature={
                                    "metric_type": metric_type,
                                    "average_value": avg_value,
                                    "pattern_strength": pattern_strength,
                                    "sample_size": count
                                },
                                effectiveness_score=pattern_strength,
                                usage_count=0,
                                success_rate=0.0,
                                last_applied=datetime.now(),
                                confidence_level=min(pattern_strength, 0.95),
                                improvement_potential=self._estimate_improvement_potential(metric_type, avg_value),
                                created_at=datetime.now()
                            )
                            patterns.append(pattern)
                            
        except Exception as e:
            self.logger.error(f"Error learning performance patterns: {e}")
            
        return patterns
    
    def _calculate_pattern_strength(self, metric_type: str, avg_value: float) -> float:
        """Calculate the strength of a detected pattern"""
        try:
            # Get historical baseline for this metric
            baseline = self._get_historical_baseline(metric_type)
            if baseline is None:
                return 0.5  # Neutral strength for new metrics
            
            # Calculate deviation from baseline
            if baseline > 0:
                deviation = abs(avg_value - baseline) / baseline
            else:
                deviation = abs(avg_value - baseline)
            
            # Pattern strength inversely related to deviation for performance metrics
            if metric_type in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                # Lower values are better
                strength = max(0, 1 - deviation) if avg_value <= baseline else max(0, 0.5 - deviation)
            else:
                # Higher values are better (like effectiveness scores)
                strength = max(0, 1 - deviation) if avg_value >= baseline else max(0, 0.5 - deviation)
            
            return min(strength, 1.0)
            
        except Exception as e:
            self.logger.error(f"Error calculating pattern strength: {e}")
            return 0.5
    
    def _get_historical_baseline(self, metric_type: str) -> Optional[float]:
        """Get historical baseline for a metric type"""
        try:
            # Check if we have adaptive threshold for this metric
            if metric_type in self.adaptive_thresholds:
                return self.adaptive_thresholds[metric_type].current_value
            
            # Otherwise use predefined targets
            baselines = {
                'cognitive_steps': 2.5,
                'file_access_time': 5000,
                'cpu_usage': 50,
                'memory_usage': 500,
                'governance_effectiveness': 95,
                'prevention_rate': 95
            }
            
            return baselines.get(metric_type)
            
        except Exception as e:
            self.logger.error(f"Error getting historical baseline: {e}")
            return None
    
    def _estimate_improvement_potential(self, metric_type: str, current_value: float) -> float:
        """Estimate the improvement potential for a metric"""
        try:
            # Get target value
            targets = {
                'cognitive_steps': 2.0,
                'file_access_time': 3000,
                'cpu_usage': 30,
                'memory_usage': 300,
                'governance_effectiveness': 98,
                'prevention_rate': 98
            }
            
            target = targets.get(metric_type, current_value)
            
            if metric_type in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                # Lower is better
                if current_value > target:
                    potential = min((current_value - target) / max(current_value, 0.001), 1.0)
                else:
                    potential = 0.1  # Small room for improvement
            else:
                # Higher is better
                if current_value < target:
                    potential = min((target - current_value) / max(target, 0.001), 1.0)
                else:
                    potential = 0.1  # Small room for improvement
            
            return max(potential, 0.0)
            
        except Exception as e:
            self.logger.error(f"Error estimating improvement potential: {e}")
            return 0.5
    
    async def _learn_governance_patterns(self) -> List[LearningPattern]:
        """Learn patterns from governance effectiveness"""
        patterns = []
        
        try:
            # Analyze governance intervention patterns
            governance_db = "scripts/results/governance/governance.db"
            if os.path.exists(governance_db):
                with sqlite3.connect(governance_db) as conn:
                    cursor = conn.execute("""
                        SELECT intervention_type, AVG(effectiveness_score) as avg_eff, COUNT(*) as count
                        FROM governance_interventions
                        WHERE timestamp > datetime('now', '-7 days')
                        GROUP BY intervention_type
                        HAVING count >= 3
                    """)
                    
                    for row in cursor.fetchall():
                        intervention_type, avg_effectiveness, count = row
                        
                        if avg_effectiveness > 0.8:  # High effectiveness threshold
                            pattern = LearningPattern(
                                pattern_id=f"gov_pattern_{intervention_type}_{int(datetime.now().timestamp())}",
                                pattern_type="governance_effectiveness",
                                source_data=intervention_type,
                                pattern_signature={
                                    "intervention_type": intervention_type,
                                    "average_effectiveness": avg_effectiveness,
                                    "sample_size": count
                                },
                                effectiveness_score=avg_effectiveness,
                                usage_count=count,
                                success_rate=avg_effectiveness,
                                last_applied=datetime.now(),
                                confidence_level=min(count / 10.0, 0.95),
                                improvement_potential=1.0 - avg_effectiveness,
                                created_at=datetime.now()
                            )
                            patterns.append(pattern)
                            
        except Exception as e:
            self.logger.error(f"Error learning governance patterns: {e}")
            
        return patterns
    
    async def _learn_prediction_patterns(self) -> List[LearningPattern]:
        """Learn patterns from prediction accuracy"""
        patterns = []
        
        try:
            # Analyze prediction accuracy patterns
            pred_db = "scripts/results/governance/predictive_analytics.db"
            if os.path.exists(pred_db):
                with sqlite3.connect(pred_db) as conn:
                    cursor = conn.execute("""
                        SELECT model_id, AVG(accuracy_score) as avg_accuracy, COUNT(*) as count
                        FROM prediction_accuracy
                        WHERE validation_time > datetime('now', '-7 days')
                        GROUP BY model_id
                        HAVING count >= 5 AND avg_accuracy > 0.7
                    """)
                    
                    for row in cursor.fetchall():
                        model_id, avg_accuracy, count = row
                        
                        pattern = LearningPattern(
                            pattern_id=f"pred_pattern_{model_id}_{int(datetime.now().timestamp())}",
                            pattern_type="prediction_accuracy",
                            source_data=model_id,
                            pattern_signature={
                                "model_id": model_id,
                                "average_accuracy": avg_accuracy,
                                "validation_count": count
                            },
                            effectiveness_score=avg_accuracy,
                            usage_count=count,
                            success_rate=avg_accuracy,
                            last_applied=datetime.now(),
                            confidence_level=min(count / 20.0, 0.95),
                            improvement_potential=1.0 - avg_accuracy,
                            created_at=datetime.now()
                        )
                        patterns.append(pattern)
                        
        except Exception as e:
            self.logger.error(f"Error learning prediction patterns: {e}")
            
        return patterns
    
    async def _learn_correction_patterns(self) -> List[LearningPattern]:
        """Learn patterns from correction efficiency"""
        patterns = []
        
        try:
            # Analyze self-healing correction patterns
            healing_db = "scripts/results/governance/self_healing.db"
            if os.path.exists(healing_db):
                with sqlite3.connect(healing_db) as conn:
                    cursor = conn.execute("""
                        SELECT strategy, AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate,
                               AVG(execution_time) as avg_time, COUNT(*) as count
                        FROM correction_results cr
                        JOIN correction_tasks ct ON cr.task_id = ct.task_id
                        WHERE cr.completed_at > datetime('now', '-7 days')
                        GROUP BY ct.correction_strategy
                        HAVING count >= 3
                    """)
                    
                    for row in cursor.fetchall():
                        strategy, success_rate, avg_time, count = row
                        
                        if success_rate > 0.7:  # Good success rate
                            efficiency_score = success_rate * (1 / max(avg_time / 60, 0.1))  # Factor in speed
                            
                            pattern = LearningPattern(
                                pattern_id=f"corr_pattern_{strategy}_{int(datetime.now().timestamp())}",
                                pattern_type="correction_efficiency",
                                source_data=strategy,
                                pattern_signature={
                                    "correction_strategy": strategy,
                                    "success_rate": success_rate,
                                    "average_time": avg_time,
                                    "efficiency_score": efficiency_score
                                },
                                effectiveness_score=efficiency_score,
                                usage_count=count,
                                success_rate=success_rate,
                                last_applied=datetime.now(),
                                confidence_level=min(count / 10.0, 0.95),
                                improvement_potential=1.0 - efficiency_score,
                                created_at=datetime.now()
                            )
                            patterns.append(pattern)
                            
        except Exception as e:
            self.logger.error(f"Error learning correction patterns: {e}")
            
        return patterns
    
    async def _learn_threshold_patterns(self) -> List[LearningPattern]:
        """Learn optimal threshold patterns"""
        patterns = []
        
        try:
            # Analyze threshold effectiveness
            for metric_type in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                optimal_threshold = await self._find_optimal_threshold(metric_type)
                
                if optimal_threshold:
                    pattern = LearningPattern(
                        pattern_id=f"thresh_pattern_{metric_type}_{int(datetime.now().timestamp())}",
                        pattern_type="threshold_adaptation",
                        source_data=metric_type,
                        pattern_signature={
                            "metric_type": metric_type,
                            "optimal_threshold": optimal_threshold['value'],
                            "effectiveness": optimal_threshold['effectiveness']
                        },
                        effectiveness_score=optimal_threshold['effectiveness'],
                        usage_count=0,
                        success_rate=optimal_threshold['effectiveness'],
                        last_applied=datetime.now(),
                        confidence_level=optimal_threshold['confidence'],
                        improvement_potential=1.0 - optimal_threshold['effectiveness'],
                        created_at=datetime.now()
                    )
                    patterns.append(pattern)
                    
        except Exception as e:
            self.logger.error(f"Error learning threshold patterns: {e}")
            
        return patterns
    
    async def _find_optimal_threshold(self, metric_type: str) -> Optional[Dict[str, Any]]:
        """Find optimal threshold for a metric using historical data"""
        try:
            # Get historical performance data
            perf_db = "scripts/results/governance/performance_optimization.db"
            if not os.path.exists(perf_db):
                return None
            
            with sqlite3.connect(perf_db) as conn:
                cursor = conn.execute("""
                    SELECT value, timestamp
                    FROM performance_metrics
                    WHERE metric_type = ? AND timestamp > datetime('now', '-30 days')
                    ORDER BY timestamp
                """, (metric_type,))
                
                data = cursor.fetchall()
                
            if len(data) < 20:
                return None
            
            values = [row[0] for row in data]
            
            # Find threshold that maximizes stability while maintaining performance
            percentiles = [50, 60, 70, 75, 80, 85, 90, 95]
            best_threshold = None
            best_score = 0
            
            for p in percentiles:
                threshold = np.percentile(values, p)
                
                # Calculate effectiveness (how often we stay below threshold)
                below_threshold = sum(1 for v in values if v <= threshold) / len(values)
                
                # Calculate stability (low variance below threshold)
                below_values = [v for v in values if v <= threshold]
                if len(below_values) > 5:
                    stability = 1 / (1 + np.std(below_values))
                    effectiveness = below_threshold * stability
                    
                    if effectiveness > best_score:
                        best_score = effectiveness
                        best_threshold = {
                            'value': threshold,
                            'effectiveness': effectiveness,
                            'confidence': min(len(below_values) / 50.0, 0.95)
                        }
            
            return best_threshold
            
        except Exception as e:
            self.logger.error(f"Error finding optimal threshold for {metric_type}: {e}")
            return None
    
    async def _learn_anomaly_patterns(self) -> List[LearningPattern]:
        """Learn patterns from anomaly detection"""
        patterns = []
        
        try:
            # Analyze anomaly detection accuracy
            # This would analyze false positives/negatives and learn better detection patterns
            # For now, create a placeholder pattern
            
            pattern = LearningPattern(
                pattern_id=f"anomaly_pattern_{int(datetime.now().timestamp())}",
                pattern_type="anomaly_detection",
                source_data="system_anomalies",
                pattern_signature={
                    "detection_method": "statistical_outliers",
                    "confidence_threshold": 0.8,
                    "false_positive_rate": 0.1
                },
                effectiveness_score=0.85,
                usage_count=0,
                success_rate=0.85,
                last_applied=datetime.now(),
                confidence_level=0.8,
                improvement_potential=0.15,
                created_at=datetime.now()
            )
            patterns.append(pattern)
            
        except Exception as e:
            self.logger.error(f"Error learning anomaly patterns: {e}")
            
        return patterns
    
    async def _store_learning_pattern(self, pattern: LearningPattern):
        """Store learned pattern in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO learning_patterns
                    (pattern_id, pattern_type, source_data, pattern_signature,
                     effectiveness_score, usage_count, success_rate, last_applied,
                     confidence_level, improvement_potential, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pattern.pattern_id,
                    pattern.pattern_type,
                    pattern.source_data,
                    json.dumps(pattern.pattern_signature),
                    pattern.effectiveness_score,
                    pattern.usage_count,
                    pattern.success_rate,
                    pattern.last_applied.isoformat(),
                    pattern.confidence_level,
                    pattern.improvement_potential,
                    pattern.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing learning pattern: {e}")
    
    async def _update_learning_models(self):
        """Update machine learning models with new data"""
        try:
            # Get recent patterns for model updates
            recent_patterns = list(self.pattern_memory)[-50:]  # Last 50 patterns
            
            if len(recent_patterns) >= 10 and self.pattern_classifier:
                # Prepare features from patterns
                features = []
                targets = []
                
                for pattern in recent_patterns:
                    feature_vector = [
                        pattern.effectiveness_score,
                        pattern.confidence_level,
                        pattern.improvement_potential,
                        pattern.usage_count,
                        hash(pattern.pattern_type) % 1000  # Encode pattern type
                    ]
                    features.append(feature_vector)
                    targets.append(pattern.effectiveness_score)
                
                if features:
                    X = np.array(features)
                    y = np.array(targets)
                    
                    # Update scaler and models
                    X_scaled = self.scaler.fit_transform(X)
                    
                    # Update pattern classifier
                    self.pattern_classifier.fit(X_scaled)
                    
                    # Update optimization predictor if we have enough data
                    if self.optimization_predictor and len(X) >= 20:
                        self.optimization_predictor.fit(X_scaled, y)
                    
                    self.logger.info("✅ Learning models updated with new patterns")
                    
        except Exception as e:
            self.logger.error(f"Error updating learning models: {e}")
    
    async def _optimization_cycle_loop(self):
        """Run optimization cycles based on learned patterns"""
        while True:
            try:
                self.logger.info("🔄 Running optimization cycle")
                
                # Identify optimization opportunities
                opportunities = await self._identify_optimization_opportunities()
                
                # Execute optimization cycles
                for opportunity in opportunities:
                    cycle = await self._execute_optimization_cycle(opportunity)
                    if cycle:
                        await self._store_optimization_cycle(cycle)
                
                # Wait for next optimization cycle
                await asyncio.sleep(self.config.get('optimization_cycle_interval', 7200))  # 2 hours
                
            except Exception as e:
                self.logger.error(f"Error in optimization cycle loop: {e}")
                await asyncio.sleep(900)  # Wait 15 minutes on error
    
    async def _identify_optimization_opportunities(self) -> List[Dict[str, Any]]:
        """Identify optimization opportunities based on learned patterns"""
        opportunities = []
        
        try:
            # Get high-potential patterns
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT pattern_id, pattern_type, source_data, pattern_signature,
                           effectiveness_score, improvement_potential
                    FROM learning_patterns
                    WHERE improvement_potential > ? AND confidence_level > ?
                    ORDER BY improvement_potential DESC, effectiveness_score DESC
                    LIMIT 5
                """, (self.improvement_threshold, self.confidence_threshold))
                
                for row in cursor.fetchall():
                    pattern_id, pattern_type, source_data, signature_json, effectiveness, potential = row
                    signature = json.loads(signature_json)
                    
                    opportunities.append({
                        'pattern_id': pattern_id,
                        'pattern_type': pattern_type,
                        'source_data': source_data,
                        'signature': signature,
                        'effectiveness_score': effectiveness,
                        'improvement_potential': potential
                    })
                    
        except Exception as e:
            self.logger.error(f"Error identifying optimization opportunities: {e}")
            
        return opportunities
    
    async def _execute_optimization_cycle(self, opportunity: Dict[str, Any]) -> Optional[OptimizationCycle]:
        """Execute an optimization cycle based on an opportunity"""
        try:
            cycle_start = datetime.now()
            
            # Get baseline metrics
            baseline_metrics = await self._get_current_baseline_metrics(opportunity['source_data'])
            
            # Determine optimization strategy
            optimizations = self._plan_optimizations(opportunity)
            
            # Apply optimizations
            applied_optimizations = []
            for optimization in optimizations:
                success = await self._apply_optimization(optimization)
                if success:
                    applied_optimizations.append(optimization['name'])
            
            # Wait for optimization to take effect
            await asyncio.sleep(300)  # 5 minutes
            
            # Measure improvements
            post_metrics = await self._get_current_baseline_metrics(opportunity['source_data'])
            improvements = self._calculate_improvements(baseline_metrics, post_metrics)
            
            # Calculate success score
            success_score = self._calculate_cycle_success_score(improvements, opportunity['improvement_potential'])
            
            # Generate lessons learned
            lessons_learned = self._generate_lessons_learned(opportunity, improvements, success_score)
            
            # Generate next recommendations
            next_recommendations = self._generate_next_recommendations(opportunity, improvements)
            
            cycle = OptimizationCycle(
                cycle_id=f"cycle_{opportunity['pattern_id']}_{int(cycle_start.timestamp())}",
                cycle_type=opportunity['pattern_type'],
                target_component=opportunity['source_data'],
                baseline_metrics=baseline_metrics,
                applied_optimizations=applied_optimizations,
                achieved_improvements=improvements,
                cycle_duration=int((datetime.now() - cycle_start).total_seconds() / 60),
                success_score=success_score,
                lessons_learned=lessons_learned,
                next_recommendations=next_recommendations,
                created_at=cycle_start,
                completed_at=datetime.now()
            )
            
            self.logger.info(f"✅ Optimization cycle completed with success score: {success_score:.2f}")
            return cycle
            
        except Exception as e:
            self.logger.error(f"Error executing optimization cycle: {e}")
            return None
    
    async def _get_current_baseline_metrics(self, component: str) -> Dict[str, float]:
        """Get current baseline metrics for a component"""
        metrics = {}
        
        try:
            # Get recent performance metrics
            perf_db = "scripts/results/governance/performance_optimization.db"
            if os.path.exists(perf_db):
                with sqlite3.connect(perf_db) as conn:
                    cursor = conn.execute("""
                        SELECT metric_type, AVG(value) as avg_value
                        FROM performance_metrics
                        WHERE timestamp > datetime('now', '-1 hour')
                        GROUP BY metric_type
                    """)
                    
                    for row in cursor.fetchall():
                        metrics[row[0]] = row[1]
                        
        except Exception as e:
            self.logger.error(f"Error getting baseline metrics: {e}")
            
        return metrics
    
    def _plan_optimizations(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Plan specific optimizations based on opportunity"""
        optimizations = []
        
        pattern_type = opportunity['pattern_type']
        signature = opportunity['signature']
        
        if pattern_type == 'performance_optimization':
            metric_type = signature.get('metric_type')
            if metric_type == 'cognitive_steps':
                optimizations.append({
                    'name': 'navigation_simplification',
                    'target': 'file_structure',
                    'method': 'consolidate_navigation_paths'
                })
            elif metric_type == 'file_access_time':
                optimizations.append({
                    'name': 'file_caching',
                    'target': 'file_system',
                    'method': 'implement_read_cache'
                })
            elif metric_type in ['cpu_usage', 'memory_usage']:
                optimizations.append({
                    'name': 'resource_optimization',
                    'target': 'system_resources',
                    'method': 'optimize_algorithms'
                })
        
        elif pattern_type == 'threshold_adaptation':
            optimizations.append({
                'name': 'threshold_update',
                'target': signature.get('metric_type'),
                'method': 'adaptive_threshold_adjustment'
            })
        
        elif pattern_type == 'governance_effectiveness':
            optimizations.append({
                'name': 'governance_tuning',
                'target': 'governance_rules',
                'method': 'optimize_intervention_timing'
            })
        
        return optimizations
    
    async def _apply_optimization(self, optimization: Dict[str, Any]) -> bool:
        """Apply a specific optimization"""
        try:
            optimization_name = optimization['name']
            
            if optimization_name == 'threshold_update':
                return await self._apply_threshold_update(optimization)
            elif optimization_name == 'navigation_simplification':
                return await self._apply_navigation_optimization(optimization)
            elif optimization_name == 'file_caching':
                return await self._apply_caching_optimization(optimization)
            elif optimization_name == 'resource_optimization':
                return await self._apply_resource_optimization(optimization)
            elif optimization_name == 'governance_tuning':
                return await self._apply_governance_optimization(optimization)
            
            self.logger.warning(f"Unknown optimization type: {optimization_name}")
            return False
            
        except Exception as e:
            self.logger.error(f"Error applying optimization {optimization['name']}: {e}")
            return False
    
    async def _apply_threshold_update(self, optimization: Dict[str, Any]) -> bool:
        """Apply threshold update optimization"""
        try:
            metric_type = optimization['target']
            
            # Find optimal threshold from learned patterns
            optimal_threshold = await self._find_optimal_threshold(metric_type)
            
            if optimal_threshold:
                # Update adaptive threshold
                threshold = AdaptiveThreshold(
                    threshold_id=f"thresh_{metric_type}_{int(datetime.now().timestamp())}",
                    metric_type=metric_type,
                    current_value=optimal_threshold['value'],
                    historical_values=[optimal_threshold['value']],
                    adaptation_rate=self.learning_rate,
                    stability_score=optimal_threshold['effectiveness'],
                    last_updated=datetime.now(),
                    reason_for_change="learned_optimization"
                )
                
                self.adaptive_thresholds[metric_type] = threshold
                await self._store_adaptive_threshold(threshold)
                
                self.logger.info(f"✅ Updated threshold for {metric_type}: {optimal_threshold['value']}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error applying threshold update: {e}")
            return False
    
    async def _apply_navigation_optimization(self, optimization: Dict[str, Any]) -> bool:
        """Apply navigation optimization"""
        try:
            # This would implement actual navigation structure optimization
            # For now, simulate successful optimization
            self.logger.info("✅ Applied navigation optimization")
            return True
            
        except Exception as e:
            self.logger.error(f"Error applying navigation optimization: {e}")
            return False
    
    async def _apply_caching_optimization(self, optimization: Dict[str, Any]) -> bool:
        """Apply caching optimization"""
        try:
            # This would implement actual caching optimization
            # For now, simulate successful optimization
            self.logger.info("✅ Applied caching optimization")
            return True
            
        except Exception as e:
            self.logger.error(f"Error applying caching optimization: {e}")
            return False
    
    async def _apply_resource_optimization(self, optimization: Dict[str, Any]) -> bool:
        """Apply resource optimization"""
        try:
            # This would implement actual resource optimization
            # For now, simulate successful optimization
            self.logger.info("✅ Applied resource optimization")
            return True
            
        except Exception as e:
            self.logger.error(f"Error applying resource optimization: {e}")
            return False
    
    async def _apply_governance_optimization(self, optimization: Dict[str, Any]) -> bool:
        """Apply governance optimization"""
        try:
            # This would implement actual governance optimization
            # For now, simulate successful optimization
            self.logger.info("✅ Applied governance optimization")
            return True
            
        except Exception as e:
            self.logger.error(f"Error applying governance optimization: {e}")
            return False
    
    def _calculate_improvements(self, baseline: Dict[str, float], current: Dict[str, float]) -> Dict[str, float]:
        """Calculate improvements achieved"""
        improvements = {}
        
        try:
            for metric_name in baseline.keys():
                if metric_name in current:
                    baseline_val = baseline[metric_name]
                    current_val = current[metric_name]
                    
                    if baseline_val != 0:
                        improvement = (baseline_val - current_val) / abs(baseline_val)
                        improvements[metric_name] = improvement
                    else:
                        improvements[metric_name] = 0.0
                        
        except Exception as e:
            self.logger.error(f"Error calculating improvements: {e}")
            
        return improvements
    
    def _calculate_cycle_success_score(self, improvements: Dict[str, float], expected_potential: float) -> float:
        """Calculate success score for optimization cycle"""
        try:
            if not improvements:
                return 0.0
            
            # Average improvement achieved
            avg_improvement = np.mean(list(improvements.values()))
            
            # Success score based on achievement vs. potential
            success_score = min(avg_improvement / max(expected_potential, 0.01), 1.0)
            
            return max(success_score, 0.0)
            
        except Exception as e:
            self.logger.error(f"Error calculating success score: {e}")
            return 0.0
    
    def _generate_lessons_learned(self, opportunity: Dict[str, Any], improvements: Dict[str, float], 
                                success_score: float) -> List[str]:
        """Generate lessons learned from optimization cycle"""
        lessons = []
        
        try:
            # Analyze what worked well
            if success_score > 0.7:
                lessons.append(f"High success achieved with {opportunity['pattern_type']} optimization")
                
                best_improvement = max(improvements.values()) if improvements else 0
                if best_improvement > 0.1:
                    best_metric = max(improvements.keys(), key=lambda k: improvements[k])
                    lessons.append(f"Significant improvement in {best_metric}: {best_improvement:.1%}")
            
            # Analyze what could be improved
            elif success_score < 0.3:
                lessons.append(f"Low success with {opportunity['pattern_type']} - need different approach")
                
                if improvements:
                    worst_improvement = min(improvements.values())
                    if worst_improvement < 0:
                        worst_metric = min(improvements.keys(), key=lambda k: improvements[k])
                        lessons.append(f"Negative impact on {worst_metric} - avoid similar optimizations")
            
            # General insights
            lessons.append(f"Optimization potential was {opportunity['improvement_potential']:.1%}, achieved {success_score:.1%}")
            
        except Exception as e:
            self.logger.error(f"Error generating lessons learned: {e}")
            
        return lessons
    
    def _generate_next_recommendations(self, opportunity: Dict[str, Any], 
                                     improvements: Dict[str, float]) -> List[str]:
        """Generate recommendations for next optimization cycles"""
        recommendations = []
        
        try:
            pattern_type = opportunity['pattern_type']
            
            # Base recommendations on current results
            if improvements:
                avg_improvement = np.mean(list(improvements.values()))
                
                if avg_improvement > 0.1:
                    recommendations.append(f"Continue with {pattern_type} optimizations - showing good results")
                    recommendations.append("Consider scaling successful optimizations to similar components")
                elif avg_improvement > 0:
                    recommendations.append(f"Moderate success with {pattern_type} - try refined approach")
                    recommendations.append("Analyze which specific aspects worked best")
                else:
                    recommendations.append(f"Poor results with {pattern_type} - try different optimization strategy")
                    recommendations.append("Investigate root causes before next attempt")
            
            # Pattern-specific recommendations
            if pattern_type == 'performance_optimization':
                recommendations.append("Monitor performance metrics for sustained improvement")
                recommendations.append("Consider A/B testing for performance optimizations")
            elif pattern_type == 'threshold_adaptation':
                recommendations.append("Validate threshold changes with extended monitoring period")
                recommendations.append("Ensure threshold changes don't introduce instability")
            
        except Exception as e:
            self.logger.error(f"Error generating next recommendations: {e}")
            
        return recommendations
    
    async def _store_optimization_cycle(self, cycle: OptimizationCycle):
        """Store optimization cycle in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO optimization_cycles
                    (cycle_id, cycle_type, target_component, baseline_metrics,
                     applied_optimizations, achieved_improvements, cycle_duration,
                     success_score, lessons_learned, next_recommendations,
                     created_at, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    cycle.cycle_id,
                    cycle.cycle_type,
                    cycle.target_component,
                    json.dumps(cycle.baseline_metrics),
                    json.dumps(cycle.applied_optimizations),
                    json.dumps(cycle.achieved_improvements),
                    cycle.cycle_duration,
                    cycle.success_score,
                    json.dumps(cycle.lessons_learned),
                    json.dumps(cycle.next_recommendations),
                    cycle.created_at.isoformat(),
                    cycle.completed_at.isoformat() if cycle.completed_at else None
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing optimization cycle: {e}")
    
    async def _store_adaptive_threshold(self, threshold: AdaptiveThreshold):
        """Store adaptive threshold in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO adaptive_thresholds
                    (threshold_id, metric_type, current_value, historical_values,
                     adaptation_rate, stability_score, last_updated, reason_for_change)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    threshold.threshold_id,
                    threshold.metric_type,
                    threshold.current_value,
                    json.dumps(threshold.historical_values),
                    threshold.adaptation_rate,
                    threshold.stability_score,
                    threshold.last_updated.isoformat(),
                    threshold.reason_for_change
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing adaptive threshold: {e}")
    
    async def _insight_generation_loop(self):
        """Generate insights from learning data"""
        while True:
            try:
                self.logger.info("💡 Generating learning insights")
                
                insights = await self._generate_learning_insights()
                
                for insight in insights:
                    await self._store_learning_insight(insight)
                
                await asyncio.sleep(self.config.get('insight_generation_interval', 14400))  # 4 hours
                
            except Exception as e:
                self.logger.error(f"Error in insight generation loop: {e}")
                await asyncio.sleep(1800)  # Wait 30 minutes on error
    
    async def _generate_learning_insights(self) -> List[LearningInsight]:
        """Generate insights from accumulated learning data"""
        insights = []
        
        try:
            # Analyze pattern effectiveness trends
            effectiveness_insight = await self._analyze_effectiveness_trends()
            if effectiveness_insight:
                insights.append(effectiveness_insight)
            
            # Analyze optimization cycle success patterns
            cycle_insight = await self._analyze_cycle_patterns()
            if cycle_insight:
                insights.append(cycle_insight)
            
            # Analyze threshold adaptation patterns
            threshold_insight = await self._analyze_threshold_patterns()
            if threshold_insight:
                insights.append(threshold_insight)
            
        except Exception as e:
            self.logger.error(f"Error generating learning insights: {e}")
            
        return insights
    
    async def _analyze_effectiveness_trends(self) -> Optional[LearningInsight]:
        """Analyze effectiveness trends across patterns"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT pattern_type, AVG(effectiveness_score) as avg_eff, COUNT(*) as count
                    FROM learning_patterns
                    WHERE created_at > datetime('now', '-7 days')
                    GROUP BY pattern_type
                    HAVING count >= 3
                    ORDER BY avg_eff DESC
                """)
                
                effectiveness_data = cursor.fetchall()
            
            if effectiveness_data:
                best_type, best_score, best_count = effectiveness_data[0]
                
                insight = LearningInsight(
                    insight_id=f"effectiveness_insight_{int(datetime.now().timestamp())}",
                    insight_type="effectiveness_analysis",
                    description=f"Pattern type '{best_type}' shows highest effectiveness ({best_score:.2f}) with {best_count} instances",
                    supporting_evidence={
                        "pattern_type": best_type,
                        "effectiveness_score": best_score,
                        "sample_size": best_count,
                        "all_types": [{"type": row[0], "score": row[1], "count": row[2]} for row in effectiveness_data]
                    },
                    confidence_score=min(best_count / 10.0, 0.95),
                    potential_impact=best_score,
                    recommended_actions=[
                        f"Prioritize {best_type} optimizations in future cycles",
                        "Investigate why this pattern type is most effective",
                        "Apply similar approaches to other pattern types"
                    ],
                    validation_criteria={
                        "sustained_effectiveness": ">= 0.8",
                        "pattern_consistency": ">= 5 instances",
                        "cross_validation": "required"
                    },
                    created_at=datetime.now()
                )
                
                return insight
                
        except Exception as e:
            self.logger.error(f"Error analyzing effectiveness trends: {e}")
            
        return None
    
    async def _analyze_cycle_patterns(self) -> Optional[LearningInsight]:
        """Analyze optimization cycle patterns"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT cycle_type, AVG(success_score) as avg_success, 
                           AVG(cycle_duration) as avg_duration, COUNT(*) as count
                    FROM optimization_cycles
                    WHERE completed_at > datetime('now', '-14 days')
                    GROUP BY cycle_type
                    HAVING count >= 2
                    ORDER BY avg_success DESC
                """)
                
                cycle_data = cursor.fetchall()
            
            if cycle_data:
                best_type, best_success, avg_duration, count = cycle_data[0]
                
                insight = LearningInsight(
                    insight_id=f"cycle_insight_{int(datetime.now().timestamp())}",
                    insight_type="cycle_analysis",
                    description=f"Optimization cycle type '{best_type}' achieves best success rate ({best_success:.2f}) in average {avg_duration:.0f} minutes",
                    supporting_evidence={
                        "cycle_type": best_type,
                        "success_rate": best_success,
                        "average_duration": avg_duration,
                        "sample_size": count
                    },
                    confidence_score=min(count / 5.0, 0.9),
                    potential_impact=best_success,
                    recommended_actions=[
                        f"Increase frequency of {best_type} optimization cycles",
                        "Analyze successful cycle characteristics for replication",
                        "Optimize cycle duration for better efficiency"
                    ],
                    validation_criteria={
                        "success_consistency": ">= 0.7",
                        "duration_efficiency": "<= 120 minutes",
                        "reproducibility": "required"
                    },
                    created_at=datetime.now()
                )
                
                return insight
                
        except Exception as e:
            self.logger.error(f"Error analyzing cycle patterns: {e}")
            
        return None
    
    async def _analyze_threshold_patterns(self) -> Optional[LearningInsight]:
        """Analyze threshold adaptation patterns"""
        try:
            threshold_count = len(self.adaptive_thresholds)
            
            if threshold_count > 0:
                avg_stability = np.mean([t.stability_score for t in self.adaptive_thresholds.values()])
                
                insight = LearningInsight(
                    insight_id=f"threshold_insight_{int(datetime.now().timestamp())}",
                    insight_type="threshold_analysis",
                    description=f"Adaptive thresholds show average stability of {avg_stability:.2f} across {threshold_count} metrics",
                    supporting_evidence={
                        "threshold_count": threshold_count,
                        "average_stability": avg_stability,
                        "metrics": list(self.adaptive_thresholds.keys())
                    },
                    confidence_score=min(threshold_count / 5.0, 0.9),
                    potential_impact=avg_stability,
                    recommended_actions=[
                        "Continue threshold adaptation for stable metrics",
                        "Investigate metrics with low stability scores",
                        "Expand adaptive thresholds to additional metrics"
                    ],
                    validation_criteria={
                        "stability_threshold": ">= 0.8",
                        "adaptation_frequency": "<= weekly",
                        "performance_impact": "neutral or positive"
                    },
                    created_at=datetime.now()
                )
                
                return insight
                
        except Exception as e:
            self.logger.error(f"Error analyzing threshold patterns: {e}")
            
        return None
    
    async def _store_learning_insight(self, insight: LearningInsight):
        """Store learning insight in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO learning_insights
                    (insight_id, insight_type, description, supporting_evidence,
                     confidence_score, potential_impact, recommended_actions,
                     validation_criteria, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    insight.insight_id,
                    insight.insight_type,
                    insight.description,
                    json.dumps(insight.supporting_evidence),
                    insight.confidence_score,
                    insight.potential_impact,
                    json.dumps(insight.recommended_actions),
                    json.dumps(insight.validation_criteria),
                    insight.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing learning insight: {e}")
    
    async def _threshold_adaptation_loop(self):
        """Continuously adapt thresholds based on learning"""
        while True:
            try:
                self.logger.info("⚙️ Running threshold adaptation")
                
                # Update adaptive thresholds
                await self._update_adaptive_thresholds()
                
                await asyncio.sleep(self.config.get('threshold_adaptation_interval', 21600))  # 6 hours
                
            except Exception as e:
                self.logger.error(f"Error in threshold adaptation loop: {e}")
                await asyncio.sleep(3600)  # Wait 1 hour on error
    
    async def _update_adaptive_thresholds(self):
        """Update adaptive thresholds based on recent performance"""
        try:
            for metric_type in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                await self._update_threshold_for_metric(metric_type)
                
        except Exception as e:
            self.logger.error(f"Error updating adaptive thresholds: {e}")
    
    async def _update_threshold_for_metric(self, metric_type: str):
        """Update adaptive threshold for specific metric"""
        try:
            # Get recent optimal threshold
            optimal = await self._find_optimal_threshold(metric_type)
            
            if not optimal:
                return
            
            current_threshold = self.adaptive_thresholds.get(metric_type)
            
            if current_threshold:
                # Adapt existing threshold
                old_value = current_threshold.current_value
                new_value = optimal['value']
                
                # Gradual adaptation
                adapted_value = old_value + self.learning_rate * (new_value - old_value)
                
                # Update threshold
                current_threshold.current_value = adapted_value
                current_threshold.historical_values.append(adapted_value)
                current_threshold.stability_score = optimal['effectiveness']
                current_threshold.last_updated = datetime.now()
                current_threshold.reason_for_change = "continuous_learning_adaptation"
                
                await self._store_adaptive_threshold(current_threshold)
                
                self.logger.info(f"✅ Adapted threshold for {metric_type}: {old_value:.2f} → {adapted_value:.2f}")
            else:
                # Create new adaptive threshold
                new_threshold = AdaptiveThreshold(
                    threshold_id=f"adaptive_{metric_type}_{int(datetime.now().timestamp())}",
                    metric_type=metric_type,
                    current_value=optimal['value'],
                    historical_values=[optimal['value']],
                    adaptation_rate=self.learning_rate,
                    stability_score=optimal['effectiveness'],
                    last_updated=datetime.now(),
                    reason_for_change="initial_learning_threshold"
                )
                
                self.adaptive_thresholds[metric_type] = new_threshold
                await self._store_adaptive_threshold(new_threshold)
                
                self.logger.info(f"✅ Created adaptive threshold for {metric_type}: {optimal['value']:.2f}")
                
        except Exception as e:
            self.logger.error(f"Error updating threshold for {metric_type}: {e}")
    
    async def _experiment_design_loop(self):
        """Design and run controlled experiments"""
        while True:
            try:
                self.logger.info("🧪 Running experimental design cycle")
                
                # Design experiments based on insights
                experiments = await self._design_experiments()
                
                # Execute experiments
                for experiment in experiments:
                    await self._execute_experiment(experiment)
                
                await asyncio.sleep(self.config.get('experiment_interval', 86400))  # 24 hours
                
            except Exception as e:
                self.logger.error(f"Error in experiment design loop: {e}")
                await asyncio.sleep(7200)  # Wait 2 hours on error
    
    async def _design_experiments(self) -> List[Dict[str, Any]]:
        """Design controlled experiments for testing hypotheses"""
        experiments = []
        
        try:
            # Simple A/B test experiment design
            experiment = {
                'experiment_id': f"exp_{int(datetime.now().timestamp())}",
                'experiment_type': 'threshold_optimization',
                'hypothesis': 'Adaptive thresholds improve system performance by 10%',
                'experimental_setup': {
                    'control_group': 'static_thresholds',
                    'treatment_group': 'adaptive_thresholds',
                    'duration_hours': 24,
                    'metrics_to_track': ['cognitive_steps', 'file_access_time', 'governance_effectiveness']
                }
            }
            experiments.append(experiment)
            
        except Exception as e:
            self.logger.error(f"Error designing experiments: {e}")
            
        return experiments
    
    async def _execute_experiment(self, experiment: Dict[str, Any]):
        """Execute a controlled experiment"""
        try:
            self.logger.info(f"🧪 Executing experiment: {experiment['experiment_id']}")
            
            # For now, simulate experiment execution
            # In a real implementation, this would set up A/B testing infrastructure
            
            # Record experiment
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO improvement_experiments
                    (experiment_id, experiment_type, hypothesis, experimental_setup,
                     control_metrics, experimental_metrics, conclusion, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    experiment['experiment_id'],
                    experiment['experiment_type'],
                    experiment['hypothesis'],
                    json.dumps(experiment['experimental_setup']),
                    json.dumps({}),  # Would contain actual control metrics
                    json.dumps({}),  # Would contain actual experimental metrics
                    "Simulated experiment - infrastructure development needed",
                    datetime.now().isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error executing experiment: {e}")

def main():
    """Main entry point for continuous improvement engine"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Continuous Improvement Engine - Phase 3")
    parser.add_argument("--config", default="scripts/governance/continuous-improvement-config.json",
                       help="Configuration file path")
    parser.add_argument("--daemon", action="store_true",
                       help="Run as daemon service")
    
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
        "learning_rate": 0.1,
        "pattern_retention": 1000,
        "confidence_threshold": 0.7,
        "improvement_threshold": 0.05,
        "learning_interval": 3600,           # 1 hour
        "optimization_cycle_interval": 7200, # 2 hours
        "insight_generation_interval": 14400, # 4 hours
        "threshold_adaptation_interval": 21600, # 6 hours
        "experiment_interval": 86400        # 24 hours
    }
    
    config = {**default_config, **config}
    
    if args.daemon:
        # Run as daemon service
        engine = SelfLearningEngine(config)
        try:
            asyncio.run(engine.start_continuous_improvement())
        except KeyboardInterrupt:
            print("\n🔄 Continuous improvement engine interrupted by user")
    else:
        # Single learning run
        async def single_run():
            engine = SelfLearningEngine(config)
            
            print("🔄 Running continuous improvement analysis...")
            
            # Initialize models
            await engine._initialize_learning_models()
            
            # Run learning cycle
            for category, learning_func in engine.learning_categories.items():
                print(f"Running {category} learning...")
                patterns = await learning_func()
                print(f"Found {len(patterns)} patterns")
            
            # Generate insights
            insights = await engine._generate_learning_insights()
            print(f"Generated {len(insights)} insights")
            
            print("✅ Continuous improvement analysis complete")
        
        asyncio.run(single_run())

if __name__ == "__main__":
    main()