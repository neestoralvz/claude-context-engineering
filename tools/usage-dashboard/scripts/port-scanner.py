#!/usr/bin/env python3
"""
Advanced Port Scanner with Dual-Service Support
Automatically detects available ports for dashboard and Redis services
Intelligent conflict resolution with enterprise-grade fallback strategies
"""

import socket
import sys
import os
import subprocess
import platform
from typing import List, Optional, Dict, Tuple
from dataclasses import dataclass

@dataclass
class ServicePortConfig:
    """Configuration for a service port allocation"""
    name: str
    preferred_port: int
    port_ranges: List[Tuple[int, int]]
    fallback_ports: List[int]
    
class AdvancedPortScanner:
    """Intelligent dual-service port scanning and conflict resolution"""
    
    # Service configurations
    DASHBOARD_CONFIG = ServicePortConfig(
        name="dashboard",
        preferred_port=8080,
        port_ranges=[(8080, 8090), (3000, 3010), (5000, 5010)],
        fallback_ports=[8080, 3000, 5001, 8081, 3001, 5002, 8000, 9000, 8888, 4000]
    )
    
    REDIS_CONFIG = ServicePortConfig(
        name="redis",
        preferred_port=6380,
        port_ranges=[(6380, 6390), (6340, 6350), (6320, 6330)],
        fallback_ports=[6380, 6381, 6382, 6383, 6384, 6385, 6386, 6387, 6388, 6389]
    )
    
    COMMON_CONFLICTING_SERVICES = {
        5000: "AirPlay Receiver (macOS)",
        80: "HTTP Server", 
        443: "HTTPS Server",
        22: "SSH Server",
        3306: "MySQL",
        5432: "PostgreSQL",
        6379: "Redis (default)",
        8080: "Common dev server",
        3000: "React/Node dev server",
        9000: "Various dev tools",
        8888: "Jupyter Notebook",
        4000: "Various applications"
    }
    
    def __init__(self, dashboard_port: int = None, redis_port: int = None, host: str = '127.0.0.1'):
        self.host = host
        self.dashboard_config = self.DASHBOARD_CONFIG
        self.redis_config = self.REDIS_CONFIG
        
        # Override preferred ports if specified
        if dashboard_port:
            self.dashboard_config.preferred_port = dashboard_port
        if redis_port:
            self.redis_config.preferred_port = redis_port
    
    def is_port_available(self, port: int, check_system_usage: bool = True) -> bool:
        """Check if a port is available for binding with system process detection"""
        try:
            # Basic socket check
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                result = sock.connect_ex((self.host, port))
                socket_available = result != 0
            
            if not socket_available:
                return False
                
            # Additional system-level check for more thorough detection
            if check_system_usage:
                return self._check_system_port_usage(port)
                
            return True
        except Exception:
            return False
    
    def _check_system_port_usage(self, port: int) -> bool:
        """Check system-level port usage using netstat/lsof"""
        try:
            system = platform.system().lower()
            
            if system in ['darwin', 'linux']:  # macOS or Linux
                # Use lsof to check port usage
                result = subprocess.run(
                    ['lsof', '-i', f':{port}'], 
                    capture_output=True, 
                    text=True, 
                    timeout=2
                )
                return result.returncode != 0  # 0 means port is in use
            elif system == 'windows':
                # Use netstat on Windows
                result = subprocess.run(
                    ['netstat', '-an'], 
                    capture_output=True, 
                    text=True, 
                    timeout=2
                )
                return f':{port} ' not in result.stdout
            else:
                # Fallback to socket check only
                return True
                
        except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
            # If system commands fail, rely on socket check
            return True
    
    def get_conflicting_service(self, port: int) -> Optional[str]:
        """Identify known services that might be using the port"""
        return self.COMMON_CONFLICTING_SERVICES.get(port)
    
    def find_available_port(self, config: ServicePortConfig, excluded_ports: List[int] = None) -> int:
        """Find the first available port for a service using intelligent strategy"""
        excluded_ports = excluded_ports or []
        
        # Strategy 1: Try preferred port first
        if config.preferred_port not in excluded_ports and self.is_port_available(config.preferred_port):
            return config.preferred_port
        
        # Strategy 2: Try port ranges
        for start_range, end_range in config.port_ranges:
            for port in range(start_range, end_range + 1):
                if port not in excluded_ports and self.is_port_available(port):
                    return port
        
        # Strategy 3: Try fallback ports
        for port in config.fallback_ports:
            if port not in excluded_ports and self.is_port_available(port):
                return port
        
        # Strategy 4: Emergency scan in wider range
        emergency_ranges = [(8000, 8100), (9000, 9100), (7000, 7100)]
        if config.name == "redis":
            emergency_ranges = [(6300, 6400), (6500, 6600), (7300, 7400)]
            
        for start_range, end_range in emergency_ranges:
            for port in range(start_range, end_range + 1):
                if port not in excluded_ports and self.is_port_available(port):
                    return port
        
        raise RuntimeError(f"No available ports found for {config.name} service")
    
    def scan_and_resolve_dual_services(self) -> dict:
        """Comprehensive dual-service port scanning and conflict resolution"""
        result = {
            'dashboard': {
                'requested_port': self.dashboard_config.preferred_port,
                'available_port': None,
                'conflict_detected': False,
                'conflicting_service': None,
                'resolution_strategy': None,
                'alternatives': []
            },
            'redis': {
                'requested_port': self.redis_config.preferred_port,
                'available_port': None,
                'conflict_detected': False,
                'conflicting_service': None,
                'resolution_strategy': None,
                'alternatives': []
            },
            'allocation_summary': {
                'total_conflicts': 0,
                'resolution_time': 0,
                'allocation_strategy': 'dual_service_optimization'
            }
        }
        
        import time
        start_time = time.time()
        
        allocated_ports = []
        
        # Phase 1: Try preferred ports for both services
        dashboard_preferred_available = self.is_port_available(self.dashboard_config.preferred_port)
        redis_preferred_available = self.is_port_available(self.redis_config.preferred_port)
        
        if dashboard_preferred_available and redis_preferred_available:
            # Ideal scenario - both preferred ports available
            result['dashboard']['available_port'] = self.dashboard_config.preferred_port
            result['dashboard']['resolution_strategy'] = 'preferred_port_available'
            result['redis']['available_port'] = self.redis_config.preferred_port
            result['redis']['resolution_strategy'] = 'preferred_port_available'
            allocated_ports = [self.dashboard_config.preferred_port, self.redis_config.preferred_port]
        else:
            # Phase 2: Intelligent allocation with conflict resolution
            
            # Allocate dashboard port first
            if dashboard_preferred_available:
                result['dashboard']['available_port'] = self.dashboard_config.preferred_port
                result['dashboard']['resolution_strategy'] = 'preferred_port_available'
                allocated_ports.append(self.dashboard_config.preferred_port)
            else:
                result['dashboard']['conflict_detected'] = True
                result['dashboard']['conflicting_service'] = self.get_conflicting_service(
                    self.dashboard_config.preferred_port
                )
                result['allocation_summary']['total_conflicts'] += 1
                
                try:
                    dashboard_port = self.find_available_port(self.dashboard_config, allocated_ports)
                    result['dashboard']['available_port'] = dashboard_port
                    result['dashboard']['resolution_strategy'] = 'alternative_port_found'
                    allocated_ports.append(dashboard_port)
                except RuntimeError as e:
                    result['dashboard']['resolution_strategy'] = 'no_ports_available'
                    result['dashboard']['error'] = str(e)
            
            # Allocate Redis port (excluding already allocated ports)
            if redis_preferred_available and self.redis_config.preferred_port not in allocated_ports:
                result['redis']['available_port'] = self.redis_config.preferred_port
                result['redis']['resolution_strategy'] = 'preferred_port_available'
                allocated_ports.append(self.redis_config.preferred_port)
            else:
                result['redis']['conflict_detected'] = True
                result['redis']['conflicting_service'] = self.get_conflicting_service(
                    self.redis_config.preferred_port
                )
                result['allocation_summary']['total_conflicts'] += 1
                
                try:
                    redis_port = self.find_available_port(self.redis_config, allocated_ports)
                    result['redis']['available_port'] = redis_port
                    result['redis']['resolution_strategy'] = 'alternative_port_found'
                    allocated_ports.append(redis_port)
                except RuntimeError as e:
                    result['redis']['resolution_strategy'] = 'no_ports_available'
                    result['redis']['error'] = str(e)
        
        # Phase 3: Generate alternatives and timing
        result['allocation_summary']['resolution_time'] = round(time.time() - start_time, 3)
        
        # Generate alternatives for each service
        for service_name, config in [('dashboard', self.dashboard_config), ('redis', self.redis_config)]:
            if result[service_name]['available_port']:
                alternatives = []
                for port in config.fallback_ports[:5]:  # Top 5 alternatives
                    if port not in allocated_ports and self.is_port_available(port):
                        alternatives.append(port)
                result[service_name]['alternatives'] = alternatives
        
        return result
    
    def scan_and_resolve(self) -> dict:
        """Legacy single-service interface for backward compatibility"""
        dual_result = self.scan_and_resolve_dual_services()
        # Return dashboard results in legacy format
        return dual_result['dashboard']
    
    def generate_dual_resolution_message(self, scan_result: dict) -> str:
        """Generate comprehensive dual-service resolution message"""
        messages = []
        messages.append("🔍 Smart Port Allocation Results")
        messages.append("=" * 40)
        
        # Dashboard service
        dashboard = scan_result['dashboard']
        messages.append("\n📊 Dashboard Service:")
        if not dashboard['conflict_detected']:
            messages.append(f"   ✅ Port {dashboard['available_port']} (preferred port available)")
        elif dashboard['available_port']:
            messages.append(f"   ⚠️  Port {dashboard['requested_port']} in use → Alternative: {dashboard['available_port']}")
            if dashboard['conflicting_service']:
                messages.append(f"   📝 Conflict: {dashboard['conflicting_service']}")
        else:
            messages.append(f"   ❌ No available ports found for dashboard")
        
        # Redis service
        redis = scan_result['redis']
        messages.append("\n🔴 Redis Service:")
        if not redis['conflict_detected']:
            messages.append(f"   ✅ Port {redis['available_port']} (preferred port available)")
        elif redis['available_port']:
            messages.append(f"   ⚠️  Port {redis['requested_port']} in use → Alternative: {redis['available_port']}")
            if redis['conflicting_service']:
                messages.append(f"   📝 Conflict: {redis['conflicting_service']}")
        else:
            messages.append(f"   ❌ No available ports found for Redis")
        
        # Summary
        summary = scan_result['allocation_summary']
        messages.append(f"\n📈 Allocation Summary:")
        messages.append(f"   ⏱️  Resolution time: {summary['resolution_time']}s")
        messages.append(f"   🔧 Conflicts resolved: {summary['total_conflicts']}")
        
        # Alternatives
        if dashboard.get('alternatives') or redis.get('alternatives'):
            messages.append("\n🔄 Alternative Ports Available:")
            if dashboard.get('alternatives'):
                alt_dash = ", ".join(map(str, dashboard['alternatives'][:3]))
                messages.append(f"   📊 Dashboard: {alt_dash}")
            if redis.get('alternatives'):
                alt_redis = ", ".join(map(str, redis['alternatives'][:3]))
                messages.append(f"   🔴 Redis: {alt_redis}")
        
        # Usage instructions
        if dashboard['available_port'] and redis['available_port']:
            messages.append("\n🚀 Ready to launch:")
            messages.append(f"   Dashboard: http://localhost:{dashboard['available_port']}")
            messages.append(f"   Redis: localhost:{redis['available_port']}")
        
        return "\n".join(messages)
    
    def generate_resolution_message(self, scan_result: dict) -> str:
        """Generate user-friendly resolution message (legacy single-service)"""
        if not scan_result['conflict_detected']:
            return f"✅ Port {scan_result['available_port']} is available and ready to use"
        
        messages = []
        messages.append(f"⚠️  Port {scan_result['requested_port']} is in use")
        
        if scan_result['conflicting_service']:
            messages.append(f"   Likely used by: {scan_result['conflicting_service']}")
        
        if scan_result['available_port']:
            messages.append(f"✅ Alternative port found: {scan_result['available_port']}")
            if scan_result['alternatives']:
                alt_ports = ", ".join(map(str, scan_result['alternatives']))
                messages.append(f"   Other options: {alt_ports}")
        else:
            messages.append("❌ No available ports found")
        
        return "\n".join(messages)

