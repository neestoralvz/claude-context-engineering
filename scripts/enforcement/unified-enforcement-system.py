#!/usr/bin/env python3
"""
Unified Enforcement System - Context Engineering
Integrates all enforcement engines for comprehensive real-time compliance
Coordinates principle blocking, command orchestration, and behavioral control
"""

import json
import sys
import os
import time
import threading
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import subprocess

# Import enforcement engines - fix import paths
import importlib.util

def load_enforcement_engine(script_name):
    """Dynamically load enforcement engine scripts"""
    script_path = Path(__file__).parent / f"{script_name}.py"
    spec = importlib.util.spec_from_file_location(script_name, script_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Load enforcement engines
principle_blocking_module = load_enforcement_engine("principle-blocking-engine")
orchestration_module = load_enforcement_engine("command-orchestration-enforcer")

PrincipleBlockingEngine = principle_blocking_module.PrincipleBlockingEngine
CommandOrchestrationEnforcer = orchestration_module.CommandOrchestrationEnforcer

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
UNIFIED_LOG = PROJECT_ROOT / "scripts/results/compliance/unified-enforcement.log"
COORDINATION_DB = PROJECT_ROOT / "scripts/results/compliance/metrics/unified_enforcement.db"

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(UNIFIED_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class UnifiedEnforcementCoordinator:
    """Coordinates all enforcement engines for comprehensive compliance"""
    
    def __init__(self):
        self.principle_engine = PrincipleBlockingEngine()
        self.orchestration_enforcer = CommandOrchestrationEnforcer()
        self.running = False
        self.monitoring_thread = None
        
        logger.info("Unified Enforcement System initialized")
        logger.info(f"Principle Engine: {len(self.principle_engine.active_rules)} active rules")
        logger.info(f"Orchestration Enforcer: {self.orchestration_enforcer.inventory.total_commands} commands")
    
    def comprehensive_enforcement_check(self, 
                                       context: str, 
                                       operation: str, 
                                       objective: str = None,
                                       commands_used: List[str] = None) -> Dict[str, Any]:
        """
        Comprehensive enforcement check across all systems
        Returns complete compliance analysis with blocking decisions
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'context': context,
            'operation': operation,
            'objective': objective,
            'commands_used': commands_used or [],
            'enforcement_results': {
                'principle_blocking': {},
                'orchestration_compliance': {},
                'unified_decision': {}
            }
        }
        
        logger.info(f"Starting comprehensive enforcement check: {operation[:50]}...")
        
        # 1. Principle Blocking Engine Check
        try:
            is_blocked_principles, violations, remediation = self.principle_engine.check_enforcement(
                context, operation
            )
            
            results['enforcement_results']['principle_blocking'] = {
                'blocked': is_blocked_principles,
                'violations': violations,
                'remediation_actions': remediation,
                'engine_status': 'operational'
            }
            
            logger.info(f"Principle Blocking: {'BLOCKED' if is_blocked_principles else 'ALLOWED'} "
                       f"({len(violations)} violations)")
                       
        except Exception as e:
            logger.error(f"Principle engine error: {e}")
            results['enforcement_results']['principle_blocking'] = {
                'blocked': False,
                'violations': [],
                'remediation_actions': [],
                'engine_status': 'error',
                'error': str(e)
            }
            is_blocked_principles = False
        
        # 2. Command Orchestration Check (if objective and commands provided)
        is_compliant_orchestration = True
        orchestration_violation = None
        
        if objective and commands_used is not None:
            try:
                is_compliant_orchestration, orchestration_violation = \
                    self.orchestration_enforcer.check_orchestration_compliance(objective, commands_used)
                
                suggestions = self.orchestration_enforcer.get_orchestration_suggestions(objective, commands_used)
                
                results['enforcement_results']['orchestration_compliance'] = {
                    'compliant': is_compliant_orchestration,
                    'violation': orchestration_violation.to_dict() if orchestration_violation else None,
                    'suggestions': suggestions,
                    'engine_status': 'operational'
                }
                
                logger.info(f"Orchestration: {'COMPLIANT' if is_compliant_orchestration else 'VIOLATION'}")
                
            except Exception as e:
                logger.error(f"Orchestration engine error: {e}")
                results['enforcement_results']['orchestration_compliance'] = {
                    'compliant': True,
                    'violation': None,
                    'suggestions': [],
                    'engine_status': 'error',
                    'error': str(e)
                }
        else:
            results['enforcement_results']['orchestration_compliance'] = {
                'compliant': True,
                'violation': None,
                'suggestions': [],
                'engine_status': 'skipped',
                'reason': 'No objective or commands provided'
            }
        
        # 3. Unified Decision Logic
        should_block = self._make_unified_blocking_decision(
            is_blocked_principles,
            is_compliant_orchestration,
            orchestration_violation,
            context,
            operation
        )
        
        # Generate unified remediation
        unified_remediation = self._generate_unified_remediation(
            results['enforcement_results'],
            should_block
        )
        
        results['enforcement_results']['unified_decision'] = {
            'final_decision': 'BLOCK' if should_block else 'ALLOW',
            'blocking_reasons': self._get_blocking_reasons(results['enforcement_results']),
            'confidence_score': self._calculate_confidence_score(results['enforcement_results']),
            'unified_remediation': unified_remediation,
            'coordination_status': 'operational'
        }
        
        logger.info(f"UNIFIED DECISION: {'BLOCK' if should_block else 'ALLOW'} "
                   f"(confidence: {results['enforcement_results']['unified_decision']['confidence_score']:.2f})")
        
        return results
    
    def _make_unified_blocking_decision(self, 
                                       principle_blocked: bool,
                                       orchestration_compliant: bool,
                                       orchestration_violation: Any,
                                       context: str,
                                       operation: str) -> bool:
        """Make unified blocking decision across all enforcement systems"""
        
        # Critical principle violations always block
        if principle_blocked:
            return True
        
        # High severity orchestration violations block
        if not orchestration_compliant and orchestration_violation:
            if orchestration_violation.severity in ['HIGH', 'CRITICAL'] and orchestration_violation.blocked:
                return True
        
        # Context-specific blocking logic
        operation_lower = operation.lower()
        context_lower = context.lower()
        
        # Block dangerous operations
        if any(danger in operation_lower for danger in [
            'rm -rf', 'delete database', 'drop table', 'format drive',
            'sudo chmod 777', 'disable security'
        ]):
            logger.warning(f"Blocking dangerous operation: {operation[:100]}")
            return True
        
        # Block root file creation attempts
        if 'root' in context_lower and any(create in operation_lower for create in [
            'create file', 'write file', 'new file', 'touch '
        ]):
            logger.warning(f"Blocking root file creation: {operation[:100]}")
            return True
        
        return False
    
    def _get_blocking_reasons(self, enforcement_results: Dict[str, Any]) -> List[str]:
        """Get comprehensive list of blocking reasons"""
        reasons = []
        
        # Principle blocking reasons
        principle_results = enforcement_results.get('principle_blocking', {})
        if principle_results.get('blocked'):
            reasons.extend([f"Principle violation: {v}" for v in principle_results.get('violations', [])])
        
        # Orchestration blocking reasons
        orchestration_results = enforcement_results.get('orchestration_compliance', {})
        if not orchestration_results.get('compliant'):
            violation = orchestration_results.get('violation')
            if violation and violation.get('blocked'):
                reasons.append(f"Orchestration violation: {violation.get('violation_type')}")
        
        return reasons
    
    def _calculate_confidence_score(self, enforcement_results: Dict[str, Any]) -> float:
        """Calculate confidence score for enforcement decision"""
        score = 0.0
        
        # Engine operational status contributes to confidence
        if enforcement_results.get('principle_blocking', {}).get('engine_status') == 'operational':
            score += 0.4
        
        if enforcement_results.get('orchestration_compliance', {}).get('engine_status') == 'operational':
            score += 0.4
        
        # Clear violations increase confidence
        if enforcement_results.get('principle_blocking', {}).get('blocked'):
            score += 0.1
        
        if not enforcement_results.get('orchestration_compliance', {}).get('compliant'):
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_unified_remediation(self, enforcement_results: Dict[str, Any], should_block: bool) -> List[str]:
        """Generate unified remediation actions"""
        remediation = []
        
        if should_block:
            remediation.append("❌ OPERATION BLOCKED - Review compliance before proceeding")
        
        # Add principle remediation
        principle_remediation = enforcement_results.get('principle_blocking', {}).get('remediation_actions', [])
        remediation.extend([f"🔧 {action}" for action in principle_remediation])
        
        # Add orchestration suggestions
        orchestration_suggestions = enforcement_results.get('orchestration_compliance', {}).get('suggestions', [])
        remediation.extend([f"🎯 {suggestion}" for suggestion in orchestration_suggestions])
        
        # Add general guidance
        if should_block:
            remediation.extend([
                "📋 Review CLAUDE.md principles for compliance requirements",
                "🔍 Use /ce command for proper multi-command orchestration",
                "⚡ Ensure operation aligns with system architecture"
            ])
        
        return remediation
    
    def start_unified_monitoring(self):
        """Start unified monitoring across all enforcement systems"""
        if self.running:
            logger.warning("Unified monitoring already running")
            return
        
        logger.info("Starting Unified Enforcement System monitoring...")
        self.running = True
        
        # Start individual engine monitoring
        self.principle_engine.start_monitoring()
        self.orchestration_enforcer.start_monitoring()
        
        # Start coordination monitoring
        self.monitoring_thread = threading.Thread(target=self._unified_monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        
        logger.info("✅ Unified Enforcement System fully operational")
    
    def stop_unified_monitoring(self):
        """Stop unified monitoring"""
        if not self.running:
            logger.warning("Unified monitoring not running")
            return
        
        logger.info("Stopping Unified Enforcement System...")
        self.running = False
        
        # Stop individual engines
        self.principle_engine.stop_monitoring()
        self.orchestration_enforcer.stop_monitoring()
        
        # Stop coordination monitoring
        if self.monitoring_thread:
            self.monitoring_thread.join()
        
        logger.info("✅ Unified Enforcement System stopped")
    
    def _unified_monitoring_loop(self):
        """Unified monitoring coordination loop"""
        while self.running:
            try:
                # Coordination health check every 5 minutes
                time.sleep(300)
                
                # Verify engine health
                principle_stats = self.principle_engine.get_violation_stats()
                orchestration_stats = self.orchestration_enforcer.get_enforcement_stats()
                
                logger.info(f"Health Check - Principles: {principle_stats['total_active_rules']} rules, "
                           f"Orchestration: {orchestration_stats['compliance_rate']:.1f}% compliance")
                
            except Exception as e:
                logger.error(f"Error in unified monitoring loop: {e}")
                time.sleep(120)
    
    def get_unified_stats(self) -> Dict[str, Any]:
        """Get comprehensive enforcement statistics"""
        principle_stats = self.principle_engine.get_violation_stats()
        orchestration_stats = self.orchestration_enforcer.get_enforcement_stats()
        
        return {
            'unified_enforcement': {
                'status': 'operational' if self.running else 'stopped',
                'engines_active': 2,
                'coordination_health': 'optimal'
            },
            'principle_enforcement': principle_stats,
            'orchestration_enforcement': orchestration_stats,
            'system_summary': {
                'total_rules': principle_stats['total_active_rules'],
                'total_commands': orchestration_stats['total_commands'],
                'overall_compliance': (orchestration_stats['compliance_rate'] + 
                                     (100 - principle_stats['violations_24h'])) / 2
            }
        }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python unified-enforcement-system.py {start|stop|check|stats|health}")
        sys.exit(1)
    
    command = sys.argv[1]
    coordinator = UnifiedEnforcementCoordinator()
    
    if command == 'start':
        coordinator.start_unified_monitoring()
        logger.info("🚨 Unified Enforcement System started. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            coordinator.stop_unified_monitoring()
    
    elif command == 'stop':
        coordinator.stop_unified_monitoring()
        logger.info("Unified Enforcement System stopped")
    
    elif command == 'check':
        if len(sys.argv) < 4:
            print("Usage: python unified-enforcement-system.py check <context> <operation> [objective] [commands]")
            sys.exit(1)
        
        context = sys.argv[2]
        operation = sys.argv[3]
        objective = sys.argv[4] if len(sys.argv) > 4 else None
        commands_used = sys.argv[5].split(',') if len(sys.argv) > 5 and sys.argv[5] else None
        
        results = coordinator.comprehensive_enforcement_check(
            context, operation, objective, commands_used
        )
        
        print("\n🚨 UNIFIED ENFORCEMENT RESULTS")
        print("=" * 50)
        print(f"Context: {context}")
        print(f"Operation: {operation}")
        print(f"Decision: {results['enforcement_results']['unified_decision']['final_decision']}")
        print(f"Confidence: {results['enforcement_results']['unified_decision']['confidence_score']:.2%}")
        
        if results['enforcement_results']['unified_decision']['blocking_reasons']:
            print("\nBlocking Reasons:")
            for reason in results['enforcement_results']['unified_decision']['blocking_reasons']:
                print(f"  • {reason}")
        
        print("\nRemediation Actions:")
        for action in results['enforcement_results']['unified_decision']['unified_remediation']:
            print(f"  {action}")
    
    elif command == 'stats':
        stats = coordinator.get_unified_stats()
        print("\n🚨 UNIFIED ENFORCEMENT STATISTICS")
        print("=" * 50)
        print(f"System Status: {stats['unified_enforcement']['status'].upper()}")
        print(f"Active Engines: {stats['unified_enforcement']['engines_active']}")
        print(f"Total Rules: {stats['system_summary']['total_rules']}")
        print(f"Total Commands: {stats['system_summary']['total_commands']}")
        print(f"Overall Compliance: {stats['system_summary']['overall_compliance']:.1f}%")
        
        print(f"\nPrinciple Enforcement:")
        print(f"  Violations (24h): {stats['principle_enforcement']['violations_24h']}")
        print(f"  Severity Distribution: {stats['principle_enforcement']['violations_by_severity']}")
        
        print(f"\nOrchestration Enforcement:")
        print(f"  Compliance Rate: {stats['orchestration_enforcement']['compliance_rate']:.1f}%")
        print(f"  Avg Utilization: {stats['orchestration_enforcement']['avg_utilization_rate']:.2%}")
    
    elif command == 'health':
        print("🔍 ENFORCEMENT SYSTEM HEALTH CHECK")
        print("=" * 40)
        
        # Test basic functionality
        test_results = coordinator.comprehensive_enforcement_check(
            "system health check",
            "verify enforcement engines operational",
            "system verification",
            ["health-check"]
        )
        
        print(f"✅ Principle Engine: {test_results['enforcement_results']['principle_blocking']['engine_status']}")
        print(f"✅ Orchestration Engine: {test_results['enforcement_results']['orchestration_compliance']['engine_status']}")
        print(f"✅ Unified Coordination: {test_results['enforcement_results']['unified_decision']['coordination_status']}")
        print(f"🎯 System Confidence: {test_results['enforcement_results']['unified_decision']['confidence_score']:.2%}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()