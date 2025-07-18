#!/usr/bin/env python3
"""
Principle Blocking Engine - Context Engineering
Functional enforcement system for CLAUDE.md "Sistema WILL" statements with real-time blocking
Converts enforcement declarations to executable blocking mechanisms
"""

import json
import re
import sys
import os
import sqlite3
import time
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
CLAUDE_MD_PATH = PROJECT_ROOT / "CLAUDE.md"
DB_PATH = PROJECT_ROOT / "scripts/results/compliance/metrics/enforcement_engine.db"
ENFORCEMENT_LOG = PROJECT_ROOT / "scripts/results/compliance/enforcement-engine.log"

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ENFORCEMENT_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class EnforcementRule:
    """Data class for enforcement rules parsed from CLAUDE.md"""
    rule_id: str
    rule_type: str  # WILL, MUST, BLOCKING, CRITICAL, MAXIMUM
    severity: str   # CRITICAL, HIGH, MEDIUM, LOW
    principle_ref: str
    description: str
    trigger_conditions: List[str]
    blocking_actions: List[str]
    auto_remediation: bool = False
    active: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

@dataclass
class EnforcementViolation:
    """Data class for enforcement violations"""
    timestamp: datetime
    rule_id: str
    violation_type: str
    context: str
    blocked_action: str
    remediation_taken: str
    resolved: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'rule_id': self.rule_id,
            'violation_type': self.violation_type,
            'context': self.context,
            'blocked_action': self.blocked_action,
            'remediation_taken': self.remediation_taken,
            'resolved': self.resolved
        }

