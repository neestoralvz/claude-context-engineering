#!/usr/bin/env python3
"""
📊 Simple Governance Dashboard - Phase 3 Implementation
Real-time monitoring dashboard with basic HTML visualizations

CRITICAL Implementation of Principle #108 - Governance Dashboards
"""

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

class SimpleGovernanceDashboard:
    """Simple HTML governance dashboard generator"""
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.dashboard_dir = "scripts/results/governance/dashboards"
        self._ensure_directories()
        
        # Database paths
        self.governance_db = "scripts/results/governance/governance.db"
        self.performance_db = "scripts/results/governance/performance.db" 
        self.metrics_db = "scripts/results/governance/metrics.db"
        
    def _setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        Path(self.dashboard_dir).mkdir(parents=True, exist_ok=True)
    
    def generate_dashboard(self) -> str:
        """Generate complete governance dashboard"""
        self.logger.info("🔄 Generating governance dashboard...")
        
        # Get current system metrics
        metrics = self._get_system_metrics()
        
        # Generate HTML dashboard
        dashboard_html = self._generate_html_dashboard(metrics)
        
        # Save dashboard
        dashboard_path = os.path.join(self.dashboard_dir, f"governance_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")
        with open(dashboard_path, 'w') as f:
            f.write(dashboard_html)
        
        self.logger.info(f"✅ Dashboard generated: {dashboard_path}")
        return dashboard_path
    
    def _get_system_metrics(self) -> Dict[str, Any]:
        """Retrieve current system metrics"""
        metrics = {
            'timestamp': datetime.now(),
            'component_health': {},
            'governance_stats': {},
            'performance_stats': {},
            'system_status': 'OPERATIONAL'
        }
        
        try:
            # Check databases exist and get basic stats
            for db_name, db_path in [
                ('governance', self.governance_db),
                ('performance', self.performance_db),
                ('metrics', self.metrics_db)
            ]:
                if os.path.exists(db_path):
                    metrics['component_health'][db_name] = 'ACTIVE'
                    metrics['governance_stats'][f'{db_name}_size'] = os.path.getsize(db_path)
                else:
                    metrics['component_health'][db_name] = 'INACTIVE'
            
            # Calculate overall health score
            active_components = sum(1 for status in metrics['component_health'].values() if status == 'ACTIVE')
            total_components = len(metrics['component_health'])
            metrics['overall_health'] = (active_components / total_components) * 100 if total_components > 0 else 0
            
        except Exception as e:
            self.logger.error(f"Error getting system metrics: {e}")
            metrics['system_status'] = 'ERROR'
        
        return metrics
    
    def _generate_html_dashboard(self, metrics: Dict[str, Any]) -> str:
        """Generate HTML dashboard"""
        # Prepare template variables first
        system_status_class = metrics['system_status'].lower()
        active_components = sum(1 for status in metrics['component_health'].values() if status == 'ACTIVE')
        total_components = len(metrics['component_health'])
        
        # Generate component status HTML
        component_status_html = ""
        for component, status in metrics['component_health'].items():
            status_class = 'status-active' if status == 'ACTIVE' else 'status-inactive'
            component_status_html += f'<li class="component-item"><span>{component}</span><span class="{status_class}">{status}</span></li>'
        
        # Generate governance stats HTML
        governance_stats_html = ""
        for stat, value in metrics['governance_stats'].items():
            if isinstance(value, int):
                value_str = f"{value:,} bytes" if 'size' in stat else str(value)
            else:
                value_str = str(value)
            governance_stats_html += f'<li class="component-item"><span>{stat}</span><span>{value_str}</span></li>'
        
        # Create dashboard HTML
        dashboard_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Growth Governance Dashboard</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
        .metrics-container {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }}
        .metric-card {{ background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .metric-title {{ font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #667eea; }}
        .status-operational {{ color: #28a745; }}
        .status-error {{ color: #dc3545; }}
        .status-active {{ color: #28a745; }}
        .status-inactive {{ color: #dc3545; }}
        .component-list {{ list-style: none; padding: 0; }}
        .component-item {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }}
        .health-bar {{ width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }}
        .health-fill {{ height: 100%; background: linear-gradient(90deg, #28a745 0%, #ffc107 70%, #dc3545 100%); border-radius: 10px; transition: width 0.3s ease; }}
        .timestamp {{ text-align: center; color: #666; margin-top: 20px; font-style: italic; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ Growth Governance Dashboard</h1>
        <p>Real-time monitoring of Growth Governance Architecture - Principle #108 Implementation</p>
    </div>
    
    <div class="metrics-container">
        <div class="metric-card">
            <div class="metric-title">System Status</div>
            <div class="metric-value status-{system_status_class}">{metrics['system_status']}</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Overall Health Score</div>
            <div class="metric-value">{metrics['overall_health']:.1f}%</div>
            <div class="health-bar">
                <div class="health-fill" style="width: {metrics['overall_health']}%"></div>
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Active Components</div>
            <div class="metric-value">{active_components}/{total_components}</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Component Status</div>
            <ul class="component-list">
                {component_status_html}
            </ul>
        </div>
    </div>
    
    <div class="metric-card">
        <div class="metric-title">📊 Governance Statistics</div>
        <ul class="component-list">
            {governance_stats_html}
        </ul>
    </div>
    
    <div class="timestamp">
        Last Updated: {metrics['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}
    </div>
    
    <script>
        setTimeout(function() {{ location.reload(); }}, 60000);
    </script>
</body>
</html>'''
        
        return dashboard_html

def main():
    """Main execution function"""
    dashboard = SimpleGovernanceDashboard()
    dashboard_path = dashboard.generate_dashboard()
    print(f"✅ Dashboard generated: {dashboard_path}")

if __name__ == "__main__":
    main()