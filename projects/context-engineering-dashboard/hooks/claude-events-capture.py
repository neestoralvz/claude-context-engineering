#!/usr/bin/env python3
"""
Claude Code Events Capture Hook
Captures all Claude Code tool events and sends to observability server
"""

import json
import sys
import os
import time
import requests
from datetime import datetime
from pathlib import Path

# Configuration
OBSERVABILITY_SERVER = os.getenv('OBSERVABILITY_SERVER', 'http://localhost:3001')
HOOK_TIMEOUT = int(os.getenv('HOOK_TIMEOUT', '30'))
DEBUG_MODE = os.getenv('HOOK_DEBUG', 'false').lower() == 'true'

def log_debug(message):
    """Debug logging if enabled"""
    if DEBUG_MODE:
        print(f"[DEBUG] {datetime.now().isoformat()} - {message}", file=sys.stderr)

def send_to_server(data, endpoint='/api/hooks/event'):
    """Send data to observability server"""
    try:
        url = f"{OBSERVABILITY_SERVER}{endpoint}"
        response = requests.post(
            url,
            json=data,
            timeout=HOOK_TIMEOUT,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            log_debug(f"Successfully sent event to {url}")
            return True
        else:
            log_debug(f"Server responded with {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        log_debug(f"Failed to send to server: {e}")
        return False
    except Exception as e:
        log_debug(f"Unexpected error: {e}")
        return False

def process_event(hook_data):
    """Process Claude Code hook event"""
    try:
        # Extract event information
        event_type = hook_data.get('hook_event_name', 'unknown')
        session_id = hook_data.get('session_id')
        tool_name = hook_data.get('tool_name')
        timestamp = datetime.now().isoformat()
        
        # Prepare event data
        event_data = {
            'session_id': session_id,
            'event_type': event_type,
            'tool_name': tool_name,
            'hook_event': event_type,
            'timestamp': timestamp,
            'success': True,  # Will be updated in PostToolUse
            'data': {
                'tool_input': hook_data.get('tool_input', {}),
                'tool_response': hook_data.get('tool_response', {}),
                'current_working_directory': hook_data.get('current_working_directory'),
                'transcript_path': hook_data.get('transcript_path')
            },
            'metadata': {
                'hook_version': '1.0.0',
                'capture_time': timestamp,
                'environment': os.getenv('NODE_ENV', 'development')
            }
        }
        
        # Add execution timing for PostToolUse events
        if event_type == 'PostToolUse' and 'execution_time_ms' in hook_data:
            event_data['execution_time_ms'] = hook_data['execution_time_ms']
        
        # Send to observability server
        success = send_to_server(event_data)
        
        # Log locally as backup
        log_locally(event_data)
        
        if success:
            log_debug(f"Processed {event_type} event for {tool_name}")
        else:
            log_debug(f"Failed to send {event_type} event for {tool_name}")
            
        return success
        
    except Exception as e:
        log_debug(f"Error processing event: {e}")
        return False

def log_locally(event_data):
    """Log event locally as backup"""
    try:
        # Create logs directory if it doesn't exist
        log_dir = Path.home() / '.claude' / 'observability' / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Log file with date
        log_file = log_dir / f"events-{datetime.now().strftime('%Y-%m-%d')}.jsonl"
        
        # Append event to log file
        with open(log_file, 'a') as f:
            f.write(json.dumps(event_data) + '\n')
            
        log_debug(f"Event logged locally to {log_file}")
        
    except Exception as e:
        log_debug(f"Failed to log locally: {e}")

def extract_performance_metrics(hook_data):
    """Extract performance metrics from hook data"""
    metrics = []
    
    try:
        tool_name = hook_data.get('tool_name')
        session_id = hook_data.get('session_id')
        timestamp = datetime.now().isoformat()
        
        # Execution time metric
        if 'execution_time_ms' in hook_data:
            metrics.append({
                'session_id': session_id,
                'metric_name': f'{tool_name}_execution_time',
                'metric_value': hook_data['execution_time_ms'],
                'metric_unit': 'ms',
                'timestamp': timestamp,
                'category': 'performance'
            })
        
        # Success rate metric
        success = hook_data.get('success', True)
        metrics.append({
            'session_id': session_id,
            'metric_name': f'{tool_name}_success_rate',
            'metric_value': 1.0 if success else 0.0,
            'metric_unit': 'ratio',
            'timestamp': timestamp,
            'category': 'quality'
        })
        
        # Tool usage metric
        metrics.append({
            'session_id': session_id,
            'metric_name': f'{tool_name}_usage_count',
            'metric_value': 1,
            'metric_unit': 'count',
            'timestamp': timestamp,
            'category': 'usage'
        })
        
        # Send metrics to server
        for metric in metrics:
            send_to_server(metric, '/api/hooks/metric')
            
        log_debug(f"Extracted {len(metrics)} metrics for {tool_name}")
        
    except Exception as e:
        log_debug(f"Error extracting metrics: {e}")

def main():
    """Main hook execution"""
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            log_debug("No input data received")
            sys.exit(0)
        
        # Parse JSON
        hook_data = json.loads(input_data)
        log_debug(f"Received hook data: {hook_data.get('hook_event_name', 'unknown')}")
        
        # Process the event
        success = process_event(hook_data)
        
        # Extract performance metrics for PostToolUse events
        if hook_data.get('hook_event_name') == 'PostToolUse':
            extract_performance_metrics(hook_data)
        
        # Exit with appropriate code
        if success:
            sys.exit(0)  # Success
        else:
            # Non-blocking error - continue with Claude execution
            sys.exit(1)
            
    except json.JSONDecodeError as e:
        log_debug(f"JSON decode error: {e}")
        sys.exit(1)  # Non-blocking error
        
    except Exception as e:
        log_debug(f"Unexpected error in main: {e}")
        sys.exit(1)  # Non-blocking error

if __name__ == '__main__':
    main()