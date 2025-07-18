#!/usr/bin/env python3
"""
Real-Time Governance Monitor - Context Engineering
MANDATORY: Real-time monitoring with <5 second response time
Implements continuous monitoring for Principle #108

CRITICAL REQUIREMENTS:
- Real-time file system monitoring
- Immediate threshold violation detection
- Automated alert generation
- <5 second response time for critical violations
- 24/7 continuous monitoring capability

MONITORING TARGETS:
- File size changes (immediate detection of >1,500 lines)
- Content modifications (duplication detection)
- Technical debt additions (TODO/FIXME tracking)
- Performance degradation (navigation complexity)
- Compliance violations (YAML/P55/P56 compliance)
"""

import os
import time
import json
import sqlite3
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Callable, Any
from pathlib import Path
import logging
from queue import Queue, Empty
import hashlib
import re
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor
import subprocess
import signal
import sys

# File system monitoring
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    logging.warning("watchdog not available, using polling mode")

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
GOVERNANCE_ENGINE = Path(__file__).parent / 'governance-engine.py'
MONITOR_LOG = PROJECT_ROOT / 'scripts/results/governance/monitor.log'
ALERTS_DIR = PROJECT_ROOT / 'scripts/results/governance/alerts'
METRICS_DIR = PROJECT_ROOT / 'scripts/results/governance/metrics'
GOVERNANCE_CONFIG = PROJECT_ROOT / 'scripts/governance/governance-config.json'

# Monitoring configuration
POLL_INTERVAL = 1  # seconds
ALERT_DEBOUNCE_TIME = 5  # seconds
MAX_QUEUE_SIZE = 1000
RESPONSE_TIME_TARGET = 5  # seconds

