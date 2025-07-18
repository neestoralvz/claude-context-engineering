#!/usr/bin/env python3
"""
Compliance Alerting System - Context Engineering
Real-time violation detection and automated notification system
MANDATORY: ≤5 second response time for critical violations
"""

import json
import sqlite3
import time
import threading
import os
import sys
import logging
import smtplib
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from email.mime.text import MIMEText as MimeText
from email.mime.multipart import MIMEMultipart as MimeMultipart
from pathlib import Path
import requests
# import websocket  # Optional dependency
# import schedule  # Optional dependency

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
MONITORING_INTERVAL = 2  # seconds
ALERT_THRESHOLD = 3  # violations before escalation
MAX_DETECTION_TIME = 5  # seconds
DASHBOARD_URL = "ws://localhost:3001"
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
EMAIL_SMTP_SERVER = os.getenv("EMAIL_SMTP_SERVER", "smtp.gmail.com")
EMAIL_SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_TO = os.getenv("EMAIL_TO", "")

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(PROJECT_ROOT / 'scripts/results/compliance/alerting-system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ComplianceAlert:
    """Data class for compliance alerts"""
    timestamp: datetime
    violation_type: str
    severity: str
    message: str
    details: Dict[str, Any]
    response_time_ms: int
    auto_remediation: bool = False
    resolved: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'violation_type': self.violation_type,
            'severity': self.severity,
            'message': self.message,
            'details': self.details,
            'response_time_ms': self.response_time_ms,
            'auto_remediation': self.auto_remediation,
            'resolved': self.resolved
        }

@dataclass
class ComplianceMetric:
    """Data class for compliance metrics"""
    timestamp: datetime
    metric_type: str
    metric_value: float
    threshold_value: float
    is_compliant: bool
    details: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'metric_type': self.metric_type,
            'metric_value': self.metric_value,
            'threshold_value': self.threshold_value,
            'is_compliant': self.is_compliant,
            'details': self.details
        }

