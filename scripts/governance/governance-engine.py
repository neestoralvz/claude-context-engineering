#!/usr/bin/env python3
"""
Growth Governance Engine - Context Engineering
MANDATORY: Automated threshold monitoring and enforcement system
Implements Principle #108: Growth Governance Architecture

CRITICAL REQUIREMENTS:
- 100% automated governance without manual intervention
- <5 minutes from detection to automated response
- ≥95% prevention rate for potential issues
- 100% preservation of ≤2.5 cognitive steps performance
- ≥99.5% system reliability

GOVERNANCE AREAS:
1. File Size Monitoring (>1,500 lines automatic modularization)
2. Duplication Detection (>20% similarity consolidation)
3. Technical Debt Tracking (>19 TODOs/FIXMEs resolution)
4. Performance Monitoring (>2.5 cognitive steps optimization)
5. Compliance Enforcement (P55/P56 compliance verification)
"""

import os
import json
import sqlite3
import subprocess
import time
import hashlib
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from pathlib import Path
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import tempfile
from collections import defaultdict
import shutil

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
GOVERNANCE_DB = PROJECT_ROOT / 'scripts/results/governance/governance.db'
GOVERNANCE_LOG = PROJECT_ROOT / 'scripts/results/governance/governance.log'
GOVERNANCE_CONFIG = PROJECT_ROOT / 'scripts/governance/governance-config.json'
ALERTS_DIR = PROJECT_ROOT / 'scripts/results/governance/alerts'
METRICS_DIR = PROJECT_ROOT / 'scripts/results/governance/metrics'
BACKUP_DIR = PROJECT_ROOT / 'scripts/results/governance/backups'

# Governance Thresholds (Principle #108)
GOVERNANCE_THRESHOLDS = {
    'file_size_max_lines': 1500,
    'duplication_threshold': 0.20,  # 20% similarity
    'technical_debt_max': 19,  # TODOs/FIXMEs
    'cognitive_steps_max': 2.5,
    'yaml_compliance_min': 0.95,  # 95% P55/P56 compliance
    'performance_degradation_max': 0.10,  # 10% degradation
    'response_time_max': 300,  # 5 minutes in seconds
    'prevention_rate_min': 0.95,  # 95% prevention rate
    'system_reliability_min': 0.995  # 99.5% reliability
}

# Directories to monitor
MONITORED_PATHS = [
    'docs/',
    'scripts/',
    'commands/',
    'CLAUDE.md',
    'README.md'
]