def main():
    """CLI interface for advanced dual-service port scanning"""
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description='Advanced Port Scanner for Dashboard & Redis Services')
    parser.add_argument('--port', type=int, help='Preferred dashboard port (default: 8080)')
    parser.add_argument('--redis-port', type=int, help='Preferred Redis port (default: 6380)')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to (default: 127.0.0.1)')
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    parser.add_argument('--env', action='store_true', help='Output as environment variables')
    parser.add_argument('--dual-service', action='store_true', help='Scan for both dashboard and Redis ports')
    parser.add_argument('--legacy', action='store_true', help='Use legacy single-service mode')
    
    args = parser.parse_args()
    
    # Determine operation mode
    use_dual_service = args.dual_service or not args.legacy
    
    scanner = AdvancedPortScanner(
        dashboard_port=args.port,
        redis_port=args.redis_port,
        host=args.host
    )
    
    if use_dual_service:
        result = scanner.scan_and_resolve_dual_services()
        
        if args.json:
            print(json.dumps(result, indent=2))
        elif args.env:
            dashboard_port = result['dashboard'].get('available_port')
            redis_port = result['redis'].get('available_port')
            
            if dashboard_port and redis_port:
                print(f"export DASHBOARD_PORT={dashboard_port}")
                print(f"export DASHBOARD_INTERNAL_PORT={dashboard_port}")
                print(f"export REDIS_PORT={redis_port}")
                print(f"export DASHBOARD_HOST={args.host}")
            else:
                print("# Port allocation failed")
                if not dashboard_port:
                    print("# Dashboard port allocation failed")
                if not redis_port:
                    print("# Redis port allocation failed")
                sys.exit(1)
        else:
            print(scanner.generate_dual_resolution_message(result))
            dashboard_port = result['dashboard'].get('available_port')
            redis_port = result['redis'].get('available_port')
            
            if dashboard_port and redis_port:
                print(f"\n✅ All services ready to start!")
            else:
                sys.exit(1)
    else:
        # Legacy single-service mode
        result = scanner.scan_and_resolve()
        
        if args.json:
            print(json.dumps(result, indent=2))
        elif args.env:
            if result['available_port']:
                print(f"export DASHBOARD_PORT={result['available_port']}")
                print(f"export DASHBOARD_HOST={args.host}")
            else:
                print("# No available ports found")
                sys.exit(1)
        else:
            print(scanner.generate_resolution_message(result))
            if result['available_port']:
                print(f"\n🚀 Start dashboard with: python main.py --port {result['available_port']}")
            else:
                sys.exit(1)

# Legacy class alias for backward compatibility
PortScanner = AdvancedPortScanner

if __name__ == '__main__':
    main()