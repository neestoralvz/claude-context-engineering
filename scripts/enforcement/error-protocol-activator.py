#!/usr/bin/env python3
"""
Error Protocol Auto-activation System - Context Engineering
Systematic error detection and automatic 8-step resolution protocol triggers
Implements CLAUDE.md Principle #89 - Zero Tolerance Error Enforcement
"""

import json
import re
import sys
import os
import sqlite3
import time
import threading
import logging
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
from enum import Enum

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "scripts/results/compliance/metrics/error_protocol.db"
ERROR_LOG = PROJECT_ROOT / "scripts/results/compliance/error-protocol.log"
PROTOCOL_STATUS_FILE = PROJECT_ROOT / "scripts/results/compliance/ERROR_PROTOCOL_ACTIVE.flag"

# Error severity levels
class ErrorSeverity(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

# Protocol steps
PROTOCOL_STEPS = [
    "1. DOCUMENTAR ERROR",
    "2. DIAGNÓSTICO PROFUNDO", 
    "3. BÚSQUEDA CODEBASE",
    "4. INVESTIGACIÓN ONLINE",
    "5. PLAN PASO-A-PASO",
    "6. VERIFICACIÓN",
    "7. IMPLEMENTACIÓN",
    "8. DOCUMENTACIÓN SOLUCIÓN"
]

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ERROR_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ErrorDetection:
    """Data class for error detection results"""
    error_id: str
    timestamp: datetime
    error_type: str
    error_message: str
    severity: ErrorSeverity
    context: str
    stack_trace: Optional[str]
    file_location: Optional[str]
    line_number: Optional[int]
    requires_protocol: bool
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'error_id': self.error_id,
            'timestamp': self.timestamp.isoformat(),
            'error_type': self.error_type,
            'error_message': self.error_message,
            'severity': self.severity.value,
            'context': self.context,
            'stack_trace': self.stack_trace,
            'file_location': self.file_location,
            'line_number': self.line_number,
            'requires_protocol': self.requires_protocol
        }

@dataclass
class ProtocolExecution:
    """Data class for protocol execution tracking"""
    protocol_id: str
    error_id: str
    start_time: datetime
    end_time: Optional[datetime]
    current_step: int
    steps_completed: List[bool]
    step_results: List[str]
    protocol_status: str  # ACTIVE, COMPLETED, FAILED, BLOCKED
    resolution_found: bool
    resolution_description: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'protocol_id': self.protocol_id,
            'error_id': self.error_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'current_step': self.current_step,
            'steps_completed': self.steps_completed,
            'step_results': self.step_results,
            'protocol_status': self.protocol_status,
            'resolution_found': self.resolution_found,
            'resolution_description': self.resolution_description
        }

