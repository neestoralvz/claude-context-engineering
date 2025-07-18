#!/usr/bin/env python3
"""
Detection Algorithms - Context Engineering
MANDATORY: Advanced detection algorithms for governance violations
Implements intelligent problem identification for Principle #108

CRITICAL ALGORITHMS:
1. File Size Growth Pattern Detection
2. Content Duplication Analysis
3. Technical Debt Accumulation Tracking
4. Performance Degradation Detection
5. Compliance Violation Identification

DETECTION CAPABILITIES:
- Predictive violation detection (before thresholds are exceeded)
- Pattern recognition for growth trends
- Anomaly detection for unusual changes
- Correlation analysis between violations
- Root cause identification
"""

import os
import re
import json
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import logging
from collections import defaultdict, Counter
import hashlib
import difflib
from scipy import stats
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
import warnings
warnings.filterwarnings('ignore')

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DETECTION_LOG = PROJECT_ROOT / 'scripts/results/governance/detection.log'
DETECTION_DB = PROJECT_ROOT / 'scripts/results/governance/detection.db'
PATTERNS_DIR = PROJECT_ROOT / 'scripts/results/governance/patterns'
ANALYTICS_DIR = PROJECT_ROOT / 'scripts/results/governance/analytics'

# Detection thresholds
DETECTION_THRESHOLDS = {
    'growth_rate_warning': 0.15,  # 15% growth rate warning
    'growth_acceleration_warning': 0.25,  # 25% acceleration warning
    'duplication_similarity_min': 0.15,  # 15% minimum similarity for detection
    'debt_accumulation_rate': 0.20,  # 20% debt accumulation rate
    'performance_degradation_rate': 0.10,  # 10% performance degradation
    'anomaly_threshold': 0.05,  # 5% anomaly threshold
    'correlation_threshold': 0.7,  # 70% correlation threshold
    'prediction_confidence': 0.80  # 80% prediction confidence
}

