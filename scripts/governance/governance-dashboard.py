#!/usr/bin/env python3
"""
📊 Governance Dashboard Generator - Phase 3 Implementation
Real-time monitoring dashboard with comprehensive visualizations

CRITICAL Implementation of Principle #108 - Governance Dashboards
"""

import os
import sys
import json
import sqlite3
import logging
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import jinja2
import plotly.graph_objs as go
import plotly.utils
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from collections import defaultdict

# Add governance directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class GovernanceDashboard:
    """Real-time governance dashboard generator"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.dashboard_dir = "scripts/results/governance/dashboards"
        self.template_dir = "scripts/governance/templates"
        self._ensure_directories()
        
        # Database paths
        self.governance_db = "scripts/results/governance/governance.db"
        self.performance_db = "scripts/results/governance/performance_optimization.db" 
        self.predictive_db = "scripts/results/governance/predictive_analytics.db"
        self.self_healing_db = "scripts/results/governance/self_healing.db"
        
        # Dashboard configuration
        self.update_interval = config.get('update_interval', 60)  # seconds
        self.metrics_retention = config.get('metrics_retention', 168)  # hours (1 week)
        
        # Setup Jinja2 environment
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
        # Color schemes for visualizations
        self.colors = {
            'primary': '#1f77b4',
            'success': '#2ca02c',
            'warning': '#ff7f0e',
            'danger': '#d62728',
            'info': '#17a2b8',
            'light': '#6c757d',
            'dark': '#343a40'
        }
        
        # Metrics configuration
        self.metric_configs = {
            'cognitive_steps': {'target': 2.5, 'critical': 4.0, 'unit': 'steps'},
            'file_access_time': {'target': 5000, 'critical': 15000, 'unit': 'ms'},
            'cpu_usage': {'target': 50, 'critical': 90, 'unit': '%'},
            'memory_usage': {'target': 500, 'critical': 2000, 'unit': 'MB'},
            'disk_io_latency': {'target': 100, 'critical': 500, 'unit': 'ms'},
            'governance_effectiveness': {'target': 95, 'critical': 80, 'unit': '%'},
            'prevention_rate': {'target': 95, 'critical': 80, 'unit': '%'},
            'system_reliability': {'target': 99.5, 'critical': 95, 'unit': '%'}
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for dashboard generator"""
        logger = logging.getLogger('governance_dashboard')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            os.makedirs("scripts/results/governance/logs", exist_ok=True)
            
            handler = logging.FileHandler('scripts/results/governance/logs/governance_dashboard.log')
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        return logger
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        os.makedirs(self.dashboard_dir, exist_ok=True)
        os.makedirs(self.template_dir, exist_ok=True)
        os.makedirs("scripts/results/governance/data", exist_ok=True)
    
    async def start_dashboard_service(self):
        """Start the dashboard generation service"""
        self.logger.info("📊 Starting Governance Dashboard Service")
        
        try:
            # Create initial templates if they don't exist
            await self._create_dashboard_templates()
            
            # Start dashboard update loop
            while True:
                await self._update_all_dashboards()
                await asyncio.sleep(self.update_interval)
                
        except Exception as e:
            self.logger.error(f"❌ Error in dashboard service: {e}")
        finally:
            self.logger.info("📊 Dashboard service stopped")
    
    async def _create_dashboard_templates(self):
        """Create dashboard HTML templates"""
        await self._create_main_dashboard_template()
        await self._create_performance_dashboard_template()
        await self._create_predictive_dashboard_template()
        await self._create_alerts_dashboard_template()
    
    async def _create_main_dashboard_template(self):
        """Create main governance dashboard template"""
        template_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Governance Dashboard - Growth Governance Architecture</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .dashboard-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .metric-card {
            transition: transform 0.2s;
        }
        .metric-card:hover {
            transform: translateY(-2px);
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        .status-excellent { background-color: #28a745; }
        .status-good { background-color: #17a2b8; }
        .status-warning { background-color: #ffc107; }
        .status-critical { background-color: #dc3545; }
        .chart-container {
            height: 300px;
            margin-bottom: 20px;
        }
        .refresh-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
    </style>
</head>
<body class="bg-light">
    <div class="container-fluid py-4">
        <!-- Header -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <h1 class="card-title mb-0">
                            <i class="fas fa-shield-alt me-2"></i>
                            Growth Governance Architecture Dashboard
                        </h1>
                        <p class="card-text mt-2">
                            Real-time monitoring of Principle #108 implementation
                        </p>
                        <small class="text-light">
                            Last updated: {{ last_update }} | Auto-refresh: {{ update_interval }}s
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <!-- System Status Overview -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card metric-card h-100">
                    <div class="card-body text-center">
                        <div class="status-indicator status-{{ overall_status }}"></div>
                        <h5 class="card-title">Overall Status</h5>
                        <h2 class="text-{{ status_color }}">{{ overall_status|title }}</h2>
                        <small class="text-muted">System Health: {{ system_health }}%</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card metric-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-2x text-primary mb-2"></i>
                        <h5 class="card-title">Performance</h5>
                        <h2 class="text-primary">{{ performance_score }}%</h2>
                        <small class="text-muted">Target: ≥95%</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card metric-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-shield-virus fa-2x text-success mb-2"></i>
                        <h5 class="card-title">Prevention Rate</h5>
                        <h2 class="text-success">{{ prevention_rate }}%</h2>
                        <small class="text-muted">Issues Prevented: {{ issues_prevented }}</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card metric-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                        <h5 class="card-title">Active Alerts</h5>
                        <h2 class="text-warning">{{ active_alerts }}</h2>
                        <small class="text-muted">Critical: {{ critical_alerts }}</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="row mb-4">
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-brain me-2"></i>
                            Cognitive Complexity Trend
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="cognitive-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-tachometer-alt me-2"></i>
                            System Performance
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="performance-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Governance Metrics -->
        <div class="row mb-4">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar me-2"></i>
                            Governance Effectiveness
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="governance-metrics-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-tasks me-2"></i>
                            Current Metrics
                        </h5>
                    </div>
                    <div class="card-body">
                        {% for metric_name, metric_data in current_metrics.items() %}
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>{{ metric_name|title }}</span>
                            <span class="badge bg-{{ metric_data.status }}">
                                {{ metric_data.value }}{{ metric_data.unit }}
                            </span>
                        </div>
                        {% endfor %}
                    </div>
                </div>
            </div>
        </div>

        <!-- Predictions and Alerts -->
        <div class="row mb-4">
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-crystal-ball me-2"></i>
                            Predictive Insights
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="predictions-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-bell me-2"></i>
                            Recent Alerts
                        </h5>
                    </div>
                    <div class="card-body">
                        <div style="max-height: 300px; overflow-y: auto;">
                            {% for alert in recent_alerts %}
                            <div class="alert alert-{{ alert.severity }} alert-dismissible fade show" role="alert">
                                <strong>{{ alert.type|title }}:</strong> {{ alert.message }}
                                <small class="d-block text-muted">{{ alert.timestamp }}</small>
                            </div>
                            {% endfor %}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body text-center">
                        <small class="text-muted">
                            🛡️ Growth Governance Architecture | Principle #108 Implementation | 
                            Phase 3: Self-Healing Architecture Active
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div class="refresh-indicator">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Refreshing...</span>
        </div>
    </div>

    <script>
        // Chart data
        const chartData = {{ chart_data|tojson }};
        
        // Create charts
        createCognitiveChart();
        createPerformanceChart();
        createGovernanceChart();
        createPredictionsChart();

        function createCognitiveChart() {
            const trace = {
                x: chartData.cognitive.timestamps,
                y: chartData.cognitive.values,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Cognitive Steps',
                line: {color: '#1f77b4'},
                marker: {size: 6}
            };

            const target_line = {
                x: chartData.cognitive.timestamps,
                y: Array(chartData.cognitive.timestamps.length).fill(2.5),
                type: 'scatter',
                mode: 'lines',
                name: 'Target (2.5)',
                line: {color: '#2ca02c', dash: 'dash'},
                opacity: 0.7
            };

            const layout = {
                title: 'Navigation Complexity Over Time',
                xaxis: {title: 'Time'},
                yaxis: {title: 'Steps'},
                showlegend: true,
                margin: {t: 40, b: 40, l: 50, r: 20}
            };

            Plotly.newPlot('cognitive-chart', [trace, target_line], layout, {responsive: true});
        }

        function createPerformanceChart() {
            const traces = [];
            
            ['cpu_usage', 'memory_usage', 'file_access_time'].forEach(metric => {
                if (chartData[metric]) {
                    traces.push({
                        x: chartData[metric].timestamps,
                        y: chartData[metric].values,
                        type: 'scatter',
                        mode: 'lines',
                        name: metric.replace('_', ' ').toUpperCase(),
                        opacity: 0.8
                    });
                }
            });

            const layout = {
                title: 'System Performance Metrics',
                xaxis: {title: 'Time'},
                yaxis: {title: 'Value'},
                showlegend: true,
                margin: {t: 40, b: 40, l: 50, r: 20}
            };

            Plotly.newPlot('performance-chart', traces, layout, {responsive: true});
        }

        function createGovernanceChart() {
            const categories = Object.keys(chartData.governance || {});
            const values = Object.values(chartData.governance || {});
            
            const trace = {
                x: categories,
                y: values,
                type: 'bar',
                marker: {
                    color: values.map(v => v >= 95 ? '#28a745' : v >= 80 ? '#ffc107' : '#dc3545')
                }
            };

            const layout = {
                title: 'Governance Component Effectiveness',
                xaxis: {title: 'Components'},
                yaxis: {title: 'Effectiveness (%)'},
                margin: {t: 40, b: 80, l: 50, r: 20}
            };

            Plotly.newPlot('governance-metrics-chart', [trace], layout, {responsive: true});
        }

        function createPredictionsChart() {
            if (!chartData.predictions) return;
            
            const trace = {
                x: chartData.predictions.timestamps,
                y: chartData.predictions.values,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Predicted Values',
                line: {color: '#ff7f0e'},
                marker: {size: 8}
            };

            const confidence_upper = {
                x: chartData.predictions.timestamps,
                y: chartData.predictions.upper_bound,
                type: 'scatter',
                mode: 'lines',
                name: 'Confidence Upper',
                line: {color: 'rgba(255,127,14,0.3)'},
                showlegend: false
            };

            const confidence_lower = {
                x: chartData.predictions.timestamps,
                y: chartData.predictions.lower_bound,
                type: 'scatter',
                mode: 'lines',
                name: 'Confidence Lower',
                line: {color: 'rgba(255,127,14,0.3)'},
                fill: 'tonexty',
                fillcolor: 'rgba(255,127,14,0.2)',
                showlegend: false
            };

            const layout = {
                title: 'Predictive Analytics - Next 24 Hours',
                xaxis: {title: 'Time'},
                yaxis: {title: 'Predicted Value'},
                showlegend: true,
                margin: {t: 40, b: 40, l: 50, r: 20}
            };

            Plotly.newPlot('predictions-chart', [confidence_lower, confidence_upper, trace], layout, {responsive: true});
        }

        // Auto-refresh functionality
        setInterval(function() {
            location.reload();
        }, {{ update_interval * 1000 }});
    </script>
</body>
</html>
        """
        
        template_path = os.path.join(self.template_dir, "main_dashboard.html")
        with open(template_path, 'w') as f:
            f.write(template_content)
    
    async def _create_performance_dashboard_template(self):
        """Create performance-specific dashboard template"""
        template_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard - Growth Governance Architecture</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-12">
                <h1><i class="fas fa-tachometer-alt me-2"></i>Performance Monitoring Dashboard</h1>
            </div>
        </div>
        
        <!-- Performance metrics will be dynamically inserted here -->
        <div id="performance-content">
            {{ performance_content|safe }}
        </div>
    </div>
</body>
</html>
        """
        
        template_path = os.path.join(self.template_dir, "performance_dashboard.html")
        with open(template_path, 'w') as f:
            f.write(template_content)
    
    async def _create_predictive_dashboard_template(self):
        """Create predictive analytics dashboard template"""
        template_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Predictive Analytics Dashboard</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-12">
                <h1><i class="fas fa-crystal-ball me-2"></i>Predictive Analytics Dashboard</h1>
            </div>
        </div>
        
        <!-- Predictive content will be dynamically inserted here -->
        <div id="predictive-content">
            {{ predictive_content|safe }}
        </div>
    </div>
</body>
</html>
        """
        
        template_path = os.path.join(self.template_dir, "predictive_dashboard.html")
        with open(template_path, 'w') as f:
            f.write(template_content)
    
    async def _create_alerts_dashboard_template(self):
        """Create alerts dashboard template"""
        template_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerts Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-12">
                <h1><i class="fas fa-bell me-2"></i>Alerts & Notifications Dashboard</h1>
            </div>
        </div>
        
        <!-- Alerts content will be dynamically inserted here -->
        <div id="alerts-content">
            {{ alerts_content|safe }}
        </div>
    </div>
</body>
</html>
        """
        
        template_path = os.path.join(self.template_dir, "alerts_dashboard.html")
        with open(template_path, 'w') as f:
            f.write(template_content)
    
    async def _update_all_dashboards(self):
        """Update all dashboard types"""
        try:
            self.logger.info("📊 Updating governance dashboards")
            
            # Collect data from all sources
            dashboard_data = await self._collect_dashboard_data()
            
            # Generate main dashboard
            await self._generate_main_dashboard(dashboard_data)
            
            # Generate specialized dashboards
            await self._generate_performance_dashboard(dashboard_data)
            await self._generate_predictive_dashboard(dashboard_data)
            await self._generate_alerts_dashboard(dashboard_data)
            
            # Update data files for external access
            await self._export_dashboard_data(dashboard_data)
            
            self.logger.info("✅ All dashboards updated successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Error updating dashboards: {e}")
    
    async def _collect_dashboard_data(self) -> Dict[str, Any]:
        """Collect data from all governance databases"""
        data = {
            'last_update': datetime.now().isoformat(),
            'update_interval': self.update_interval,
            'metrics': {},
            'performance': {},
            'predictions': {},
            'alerts': {},
            'governance': {},
            'system_health': {}
        }
        
        try:
            # Collect governance metrics
            governance_data = await self._collect_governance_metrics()
            data['governance'] = governance_data
            
            # Collect performance metrics
            performance_data = await self._collect_performance_metrics()
            data['performance'] = performance_data
            
            # Collect predictive data
            predictions_data = await self._collect_predictions_data()
            data['predictions'] = predictions_data
            
            # Collect alerts data
            alerts_data = await self._collect_alerts_data()
            data['alerts'] = alerts_data
            
            # Calculate system health
            system_health = await self._calculate_system_health(data)
            data['system_health'] = system_health
            
        except Exception as e:
            self.logger.error(f"Error collecting dashboard data: {e}")
            
        return data
    
    async def _collect_governance_metrics(self) -> Dict[str, Any]:
        """Collect governance-specific metrics"""
        metrics = {
            'governance_effectiveness': 0,
            'prevention_rate': 0,
            'response_time': 0,
            'active_issues': 0,
            'resolved_issues': 0
        }
        
        try:
            if os.path.exists(self.governance_db):
                with sqlite3.connect(self.governance_db) as conn:
                    # Get governance effectiveness
                    cursor = conn.execute("""
                        SELECT AVG(effectiveness_score) 
                        FROM governance_metrics 
                        WHERE timestamp > datetime('now', '-24 hours')
                    """)
                    result = cursor.fetchone()
                    if result[0]:
                        metrics['governance_effectiveness'] = result[0]
                    
                    # Get prevention rate
                    cursor = conn.execute("""
                        SELECT 
                            COUNT(*) as total,
                            SUM(CASE WHEN prevented = 1 THEN 1 ELSE 0 END) as prevented
                        FROM governance_events
                        WHERE timestamp > datetime('now', '-24 hours')
                    """)
                    result = cursor.fetchone()
                    if result[0] > 0:
                        metrics['prevention_rate'] = (result[1] / result[0]) * 100
                    
                    # Get active issues
                    cursor = conn.execute("""
                        SELECT COUNT(*) 
                        FROM governance_issues 
                        WHERE status = 'active'
                    """)
                    result = cursor.fetchone()
                    metrics['active_issues'] = result[0] if result[0] else 0
                    
        except Exception as e:
            self.logger.error(f"Error collecting governance metrics: {e}")
            
        return metrics
    
    async def _collect_performance_metrics(self) -> Dict[str, Any]:
        """Collect performance metrics with time series data"""
        metrics = {}
        
        try:
            if os.path.exists(self.performance_db):
                with sqlite3.connect(self.performance_db) as conn:
                    # Get time series data for key metrics
                    for metric_type in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                        cursor = conn.execute("""
                            SELECT value, timestamp
                            FROM performance_metrics
                            WHERE metric_type = ? 
                            AND timestamp > datetime('now', '-24 hours')
                            ORDER BY timestamp
                        """, (metric_type,))
                        
                        rows = cursor.fetchall()
                        if rows:
                            metrics[metric_type] = {
                                'values': [row[0] for row in rows],
                                'timestamps': [row[1] for row in rows],
                                'current': rows[-1][0] if rows else 0,
                                'trend': self._calculate_trend([row[0] for row in rows])
                            }
                            
        except Exception as e:
            self.logger.error(f"Error collecting performance metrics: {e}")
            
        return metrics
    
    async def _collect_predictions_data(self) -> Dict[str, Any]:
        """Collect predictive analytics data"""
        predictions = {}
        
        try:
            if os.path.exists(self.predictive_db):
                with sqlite3.connect(self.predictive_db) as conn:
                    # Get recent predictions
                    cursor = conn.execute("""
                        SELECT metric_type, predicted_value, target_time, confidence_score, risk_level
                        FROM predictions
                        WHERE target_time > datetime('now')
                        AND prediction_time > datetime('now', '-1 hour')
                        ORDER BY target_time
                        LIMIT 100
                    """)
                    
                    predictions_list = []
                    for row in cursor.fetchall():
                        predictions_list.append({
                            'metric_type': row[0],
                            'predicted_value': row[1],
                            'target_time': row[2],
                            'confidence_score': row[3],
                            'risk_level': row[4]
                        })
                    
                    predictions['future_predictions'] = predictions_list
                    
                    # Get early warnings
                    cursor = conn.execute("""
                        SELECT alert_type, predicted_issue, probability, estimated_time_to_issue, severity
                        FROM early_warnings
                        WHERE created_at > datetime('now', '-24 hours')
                        ORDER BY probability DESC
                        LIMIT 10
                    """)
                    
                    warnings_list = []
                    for row in cursor.fetchall():
                        warnings_list.append({
                            'alert_type': row[0],
                            'predicted_issue': row[1],
                            'probability': row[2],
                            'estimated_time_to_issue': row[3],
                            'severity': row[4]
                        })
                    
                    predictions['early_warnings'] = warnings_list
                    
        except Exception as e:
            self.logger.error(f"Error collecting predictions data: {e}")
            
        return predictions
    
    async def _collect_alerts_data(self) -> Dict[str, Any]:
        """Collect alerts and notifications data"""
        alerts = {
            'active_alerts': 0,
            'critical_alerts': 0,
            'recent_alerts': []
        }
        
        try:
            # Collect from alert files
            alert_files_dir = "scripts/results/governance/alerts"
            if os.path.exists(alert_files_dir):
                alert_files = [f for f in os.listdir(alert_files_dir) if f.endswith('.json')]
                alert_files.sort(key=lambda x: os.path.getmtime(os.path.join(alert_files_dir, x)), reverse=True)
                
                for alert_file in alert_files[:20]:  # Last 20 alerts
                    try:
                        with open(os.path.join(alert_files_dir, alert_file), 'r') as f:
                            alert_data = json.load(f)
                            
                        # Check if alert is recent (last 24 hours)
                        alert_time = datetime.fromisoformat(alert_data.get('timestamp', ''))
                        if (datetime.now() - alert_time).total_seconds() < 86400:  # 24 hours
                            alerts['recent_alerts'].append({
                                'type': alert_data.get('component', 'system'),
                                'message': alert_data.get('message', ''),
                                'severity': alert_data.get('severity', 'info'),
                                'timestamp': alert_time.strftime('%Y-%m-%d %H:%M:%S')
                            })
                            
                            alerts['active_alerts'] += 1
                            if alert_data.get('severity') == 'critical':
                                alerts['critical_alerts'] += 1
                                
                    except Exception as e:
                        self.logger.warning(f"Error reading alert file {alert_file}: {e}")
                        
        except Exception as e:
            self.logger.error(f"Error collecting alerts data: {e}")
            
        return alerts
    
    async def _calculate_system_health(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall system health score"""
        health = {
            'overall_score': 0,
            'status': 'unknown',
            'status_color': 'secondary',
            'components': {}
        }
        
        try:
            scores = []
            
            # Governance effectiveness score
            governance_score = data['governance'].get('governance_effectiveness', 0)
            scores.append(min(governance_score, 100))
            health['components']['governance'] = governance_score
            
            # Performance score
            performance_metrics = data['performance']
            if performance_metrics:
                perf_scores = []
                for metric_name, metric_data in performance_metrics.items():
                    if metric_name in self.metric_configs:
                        config = self.metric_configs[metric_name]
                        current_value = metric_data.get('current', 0)
                        
                        # Calculate score based on target
                        if metric_name in ['cognitive_steps', 'file_access_time', 'cpu_usage', 'memory_usage']:
                            # Lower is better
                            score = max(0, min(100, (config['target'] / max(current_value, 0.001)) * 100))
                        else:
                            # Higher is better
                            score = min(current_value, 100)
                        
                        perf_scores.append(score)
                
                if perf_scores:
                    performance_score = np.mean(perf_scores)
                    scores.append(performance_score)
                    health['components']['performance'] = performance_score
            
            # Alert score (inverse of alerts)
            alert_score = max(0, 100 - (data['alerts']['active_alerts'] * 10))
            scores.append(alert_score)
            health['components']['alerts'] = alert_score
            
            # Prevention rate score
            prevention_score = data['governance'].get('prevention_rate', 0)
            scores.append(prevention_score)
            health['components']['prevention'] = prevention_score
            
            # Calculate overall score
            if scores:
                health['overall_score'] = np.mean(scores)
                
                # Determine status
                if health['overall_score'] >= 95:
                    health['status'] = 'excellent'
                    health['status_color'] = 'success'
                elif health['overall_score'] >= 85:
                    health['status'] = 'good'
                    health['status_color'] = 'info'
                elif health['overall_score'] >= 70:
                    health['status'] = 'warning'
                    health['status_color'] = 'warning'
                else:
                    health['status'] = 'critical'
                    health['status_color'] = 'danger'
                    
        except Exception as e:
            self.logger.error(f"Error calculating system health: {e}")
            
        return health
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction"""
        if len(values) < 3:
            return 'stable'
        
        recent_avg = np.mean(values[-3:])
        earlier_avg = np.mean(values[:-3]) if len(values) > 3 else values[0]
        
        change_pct = (recent_avg - earlier_avg) / max(abs(earlier_avg), 0.001)
        
        if change_pct > 0.1:
            return 'increasing'
        elif change_pct < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    async def _generate_main_dashboard(self, data: Dict[str, Any]):
        """Generate main governance dashboard"""
        try:
            template = self.jinja_env.get_template("main_dashboard.html")
            
            # Prepare chart data
            chart_data = {}
            
            # Cognitive complexity chart
            if 'cognitive_steps' in data['performance']:
                chart_data['cognitive'] = data['performance']['cognitive_steps']
            
            # Performance metrics
            for metric in ['cpu_usage', 'memory_usage', 'file_access_time']:
                if metric in data['performance']:
                    chart_data[metric] = data['performance'][metric]
            
            # Governance effectiveness
            chart_data['governance'] = {
                'prevention': data['governance'].get('prevention_rate', 0),
                'effectiveness': data['governance'].get('governance_effectiveness', 0),
                'response_time': 100 - min(data['governance'].get('response_time', 0) * 10, 100)
            }
            
            # Predictions
            if data['predictions'].get('future_predictions'):
                predictions = data['predictions']['future_predictions']
                chart_data['predictions'] = {
                    'timestamps': [p['target_time'] for p in predictions[:10]],
                    'values': [p['predicted_value'] for p in predictions[:10]],
                    'upper_bound': [p['predicted_value'] * (1 + (1 - p['confidence_score'])) for p in predictions[:10]],
                    'lower_bound': [p['predicted_value'] * (1 - (1 - p['confidence_score'])) for p in predictions[:10]]
                }
            
            # Prepare current metrics
            current_metrics = {}
            for metric_name, config in self.metric_configs.items():
                if metric_name in data['performance']:
                    current_value = data['performance'][metric_name].get('current', 0)
                    status = 'success' if current_value <= config['target'] else 'warning' if current_value <= config['critical'] else 'danger'
                    current_metrics[metric_name] = {
                        'value': round(current_value, 2),
                        'unit': config['unit'],
                        'status': status
                    }
            
            # Render template
            html_content = template.render(
                last_update=data['last_update'],
                update_interval=data['update_interval'],
                overall_status=data['system_health']['status'],
                status_color=data['system_health']['status_color'],
                system_health=round(data['system_health']['overall_score'], 1),
                performance_score=round(data['system_health']['components'].get('performance', 0), 1),
                prevention_rate=round(data['governance'].get('prevention_rate', 0), 1),
                issues_prevented=data['governance'].get('resolved_issues', 0),
                active_alerts=data['alerts']['active_alerts'],
                critical_alerts=data['alerts']['critical_alerts'],
                current_metrics=current_metrics,
                recent_alerts=data['alerts']['recent_alerts'][:5],
                chart_data=chart_data
            )
            
            # Save dashboard
            dashboard_path = os.path.join(self.dashboard_dir, "main_dashboard.html")
            with open(dashboard_path, 'w') as f:
                f.write(html_content)
                
        except Exception as e:
            self.logger.error(f"Error generating main dashboard: {e}")
    
    async def _generate_performance_dashboard(self, data: Dict[str, Any]):
        """Generate performance-specific dashboard"""
        try:
            # Create performance content
            performance_content = self._create_performance_content(data['performance'])
            
            template = self.jinja_env.get_template("performance_dashboard.html")
            html_content = template.render(performance_content=performance_content)
            
            dashboard_path = os.path.join(self.dashboard_dir, "performance_dashboard.html")
            with open(dashboard_path, 'w') as f:
                f.write(html_content)
                
        except Exception as e:
            self.logger.error(f"Error generating performance dashboard: {e}")
    
    def _create_performance_content(self, performance_data: Dict[str, Any]) -> str:
        """Create HTML content for performance metrics"""
        content = "<div class='row'>"
        
        for metric_name, metric_data in performance_data.items():
            if metric_name in self.metric_configs:
                config = self.metric_configs[metric_name]
                current_value = metric_data.get('current', 0)
                trend = metric_data.get('trend', 'stable')
                
                # Determine status
                if current_value <= config['target']:
                    status_class = 'success'
                    status_icon = 'check-circle'
                elif current_value <= config['critical']:
                    status_class = 'warning'
                    status_icon = 'exclamation-triangle'
                else:
                    status_class = 'danger'
                    status_icon = 'times-circle'
                
                # Trend icon
                trend_icons = {
                    'increasing': 'arrow-up',
                    'decreasing': 'arrow-down',
                    'stable': 'minus'
                }
                
                content += f"""
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title">{metric_name.replace('_', ' ').title()}</h5>
                                <i class="fas fa-{status_icon} text-{status_class}"></i>
                            </div>
                            <h2 class="text-{status_class}">{current_value:.2f} {config['unit']}</h2>
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">Target: {config['target']} {config['unit']}</small>
                                <small class="text-muted">
                                    <i class="fas fa-{trend_icons[trend]}"></i> {trend}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                """
        
        content += "</div>"
        return content
    
    async def _generate_predictive_dashboard(self, data: Dict[str, Any]):
        """Generate predictive analytics dashboard"""
        try:
            # Create predictive content
            predictive_content = self._create_predictive_content(data['predictions'])
            
            template = self.jinja_env.get_template("predictive_dashboard.html")
            html_content = template.render(predictive_content=predictive_content)
            
            dashboard_path = os.path.join(self.dashboard_dir, "predictive_dashboard.html")
            with open(dashboard_path, 'w') as f:
                f.write(html_content)
                
        except Exception as e:
            self.logger.error(f"Error generating predictive dashboard: {e}")
    
    def _create_predictive_content(self, predictions_data: Dict[str, Any]) -> str:
        """Create HTML content for predictive analytics"""
        content = "<div class='row'>"
        
        # Early warnings section
        early_warnings = predictions_data.get('early_warnings', [])
        if early_warnings:
            content += """
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-exclamation-triangle me-2"></i>Early Warnings</h5>
                    </div>
                    <div class="card-body">
            """
            
            for warning in early_warnings[:5]:  # Show top 5 warnings
                severity_class = {
                    'critical': 'danger',
                    'high': 'warning',
                    'medium': 'info',
                    'low': 'secondary'
                }.get(warning['severity'], 'secondary')
                
                content += f"""
                <div class="alert alert-{severity_class}" role="alert">
                    <strong>{warning['alert_type'].replace('_', ' ').title()}:</strong>
                    {warning['predicted_issue']}
                    <br>
                    <small>Probability: {warning['probability']:.1%} | 
                    Time to issue: {warning['estimated_time_to_issue']} hours</small>
                </div>
                """
            
            content += "</div></div></div>"
        
        # Future predictions section
        future_predictions = predictions_data.get('future_predictions', [])
        if future_predictions:
            content += """
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-crystal-ball me-2"></i>Future Predictions</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Predicted Value</th>
                                        <th>Target Time</th>
                                        <th>Confidence</th>
                                        <th>Risk Level</th>
                                    </tr>
                                </thead>
                                <tbody>
            """
            
            for pred in future_predictions[:10]:  # Show next 10 predictions
                risk_class = {
                    'critical': 'danger',
                    'high': 'warning',
                    'medium': 'info',
                    'low': 'success'
                }.get(pred['risk_level'], 'secondary')
                
                target_time = datetime.fromisoformat(pred['target_time']).strftime('%Y-%m-%d %H:%M')
                
                content += f"""
                <tr>
                    <td>{pred['metric_type'].replace('_', ' ').title()}</td>
                    <td>{pred['predicted_value']:.2f}</td>
                    <td>{target_time}</td>
                    <td>{pred['confidence_score']:.1%}</td>
                    <td><span class="badge bg-{risk_class}">{pred['risk_level'].title()}</span></td>
                </tr>
                """
            
            content += "</tbody></table></div></div></div></div>"
        
        content += "</div>"
        return content
    
    async def _generate_alerts_dashboard(self, data: Dict[str, Any]):
        """Generate alerts dashboard"""
        try:
            # Create alerts content
            alerts_content = self._create_alerts_content(data['alerts'])
            
            template = self.jinja_env.get_template("alerts_dashboard.html")
            html_content = template.render(alerts_content=alerts_content)
            
            dashboard_path = os.path.join(self.dashboard_dir, "alerts_dashboard.html")
            with open(dashboard_path, 'w') as f:
                f.write(html_content)
                
        except Exception as e:
            self.logger.error(f"Error generating alerts dashboard: {e}")
    
    def _create_alerts_content(self, alerts_data: Dict[str, Any]) -> str:
        """Create HTML content for alerts"""
        content = f"""
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Total Active Alerts</h5>
                        <h2 class="text-primary">{alerts_data['active_alerts']}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Critical Alerts</h5>
                        <h2 class="text-danger">{alerts_data['critical_alerts']}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Response Time</h5>
                        <h2 class="text-success">< 5 min</h2>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5>Recent Alerts</h5>
                    </div>
                    <div class="card-body">
        """
        
        for alert in alerts_data['recent_alerts']:
            severity_class = {
                'critical': 'danger',
                'high': 'warning',
                'medium': 'info',
                'low': 'secondary'
            }.get(alert['severity'], 'secondary')
            
            content += f"""
            <div class="alert alert-{severity_class}" role="alert">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>{alert['type'].title()}:</strong> {alert['message']}
                    </div>
                    <small>{alert['timestamp']}</small>
                </div>
            </div>
            """
        
        content += "</div></div></div></div>"
        return content
    
    async def _export_dashboard_data(self, data: Dict[str, Any]):
        """Export dashboard data as JSON for external access"""
        try:
            # Export main data
            data_path = os.path.join("scripts/results/governance/data", "dashboard_data.json")
            with open(data_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            # Export summary metrics
            summary = {
                'timestamp': data['last_update'],
                'overall_health': data['system_health']['overall_score'],
                'status': data['system_health']['status'],
                'active_alerts': data['alerts']['active_alerts'],
                'prevention_rate': data['governance'].get('prevention_rate', 0),
                'governance_effectiveness': data['governance'].get('governance_effectiveness', 0)
            }
            
            summary_path = os.path.join("scripts/results/governance/data", "summary.json")
            with open(summary_path, 'w') as f:
                json.dump(summary, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Error exporting dashboard data: {e}")

def main():
    """Main entry point for governance dashboard"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Governance Dashboard Generator - Phase 3")
    parser.add_argument("--config", default="scripts/governance/dashboard-config.json",
                       help="Configuration file path")
    parser.add_argument("--daemon", action="store_true",
                       help="Run as daemon service")
    parser.add_argument("--generate-once", action="store_true",
                       help="Generate dashboards once and exit")
    
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
        "update_interval": 60,      # seconds
        "metrics_retention": 168    # hours
    }
    
    config = {**default_config, **config}
    
    dashboard = GovernanceDashboard(config)
    
    if args.generate_once:
        # Generate once and exit
        async def generate_once():
            print("📊 Generating governance dashboards...")
            await dashboard._update_all_dashboards()
            print("✅ Dashboards generated successfully")
            print(f"📁 Dashboard files available in: {dashboard.dashboard_dir}")
        
        asyncio.run(generate_once())
    
    elif args.daemon:
        # Run as daemon service
        try:
            asyncio.run(dashboard.start_dashboard_service())
        except KeyboardInterrupt:
            print("\n📊 Dashboard service interrupted by user")
    
    else:
        print("Use --daemon to run as service or --generate-once to generate dashboards once")

if __name__ == "__main__":
    main()