class EnforcementDatabase:
    """Database manager for enforcement engine"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enforcement_rules (
                    rule_id TEXT PRIMARY KEY,
                    rule_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    principle_ref TEXT,
                    description TEXT NOT NULL,
                    trigger_conditions TEXT,
                    blocking_actions TEXT,
                    auto_remediation BOOLEAN DEFAULT FALSE,
                    active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enforcement_violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    rule_id TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    context TEXT,
                    blocked_action TEXT,
                    remediation_taken TEXT,
                    resolved BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (rule_id) REFERENCES enforcement_rules (rule_id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enforcement_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    total_rules INTEGER,
                    active_rules INTEGER,
                    violations_detected INTEGER,
                    violations_blocked INTEGER,
                    auto_remediations INTEGER,
                    enforcement_rate REAL
                )
            ''')
            
            # Create indexes for performance
            conn.execute('CREATE INDEX IF NOT EXISTS idx_violations_timestamp ON enforcement_violations(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_violations_rule_id ON enforcement_violations(rule_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_rules_active ON enforcement_rules(active)')
    
    def upsert_rule(self, rule: EnforcementRule):
        """Insert or update enforcement rule"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO enforcement_rules 
                (rule_id, rule_type, severity, principle_ref, description, 
                 trigger_conditions, blocking_actions, auto_remediation, active, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                rule.rule_id,
                rule.rule_type,
                rule.severity,
                rule.principle_ref,
                rule.description,
                json.dumps(rule.trigger_conditions),
                json.dumps(rule.blocking_actions),
                rule.auto_remediation,
                rule.active,
                datetime.now()
            ))
    
    def insert_violation(self, violation: EnforcementViolation) -> int:
        """Insert enforcement violation"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO enforcement_violations 
                (rule_id, violation_type, context, blocked_action, remediation_taken, resolved)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                violation.rule_id,
                violation.violation_type,
                violation.context,
                violation.blocked_action,
                violation.remediation_taken,
                violation.resolved
            ))
            return cursor.lastrowid
    
    def get_active_rules(self) -> List[EnforcementRule]:
        """Get all active enforcement rules"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM enforcement_rules WHERE active = TRUE
            ''')
            
            rules = []
            for row in cursor.fetchall():
                rule = EnforcementRule(
                    rule_id=row['rule_id'],
                    rule_type=row['rule_type'],
                    severity=row['severity'],
                    principle_ref=row['principle_ref'],
                    description=row['description'],
                    trigger_conditions=json.loads(row['trigger_conditions']),
                    blocking_actions=json.loads(row['blocking_actions']),
                    auto_remediation=bool(row['auto_remediation']),
                    active=bool(row['active'])
                )
                rules.append(rule)
            
            return rules

class SistemaWillParser:
    """Parser for CLAUDE.md Sistema WILL statements"""
    
    def __init__(self, claude_md_path: str):
        self.claude_md_path = claude_md_path
        self.enforcement_patterns = {
            'WILL': r'Sistema WILL\s+([^.]+)',
            'MUST': r'Sistema MUST\s+([^.]+)',
            'DEBE': r'Sistema DEBE\s+([^.]+)',
            'BLOCKING': r'🚨\s*BLOCKING[:\s]+([^.]+)',
            'CRITICAL': r'🚨\s*CRITICAL[:\s]+([^.]+)',
            'MAXIMUM': r'🚨\s*MAXIMUM[:\s]+([^.]+)',
            'MANDATORY': r'🚨\s*MANDATORY[:\s]+([^.]+)',
            'AUTOMATIC': r'🚨\s*AUTOMATIC[:\s]+([^.]+)',
            'ZERO_TOLERANCE': r'ZERO\s+tolerance\s+([^.]+)'
        }
    
    def parse_enforcement_rules(self) -> List[EnforcementRule]:
        """Parse all enforcement rules from CLAUDE.md"""
        if not os.path.exists(self.claude_md_path):
            logger.error(f"CLAUDE.md not found at {self.claude_md_path}")
            return []
        
        with open(self.claude_md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        rules = []
        rule_counter = 1
        
        for rule_type, pattern in self.enforcement_patterns.items():
            matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                rule_text = match.group(1).strip()
                
                # Extract principle reference if present
                principle_match = re.search(r'\(Principle #(\d+)\)', rule_text)
                principle_ref = f"#{principle_match.group(1)}" if principle_match else None
                
                # Determine severity based on keywords
                severity = self._determine_severity(rule_text, rule_type)
                
                # Generate trigger conditions and blocking actions
                trigger_conditions = self._extract_trigger_conditions(rule_text, rule_type)
                blocking_actions = self._extract_blocking_actions(rule_text, rule_type)
                
                rule = EnforcementRule(
                    rule_id=f"RULE_{rule_counter:03d}_{rule_type}",
                    rule_type=rule_type,
                    severity=severity,
                    principle_ref=principle_ref,
                    description=rule_text[:500],  # Truncate for database
                    trigger_conditions=trigger_conditions,
                    blocking_actions=blocking_actions,
                    auto_remediation=self._determine_auto_remediation(rule_text, rule_type)
                )
                
                rules.append(rule)
                rule_counter += 1
        
        logger.info(f"Parsed {len(rules)} enforcement rules from CLAUDE.md")
        return rules
    
    def _determine_severity(self, rule_text: str, rule_type: str) -> str:
        """Determine severity based on keywords and rule type"""
        rule_text_lower = rule_text.lower()
        
        if any(keyword in rule_text_lower for keyword in ['maximum', 'absolute', 'crítica', 'critical']):
            return 'CRITICAL'
        elif any(keyword in rule_text_lower for keyword in ['blocking', 'mandatory', 'obligatorio']):
            return 'HIGH'
        elif any(keyword in rule_text_lower for keyword in ['required', 'automatic', 'enforcement']):
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _extract_trigger_conditions(self, rule_text: str, rule_type: str) -> List[str]:
        """Extract trigger conditions from rule text"""
        conditions = []
        
        # Common trigger patterns
        if 'command utilization' in rule_text.lower():
            conditions.append('command_utilization_below_70_percent')
        
        if 'complexity' in rule_text.lower():
            conditions.append('complexity_threshold_exceeded')
        
        if 'root' in rule_text.lower() and 'file' in rule_text.lower():
            conditions.append('root_file_creation_attempt')
        
        if 'error' in rule_text.lower():
            conditions.append('error_detected')
        
        if 'density' in rule_text.lower() and 'optimization' in rule_text.lower():
            conditions.append('density_optimization_violation')
        
        if 'parallel' in rule_text.lower() and 'task' in rule_text.lower():
            conditions.append('parallel_task_requirement_detected')
        
        if 'commit' in rule_text.lower():
            conditions.append('commit_operation_required')
        
        if 'tdd' in rule_text.lower():
            conditions.append('tdd_violation_detected')
        
        # If no specific conditions found, add generic condition
        if not conditions:
            conditions.append(f'{rule_type.lower()}_condition_detected')
        
        return conditions
    
    def _extract_blocking_actions(self, rule_text: str, rule_type: str) -> List[str]:
        """Extract blocking actions from rule text"""
        actions = []
        
        # Common blocking patterns
        if 'block' in rule_text.lower():
            actions.append('block_execution')
        
        if 'halt' in rule_text.lower() or 'stop' in rule_text.lower():
            actions.append('halt_operation')
        
        if 'redirect' in rule_text.lower():
            actions.append('redirect_to_compliance')
        
        if 'activate' in rule_text.lower():
            actions.append('activate_compliance_protocol')
        
        if 'enforce' in rule_text.lower():
            actions.append('enforce_compliance')
        
        if 'prevent' in rule_text.lower():
            actions.append('prevent_violation')
        
        # Default actions based on rule type
        if rule_type in ['BLOCKING', 'CRITICAL', 'MAXIMUM']:
            actions.append('immediate_blocking')
        elif rule_type in ['MANDATORY', 'MUST', 'DEBE']:
            actions.append('enforce_requirement')
        elif rule_type in ['WILL', 'AUTOMATIC']:
            actions.append('automatic_correction')
        
        return actions if actions else ['log_violation']
    
    def _determine_auto_remediation(self, rule_text: str, rule_type: str) -> bool:
        """Determine if rule supports auto-remediation"""
        auto_keywords = ['automatic', 'auto', 'automático', 'immediate', 'real-time']
        return any(keyword in rule_text.lower() for keyword in auto_keywords)

class PrincipleBlockingEngine:
    """Main enforcement engine for Context Engineering principles"""
    
    def __init__(self):
        self.db = EnforcementDatabase(str(DB_PATH))
        self.parser = SistemaWillParser(str(CLAUDE_MD_PATH))
        self.active_rules: List[EnforcementRule] = []
        self.running = False
        self.monitoring_thread = None
        
        # Load or refresh rules
        self.refresh_rules()
    
    def refresh_rules(self):
        """Refresh enforcement rules from CLAUDE.md"""
        logger.info("Refreshing enforcement rules from CLAUDE.md...")
        
        # Parse new rules
        new_rules = self.parser.parse_enforcement_rules()
        
        # Store in database
        for rule in new_rules:
            self.db.upsert_rule(rule)
        
        # Load active rules
        self.active_rules = self.db.get_active_rules()
        
        logger.info(f"Loaded {len(self.active_rules)} active enforcement rules")
    
    def check_enforcement(self, context: str, operation: str) -> Tuple[bool, List[str], List[str]]:
        """
        Check if operation violates any enforcement rules
        Returns: (is_blocked, violation_reasons, remediation_actions)
        """
        violations = []
        remediation_actions = []
        is_blocked = False
        
        for rule in self.active_rules:
            # Check if any trigger conditions are met
            triggered = self._check_trigger_conditions(rule, context, operation)
            
            if triggered:
                logger.warning(f"Enforcement rule triggered: {rule.rule_id} - {rule.description[:100]}")
                
                violation = EnforcementViolation(
                    timestamp=datetime.now(),
                    rule_id=rule.rule_id,
                    violation_type=rule.rule_type,
                    context=context[:500],
                    blocked_action=operation[:500],
                    remediation_taken=', '.join(rule.blocking_actions)
                )
                
                # Store violation
                self.db.insert_violation(violation)
                
                violations.append(f"{rule.rule_type}: {rule.description[:100]}")
                remediation_actions.extend(rule.blocking_actions)
                
                # Determine if this should block execution
                if rule.severity in ['CRITICAL', 'HIGH'] or rule.rule_type in ['BLOCKING', 'MAXIMUM', 'CRITICAL']:
                    is_blocked = True
        
        return is_blocked, violations, remediation_actions
    
    def _check_trigger_conditions(self, rule: EnforcementRule, context: str, operation: str) -> bool:
        """Check if rule trigger conditions are met"""
        text_to_check = f"{context} {operation}".lower()
        
        for condition in rule.trigger_conditions:
            if self._evaluate_condition(condition, text_to_check, context, operation):
                return True
        
        return False
    
    def _evaluate_condition(self, condition: str, text: str, context: str, operation: str) -> bool:
        """Evaluate specific trigger condition"""
        
        if condition == 'command_utilization_below_70_percent':
            # Check if single command usage when multiple commands expected
            return self._check_command_utilization(text)
        
        elif condition == 'complexity_threshold_exceeded':
            # Check if operation complexity exceeds threshold
            return self._check_complexity_threshold(text)
        
        elif condition == 'root_file_creation_attempt':
            # Check if attempting to create file in root
            return self._check_root_file_creation(operation)
        
        elif condition == 'error_detected':
            # Check for error patterns
            return any(error_word in text for error_word in ['error', 'failed', 'exception', 'traceback'])
        
        elif condition == 'density_optimization_violation':
            # Check for verbose patterns
            return self._check_density_violation(text)
        
        elif condition == 'parallel_task_requirement_detected':
            # Check if parallel tasks should be used
            return self._check_parallel_task_requirement(text)
        
        elif condition == 'commit_operation_required':
            # Check if commit operations are needed
            return self._check_commit_requirement(text)
        
        elif condition == 'tdd_violation_detected':
            # Check for TDD violations
            return self._check_tdd_violation(text)
        
        else:
            # Generic condition checking
            condition_keywords = condition.replace('_', ' ').split()
            return any(keyword in text for keyword in condition_keywords)
    
    def _check_command_utilization(self, text: str) -> bool:
        """Check if command utilization is below 70%"""
        # Simple heuristic: if text mentions single command operations for complex tasks
        single_command_indicators = ['single command', 'one command', 'only using']
        complex_task_indicators = ['complex', 'multiple', 'various', 'several', 'comprehensive']
        
        has_single_command = any(indicator in text for indicator in single_command_indicators)
        has_complex_task = any(indicator in text for indicator in complex_task_indicators)
        
        return has_single_command and has_complex_task
    
    def _check_complexity_threshold(self, text: str) -> bool:
        """Check if complexity threshold is exceeded"""
        complexity_indicators = [
            'multiple steps', 'complex analysis', 'comprehensive', 'extensive',
            'multi-domain', 'cross-functional', 'systematic', 'elaborate'
        ]
        return sum(1 for indicator in complexity_indicators if indicator in text) >= 2
    
    def _check_root_file_creation(self, operation: str) -> bool:
        """Check if attempting to create file in root directory"""
        root_file_patterns = [
            r'create.*\.md.*root',
            r'write.*file.*root',
            r'new.*file.*root',
            r'\.md$',  # Any .md file creation could be root
            r'README\.md',
            r'\.txt$'
        ]
        return any(re.search(pattern, operation, re.IGNORECASE) for pattern in root_file_patterns)
    
    def _check_density_violation(self, text: str) -> bool:
        """Check for density optimization violations"""
        verbose_patterns = [
            'very verbose', 'lengthy explanation', 'detailed description',
            'comprehensive overview', 'extensive documentation', 'elaborate'
        ]
        return any(pattern in text for pattern in verbose_patterns)
    
    def _check_parallel_task_requirement(self, text: str) -> bool:
        """Check if parallel tasks should be used"""
        parallel_indicators = [
            'multiple tasks', 'several objectives', 'various domains',
            'complex planning', 'todowrite', 'task elaboration'
        ]
        return any(indicator in text for indicator in parallel_indicators)
    
    def _check_commit_requirement(self, text: str) -> bool:
        """Check if commit operations are required"""
        commit_indicators = [
            'substantial changes', 'multiple files', 'major operation',
            'significant update', 'operational change'
        ]
        return any(indicator in text for indicator in commit_indicators)
    
    def _check_tdd_violation(self, text: str) -> bool:
        """Check for TDD violations"""
        development_indicators = ['implement', 'develop', 'create', 'build']
        test_indicators = ['test', 'validate', 'verify']
        
        has_development = any(indicator in text for indicator in development_indicators)
        has_tests = any(indicator in text for indicator in test_indicators)
        
        return has_development and not has_tests
    
    def start_monitoring(self):
        """Start continuous enforcement monitoring"""
        if self.running:
            logger.warning("Enforcement monitoring already running")
            return
        
        logger.info("Starting Principle Blocking Engine monitoring...")
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """Stop enforcement monitoring"""
        if not self.running:
            logger.warning("Enforcement monitoring not running")
            return
        
        logger.info("Stopping Principle Blocking Engine monitoring...")
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
    
    def _monitoring_loop(self):
        """Continuous monitoring loop"""
        while self.running:
            try:
                # Refresh rules every 5 minutes
                time.sleep(300)
                self.refresh_rules()
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)
    
    def get_violation_stats(self) -> Dict[str, Any]:
        """Get enforcement violation statistics"""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            
            # Total violations in last 24 hours
            cursor.execute('''
                SELECT COUNT(*) FROM enforcement_violations 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            violations_24h = cursor.fetchone()[0]
            
            # Violations by severity
            cursor.execute('''
                SELECT r.severity, COUNT(v.id) 
                FROM enforcement_violations v
                JOIN enforcement_rules r ON v.rule_id = r.rule_id
                WHERE v.timestamp > datetime('now', '-24 hours')
                GROUP BY r.severity
            ''')
            violations_by_severity = dict(cursor.fetchall())
            
            # Most triggered rules
            cursor.execute('''
                SELECT v.rule_id, r.description, COUNT(v.id) as violations
                FROM enforcement_violations v
                JOIN enforcement_rules r ON v.rule_id = r.rule_id
                WHERE v.timestamp > datetime('now', '-24 hours')
                GROUP BY v.rule_id, r.description
                ORDER BY violations DESC
                LIMIT 5
            ''')
            top_violations = cursor.fetchall()
            
            return {
                'total_active_rules': len(self.active_rules),
                'violations_24h': violations_24h,
                'violations_by_severity': violations_by_severity,
                'top_violations': [
                    {'rule_id': row[0], 'description': row[1], 'count': row[2]}
                    for row in top_violations
                ]
            }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python principle-blocking-engine.py {start|stop|refresh|check|stats}")
        sys.exit(1)
    
    command = sys.argv[1]
    engine = PrincipleBlockingEngine()
    
    if command == 'start':
        engine.start_monitoring()
        logger.info("Principle Blocking Engine started. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            engine.stop_monitoring()
    
    elif command == 'stop':
        engine.stop_monitoring()
        logger.info("Principle Blocking Engine stopped")
    
    elif command == 'refresh':
        engine.refresh_rules()
        logger.info(f"Rules refreshed. {len(engine.active_rules)} active rules loaded.")
    
    elif command == 'check':
        if len(sys.argv) < 4:
            print("Usage: python principle-blocking-engine.py check <context> <operation>")
            sys.exit(1)
        
        context = sys.argv[2]
        operation = sys.argv[3]
        
        is_blocked, violations, remediation = engine.check_enforcement(context, operation)
        
        print(f"Enforcement Check Results:")
        print(f"Blocked: {is_blocked}")
        print(f"Violations: {len(violations)}")
        for i, violation in enumerate(violations, 1):
            print(f"  {i}. {violation}")
        print(f"Remediation Actions: {remediation}")
    
    elif command == 'stats':
        stats = engine.get_violation_stats()
        print("Enforcement Statistics:")
        print(f"Active Rules: {stats['total_active_rules']}")
        print(f"Violations (24h): {stats['violations_24h']}")
        print(f"By Severity: {stats['violations_by_severity']}")
        print("Top Violations:")
        for violation in stats['top_violations']:
            print(f"  {violation['rule_id']}: {violation['count']} ({violation['description'][:50]}...)")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()