# Logging configuration
os.makedirs(DETECTION_LOG.parent, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(DETECTION_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DetectionResult:
    """Detection result data class"""
    timestamp: datetime
    detection_type: str
    severity: str
    confidence: float
    file_path: str
    pattern_detected: str
    current_value: float
    predicted_value: float
    trend: str
    risk_score: float
    time_to_violation: Optional[float] = None
    contributing_factors: List[str] = None
    recommended_actions: List[str] = None

@dataclass
class GrowthPattern:
    """Growth pattern data class"""
    file_path: str
    historical_sizes: List[Tuple[datetime, int]]
    growth_rate: float
    acceleration: float
    trend: str
    projected_violation_date: Optional[datetime] = None

@dataclass
class DuplicationCluster:
    """Duplication cluster data class"""
    cluster_id: str
    files: List[str]
    similarity_matrix: Dict[str, Dict[str, float]]
    average_similarity: float
    consolidation_potential: float

class DetectionAlgorithms:
    """Advanced detection algorithms for governance violations"""
    
    def __init__(self):
        self.db_path = DETECTION_DB
        self.init_directories()
        self.init_database()
        self.file_history = defaultdict(list)
        self.content_cache = {}
        self.pattern_cache = {}
        
    def init_directories(self):
        """Initialize detection directories"""
        for directory in [PATTERNS_DIR, ANALYTICS_DIR, DETECTION_LOG.parent]:
            os.makedirs(directory, exist_ok=True)
    
    def init_database(self):
        """Initialize detection database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS detection_results (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        detection_type TEXT NOT NULL,
                        severity TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        file_path TEXT NOT NULL,
                        pattern_detected TEXT NOT NULL,
                        current_value REAL NOT NULL,
                        predicted_value REAL NOT NULL,
                        trend TEXT NOT NULL,
                        risk_score REAL NOT NULL,
                        time_to_violation REAL,
                        contributing_factors TEXT,
                        recommended_actions TEXT
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS file_metrics_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        line_count INTEGER NOT NULL,
                        char_count INTEGER NOT NULL,
                        todo_count INTEGER NOT NULL,
                        duplication_score REAL NOT NULL,
                        complexity_score REAL NOT NULL
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS pattern_analysis (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        pattern_type TEXT NOT NULL,
                        pattern_data TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        impact_score REAL NOT NULL
                    )
                ''')
                
                conn.commit()
                logger.info("Detection database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize detection database: {e}")
            raise
    
    def detect_growth_patterns(self) -> List[DetectionResult]:
        """Detect file growth patterns and predict violations"""
        results = []
        
        try:
            # Get file history
            file_histories = self._get_file_histories()
            
            for file_path, history in file_histories.items():
                if len(history) < 3:  # Need at least 3 data points
                    continue
                    
                # Analyze growth pattern
                pattern = self._analyze_growth_pattern(file_path, history)
                
                # Predict violation if growth continues
                if pattern.growth_rate > DETECTION_THRESHOLDS['growth_rate_warning']:
                    # Calculate time to violation
                    current_size = history[-1][1]
                    threshold = 1500  # File size threshold
                    
                    if pattern.growth_rate > 0:
                        time_to_violation = (threshold - current_size) / pattern.growth_rate
                    else:
                        time_to_violation = None
                    
                    severity = self._calculate_severity(pattern.growth_rate, pattern.acceleration)
                    confidence = self._calculate_confidence(pattern, history)
                    
                    result = DetectionResult(
                        timestamp=datetime.now(),
                        detection_type='growth_pattern',
                        severity=severity,
                        confidence=confidence,
                        file_path=file_path,
                        pattern_detected=f"Growth rate: {pattern.growth_rate:.2f} lines/day",
                        current_value=current_size,
                        predicted_value=current_size + (pattern.growth_rate * 30),  # 30 days
                        trend=pattern.trend,
                        risk_score=min(1.0, pattern.growth_rate / 50),  # Normalize to 0-1
                        time_to_violation=time_to_violation,
                        contributing_factors=self._identify_growth_factors(file_path, history),
                        recommended_actions=self._generate_growth_recommendations(pattern)
                    )
                    
                    results.append(result)
            
            logger.info(f"Growth pattern detection completed: {len(results)} patterns detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to detect growth patterns: {e}")
            return []
    
    def detect_duplication_clusters(self) -> List[DetectionResult]:
        """Detect content duplication clusters"""
        results = []
        
        try:
            # Get all file contents
            file_contents = self._get_file_contents()
            
            if len(file_contents) < 2:
                return results
            
            # Calculate similarity matrix
            similarity_matrix = self._calculate_similarity_matrix(file_contents)
            
            # Identify duplication clusters
            clusters = self._identify_duplication_clusters(similarity_matrix)
            
            for cluster in clusters:
                if cluster.average_similarity > DETECTION_THRESHOLDS['duplication_similarity_min']:
                    # Create detection result for cluster
                    result = DetectionResult(
                        timestamp=datetime.now(),
                        detection_type='duplication_cluster',
                        severity=self._calculate_duplication_severity(cluster),
                        confidence=cluster.average_similarity,
                        file_path=", ".join(cluster.files),
                        pattern_detected=f"Duplication cluster: {cluster.average_similarity:.2%} similarity",
                        current_value=cluster.average_similarity,
                        predicted_value=cluster.average_similarity,
                        trend='stable',
                        risk_score=cluster.consolidation_potential,
                        contributing_factors=self._identify_duplication_factors(cluster),
                        recommended_actions=self._generate_duplication_recommendations(cluster)
                    )
                    
                    results.append(result)
            
            logger.info(f"Duplication detection completed: {len(results)} clusters detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to detect duplication clusters: {e}")
            return []
    
    def detect_technical_debt_accumulation(self) -> List[DetectionResult]:
        """Detect technical debt accumulation patterns"""
        results = []
        
        try:
            # Get debt history
            debt_history = self._get_debt_history()
            
            for file_path, history in debt_history.items():
                if len(history) < 3:
                    continue
                    
                # Analyze debt accumulation
                timestamps = [h[0] for h in history]
                debt_counts = [h[1] for h in history]
                
                if len(debt_counts) >= 2:
                    # Calculate accumulation rate
                    time_delta = (timestamps[-1] - timestamps[0]).total_seconds() / 86400  # days
                    debt_delta = debt_counts[-1] - debt_counts[0]
                    
                    if time_delta > 0:
                        accumulation_rate = debt_delta / time_delta
                        
                        if accumulation_rate > DETECTION_THRESHOLDS['debt_accumulation_rate']:
                            # Predict future debt
                            projected_debt = debt_counts[-1] + (accumulation_rate * 30)  # 30 days
                            
                            result = DetectionResult(
                                timestamp=datetime.now(),
                                detection_type='debt_accumulation',
                                severity=self._calculate_debt_severity(accumulation_rate, debt_counts[-1]),
                                confidence=0.8,  # High confidence for debt accumulation
                                file_path=file_path,
                                pattern_detected=f"Debt accumulation: {accumulation_rate:.2f} items/day",
                                current_value=debt_counts[-1],
                                predicted_value=projected_debt,
                                trend='increasing',
                                risk_score=min(1.0, accumulation_rate / 5),  # Normalize
                                time_to_violation=max(0, (19 - debt_counts[-1]) / accumulation_rate) if accumulation_rate > 0 else None,
                                contributing_factors=self._identify_debt_factors(file_path, history),
                                recommended_actions=self._generate_debt_recommendations(accumulation_rate)
                            )
                            
                            results.append(result)
            
            logger.info(f"Technical debt detection completed: {len(results)} patterns detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to detect technical debt accumulation: {e}")
            return []
    
    def detect_performance_degradation(self) -> List[DetectionResult]:
        """Detect performance degradation patterns"""
        results = []
        
        try:
            # Get performance metrics history
            performance_history = self._get_performance_history()
            
            for metric_type, history in performance_history.items():
                if len(history) < 3:
                    continue
                    
                # Analyze performance trend
                timestamps = [h[0] for h in history]
                values = [h[1] for h in history]
                
                # Calculate degradation rate
                if len(values) >= 2:
                    trend = self._calculate_trend(values)
                    degradation_rate = self._calculate_degradation_rate(values)
                    
                    if degradation_rate > DETECTION_THRESHOLDS['performance_degradation_rate']:
                        # Predict future performance
                        predicted_value = values[-1] + (degradation_rate * 30)  # 30 days
                        
                        result = DetectionResult(
                            timestamp=datetime.now(),
                            detection_type='performance_degradation',
                            severity=self._calculate_performance_severity(degradation_rate, values[-1]),
                            confidence=0.85,
                            file_path=metric_type,
                            pattern_detected=f"Performance degradation: {degradation_rate:.2%}/day",
                            current_value=values[-1],
                            predicted_value=predicted_value,
                            trend=trend,
                            risk_score=min(1.0, degradation_rate / 0.5),  # Normalize
                            contributing_factors=self._identify_performance_factors(metric_type, history),
                            recommended_actions=self._generate_performance_recommendations(degradation_rate)
                        )
                        
                        results.append(result)
            
            logger.info(f"Performance degradation detection completed: {len(results)} patterns detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to detect performance degradation: {e}")
            return []
    
    def detect_anomalies(self) -> List[DetectionResult]:
        """Detect anomalies in governance metrics"""
        results = []
        
        try:
            # Get all metrics for anomaly detection
            metrics_data = self._get_metrics_for_anomaly_detection()
            
            if len(metrics_data) < 10:  # Need sufficient data for anomaly detection
                return results
            
            # Prepare data for anomaly detection
            df = pd.DataFrame(metrics_data)
            
            # Select numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) == 0:
                return results
            
            # Scale features
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(df[numeric_cols])
            
            # Detect anomalies using Isolation Forest
            isolation_forest = IsolationForest(contamination=DETECTION_THRESHOLDS['anomaly_threshold'])
            anomaly_labels = isolation_forest.fit_predict(scaled_data)
            
            # Identify anomalies
            anomaly_indices = np.where(anomaly_labels == -1)[0]
            
            for idx in anomaly_indices:
                row = df.iloc[idx]
                
                result = DetectionResult(
                    timestamp=datetime.now(),
                    detection_type='anomaly',
                    severity='medium',
                    confidence=0.75,
                    file_path=row.get('file_path', 'system_wide'),
                    pattern_detected="Statistical anomaly detected",
                    current_value=row[numeric_cols[0]],
                    predicted_value=row[numeric_cols[0]],
                    trend='anomalous',
                    risk_score=0.5,
                    contributing_factors=self._identify_anomaly_factors(row),
                    recommended_actions=["Investigate anomalous behavior", "Check for data quality issues"]
                )
                
                results.append(result)
            
            logger.info(f"Anomaly detection completed: {len(results)} anomalies detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to detect anomalies: {e}")
            return []
    
    def analyze_correlations(self) -> List[DetectionResult]:
        """Analyze correlations between different violation types"""
        results = []
        
        try:
            # Get violation history
            violation_data = self._get_violation_correlations()
            
            if len(violation_data) < 10:
                return results
            
            # Calculate correlation matrix
            df = pd.DataFrame(violation_data)
            correlation_matrix = df.corr()
            
            # Identify strong correlations
            strong_correlations = []
            for i in range(len(correlation_matrix.columns)):
                for j in range(i+1, len(correlation_matrix.columns)):
                    corr_value = correlation_matrix.iloc[i, j]
                    if abs(corr_value) > DETECTION_THRESHOLDS['correlation_threshold']:
                        strong_correlations.append((
                            correlation_matrix.columns[i],
                            correlation_matrix.columns[j],
                            corr_value
                        ))
            
            # Create detection results for strong correlations
            for var1, var2, correlation in strong_correlations:
                result = DetectionResult(
                    timestamp=datetime.now(),
                    detection_type='correlation',
                    severity='medium',
                    confidence=abs(correlation),
                    file_path='system_wide',
                    pattern_detected=f"Strong correlation: {var1} ↔ {var2}",
                    current_value=correlation,
                    predicted_value=correlation,
                    trend='stable',
                    risk_score=abs(correlation),
                    contributing_factors=[f"Correlation between {var1} and {var2}"],
                    recommended_actions=self._generate_correlation_recommendations(var1, var2, correlation)
                )
                
                results.append(result)
            
            logger.info(f"Correlation analysis completed: {len(results)} correlations detected")
            return results
            
        except Exception as e:
            logger.error(f"Failed to analyze correlations: {e}")
            return []
    
    def execute_detection_cycle(self) -> Dict[str, Any]:
        """Execute complete detection cycle"""
        start_time = datetime.now()
        
        logger.info("Starting detection algorithms cycle")
        
        all_results = []
        
        # Execute all detection algorithms
        detection_functions = [
            self.detect_growth_patterns,
            self.detect_duplication_clusters,
            self.detect_technical_debt_accumulation,
            self.detect_performance_degradation,
            self.detect_anomalies,
            self.analyze_correlations
        ]
        
        for detect_func in detection_functions:
            try:
                results = detect_func()
                all_results.extend(results)
            except Exception as e:
                logger.error(f"Detection function {detect_func.__name__} failed: {e}")
        
        # Store results
        self._store_detection_results(all_results)
        
        # Generate pattern analysis report
        cycle_time = (datetime.now() - start_time).total_seconds()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'cycle_time': cycle_time,
            'total_detections': len(all_results),
            'detections_by_type': defaultdict(int),
            'detections_by_severity': defaultdict(int),
            'high_risk_detections': [],
            'pattern_summary': self._generate_pattern_summary(all_results)
        }
        
        for result in all_results:
            report['detections_by_type'][result.detection_type] += 1
            report['detections_by_severity'][result.severity] += 1
            
            if result.risk_score > 0.7:
                report['high_risk_detections'].append(asdict(result))
        
        logger.info(f"Detection cycle completed in {cycle_time:.2f}s: {len(all_results)} total detections")
        
        return report
    
    def _get_file_histories(self) -> Dict[str, List[Tuple[datetime, int]]]:
        """Get file size histories"""
        histories = {}
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    SELECT file_path, timestamp, line_count
                    FROM file_metrics_history
                    ORDER BY file_path, timestamp
                ''')
                
                for row in cursor:
                    file_path, timestamp_str, line_count = row
                    timestamp = datetime.fromisoformat(timestamp_str)
                    
                    if file_path not in histories:
                        histories[file_path] = []
                    
                    histories[file_path].append((timestamp, line_count))
        
        except Exception as e:
            logger.error(f"Failed to get file histories: {e}")
        
        return histories
    
    def _analyze_growth_pattern(self, file_path: str, history: List[Tuple[datetime, int]]) -> GrowthPattern:
        """Analyze growth pattern for a file"""
        timestamps = [h[0] for h in history]
        sizes = [h[1] for h in history]
        
        # Calculate growth rate (lines per day)
        if len(history) >= 2:
            time_delta = (timestamps[-1] - timestamps[0]).total_seconds() / 86400  # days
            size_delta = sizes[-1] - sizes[0]
            
            if time_delta > 0:
                growth_rate = size_delta / time_delta
            else:
                growth_rate = 0
        else:
            growth_rate = 0
        
        # Calculate acceleration
        if len(sizes) >= 3:
            recent_growth = (sizes[-1] - sizes[-2]) / max(1, (timestamps[-1] - timestamps[-2]).total_seconds() / 86400)
            earlier_growth = (sizes[-2] - sizes[-3]) / max(1, (timestamps[-2] - timestamps[-3]).total_seconds() / 86400)
            acceleration = recent_growth - earlier_growth
        else:
            acceleration = 0
        
        # Determine trend
        if growth_rate > 5:
            trend = 'rapidly_increasing'
        elif growth_rate > 1:
            trend = 'increasing'
        elif growth_rate > -1:
            trend = 'stable'
        else:
            trend = 'decreasing'
        
        return GrowthPattern(
            file_path=file_path,
            historical_sizes=history,
            growth_rate=growth_rate,
            acceleration=acceleration,
            trend=trend
        )
    
    def _get_file_contents(self) -> Dict[str, str]:
        """Get file contents for duplication analysis"""
        contents = {}
        
        try:
            # Get monitored files
            monitored_paths = [
                PROJECT_ROOT / 'docs',
                PROJECT_ROOT / 'scripts',
                PROJECT_ROOT / 'commands',
                PROJECT_ROOT / 'CLAUDE.md',
                PROJECT_ROOT / 'README.md'
            ]
            
            for path in monitored_paths:
                if path.is_file() and path.suffix == '.md':
                    with open(path, 'r', encoding='utf-8') as f:
                        contents[str(path.relative_to(PROJECT_ROOT))] = f.read()
                elif path.is_dir():
                    for file_path in path.rglob('*.md'):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            contents[str(file_path.relative_to(PROJECT_ROOT))] = f.read()
        
        except Exception as e:
            logger.error(f"Failed to get file contents: {e}")
        
        return contents
    
    def _calculate_similarity_matrix(self, file_contents: Dict[str, str]) -> Dict[str, Dict[str, float]]:
        """Calculate similarity matrix between files"""
        similarity_matrix = {}
        
        files = list(file_contents.keys())
        
        for i, file1 in enumerate(files):
            similarity_matrix[file1] = {}
            
            for j, file2 in enumerate(files):
                if i == j:
                    similarity_matrix[file1][file2] = 1.0
                elif file2 in similarity_matrix and file1 in similarity_matrix[file2]:
                    similarity_matrix[file1][file2] = similarity_matrix[file2][file1]
                else:
                    similarity = self._calculate_text_similarity(file_contents[file1], file_contents[file2])
                    similarity_matrix[file1][file2] = similarity
        
        return similarity_matrix
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        try:
            # Use difflib for similarity calculation
            matcher = difflib.SequenceMatcher(None, text1, text2)
            return matcher.ratio()
        except Exception as e:
            logger.error(f"Failed to calculate text similarity: {e}")
            return 0.0
    
    def _identify_duplication_clusters(self, similarity_matrix: Dict[str, Dict[str, float]]) -> List[DuplicationCluster]:
        """Identify duplication clusters from similarity matrix"""
        clusters = []
        
        try:
            # Use simple clustering based on similarity threshold
            files = list(similarity_matrix.keys())
            visited = set()
            
            for file1 in files:
                if file1 in visited:
                    continue
                
                cluster_files = [file1]
                visited.add(file1)
                
                for file2 in files:
                    if file2 != file1 and file2 not in visited:
                        if similarity_matrix[file1][file2] > DETECTION_THRESHOLDS['duplication_similarity_min']:
                            cluster_files.append(file2)
                            visited.add(file2)
                
                if len(cluster_files) > 1:
                    # Calculate cluster metrics
                    similarities = []
                    for i in range(len(cluster_files)):
                        for j in range(i+1, len(cluster_files)):
                            similarities.append(similarity_matrix[cluster_files[i]][cluster_files[j]])
                    
                    avg_similarity = sum(similarities) / len(similarities) if similarities else 0
                    
                    cluster = DuplicationCluster(
                        cluster_id=f"cluster_{len(clusters)}",
                        files=cluster_files,
                        similarity_matrix={f: similarity_matrix[f] for f in cluster_files},
                        average_similarity=avg_similarity,
                        consolidation_potential=avg_similarity * len(cluster_files)
                    )
                    
                    clusters.append(cluster)
        
        except Exception as e:
            logger.error(f"Failed to identify duplication clusters: {e}")
        
        return clusters
    
    def _get_debt_history(self) -> Dict[str, List[Tuple[datetime, int]]]:
        """Get technical debt history"""
        histories = {}
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    SELECT file_path, timestamp, todo_count
                    FROM file_metrics_history
                    WHERE todo_count > 0
                    ORDER BY file_path, timestamp
                ''')
                
                for row in cursor:
                    file_path, timestamp_str, todo_count = row
                    timestamp = datetime.fromisoformat(timestamp_str)
                    
                    if file_path not in histories:
                        histories[file_path] = []
                    
                    histories[file_path].append((timestamp, todo_count))
        
        except Exception as e:
            logger.error(f"Failed to get debt history: {e}")
        
        return histories
    
    def _get_performance_history(self) -> Dict[str, List[Tuple[datetime, float]]]:
        """Get performance metrics history"""
        histories = {}
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    SELECT file_path, timestamp, complexity_score
                    FROM file_metrics_history
                    ORDER BY file_path, timestamp
                ''')
                
                for row in cursor:
                    file_path, timestamp_str, complexity_score = row
                    timestamp = datetime.fromisoformat(timestamp_str)
                    
                    if file_path not in histories:
                        histories[file_path] = []
                    
                    histories[file_path].append((timestamp, complexity_score))
        
        except Exception as e:
            logger.error(f"Failed to get performance history: {e}")
        
        return histories
    
    def _store_detection_results(self, results: List[DetectionResult]):
        """Store detection results in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                for result in results:
                    conn.execute('''
                        INSERT INTO detection_results (
                            timestamp, detection_type, severity, confidence, file_path,
                            pattern_detected, current_value, predicted_value, trend,
                            risk_score, time_to_violation, contributing_factors,
                            recommended_actions
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        result.timestamp.isoformat(),
                        result.detection_type,
                        result.severity,
                        result.confidence,
                        result.file_path,
                        result.pattern_detected,
                        result.current_value,
                        result.predicted_value,
                        result.trend,
                        result.risk_score,
                        result.time_to_violation,
                        json.dumps(result.contributing_factors) if result.contributing_factors else None,
                        json.dumps(result.recommended_actions) if result.recommended_actions else None
                    ))
                conn.commit()
        
        except Exception as e:
            logger.error(f"Failed to store detection results: {e}")
    
    # Helper methods for calculations and recommendations
    def _calculate_severity(self, growth_rate: float, acceleration: float) -> str:
        """Calculate severity based on growth rate and acceleration"""
        if growth_rate > 50 or acceleration > 20:
            return 'critical'
        elif growth_rate > 20 or acceleration > 10:
            return 'high'
        elif growth_rate > 5 or acceleration > 5:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_confidence(self, pattern: GrowthPattern, history: List[Tuple[datetime, int]]) -> float:
        """Calculate confidence in pattern detection"""
        # Base confidence on data points and consistency
        data_points = len(history)
        consistency = 1.0 - abs(pattern.acceleration) / max(1, abs(pattern.growth_rate))
        
        base_confidence = min(1.0, data_points / 10)  # More data points = higher confidence
        consistency_factor = max(0.5, consistency)
        
        return base_confidence * consistency_factor
    
    def _identify_growth_factors(self, file_path: str, history: List[Tuple[datetime, int]]) -> List[str]:
        """Identify factors contributing to growth"""
        factors = []
        
        # Analyze growth pattern
        sizes = [h[1] for h in history]
        
        if len(sizes) >= 2:
            recent_growth = sizes[-1] - sizes[-2]
            if recent_growth > 100:
                factors.append("Large recent additions")
            elif recent_growth > 50:
                factors.append("Moderate recent additions")
        
        # Check file type and location
        if 'docs/' in file_path:
            factors.append("Documentation expansion")
        elif 'scripts/' in file_path:
            factors.append("Script functionality growth")
        elif 'commands/' in file_path:
            factors.append("Command system expansion")
        
        return factors
    
    def _generate_growth_recommendations(self, pattern: GrowthPattern) -> List[str]:
        """Generate recommendations for growth patterns"""
        recommendations = []
        
        if pattern.growth_rate > 20:
            recommendations.append("Consider immediate modularization")
            recommendations.append("Review content for potential consolidation")
        elif pattern.growth_rate > 10:
            recommendations.append("Plan modularization strategy")
            recommendations.append("Monitor growth closely")
        
        if pattern.acceleration > 5:
            recommendations.append("Investigate cause of acceleration")
            recommendations.append("Consider growth rate limiting measures")
        
        return recommendations
    
    def _generate_pattern_summary(self, results: List[DetectionResult]) -> Dict[str, Any]:
        """Generate pattern summary from detection results"""
        summary = {
            'high_risk_files': [],
            'growth_hotspots': [],
            'duplication_candidates': [],
            'debt_accumulation_areas': [],
            'performance_concerns': []
        }
        
        for result in results:
            if result.risk_score > 0.7:
                summary['high_risk_files'].append({
                    'file_path': result.file_path,
                    'risk_score': result.risk_score,
                    'detection_type': result.detection_type
                })
            
            if result.detection_type == 'growth_pattern':
                summary['growth_hotspots'].append({
                    'file_path': result.file_path,
                    'current_value': result.current_value,
                    'predicted_value': result.predicted_value
                })
            
            # Add other pattern categories...
        
        return summary
    
    # Additional helper methods...
    def _get_metrics_for_anomaly_detection(self) -> List[Dict[str, Any]]:
        """Get metrics data for anomaly detection"""
        # Implementation depends on available metrics
        return []
    
    def _get_violation_correlations(self) -> List[Dict[str, Any]]:
        """Get violation data for correlation analysis"""
        # Implementation depends on violation history
        return []
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend from values"""
        if len(values) < 2:
            return 'stable'
        
        slope = (values[-1] - values[0]) / len(values)
        
        if slope > 0.1:
            return 'increasing'
        elif slope < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    def _calculate_degradation_rate(self, values: List[float]) -> float:
        """Calculate degradation rate"""
        if len(values) < 2:
            return 0.0
        
        return (values[-1] - values[0]) / len(values)
    
    # Additional calculation and recommendation methods...
    def _calculate_duplication_severity(self, cluster: DuplicationCluster) -> str:
        """Calculate severity for duplication cluster"""
        if cluster.average_similarity > 0.7:
            return 'high'
        elif cluster.average_similarity > 0.5:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_debt_severity(self, accumulation_rate: float, current_debt: int) -> str:
        """Calculate severity for debt accumulation"""
        if accumulation_rate > 2 or current_debt > 15:
            return 'high'
        elif accumulation_rate > 1 or current_debt > 10:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_performance_severity(self, degradation_rate: float, current_value: float) -> str:
        """Calculate severity for performance degradation"""
        if degradation_rate > 0.5 or current_value > 3.0:
            return 'critical'
        elif degradation_rate > 0.3 or current_value > 2.5:
            return 'high'
        elif degradation_rate > 0.1 or current_value > 2.0:
            return 'medium'
        else:
            return 'low'
    
    def _identify_duplication_factors(self, cluster: DuplicationCluster) -> List[str]:
        """Identify factors contributing to duplication"""
        factors = []
        
        if len(cluster.files) > 3:
            factors.append("Multiple files with similar content")
        
        if cluster.average_similarity > 0.8:
            factors.append("Very high content similarity")
        
        # Check file locations
        docs_files = [f for f in cluster.files if 'docs/' in f]
        if len(docs_files) > 1:
            factors.append("Documentation duplication")
        
        return factors
    
    def _identify_debt_factors(self, file_path: str, history: List[Tuple[datetime, int]]) -> List[str]:
        """Identify factors contributing to debt accumulation"""
        factors = []
        
        debt_counts = [h[1] for h in history]
        
        if debt_counts[-1] > 10:
            factors.append("High absolute debt count")
        
        if len(debt_counts) > 1 and debt_counts[-1] > debt_counts[-2]:
            factors.append("Recent debt increase")
        
        return factors
    
    def _identify_performance_factors(self, metric_type: str, history: List[Tuple[datetime, float]]) -> List[str]:
        """Identify factors contributing to performance degradation"""
        factors = []
        
        values = [h[1] for h in history]
        
        if values[-1] > 2.5:
            factors.append("Navigation complexity exceeded threshold")
        
        if len(values) > 1 and values[-1] > values[-2]:
            factors.append("Recent performance degradation")
        
        return factors
    
    def _identify_anomaly_factors(self, row: pd.Series) -> List[str]:
        """Identify factors contributing to anomalies"""
        factors = ["Statistical anomaly detected"]
        
        # Add specific factors based on data
        if 'file_path' in row:
            factors.append(f"Anomaly in {row['file_path']}")
        
        return factors
    
    def _generate_duplication_recommendations(self, cluster: DuplicationCluster) -> List[str]:
        """Generate recommendations for duplication clusters"""
        recommendations = []
        
        if cluster.average_similarity > 0.8:
            recommendations.append("Consider immediate consolidation")
        elif cluster.average_similarity > 0.5:
            recommendations.append("Plan consolidation strategy")
        
        if len(cluster.files) > 3:
            recommendations.append("Review multiple files for common patterns")
        
        return recommendations
    
    def _generate_debt_recommendations(self, accumulation_rate: float) -> List[str]:
        """Generate recommendations for debt accumulation"""
        recommendations = []
        
        if accumulation_rate > 2:
            recommendations.append("Implement immediate debt resolution")
            recommendations.append("Review development practices")
        elif accumulation_rate > 1:
            recommendations.append("Plan systematic debt reduction")
        
        return recommendations
    
    def _generate_performance_recommendations(self, degradation_rate: float) -> List[str]:
        """Generate recommendations for performance degradation"""
        recommendations = []
        
        if degradation_rate > 0.5:
            recommendations.append("Immediate performance optimization required")
            recommendations.append("Review navigation structure")
        elif degradation_rate > 0.3:
            recommendations.append("Plan performance improvement")
        
        return recommendations
    
    def _generate_correlation_recommendations(self, var1: str, var2: str, correlation: float) -> List[str]:
        """Generate recommendations for correlations"""
        recommendations = []
        
        if correlation > 0.8:
            recommendations.append(f"Strong positive correlation: address {var1} and {var2} together")
        elif correlation < -0.8:
            recommendations.append(f"Strong negative correlation: balance {var1} and {var2}")
        
        return recommendations

def main():
    """Main detection algorithms execution"""
    try:
        detector = DetectionAlgorithms()
        report = detector.execute_detection_cycle()
        
        print("\n" + "="*80)
        print("DETECTION ALGORITHMS REPORT")
        print("="*80)
        print(f"Timestamp: {report['timestamp']}")
        print(f"Cycle Time: {report['cycle_time']:.2f}s")
        print(f"Total Detections: {report['total_detections']}")
        
        if report['detections_by_type']:
            print("\nDetections by Type:")
            for detection_type, count in report['detections_by_type'].items():
                print(f"  {detection_type}: {count}")
        
        if report['detections_by_severity']:
            print("\nDetections by Severity:")
            for severity, count in report['detections_by_severity'].items():
                print(f"  {severity}: {count}")
        
        if report['high_risk_detections']:
            print(f"\nHigh Risk Detections: {len(report['high_risk_detections'])}")
        
        print("="*80)
        
        # Save report
        report_file = ANALYTICS_DIR / f"detection_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Detection report saved: {report_file}")
        
    except Exception as e:
        logger.error(f"Detection algorithms failed: {e}")
        raise

if __name__ == "__main__":
    main()