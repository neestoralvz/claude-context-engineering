#!/usr/bin/env python3
"""
Real-time Governance Alert System - Context Engineering
MANDATORY: Multi-channel instant notification system for governance violations
Implements Phase 2: Real-time Alerts with <30 second delivery

CRITICAL REQUIREMENTS:
- <30 seconds alert delivery time
- Multi-channel notifications (console, file, email, etc.)
- Severity-based escalation
- Stakeholder notification
- Dashboard integration

ALERT CHANNELS:
1. Console Alerts (immediate)
2. File-based Alerts (persistent)
3. Email Notifications (stakeholder)
4. Dashboard Updates (real-time)
5. System Logs (audit trail)
"""

import os
import json
import time
import smtplib
import sqlite3
import asyncio
import websockets
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from pathlib import Path
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import logging
from concurrent.futures import ThreadPoolExecutor
import subprocess
from collections import deque
import fcntl
import signal
import atexit

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
ALERTS_CONFIG = PROJECT_ROOT / 'scripts/governance/alerts-config.json'
ALERTS_DB = PROJECT_ROOT / 'scripts/results/governance/alerts.db'
ALERTS_LOG = PROJECT_ROOT / 'scripts/results/governance/alerts.log'
ALERTS_QUEUE = PROJECT_ROOT / 'scripts/results/governance/alert-queue'
DASHBOARD_DIR = PROJECT_ROOT / 'scripts/results/governance/dashboard'
STAKEHOLDER_CONFIG = PROJECT_ROOT / 'scripts/governance/stakeholders.json'

# Real-time configuration
ALERT_PROCESSING_INTERVAL = 1  # seconds
MAX_RETRY_ATTEMPTS = 3
ALERT_TIMEOUT = 30  # 30 seconds delivery target
DASHBOARD_UPDATE_INTERVAL = 5  # seconds
WEBSOCKET_PORT = 8765

# Alert severity levels
SEVERITY_LEVELS = {
    'info': 1,
    'warning': 2,
    'high': 3,
    'critical': 4,
    'emergency': 5
}

