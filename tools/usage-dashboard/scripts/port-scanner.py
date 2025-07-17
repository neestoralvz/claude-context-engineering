#!/usr/bin/env python3
"""
Smart Port Scanner and Conflict Resolution
Automatically detects available ports and resolves conflicts
"""

import socket
import sys
import os
from typing import List, Optional

class PortScanner:
    """Intelligent port scanning and conflict resolution"""
    
    # Default port preferences in order of preference
    DEFAULT_PORTS = [8080, 3000, 5001, 8081, 3001, 5002, 8000, 9000]
    COMMON_CONFLICTING_SERVICES = {
        5000: "AirPlay Receiver (macOS)",
        80: "HTTP Server", 
        443: "HTTPS Server",
        22: "SSH Server",
        3306: "MySQL",
        5432: "PostgreSQL",
        6379: "Redis"
    }
    
    def __init__(self, preferred_port: int = 8080, host: str = '127.0.0.1'):
        self.preferred_port = preferred_port
        self.host = host
    
    def is_port_available(self, port: int) -> bool:
        """Check if a port is available for binding"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                result = sock.connect_ex((self.host, port))
                return result != 0
        except Exception:
            return False
    
    def get_conflicting_service(self, port: int) -> Optional[str]:
        """Identify known services that might be using the port"""
        return self.COMMON_CONFLICTING_SERVICES.get(port)
    
    def find_available_port(self, start_port: int = None) -> int:
        """Find the first available port starting from preferred port"""
        start_port = start_port or self.preferred_port
        
        # First try the exact preferred port
        if self.is_port_available(start_port):
            return start_port
        
        # Try default port list
        for port in self.DEFAULT_PORTS:
            if port != start_port and self.is_port_available(port):
                return port
        
        # Last resort: scan sequential ports from 8080
        for port in range(8080, 9000):
            if self.is_port_available(port):
                return port
        
        raise RuntimeError("No available ports found in range 8080-9000")
    
    def scan_and_resolve(self) -> dict:
        """Comprehensive port scanning and conflict resolution"""
        result = {
            'requested_port': self.preferred_port,
            'available_port': None,
            'conflict_detected': False,
            'conflicting_service': None,
            'resolution_strategy': None,
            'alternatives': []
        }
        
        # Check if preferred port is available
        if self.is_port_available(self.preferred_port):
            result['available_port'] = self.preferred_port
            result['resolution_strategy'] = 'preferred_port_available'
        else:
            result['conflict_detected'] = True
            result['conflicting_service'] = self.get_conflicting_service(self.preferred_port)
            
            # Find alternative port
            try:
                available_port = self.find_available_port()
                result['available_port'] = available_port
                result['resolution_strategy'] = 'alternative_port_found'
                
                # Provide additional alternatives
                alternatives = []
                for port in self.DEFAULT_PORTS:
                    if port != available_port and self.is_port_available(port):
                        alternatives.append(port)
                        if len(alternatives) >= 3:
                            break
                result['alternatives'] = alternatives
                
            except RuntimeError as e:
                result['resolution_strategy'] = 'no_ports_available'
                result['error'] = str(e)
        
        return result
    
    def generate_resolution_message(self, scan_result: dict) -> str:
        """Generate user-friendly resolution message"""
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
    """CLI interface for port scanning"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Smart Port Scanner for Dashboard')
    parser.add_argument('--port', type=int, default=8080, help='Preferred port (default: 8080)')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to (default: 127.0.0.1)')
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    parser.add_argument('--env', action='store_true', help='Output as environment variables')
    
    args = parser.parse_args()
    
    scanner = PortScanner(args.port, args.host)
    result = scanner.scan_and_resolve()
    
    if args.json:
        import json
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

if __name__ == '__main__':
    main()