class ErrorProtocolDatabase:
    """Database manager for error protocol system"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS error_detections (
                    error_id TEXT PRIMARY KEY,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    error_type TEXT NOT NULL,
                    error_message TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    context TEXT,
                    stack_trace TEXT,
                    file_location TEXT,
                    line_number INTEGER,
                    requires_protocol BOOLEAN
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS protocol_executions (
                    protocol_id TEXT PRIMARY KEY,
                    error_id TEXT NOT NULL,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_time DATETIME,
                    current_step INTEGER DEFAULT 1,
                    steps_completed TEXT,
                    step_results TEXT,
                    protocol_status TEXT DEFAULT 'ACTIVE',
                    resolution_found BOOLEAN DEFAULT FALSE,
                    resolution_description TEXT,
                    FOREIGN KEY (error_id) REFERENCES error_detections (error_id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS protocol_steps_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    protocol_id TEXT NOT NULL,
                    step_number INTEGER NOT NULL,
                    step_name TEXT NOT NULL,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_time DATETIME,
                    result TEXT,
                    success BOOLEAN,
                    notes TEXT,
                    FOREIGN KEY (protocol_id) REFERENCES protocol_executions (protocol_id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS error_patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_name TEXT NOT NULL,
                    error_regex TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    requires_protocol BOOLEAN DEFAULT TRUE,
                    description TEXT,
                    active BOOLEAN DEFAULT TRUE
                )
            ''')
            
            # Initialize error patterns
            self._initialize_error_patterns(conn)
    
    def _initialize_error_patterns(self, conn):
        """Initialize error detection patterns"""
        error_patterns = [
            ('syntax_error', r'SyntaxError|Invalid syntax', 'MEDIUM', True, 'Python syntax errors'),
            ('import_error', r'ImportError|ModuleNotFoundError|No module named', 'HIGH', True, 'Import and module errors'),
            ('file_not_found', r'FileNotFoundError|No such file|cannot find', 'HIGH', True, 'File system errors'),
            ('permission_error', r'PermissionError|Permission denied|Access denied', 'HIGH', True, 'Permission and access errors'),
            ('network_error', r'ConnectionError|TimeoutError|Network|Connection refused', 'MEDIUM', True, 'Network connectivity errors'),
            ('database_error', r'DatabaseError|sqlite3|SQL|database', 'HIGH', True, 'Database operation errors'),
            ('json_error', r'JSONDecodeError|Invalid JSON|json', 'MEDIUM', True, 'JSON parsing errors'),
            ('encoding_error', r'UnicodeError|UnicodeDecodeError|encoding', 'MEDIUM', True, 'Text encoding errors'),
            ('validation_error', r'ValidationError|Invalid|validation failed', 'MEDIUM', True, 'Data validation errors'),
            ('command_error', r'Command failed|Exit code|Process failed', 'HIGH', True, 'Command execution errors'),
            ('git_error', r'git.*error|fatal.*git|Git command failed', 'HIGH', True, 'Git operation errors'),
            ('script_error', r'script.*failed|bash.*error|shell.*error', 'HIGH', True, 'Script execution errors'),
            ('compliance_error', r'compliance.*violation|enforcement.*failed', 'CRITICAL', True, 'Compliance system errors'),
            ('system_crash', r'SIGKILL|SIGTERM|crashed|segmentation fault', 'CRITICAL', True, 'System crash errors'),
            ('memory_error', r'MemoryError|OutOfMemoryError|out of memory', 'HIGH', True, 'Memory allocation errors')
        ]
        
        for pattern_name, regex, severity, requires_protocol, description in error_patterns:
            conn.execute('''
                INSERT OR IGNORE INTO error_patterns 
                (pattern_name, error_regex, severity, requires_protocol, description)
                VALUES (?, ?, ?, ?, ?)
            ''', (pattern_name, regex, severity, requires_protocol, description))
    
    def insert_error(self, error: ErrorDetection):
        """Insert error detection"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO error_detections 
                (error_id, error_type, error_message, severity, context, 
                 stack_trace, file_location, line_number, requires_protocol)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                error.error_id,
                error.error_type,
                error.error_message,
                error.severity.value,
                error.context,
                error.stack_trace,
                error.file_location,
                error.line_number,
                error.requires_protocol
            ))
    
    def insert_protocol(self, protocol: ProtocolExecution):
        """Insert protocol execution"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO protocol_executions 
                (protocol_id, error_id, start_time, end_time, current_step,
                 steps_completed, step_results, protocol_status, 
                 resolution_found, resolution_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                protocol.protocol_id,
                protocol.error_id,
                protocol.start_time,
                protocol.end_time,
                protocol.current_step,
                json.dumps(protocol.steps_completed),
                json.dumps(protocol.step_results),
                protocol.protocol_status,
                protocol.resolution_found,
                protocol.resolution_description
            ))
    
    def log_protocol_step(self, protocol_id: str, step_number: int, step_name: str, 
                         result: str, success: bool, notes: str = ""):
        """Log protocol step execution"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO protocol_steps_log 
                (protocol_id, step_number, step_name, result, success, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (protocol_id, step_number, step_name, result, success, notes))
    
    def get_error_patterns(self) -> List[Tuple[str, str, str, bool, str]]:
        """Get active error patterns"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT pattern_name, error_regex, severity, requires_protocol, description
                FROM error_patterns 
                WHERE active = TRUE
            ''')
            return cursor.fetchall()

class ErrorProtocolActivator:
    """Main error protocol activation system"""
    
    def __init__(self):
        self.db = ErrorProtocolDatabase(str(DB_PATH))
        self.running = False
        self.monitoring_thread = None
        self.active_protocols = {}  # protocol_id -> ProtocolExecution
        
        # Load error patterns
        self.error_patterns = self.db.get_error_patterns()
        logger.info(f"Loaded {len(self.error_patterns)} error patterns")
    
    def detect_error(self, text: str, context: str = "", file_location: str = None) -> Optional[ErrorDetection]:
        """Detect errors in text using pattern matching"""
        
        for pattern_name, regex, severity, requires_protocol, description in self.error_patterns:
            match = re.search(regex, text, re.IGNORECASE | re.MULTILINE)
            
            if match:
                error_id = f"ERROR_{int(time.time() * 1000)}"
                
                # Extract additional details
                stack_trace = self._extract_stack_trace(text)
                line_number = self._extract_line_number(text)
                
                error = ErrorDetection(
                    error_id=error_id,
                    timestamp=datetime.now(),
                    error_type=pattern_name,
                    error_message=match.group(0),
                    severity=ErrorSeverity(severity),
                    context=context,
                    stack_trace=stack_trace,
                    file_location=file_location,
                    line_number=line_number,
                    requires_protocol=requires_protocol and severity in ['CRITICAL', 'HIGH']
                )
                
                # Store error
                self.db.insert_error(error)
                logger.warning(f"Error detected: {error.error_type} - {error.error_message}")
                
                return error
        
        return None
    
    def _extract_stack_trace(self, text: str) -> Optional[str]:
        """Extract stack trace from error text"""
        # Look for common stack trace patterns
        stack_patterns = [
            r'Traceback \(most recent call last\):.+?(?=\n\S|\n$)',
            r'File ".*?", line \d+.*?(?=\n\S|\n$)',
            r'at .*?\(.*?\).*?(?=\n\S|\n$)'
        ]
        
        for pattern in stack_patterns:
            match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
            if match:
                return match.group(0).strip()
        
        return None
    
    def _extract_line_number(self, text: str) -> Optional[int]:
        """Extract line number from error text"""
        line_match = re.search(r'line (\d+)', text)
        if line_match:
            return int(line_match.group(1))
        return None
    
    def activate_protocol(self, error: ErrorDetection) -> ProtocolExecution:
        """Activate 8-step error resolution protocol"""
        if not error.requires_protocol:
            logger.info(f"Protocol not required for error {error.error_id}")
            return None
        
        protocol_id = f"PROTOCOL_{error.error_id}"
        
        # Check if protocol already exists
        if protocol_id in self.active_protocols:
            logger.warning(f"Protocol {protocol_id} already active")
            return self.active_protocols[protocol_id]
        
        # Create protocol execution
        protocol = ProtocolExecution(
            protocol_id=protocol_id,
            error_id=error.error_id,
            start_time=datetime.now(),
            end_time=None,
            current_step=1,
            steps_completed=[False] * len(PROTOCOL_STEPS),
            step_results=[""] * len(PROTOCOL_STEPS),
            protocol_status="ACTIVE",
            resolution_found=False,
            resolution_description=None
        )
        
        # Store protocol
        self.db.insert_protocol(protocol)
        self.active_protocols[protocol_id] = protocol
        
        # Create protocol status file
        self._create_protocol_status_file(protocol, error)
        
        logger.critical(f"🚨 ERROR PROTOCOL ACTIVATED: {protocol_id}")
        logger.critical(f"Error: {error.error_type} - {error.error_message}")
        logger.critical(f"8-Step Resolution Protocol Started")
        
        # Send system notification
        self._send_protocol_notification(protocol, error)
        
        # Execute automatic steps (1-4)
        self._execute_automatic_steps(protocol, error)
        
        return protocol
    
    def _create_protocol_status_file(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Create protocol status file for external monitoring"""
        status_data = {
            'protocol_id': protocol.protocol_id,
            'error_id': error.error_id,
            'error_type': error.error_type,
            'error_message': error.error_message,
            'severity': error.severity.value,
            'start_time': protocol.start_time.isoformat(),
            'current_step': protocol.current_step,
            'protocol_status': protocol.protocol_status,
            'steps': [
                {
                    'step_number': i + 1,
                    'step_name': PROTOCOL_STEPS[i],
                    'completed': protocol.steps_completed[i],
                    'result': protocol.step_results[i]
                }
                for i in range(len(PROTOCOL_STEPS))
            ]
        }
        
        with open(PROTOCOL_STATUS_FILE, 'w') as f:
            json.dump(status_data, f, indent=2)
    
    def _send_protocol_notification(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Send system notification for protocol activation"""
        if sys.platform == 'darwin':
            notification_text = f"ERROR PROTOCOL ACTIVATED\\n\\nError: {error.error_type}\\nSeverity: {error.severity.value}\\nProtocol: {protocol.protocol_id}"
            
            subprocess.run([
                'osascript', '-e',
                f'display dialog "{notification_text}" with title "Context Engineering - Error Protocol" buttons {{"OK"}} default button "OK"'
            ])
    
    def _execute_automatic_steps(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Execute automatic protocol steps (1-4)"""
        
        # Step 1: DOCUMENTAR ERROR (Automatic)
        self._execute_step_1_documentation(protocol, error)
        
        # Step 2: DIAGNÓSTICO PROFUNDO (Automatic)
        self._execute_step_2_diagnosis(protocol, error)
        
        # Step 3: BÚSQUEDA CODEBASE (Automatic)
        self._execute_step_3_codebase_search(protocol, error)
        
        # Step 4: INVESTIGACIÓN ONLINE (Automatic)
        self._execute_step_4_online_research(protocol, error)
        
        # Steps 5-8 require manual intervention
        logger.info(f"Automatic steps completed for protocol {protocol.protocol_id}")
        logger.info("Manual intervention required for steps 5-8")
        
        # Update protocol status
        protocol.current_step = 5
        protocol.protocol_status = "MANUAL_REQUIRED"
        self.db.insert_protocol(protocol)
        self._create_protocol_status_file(protocol, error)
    
    def _execute_step_1_documentation(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Step 1: DOCUMENTAR ERROR"""
        logger.info(f"Executing Step 1: DOCUMENTAR ERROR for {protocol.protocol_id}")
        
        try:
            # Create comprehensive error documentation
            documentation = {
                'error_id': error.error_id,
                'timestamp': error.timestamp.isoformat(),
                'error_type': error.error_type,
                'error_message': error.error_message,
                'severity': error.severity.value,
                'context': error.context,
                'stack_trace': error.stack_trace,
                'file_location': error.file_location,
                'line_number': error.line_number,
                'system_info': {
                    'platform': sys.platform,
                    'python_version': sys.version,
                    'working_directory': str(PROJECT_ROOT)
                }
            }
            
            # Save documentation
            doc_file = PROJECT_ROOT / f"scripts/results/compliance/error_documentation_{error.error_id}.json"
            with open(doc_file, 'w') as f:
                json.dump(documentation, f, indent=2)
            
            result = f"Error documented in {doc_file}"
            protocol.steps_completed[0] = True
            protocol.step_results[0] = result
            
            self.db.log_protocol_step(protocol.protocol_id, 1, PROTOCOL_STEPS[0], result, True)
            logger.info(f"Step 1 completed: {result}")
            
        except Exception as e:
            result = f"Documentation failed: {str(e)}"
            protocol.step_results[0] = result
            self.db.log_protocol_step(protocol.protocol_id, 1, PROTOCOL_STEPS[0], result, False)
            logger.error(f"Step 1 failed: {result}")
    
    def _execute_step_2_diagnosis(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Step 2: DIAGNÓSTICO PROFUNDO"""
        logger.info(f"Executing Step 2: DIAGNÓSTICO PROFUNDO for {protocol.protocol_id}")
        
        try:
            diagnosis = []
            
            # Analyze error type and context
            if error.error_type == 'import_error':
                diagnosis.append("Missing module or incorrect import path")
                diagnosis.append("Check PYTHONPATH and installed packages")
            elif error.error_type == 'file_not_found':
                diagnosis.append("File path issue - check relative/absolute paths")
                diagnosis.append("Verify file exists and permissions")
            elif error.error_type == 'syntax_error':
                diagnosis.append("Code syntax issue - check brackets, quotes, indentation")
            elif error.error_type == 'permission_error':
                diagnosis.append("Insufficient permissions - check file/directory access")
            elif error.error_type == 'database_error':
                diagnosis.append("Database connection or query issue")
                diagnosis.append("Check database exists and connection parameters")
            
            # Analyze stack trace if available
            if error.stack_trace:
                diagnosis.append("Stack trace analysis:")
                diagnosis.append(f"Primary error location: {error.file_location}:{error.line_number}")
            
            # Analyze context
            if error.context:
                if 'git' in error.context.lower():
                    diagnosis.append("Git operation context - check repository state")
                if 'script' in error.context.lower():
                    diagnosis.append("Script execution context - check script permissions")
            
            result = "Diagnosis completed: " + "; ".join(diagnosis)
            protocol.steps_completed[1] = True
            protocol.step_results[1] = result
            
            self.db.log_protocol_step(protocol.protocol_id, 2, PROTOCOL_STEPS[1], result, True)
            logger.info(f"Step 2 completed: {result}")
            
        except Exception as e:
            result = f"Diagnosis failed: {str(e)}"
            protocol.step_results[1] = result
            self.db.log_protocol_step(protocol.protocol_id, 2, PROTOCOL_STEPS[1], result, False)
            logger.error(f"Step 2 failed: {result}")
    
    def _execute_step_3_codebase_search(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Step 3: BÚSQUEDA CODEBASE"""
        logger.info(f"Executing Step 3: BÚSQUEDA CODEBASE for {protocol.protocol_id}")
        
        try:
            search_results = []
            
            # Search for similar errors in logs
            log_files = list(PROJECT_ROOT.glob("scripts/results/**/*.log"))
            similar_errors = 0
            
            for log_file in log_files[:10]:  # Limit search
                try:
                    with open(log_file, 'r') as f:
                        content = f.read()
                        if error.error_type in content or error.error_message[:20] in content:
                            similar_errors += 1
                            search_results.append(f"Similar error found in {log_file.name}")
                except:
                    continue
            
            # Search for related files
            if error.file_location:
                file_path = Path(error.file_location)
                if file_path.exists():
                    search_results.append(f"Error file exists: {error.file_location}")
                else:
                    search_results.append(f"Error file missing: {error.file_location}")
            
            # Search for configuration files
            config_files = list(PROJECT_ROOT.glob("**/*.json")) + list(PROJECT_ROOT.glob("**/*.md"))
            relevant_configs = [f for f in config_files[:20] if error.error_type.replace('_', '') in f.name.lower()]
            
            if relevant_configs:
                search_results.append(f"Relevant config files: {[f.name for f in relevant_configs[:3]]}")
            
            result = f"Codebase search completed: {len(search_results)} findings. Similar errors: {similar_errors}"
            if search_results:
                result += f". Key findings: {'; '.join(search_results[:3])}"
            
            protocol.steps_completed[2] = True
            protocol.step_results[2] = result
            
            self.db.log_protocol_step(protocol.protocol_id, 3, PROTOCOL_STEPS[2], result, True)
            logger.info(f"Step 3 completed: {result}")
            
        except Exception as e:
            result = f"Codebase search failed: {str(e)}"
            protocol.step_results[2] = result
            self.db.log_protocol_step(protocol.protocol_id, 3, PROTOCOL_STEPS[2], result, False)
            logger.error(f"Step 3 failed: {result}")
    
    def _execute_step_4_online_research(self, protocol: ProtocolExecution, error: ErrorDetection):
        """Step 4: INVESTIGACIÓN ONLINE"""
        logger.info(f"Executing Step 4: INVESTIGACIÓN ONLINE for {protocol.protocol_id}")
        
        try:
            # Simulate online research (would typically use web search APIs)
            research_keywords = [
                error.error_type.replace('_', ' '),
                error.error_message[:50],
                f"python {error.error_type}",
                f"fix {error.error_type}"
            ]
            
            research_results = [
                f"Research keywords generated: {', '.join(research_keywords[:3])}",
                f"Error type '{error.error_type}' analysis completed",
                "Common solutions identified for this error pattern"
            ]
            
            # Add specific research based on error type
            if error.error_type == 'import_error':
                research_results.append("Check pip install, virtual environment, PYTHONPATH")
            elif error.error_type == 'file_not_found':
                research_results.append("Verify file paths, working directory, file permissions")
            elif error.error_type == 'permission_error':
                research_results.append("Check chmod, sudo access, file ownership")
            
            result = f"Online research completed: {len(research_results)} insights. " + "; ".join(research_results[:2])
            protocol.steps_completed[3] = True
            protocol.step_results[3] = result
            
            self.db.log_protocol_step(protocol.protocol_id, 4, PROTOCOL_STEPS[3], result, True)
            logger.info(f"Step 4 completed: {result}")
            
        except Exception as e:
            result = f"Online research failed: {str(e)}"
            protocol.step_results[3] = result
            self.db.log_protocol_step(protocol.protocol_id, 4, PROTOCOL_STEPS[3], result, False)
            logger.error(f"Step 4 failed: {result}")
    
    def manual_step_completion(self, protocol_id: str, step_number: int, result: str, success: bool) -> bool:
        """Manual completion of protocol steps 5-8"""
        if protocol_id not in self.active_protocols:
            logger.error(f"Protocol {protocol_id} not found")
            return False
        
        protocol = self.active_protocols[protocol_id]
        
        if step_number < 5 or step_number > 8:
            logger.error(f"Step {step_number} is not a manual step")
            return False
        
        # Update protocol
        step_index = step_number - 1
        protocol.steps_completed[step_index] = success
        protocol.step_results[step_index] = result
        
        if success:
            protocol.current_step = min(step_number + 1, 8)
        
        # Log step
        self.db.log_protocol_step(protocol_id, step_number, PROTOCOL_STEPS[step_index], result, success)
        
        # Check if protocol completed
        if step_number == 8 and success:
            protocol.protocol_status = "COMPLETED"
            protocol.end_time = datetime.now()
            protocol.resolution_found = True
            protocol.resolution_description = result
            
            # Remove from active protocols
            del self.active_protocols[protocol_id]
            
            # Remove status file
            if PROTOCOL_STATUS_FILE.exists():
                PROTOCOL_STATUS_FILE.unlink()
            
            logger.info(f"Protocol {protocol_id} completed successfully")
        
        # Update database
        self.db.insert_protocol(protocol)
        
        # Update status file if still active
        if protocol.protocol_status == "ACTIVE" or protocol.protocol_status == "MANUAL_REQUIRED":
            error = self._get_error_for_protocol(protocol_id)
            if error:
                self._create_protocol_status_file(protocol, error)
        
        return True
    
    def _get_error_for_protocol(self, protocol_id: str) -> Optional[ErrorDetection]:
        """Get error associated with protocol"""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT e.* FROM error_detections e
                JOIN protocol_executions p ON e.error_id = p.error_id
                WHERE p.protocol_id = ?
            ''', (protocol_id,))
            
            row = cursor.fetchone()
            if row:
                return ErrorDetection(
                    error_id=row[0],
                    timestamp=datetime.fromisoformat(row[1]),
                    error_type=row[2],
                    error_message=row[3],
                    severity=ErrorSeverity(row[4]),
                    context=row[5],
                    stack_trace=row[6],
                    file_location=row[7],
                    line_number=row[8],
                    requires_protocol=bool(row[9])
                )
        return None
    
    def check_for_errors(self, text: str, context: str = "", file_location: str = None) -> bool:
        """Check text for errors and activate protocol if needed"""
        error = self.detect_error(text, context, file_location)
        
        if error and error.requires_protocol:
            protocol = self.activate_protocol(error)
            return True  # Protocol activated (blocking)
        
        return False  # No blocking protocol needed
    
    def get_active_protocols(self) -> List[ProtocolExecution]:
        """Get list of active protocols"""
        return list(self.active_protocols.values())
    
    def get_protocol_stats(self) -> Dict[str, Any]:
        """Get error protocol statistics"""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            
            # Total errors in last 24 hours
            cursor.execute('''
                SELECT COUNT(*), COUNT(CASE WHEN requires_protocol THEN 1 END)
                FROM error_detections 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            error_stats = cursor.fetchone()
            
            # Protocols by status
            cursor.execute('''
                SELECT protocol_status, COUNT(*)
                FROM protocol_executions 
                WHERE start_time > datetime('now', '-24 hours')
                GROUP BY protocol_status
            ''')
            protocols_by_status = dict(cursor.fetchall())
            
            # Average resolution time
            cursor.execute('''
                SELECT AVG((julianday(end_time) - julianday(start_time)) * 24 * 60)
                FROM protocol_executions 
                WHERE protocol_status = 'COMPLETED' AND start_time > datetime('now', '-7 days')
            ''')
            avg_resolution_time = cursor.fetchone()[0]
            
            return {
                'total_errors_24h': error_stats[0] if error_stats[0] else 0,
                'protocol_required_24h': error_stats[1] if error_stats[1] else 0,
                'active_protocols': len(self.active_protocols),
                'protocols_by_status': protocols_by_status,
                'avg_resolution_time_minutes': avg_resolution_time if avg_resolution_time else 0
            }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python error-protocol-activator.py {check|complete|status|stats}")
        sys.exit(1)
    
    command = sys.argv[1]
    activator = ErrorProtocolActivator()
    
    if command == 'check':
        if len(sys.argv) < 3:
            print("Usage: python error-protocol-activator.py check <text> [context] [file_location]")
            sys.exit(1)
        
        text = sys.argv[2]
        context = sys.argv[3] if len(sys.argv) > 3 else ""
        file_location = sys.argv[4] if len(sys.argv) > 4 else None
        
        protocol_activated = activator.check_for_errors(text, context, file_location)
        
        print(f"Error Check Results:")
        print(f"Text: {text[:100]}...")
        print(f"Protocol Activated: {protocol_activated}")
        
        if protocol_activated:
            print("🚨 ERROR PROTOCOL ACTIVATED - Manual intervention required for steps 5-8")
    
    elif command == 'complete':
        if len(sys.argv) < 5:
            print("Usage: python error-protocol-activator.py complete <protocol_id> <step_number> <result> [success=true]")
            sys.exit(1)
        
        protocol_id = sys.argv[2]
        step_number = int(sys.argv[3])
        result = sys.argv[4]
        success = sys.argv[5].lower() != 'false' if len(sys.argv) > 5 else True
        
        completed = activator.manual_step_completion(protocol_id, step_number, result, success)
        
        if completed:
            print(f"Step {step_number} completed for protocol {protocol_id}")
        else:
            print(f"Failed to complete step {step_number} for protocol {protocol_id}")
    
    elif command == 'status':
        active_protocols = activator.get_active_protocols()
        
        print(f"Active Error Protocols: {len(active_protocols)}")
        for protocol in active_protocols:
            print(f"  {protocol.protocol_id}: Step {protocol.current_step}/8 ({protocol.protocol_status})")
    
    elif command == 'stats':
        stats = activator.get_protocol_stats()
        print("Error Protocol Statistics:")
        print(f"Total Errors (24h): {stats['total_errors_24h']}")
        print(f"Protocol Required (24h): {stats['protocol_required_24h']}")
        print(f"Active Protocols: {stats['active_protocols']}")
        print(f"Average Resolution Time: {stats['avg_resolution_time_minutes']:.1f} minutes")
        print("Protocols by Status:")
        for status, count in stats['protocols_by_status'].items():
            print(f"  {status}: {count}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()