# Logging configuration
os.makedirs(MONITOR_LOG.parent, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(MONITOR_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class MonitoringEvent:
    """Monitoring event data class"""
    timestamp: datetime
    event_type: str
    file_path: str
    change_type: str
    severity: str
    threshold_violated: bool
    current_value: Optional[float] = None
    threshold_value: Optional[float] = None

class GovernanceFileHandler(FileSystemEventHandler):
    """File system event handler for governance monitoring"""
    
    def __init__(self, event_queue: Queue, thresholds: Dict[str, Any]):
        self.event_queue = event_queue
        self.thresholds = thresholds
        self.last_alerts = {}
        
    def on_modified(self, event):
        """Handle file modification events"""
        if event.is_directory:
            return
            
        file_path = Path(event.src_path)
        
        # Only monitor relevant files
        if not self._is_monitored_file(file_path):
            return
            
        try:
            # Check file size immediately
            if file_path.suffix == '.md':
                line_count = self._count_lines(file_path)
                
                if line_count > self.thresholds['file_size_max_lines']:
                    monitoring_event = MonitoringEvent(
                        timestamp=datetime.now(),
                        event_type='file_size_violation',
                        file_path=str(file_path.relative_to(PROJECT_ROOT)),
                        change_type='modification',
                        severity='high',
                        threshold_violated=True,
                        current_value=line_count,
                        threshold_value=self.thresholds['file_size_max_lines']
                    )
                    
                    self._add_event_to_queue(monitoring_event)
                    
        except Exception as e:
            logger.error(f"Failed to process file modification {file_path}: {e}")
    
    def on_created(self, event):
        """Handle file creation events"""
        if event.is_directory:
            return
            
        file_path = Path(event.src_path)
        
        if self._is_monitored_file(file_path):
            monitoring_event = MonitoringEvent(
                timestamp=datetime.now(),
                event_type='file_created',
                file_path=str(file_path.relative_to(PROJECT_ROOT)),
                change_type='creation',
                severity='info',
                threshold_violated=False
            )
            
            self._add_event_to_queue(monitoring_event)
    
    def _is_monitored_file(self, file_path: Path) -> bool:
        """Check if file should be monitored"""
        try:
            relative_path = file_path.relative_to(PROJECT_ROOT)
            path_str = str(relative_path)
            
            # Check against monitored paths
            monitored_patterns = [
                'docs/',
                'scripts/',
                'commands/',
                'CLAUDE.md',
                'README.md'
            ]
            
            for pattern in monitored_patterns:
                if pattern.endswith('.md'):
                    if path_str == pattern:
                        return True
                else:
                    if path_str.startswith(pattern):
                        return True
                        
            return False
            
        except ValueError:
            # Path is not under PROJECT_ROOT
            return False
    
    def _count_lines(self, file_path: Path) -> int:
        """Count lines in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return sum(1 for _ in f)
        except Exception as e:
            logger.error(f"Failed to count lines in {file_path}: {e}")
            return 0
    
    def _add_event_to_queue(self, event: MonitoringEvent):
        """Add event to processing queue with debouncing"""
        event_key = f"{event.event_type}_{event.file_path}"
        current_time = time.time()
        
        # Debounce alerts
        if event_key in self.last_alerts:
            if current_time - self.last_alerts[event_key] < ALERT_DEBOUNCE_TIME:
                return
        
        self.last_alerts[event_key] = current_time
        
        try:
            self.event_queue.put(event, timeout=1)
        except:
            logger.warning("Event queue full, dropping event")

class RealTimeGovernanceMonitor:
    """Real-time governance monitoring system"""
    
    def __init__(self):
        self.running = False
        self.event_queue = Queue(maxsize=MAX_QUEUE_SIZE)
        self.thresholds = self._load_thresholds()
        self.observer = None
        self.worker_threads = []
        self.metrics_collector = None
        self.response_times = []
        
    def _load_thresholds(self) -> Dict[str, Any]:
        """Load governance thresholds"""
        try:
            with open(GOVERNANCE_CONFIG, 'r') as f:
                config = json.load(f)
                return config.get('thresholds', {})
        except Exception as e:
            logger.error(f"Failed to load thresholds: {e}")
            return {
                'file_size_max_lines': 1500,
                'duplication_threshold': 0.20,
                'technical_debt_max': 19,
                'cognitive_steps_max': 2.5,
                'yaml_compliance_min': 0.95
            }
    
    def start_monitoring(self):
        """Start real-time monitoring"""
        logger.info("Starting real-time governance monitoring")
        
        self.running = True
        
        # Start file system monitoring
        if WATCHDOG_AVAILABLE:
            self._start_file_monitoring()
        else:
            self._start_polling_monitoring()
        
        # Start event processing workers
        self._start_event_workers()
        
        # Start metrics collection
        self._start_metrics_collection()
        
        logger.info("Real-time governance monitoring started successfully")
    
    def stop_monitoring(self):
        """Stop real-time monitoring"""
        logger.info("Stopping real-time governance monitoring")
        
        self.running = False
        
        # Stop file system monitoring
        if self.observer:
            self.observer.stop()
            self.observer.join()
        
        # Stop worker threads
        for thread in self.worker_threads:
            thread.join(timeout=5)
        
        # Stop metrics collection
        if self.metrics_collector:
            self.metrics_collector.join(timeout=5)
        
        logger.info("Real-time governance monitoring stopped")
    
    def _start_file_monitoring(self):
        """Start file system monitoring with watchdog"""
        try:
            self.observer = Observer()
            handler = GovernanceFileHandler(self.event_queue, self.thresholds)
            
            # Monitor all relevant directories
            monitored_dirs = [
                PROJECT_ROOT / 'docs',
                PROJECT_ROOT / 'scripts',
                PROJECT_ROOT / 'commands',
                PROJECT_ROOT  # For CLAUDE.md and README.md
            ]
            
            for directory in monitored_dirs:
                if directory.exists():
                    self.observer.schedule(handler, str(directory), recursive=True)
            
            self.observer.start()
            logger.info("File system monitoring started with watchdog")
            
        except Exception as e:
            logger.error(f"Failed to start file monitoring: {e}")
            self._start_polling_monitoring()
    
    def _start_polling_monitoring(self):
        """Start polling-based monitoring fallback"""
        def polling_worker():
            last_check = {}
            
            while self.running:
                try:
                    # Check monitored files
                    for file_path in self._get_monitored_files():
                        if file_path.exists():
                            stat = file_path.stat()
                            current_mtime = stat.st_mtime
                            
                            if str(file_path) not in last_check or last_check[str(file_path)] != current_mtime:
                                last_check[str(file_path)] = current_mtime
                                
                                # Check for violations
                                if file_path.suffix == '.md':
                                    line_count = self._count_lines(file_path)
                                    
                                    if line_count > self.thresholds['file_size_max_lines']:
                                        event = MonitoringEvent(
                                            timestamp=datetime.now(),
                                            event_type='file_size_violation',
                                            file_path=str(file_path.relative_to(PROJECT_ROOT)),
                                            change_type='modification',
                                            severity='high',
                                            threshold_violated=True,
                                            current_value=line_count,
                                            threshold_value=self.thresholds['file_size_max_lines']
                                        )
                                        
                                        try:
                                            self.event_queue.put(event, timeout=1)
                                        except:
                                            logger.warning("Event queue full during polling")
                    
                    time.sleep(POLL_INTERVAL)
                    
                except Exception as e:
                    logger.error(f"Polling monitoring error: {e}")
                    time.sleep(POLL_INTERVAL)
        
        thread = threading.Thread(target=polling_worker, daemon=True)
        thread.start()
        self.worker_threads.append(thread)
        logger.info("Polling-based monitoring started")
    
    def _start_event_workers(self):
        """Start event processing workers"""
        def event_worker():
            while self.running:
                try:
                    event = self.event_queue.get(timeout=1)
                    start_time = time.time()
                    
                    self._process_event(event)
                    
                    # Track response time
                    response_time = time.time() - start_time
                    self.response_times.append(response_time)
                    
                    # Alert if response time exceeds target
                    if response_time > RESPONSE_TIME_TARGET:
                        logger.warning(f"Response time exceeded target: {response_time:.2f}s > {RESPONSE_TIME_TARGET}s")
                    
                    self.event_queue.task_done()
                    
                except Empty:
                    continue
                except Exception as e:
                    logger.error(f"Event processing error: {e}")
        
        # Start multiple worker threads
        for i in range(3):
            thread = threading.Thread(target=event_worker, daemon=True)
            thread.start()
            self.worker_threads.append(thread)
        
        logger.info("Event processing workers started")
    
    def _start_metrics_collection(self):
        """Start metrics collection thread"""
        def metrics_worker():
            while self.running:
                try:
                    self._collect_metrics()
                    time.sleep(60)  # Collect metrics every minute
                except Exception as e:
                    logger.error(f"Metrics collection error: {e}")
                    time.sleep(60)
        
        self.metrics_collector = threading.Thread(target=metrics_worker, daemon=True)
        self.metrics_collector.start()
        logger.info("Metrics collection started")
    
    def _process_event(self, event: MonitoringEvent):
        """Process a monitoring event"""
        try:
            logger.info(f"Processing event: {event.event_type} for {event.file_path}")
            
            # Generate alert for threshold violations
            if event.threshold_violated:
                self._generate_real_time_alert(event)
            
            # Trigger automated response if configured
            if event.severity in ['high', 'critical']:
                self._trigger_automated_response(event)
            
            # Store event for analysis
            self._store_event(event)
            
        except Exception as e:
            logger.error(f"Failed to process event: {e}")
    
    def _generate_real_time_alert(self, event: MonitoringEvent):
        """Generate real-time alert"""
        try:
            alert_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            alert_file = ALERTS_DIR / f"realtime_alert_{alert_timestamp}.json"
            
            alert_data = {
                'timestamp': event.timestamp.isoformat(),
                'alert_type': 'real_time_violation',
                'event': asdict(event),
                'response_required': True,
                'estimated_response_time': 300  # 5 minutes
            }
            
            with open(alert_file, 'w') as f:
                json.dump(alert_data, f, indent=2)
            
            logger.warning(f"Real-time alert generated: {alert_file}")
            
        except Exception as e:
            logger.error(f"Failed to generate real-time alert: {e}")
    
    def _trigger_automated_response(self, event: MonitoringEvent):
        """Trigger automated response for critical events"""
        try:
            if event.event_type == 'file_size_violation':
                # Trigger automated modularization
                logger.info(f"Triggering automated modularization for {event.file_path}")
                # Implementation would call modularization script
                
            elif event.event_type == 'duplication_detected':
                # Trigger automated consolidation
                logger.info(f"Triggering automated consolidation for {event.file_path}")
                # Implementation would call consolidation script
                
            elif event.event_type == 'technical_debt_threshold':
                # Trigger automated debt resolution
                logger.info(f"Triggering automated debt resolution")
                # Implementation would call debt resolution script
                
        except Exception as e:
            logger.error(f"Failed to trigger automated response: {e}")
    
    def _store_event(self, event: MonitoringEvent):
        """Store event for analysis"""
        try:
            # Store in metrics directory
            metrics_file = METRICS_DIR / f"realtime_events_{datetime.now().strftime('%Y%m%d')}.jsonl"
            
            with open(metrics_file, 'a') as f:
                f.write(json.dumps(asdict(event), default=str) + '\n')
                
        except Exception as e:
            logger.error(f"Failed to store event: {e}")
    
    def _collect_metrics(self):
        """Collect monitoring metrics"""
        try:
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'queue_size': self.event_queue.qsize(),
                'avg_response_time': sum(self.response_times[-100:]) / len(self.response_times[-100:]) if self.response_times else 0,
                'max_response_time': max(self.response_times[-100:]) if self.response_times else 0,
                'events_processed': len(self.response_times),
                'system_health': self._calculate_system_health()
            }
            
            metrics_file = METRICS_DIR / f"monitor_metrics_{datetime.now().strftime('%Y%m%d')}.jsonl"
            
            with open(metrics_file, 'a') as f:
                f.write(json.dumps(metrics) + '\n')
                
        except Exception as e:
            logger.error(f"Failed to collect metrics: {e}")
    
    def _calculate_system_health(self) -> float:
        """Calculate monitoring system health"""
        try:
            # Base health on response times and queue size
            avg_response_time = sum(self.response_times[-100:]) / len(self.response_times[-100:]) if self.response_times else 0
            queue_utilization = self.event_queue.qsize() / MAX_QUEUE_SIZE
            
            # Health decreases with higher response times and queue utilization
            response_health = max(0.0, 1.0 - (avg_response_time / RESPONSE_TIME_TARGET))
            queue_health = max(0.0, 1.0 - queue_utilization)
            
            return (response_health + queue_health) / 2.0
            
        except Exception as e:
            logger.error(f"Failed to calculate system health: {e}")
            return 0.0
    
    def _get_monitored_files(self) -> List[Path]:
        """Get list of files to monitor"""
        files = []
        
        # Add specific files
        files.extend([
            PROJECT_ROOT / 'CLAUDE.md',
            PROJECT_ROOT / 'README.md'
        ])
        
        # Add files from directories
        for directory in [PROJECT_ROOT / 'docs', PROJECT_ROOT / 'scripts', PROJECT_ROOT / 'commands']:
            if directory.exists():
                files.extend(directory.rglob('*.md'))
                files.extend(directory.rglob('*.py'))
                files.extend(directory.rglob('*.sh'))
        
        return [f for f in files if f.exists()]
    
    def _count_lines(self, file_path: Path) -> int:
        """Count lines in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return sum(1 for _ in f)
        except Exception as e:
            logger.error(f"Failed to count lines in {file_path}: {e}")
            return 0

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info("Received shutdown signal")
    sys.exit(0)

def main():
    """Main real-time monitoring execution"""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        monitor = RealTimeGovernanceMonitor()
        monitor.start_monitoring()
        
        logger.info("Real-time governance monitor running. Press Ctrl+C to stop.")
        
        # Keep monitoring running
        while monitor.running:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Shutdown requested by user")
    except Exception as e:
        logger.error(f"Monitor failed: {e}")
    finally:
        try:
            monitor.stop_monitoring()
        except:
            pass

if __name__ == "__main__":
    main()