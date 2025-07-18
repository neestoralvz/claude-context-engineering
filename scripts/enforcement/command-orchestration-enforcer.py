#!/usr/bin/env python3
"""
Command Orchestration Enforcer - Context Engineering
Monitors command usage patterns and enforces 70% utilization threshold for complex objectives
Detects single-command vs multi-command usage and blocks execution when orchestration is required
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
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from pathlib import Path
import subprocess

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
COMMANDS_PATH = PROJECT_ROOT / "docs/commands"
CLAUDE_COMMANDS_PATH = PROJECT_ROOT / ".claude/commands"
DB_PATH = PROJECT_ROOT / "scripts/results/compliance/metrics/orchestration_enforcer.db"
ORCHESTRATION_LOG = PROJECT_ROOT / "scripts/results/compliance/orchestration-enforcer.log"

# Thresholds
COMMAND_UTILIZATION_THRESHOLD = 0.70  # 70% minimum
COMPLEXITY_THRESHOLD = 0.7
MULTI_DOMAIN_THRESHOLD = 2
MAX_SINGLE_COMMAND_COMPLEXITY = 0.5

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ORCHESTRATION_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class CommandUsagePattern:
    """Data class for command usage analysis"""
    session_id: str
    timestamp: datetime
    objective_complexity: float
    domains_involved: Set[str]
    commands_used: List[str]
    command_count: int
    total_available_commands: int
    utilization_rate: float
    is_compliant: bool
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'session_id': self.session_id,
            'timestamp': self.timestamp.isoformat(),
            'objective_complexity': self.objective_complexity,
            'domains_involved': list(self.domains_involved),
            'commands_used': self.commands_used,
            'command_count': self.command_count,
            'total_available_commands': self.total_available_commands,
            'utilization_rate': self.utilization_rate,
            'is_compliant': self.is_compliant
        }

@dataclass
class OrchestrationViolation:
    """Data class for orchestration violations"""
    timestamp: datetime
    session_id: str
    violation_type: str
    objective: str
    expected_commands: List[str]
    actual_commands: List[str]
    utilization_gap: float
    severity: str
    blocked: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'session_id': self.session_id,
            'violation_type': self.violation_type,
            'objective': self.objective,
            'expected_commands': self.expected_commands,
            'actual_commands': self.actual_commands,
            'utilization_gap': self.utilization_gap,
            'severity': self.severity,
            'blocked': self.blocked
        }

class CommandInventory:
    """Manages available command inventory and categorization"""
    
    def __init__(self):
        self.commands_by_category = {}
        self.command_metadata = {}
        self.total_commands = 0
        self.load_command_inventory()
    
    def load_command_inventory(self):
        """Load and categorize all available commands"""
        logger.info("Loading command inventory...")
        
        # Load from .claude/commands directory
        claude_commands = self._scan_directory(CLAUDE_COMMANDS_PATH)
        docs_commands = self._scan_directory(COMMANDS_PATH)
        
        # Merge command lists
        all_commands = {**claude_commands, **docs_commands}
        self.total_commands = len(all_commands)
        
        # Categorize commands
        self.commands_by_category = {
            'behavioral': [],
            'executable': [],
            'cores': [],
            'shared': [],
            'orchestration': [],
            'verification': [],
            'documentation': [],
            'intelligence': [],
            'meta': []
        }
        
        for command_path, metadata in all_commands.items():
            category = self._categorize_command(command_path, metadata)
            self.commands_by_category[category].append(metadata['name'])
            self.command_metadata[metadata['name']] = metadata
        
        logger.info(f"Loaded {self.total_commands} commands across {len(self.commands_by_category)} categories")
    
    def _scan_directory(self, directory: Path) -> Dict[str, Dict[str, Any]]:
        """Scan directory for command files"""
        commands = {}
        
        if not directory.exists():
            return commands
        
        for cmd_file in directory.rglob("*.md"):
            if cmd_file.is_file():
                metadata = self._extract_command_metadata(cmd_file)
                if metadata:
                    commands[str(cmd_file)] = metadata
        
        return commands
    
    def _extract_command_metadata(self, cmd_file: Path) -> Optional[Dict[str, Any]]:
        """Extract metadata from command file"""
        try:
            with open(cmd_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract command name from file path
            relative_path = cmd_file.relative_to(cmd_file.parents[3])  # Relative to project root
            command_name = cmd_file.stem
            
            # Extract category from path
            path_parts = relative_path.parts
            category = 'shared'
            if len(path_parts) > 2:
                category = path_parts[2]  # e.g., 'behavioral', 'executable'
            
            # Analyze content for complexity and domains
            complexity = self._analyze_complexity(content)
            domains = self._extract_domains(content, str(relative_path))
            
            return {
                'name': command_name,
                'path': str(relative_path),
                'category': category,
                'complexity': complexity,
                'domains': domains,
                'content_length': len(content),
                'has_orchestration': 'orchestrat' in content.lower(),
                'has_verification': 'verif' in content.lower() or 'valid' in content.lower(),
                'is_meta_command': command_name in ['context-eng', 'decision', 'thinking']
            }
            
        except Exception as e:
            logger.error(f"Error extracting metadata from {cmd_file}: {e}")
            return None
    
    def _categorize_command(self, command_path: str, metadata: Dict[str, Any]) -> str:
        """Categorize command based on path and metadata"""
        path_lower = command_path.lower()
        
        if 'behavioral' in path_lower:
            return 'behavioral'
        elif 'executable' in path_lower:
            return 'executable'
        elif 'cores' in path_lower or metadata.get('is_meta_command'):
            return 'cores'
        elif 'shared' in path_lower:
            return 'shared'
        elif metadata.get('has_orchestration'):
            return 'orchestration'
        elif metadata.get('has_verification'):
            return 'verification'
        elif 'documentation' in path_lower or 'docs' in path_lower:
            return 'documentation'
        elif 'intelligence' in path_lower:
            return 'intelligence'
        else:
            return 'meta'
    
    def _analyze_complexity(self, content: str) -> float:
        """Analyze content complexity (0.0 to 1.0)"""
        complexity_indicators = [
            'complex', 'comprehensive', 'advanced', 'sophisticated',
            'multi-step', 'orchestration', 'systematic', 'elaborate',
            'integration', 'coordination', 'workflow', 'pipeline'
        ]
        
        content_lower = content.lower()
        complexity_score = 0.0
        
        # Base complexity from content length
        complexity_score += min(len(content) / 10000, 0.3)  # Max 0.3 from length
        
        # Complexity from keywords
        keyword_matches = sum(1 for keyword in complexity_indicators if keyword in content_lower)
        complexity_score += min(keyword_matches * 0.1, 0.4)  # Max 0.4 from keywords
        
        # Complexity from structure
        if '##' in content:  # Has sections
            complexity_score += 0.1
        if '###' in content:  # Has subsections
            complexity_score += 0.1
        if 'MANDATORY' in content or 'CRITICAL' in content:
            complexity_score += 0.1
        
        return min(complexity_score, 1.0)
    
    def _extract_domains(self, content: str, path: str) -> Set[str]:
        """Extract domains/categories that command addresses"""
        domains = set()
        
        domain_keywords = {
            'verification': ['verif', 'valid', 'test', 'check', 'compliance'],
            'orchestration': ['orchestrat', 'workflow', 'coordination', 'pipeline'],
            'documentation': ['doc', 'writing', 'readme', 'guide'],
            'analysis': ['analys', 'research', 'investigation', 'review'],
            'development': ['develop', 'implement', 'create', 'build'],
            'planning': ['plan', 'strategy', 'design', 'architecture'],
            'intelligence': ['think', 'decision', 'cognitive', 'intelligent'],
            'automation': ['automat', 'script', 'deploy', 'trigger'],
            'quality': ['quality', 'standard', 'principle', 'compliance'],
            'performance': ['performance', 'optimization', 'efficiency']
        }
        
        content_lower = content.lower()
        path_lower = path.lower()
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in content_lower or keyword in path_lower for keyword in keywords):
                domains.add(domain)
        
        return domains if domains else {'general'}
    
    def get_relevant_commands(self, objective: str, domains: Set[str]) -> List[str]:
        """Get commands relevant to objective and domains"""
        relevant_commands = []
        objective_lower = objective.lower()
        
        # Always include meta commands for complex objectives
        meta_commands = self.commands_by_category.get('cores', [])
        relevant_commands.extend(meta_commands)
        
        # Add domain-specific commands
        for domain in domains:
            if domain in ['orchestration', 'workflow']:
                relevant_commands.extend(self.commands_by_category.get('orchestration', []))
            elif domain in ['verification', 'validation']:
                relevant_commands.extend(self.commands_by_category.get('verification', []))
            elif domain in ['analysis', 'research']:
                relevant_commands.extend(self.commands_by_category.get('intelligence', []))
            elif domain in ['development', 'implementation']:
                relevant_commands.extend(self.commands_by_category.get('executable', []))
        
        # Add behavioral commands for complex objectives
        if any(keyword in objective_lower for keyword in ['complex', 'comprehensive', 'systematic']):
            relevant_commands.extend(self.commands_by_category.get('behavioral', []))
        
        return list(set(relevant_commands))  # Remove duplicates

class OrchestrationDatabase:
    """Database manager for orchestration enforcement"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS usage_patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    objective_complexity REAL,
                    domains_involved TEXT,
                    commands_used TEXT,
                    command_count INTEGER,
                    total_available_commands INTEGER,
                    utilization_rate REAL,
                    is_compliant BOOLEAN
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS orchestration_violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    session_id TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    objective TEXT,
                    expected_commands TEXT,
                    actual_commands TEXT,
                    utilization_gap REAL,
                    severity TEXT,
                    blocked BOOLEAN DEFAULT FALSE
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enforcement_sessions (
                    session_id TEXT PRIMARY KEY,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_time DATETIME,
                    total_violations INTEGER DEFAULT 0,
                    total_blocks INTEGER DEFAULT 0,
                    compliance_rate REAL
                )
            ''')
            
            # Create indexes
            conn.execute('CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_patterns(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_violations_session ON orchestration_violations(session_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_violations_severity ON orchestration_violations(severity)')
    
    def insert_usage_pattern(self, pattern: CommandUsagePattern):
        """Insert command usage pattern"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO usage_patterns 
                (session_id, objective_complexity, domains_involved, commands_used, 
                 command_count, total_available_commands, utilization_rate, is_compliant)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                pattern.session_id,
                pattern.objective_complexity,
                json.dumps(list(pattern.domains_involved)),
                json.dumps(pattern.commands_used),
                pattern.command_count,
                pattern.total_available_commands,
                pattern.utilization_rate,
                pattern.is_compliant
            ))
    
    def insert_violation(self, violation: OrchestrationViolation):
        """Insert orchestration violation"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO orchestration_violations 
                (session_id, violation_type, objective, expected_commands, 
                 actual_commands, utilization_gap, severity, blocked)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                violation.session_id,
                violation.violation_type,
                violation.objective,
                json.dumps(violation.expected_commands),
                json.dumps(violation.actual_commands),
                violation.utilization_gap,
                violation.severity,
                violation.blocked
            ))

class CommandOrchestrationEnforcer:
    """Main enforcement engine for command orchestration"""
    
    def __init__(self):
        self.db = OrchestrationDatabase(str(DB_PATH))
        self.inventory = CommandInventory()
        self.current_session_id = f"session_{int(time.time())}"
        self.running = False
        self.monitoring_thread = None
    
    def analyze_objective(self, objective: str) -> Tuple[float, Set[str]]:
        """Analyze objective complexity and domains"""
        complexity_indicators = [
            'comprehensive', 'systematic', 'complex', 'elaborate',
            'multi-step', 'various', 'multiple', 'several',
            'coordination', 'integration', 'orchestration',
            'workflow', 'pipeline', 'end-to-end'
        ]
        
        domain_indicators = {
            'verification': ['verify', 'validate', 'test', 'check', 'compliance'],
            'orchestration': ['orchestrate', 'coordinate', 'workflow', 'pipeline'],
            'documentation': ['document', 'write', 'create docs', 'readme'],
            'analysis': ['analyze', 'research', 'investigate', 'review'],
            'development': ['develop', 'implement', 'create', 'build', 'code'],
            'planning': ['plan', 'strategy', 'design', 'architecture'],
            'intelligence': ['think', 'decide', 'cognitive', 'intelligent'],
            'automation': ['automate', 'script', 'deploy', 'trigger'],
            'quality': ['quality', 'standards', 'principles'],
            'performance': ['optimize', 'performance', 'efficiency']
        }
        
        objective_lower = objective.lower()
        
        # Calculate complexity
        complexity = 0.0
        
        # Base complexity from length
        complexity += min(len(objective) / 500, 0.2)
        
        # Complexity from indicators
        complexity_matches = sum(1 for indicator in complexity_indicators if indicator in objective_lower)
        complexity += min(complexity_matches * 0.15, 0.6)
        
        # Complexity from multiple domains
        involved_domains = set()
        for domain, indicators in domain_indicators.items():
            if any(indicator in objective_lower for indicator in indicators):
                involved_domains.add(domain)
        
        complexity += min(len(involved_domains) * 0.1, 0.2)
        
        complexity = min(complexity, 1.0)
        
        return complexity, involved_domains
    
    def check_orchestration_compliance(self, objective: str, commands_used: List[str]) -> Tuple[bool, OrchestrationViolation]:
        """Check if command usage complies with orchestration requirements"""
        complexity, domains = self.analyze_objective(objective)
        
        # Get relevant commands for this objective
        relevant_commands = self.inventory.get_relevant_commands(objective, domains)
        
        # Calculate utilization rate
        utilization_rate = len(commands_used) / max(len(relevant_commands), 1)
        
        # Determine if orchestration is required
        orchestration_required = (
            complexity >= COMPLEXITY_THRESHOLD or
            len(domains) >= MULTI_DOMAIN_THRESHOLD or
            len(relevant_commands) > 3
        )
        
        # Check compliance
        is_compliant = True
        violation_type = None
        severity = 'LOW'
        
        if orchestration_required:
            if utilization_rate < COMMAND_UTILIZATION_THRESHOLD:
                is_compliant = False
                violation_type = 'COMMAND_UNDERUTILIZATION'
                severity = 'HIGH'
            elif len(commands_used) == 1 and complexity > MAX_SINGLE_COMMAND_COMPLEXITY:
                is_compliant = False
                violation_type = 'SINGLE_COMMAND_OVERUSE'
                severity = 'MEDIUM'
        
        # Create usage pattern record
        pattern = CommandUsagePattern(
            session_id=self.current_session_id,
            timestamp=datetime.now(),
            objective_complexity=complexity,
            domains_involved=domains,
            commands_used=commands_used,
            command_count=len(commands_used),
            total_available_commands=len(relevant_commands),
            utilization_rate=utilization_rate,
            is_compliant=is_compliant
        )
        
        self.db.insert_usage_pattern(pattern)
        
        # Create violation if not compliant
        violation = None
        if not is_compliant:
            utilization_gap = COMMAND_UTILIZATION_THRESHOLD - utilization_rate
            
            violation = OrchestrationViolation(
                timestamp=datetime.now(),
                session_id=self.current_session_id,
                violation_type=violation_type,
                objective=objective[:500],
                expected_commands=relevant_commands,
                actual_commands=commands_used,
                utilization_gap=utilization_gap,
                severity=severity,
                blocked=(severity in ['HIGH', 'CRITICAL'])
            )
            
            self.db.insert_violation(violation)
            
            logger.warning(f"Orchestration violation detected: {violation_type}")
            logger.warning(f"Utilization: {utilization_rate:.2%} (required: {COMMAND_UTILIZATION_THRESHOLD:.2%})")
            logger.warning(f"Commands used: {len(commands_used)}, Relevant: {len(relevant_commands)}")
        
        return is_compliant, violation
    
    def get_orchestration_suggestions(self, objective: str, commands_used: List[str]) -> List[str]:
        """Get suggestions for better command orchestration"""
        complexity, domains = self.analyze_objective(objective)
        relevant_commands = self.inventory.get_relevant_commands(objective, domains)
        
        suggestions = []
        
        # Suggest missing domain-specific commands
        for domain in domains:
            domain_commands = [cmd for cmd in relevant_commands 
                             if self.inventory.command_metadata.get(cmd, {}).get('domains', set()) & {domain}]
            missing_commands = set(domain_commands) - set(commands_used)
            
            if missing_commands:
                suggestions.append(f"Consider adding {domain} commands: {', '.join(list(missing_commands)[:3])}")
        
        # Suggest orchestration commands for complex objectives
        if complexity >= COMPLEXITY_THRESHOLD:
            orchestration_commands = self.inventory.commands_by_category.get('orchestration', [])
            missing_orchestration = set(orchestration_commands) - set(commands_used)
            
            if missing_orchestration:
                suggestions.append(f"For complex objectives, consider: {', '.join(list(missing_orchestration)[:2])}")
        
        # Suggest meta-commands
        meta_commands = self.inventory.commands_by_category.get('cores', [])
        missing_meta = set(meta_commands) - set(commands_used)
        
        if missing_meta and complexity > 0.5:
            suggestions.append(f"Consider meta-commands: {', '.join(list(missing_meta)[:2])}")
        
        return suggestions
    
    def start_monitoring(self):
        """Start orchestration monitoring"""
        if self.running:
            logger.warning("Orchestration monitoring already running")
            return
        
        logger.info("Starting Command Orchestration Enforcer...")
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """Stop orchestration monitoring"""
        if not self.running:
            logger.warning("Orchestration monitoring not running")
            return
        
        logger.info("Stopping Command Orchestration Enforcer...")
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
    
    def _monitoring_loop(self):
        """Continuous monitoring loop"""
        while self.running:
            try:
                # Refresh command inventory every 10 minutes
                time.sleep(600)
                self.inventory.load_command_inventory()
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(120)
    
    def get_enforcement_stats(self) -> Dict[str, Any]:
        """Get enforcement statistics"""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            
            # Total usage patterns in last 24 hours
            cursor.execute('''
                SELECT COUNT(*), AVG(utilization_rate), AVG(objective_complexity)
                FROM usage_patterns 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            usage_stats = cursor.fetchone()
            
            # Violations by type
            cursor.execute('''
                SELECT violation_type, COUNT(*), AVG(utilization_gap)
                FROM orchestration_violations 
                WHERE timestamp > datetime('now', '-24 hours')
                GROUP BY violation_type
            ''')
            violations_by_type = cursor.fetchall()
            
            # Compliance rate
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_compliant THEN 1 ELSE 0 END) as compliant
                FROM usage_patterns 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            compliance_stats = cursor.fetchone()
            
            total_patterns = compliance_stats[0] if compliance_stats and compliance_stats[0] else 1
            compliant_patterns = compliance_stats[1] if compliance_stats and compliance_stats[1] else 0
            compliance_rate = (compliant_patterns / total_patterns) * 100 if total_patterns > 0 else 0
            
            return {
                'total_commands': self.inventory.total_commands,
                'usage_patterns_24h': usage_stats[0] if usage_stats[0] else 0,
                'avg_utilization_rate': usage_stats[1] if usage_stats[1] else 0,
                'avg_complexity': usage_stats[2] if usage_stats[2] else 0,
                'compliance_rate': compliance_rate,
                'violations_by_type': [
                    {'type': row[0], 'count': row[1], 'avg_gap': row[2]}
                    for row in violations_by_type
                ]
            }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python command-orchestration-enforcer.py {start|stop|check|stats|inventory}")
        sys.exit(1)
    
    command = sys.argv[1]
    enforcer = CommandOrchestrationEnforcer()
    
    if command == 'start':
        enforcer.start_monitoring()
        logger.info("Command Orchestration Enforcer started. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            enforcer.stop_monitoring()
    
    elif command == 'stop':
        enforcer.stop_monitoring()
        logger.info("Command Orchestration Enforcer stopped")
    
    elif command == 'check':
        if len(sys.argv) < 4:
            print("Usage: python command-orchestration-enforcer.py check <objective> <command1,command2,...>")
            sys.exit(1)
        
        objective = sys.argv[2]
        commands_used = sys.argv[3].split(',') if sys.argv[3] else []
        
        is_compliant, violation = enforcer.check_orchestration_compliance(objective, commands_used)
        
        print(f"Orchestration Check Results:")
        print(f"Objective: {objective}")
        print(f"Commands Used: {commands_used}")
        print(f"Compliant: {is_compliant}")
        
        if violation:
            print(f"Violation: {violation.violation_type}")
            print(f"Severity: {violation.severity}")
            print(f"Utilization Gap: {violation.utilization_gap:.2%}")
            print(f"Blocked: {violation.blocked}")
        
        suggestions = enforcer.get_orchestration_suggestions(objective, commands_used)
        if suggestions:
            print("Suggestions:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  {i}. {suggestion}")
    
    elif command == 'stats':
        stats = enforcer.get_enforcement_stats()
        print("Orchestration Enforcement Statistics:")
        print(f"Total Commands Available: {stats['total_commands']}")
        print(f"Usage Patterns (24h): {stats['usage_patterns_24h']}")
        print(f"Average Utilization Rate: {stats['avg_utilization_rate']:.2%}")
        print(f"Average Complexity: {stats['avg_complexity']:.2f}")
        print(f"Compliance Rate: {stats['compliance_rate']:.1f}%")
        print("Violations by Type:")
        for violation in stats['violations_by_type']:
            print(f"  {violation['type']}: {violation['count']} (avg gap: {violation['avg_gap']:.2%})")
    
    elif command == 'inventory':
        print("Command Inventory:")
        for category, commands in enforcer.inventory.commands_by_category.items():
            print(f"  {category.title()}: {len(commands)} commands")
            for cmd in commands[:3]:  # Show first 3
                print(f"    - {cmd}")
            if len(commands) > 3:
                print(f"    ... and {len(commands) - 3} more")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()