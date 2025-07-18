#!/usr/bin/env python3
"""
Behavioral Statement Parser - Context Engineering
Parses "Sistema WILL" statements from CLAUDE.md and converts them to executable enforcement rules
Integration with principle blocking engine for automatic compliance enforcement
"""

import json
import re
import sys
import os
import sqlite3
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
CLAUDE_MD_PATH = PROJECT_ROOT / "CLAUDE.md"
DB_PATH = PROJECT_ROOT / "scripts/results/compliance/metrics/behavioral_parser.db"
PARSER_LOG = PROJECT_ROOT / "scripts/results/compliance/behavioral-parser.log"
OUTPUT_PATH = PROJECT_ROOT / "scripts/enforcement/generated_enforcement_rules.json"

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(PARSER_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class BehavioralStatement:
    """Data class for behavioral statements from CLAUDE.md"""
    statement_id: str
    statement_type: str  # WILL, MUST, DEBE, BLOCKING, etc.
    principle_number: Optional[str]
    raw_text: str
    parsed_action: str
    enforcement_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    trigger_conditions: List[str]
    blocking_actions: List[str]
    auto_remediation: bool
    line_number: int
    context: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

@dataclass
class EnforcementRule:
    """Data class for generated enforcement rules"""
    rule_id: str
    source_statement_id: str
    rule_description: str
    enforcement_type: str
    trigger_pattern: str
    action_pattern: str
    severity: str
    auto_activate: bool
    python_code: str
    validation_logic: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

class BehavioralStatementParser:
    """Parser for Sistema WILL statements and behavioral declarations"""
    
    def __init__(self, claude_md_path: str):
        self.claude_md_path = claude_md_path
        self.db_path = str(DB_PATH)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
        
        # Behavioral statement patterns
        self.statement_patterns = {
            'SISTEMA_WILL': r'Sistema WILL\s+([^.]+(?:\.|$))',
            'SISTEMA_MUST': r'Sistema MUST\s+([^.]+(?:\.|$))',
            'SISTEMA_DEBE': r'Sistema DEBE\s+([^.]+(?:\.|$))',
            'BLOCKING': r'🚨\s*BLOCKING[:\s]+([^.]+(?:\.|$))',
            'CRITICAL': r'🚨\s*CRITICAL[:\s]+([^.]+(?:\.|$))',
            'MAXIMUM': r'🚨\s*MAXIMUM[:\s]+([^.]+(?:\.|$))',
            'MANDATORY': r'🚨\s*MANDATORY[:\s]+([^.]+(?:\.|$))',
            'AUTOMATIC': r'🚨\s*AUTOMATIC[:\s]+([^.]+(?:\.|$))',
            'ZERO_TOLERANCE': r'ZERO\s+tolerance\s+([^.]+(?:\.|$))',
            'ENFORCEMENT': r'ENFORCEMENT\s+([^.]+(?:\.|$))',
            'REQUIRED': r'REQUIRED[:\s]+([^.]+(?:\.|$))'
        }
        
        # Action verb patterns for parsing
        self.action_verbs = [
            'automatically', 'activate', 'block', 'prevent', 'enforce', 'detect',
            'monitor', 'validate', 'verify', 'execute', 'trigger', 'halt',
            'redirect', 'correct', 'optimize', 'analyze', 'process'
        ]
        
        # Context indicators
        self.context_indicators = {
            'command_orchestration': ['command', 'orchestrat', 'utilization', '70%'],
            'parallel_tasks': ['parallel', 'task', 'simultaneous', 'TodoWrite'],
            'density_optimization': ['density', 'optimization', '75%', 'character'],
            'error_handling': ['error', 'protocol', '8-step', 'resolution'],
            'zero_root_policy': ['root', 'file', 'directory', 'CLAUDE.md'],
            'git_worktree': ['worktree', 'git', 'conflict', 'simultaneous'],
            'compliance': ['compliance', 'P55', 'P56', 'transparency'],
            'tdd_enforcement': ['TDD', 'test', 'development', 'validation'],
            'principle_enforcement': ['principle', 'guided', 'enforcement']
        }
    
    def init_database(self):
        """Initialize database for storing parsed statements"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS behavioral_statements (
                    statement_id TEXT PRIMARY KEY,
                    statement_type TEXT NOT NULL,
                    principle_number TEXT,
                    raw_text TEXT NOT NULL,
                    parsed_action TEXT,
                    enforcement_level TEXT,
                    trigger_conditions TEXT,
                    blocking_actions TEXT,
                    auto_remediation BOOLEAN,
                    line_number INTEGER,
                    context TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enforcement_rules (
                    rule_id TEXT PRIMARY KEY,
                    source_statement_id TEXT,
                    rule_description TEXT,
                    enforcement_type TEXT,
                    trigger_pattern TEXT,
                    action_pattern TEXT,
                    severity TEXT,
                    auto_activate BOOLEAN,
                    python_code TEXT,
                    validation_logic TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (source_statement_id) REFERENCES behavioral_statements (statement_id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS parsing_sessions (
                    session_id TEXT PRIMARY KEY,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    statements_found INTEGER,
                    rules_generated INTEGER,
                    success_rate REAL
                )
            ''')
    
    def parse_claude_md(self) -> List[BehavioralStatement]:
        """Parse CLAUDE.md for behavioral statements"""
        if not os.path.exists(self.claude_md_path):
            logger.error(f"CLAUDE.md not found at {self.claude_md_path}")
            return []
        
        logger.info("Parsing CLAUDE.md for behavioral statements...")
        
        with open(self.claude_md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        statements = []
        statement_counter = 1
        
        for line_num, line in enumerate(lines, 1):
            for statement_type, pattern in self.statement_patterns.items():
                matches = re.finditer(pattern, line, re.IGNORECASE)
                
                for match in matches:
                    statement_text = match.group(1).strip()
                    
                    # Extract principle number if present
                    principle_match = re.search(r'Principle #(\d+)', statement_text)
                    principle_number = principle_match.group(1) if principle_match else None
                    
                    # Parse the statement
                    parsed_action = self._parse_action(statement_text)
                    enforcement_level = self._determine_enforcement_level(statement_type, statement_text)
                    trigger_conditions = self._extract_trigger_conditions(statement_text)
                    blocking_actions = self._extract_blocking_actions(statement_text, statement_type)
                    auto_remediation = self._determine_auto_remediation(statement_text)
                    context = self._determine_context(statement_text)
                    
                    statement = BehavioralStatement(
                        statement_id=f"STMT_{statement_counter:03d}_{statement_type}",
                        statement_type=statement_type,
                        principle_number=principle_number,
                        raw_text=statement_text,
                        parsed_action=parsed_action,
                        enforcement_level=enforcement_level,
                        trigger_conditions=trigger_conditions,
                        blocking_actions=blocking_actions,
                        auto_remediation=auto_remediation,
                        line_number=line_num,
                        context=context
                    )
                    
                    statements.append(statement)
                    statement_counter += 1
        
        logger.info(f"Found {len(statements)} behavioral statements")
        return statements
    
    def _parse_action(self, statement_text: str) -> str:
        """Parse action from statement text"""
        statement_lower = statement_text.lower()
        
        # Find action verbs
        found_actions = []
        for verb in self.action_verbs:
            if verb in statement_lower:
                found_actions.append(verb)
        
        # Extract main action phrase
        action_patterns = [
            r'(automatically\s+\w+(?:\s+\w+){0,3})',
            r'(block\s+\w+(?:\s+\w+){0,3})',
            r'(enforce\s+\w+(?:\s+\w+){0,3})',
            r'(activate\s+\w+(?:\s+\w+){0,3})',
            r'(prevent\s+\w+(?:\s+\w+){0,3})'
        ]
        
        for pattern in action_patterns:
            match = re.search(pattern, statement_lower)
            if match:
                return match.group(1).strip()
        
        # Fallback: use first few words
        words = statement_text.split()
        return ' '.join(words[:5]) if len(words) >= 5 else statement_text
    
    def _determine_enforcement_level(self, statement_type: str, statement_text: str) -> str:
        """Determine enforcement level based on type and content"""
        statement_lower = statement_text.lower()
        
        # Critical indicators
        if any(keyword in statement_lower for keyword in ['critical', 'máxima', 'absolute', 'zero tolerance']):
            return 'CRITICAL'
        
        # High indicators
        if statement_type in ['BLOCKING', 'MAXIMUM', 'SISTEMA_MUST'] or \
           any(keyword in statement_lower for keyword in ['blocking', 'mandatory', 'obligatorio']):
            return 'HIGH'
        
        # Medium indicators
        if statement_type in ['SISTEMA_WILL', 'AUTOMATIC', 'REQUIRED'] or \
           any(keyword in statement_lower for keyword in ['automatic', 'enforcement', 'required']):
            return 'MEDIUM'
        
        return 'LOW'
    
    def _extract_trigger_conditions(self, statement_text: str) -> List[str]:
        """Extract trigger conditions from statement"""
        conditions = []
        statement_lower = statement_text.lower()
        
        # Map context indicators to trigger conditions
        for context, keywords in self.context_indicators.items():
            if any(keyword in statement_lower for keyword in keywords):
                conditions.append(f"{context}_detected")
        
        # Specific trigger patterns
        if 'utilization' in statement_lower and '70%' in statement_lower:
            conditions.append('command_utilization_below_threshold')
        
        if 'complexity' in statement_lower:
            conditions.append('complexity_threshold_exceeded')
        
        if 'error' in statement_lower:
            conditions.append('error_detected')
        
        if 'file' in statement_lower and 'root' in statement_lower:
            conditions.append('root_file_creation_attempt')
        
        if 'parallel' in statement_lower and 'task' in statement_lower:
            conditions.append('parallel_task_requirement')
        
        if 'density' in statement_lower and ('75%' in statement_lower or 'optimization' in statement_lower):
            conditions.append('density_optimization_violation')
        
        return conditions if conditions else ['generic_trigger']
    
    def _extract_blocking_actions(self, statement_text: str, statement_type: str) -> List[str]:
        """Extract blocking actions from statement"""
        actions = []
        statement_lower = statement_text.lower()
        
        # Direct action indicators
        if 'block' in statement_lower:
            actions.append('block_execution')
        
        if 'halt' in statement_lower or 'stop' in statement_lower:
            actions.append('halt_operation')
        
        if 'prevent' in statement_lower:
            actions.append('prevent_violation')
        
        if 'enforce' in statement_lower:
            actions.append('enforce_compliance')
        
        if 'activate' in statement_lower:
            actions.append('activate_protocol')
        
        if 'redirect' in statement_lower:
            actions.append('redirect_to_compliance')
        
        # Type-based default actions
        if statement_type in ['BLOCKING', 'CRITICAL', 'MAXIMUM']:
            actions.append('immediate_blocking')
        elif statement_type in ['SISTEMA_MUST', 'MANDATORY']:
            actions.append('enforce_requirement')
        elif statement_type in ['SISTEMA_WILL', 'AUTOMATIC']:
            actions.append('automatic_correction')
        
        return actions if actions else ['log_violation']
    
    def _determine_auto_remediation(self, statement_text: str) -> bool:
        """Determine if auto-remediation is possible"""
        auto_keywords = ['automatic', 'auto', 'automático', 'immediate', 'real-time', 'instantly']
        return any(keyword in statement_text.lower() for keyword in auto_keywords)
    
    def _determine_context(self, statement_text: str) -> str:
        """Determine primary context/domain of statement"""
        statement_lower = statement_text.lower()
        
        for context, keywords in self.context_indicators.items():
            if any(keyword in statement_lower for keyword in keywords):
                return context
        
        return 'general'
    
    def generate_enforcement_rules(self, statements: List[BehavioralStatement]) -> List[EnforcementRule]:
        """Generate executable enforcement rules from statements"""
        logger.info("Generating enforcement rules from behavioral statements...")
        
        rules = []
        rule_counter = 1
        
        for statement in statements:
            rule = self._create_enforcement_rule(statement, rule_counter)
            if rule:
                rules.append(rule)
                rule_counter += 1
        
        logger.info(f"Generated {len(rules)} enforcement rules")
        return rules
    
    def _create_enforcement_rule(self, statement: BehavioralStatement, rule_counter: int) -> Optional[EnforcementRule]:
        """Create enforcement rule from behavioral statement"""
        try:
            rule_id = f"RULE_{rule_counter:03d}_{statement.context.upper()}"
            
            # Generate trigger pattern
            trigger_pattern = self._generate_trigger_pattern(statement)
            
            # Generate action pattern
            action_pattern = self._generate_action_pattern(statement)
            
            # Generate Python code
            python_code = self._generate_python_code(statement)
            
            # Generate validation logic
            validation_logic = self._generate_validation_logic(statement)
            
            rule = EnforcementRule(
                rule_id=rule_id,
                source_statement_id=statement.statement_id,
                rule_description=f"Enforcement rule for: {statement.parsed_action}",
                enforcement_type=statement.statement_type,
                trigger_pattern=trigger_pattern,
                action_pattern=action_pattern,
                severity=statement.enforcement_level,
                auto_activate=statement.auto_remediation,
                python_code=python_code,
                validation_logic=validation_logic
            )
            
            return rule
            
        except Exception as e:
            logger.error(f"Error creating enforcement rule for {statement.statement_id}: {e}")
            return None
    
    def _generate_trigger_pattern(self, statement: BehavioralStatement) -> str:
        """Generate trigger pattern for rule"""
        if statement.context == 'command_orchestration':
            return 'context.command_utilization < 0.70'
        elif statement.context == 'parallel_tasks':
            return 'operation.requires_parallel_tasks and not operation.using_parallel_tasks'
        elif statement.context == 'density_optimization':
            return 'output.character_efficiency < 0.75'
        elif statement.context == 'error_handling':
            return 'error_detected and not protocol_activated'
        elif statement.context == 'zero_root_policy':
            return 'file_creation.in_root_directory and not file_creation.allowed'
        elif statement.context == 'git_worktree':
            return 'git.multiple_agents and git.main_worktree_active'
        else:
            return f'{statement.context}_condition_met'
    
    def _generate_action_pattern(self, statement: BehavioralStatement) -> str:
        """Generate action pattern for rule"""
        primary_action = statement.blocking_actions[0] if statement.blocking_actions else 'log_violation'
        
        action_map = {
            'block_execution': 'BLOCK_EXECUTION',
            'halt_operation': 'HALT_OPERATION', 
            'prevent_violation': 'PREVENT_VIOLATION',
            'enforce_compliance': 'ENFORCE_COMPLIANCE',
            'activate_protocol': 'ACTIVATE_PROTOCOL',
            'immediate_blocking': 'IMMEDIATE_BLOCK',
            'automatic_correction': 'AUTO_CORRECT',
            'log_violation': 'LOG_VIOLATION'
        }
        
        return action_map.get(primary_action, 'LOG_VIOLATION')
    
    def _generate_python_code(self, statement: BehavioralStatement) -> str:
        """Generate Python enforcement code"""
        template = f'''
def enforce_{statement.statement_id.lower()}(context, operation):
    """
    Enforcement rule for: {statement.parsed_action}
    Source: {statement.raw_text[:100]}...
    """
    violations = []
    
    # Check trigger conditions
    {self._generate_condition_checks(statement)}
    
    # Apply blocking actions if violations found
    if violations:
        {self._generate_blocking_code(statement)}
    
    return len(violations) == 0, violations
'''
        return template.strip()
    
    def _generate_condition_checks(self, statement: BehavioralStatement) -> str:
        """Generate condition checking code"""
        checks = []
        
        for condition in statement.trigger_conditions:
            if condition == 'command_utilization_below_threshold':
                checks.append('''
    if hasattr(context, 'command_utilization') and context.command_utilization < 0.70:
        violations.append("Command utilization below 70% threshold")''')
            elif condition == 'complexity_threshold_exceeded':
                checks.append('''
    if hasattr(operation, 'complexity') and operation.complexity > 0.7:
        violations.append("Complexity threshold exceeded")''')
            elif condition == 'error_detected':
                checks.append('''
    if 'error' in operation.lower() or 'failed' in operation.lower():
        violations.append("Error detected in operation")''')
            elif condition == 'root_file_creation_attempt':
                checks.append('''
    if hasattr(operation, 'file_path') and '/' not in operation.file_path:
        violations.append("Root file creation attempt detected")''')
            else:
                checks.append(f'''
    # Check for {condition}
    if "{condition.replace('_', ' ')}" in operation.lower():
        violations.append("{condition} detected")''')
        
        return '\n'.join(checks) if checks else '    pass  # No specific conditions'
    
    def _generate_blocking_code(self, statement: BehavioralStatement) -> str:
        """Generate blocking action code"""
        primary_action = statement.blocking_actions[0] if statement.blocking_actions else 'log_violation'
        
        if primary_action == 'block_execution':
            return '''
        logger.error(f"BLOCKING EXECUTION: {violations}")
        raise EnforcementViolationError("Execution blocked by enforcement rule")'''
        elif primary_action == 'halt_operation':
            return '''
        logger.critical(f"HALTING OPERATION: {violations}")
        return False, violations'''
        elif primary_action == 'prevent_violation':
            return '''
        logger.warning(f"PREVENTING VIOLATION: {violations}")
        # Apply prevention logic here'''
        else:
            return '''
        logger.info(f"ENFORCEMENT VIOLATION: {violations}")
        # Log violation for review'''
    
    def _generate_validation_logic(self, statement: BehavioralStatement) -> str:
        """Generate validation logic"""
        return f'''
Validation for {statement.statement_id}:
- Trigger: {statement.trigger_conditions}
- Action: {statement.blocking_actions}
- Level: {statement.enforcement_level}
- Auto-remediation: {statement.auto_remediation}
'''
    
    def store_statements(self, statements: List[BehavioralStatement]):
        """Store parsed statements in database"""
        with sqlite3.connect(self.db_path) as conn:
            for statement in statements:
                conn.execute('''
                    INSERT OR REPLACE INTO behavioral_statements 
                    (statement_id, statement_type, principle_number, raw_text, parsed_action,
                     enforcement_level, trigger_conditions, blocking_actions, auto_remediation,
                     line_number, context, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    statement.statement_id,
                    statement.statement_type,
                    statement.principle_number,
                    statement.raw_text,
                    statement.parsed_action,
                    statement.enforcement_level,
                    json.dumps(statement.trigger_conditions),
                    json.dumps(statement.blocking_actions),
                    statement.auto_remediation,
                    statement.line_number,
                    statement.context,
                    datetime.now()
                ))
    
    def store_rules(self, rules: List[EnforcementRule]):
        """Store generated rules in database"""
        with sqlite3.connect(self.db_path) as conn:
            for rule in rules:
                conn.execute('''
                    INSERT OR REPLACE INTO enforcement_rules 
                    (rule_id, source_statement_id, rule_description, enforcement_type,
                     trigger_pattern, action_pattern, severity, auto_activate,
                     python_code, validation_logic)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    rule.rule_id,
                    rule.source_statement_id,
                    rule.rule_description,
                    rule.enforcement_type,
                    rule.trigger_pattern,
                    rule.action_pattern,
                    rule.severity,
                    rule.auto_activate,
                    rule.python_code,
                    rule.validation_logic
                ))
    
    def export_rules(self, rules: List[EnforcementRule], output_path: str):
        """Export rules to JSON file"""
        rules_data = {
            'timestamp': datetime.now().isoformat(),
            'total_rules': len(rules),
            'rules': [rule.to_dict() for rule in rules]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(rules_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Exported {len(rules)} rules to {output_path}")
    
    def run_full_parsing(self) -> Tuple[List[BehavioralStatement], List[EnforcementRule]]:
        """Run complete parsing and rule generation process"""
        logger.info("Starting full behavioral statement parsing...")
        
        # Parse statements
        statements = self.parse_claude_md()
        
        # Generate rules
        rules = self.generate_enforcement_rules(statements)
        
        # Store in database
        self.store_statements(statements)
        self.store_rules(rules)
        
        # Export rules
        self.export_rules(rules, str(OUTPUT_PATH))
        
        # Record session
        session_id = f"session_{int(time.time())}"
        success_rate = len(rules) / len(statements) if statements else 0
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO parsing_sessions 
                (session_id, statements_found, rules_generated, success_rate)
                VALUES (?, ?, ?, ?)
            ''', (session_id, len(statements), len(rules), success_rate))
        
        logger.info(f"Parsing complete: {len(statements)} statements, {len(rules)} rules")
        return statements, rules

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python behavioral-statement-parser.py {parse|export|stats}")
        sys.exit(1)
    
    command = sys.argv[1]
    parser = BehavioralStatementParser(str(CLAUDE_MD_PATH))
    
    if command == 'parse':
        statements, rules = parser.run_full_parsing()
        print(f"Parsing Results:")
        print(f"Statements Found: {len(statements)}")
        print(f"Rules Generated: {len(rules)}")
        print(f"Export Location: {OUTPUT_PATH}")
    
    elif command == 'export':
        # Re-export existing rules
        with sqlite3.connect(parser.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM enforcement_rules')
            
            rules_data = []
            for row in cursor.fetchall():
                rules_data.append(dict(row))
            
            export_data = {
                'timestamp': datetime.now().isoformat(),
                'total_rules': len(rules_data),
                'rules': rules_data
            }
            
            with open(OUTPUT_PATH, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            print(f"Exported {len(rules_data)} rules to {OUTPUT_PATH}")
    
    elif command == 'stats':
        with sqlite3.connect(parser.db_path) as conn:
            cursor = conn.cursor()
            
            # Statement stats
            cursor.execute('SELECT COUNT(*) FROM behavioral_statements')
            total_statements = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM enforcement_rules')
            total_rules = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT statement_type, COUNT(*) 
                FROM behavioral_statements 
                GROUP BY statement_type
            ''')
            statements_by_type = cursor.fetchall()
            
            print("Behavioral Statement Parser Statistics:")
            print(f"Total Statements: {total_statements}")
            print(f"Total Rules: {total_rules}")
            print("Statements by Type:")
            for stmt_type, count in statements_by_type:
                print(f"  {stmt_type}: {count}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()