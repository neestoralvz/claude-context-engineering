#!/usr/bin/env python3
"""
Command Independence Validator - Principle #102 Autocontention Enforcement
Comprehensive dependency analysis and compliance verification system
"""

import os
import re
import json
import time
import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

class CommandIndependenceValidator:
    """
    Comprehensive command independence validation system
    Enforces Principle #102: Command Autocontention Architecture
    """
    
    def __init__(self, commands_dir: str = None):
        self.commands_dir = commands_dir or os.path.expanduser("~/.claude/commands")
        self.results_dir = Path(__file__).parent.parent / "results" / "validation"
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Dependency detection patterns
        self.external_dependencies = [
            r'\.\./\.\.', # Relative path references
            r'import.*from.*/', # Direct imports
            r'source.*/', # Script sourcing
            r'include.*/', # File inclusions
            r'@\./', # Direct file references
            r'\.\./', # Parent directory access
            r'/[^/]*\.sh', # Script file references
            r'/[^/]*\.py', # Python script references
            r'require.*/', # Module requirements
            r'load.*/', # Dynamic loading
        ]
        
        # Allowed global tools
        self.allowed_tools = [
            'git', 'bash', 'curl', 'wget', 'grep', 'sed', 'awk',
            'jq', 'python', 'node', 'npm', 'docker', 'kubectl',
            'Task', 'Read', 'Write', 'Edit', 'Bash', 'Grep', 'LS'
        ]
        
        # Validation metrics
        self.validation_results = []
        self.ecosystem_metrics = {
            'total_commands': 0,
            'compliant_commands': 0,
            'violations': 0,
            'independence_scores': [],
            'compliance_rates': {}
        }
    
    def calculate_independence_score(self, command_data: Dict) -> Dict:
        """
        Calculate mathematical independence score
        Formula: Independence Score = (1 - (external_deps / total_references)) * 100
        Target: 100% (zero external dependencies)
        """
        external_deps = command_data.get('external_dependencies', 0)
        total_refs = command_data.get('total_references', 1)
        slash_commands = command_data.get('slash_commands', 0)
        tool_calls = command_data.get('tool_calls', 0)
        
        # Base independence score
        base_score = (1 - (external_deps / max(total_refs, 1))) * 100
        
        # Bonus for proper patterns
        slash_bonus = min(slash_commands * 2, 10)  # Max 10 points
        tool_bonus = min(tool_calls * 1.5, 15)    # Max 15 points
        
        # Penalty for violations
        violation_penalty = external_deps * 25    # -25 per violation
        
        final_score = max(0, base_score + slash_bonus + tool_bonus - violation_penalty)
        
        return {
            'independence_score': final_score,
            'base_score': base_score,
            'slash_bonus': slash_bonus,
            'tool_bonus': tool_bonus,
            'violation_penalty': violation_penalty,
            'external_dependencies': external_deps,
            'compliance_status': 'COMPLIANT' if final_score >= 95 else 'NON_COMPLIANT',
            'autocontention_level': 'FULL' if external_deps == 0 else 'PARTIAL'
        }
    
    def analyze_command_dependencies(self, command_path: str) -> Dict:
        """
        Comprehensive dependency analysis for a single command
        """
        try:
            with open(command_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading command {command_path}: {e}")
            return {}
        
        analysis = {
            'command_path': command_path,
            'external_dependencies': 0,
            'dependency_patterns': [],
            'slash_commands': 0,
            'tool_calls': 0,
            'total_references': 0,
            'allowed_tools_used': [],
            'violation_details': []
        }
        
        # Check for external dependencies
        for pattern in self.external_dependencies:
            matches = re.findall(pattern, content)
            if matches:
                analysis['external_dependencies'] += len(matches)
                analysis['dependency_patterns'].extend(matches)
                analysis['violation_details'].append({
                    'pattern': pattern,
                    'matches': matches,
                    'severity': 'HIGH'
                })
        
        # Count slash commands
        slash_matches = re.findall(r'^/[a-zA-Z][a-zA-Z0-9-]*', content, re.MULTILINE)
        analysis['slash_commands'] = len(slash_matches)
        
        # Count tool calls
        tool_patterns = r'(' + '|'.join(self.allowed_tools) + r')'
        tool_matches = re.findall(tool_patterns, content)
        analysis['tool_calls'] = len(tool_matches)
        analysis['allowed_tools_used'] = list(set(tool_matches))
        
        # Count total references
        all_refs = re.findall(r'(?:https?://|\.\.?/|@|source|import|include)', content)
        analysis['total_references'] = len(all_refs)
        
        return analysis
    
    def verify_autocontention_compliance(self, command_path: str) -> Dict:
        """
        Principle #102 compliance verification
        """
        try:
            with open(command_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading command {command_path}: {e}")
            return {}
        
        compliance_checks = {
            'zero_external_deps': self._check_external_dependencies(content),
            'slash_invocation': self._check_slash_commands(content),
            'tool_communication': self._check_tool_usage(content),
            'no_direct_coupling': self._check_command_coupling(content),
            'autonomous_operation': self._check_autonomous_patterns(content)
        }
        
        compliance_score = sum(compliance_checks.values()) / len(compliance_checks) * 100
        
        return {
            'compliance_score': compliance_score,
            'individual_checks': compliance_checks,
            'autocontention_status': compliance_score >= 95,
            'violations': [k for k, v in compliance_checks.items() if not v]
        }
    
    def _check_external_dependencies(self, content: str) -> bool:
        """Check for external dependencies"""
        for pattern in self.external_dependencies:
            if re.search(pattern, content):
                return False
        return True
    
    def _check_slash_commands(self, content: str) -> bool:
        """Check for proper slash command usage"""
        slash_commands = re.findall(r'^/[a-zA-Z]', content, re.MULTILINE)
        return len(slash_commands) >= 1  # At least one slash command
    
    def _check_tool_usage(self, content: str) -> bool:
        """Check for proper tool usage patterns"""
        tool_pattern = r'(' + '|'.join(self.allowed_tools) + r')'
        tool_matches = re.findall(tool_pattern, content)
        return len(tool_matches) >= 1  # At least one tool call
    
    def _check_command_coupling(self, content: str) -> bool:
        """Check for direct command coupling"""
        # Look for direct command references
        coupling_patterns = [
            r'\.\.\/commands\/',
            r'import.*command',
            r'source.*command',
            r'include.*command'
        ]
        
        for pattern in coupling_patterns:
            if re.search(pattern, content):
                return False
        return True
    
    def _check_autonomous_patterns(self, content: str) -> bool:
        """Check for autonomous operation patterns"""
        autonomous_indicators = [
            r'MANDATORY',
            r'REQUIRED',
            r'CRITICAL',
            r'Purpose',
            r'Execution'
        ]
        
        found_indicators = sum(1 for pattern in autonomous_indicators if re.search(pattern, content))
        return found_indicators >= 3  # At least 3 autonomous indicators
    
    def generate_independence_metrics(self, command_data: Dict) -> Dict:
        """
        Generate comprehensive independence metrics
        """
        autocontention_score = self.calculate_independence_score(command_data)
        dependency_analysis = self.analyze_command_dependencies(command_data['command_path'])
        compliance_verification = self.verify_autocontention_compliance(command_data['command_path'])
        
        # Calculate overall independence score
        overall_score = (
            autocontention_score['independence_score'] * 0.4 +
            (100 - dependency_analysis['external_dependencies'] * 10) * 0.3 +
            compliance_verification['compliance_score'] * 0.2 +
            (100 if dependency_analysis['tool_calls'] > 0 else 0) * 0.1
        )
        
        return {
            'overall_independence': min(100, overall_score),
            'autocontention_score': autocontention_score,
            'dependency_analysis': dependency_analysis,
            'compliance_verification': compliance_verification,
            'compliance_status': 'FULL' if overall_score >= 95 else 'PARTIAL',
            'recommendations': self._generate_recommendations(dependency_analysis, compliance_verification)
        }
    
    def _generate_recommendations(self, dependency_analysis: Dict, compliance_verification: Dict) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if dependency_analysis['external_dependencies'] > 0:
            recommendations.append("❌ Remove external dependencies to achieve full autocontention")
        else:
            recommendations.append("✅ Command achieves full autocontention compliance")
        
        if dependency_analysis['slash_commands'] == 0:
            recommendations.append("⚠️ Add slash command invocation patterns")
        else:
            recommendations.append("✅ Proper slash command usage detected")
        
        if dependency_analysis['tool_calls'] == 0:
            recommendations.append("⚠️ Add tool communication patterns")
        else:
            recommendations.append("✅ Appropriate tool communication protocols")
        
        if compliance_verification['compliance_score'] < 95:
            recommendations.append("❌ Improve compliance with Principle #102 requirements")
        else:
            recommendations.append("✅ Full Principle #102 compliance achieved")
        
        return recommendations
    
    def validate_single_command(self, command_path: str) -> Dict:
        """
        Validate a single command for independence
        """
        logger.info(f"Validating command: {command_path}")
        
        # Analyze command
        command_data = {'command_path': command_path}
        metrics = self.generate_independence_metrics(command_data)
        
        # Create validation report
        report = {
            'metadata': {
                'command_path': command_path,
                'validation_timestamp': datetime.now().isoformat(),
                'validator_version': '1.0.0',
                'principle_compliance': 'Principle #102'
            },
            'independence_analysis': {
                'overall_score': metrics['overall_independence'],
                'autocontention_level': metrics['autocontention_score']['autocontention_level'],
                'compliance_status': metrics['compliance_status'],
                'external_dependencies': metrics['dependency_analysis']['external_dependencies'],
                'communication_patterns': {
                    'slash_commands': metrics['dependency_analysis']['slash_commands'],
                    'tool_calls': metrics['dependency_analysis']['tool_calls'],
                    'direct_references': len(metrics['dependency_analysis']['dependency_patterns'])
                }
            },
            'detailed_metrics': metrics,
            'recommendations': metrics['recommendations'],
            'quality_gates': {
                'autocontention_compliance': 'PASS' if metrics['dependency_analysis']['external_dependencies'] == 0 else 'FAIL',
                'independence_score': 'PASS' if metrics['overall_independence'] >= 95 else 'FAIL',
                'dependency_analysis': 'PASS' if metrics['dependency_analysis']['external_dependencies'] == 0 else 'FAIL',
                'communication_patterns': 'PASS' if metrics['dependency_analysis']['tool_calls'] > 0 else 'FAIL'
            }
        }
        
        # Update ecosystem metrics
        self.ecosystem_metrics['total_commands'] += 1
        self.ecosystem_metrics['independence_scores'].append(metrics['overall_independence'])
        
        if metrics['overall_independence'] >= 95:
            self.ecosystem_metrics['compliant_commands'] += 1
        else:
            self.ecosystem_metrics['violations'] += 1
        
        return report
    
    def validate_all_commands(self) -> Dict:
        """
        Validate all commands in the ecosystem
        """
        logger.info("Starting ecosystem-wide validation...")
        
        command_files = []
        for root, dirs, files in os.walk(self.commands_dir):
            for file in files:
                if file.endswith('.md'):
                    command_files.append(os.path.join(root, file))
        
        results = []
        for command_file in command_files:
            try:
                result = self.validate_single_command(command_file)
                results.append(result)
                
                # Log result
                status = "✅ COMPLIANT" if result['quality_gates']['autocontention_compliance'] == 'PASS' else "❌ NON-COMPLIANT"
                logger.info(f"{status}: {command_file}")
                
            except Exception as e:
                logger.error(f"Error validating {command_file}: {e}")
        
        # Generate ecosystem report
        ecosystem_report = self._generate_ecosystem_report(results)
        
        return {
            'individual_results': results,
            'ecosystem_report': ecosystem_report,
            'validation_complete': True
        }
    
    def _generate_ecosystem_report(self, results: List[Dict]) -> Dict:
        """Generate comprehensive ecosystem validation report"""
        total_commands = len(results)
        compliant_commands = sum(1 for r in results if r['quality_gates']['autocontention_compliance'] == 'PASS')
        
        compliance_rate = (compliant_commands / total_commands * 100) if total_commands > 0 else 0
        
        avg_independence = sum(r['independence_analysis']['overall_score'] for r in results) / total_commands if total_commands > 0 else 0
        
        return {
            'ecosystem_summary': {
                'total_commands': total_commands,
                'compliant_commands': compliant_commands,
                'non_compliant_commands': total_commands - compliant_commands,
                'compliance_rate': compliance_rate,
                'average_independence_score': avg_independence
            },
            'compliance_breakdown': {
                'autocontention_compliance': sum(1 for r in results if r['quality_gates']['autocontention_compliance'] == 'PASS'),
                'independence_score': sum(1 for r in results if r['quality_gates']['independence_score'] == 'PASS'),
                'dependency_analysis': sum(1 for r in results if r['quality_gates']['dependency_analysis'] == 'PASS'),
                'communication_patterns': sum(1 for r in results if r['quality_gates']['communication_patterns'] == 'PASS')
            },
            'recommendations': self._generate_ecosystem_recommendations(results),
            'validation_timestamp': datetime.now().isoformat()
        }
    
    def _generate_ecosystem_recommendations(self, results: List[Dict]) -> List[str]:
        """Generate ecosystem-wide recommendations"""
        recommendations = []
        
        total_commands = len(results)
        compliant_commands = sum(1 for r in results if r['quality_gates']['autocontention_compliance'] == 'PASS')
        
        if compliant_commands == total_commands:
            recommendations.append("✅ All commands achieve full autocontention compliance")
        else:
            non_compliant = total_commands - compliant_commands
            recommendations.append(f"⚠️ {non_compliant} commands need autocontention improvements")
        
        # Analyze common issues
        dependency_issues = sum(1 for r in results if r['independence_analysis']['external_dependencies'] > 0)
        if dependency_issues > 0:
            recommendations.append(f"❌ {dependency_issues} commands have external dependencies")
        
        communication_issues = sum(1 for r in results if r['quality_gates']['communication_patterns'] == 'FAIL')
        if communication_issues > 0:
            recommendations.append(f"⚠️ {communication_issues} commands need better tool communication")
        
        return recommendations
    
    def save_results(self, results: Dict, filename: str = None) -> str:
        """Save validation results to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            filename = f"independence-validation-{timestamp}.json"
        
        filepath = self.results_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to: {filepath}")
        return str(filepath)
    
    def monitor_continuous_compliance(self, interval: int = 300) -> None:
        """
        Continuous monitoring of command independence
        """
        logger.info(f"Starting continuous monitoring (interval: {interval}s)")
        
        while True:
            try:
                results = self.validate_all_commands()
                
                # Alert on non-compliance
                non_compliant = results['ecosystem_report']['ecosystem_summary']['non_compliant_commands']
                if non_compliant > 0:
                    logger.warning(f"⚠️ {non_compliant} commands are non-compliant")
                
                # Save results
                self.save_results(results)
                
                # Sleep until next check
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error during monitoring: {e}")
                time.sleep(interval)

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description='Command Independence Validator')
    parser.add_argument('--command', '-c', type=str, help='Validate single command')
    parser.add_argument('--all', '-a', action='store_true', help='Validate all commands')
    parser.add_argument('--monitor', '-m', action='store_true', help='Start continuous monitoring')
    parser.add_argument('--interval', '-i', type=int, default=300, help='Monitoring interval in seconds')
    parser.add_argument('--output', '-o', type=str, help='Output filename')
    parser.add_argument('--commands-dir', '-d', type=str, help='Commands directory path')
    
    args = parser.parse_args()
    
    # Initialize validator
    validator = CommandIndependenceValidator(args.commands_dir)
    
    if args.command:
        # Validate single command
        result = validator.validate_single_command(args.command)
        output_file = validator.save_results({'single_command_result': result}, args.output)
        print(f"Single command validation complete. Results saved to: {output_file}")
        
    elif args.all:
        # Validate all commands
        results = validator.validate_all_commands()
        output_file = validator.save_results(results, args.output)
        print(f"Ecosystem validation complete. Results saved to: {output_file}")
        
        # Print summary
        summary = results['ecosystem_report']['ecosystem_summary']
        print(f"\nValidation Summary:")
        print(f"Total Commands: {summary['total_commands']}")
        print(f"Compliant Commands: {summary['compliant_commands']}")
        print(f"Non-Compliant Commands: {summary['non_compliant_commands']}")
        print(f"Compliance Rate: {summary['compliance_rate']:.1f}%")
        print(f"Average Independence Score: {summary['average_independence_score']:.1f}")
        
    elif args.monitor:
        # Start continuous monitoring
        validator.monitor_continuous_compliance(args.interval)
        
    else:
        print("Please specify --command, --all, or --monitor")
        parser.print_help()

if __name__ == "__main__":
    main()