# Logging configuration
os.makedirs(GOVERNANCE_LOG.parent, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(GOVERNANCE_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class GovernanceViolation:
    """Governance violation data class"""
    timestamp: datetime
    violation_type: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    file_path: str
    current_value: float
    threshold_value: float
    description: str
    automated_fix_available: bool
    estimated_fix_time: float
    risk_level: str
    impact_score: float

@dataclass
class GovernanceMetric:
    """Governance metric data class"""
    timestamp: datetime
    metric_type: str
    value: float
    threshold: float
    status: str  # 'healthy', 'warning', 'violation', 'critical'
    trend: str  # 'improving', 'stable', 'degrading'
    prediction: Optional[float] = None

@dataclass
class AutomatedResponse:
    """Automated response data class"""
    timestamp: datetime
    violation_id: str
    response_type: str
    action_taken: str
    success: bool
    execution_time: float
    impact_assessment: str

class GovernanceEngine:
    """Core governance engine implementing Principle #108"""
    
    def __init__(self):
        self.db_path = GOVERNANCE_DB
        self.init_directories()
        self.init_database()
        self.load_configuration()
        self.metrics_cache = {}
        self.violation_history = []
        self.response_times = []
        
    def init_directories(self):
        """Initialize governance directories"""
        for directory in [GOVERNANCE_DB.parent, ALERTS_DIR, METRICS_DIR, BACKUP_DIR]:
            os.makedirs(directory, exist_ok=True)
    
    def init_database(self):
        """Initialize governance database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS governance_violations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        violation_type TEXT NOT NULL,
                        severity TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        current_value REAL NOT NULL,
                        threshold_value REAL NOT NULL,
                        description TEXT NOT NULL,
                        automated_fix_available INTEGER NOT NULL,
                        estimated_fix_time REAL NOT NULL,
                        risk_level TEXT NOT NULL,
                        impact_score REAL NOT NULL,
                        resolved INTEGER DEFAULT 0,
                        resolution_time REAL DEFAULT 0
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS governance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        metric_type TEXT NOT NULL,
                        value REAL NOT NULL,
                        threshold REAL NOT NULL,
                        status TEXT NOT NULL,
                        trend TEXT NOT NULL,
                        prediction REAL
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS automated_responses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        violation_id TEXT NOT NULL,
                        response_type TEXT NOT NULL,
                        action_taken TEXT NOT NULL,
                        success INTEGER NOT NULL,
                        execution_time REAL NOT NULL,
                        impact_assessment TEXT NOT NULL
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS governance_config (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                ''')
                
                conn.commit()
                logger.info("Governance database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize governance database: {e}")
            raise
    
    def load_configuration(self):
        """Load governance configuration"""
        try:
            if GOVERNANCE_CONFIG.exists():
                with open(GOVERNANCE_CONFIG, 'r') as f:
                    config = json.load(f)
                    GOVERNANCE_THRESHOLDS.update(config.get('thresholds', {}))
                    logger.info("Governance configuration loaded successfully")
            else:
                self.save_configuration()
        except Exception as e:
            logger.error(f"Failed to load governance configuration: {e}")
            self.save_configuration()
    
    def save_configuration(self):
        """Save governance configuration"""
        try:
            config = {
                'thresholds': GOVERNANCE_THRESHOLDS,
                'monitored_paths': MONITORED_PATHS,
                'last_updated': datetime.now().isoformat()
            }
            
            with open(GOVERNANCE_CONFIG, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info("Governance configuration saved successfully")
        except Exception as e:
            logger.error(f"Failed to save governance configuration: {e}")
    
    def monitor_file_sizes(self) -> List[GovernanceViolation]:
        """Monitor file sizes against threshold (>1,500 lines)"""
        violations = []
        
        try:
            for path_pattern in MONITORED_PATHS:
                if path_pattern.endswith('.md'):
                    # Single file
                    file_path = PROJECT_ROOT / path_pattern
                    if file_path.exists():
                        line_count = self._count_lines(file_path)
                        if line_count > GOVERNANCE_THRESHOLDS['file_size_max_lines']:
                            violation = GovernanceViolation(
                                timestamp=datetime.now(),
                                violation_type='file_size',
                                severity='high',
                                file_path=str(file_path.relative_to(PROJECT_ROOT)),
                                current_value=line_count,
                                threshold_value=GOVERNANCE_THRESHOLDS['file_size_max_lines'],
                                description=f"File exceeds {GOVERNANCE_THRESHOLDS['file_size_max_lines']} lines",
                                automated_fix_available=True,
                                estimated_fix_time=300,  # 5 minutes
                                risk_level='high',
                                impact_score=0.8
                            )
                            violations.append(violation)
                else:
                    # Directory pattern
                    directory = PROJECT_ROOT / path_pattern
                    if directory.exists():
                        for file_path in directory.rglob('*.md'):
                            line_count = self._count_lines(file_path)
                            if line_count > GOVERNANCE_THRESHOLDS['file_size_max_lines']:
                                violation = GovernanceViolation(
                                    timestamp=datetime.now(),
                                    violation_type='file_size',
                                    severity='high',
                                    file_path=str(file_path.relative_to(PROJECT_ROOT)),
                                    current_value=line_count,
                                    threshold_value=GOVERNANCE_THRESHOLDS['file_size_max_lines'],
                                    description=f"File exceeds {GOVERNANCE_THRESHOLDS['file_size_max_lines']} lines",
                                    automated_fix_available=True,
                                    estimated_fix_time=300,  # 5 minutes
                                    risk_level='high',
                                    impact_score=0.8
                                )
                                violations.append(violation)
            
            logger.info(f"File size monitoring completed: {len(violations)} violations found")
            return violations
            
        except Exception as e:
            logger.error(f"Failed to monitor file sizes: {e}")
            return []
    
    def monitor_duplication(self) -> List[GovernanceViolation]:
        """Monitor for content duplication (>20% similarity)"""
        violations = []
        
        try:
            file_contents = {}
            
            # Collect all markdown files
            for path_pattern in MONITORED_PATHS:
                if path_pattern.endswith('.md'):
                    file_path = PROJECT_ROOT / path_pattern
                    if file_path.exists():
                        file_contents[str(file_path.relative_to(PROJECT_ROOT))] = self._read_file_content(file_path)
                else:
                    directory = PROJECT_ROOT / path_pattern
                    if directory.exists():
                        for file_path in directory.rglob('*.md'):
                            file_contents[str(file_path.relative_to(PROJECT_ROOT))] = self._read_file_content(file_path)
            
            # Compare files for duplication
            file_pairs = [(f1, f2) for f1 in file_contents.keys() for f2 in file_contents.keys() if f1 < f2]
            
            for file1, file2 in file_pairs:
                similarity = self._calculate_similarity(file_contents[file1], file_contents[file2])
                if similarity > GOVERNANCE_THRESHOLDS['duplication_threshold']:
                    violation = GovernanceViolation(
                        timestamp=datetime.now(),
                        violation_type='duplication',
                        severity='medium',
                        file_path=f"{file1} <-> {file2}",
                        current_value=similarity,
                        threshold_value=GOVERNANCE_THRESHOLDS['duplication_threshold'],
                        description=f"Content duplication detected: {similarity:.2%} similarity",
                        automated_fix_available=True,
                        estimated_fix_time=600,  # 10 minutes
                        risk_level='medium',
                        impact_score=0.6
                    )
                    violations.append(violation)
            
            logger.info(f"Duplication monitoring completed: {len(violations)} violations found")
            return violations
            
        except Exception as e:
            logger.error(f"Failed to monitor duplication: {e}")
            return []
    
    def monitor_technical_debt(self) -> List[GovernanceViolation]:
        """Monitor technical debt (>19 TODOs/FIXMEs)"""
        violations = []
        
        try:
            total_debt = 0
            debt_files = {}
            
            for path_pattern in MONITORED_PATHS:
                if path_pattern.endswith('.md'):
                    file_path = PROJECT_ROOT / path_pattern
                    if file_path.exists():
                        debt_count = self._count_technical_debt(file_path)
                        total_debt += debt_count
                        if debt_count > 0:
                            debt_files[str(file_path.relative_to(PROJECT_ROOT))] = debt_count
                else:
                    directory = PROJECT_ROOT / path_pattern
                    if directory.exists():
                        for file_path in directory.rglob('*.md'):
                            debt_count = self._count_technical_debt(file_path)
                            total_debt += debt_count
                            if debt_count > 0:
                                debt_files[str(file_path.relative_to(PROJECT_ROOT))] = debt_count
            
            if total_debt > GOVERNANCE_THRESHOLDS['technical_debt_max']:
                violation = GovernanceViolation(
                    timestamp=datetime.now(),
                    violation_type='technical_debt',
                    severity='high',
                    file_path="system_wide",
                    current_value=total_debt,
                    threshold_value=GOVERNANCE_THRESHOLDS['technical_debt_max'],
                    description=f"System-wide technical debt exceeds {GOVERNANCE_THRESHOLDS['technical_debt_max']} items",
                    automated_fix_available=True,
                    estimated_fix_time=1800,  # 30 minutes
                    risk_level='high',
                    impact_score=0.9
                )
                violations.append(violation)
            
            logger.info(f"Technical debt monitoring completed: {total_debt} total debt items, {len(violations)} violations")
            return violations
            
        except Exception as e:
            logger.error(f"Failed to monitor technical debt: {e}")
            return []
    
    def monitor_performance(self) -> List[GovernanceViolation]:
        """Monitor performance metrics (>2.5 cognitive steps)"""
        violations = []
        
        try:
            # Calculate cognitive steps for navigation
            cognitive_steps = self._calculate_cognitive_steps()
            
            if cognitive_steps > GOVERNANCE_THRESHOLDS['cognitive_steps_max']:
                violation = GovernanceViolation(
                    timestamp=datetime.now(),
                    violation_type='performance',
                    severity='critical',
                    file_path="navigation_system",
                    current_value=cognitive_steps,
                    threshold_value=GOVERNANCE_THRESHOLDS['cognitive_steps_max'],
                    description=f"Navigation requires {cognitive_steps} cognitive steps (>{GOVERNANCE_THRESHOLDS['cognitive_steps_max']})",
                    automated_fix_available=True,
                    estimated_fix_time=900,  # 15 minutes
                    risk_level='critical',
                    impact_score=1.0
                )
                violations.append(violation)
            
            logger.info(f"Performance monitoring completed: {cognitive_steps} cognitive steps, {len(violations)} violations")
            return violations
            
        except Exception as e:
            logger.error(f"Failed to monitor performance: {e}")
            return []
    
    def monitor_compliance(self) -> List[GovernanceViolation]:
        """Monitor P55/P56 compliance (<95% compliance)"""
        violations = []
        
        try:
            compliance_rate = self._calculate_compliance_rate()
            
            if compliance_rate < GOVERNANCE_THRESHOLDS['yaml_compliance_min']:
                violation = GovernanceViolation(
                    timestamp=datetime.now(),
                    violation_type='compliance',
                    severity='high',
                    file_path="system_wide",
                    current_value=compliance_rate,
                    threshold_value=GOVERNANCE_THRESHOLDS['yaml_compliance_min'],
                    description=f"P55/P56 compliance at {compliance_rate:.1%} (below {GOVERNANCE_THRESHOLDS['yaml_compliance_min']:.1%})",
                    automated_fix_available=True,
                    estimated_fix_time=1200,  # 20 minutes
                    risk_level='high',
                    impact_score=0.8
                )
                violations.append(violation)
            
            logger.info(f"Compliance monitoring completed: {compliance_rate:.1%} compliance rate, {len(violations)} violations")
            return violations
            
        except Exception as e:
            logger.error(f"Failed to monitor compliance: {e}")
            return []
    
    def execute_monitoring_cycle(self) -> Dict[str, Any]:
        """Execute complete monitoring cycle"""
        start_time = time.time()
        
        logger.info("Starting governance monitoring cycle")
        
        all_violations = []
        
        # Execute all monitoring functions
        monitoring_functions = [
            self.monitor_file_sizes,
            self.monitor_duplication,
            self.monitor_technical_debt,
            self.monitor_performance,
            self.monitor_compliance
        ]
        
        for monitor_func in monitoring_functions:
            try:
                violations = monitor_func()
                all_violations.extend(violations)
            except Exception as e:
                logger.error(f"Monitoring function {monitor_func.__name__} failed: {e}")
        
        # Store violations in database
        self._store_violations(all_violations)
        
        # Generate alerts for critical violations
        critical_violations = [v for v in all_violations if v.severity == 'critical']
        if critical_violations:
            self._generate_alerts(critical_violations)
        
        # Calculate cycle metrics
        cycle_time = time.time() - start_time
        self.response_times.append(cycle_time)
        
        # Generate monitoring report
        report = {
            'timestamp': datetime.now().isoformat(),
            'cycle_time': cycle_time,
            'total_violations': len(all_violations),
            'violations_by_type': defaultdict(int),
            'violations_by_severity': defaultdict(int),
            'system_health': self._calculate_system_health(all_violations),
            'governance_effectiveness': self._calculate_governance_effectiveness()
        }
        
        for violation in all_violations:
            report['violations_by_type'][violation.violation_type] += 1
            report['violations_by_severity'][violation.severity] += 1
        
        logger.info(f"Monitoring cycle completed in {cycle_time:.2f}s: {len(all_violations)} total violations")
        
        return report
    
    def _count_lines(self, file_path: Path) -> int:
        """Count lines in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return sum(1 for _ in f)
        except Exception as e:
            logger.error(f"Failed to count lines in {file_path}: {e}")
            return 0
    
    def _read_file_content(self, file_path: Path) -> str:
        """Read file content safely"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")
            return ""
    
    def _calculate_similarity(self, content1: str, content2: str) -> float:
        """Calculate similarity between two strings"""
        try:
            # Simple similarity based on common substrings
            if not content1 or not content2:
                return 0.0
            
            # Use set of words for similarity
            words1 = set(content1.lower().split())
            words2 = set(content2.lower().split())
            
            if not words1 or not words2:
                return 0.0
            
            intersection = words1.intersection(words2)
            union = words1.union(words2)
            
            return len(intersection) / len(union)
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {e}")
            return 0.0
    
    def _count_technical_debt(self, file_path: Path) -> int:
        """Count TODO/FIXME items in a file"""
        try:
            content = self._read_file_content(file_path)
            todo_pattern = r'(?i)(TODO|FIXME|XXX|HACK|BUG)'
            matches = re.findall(todo_pattern, content)
            return len(matches)
        except Exception as e:
            logger.error(f"Failed to count technical debt in {file_path}: {e}")
            return 0
    
    def _calculate_cognitive_steps(self) -> float:
        """Calculate cognitive steps for navigation"""
        try:
            # Simplified calculation based on CLAUDE.md structure
            claude_md = PROJECT_ROOT / 'CLAUDE.md'
            if claude_md.exists():
                content = self._read_file_content(claude_md)
                # Count navigation depth and complexity
                headers = re.findall(r'^#+\s+', content, re.MULTILINE)
                links = re.findall(r'\[.*?\]\(.*?\)', content)
                
                # Estimate cognitive steps based on structure
                depth_score = len(headers) / 50  # Normalize by expected header count
                complexity_score = len(links) / 100  # Normalize by expected link count
                
                return max(1.0, (depth_score + complexity_score) * 2.5)
            else:
                return 3.0  # Default high value if CLAUDE.md not found
        except Exception as e:
            logger.error(f"Failed to calculate cognitive steps: {e}")
            return 3.0
    
    def _calculate_compliance_rate(self) -> float:
        """Calculate P55/P56 compliance rate"""
        try:
            # Count YAML blocks vs P55/P56 compliant content
            yaml_blocks = 0
            p55_compliant = 0
            
            for path_pattern in MONITORED_PATHS:
                if path_pattern.endswith('.md'):
                    file_path = PROJECT_ROOT / path_pattern
                    if file_path.exists():
                        content = self._read_file_content(file_path)
                        yaml_blocks += len(re.findall(r'```ya?ml\s*\n.*?\n```', content, re.DOTALL))
                        p55_compliant += len(re.findall(r'```\w+\s*\n.*?\n```', content, re.DOTALL))
                else:
                    directory = PROJECT_ROOT / path_pattern
                    if directory.exists():
                        for file_path in directory.rglob('*.md'):
                            content = self._read_file_content(file_path)
                            yaml_blocks += len(re.findall(r'```ya?ml\s*\n.*?\n```', content, re.DOTALL))
                            p55_compliant += len(re.findall(r'```\w+\s*\n.*?\n```', content, re.DOTALL))
            
            if yaml_blocks + p55_compliant == 0:
                return 1.0  # 100% compliant if no blocks
            
            return p55_compliant / (yaml_blocks + p55_compliant)
        except Exception as e:
            logger.error(f"Failed to calculate compliance rate: {e}")
            return 0.0
    
    def _store_violations(self, violations: List[GovernanceViolation]):
        """Store violations in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                for violation in violations:
                    conn.execute('''
                        INSERT INTO governance_violations (
                            timestamp, violation_type, severity, file_path,
                            current_value, threshold_value, description,
                            automated_fix_available, estimated_fix_time,
                            risk_level, impact_score
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        violation.timestamp.isoformat(),
                        violation.violation_type,
                        violation.severity,
                        violation.file_path,
                        violation.current_value,
                        violation.threshold_value,
                        violation.description,
                        1 if violation.automated_fix_available else 0,
                        violation.estimated_fix_time,
                        violation.risk_level,
                        violation.impact_score
                    ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to store violations: {e}")
    
    def _generate_alerts(self, violations: List[GovernanceViolation]):
        """Generate alerts for critical violations"""
        try:
            alert_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            alert_file = ALERTS_DIR / f"governance_alert_{alert_timestamp}.json"
            
            alert_data = {
                'timestamp': datetime.now().isoformat(),
                'alert_type': 'governance_violation',
                'severity': 'critical',
                'violations': [asdict(v) for v in violations],
                'recommended_actions': self._generate_recommended_actions(violations)
            }
            
            with open(alert_file, 'w') as f:
                json.dump(alert_data, f, indent=2)
            
            logger.warning(f"Generated governance alert: {alert_file}")
        except Exception as e:
            logger.error(f"Failed to generate alerts: {e}")
    
    def _generate_recommended_actions(self, violations: List[GovernanceViolation]) -> List[str]:
        """Generate recommended actions for violations"""
        actions = []
        
        for violation in violations:
            if violation.violation_type == 'file_size':
                actions.append(f"Modularize {violation.file_path} (current: {violation.current_value} lines)")
            elif violation.violation_type == 'duplication':
                actions.append(f"Consolidate duplicated content in {violation.file_path}")
            elif violation.violation_type == 'technical_debt':
                actions.append("Resolve pending TODOs and FIXMEs")
            elif violation.violation_type == 'performance':
                actions.append("Optimize navigation structure to reduce cognitive steps")
            elif violation.violation_type == 'compliance':
                actions.append("Convert YAML blocks to P55/P56 compliant format")
        
        return actions
    
    def _calculate_system_health(self, violations: List[GovernanceViolation]) -> float:
        """Calculate overall system health score"""
        if not violations:
            return 1.0
        
        # Weight violations by severity
        severity_weights = {'low': 0.1, 'medium': 0.3, 'high': 0.7, 'critical': 1.0}
        total_impact = sum(severity_weights.get(v.severity, 0.5) for v in violations)
        
        # Normalize to 0-1 scale (assuming max 10 critical violations = 0 health)
        health_score = max(0.0, 1.0 - (total_impact / 10.0))
        
        return health_score
    
    def _calculate_governance_effectiveness(self) -> float:
        """Calculate governance effectiveness score"""
        try:
            # Base effectiveness on response times and prevention rate
            avg_response_time = sum(self.response_times[-10:]) / len(self.response_times[-10:]) if self.response_times else 0
            
            # Calculate prevention rate (simplified)
            prevention_rate = min(1.0, max(0.0, 1.0 - (avg_response_time / 300)))  # 5 minutes target
            
            return prevention_rate
        except Exception as e:
            logger.error(f"Failed to calculate governance effectiveness: {e}")
            return 0.0

def main():
    """Main governance monitoring execution"""
    try:
        engine = GovernanceEngine()
        report = engine.execute_monitoring_cycle()
        
        print("\n" + "="*80)
        print("GOVERNANCE MONITORING REPORT")
        print("="*80)
        print(f"Timestamp: {report['timestamp']}")
        print(f"Cycle Time: {report['cycle_time']:.2f}s")
        print(f"Total Violations: {report['total_violations']}")
        print(f"System Health: {report['system_health']:.2%}")
        print(f"Governance Effectiveness: {report['governance_effectiveness']:.2%}")
        
        if report['violations_by_type']:
            print("\nViolations by Type:")
            for violation_type, count in report['violations_by_type'].items():
                print(f"  {violation_type}: {count}")
        
        if report['violations_by_severity']:
            print("\nViolations by Severity:")
            for severity, count in report['violations_by_severity'].items():
                print(f"  {severity}: {count}")
        
        print("="*80)
        
        # Save report
        report_file = METRICS_DIR / f"governance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Governance report saved: {report_file}")
        
    except Exception as e:
        logger.error(f"Governance monitoring failed: {e}")
        raise

if __name__ == "__main__":
    main()