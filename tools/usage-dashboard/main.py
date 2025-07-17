#!/usr/bin/env python3
"""
Personal Usage Dashboard - Main Entry Point
Lightweight dashboard for Claude Code usage metrics and context-aware notifications
Container-optimized with smart port detection and health checks
"""

import sys
import os
import argparse
import socket
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from web.app import create_app
from config.database import init_database

def find_available_port(preferred_port: int, host: str = '127.0.0.1') -> int:
    """Find available port starting from preferred port"""
    def is_port_available(port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                result = sock.connect_ex((host, port))
                return result != 0
        except Exception:
            return False
    
    # Try preferred port first
    if is_port_available(preferred_port):
        return preferred_port
    
    # Try common alternatives
    alternatives = [8080, 3000, 5001, 8081, 3001, 5002]
    for port in alternatives:
        if port != preferred_port and is_port_available(port):
            print(f"⚠️  Port {preferred_port} in use, using {port} instead")
            return port
    
    # Last resort: scan range
    for port in range(8080, 9000):
        if is_port_available(port):
            print(f"⚠️  Port {preferred_port} in use, using {port} instead")
            return port
    
    raise RuntimeError(f"No available ports found. Port {preferred_port} is in use.")

def get_config_from_env():
    """Get configuration from environment variables (container-friendly)"""
    return {
        'host': os.getenv('DASHBOARD_HOST', '127.0.0.1'),
        'port': int(os.getenv('DASHBOARD_PORT', '8080')),
        'debug': os.getenv('FLASK_ENV', 'production') == 'development'
    }

def main():
    parser = argparse.ArgumentParser(description='Personal Usage Dashboard for Claude Code')
    
    # Get defaults from environment
    env_config = get_config_from_env()
    
    parser.add_argument('--host', default=env_config['host'], help='Host to bind to')
    parser.add_argument('--port', type=int, default=env_config['port'], help='Port to bind to')
    parser.add_argument('--debug', action='store_true', default=env_config['debug'], help='Enable debug mode')
    parser.add_argument('--init-db', action='store_true', help='Initialize database only')
    parser.add_argument('--no-port-scan', action='store_true', help='Disable automatic port scanning')
    
    args = parser.parse_args()
    
    # Initialize database
    try:
        init_database()
        print("✅ Database initialized")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        if not args.debug:
            sys.exit(1)
    
    if args.init_db:
        print("Database initialization complete. Exiting.")
        return
    
    # Smart port detection (unless disabled)
    final_port = args.port
    if not args.no_port_scan:
        try:
            final_port = find_available_port(args.port, args.host)
        except RuntimeError as e:
            print(f"❌ Port configuration error: {e}")
            print("💡 Suggestion: Stop AirPlay Receiver in System Preferences or use --port flag")
            sys.exit(1)
    
    # Create and run app
    try:
        app = create_app()
        
        # Add health check endpoint for containers
        @app.route('/api/health')
        def health_check():
            return {'status': 'healthy', 'port': final_port}, 200
        
        print(f"🚀 Starting Personal Usage Dashboard at http://{args.host}:{final_port}")
        
        if final_port != args.port:
            print(f"🔄 Note: Redirected from port {args.port} to {final_port}")
        
        # Container-friendly configuration
        app.run(
            host=args.host, 
            port=final_port, 
            debug=args.debug,
            threaded=True,
            use_reloader=False if os.getenv('CONTAINER_ENV') else args.debug
        )
        
    except Exception as e:
        print(f"❌ Failed to start dashboard: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()