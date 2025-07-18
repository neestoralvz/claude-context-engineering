#!/usr/bin/env python3
"""
⚡ Continuous Performance Optimizer - Phase 3 Implementation
Real-time performance analysis and automated optimization

CRITICAL Implementation of Principle #108 - Performance Optimization
"""

import os
import sys
import json
import sqlite3
import logging
import asyncio
import threading
import time
import psutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import subprocess
import numpy as np
from collections import defaultdict, deque
import concurrent.futures
from contextlib import contextmanager

# Add governance directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

@dataclass
class PerformanceMetric:
    """Represents a performance metric measurement"""
    metric_id: str
    metric_type: str
    value: float
    unit: str
    timestamp: datetime
    context: Dict[str, Any]
    target_value: Optional[float] = None
    threshold_critical: Optional[float] = None
    threshold_warning: Optional[float] = None

@dataclass
class OptimizationAction:
    """Represents an optimization action to be taken"""
    action_id: str
    action_type: str
    target_component: str
    optimization_strategy: str
    expected_improvement: float
    estimated_effort: int  # minutes
    priority: str
    dependencies: List[str]
    rollback_plan: Dict[str, Any]
    created_at: datetime
    status: str = "pending"

@dataclass
class OptimizationResult:
    """Results of an optimization execution"""
    action_id: str
    success: bool
    improvement_achieved: float
    execution_time: float
    metrics_before: Dict[str, float]
    metrics_after: Dict[str, float]
    side_effects: List[str]
    rollback_needed: bool
    completed_at: datetime