class ComplianceDatabase:
    """Database manager for compliance monitoring"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS compliance_alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    violation_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    details TEXT,
                    response_time_ms INTEGER,
                    auto_remediation BOOLEAN DEFAULT FALSE,
                    resolved BOOLEAN DEFAULT FALSE
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS compliance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metric_type TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    threshold_value REAL NOT NULL,
                    is_compliant BOOLEAN NOT NULL,
                    details TEXT
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS alert_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    alert_type TEXT NOT NULL,
                    recipient TEXT NOT NULL,
                    status TEXT NOT NULL,
                    response_time_ms INTEGER,
                    error_message TEXT
                )
            ''')
            
            # Create indexes for performance
            conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON compliance_alerts(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON compliance_metrics(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_type ON compliance_alerts(violation_type)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_metrics_type ON compliance_metrics(metric_type)')
    
    def insert_alert(self, alert: ComplianceAlert) -> int:
        """Insert new alert into database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO compliance_alerts 
                (timestamp, violation_type, severity, message, details, response_time_ms, auto_remediation, resolved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                alert.timestamp,
                alert.violation_type,
                alert.severity,
                alert.message,
                json.dumps(alert.details),
                alert.response_time_ms,
                alert.auto_remediation,
                alert.resolved
            ))
            return cursor.lastrowid
    
    def insert_metric(self, metric: ComplianceMetric) -> int:
        """Insert new metric into database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO compliance_metrics 
                (timestamp, metric_type, metric_value, threshold_value, is_compliant, details)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                metric.timestamp,
                metric.metric_type,
                metric.metric_value,
                metric.threshold_value,
                metric.is_compliant,
                metric.details
            ))
            return cursor.lastrowid
    
    def get_unresolved_alerts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get unresolved alerts"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM compliance_alerts 
                WHERE resolved = FALSE 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_recent_metrics(self, minutes: int = 60) -> List[Dict[str, Any]]:
        """Get recent metrics"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM compliance_metrics 
                WHERE timestamp > ? 
                ORDER BY timestamp DESC
            ''', (cutoff_time,))
            return [dict(row) for row in cursor.fetchall()]
    
    def mark_alert_resolved(self, alert_id: int):
        """Mark alert as resolved"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE compliance_alerts 
                SET resolved = TRUE 
                WHERE id = ?
            ''', (alert_id,))
    
    def log_alert_notification(self, alert_type: str, recipient: str, status: str, response_time_ms: int, error_message: str = None):
        """Log alert notification attempt"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO alert_history 
                (alert_type, recipient, status, response_time_ms, error_message)
                VALUES (?, ?, ?, ?, ?)
            ''', (alert_type, recipient, status, response_time_ms, error_message))

class NotificationManager:
    """Manages different notification channels"""
    
    def __init__(self, db: ComplianceDatabase):
        self.db = db
        self.notification_channels = {
            'system': self._send_system_notification,
            'email': self._send_email_notification,
            'slack': self._send_slack_notification,
            'dashboard': self._send_dashboard_notification,
            'webhook': self._send_webhook_notification
        }
    
    def send_alert(self, alert: ComplianceAlert, channels: List[str]):
        """Send alert to specified channels"""
        for channel in channels:
            if channel in self.notification_channels:
                try:
                    start_time = time.time()
                    self.notification_channels[channel](alert)
                    response_time_ms = int((time.time() - start_time) * 1000)
                    self.db.log_alert_notification(channel, alert.violation_type, 'SUCCESS', response_time_ms)
                    logger.info(f"Alert sent successfully via {channel} in {response_time_ms}ms")
                except Exception as e:
                    response_time_ms = int((time.time() - start_time) * 1000)
                    self.db.log_alert_notification(channel, alert.violation_type, 'ERROR', response_time_ms, str(e))
                    logger.error(f"Failed to send alert via {channel}: {e}")
    
    def _send_system_notification(self, alert: ComplianceAlert):
        """Send system notification (macOS)"""
        if sys.platform == 'darwin':
            title = f"Compliance Alert - {alert.severity}"
            message = f"{alert.violation_type}: {alert.message}"
            subprocess.run([
                'osascript', '-e',
                f'display notification "{message}" with title "{title}" sound name "Glass"'
            ])
    
    def _send_email_notification(self, alert: ComplianceAlert):
        """Send email notification"""
        if not EMAIL_USERNAME or not EMAIL_PASSWORD or not EMAIL_TO:
            logger.warning("Email credentials not configured")
            return
        
        msg = MimeMultipart()
        msg['From'] = EMAIL_USERNAME
        msg['To'] = EMAIL_TO
        msg['Subject'] = f"Compliance Alert - {alert.severity} - {alert.violation_type}"
        
        body = f"""
        Compliance Alert Details:
        
        Violation Type: {alert.violation_type}
        Severity: {alert.severity}
        Message: {alert.message}
        Timestamp: {alert.timestamp}
        Response Time: {alert.response_time_ms}ms
        Auto Remediation: {alert.auto_remediation}
        
        Details:
        {json.dumps(alert.details, indent=2)}
        """
        
        msg.attach(MimeText(body, 'plain'))
        
        server = smtplib.SMTP(EMAIL_SMTP_SERVER, EMAIL_SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
    
    def _send_slack_notification(self, alert: ComplianceAlert):
        """Send Slack notification"""
        if not SLACK_WEBHOOK_URL:
            logger.warning("Slack webhook URL not configured")
            return
        
        color = {
            'CRITICAL': '#ff0000',
            'HIGH': '#ff9900',
            'MEDIUM': '#ffcc00',
            'LOW': '#00cc00'
        }.get(alert.severity, '#cccccc')
        
        payload = {
            'text': f"Compliance Alert - {alert.severity}",
            'attachments': [{
                'color': color,
                'fields': [
                    {'title': 'Violation Type', 'value': alert.violation_type, 'short': True},
                    {'title': 'Severity', 'value': alert.severity, 'short': True},
                    {'title': 'Message', 'value': alert.message, 'short': False},
                    {'title': 'Response Time', 'value': f"{alert.response_time_ms}ms", 'short': True},
                    {'title': 'Auto Remediation', 'value': str(alert.auto_remediation), 'short': True}
                ],
                'timestamp': int(alert.timestamp.timestamp())
            }]
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
        response.raise_for_status()
    
    def _send_dashboard_notification(self, alert: ComplianceAlert):
        """Send notification to dashboard"""
        dashboard_data_dir = PROJECT_ROOT / 'projects/context-engineering-dashboard/server/data'
        dashboard_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Update alerts file
        alerts_file = dashboard_data_dir / 'compliance_alerts.json'
        alerts_data = []
        
        if alerts_file.exists():
            with open(alerts_file, 'r') as f:
                try:
                    alerts_data = json.load(f)
                except json.JSONDecodeError:
                    alerts_data = []
        
        alerts_data.append(alert.to_dict())
        
        # Keep only last 100 alerts
        alerts_data = alerts_data[-100:]
        
        with open(alerts_file, 'w') as f:
            json.dump(alerts_data, f, indent=2)
        
        # Try to send via WebSocket if dashboard is running (optional)
        try:
            # import websocket
            # ws = websocket.WebSocket()
            # ws.connect(DASHBOARD_URL)
            # ws.send(json.dumps({
            #     'type': 'compliance_alert',
            #     'data': alert.to_dict()
            # }))
            # ws.close()
            pass  # WebSocket dependency not available
        except:
            pass  # Dashboard might not be running
    
    def _send_webhook_notification(self, alert: ComplianceAlert):
        """Send webhook notification"""
        webhook_url = os.getenv("COMPLIANCE_WEBHOOK_URL")
        if not webhook_url:
            return
        
        payload = {
            'event': 'compliance_alert',
            'alert': alert.to_dict()
        }
        
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()

class ViolationDetector:
    """Detects compliance violations in real-time"""
    
    def __init__(self, db: ComplianceDatabase):
        self.db = db
        self.violation_patterns = {
            'ZERO_ROOT_FILE_VIOLATION': self._detect_zero_root_violations,
            'P55_SIMULATION_VIOLATION': self._detect_p55_violations,
            'WRITING_STANDARDS_VIOLATION': self._detect_writing_standards_violations,
            'PRINCIPLE_COMPLIANCE_VIOLATION': self._detect_principle_violations,
            'TRANSPARENCY_VIOLATION': self._detect_transparency_violations
        }
    
    def detect_violations(self) -> List[ComplianceAlert]:
        """Detect all types of violations"""
        violations = []
        
        for violation_type, detector in self.violation_patterns.items():
            try:
                start_time = time.time()
                detected_violations = detector()
                detection_time_ms = int((time.time() - start_time) * 1000)
                
                for violation in detected_violations:
                    alert = ComplianceAlert(
                        timestamp=datetime.now(),
                        violation_type=violation_type,
                        severity=violation['severity'],
                        message=violation['message'],
                        details=violation['details'],
                        response_time_ms=detection_time_ms,
                        auto_remediation=violation.get('auto_remediation', False)
                    )
                    violations.append(alert)
                    
            except Exception as e:
                logger.error(f"Error detecting {violation_type}: {e}")
        
        return violations
    
    def _detect_zero_root_violations(self) -> List[Dict[str, Any]]:
        """Detect zero-root file policy violations"""
        violations = []
        
        # Check for files in root directory that shouldn't be there
        root_files = [f for f in PROJECT_ROOT.iterdir() 
                     if f.is_file() and f.name not in ['CLAUDE.md', 'README.md', '.gitignore']]
        
        for file_path in root_files:
            if file_path.suffix in ['.md', '.txt', '.json', '.yml', '.yaml', '.sh', '.js', '.py']:
                violations.append({
                    'severity': 'CRITICAL',
                    'message': f"Unauthorized file in root directory: {file_path.name}",
                    'details': {
                        'file_path': str(file_path),
                        'principle': 'P81 - Zero-Root File Policy'
                    },
                    'auto_remediation': True
                })
        
        return violations
    
    def _detect_p55_violations(self) -> List[Dict[str, Any]]:
        """Detect P55 simulation violations"""
        violations = []
        
        # Check command files for simulation language
        command_files = (PROJECT_ROOT / 'docs/commands').rglob('*.md')
        
        for file_path in command_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                simulation_patterns = [
                    'would execute', 'recommend running', 'you should run', 
                    'could run', 'might want to run', 'should consider running'
                ]
                
                for pattern in simulation_patterns:
                    if pattern in content.lower():
                        violations.append({
                            'severity': 'HIGH',
                            'message': f"P55 simulation language detected in {file_path.name}",
                            'details': {
                                'file_path': str(file_path),
                                'pattern': pattern,
                                'principle': 'P55 - Tool Execution Priority'
                            },
                            'auto_remediation': True
                        })
                        break
                        
            except Exception as e:
                logger.error(f"Error checking {file_path}: {e}")
        
        return violations
    
    def _detect_writing_standards_violations(self) -> List[Dict[str, Any]]:
        """Detect writing standards violations"""
        violations = []
        
        # Check knowledge files for mandatory terminology
        knowledge_files = (PROJECT_ROOT / 'docs/knowledge').rglob('*.md')
        
        for file_path in knowledge_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                required_terms = ['MANDATORY', 'CRITICAL', 'REQUIRED']
                has_required_terms = any(term in content for term in required_terms)
                
                if not has_required_terms and len(content) > 500:  # Only check substantial files
                    violations.append({
                        'severity': 'MEDIUM',
                        'message': f"Missing mandatory terminology in {file_path.name}",
                        'details': {
                            'file_path': str(file_path),
                            'required_terms': required_terms,
                            'principle': 'Writing Standards Compliance'
                        },
                        'auto_remediation': False
                    })
                        
            except Exception as e:
                logger.error(f"Error checking {file_path}: {e}")
        
        return violations
    
    def _detect_principle_violations(self) -> List[Dict[str, Any]]:
        """Detect principle compliance violations"""
        violations = []
        
        # Check for principle references in documentation
        doc_files = (PROJECT_ROOT / 'docs').rglob('*.md')
        
        principle_referenced_files = 0
        total_files = 0
        
        for file_path in doc_files:
            try:
                total_files += 1
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for principle references
                principle_patterns = [
                    r'Principle #\d+', r'P\d+', r'#\d+ '
                ]
                
                import re
                has_principle_refs = any(
                    re.search(pattern, content) for pattern in principle_patterns
                )
                
                if has_principle_refs:
                    principle_referenced_files += 1
                        
            except Exception as e:
                logger.error(f"Error checking {file_path}: {e}")
        
        if total_files > 0:
            principle_compliance_rate = (principle_referenced_files / total_files) * 100
            
            if principle_compliance_rate < 85:  # 85% threshold
                violations.append({
                    'severity': 'HIGH',
                    'message': f"Low principle compliance rate: {principle_compliance_rate:.1f}%",
                    'details': {
                        'compliance_rate': principle_compliance_rate,
                        'referenced_files': principle_referenced_files,
                        'total_files': total_files,
                        'threshold': 85
                    },
                    'auto_remediation': False
                })
        
        return violations
    
    def _detect_transparency_violations(self) -> List[Dict[str, Any]]:
        """Detect P56 transparency violations"""
        violations = []
        
        # Check recent logs for transparency indicators
        results_dir = PROJECT_ROOT / 'scripts/results'
        
        if results_dir.exists():
            recent_logs = []
            cutoff_time = datetime.now() - timedelta(hours=1)
            
            for log_file in results_dir.rglob('*.log'):
                try:
                    if log_file.stat().st_mtime > cutoff_time.timestamp():
                        recent_logs.append(log_file)
                except:
                    continue
            
            transparency_indicators = 0
            total_operations = len(recent_logs)
            
            for log_file in recent_logs:
                try:
                    with open(log_file, 'r') as f:
                        content = f.read()
                    
                    # Check for transparency patterns
                    transparency_patterns = [
                        '║', '╔', '╚', 'EXECUTING', 'ACTIVE TOOL CALL'
                    ]
                    
                    if any(pattern in content for pattern in transparency_patterns):
                        transparency_indicators += 1
                        
                except Exception as e:
                    logger.error(f"Error checking {log_file}: {e}")
            
            if total_operations > 0:
                transparency_rate = (transparency_indicators / total_operations) * 100
                
                if transparency_rate < 90:  # 90% threshold
                    violations.append({
                        'severity': 'MEDIUM',
                        'message': f"Low transparency rate: {transparency_rate:.1f}%",
                        'details': {
                            'transparency_rate': transparency_rate,
                            'indicators': transparency_indicators,
                            'total_operations': total_operations,
                            'threshold': 90
                        },
                        'auto_remediation': False
                    })
        
        return violations

class ComplianceAlertingSystem:
    """Main compliance alerting system with blocking capabilities"""
    
    def __init__(self):
        self.db_path = PROJECT_ROOT / 'scripts/results/compliance/metrics/compliance_monitoring.db'
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.db = ComplianceDatabase(str(self.db_path))
        self.notification_manager = NotificationManager(self.db)
        self.violation_detector = ViolationDetector(self.db)
        
        self.running = False
        self.monitoring_thread = None
        self.blocking_enabled = True  # NEW: Enable actual blocking
        
        # Alert configuration
        self.alert_config = {
            'CRITICAL': ['system', 'email', 'slack', 'dashboard'],
            'HIGH': ['system', 'slack', 'dashboard'],
            'MEDIUM': ['dashboard'],
            'LOW': ['dashboard']
        }
        
        # NEW: Blocking configuration
        self.blocking_config = {
            'CRITICAL': True,   # Always block critical violations
            'HIGH': True,       # Block high severity violations
            'MEDIUM': False,    # Warning only for medium
            'LOW': False        # Warning only for low
        }
    
    def start(self):
        """Start the alerting system"""
        logger.info("Starting Compliance Alerting System...")
        
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        
        # Schedule periodic reports (optional)
        # schedule.every(1).hours.do(self._generate_hourly_report)
        # schedule.every(1).days.do(self._generate_daily_report)
        
        logger.info("Compliance Alerting System started successfully")
    
    def stop(self):
        """Stop the alerting system"""
        logger.info("Stopping Compliance Alerting System...")
        
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        
        logger.info("Compliance Alerting System stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Detect violations
                violations = self.violation_detector.detect_violations()
                
                # Process each violation
                for alert in violations:
                    # Store in database
                    alert_id = self.db.insert_alert(alert)
                    
                    # NEW: Check if violation should block operations
                    should_block = self.blocking_enabled and self.blocking_config.get(alert.severity, False)
                    
                    if should_block:
                        # Block operation and log critical blocking action
                        self._execute_blocking_action(alert)
                    
                    # Send notifications based on severity
                    channels = self.alert_config.get(alert.severity, ['dashboard'])
                    self.notification_manager.send_alert(alert, channels)
                    
                    logger.info(f"Processed {alert.severity} alert: {alert.violation_type} (Blocked: {should_block})")
                
                # Run scheduled tasks (optional)
                # schedule.run_pending()
                
                # Sleep until next check
                time.sleep(MONITORING_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(MONITORING_INTERVAL)
    
    def _generate_hourly_report(self):
        """Generate hourly compliance report"""
        try:
            # Get recent metrics
            metrics = self.db.get_recent_metrics(minutes=60)
            unresolved_alerts = self.db.get_unresolved_alerts()
            
            report = {
                'timestamp': datetime.now().isoformat(),
                'period': 'hourly',
                'total_metrics': len(metrics),
                'unresolved_alerts': len(unresolved_alerts),
                'compliance_summary': self._calculate_compliance_summary(metrics),
                'alert_summary': self._calculate_alert_summary(unresolved_alerts)
            }
            
            # Save report
            report_file = PROJECT_ROOT / f'scripts/results/compliance/hourly_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Hourly report generated: {report_file}")
            
        except Exception as e:
            logger.error(f"Error generating hourly report: {e}")
    
    def _generate_daily_report(self):
        """Generate daily compliance report"""
        try:
            # Get daily metrics
            metrics = self.db.get_recent_metrics(minutes=1440)  # 24 hours
            
            report = {
                'timestamp': datetime.now().isoformat(),
                'period': 'daily',
                'total_metrics': len(metrics),
                'compliance_summary': self._calculate_compliance_summary(metrics),
                'trends': self._calculate_compliance_trends(metrics)
            }
            
            # Save report
            report_file = PROJECT_ROOT / f'scripts/results/compliance/daily_report_{datetime.now().strftime("%Y%m%d")}.json'
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Daily report generated: {report_file}")
            
        except Exception as e:
            logger.error(f"Error generating daily report: {e}")
    
    def _calculate_compliance_summary(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate compliance summary from metrics"""
        if not metrics:
            return {}
        
        summary = {}
        metric_types = set(m['metric_type'] for m in metrics)
        
        for metric_type in metric_types:
            type_metrics = [m for m in metrics if m['metric_type'] == metric_type]
            compliant_count = sum(1 for m in type_metrics if m['is_compliant'])
            
            summary[metric_type] = {
                'total_checks': len(type_metrics),
                'compliant_checks': compliant_count,
                'compliance_rate': (compliant_count / len(type_metrics)) * 100,
                'latest_value': type_metrics[0]['metric_value'] if type_metrics else 0
            }
        
        return summary
    
    def _calculate_alert_summary(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate alert summary"""
        if not alerts:
            return {}
        
        summary = {
            'total_alerts': len(alerts),
            'by_severity': {},
            'by_type': {}
        }
        
        for alert in alerts:
            severity = alert['severity']
            violation_type = alert['violation_type']
            
            summary['by_severity'][severity] = summary['by_severity'].get(severity, 0) + 1
            summary['by_type'][violation_type] = summary['by_type'].get(violation_type, 0) + 1
        
        return summary
    
    def _calculate_compliance_trends(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate compliance trends"""
        if not metrics:
            return {}
        
        # Group metrics by hour
        hourly_metrics = {}
        for metric in metrics:
            timestamp = datetime.fromisoformat(metric['timestamp'].replace('Z', '+00:00'))
            hour = timestamp.replace(minute=0, second=0, microsecond=0)
            
            if hour not in hourly_metrics:
                hourly_metrics[hour] = []
            hourly_metrics[hour].append(metric)
        
        # Calculate hourly compliance rates
        hourly_rates = {}
        for hour, hour_metrics in hourly_metrics.items():
            compliant_count = sum(1 for m in hour_metrics if m['is_compliant'])
            hourly_rates[hour.isoformat()] = (compliant_count / len(hour_metrics)) * 100
        
        return {
            'hourly_compliance_rates': hourly_rates,
            'trend_direction': self._calculate_trend_direction(list(hourly_rates.values()))
        }
    
    def _execute_blocking_action(self, alert: ComplianceAlert):
        """Execute blocking action for critical violations"""
        blocking_message = f"""
🚨 COMPLIANCE VIOLATION BLOCKED 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Violation: {alert.violation_type}
Severity: {alert.severity}
Message: {alert.message}
Timestamp: {alert.timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPERATION BLOCKED - Compliance enforcement active.
Review violation details and address before proceeding.

Enforcement System: Context Engineering
Response Time: {alert.response_time_ms}ms
"""
        
        # Log blocking action
        logger.critical(blocking_message)
        
        # Create blocking file for external detection
        blocking_file = PROJECT_ROOT / 'scripts/results/compliance/BLOCKING_ACTIVE.flag'
        with open(blocking_file, 'w') as f:
            f.write(f"{alert.timestamp.isoformat()}\n{alert.violation_type}\n{alert.severity}\n{alert.message}")
        
        # Record blocking action in database
        self.db.log_alert_notification('blocking', alert.violation_type, 'BLOCKED', alert.response_time_ms)
        
        # Send immediate system notification
        if sys.platform == 'darwin':
            subprocess.run([
                'osascript', '-e',
                f'display dialog "🚨 COMPLIANCE VIOLATION BLOCKED\\n\\n{alert.violation_type}\\n{alert.message}" with title "Context Engineering Enforcement" buttons {{"OK"}} default button "OK"'
            ])
    
    def check_operation_allowed(self, operation_type: str, context: str = "") -> Tuple[bool, List[str]]:
        """Check if operation is allowed or should be blocked"""
        # Check for active blocking flag
        blocking_file = PROJECT_ROOT / 'scripts/results/compliance/BLOCKING_ACTIVE.flag'
        
        if blocking_file.exists():
            try:
                with open(blocking_file, 'r') as f:
                    lines = f.readlines()
                    if len(lines) >= 4:
                        timestamp_str = lines[0].strip()
                        violation_type = lines[1].strip()
                        severity = lines[2].strip()
                        message = lines[3].strip()
                        
                        # Check if blocking is still valid (within 1 hour)
                        try:
                            block_time = datetime.fromisoformat(timestamp_str)
                            if datetime.now() - block_time < timedelta(hours=1):
                                return False, [f"Operation blocked due to: {violation_type} ({severity})"]
                        except:
                            pass
            except:
                pass
        
        # Run real-time violation detection for this specific operation
        violations = []
        
        # Quick violation checks based on operation type
        if operation_type == 'file_creation' and 'root' in context.lower():
            violations.append("Zero-root file policy violation")
        
        if operation_type == 'command_execution' and 'single' in context.lower():
            violations.append("Command orchestration violation - insufficient utilization")
        
        if operation_type == 'error_continuation' and 'error' in context.lower():
            violations.append("Zero tolerance error policy violation")
        
        return len(violations) == 0, violations
    
    def enable_blocking(self):
        """Enable enforcement blocking"""
        self.blocking_enabled = True
        logger.info("Enforcement blocking ENABLED")
    
    def disable_blocking(self):
        """Disable enforcement blocking (emergency override)"""
        self.blocking_enabled = False
        logger.warning("Enforcement blocking DISABLED - Emergency override active")
        
        # Remove blocking flag
        blocking_file = PROJECT_ROOT / 'scripts/results/compliance/BLOCKING_ACTIVE.flag'
        if blocking_file.exists():
            blocking_file.unlink()
    
    def clear_blocking_flag(self):
        """Clear blocking flag (violation resolved)"""
        blocking_file = PROJECT_ROOT / 'scripts/results/compliance/BLOCKING_ACTIVE.flag'
        if blocking_file.exists():
            blocking_file.unlink()
            logger.info("Blocking flag cleared - operations resumed")
    
    def _calculate_trend_direction(self, values: List[float]) -> str:
        """Calculate trend direction from values"""
        if len(values) < 2:
            return 'stable'
        
        # Simple trend calculation
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        
        if second_avg > first_avg + 2:
            return 'improving'
        elif second_avg < first_avg - 2:
            return 'declining'
        else:
            return 'stable'

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python compliance-alerting-system.py {start|stop|status|check|enable-blocking|disable-blocking|clear-blocking}")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'start':
        system = ComplianceAlertingSystem()
        system.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            system.stop()
    
    elif command == 'stop':
        # Stop any running instances
        subprocess.run(['pkill', '-f', 'compliance-alerting-system.py'], check=False)
        logger.info("Compliance Alerting System stopped")
    
    elif command == 'status':
        # Check if system is running
        result = subprocess.run(['pgrep', '-f', 'compliance-alerting-system.py'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("Compliance Alerting System is running")
        else:
            logger.info("Compliance Alerting System is not running")
    
    elif command == 'check':
        if len(sys.argv) < 4:
            print("Usage: python compliance-alerting-system.py check <operation_type> <context>")
            sys.exit(1)
        
        operation_type = sys.argv[2]
        context = sys.argv[3] if len(sys.argv) > 3 else ""
        
        system = ComplianceAlertingSystem()
        allowed, violations = system.check_operation_allowed(operation_type, context)
        
        print(f"Operation Check: {operation_type}")
        print(f"Context: {context}")
        print(f"Allowed: {allowed}")
        if violations:
            print("Violations:")
            for violation in violations:
                print(f"  - {violation}")
    
    elif command == 'enable-blocking':
        system = ComplianceAlertingSystem()
        system.enable_blocking()
        logger.info("Enforcement blocking enabled")
    
    elif command == 'disable-blocking':
        system = ComplianceAlertingSystem()
        system.disable_blocking()
        logger.info("Enforcement blocking disabled (emergency override)")
    
    elif command == 'clear-blocking':
        system = ComplianceAlertingSystem()
        system.clear_blocking_flag()
        logger.info("Blocking flag cleared")
    
    else:
        print("Invalid command. Use: start, stop, status, check, enable-blocking, disable-blocking, clear-blocking")
        sys.exit(1)

if __name__ == "__main__":
    main()