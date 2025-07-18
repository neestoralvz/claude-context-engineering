#!/usr/bin/env python3
"""
Comprehensive Port Allocation Testing and Validation
Tests dynamic port allocation under various conflict scenarios
"""

import subprocess
import socket
import time
import json
import sys
import os
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, asdict
import threading
import signal

@dataclass
class TestResult:
    """Test result data structure"""
    test_name: str
    success: bool
    dashboard_port: Optional[int]
    redis_port: Optional[int]
    conflicts_resolved: int
    resolution_time: float
    error_message: Optional[str] = None
    
class PortBlocker:
    """Utility to temporarily block ports for testing"""
    
    def __init__(self):
        self.blocked_sockets = []
        self.running = True
        
    def block_port(self, port: int, host: str = '127.0.0.1') -> bool:
        """Block a port by binding to it"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind((host, port))
            sock.listen(1)
            self.blocked_sockets.append((port, sock))
            return True
        except Exception as e:
            print(f"Failed to block port {port}: {e}")
            return False
            
    def release_all(self):
        """Release all blocked ports"""
        for port, sock in self.blocked_sockets:
            try:
                sock.close()
            except Exception:
                pass
        self.blocked_sockets.clear()
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release_all()

class PortAllocationTester:
    """Comprehensive testing suite for port allocation"""
    
    def __init__(self, script_path: str):
        self.script_path = script_path
        self.results: List[TestResult] = []
        
    def run_port_scanner(self, dashboard_port: int = None, redis_port: int = None) -> Dict:
        """Run the port scanner and return results"""
        cmd = ['python3', self.script_path, '--dual-service', '--json']
        
        if dashboard_port:
            cmd.extend(['--port', str(dashboard_port)])
        if redis_port:
            cmd.extend(['--redis-port', str(redis_port)])
            
        try:
            start_time = time.time()
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            resolution_time = time.time() - start_time
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                data['resolution_time'] = resolution_time
                return data
            else:
                return {
                    'error': f"Scanner failed: {result.stderr}",
                    'resolution_time': resolution_time
                }
        except subprocess.TimeoutExpired:
            return {'error': 'Scanner timeout', 'resolution_time': 10.0}
        except json.JSONDecodeError as e:
            return {'error': f'JSON decode error: {e}', 'resolution_time': 0}
        except Exception as e:
            return {'error': f'Unexpected error: {e}', 'resolution_time': 0}
    
    def test_no_conflicts(self) -> TestResult:
        """Test allocation when no ports are in use"""
        print("🧪 Test 1: No port conflicts")
        
        result = self.run_port_scanner()
        
        if 'error' in result:
            return TestResult(
                test_name="no_conflicts",
                success=False,
                dashboard_port=None,
                redis_port=None,
                conflicts_resolved=0,
                resolution_time=result.get('resolution_time', 0),
                error_message=result['error']
            )
        
        dashboard = result.get('dashboard', {})
        redis = result.get('redis', {})
        summary = result.get('allocation_summary', {})
        
        success = (
            dashboard.get('available_port') == 8080 and
            redis.get('available_port') == 6380 and
            not dashboard.get('conflict_detected', True) and
            not redis.get('conflict_detected', True)
        )
        
        return TestResult(
            test_name="no_conflicts",
            success=success,
            dashboard_port=dashboard.get('available_port'),
            redis_port=redis.get('available_port'),
            conflicts_resolved=summary.get('total_conflicts', 0),
            resolution_time=result.get('resolution_time', 0)
        )
    
    def test_dashboard_conflict(self) -> TestResult:
        """Test allocation when dashboard port is blocked"""
        print("🧪 Test 2: Dashboard port conflict (8080 blocked)")
        
        with PortBlocker() as blocker:
            if not blocker.block_port(8080):
                return TestResult(
                    test_name="dashboard_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=0,
                    error_message="Failed to block port 8080 for testing"
                )
            
            # Small delay to ensure port is properly blocked
            time.sleep(0.1)
            
            result = self.run_port_scanner()
            
            if 'error' in result:
                return TestResult(
                    test_name="dashboard_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=result.get('resolution_time', 0),
                    error_message=result['error']
                )
            
            dashboard = result.get('dashboard', {})
            redis = result.get('redis', {})
            summary = result.get('allocation_summary', {})
            
            success = (
                dashboard.get('available_port') is not None and
                dashboard.get('available_port') != 8080 and
                redis.get('available_port') == 6380 and
                dashboard.get('conflict_detected', False) and
                not redis.get('conflict_detected', True)
            )
            
            return TestResult(
                test_name="dashboard_conflict",
                success=success,
                dashboard_port=dashboard.get('available_port'),
                redis_port=redis.get('available_port'),
                conflicts_resolved=summary.get('total_conflicts', 0),
                resolution_time=result.get('resolution_time', 0)
            )
    
    def test_redis_conflict(self) -> TestResult:
        """Test allocation when Redis port is blocked"""
        print("🧪 Test 3: Redis port conflict (6380 blocked)")
        
        with PortBlocker() as blocker:
            if not blocker.block_port(6380):
                return TestResult(
                    test_name="redis_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=0,
                    error_message="Failed to block port 6380 for testing"
                )
            
            time.sleep(0.1)
            
            result = self.run_port_scanner()
            
            if 'error' in result:
                return TestResult(
                    test_name="redis_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=result.get('resolution_time', 0),
                    error_message=result['error']
                )
            
            dashboard = result.get('dashboard', {})
            redis = result.get('redis', {})
            summary = result.get('allocation_summary', {})
            
            success = (
                dashboard.get('available_port') == 8080 and
                redis.get('available_port') is not None and
                redis.get('available_port') != 6380 and
                not dashboard.get('conflict_detected', True) and
                redis.get('conflict_detected', False)
            )
            
            return TestResult(
                test_name="redis_conflict",
                success=success,
                dashboard_port=dashboard.get('available_port'),
                redis_port=redis.get('available_port'),
                conflicts_resolved=summary.get('total_conflicts', 0),
                resolution_time=result.get('resolution_time', 0)
            )
    
    def test_dual_conflict(self) -> TestResult:
        """Test allocation when both ports are blocked"""
        print("🧪 Test 4: Dual port conflicts (8080 + 6380 blocked)")
        
        with PortBlocker() as blocker:
            if not (blocker.block_port(8080) and blocker.block_port(6380)):
                return TestResult(
                    test_name="dual_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=0,
                    error_message="Failed to block both ports for testing"
                )
            
            time.sleep(0.1)
            
            result = self.run_port_scanner()
            
            if 'error' in result:
                return TestResult(
                    test_name="dual_conflict",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=result.get('resolution_time', 0),
                    error_message=result['error']
                )
            
            dashboard = result.get('dashboard', {})
            redis = result.get('redis', {})
            summary = result.get('allocation_summary', {})
            
            success = (
                dashboard.get('available_port') is not None and
                dashboard.get('available_port') != 8080 and
                redis.get('available_port') is not None and
                redis.get('available_port') != 6380 and
                dashboard.get('conflict_detected', False) and
                redis.get('conflict_detected', False)
            )
            
            return TestResult(
                test_name="dual_conflict",
                success=success,
                dashboard_port=dashboard.get('available_port'),
                redis_port=redis.get('available_port'),
                conflicts_resolved=summary.get('total_conflicts', 0),
                resolution_time=result.get('resolution_time', 0)
            )
    
    def test_range_exhaustion(self) -> TestResult:
        """Test behavior when many ports in range are blocked"""
        print("🧪 Test 5: Port range stress test (blocking 8080-8090)")
        
        with PortBlocker() as blocker:
            # Block the primary dashboard range
            blocked_count = 0
            for port in range(8080, 8091):
                if blocker.block_port(port):
                    blocked_count += 1
            
            if blocked_count < 5:  # At least some ports should be blocked
                return TestResult(
                    test_name="range_exhaustion",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=0,
                    error_message=f"Only blocked {blocked_count} ports, test may be unreliable"
                )
            
            time.sleep(0.1)
            
            result = self.run_port_scanner()
            
            if 'error' in result:
                return TestResult(
                    test_name="range_exhaustion",
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=result.get('resolution_time', 0),
                    error_message=result['error']
                )
            
            dashboard = result.get('dashboard', {})
            redis = result.get('redis', {})
            
            # Success if alternative ports were found outside blocked range
            success = (
                dashboard.get('available_port') is not None and
                dashboard.get('available_port') not in range(8080, 8091) and
                redis.get('available_port') == 6380  # Redis should be unaffected
            )
            
            return TestResult(
                test_name="range_exhaustion",
                success=success,
                dashboard_port=dashboard.get('available_port'),
                redis_port=redis.get('available_port'),
                conflicts_resolved=result.get('allocation_summary', {}).get('total_conflicts', 0),
                resolution_time=result.get('resolution_time', 0)
            )
    
    def test_custom_ports(self) -> TestResult:
        """Test allocation with custom preferred ports"""
        print("🧪 Test 6: Custom port preferences (3000, 7000)")
        
        result = self.run_port_scanner(dashboard_port=3000, redis_port=7000)
        
        if 'error' in result:
            return TestResult(
                test_name="custom_ports",
                success=False,
                dashboard_port=None,
                redis_port=None,
                conflicts_resolved=0,
                resolution_time=result.get('resolution_time', 0),
                error_message=result['error']
            )
        
        dashboard = result.get('dashboard', {})
        redis = result.get('redis', {})
        
        success = (
            dashboard.get('available_port') == 3000 and
            redis.get('available_port') == 7000 and
            not dashboard.get('conflict_detected', True) and
            not redis.get('conflict_detected', True)
        )
        
        return TestResult(
            test_name="custom_ports",
            success=success,
            dashboard_port=dashboard.get('available_port'),
            redis_port=redis.get('available_port'),
            conflicts_resolved=result.get('allocation_summary', {}).get('total_conflicts', 0),
            resolution_time=result.get('resolution_time', 0)
        )
    
    def run_all_tests(self) -> List[TestResult]:
        """Run all test scenarios"""
        print("🚀 Comprehensive Port Allocation Testing Suite")
        print("=" * 50)
        print()
        
        test_methods = [
            self.test_no_conflicts,
            self.test_dashboard_conflict,
            self.test_redis_conflict,
            self.test_dual_conflict,
            self.test_range_exhaustion,
            self.test_custom_ports
        ]
        
        for test_method in test_methods:
            try:
                result = test_method()
                self.results.append(result)
                
                # Print immediate feedback
                status = "✅ PASS" if result.success else "❌ FAIL"
                print(f"   {status} - Dashboard: {result.dashboard_port}, Redis: {result.redis_port}")
                if result.error_message:
                    print(f"        Error: {result.error_message}")
                print()
                
                # Brief pause between tests
                time.sleep(0.5)
                
            except Exception as e:
                error_result = TestResult(
                    test_name=test_method.__name__,
                    success=False,
                    dashboard_port=None,
                    redis_port=None,
                    conflicts_resolved=0,
                    resolution_time=0,
                    error_message=f"Test execution failed: {e}"
                )
                self.results.append(error_result)
                print(f"   ❌ FAIL - Test execution failed: {e}")
                print()
        
        return self.results
    
    def generate_report(self) -> str:
        """Generate a comprehensive test report"""
        if not self.results:
            return "No test results available"
        
        passed = sum(1 for r in self.results if r.success)
        total = len(self.results)
        success_rate = (passed / total) * 100
        
        report = []
        report.append("📊 Port Allocation Test Report")
        report.append("=" * 40)
        report.append("")
        report.append(f"Overall Success Rate: {success_rate:.1f}% ({passed}/{total} tests passed)")
        report.append("")
        
        # Performance metrics
        total_time = sum(r.resolution_time for r in self.results)
        avg_time = total_time / total if total > 0 else 0
        max_time = max(r.resolution_time for r in self.results) if self.results else 0
        
        report.append("Performance Metrics:")
        report.append(f"  • Total test time: {total_time:.3f}s")
        report.append(f"  • Average resolution time: {avg_time:.3f}s")
        report.append(f"  • Max resolution time: {max_time:.3f}s")
        report.append("")
        
        # Detailed results
        report.append("Detailed Results:")
        for result in self.results:
            status = "✅ PASS" if result.success else "❌ FAIL"
            report.append(f"  {status} {result.test_name}")
            report.append(f"      Dashboard: {result.dashboard_port}")
            report.append(f"      Redis: {result.redis_port}")
            report.append(f"      Conflicts resolved: {result.conflicts_resolved}")
            report.append(f"      Resolution time: {result.resolution_time:.3f}s")
            if result.error_message:
                report.append(f"      Error: {result.error_message}")
            report.append("")
        
        # Recommendations
        if success_rate < 100:
            report.append("Recommendations:")
            failed_tests = [r for r in self.results if not r.success]
            for failed in failed_tests:
                report.append(f"  • Investigate {failed.test_name} failure")
                if failed.error_message:
                    report.append(f"    Error: {failed.error_message}")
            report.append("")
        
        return "\n".join(report)

def main():
    """Main test execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Comprehensive Port Allocation Testing')
    parser.add_argument('--script', default='port-scanner.py', 
                       help='Path to port scanner script')
    parser.add_argument('--json', action='store_true', 
                       help='Output results in JSON format')
    parser.add_argument('--report-file', 
                       help='Save report to file')
    
    args = parser.parse_args()
    
    # Resolve script path
    if not os.path.isabs(args.script):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, args.script)
    else:
        script_path = args.script
    
    if not os.path.exists(script_path):
        print(f"❌ Error: Port scanner script not found: {script_path}")
        sys.exit(1)
    
    # Run tests
    tester = PortAllocationTester(script_path)
    results = tester.run_all_tests()
    
    # Output results
    if args.json:
        # JSON output
        json_results = {
            'summary': {
                'total_tests': len(results),
                'passed': sum(1 for r in results if r.success),
                'failed': sum(1 for r in results if not r.success),
                'success_rate': (sum(1 for r in results if r.success) / len(results)) * 100
            },
            'results': [asdict(r) for r in results]
        }
        print(json.dumps(json_results, indent=2))
    else:
        # Human-readable report
        report = tester.generate_report()
        print(report)
        
        # Save to file if requested
        if args.report_file:
            with open(args.report_file, 'w') as f:
                f.write(report)
            print(f"📄 Report saved to: {args.report_file}")
    
    # Exit with appropriate code
    failed_count = sum(1 for r in results if not r.success)
    sys.exit(0 if failed_count == 0 else 1)

if __name__ == '__main__':
    main()