class RealTimeAnalyzer:
    """Real-time performance analysis with intelligent pattern detection"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.db_path = "scripts/results/governance/performance_optimization.db"
        self.setup_database()
        
        # Performance tracking
        self.metric_history = defaultdict(lambda: deque(maxlen=1000))
        self.performance_targets = {
            'cognitive_steps': 2.5,
            'navigation_time': 30,  # seconds
            'file_access_time': 5,   # seconds
            'search_response_time': 10,  # seconds
            'system_response_time': 2,   # seconds
            'memory_usage': 500,     # MB
            'cpu_usage': 50,         # percentage
            'disk_io_latency': 100,  # ms
            'network_latency': 50    # ms
        }
        
        # Analysis patterns
        self.trend_analyzers = {
            'cognitive_complexity': self._analyze_cognitive_trends,
            'access_patterns': self._analyze_access_patterns,
            'resource_utilization': self._analyze_resource_trends,
            'response_times': self._analyze_response_trends,
            'bottleneck_detection': self._analyze_bottlenecks,
            'efficiency_metrics': self._analyze_efficiency_trends
        }
        
        # Real-time monitoring
        self.monitoring_active = False
        self.monitoring_thread = None
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for continuous optimizer"""
        logger = logging.getLogger('continuous_optimizer')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            os.makedirs("scripts/results/governance/logs", exist_ok=True)
            
            handler = logging.FileHandler('scripts/results/governance/logs/continuous_optimizer.log')
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
        """Initialize performance optimization database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    metric_id TEXT PRIMARY KEY,
                    metric_type TEXT NOT NULL,
                    value REAL NOT NULL,
                    unit TEXT NOT NULL,
                    target_value REAL,
                    threshold_critical REAL,
                    threshold_warning REAL,
                    context TEXT NOT NULL,
                    timestamp TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS optimization_actions (
                    action_id TEXT PRIMARY KEY,
                    action_type TEXT NOT NULL,
                    target_component TEXT NOT NULL,
                    optimization_strategy TEXT NOT NULL,
                    expected_improvement REAL NOT NULL,
                    estimated_effort INTEGER NOT NULL,
                    priority TEXT NOT NULL,
                    dependencies TEXT NOT NULL,
                    rollback_plan TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS optimization_results (
                    result_id TEXT PRIMARY KEY,
                    action_id TEXT NOT NULL,
                    success BOOLEAN NOT NULL,
                    improvement_achieved REAL NOT NULL,
                    execution_time REAL NOT NULL,
                    metrics_before TEXT NOT NULL,
                    metrics_after TEXT NOT NULL,
                    side_effects TEXT NOT NULL,
                    rollback_needed BOOLEAN NOT NULL,
                    completed_at TIMESTAMP NOT NULL,
                    FOREIGN KEY (action_id) REFERENCES optimization_actions (action_id)
                );
                
                CREATE TABLE IF NOT EXISTS trend_analysis (
                    analysis_id TEXT PRIMARY KEY,
                    analysis_type TEXT NOT NULL,
                    trend_data TEXT NOT NULL,
                    insights TEXT NOT NULL,
                    recommendations TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS performance_baselines (
                    baseline_id TEXT PRIMARY KEY,
                    component TEXT NOT NULL,
                    metric_type TEXT NOT NULL,
                    baseline_value REAL NOT NULL,
                    measurement_date TIMESTAMP NOT NULL,
                    validation_status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_metrics_type_timestamp ON performance_metrics(metric_type, timestamp);
                CREATE INDEX IF NOT EXISTS idx_actions_status ON optimization_actions(status);
                CREATE INDEX IF NOT EXISTS idx_results_action ON optimization_results(action_id);
                CREATE INDEX IF NOT EXISTS idx_trend_type ON trend_analysis(analysis_type);
                CREATE INDEX IF NOT EXISTS idx_baseline_component ON performance_baselines(component);
            """)
    
    async def start_continuous_analysis(self):
        """Start continuous performance analysis"""
        self.logger.info("⚡ Starting continuous performance analysis")
        self.monitoring_active = True
        
        try:
            # Start analysis tasks
            tasks = [
                asyncio.create_task(self._metric_collection_loop()),
                asyncio.create_task(self._trend_analysis_loop()),
                asyncio.create_task(self._bottleneck_detection_loop()),
                asyncio.create_task(self._optimization_recommendation_loop()),
                asyncio.create_task(self._baseline_validation_loop())
            ]
            
            await asyncio.gather(*tasks)
            
        except Exception as e:
            self.logger.error(f"❌ Error in continuous analysis: {e}")
        finally:
            self.monitoring_active = False
            self.logger.info("⚡ Continuous analysis stopped")
    
    async def _metric_collection_loop(self):
        """Continuously collect performance metrics"""
        while self.monitoring_active:
            try:
                # Collect system metrics
                await self._collect_system_metrics()
                
                # Collect application metrics
                await self._collect_application_metrics()
                
                # Collect user experience metrics
                await self._collect_ux_metrics()
                
                # Wait for next collection cycle
                await asyncio.sleep(self.config.get('metric_collection_interval', 60))
                
            except Exception as e:
                self.logger.error(f"Error in metric collection: {e}")
                await asyncio.sleep(30)
    
    async def _collect_system_metrics(self):
        """Collect system-level performance metrics"""
        try:
            timestamp = datetime.now()
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            await self._store_metric(PerformanceMetric(
                metric_id=f"cpu_usage_{int(timestamp.timestamp())}",
                metric_type="cpu_usage",
                value=cpu_percent,
                unit="percentage",
                timestamp=timestamp,
                context={"cores": psutil.cpu_count()},
                target_value=self.performance_targets['cpu_usage'],
                threshold_critical=90.0,
                threshold_warning=75.0
            ))
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_mb = memory.used / (1024 * 1024)
            await self._store_metric(PerformanceMetric(
                metric_id=f"memory_usage_{int(timestamp.timestamp())}",
                metric_type="memory_usage",
                value=memory_mb,
                unit="MB",
                timestamp=timestamp,
                context={"total_mb": memory.total / (1024 * 1024), "percent": memory.percent},
                target_value=self.performance_targets['memory_usage'],
                threshold_critical=2000.0,
                threshold_warning=1000.0
            ))
            
            # Disk I/O
            disk_io = psutil.disk_io_counters()
            if disk_io:
                # Estimate latency based on read/write operations
                io_latency = (disk_io.read_time + disk_io.write_time) / max(disk_io.read_count + disk_io.write_count, 1)
                await self._store_metric(PerformanceMetric(
                    metric_id=f"disk_io_latency_{int(timestamp.timestamp())}",
                    metric_type="disk_io_latency",
                    value=io_latency,
                    unit="ms",
                    timestamp=timestamp,
                    context={"reads": disk_io.read_count, "writes": disk_io.write_count},
                    target_value=self.performance_targets['disk_io_latency'],
                    threshold_critical=500.0,
                    threshold_warning=200.0
                ))
            
        except Exception as e:
            self.logger.error(f"Error collecting system metrics: {e}")
    
    async def _collect_application_metrics(self):
        """Collect application-specific metrics"""
        try:
            timestamp = datetime.now()
            
            # File access time measurement
            test_file = "CLAUDE.md"
            if os.path.exists(test_file):
                start_time = time.time()
                with open(test_file, 'r') as f:
                    _ = f.read(1024)  # Read first 1KB
                access_time = (time.time() - start_time) * 1000  # Convert to ms
                
                await self._store_metric(PerformanceMetric(
                    metric_id=f"file_access_{int(timestamp.timestamp())}",
                    metric_type="file_access_time",
                    value=access_time,
                    unit="ms",
                    timestamp=timestamp,
                    context={"file": test_file, "size_kb": os.path.getsize(test_file) / 1024},
                    target_value=self.performance_targets['file_access_time'] * 1000,
                    threshold_critical=10000.0,
                    threshold_warning=5000.0
                ))
            
            # Directory traversal performance
            start_time = time.time()
            file_count = 0
            for root, dirs, files in os.walk("docs"):
                file_count += len(files)
                if file_count > 100:  # Limit for performance
                    break
            
            traversal_time = (time.time() - start_time) * 1000
            
            await self._store_metric(PerformanceMetric(
                metric_id=f"dir_traversal_{int(timestamp.timestamp())}",
                metric_type="directory_traversal",
                value=traversal_time,
                unit="ms",
                timestamp=timestamp,
                context={"files_scanned": file_count},
                target_value=1000.0,
                threshold_critical=5000.0,
                threshold_warning=2000.0
            ))
            
        except Exception as e:
            self.logger.error(f"Error collecting application metrics: {e}")
    
    async def _collect_ux_metrics(self):
        """Collect user experience metrics"""
        try:
            timestamp = datetime.now()
            
            # Estimate cognitive complexity for navigation
            cognitive_steps = await self._measure_cognitive_complexity()
            
            await self._store_metric(PerformanceMetric(
                metric_id=f"cognitive_steps_{int(timestamp.timestamp())}",
                metric_type="cognitive_steps",
                value=cognitive_steps,
                unit="steps",
                timestamp=timestamp,
                context={"measurement_method": "navigation_analysis"},
                target_value=self.performance_targets['cognitive_steps'],
                threshold_critical=4.0,
                threshold_warning=3.0
            ))
            
        except Exception as e:
            self.logger.error(f"Error collecting UX metrics: {e}")
    
    async def _measure_cognitive_complexity(self) -> float:
        """Measure cognitive complexity for navigation"""
        try:
            # Simple heuristic: analyze file structure depth and connections
            max_depth = 0
            total_files = 0
            
            for root, dirs, files in os.walk("docs"):
                depth = root.count(os.sep) - "docs".count(os.sep)
                max_depth = max(max_depth, depth)
                total_files += len(files)
            
            # Heuristic: cognitive steps = log(files) + depth_factor
            if total_files > 0:
                cognitive_steps = np.log10(total_files) + (max_depth * 0.5)
                return min(cognitive_steps, 5.0)  # Cap at 5 steps
            
            return 1.0
            
        except Exception as e:
            self.logger.error(f"Error measuring cognitive complexity: {e}")
            return 2.5  # Default target value
    
    async def _store_metric(self, metric: PerformanceMetric):
        """Store performance metric in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO performance_metrics
                    (metric_id, metric_type, value, unit, target_value,
                     threshold_critical, threshold_warning, context, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    metric.metric_id,
                    metric.metric_type,
                    metric.value,
                    metric.unit,
                    metric.target_value,
                    metric.threshold_critical,
                    metric.threshold_warning,
                    json.dumps(metric.context),
                    metric.timestamp.isoformat()
                ))
            
            # Add to in-memory history for real-time analysis
            self.metric_history[metric.metric_type].append({
                'timestamp': metric.timestamp,
                'value': metric.value,
                'context': metric.context
            })
            
        except Exception as e:
            self.logger.error(f"Error storing metric: {e}")
    
    async def _trend_analysis_loop(self):
        """Continuous trend analysis"""
        while self.monitoring_active:
            try:
                # Run all trend analyzers
                for analyzer_name, analyzer_func in self.trend_analyzers.items():
                    await analyzer_func()
                
                # Wait for next analysis cycle
                await asyncio.sleep(self.config.get('trend_analysis_interval', 300))  # 5 minutes
                
            except Exception as e:
                self.logger.error(f"Error in trend analysis: {e}")
                await asyncio.sleep(60)
    
    async def _analyze_cognitive_trends(self):
        """Analyze cognitive complexity trends"""
        try:
            metric_type = "cognitive_steps"
            if metric_type not in self.metric_history:
                return
            
            history = list(self.metric_history[metric_type])
            if len(history) < 5:
                return
            
            # Calculate trend
            values = [h['value'] for h in history[-20:]]  # Last 20 measurements
            timestamps = [h['timestamp'] for h in history[-20:]]
            
            # Simple linear trend
            if len(values) >= 2:
                trend_slope = (values[-1] - values[0]) / max(len(values) - 1, 1)
                current_avg = np.mean(values[-5:])  # Last 5 measurements
                
                insights = []
                recommendations = []
                
                if current_avg > self.performance_targets[metric_type]:
                    insights.append(f"Cognitive complexity ({current_avg:.2f}) exceeds target ({self.performance_targets[metric_type]})")
                    recommendations.append("Consider file structure optimization and navigation simplification")
                
                if trend_slope > 0.1:
                    insights.append(f"Increasing complexity trend detected (slope: {trend_slope:.3f})")
                    recommendations.append("Implement preventive modularization and structure review")
                
                # Store analysis
                await self._store_trend_analysis(
                    analysis_type="cognitive_complexity",
                    trend_data={"values": values, "slope": trend_slope, "average": current_avg},
                    insights=insights,
                    recommendations=recommendations,
                    confidence_score=min(len(values) / 20.0, 1.0)
                )
                
        except Exception as e:
            self.logger.error(f"Error in cognitive trend analysis: {e}")
    
    async def _analyze_access_patterns(self):
        """Analyze file access patterns"""
        try:
            # Analyze access frequency and patterns
            access_metrics = [h for h in self.metric_history.get("file_access_time", []) if h]
            
            if len(access_metrics) < 5:
                return
            
            # Group by file context
            file_access_times = defaultdict(list)
            for metric in access_metrics[-50:]:  # Last 50 accesses
                file_name = metric['context'].get('file', 'unknown')
                file_access_times[file_name].append(metric['value'])
            
            insights = []
            recommendations = []
            
            # Identify slow access patterns
            for file_name, times in file_access_times.items():
                avg_time = np.mean(times)
                if avg_time > 1000:  # > 1 second
                    insights.append(f"Slow access detected for {file_name}: {avg_time:.1f}ms average")
                    recommendations.append(f"Optimize {file_name} structure or implement caching")
            
            # Store analysis
            await self._store_trend_analysis(
                analysis_type="access_patterns",
                trend_data={"file_times": dict(file_access_times)},
                insights=insights,
                recommendations=recommendations,
                confidence_score=min(len(access_metrics) / 20.0, 1.0)
            )
            
        except Exception as e:
            self.logger.error(f"Error in access pattern analysis: {e}")
    
    async def _analyze_resource_trends(self):
        """Analyze system resource utilization trends"""
        try:
            cpu_history = list(self.metric_history.get("cpu_usage", []))
            memory_history = list(self.metric_history.get("memory_usage", []))
            
            insights = []
            recommendations = []
            
            # CPU trend analysis
            if len(cpu_history) >= 10:
                cpu_values = [h['value'] for h in cpu_history[-20:]]
                cpu_avg = np.mean(cpu_values)
                cpu_trend = (cpu_values[-1] - cpu_values[0]) / max(len(cpu_values) - 1, 1)
                
                if cpu_avg > 75:
                    insights.append(f"High CPU usage detected: {cpu_avg:.1f}% average")
                    recommendations.append("Investigate CPU-intensive processes and optimize algorithms")
                
                if cpu_trend > 1:
                    insights.append(f"Increasing CPU usage trend: {cpu_trend:.2f}% per measurement")
                    recommendations.append("Monitor for resource leaks and optimize background processes")
            
            # Memory trend analysis
            if len(memory_history) >= 10:
                memory_values = [h['value'] for h in memory_history[-20:]]
                memory_avg = np.mean(memory_values)
                memory_trend = (memory_values[-1] - memory_values[0]) / max(len(memory_values) - 1, 1)
                
                if memory_avg > 1000:  # > 1GB
                    insights.append(f"High memory usage detected: {memory_avg:.1f}MB average")
                    recommendations.append("Review memory usage patterns and implement optimization")
                
                if memory_trend > 10:  # Increasing by more than 10MB per measurement
                    insights.append(f"Memory usage increasing: {memory_trend:.1f}MB per measurement")
                    recommendations.append("Check for memory leaks and optimize data structures")
            
            # Store analysis
            await self._store_trend_analysis(
                analysis_type="resource_utilization",
                trend_data={"cpu_avg": cpu_avg if 'cpu_avg' in locals() else 0, 
                           "memory_avg": memory_avg if 'memory_avg' in locals() else 0},
                insights=insights,
                recommendations=recommendations,
                confidence_score=min((len(cpu_history) + len(memory_history)) / 40.0, 1.0)
            )
            
        except Exception as e:
            self.logger.error(f"Error in resource trend analysis: {e}")
    
    async def _analyze_response_trends(self):
        """Analyze system response time trends"""
        try:
            # Implementation for response time analysis
            response_metrics = ['file_access_time', 'directory_traversal']
            
            for metric_type in response_metrics:
                history = list(self.metric_history.get(metric_type, []))
                if len(history) < 5:
                    continue
                
                values = [h['value'] for h in history[-20:]]
                avg_response = np.mean(values)
                trend_slope = (values[-1] - values[0]) / max(len(values) - 1, 1)
                
                insights = []
                recommendations = []
                
                if metric_type == 'file_access_time' and avg_response > 1000:
                    insights.append(f"Slow file access: {avg_response:.1f}ms average")
                    recommendations.append("Implement file caching or optimize file structure")
                
                if trend_slope > 50:  # Increasing by >50ms per measurement
                    insights.append(f"Response time degradation in {metric_type}: {trend_slope:.1f}ms trend")
                    recommendations.append(f"Investigate performance bottlenecks in {metric_type}")
                
                if insights:
                    await self._store_trend_analysis(
                        analysis_type="response_times",
                        trend_data={"metric": metric_type, "avg": avg_response, "trend": trend_slope},
                        insights=insights,
                        recommendations=recommendations,
                        confidence_score=min(len(values) / 20.0, 1.0)
                    )
                    
        except Exception as e:
            self.logger.error(f"Error in response trend analysis: {e}")
    
    async def _analyze_bottlenecks(self):
        """Analyze system bottlenecks"""
        try:
            # Identify bottlenecks by correlating metrics
            bottlenecks = []
            
            # CPU bottleneck
            cpu_history = list(self.metric_history.get("cpu_usage", []))
            if cpu_history:
                recent_cpu = [h['value'] for h in cpu_history[-10:]]
                if np.mean(recent_cpu) > 80:
                    bottlenecks.append({
                        "type": "cpu",
                        "severity": "high",
                        "description": f"CPU usage consistently high: {np.mean(recent_cpu):.1f}%",
                        "impact": "System responsiveness degradation"
                    })
            
            # Memory bottleneck
            memory_history = list(self.metric_history.get("memory_usage", []))
            if memory_history:
                recent_memory = [h['value'] for h in memory_history[-10:]]
                if np.mean(recent_memory) > 1500:  # > 1.5GB
                    bottlenecks.append({
                        "type": "memory",
                        "severity": "medium",
                        "description": f"Memory usage high: {np.mean(recent_memory):.1f}MB",
                        "impact": "Potential system slowdown"
                    })
            
            # I/O bottleneck
            io_history = list(self.metric_history.get("disk_io_latency", []))
            if io_history:
                recent_io = [h['value'] for h in io_history[-10:]]
                if np.mean(recent_io) > 200:
                    bottlenecks.append({
                        "type": "io",
                        "severity": "medium",
                        "description": f"Disk I/O latency high: {np.mean(recent_io):.1f}ms",
                        "impact": "File access performance degradation"
                    })
            
            if bottlenecks:
                insights = [b["description"] for b in bottlenecks]
                recommendations = [f"Address {b['type']} bottleneck: {b['impact']}" for b in bottlenecks]
                
                await self._store_trend_analysis(
                    analysis_type="bottleneck_detection",
                    trend_data={"bottlenecks": bottlenecks},
                    insights=insights,
                    recommendations=recommendations,
                    confidence_score=1.0
                )
                
        except Exception as e:
            self.logger.error(f"Error in bottleneck analysis: {e}")
    
    async def _analyze_efficiency_trends(self):
        """Analyze overall system efficiency trends"""
        try:
            # Calculate efficiency score based on multiple metrics
            efficiency_factors = {}
            
            # Cognitive efficiency (lower is better)
            cognitive_history = list(self.metric_history.get("cognitive_steps", []))
            if cognitive_history:
                recent_cognitive = [h['value'] for h in cognitive_history[-10:]]
                cognitive_efficiency = max(0, (self.performance_targets['cognitive_steps'] - np.mean(recent_cognitive)) / self.performance_targets['cognitive_steps'])
                efficiency_factors['cognitive'] = cognitive_efficiency
            
            # Response efficiency (lower is better)
            access_history = list(self.metric_history.get("file_access_time", []))
            if access_history:
                recent_access = [h['value'] for h in access_history[-10:]]
                target_access = self.performance_targets['file_access_time'] * 1000
                access_efficiency = max(0, (target_access - np.mean(recent_access)) / target_access)
                efficiency_factors['response'] = access_efficiency
            
            # Resource efficiency (lower usage is better)
            cpu_history = list(self.metric_history.get("cpu_usage", []))
            if cpu_history:
                recent_cpu = [h['value'] for h in cpu_history[-10:]]
                cpu_efficiency = max(0, (100 - np.mean(recent_cpu)) / 100)
                efficiency_factors['resource'] = cpu_efficiency
            
            if efficiency_factors:
                overall_efficiency = np.mean(list(efficiency_factors.values()))
                
                insights = [f"Overall system efficiency: {overall_efficiency:.2%}"]
                recommendations = []
                
                if overall_efficiency < 0.7:
                    insights.append("System efficiency below optimal threshold (70%)")
                    recommendations.append("Implement comprehensive optimization strategy")
                
                for factor, score in efficiency_factors.items():
                    if score < 0.6:
                        insights.append(f"Low {factor} efficiency: {score:.2%}")
                        recommendations.append(f"Focus optimization efforts on {factor} performance")
                
                await self._store_trend_analysis(
                    analysis_type="efficiency_metrics",
                    trend_data={"overall": overall_efficiency, "factors": efficiency_factors},
                    insights=insights,
                    recommendations=recommendations,
                    confidence_score=min(len(efficiency_factors) / 3.0, 1.0)
                )
                
        except Exception as e:
            self.logger.error(f"Error in efficiency analysis: {e}")
    
    async def _store_trend_analysis(self, analysis_type: str, trend_data: Dict[str, Any], 
                                  insights: List[str], recommendations: List[str], 
                                  confidence_score: float):
        """Store trend analysis results"""
        try:
            analysis_id = f"{analysis_type}_{int(datetime.now().timestamp())}"
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO trend_analysis
                    (analysis_id, analysis_type, trend_data, insights, 
                     recommendations, confidence_score)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    analysis_id,
                    analysis_type,
                    json.dumps(trend_data),
                    json.dumps(insights),
                    json.dumps(recommendations),
                    confidence_score
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing trend analysis: {e}")
    
    async def _bottleneck_detection_loop(self):
        """Continuous bottleneck detection"""
        while self.monitoring_active:
            try:
                # Detect performance bottlenecks
                bottlenecks = await self._detect_current_bottlenecks()
                
                # Generate optimization actions for bottlenecks
                for bottleneck in bottlenecks:
                    action = await self._generate_optimization_action(bottleneck)
                    if action:
                        await self._store_optimization_action(action)
                
                await asyncio.sleep(self.config.get('bottleneck_detection_interval', 180))  # 3 minutes
                
            except Exception as e:
                self.logger.error(f"Error in bottleneck detection: {e}")
                await asyncio.sleep(60)
    
    async def _detect_current_bottlenecks(self) -> List[Dict[str, Any]]:
        """Detect current performance bottlenecks"""
        bottlenecks = []
        
        try:
            # Check recent metrics for bottleneck indicators
            for metric_type, target in self.performance_targets.items():
                if metric_type in self.metric_history:
                    recent_values = [h['value'] for h in list(self.metric_history[metric_type])[-5:]]
                    if recent_values:
                        avg_value = np.mean(recent_values)
                        
                        # Define bottleneck thresholds
                        threshold_multiplier = 1.5 if metric_type in ['cognitive_steps', 'file_access_time'] else 2.0
                        threshold = target * threshold_multiplier
                        
                        if avg_value > threshold:
                            bottlenecks.append({
                                "metric_type": metric_type,
                                "current_value": avg_value,
                                "target_value": target,
                                "severity": "high" if avg_value > threshold * 1.5 else "medium",
                                "impact_score": (avg_value - target) / target
                            })
                            
        except Exception as e:
            self.logger.error(f"Error detecting bottlenecks: {e}")
            
        return bottlenecks
    
    async def _generate_optimization_action(self, bottleneck: Dict[str, Any]) -> Optional[OptimizationAction]:
        """Generate optimization action for detected bottleneck"""
        try:
            metric_type = bottleneck["metric_type"]
            severity = bottleneck["severity"]
            
            # Define optimization strategies by metric type
            strategies = {
                'cognitive_steps': {
                    'strategy': 'navigation_simplification',
                    'component': 'navigation_structure',
                    'expected_improvement': 0.3,
                    'effort': 60
                },
                'file_access_time': {
                    'strategy': 'file_structure_optimization',
                    'component': 'file_system',
                    'expected_improvement': 0.4,
                    'effort': 30
                },
                'cpu_usage': {
                    'strategy': 'algorithm_optimization',
                    'component': 'processing_algorithms',
                    'expected_improvement': 0.25,
                    'effort': 90
                },
                'memory_usage': {
                    'strategy': 'memory_optimization',
                    'component': 'data_structures',
                    'expected_improvement': 0.3,
                    'effort': 45
                },
                'disk_io_latency': {
                    'strategy': 'io_optimization',
                    'component': 'file_io',
                    'expected_improvement': 0.35,
                    'effort': 40
                }
            }
            
            if metric_type not in strategies:
                return None
            
            strategy_info = strategies[metric_type]
            
            action = OptimizationAction(
                action_id=f"opt_{metric_type}_{int(datetime.now().timestamp())}",
                action_type="bottleneck_resolution",
                target_component=strategy_info['component'],
                optimization_strategy=strategy_info['strategy'],
                expected_improvement=strategy_info['expected_improvement'],
                estimated_effort=strategy_info['effort'],
                priority=severity,
                dependencies=[],
                rollback_plan={"backup_required": True, "restore_method": "configuration_rollback"},
                created_at=datetime.now()
            )
            
            return action
            
        except Exception as e:
            self.logger.error(f"Error generating optimization action: {e}")
            return None
    
    async def _store_optimization_action(self, action: OptimizationAction):
        """Store optimization action in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO optimization_actions
                    (action_id, action_type, target_component, optimization_strategy,
                     expected_improvement, estimated_effort, priority, dependencies,
                     rollback_plan, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    action.action_id,
                    action.action_type,
                    action.target_component,
                    action.optimization_strategy,
                    action.expected_improvement,
                    action.estimated_effort,
                    action.priority,
                    json.dumps(action.dependencies),
                    json.dumps(action.rollback_plan),
                    action.status,
                    action.created_at.isoformat()
                ))
                
        except Exception as e:
            self.logger.error(f"Error storing optimization action: {e}")
    
    async def _optimization_recommendation_loop(self):
        """Generate optimization recommendations"""
        while self.monitoring_active:
            try:
                # Generate recommendations based on trend analysis
                recommendations = await self._generate_optimization_recommendations()
                
                # Store and prioritize recommendations
                for rec in recommendations:
                    action = await self._convert_recommendation_to_action(rec)
                    if action:
                        await self._store_optimization_action(action)
                
                await asyncio.sleep(self.config.get('recommendation_interval', 600))  # 10 minutes
                
            except Exception as e:
                self.logger.error(f"Error in optimization recommendations: {e}")
                await asyncio.sleep(120)
    
    async def _generate_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Generate optimization recommendations based on analysis"""
        recommendations = []
        
        try:
            # Get recent trend analyses
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT analysis_type, trend_data, insights, recommendations, confidence_score
                    FROM trend_analysis
                    WHERE created_at > datetime('now', '-1 hour')
                    ORDER BY confidence_score DESC
                """)
                
                analyses = cursor.fetchall()
                
                for analysis in analyses:
                    analysis_type, trend_data, insights, recommendations_json, confidence = analysis
                    trend_info = json.loads(trend_data)
                    analysis_insights = json.loads(insights)
                    analysis_recommendations = json.loads(recommendations_json)
                    
                    # Convert to actionable recommendations
                    for rec_text in analysis_recommendations:
                        recommendations.append({
                            "source_analysis": analysis_type,
                            "recommendation": rec_text,
                            "confidence": confidence,
                            "trend_data": trend_info,
                            "insights": analysis_insights
                        })
                        
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            
        return recommendations
    
    async def _convert_recommendation_to_action(self, recommendation: Dict[str, Any]) -> Optional[OptimizationAction]:
        """Convert recommendation to optimization action"""
        try:
            rec_text = recommendation["recommendation"].lower()
            confidence = recommendation["confidence"]
            
            # Map recommendations to actions
            if "file structure" in rec_text or "modular" in rec_text:
                return OptimizationAction(
                    action_id=f"rec_modularization_{int(datetime.now().timestamp())}",
                    action_type="recommendation",
                    target_component="file_structure",
                    optimization_strategy="structure_modularization",
                    expected_improvement=0.25 * confidence,
                    estimated_effort=120,
                    priority="medium",
                    dependencies=[],
                    rollback_plan={"backup_required": True},
                    created_at=datetime.now()
                )
            
            elif "navigation" in rec_text or "cognitive" in rec_text:
                return OptimizationAction(
                    action_id=f"rec_navigation_{int(datetime.now().timestamp())}",
                    action_type="recommendation",
                    target_component="navigation",
                    optimization_strategy="navigation_optimization",
                    expected_improvement=0.3 * confidence,
                    estimated_effort=90,
                    priority="high",
                    dependencies=[],
                    rollback_plan={"backup_required": True},
                    created_at=datetime.now()
                )
            
            elif "cache" in rec_text or "optimization" in rec_text:
                return OptimizationAction(
                    action_id=f"rec_caching_{int(datetime.now().timestamp())}",
                    action_type="recommendation",
                    target_component="caching",
                    optimization_strategy="performance_caching",
                    expected_improvement=0.4 * confidence,
                    estimated_effort=60,
                    priority="medium",
                    dependencies=[],
                    rollback_plan={"backup_required": False},
                    created_at=datetime.now()
                )
            
        except Exception as e:
            self.logger.error(f"Error converting recommendation to action: {e}")
            
        return None
    
    async def _baseline_validation_loop(self):
        """Validate and update performance baselines"""
        while self.monitoring_active:
            try:
                # Update baselines based on stable performance periods
                await self._update_performance_baselines()
                
                # Validate current performance against baselines
                await self._validate_against_baselines()
                
                await asyncio.sleep(self.config.get('baseline_validation_interval', 3600))  # 1 hour
                
            except Exception as e:
                self.logger.error(f"Error in baseline validation: {e}")
                await asyncio.sleep(300)
    
    async def _update_performance_baselines(self):
        """Update performance baselines"""
        try:
            for metric_type in self.performance_targets.keys():
                if metric_type in self.metric_history:
                    # Get stable period (low variance)
                    recent_values = [h['value'] for h in list(self.metric_history[metric_type])[-50:]]
                    
                    if len(recent_values) >= 20:
                        # Calculate stability (inverse of coefficient of variation)
                        mean_val = np.mean(recent_values)
                        std_val = np.std(recent_values)
                        stability = 1 - (std_val / max(mean_val, 0.001))
                        
                        if stability > 0.8:  # Stable period
                            baseline_value = mean_val
                            
                            # Store baseline
                            baseline_id = f"baseline_{metric_type}_{int(datetime.now().timestamp())}"
                            with sqlite3.connect(self.db_path) as conn:
                                conn.execute("""
                                    INSERT INTO performance_baselines
                                    (baseline_id, component, metric_type, baseline_value,
                                     measurement_date, validation_status)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                """, (
                                    baseline_id,
                                    "system",
                                    metric_type,
                                    baseline_value,
                                    datetime.now().isoformat(),
                                    "validated"
                                ))
                                
        except Exception as e:
            self.logger.error(f"Error updating baselines: {e}")
    
    async def _validate_against_baselines(self):
        """Validate current performance against established baselines"""
        try:
            # Get latest baselines
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT metric_type, baseline_value
                    FROM performance_baselines
                    WHERE validation_status = 'validated'
                    AND measurement_date > datetime('now', '-7 days')
                    ORDER BY measurement_date DESC
                """)
                
                baselines = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Compare current performance
            for metric_type, baseline_value in baselines.items():
                if metric_type in self.metric_history:
                    current_values = [h['value'] for h in list(self.metric_history[metric_type])[-5:]]
                    if current_values:
                        current_avg = np.mean(current_values)
                        deviation = abs(current_avg - baseline_value) / max(baseline_value, 0.001)
                        
                        if deviation > 0.2:  # More than 20% deviation
                            self.logger.warning(f"Performance deviation detected in {metric_type}: "
                                              f"current={current_avg:.2f}, baseline={baseline_value:.2f}, "
                                              f"deviation={deviation:.1%}")
                            
        except Exception as e:
            self.logger.error(f"Error validating against baselines: {e}")
    
    def stop(self):
        """Stop continuous analysis"""
        self.monitoring_active = False
        self.logger.info("⚡ Continuous performance analysis stopped")

def main():
    """Main entry point for continuous optimizer"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Continuous Performance Optimizer - Phase 3")
    parser.add_argument("--config", default="scripts/governance/continuous-optimizer-config.json",
                       help="Configuration file path")
    parser.add_argument("--daemon", action="store_true",
                       help="Run as daemon process")
    parser.add_argument("--analyze-only", action="store_true",
                       help="Run analysis only, no optimization actions")
    
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    try:
        if os.path.exists(args.config):
            with open(args.config, 'r') as f:
                config = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load config {args.config}: {e}")
        config = {
            "metric_collection_interval": 60,
            "trend_analysis_interval": 300,
            "bottleneck_detection_interval": 180,
            "recommendation_interval": 600,
            "baseline_validation_interval": 3600
        }
    
    if args.daemon:
        # Run as daemon
        analyzer = RealTimeAnalyzer(config)
        try:
            asyncio.run(analyzer.start_continuous_analysis())
        except KeyboardInterrupt:
            print("\n⚡ Continuous optimizer interrupted by user")
            analyzer.stop()
    else:
        # Single analysis run
        async def single_run():
            analyzer = RealTimeAnalyzer(config)
            
            print("⚡ Starting single analysis run")
            
            # Collect metrics
            await analyzer._collect_system_metrics()
            await analyzer._collect_application_metrics()
            await analyzer._collect_ux_metrics()
            
            # Run trend analysis
            for analyzer_name, analyzer_func in analyzer.trend_analyzers.items():
                print(f"Running {analyzer_name} analysis...")
                await analyzer_func()
            
            # Detect bottlenecks
            bottlenecks = await analyzer._detect_current_bottlenecks()
            print(f"Detected {len(bottlenecks)} performance bottlenecks")
            
            for bottleneck in bottlenecks:
                print(f"  - {bottleneck['metric_type']}: {bottleneck['severity']} severity")
            
            print("✅ Analysis complete")
        
        asyncio.run(single_run())

if __name__ == "__main__":
    main()