# Logging configuration
os.makedirs(ALERTS_LOG.parent, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ALERTS_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class GovernanceAlert:
    """Governance alert data structure"""
    id: str
    timestamp: datetime
    alert_type: str
    severity: str  # 'info', 'warning', 'high', 'critical', 'emergency'
    title: str
    message: str
    source: str
    file_path: Optional[str] = None
    violation_data: Optional[Dict[str, Any]] = None
    stakeholders: Optional[List[str]] = None
    channels: Optional[List[str]] = None
    retry_count: int = 0
    delivery_status: Dict[str, str] = None
    created_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.delivery_status is None:
            self.delivery_status = {}

@dataclass
class AlertChannel:
    """Alert delivery channel configuration"""
    name: str
    enabled: bool
    config: Dict[str, Any]
    delivery_method: str
    priority: int
    timeout: int = 30

@dataclass
class Stakeholder:
    """Stakeholder notification configuration"""
    name: str
    email: Optional[str] = None
    role: str = "developer"
    severity_threshold: str = "warning"
    notification_methods: List[str] = None
    active: bool = True

    def __post_init__(self):
        if self.notification_methods is None:
            self.notification_methods = ["console", "file"]

class RealTimeAlertSystem:
    """Real-time governance alert system"""
    
    def __init__(self):
        self.running = False
        self.alert_queue = deque()
        self.active_alerts = {}
        self.delivery_stats = {
            'total_sent': 0,
            'successful': 0,
            'failed': 0,
            'avg_delivery_time': 0.0
        }
        self.channels = {}
        self.stakeholders = {}
        self.websocket_clients = set()
        
        self.init_directories()
        self.init_database()
        self.load_configuration()
        self.init_alert_queue()
        
        # Register cleanup
        atexit.register(self.cleanup)
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)
    
    def init_directories(self):
        """Initialize alert system directories"""
        for directory in [ALERTS_DB.parent, ALERTS_QUEUE, DASHBOARD_DIR]:
            os.makedirs(directory, exist_ok=True)
    
    def init_database(self):
        """Initialize alerts database"""
        try:
            with sqlite3.connect(ALERTS_DB) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS governance_alerts (
                        id TEXT PRIMARY KEY,
                        timestamp TEXT NOT NULL,
                        alert_type TEXT NOT NULL,
                        severity TEXT NOT NULL,
                        title TEXT NOT NULL,
                        message TEXT NOT NULL,
                        source TEXT NOT NULL,
                        file_path TEXT,
                        violation_data TEXT,
                        stakeholders TEXT,
                        channels TEXT,
                        retry_count INTEGER DEFAULT 0,
                        delivery_status TEXT,
                        created_at TEXT NOT NULL,
                        delivered_at TEXT,
                        acknowledged_at TEXT
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS alert_delivery_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        alert_id TEXT NOT NULL,
                        channel TEXT NOT NULL,
                        status TEXT NOT NULL,
                        delivery_time REAL NOT NULL,
                        error_message TEXT,
                        timestamp TEXT NOT NULL,
                        FOREIGN KEY (alert_id) REFERENCES governance_alerts (id)
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS alert_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        total_alerts INTEGER NOT NULL,
                        successful_deliveries INTEGER NOT NULL,
                        failed_deliveries INTEGER NOT NULL,
                        avg_delivery_time REAL NOT NULL,
                        system_load REAL NOT NULL
                    )
                ''')
                
                conn.commit()
                logger.info("Alert database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize alert database: {e}")
            raise
    
    def load_configuration(self):
        """Load alert system configuration"""
        try:
            # Load alert channels configuration
            if ALERTS_CONFIG.exists():
                with open(ALERTS_CONFIG, 'r') as f:
                    config = json.load(f)
                    
                for channel_config in config.get('channels', []):
                    channel = AlertChannel(**channel_config)
                    self.channels[channel.name] = channel
            else:
                self._create_default_configuration()
            
            # Load stakeholders configuration
            if STAKEHOLDER_CONFIG.exists():
                with open(STAKEHOLDER_CONFIG, 'r') as f:
                    stakeholder_data = json.load(f)
                    
                for stakeholder_config in stakeholder_data.get('stakeholders', []):
                    stakeholder = Stakeholder(**stakeholder_config)
                    self.stakeholders[stakeholder.name] = stakeholder
            else:
                self._create_default_stakeholders()
                
            logger.info("Alert configuration loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load alert configuration: {e}")
            self._create_default_configuration()
    
    def _create_default_configuration(self):
        """Create default alert configuration"""
        default_config = {
            "channels": [
                {
                    "name": "console",
                    "enabled": True,
                    "config": {},
                    "delivery_method": "direct",
                    "priority": 1,
                    "timeout": 5
                },
                {
                    "name": "file",
                    "enabled": True,
                    "config": {
                        "alert_dir": str(DASHBOARD_DIR / "alerts"),
                        "format": "json"
                    },
                    "delivery_method": "file_write",
                    "priority": 2,
                    "timeout": 10
                },
                {
                    "name": "dashboard",
                    "enabled": True,
                    "config": {
                        "update_file": str(DASHBOARD_DIR / "live-alerts.json"),
                        "websocket_port": WEBSOCKET_PORT
                    },
                    "delivery_method": "websocket",
                    "priority": 3,
                    "timeout": 15
                },
                {
                    "name": "email",
                    "enabled": False,
                    "config": {
                        "smtp_server": "localhost",
                        "smtp_port": 587,
                        "username": "",
                        "password": "",
                        "from_address": "governance@context-engineering.local"
                    },
                    "delivery_method": "smtp",
                    "priority": 4,
                    "timeout": 30
                }
            ],
            "settings": {
                "max_retry_attempts": MAX_RETRY_ATTEMPTS,
                "alert_timeout": ALERT_TIMEOUT,
                "processing_interval": ALERT_PROCESSING_INTERVAL
            }
        }
        
        with open(ALERTS_CONFIG, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        # Load created configuration
        for channel_config in default_config['channels']:
            channel = AlertChannel(**channel_config)
            self.channels[channel.name] = channel
    
    def _create_default_stakeholders(self):
        """Create default stakeholders configuration"""
        default_stakeholders = {
            "stakeholders": [
                {
                    "name": "governance_admin",
                    "email": "admin@context-engineering.local",
                    "role": "administrator",
                    "severity_threshold": "warning",
                    "notification_methods": ["console", "file", "dashboard", "email"],
                    "active": True
                },
                {
                    "name": "developer",
                    "role": "developer",
                    "severity_threshold": "high",
                    "notification_methods": ["console", "file", "dashboard"],
                    "active": True
                },
                {
                    "name": "system_monitor",
                    "role": "monitoring",
                    "severity_threshold": "info",
                    "notification_methods": ["console", "file"],
                    "active": True
                }
            ]
        }
        
        with open(STAKEHOLDER_CONFIG, 'w') as f:
            json.dump(default_stakeholders, f, indent=2)
        
        # Load created stakeholders
        for stakeholder_config in default_stakeholders['stakeholders']:
            stakeholder = Stakeholder(**stakeholder_config)
            self.stakeholders[stakeholder.name] = stakeholder
    
    def init_alert_queue(self):
        """Initialize persistent alert queue"""
        os.makedirs(ALERTS_QUEUE, exist_ok=True)
    
    def create_alert(self, alert_type: str, severity: str, title: str, message: str, 
                    source: str, file_path: str = None, violation_data: Dict = None) -> GovernanceAlert:
        """Create a new governance alert"""
        alert_id = f"alert_{int(time.time() * 1000)}_{hash(message) % 10000}"
        
        # Determine stakeholders based on severity
        stakeholders = self._get_stakeholders_for_severity(severity)
        
        # Determine channels based on severity and stakeholder preferences
        channels = self._get_channels_for_alert(severity, stakeholders)
        
        alert = GovernanceAlert(
            id=alert_id,
            timestamp=datetime.now(),
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            source=source,
            file_path=file_path,
            violation_data=violation_data,
            stakeholders=stakeholders,
            channels=channels
        )
        
        logger.info(f"Created alert {alert_id}: {severity} - {title}")
        return alert
    
    def send_alert(self, alert: GovernanceAlert) -> bool:
        """Send alert through all configured channels"""
        try:
            start_time = time.time()
            
            # Add to processing queue
            self.alert_queue.append(alert)
            self.active_alerts[alert.id] = alert
            
            # Store in database
            self._store_alert(alert)
            
            # Process immediately for critical/emergency alerts
            if alert.severity in ['critical', 'emergency']:
                self._process_alert_immediately(alert)
            
            delivery_time = time.time() - start_time
            logger.info(f"Alert {alert.id} queued for delivery in {delivery_time:.3f}s")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send alert {alert.id}: {e}")
            return False
    
    def _process_alert_immediately(self, alert: GovernanceAlert):
        """Process critical/emergency alerts immediately"""
        try:
            logger.warning(f"Processing critical alert immediately: {alert.id}")
            
            # Use thread pool for parallel delivery
            with ThreadPoolExecutor(max_workers=len(alert.channels or [])) as executor:
                futures = []
                
                for channel_name in (alert.channels or []):
                    if channel_name in self.channels and self.channels[channel_name].enabled:
                        future = executor.submit(self._deliver_to_channel, alert, channel_name)
                        futures.append((channel_name, future))
                
                # Wait for all deliveries with timeout
                for channel_name, future in futures:
                    try:
                        result = future.result(timeout=self.channels[channel_name].timeout)
                        alert.delivery_status[channel_name] = 'delivered' if result else 'failed'
                    except Exception as e:
                        alert.delivery_status[channel_name] = f'error: {str(e)}'
                        logger.error(f"Failed to deliver alert {alert.id} to {channel_name}: {e}")
            
            alert.delivered_at = datetime.now()
            self._update_alert_status(alert)
            
        except Exception as e:
            logger.error(f"Failed to process alert immediately: {e}")
    
    def _deliver_to_channel(self, alert: GovernanceAlert, channel_name: str) -> bool:
        """Deliver alert to specific channel"""
        try:
            channel = self.channels[channel_name]
            start_time = time.time()
            
            if channel.delivery_method == 'direct':
                success = self._deliver_console(alert)
            elif channel.delivery_method == 'file_write':
                success = self._deliver_file(alert, channel)
            elif channel.delivery_method == 'websocket':
                success = self._deliver_dashboard(alert, channel)
            elif channel.delivery_method == 'smtp':
                success = self._deliver_email(alert, channel)
            else:
                logger.warning(f"Unknown delivery method: {channel.delivery_method}")
                success = False
            
            delivery_time = time.time() - start_time
            
            # Log delivery attempt
            self._log_delivery_attempt(alert.id, channel_name, 
                                     'success' if success else 'failed', 
                                     delivery_time)
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to deliver to {channel_name}: {e}")
            self._log_delivery_attempt(alert.id, channel_name, 'error', 0, str(e))
            return False
    
    def _deliver_console(self, alert: GovernanceAlert) -> bool:
        """Deliver alert to console"""
        try:
            severity_emoji = {
                'info': 'ℹ️',
                'warning': '⚠️',
                'high': '🚨',
                'critical': '🔥',
                'emergency': '💥'
            }
            
            emoji = severity_emoji.get(alert.severity, '📢')
            
            print(f"\n{'='*80}")
            print(f"{emoji} GOVERNANCE ALERT - {alert.severity.upper()}")
            print(f"{'='*80}")
            print(f"Time: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Source: {alert.source}")
            print(f"Type: {alert.alert_type}")
            print(f"Title: {alert.title}")
            print(f"Message: {alert.message}")
            
            if alert.file_path:
                print(f"File: {alert.file_path}")
            
            if alert.violation_data:
                print(f"Details: {json.dumps(alert.violation_data, indent=2)}")
            
            print(f"Alert ID: {alert.id}")
            print(f"{'='*80}\n")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to deliver console alert: {e}")
            return False
    
    def _deliver_file(self, alert: GovernanceAlert, channel: AlertChannel) -> bool:
        """Deliver alert to file system"""
        try:
            alert_dir = Path(channel.config.get('alert_dir', DASHBOARD_DIR / 'alerts'))
            os.makedirs(alert_dir, exist_ok=True)
            
            timestamp = alert.timestamp.strftime('%Y%m%d_%H%M%S')
            alert_file = alert_dir / f"alert_{timestamp}_{alert.id}.json"
            
            alert_data = {
                'id': alert.id,
                'timestamp': alert.timestamp.isoformat(),
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'title': alert.title,
                'message': alert.message,
                'source': alert.source,
                'file_path': alert.file_path,
                'violation_data': alert.violation_data,
                'stakeholders': alert.stakeholders,
                'created_at': alert.created_at.isoformat() if alert.created_at else None
            }
            
            with open(alert_file, 'w') as f:
                json.dump(alert_data, f, indent=2)
            
            # Also update latest alerts file
            latest_file = alert_dir.parent / 'latest-alerts.json'
            latest_alerts = []
            
            if latest_file.exists():
                try:
                    with open(latest_file, 'r') as f:
                        latest_alerts = json.load(f)
                except:
                    latest_alerts = []
            
            latest_alerts.insert(0, alert_data)
            latest_alerts = latest_alerts[:50]  # Keep last 50 alerts
            
            with open(latest_file, 'w') as f:
                json.dump(latest_alerts, f, indent=2)
            
            logger.info(f"Alert saved to file: {alert_file}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to deliver file alert: {e}")
            return False
    
    def _deliver_dashboard(self, alert: GovernanceAlert, channel: AlertChannel) -> bool:
        """Deliver alert to dashboard via websocket"""
        try:
            # Update dashboard file
            dashboard_file = Path(channel.config.get('update_file', DASHBOARD_DIR / 'live-alerts.json'))
            os.makedirs(dashboard_file.parent, exist_ok=True)
            
            alert_data = {
                'id': alert.id,
                'timestamp': alert.timestamp.isoformat(),
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'title': alert.title,
                'message': alert.message,
                'source': alert.source,
                'file_path': alert.file_path,
                'violation_data': alert.violation_data
            }
            
            # Load existing alerts
            dashboard_alerts = []
            if dashboard_file.exists():
                try:
                    with open(dashboard_file, 'r') as f:
                        dashboard_data = json.load(f)
                        dashboard_alerts = dashboard_data.get('alerts', [])
                except:
                    dashboard_alerts = []
            
            # Add new alert
            dashboard_alerts.insert(0, alert_data)
            dashboard_alerts = dashboard_alerts[:100]  # Keep last 100 alerts
            
            # Update dashboard data
            dashboard_data = {
                'last_updated': datetime.now().isoformat(),
                'active_alerts': len([a for a in dashboard_alerts if a['severity'] in ['critical', 'emergency']]),
                'total_alerts': len(dashboard_alerts),
                'alerts': dashboard_alerts
            }
            
            with open(dashboard_file, 'w') as f:
                json.dump(dashboard_data, f, indent=2)
            
            # Send via websocket if clients connected
            if self.websocket_clients:
                asyncio.create_task(self._broadcast_websocket_alert(alert_data))
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to deliver dashboard alert: {e}")
            return False
    
    def _deliver_email(self, alert: GovernanceAlert, channel: AlertChannel) -> bool:
        """Deliver alert via email"""
        try:
            if not channel.enabled:
                return False
            
            config = channel.config
            if not all(k in config for k in ['smtp_server', 'from_address']):
                logger.warning("Email channel not properly configured")
                return False
            
            # Get recipient emails
            recipients = []
            for stakeholder_name in (alert.stakeholders or []):
                if stakeholder_name in self.stakeholders:
                    stakeholder = self.stakeholders[stakeholder_name]
                    if stakeholder.email and 'email' in stakeholder.notification_methods:
                        recipients.append(stakeholder.email)
            
            if not recipients:
                logger.info("No email recipients for alert")
                return True  # Not a failure if no recipients
            
            # Create email message
            msg = MimeMultipart()
            msg['From'] = config['from_address']
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = f"[{alert.severity.upper()}] {alert.title}"
            
            body = f"""
Governance Alert - {alert.severity.upper()}

Time: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
Source: {alert.source}
Type: {alert.alert_type}
File: {alert.file_path or 'N/A'}

{alert.message}

Alert ID: {alert.id}

---
This is an automated message from the Context Engineering Governance System.
"""
            
            msg.attach(MimeText(body, 'plain'))
            
            # Send email
            with smtplib.SMTP(config['smtp_server'], config.get('smtp_port', 587)) as server:
                if config.get('username') and config.get('password'):
                    server.starttls()
                    server.login(config['username'], config['password'])
                
                server.send_message(msg)
            
            logger.info(f"Email alert sent to {len(recipients)} recipients")
            return True
            
        except Exception as e:
            logger.error(f"Failed to deliver email alert: {e}")
            return False
    
    async def _broadcast_websocket_alert(self, alert_data: Dict):
        """Broadcast alert to connected websocket clients"""
        if not self.websocket_clients:
            return
        
        message = json.dumps({
            'type': 'governance_alert',
            'data': alert_data
        })
        
        # Send to all connected clients
        disconnected_clients = set()
        for client in self.websocket_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.error(f"Failed to send websocket message: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        self.websocket_clients -= disconnected_clients
    
    def _get_stakeholders_for_severity(self, severity: str) -> List[str]:
        """Get stakeholders who should receive alerts for given severity"""
        stakeholders = []
        severity_level = SEVERITY_LEVELS.get(severity, 0)
        
        for name, stakeholder in self.stakeholders.items():
            if not stakeholder.active:
                continue
                
            threshold_level = SEVERITY_LEVELS.get(stakeholder.severity_threshold, 0)
            if severity_level >= threshold_level:
                stakeholders.append(name)
        
        return stakeholders
    
    def _get_channels_for_alert(self, severity: str, stakeholders: List[str]) -> List[str]:
        """Get delivery channels for alert based on severity and stakeholders"""
        channels = set()
        
        # Add channels based on stakeholder preferences
        for stakeholder_name in stakeholders:
            if stakeholder_name in self.stakeholders:
                stakeholder = self.stakeholders[stakeholder_name]
                channels.update(stakeholder.notification_methods)
        
        # Always use console and file for any alert
        channels.add('console')
        channels.add('file')
        
        # Add dashboard for warning and above
        if SEVERITY_LEVELS.get(severity, 0) >= SEVERITY_LEVELS['warning']:
            channels.add('dashboard')
        
        # Add email for high and above (if enabled)
        if SEVERITY_LEVELS.get(severity, 0) >= SEVERITY_LEVELS['high']:
            if 'email' in self.channels and self.channels['email'].enabled:
                channels.add('email')
        
        return list(channels)
    
    def _store_alert(self, alert: GovernanceAlert):
        """Store alert in database"""
        try:
            with sqlite3.connect(ALERTS_DB) as conn:
                conn.execute('''
                    INSERT INTO governance_alerts (
                        id, timestamp, alert_type, severity, title, message, source,
                        file_path, violation_data, stakeholders, channels, retry_count,
                        delivery_status, created_at, delivered_at, acknowledged_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert.id,
                    alert.timestamp.isoformat(),
                    alert.alert_type,
                    alert.severity,
                    alert.title,
                    alert.message,
                    alert.source,
                    alert.file_path,
                    json.dumps(alert.violation_data) if alert.violation_data else None,
                    json.dumps(alert.stakeholders) if alert.stakeholders else None,
                    json.dumps(alert.channels) if alert.channels else None,
                    alert.retry_count,
                    json.dumps(alert.delivery_status) if alert.delivery_status else None,
                    alert.created_at.isoformat() if alert.created_at else None,
                    alert.delivered_at.isoformat() if alert.delivered_at else None,
                    alert.acknowledged_at.isoformat() if alert.acknowledged_at else None
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to store alert: {e}")
    
    def _update_alert_status(self, alert: GovernanceAlert):
        """Update alert status in database"""
        try:
            with sqlite3.connect(ALERTS_DB) as conn:
                conn.execute('''
                    UPDATE governance_alerts 
                    SET delivery_status = ?, delivered_at = ?, retry_count = ?
                    WHERE id = ?
                ''', (
                    json.dumps(alert.delivery_status),
                    alert.delivered_at.isoformat() if alert.delivered_at else None,
                    alert.retry_count,
                    alert.id
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to update alert status: {e}")
    
    def _log_delivery_attempt(self, alert_id: str, channel: str, status: str, 
                            delivery_time: float, error_message: str = None):
        """Log delivery attempt"""
        try:
            with sqlite3.connect(ALERTS_DB) as conn:
                conn.execute('''
                    INSERT INTO alert_delivery_log 
                    (alert_id, channel, status, delivery_time, error_message, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    alert_id,
                    channel,
                    status,
                    delivery_time,
                    error_message,
                    datetime.now().isoformat()
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log delivery attempt: {e}")
    
    def start_monitoring(self):
        """Start real-time alert monitoring"""
        self.running = True
        logger.info("Starting real-time alert monitoring")
        
        # Start alert processing thread
        processing_thread = threading.Thread(target=self._process_alert_queue, daemon=True)
        processing_thread.start()
        
        # Start dashboard update thread
        dashboard_thread = threading.Thread(target=self._update_dashboard_metrics, daemon=True)
        dashboard_thread.start()
        
        # Start websocket server
        websocket_thread = threading.Thread(target=self._start_websocket_server, daemon=True)
        websocket_thread.start()
        
        logger.info("Real-time alert monitoring started")
    
    def _process_alert_queue(self):
        """Process queued alerts"""
        while self.running:
            try:
                if self.alert_queue:
                    alert = self.alert_queue.popleft()
                    self._process_alert_immediately(alert)
                else:
                    time.sleep(ALERT_PROCESSING_INTERVAL)
            except Exception as e:
                logger.error(f"Error processing alert queue: {e}")
                time.sleep(ALERT_PROCESSING_INTERVAL)
    
    def _update_dashboard_metrics(self):
        """Update dashboard metrics periodically"""
        while self.running:
            try:
                self._generate_dashboard_metrics()
                time.sleep(DASHBOARD_UPDATE_INTERVAL)
            except Exception as e:
                logger.error(f"Error updating dashboard metrics: {e}")
                time.sleep(DASHBOARD_UPDATE_INTERVAL)
    
    def _generate_dashboard_metrics(self):
        """Generate real-time dashboard metrics"""
        try:
            metrics_file = DASHBOARD_DIR / 'metrics.json'
            
            with sqlite3.connect(ALERTS_DB) as conn:
                # Get recent alert statistics
                cursor = conn.execute('''
                    SELECT severity, COUNT(*) as count
                    FROM governance_alerts 
                    WHERE timestamp > datetime('now', '-1 hour')
                    GROUP BY severity
                ''')
                recent_alerts = {row[0]: row[1] for row in cursor.fetchall()}
                
                # Get delivery statistics
                cursor = conn.execute('''
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
                        AVG(delivery_time) as avg_time
                    FROM alert_delivery_log 
                    WHERE timestamp > datetime('now', '-1 hour')
                ''')
                delivery_stats = cursor.fetchone()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system_status': 'active' if self.running else 'inactive',
                'active_alerts': len(self.active_alerts),
                'recent_alerts': recent_alerts,
                'delivery_stats': {
                    'total_deliveries': delivery_stats[0] if delivery_stats[0] else 0,
                    'successful_deliveries': delivery_stats[1] if delivery_stats[1] else 0,
                    'avg_delivery_time': delivery_stats[2] if delivery_stats[2] else 0.0,
                    'success_rate': (delivery_stats[1] / delivery_stats[0] * 100) if delivery_stats[0] else 100.0
                },
                'connected_clients': len(self.websocket_clients),
                'queue_size': len(self.alert_queue)
            }
            
            with open(metrics_file, 'w') as f:
                json.dump(metrics, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to generate dashboard metrics: {e}")
    
    def _start_websocket_server(self):
        """Start websocket server for real-time dashboard updates"""
        try:
            async def handle_client(websocket, path):
                self.websocket_clients.add(websocket)
                logger.info(f"Dashboard client connected: {websocket.remote_address}")
                
                try:
                    await websocket.wait_closed()
                finally:
                    self.websocket_clients.discard(websocket)
                    logger.info(f"Dashboard client disconnected: {websocket.remote_address}")
            
            start_server = websockets.serve(handle_client, "localhost", WEBSOCKET_PORT)
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(start_server)
            loop.run_forever()
            
        except Exception as e:
            logger.error(f"Failed to start websocket server: {e}")
    
    def stop_monitoring(self):
        """Stop real-time alert monitoring"""
        self.running = False
        logger.info("Stopping real-time alert monitoring")
    
    def cleanup(self):
        """Cleanup resources"""
        self.stop_monitoring()
        
        # Close websocket connections
        for client in self.websocket_clients:
            try:
                asyncio.create_task(client.close())
            except:
                pass
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down gracefully")
        self.cleanup()
        exit(0)

# Convenience functions for external use
def send_governance_alert(alert_type: str, severity: str, title: str, message: str, 
                         source: str, file_path: str = None, violation_data: Dict = None) -> bool:
    """Send a governance alert (convenience function)"""
    try:
        alert_system = RealTimeAlertSystem()
        alert = alert_system.create_alert(alert_type, severity, title, message, source, 
                                        file_path, violation_data)
        return alert_system.send_alert(alert)
    except Exception as e:
        logger.error(f"Failed to send governance alert: {e}")
        return False

def main():
    """Main alert system execution"""
    try:
        alert_system = RealTimeAlertSystem()
        alert_system.start_monitoring()
        
        # Keep running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Alert system stopped by user")
    except Exception as e:
        logger.error(f"Alert system failed: {e}")
        raise

if __name__ == "__main__":
    main()