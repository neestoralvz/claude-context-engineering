#!/usr/bin/env python3
"""
Claude Code Performance Monitor Hook
Advanced performance monitoring and anomaly detection
"""

import json
import sys
import os
import time
import statistics
import requests
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, deque

# Configuration
OBSERVABILITY_SERVER = os.getenv('OBSERVABILITY_SERVER', 'http://localhost:3001')
PERFORMANCE_WINDOW_SIZE = int(os.getenv('PERFORMANCE_WINDOW_SIZE', '100'))
ANOMALY_THRESHOLD = float(os.getenv('ANOMALY_THRESHOLD', '2.0'))  # Standard deviations
DEBUG_MODE = os.getenv('HOOK_DEBUG', 'false').lower() == 'true'

class PerformanceMonitor:
    def __init__(self):
        self.cache_file = Path.home() / '.claude' / 'observability' / 'performance_cache.json'
        self.metrics_history = defaultdict(lambda: deque(maxlen=PERFORMANCE_WINDOW_SIZE))
        self.load_cache()
    
    def log_debug(self, message):
        if DEBUG_MODE:
            print(f"[PERF] {datetime.now().isoformat()} - {message}", file=sys.stderr)
    
    def load_cache(self):
        """Load performance history from cache"""
        try:
            if self.cache_file.exists():
                with open(self.cache_file, 'r') as f:
                    cache_data = json.load(f)
                    
                # Restore recent history (last 24 hours)
                cutoff_time = datetime.now() - timedelta(hours=24)
                
                for tool_name, history in cache_data.get('metrics_history', {}).items():
                    for entry in history:
                        entry_time = datetime.fromisoformat(entry['timestamp'])
                        if entry_time > cutoff_time:
                            self.metrics_history[tool_name].append(entry)
                            
                self.log_debug(f"Loaded {len(cache_data)} cached performance entries")
                
        except Exception as e:
            self.log_debug(f"Error loading cache: {e}")
    
    def save_cache(self):
        """Save performance history to cache"""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            
            cache_data = {
                'metrics_history': {
                    tool: list(history) for tool, history in self.metrics_history.items()
                },
                'last_updated': datetime.now().isoformat()
            }
            
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
                
            self.log_debug("Performance cache saved")
            
        except Exception as e:
            self.log_debug(f"Error saving cache: {e}")
    
    def analyze_performance(self, hook_data):
        """Analyze performance and detect anomalies"""
        try:
            tool_name = hook_data.get('tool_name', 'unknown')
            event_type = hook_data.get('hook_event_name')
            
            if event_type != 'PostToolUse':
                return None
                
            # Extract performance data
            execution_time = self._extract_execution_time(hook_data)
            success = self._extract_success_status(hook_data)
            confidence = self._extract_confidence_score(hook_data)
            
            # Create performance entry
            perf_entry = {
                'timestamp': datetime.now().isoformat(),
                'execution_time_ms': execution_time,
                'success': success,
                'confidence_score': confidence,
                'session_id': hook_data.get('session_id')
            }
            
            # Add to history
            self.metrics_history[tool_name].append(perf_entry)
            
            # Analyze trends and anomalies
            analysis = self._analyze_tool_performance(tool_name)
            
            # Save cache periodically
            if len(self.metrics_history[tool_name]) % 10 == 0:
                self.save_cache()
            
            return analysis
            
        except Exception as e:
            self.log_debug(f"Error analyzing performance: {e}")
            return None
    
    def _extract_execution_time(self, hook_data):
        """Extract execution time from hook data"""
        # Try multiple sources for execution time
        sources = [
            hook_data.get('execution_time_ms'),
            hook_data.get('tool_response', {}).get('execution_time'),
            hook_data.get('metadata', {}).get('execution_time_ms')
        ]
        
        for source in sources:
            if isinstance(source, (int, float)) and source > 0:
                return float(source)
        
        # Fallback: estimate based on tool type
        tool_name = hook_data.get('tool_name', '').lower()
        estimation_map = {
            'bash': 500,
            'read': 100,
            'write': 200,
            'edit': 150,
            'grep': 300,
            'glob': 250,
            'task': 2000,
            'webfetch': 1500
        }
        
        return estimation_map.get(tool_name, 500)
    
    def _extract_success_status(self, hook_data):
        """Extract success status from hook data"""
        # Check multiple sources
        response = hook_data.get('tool_response', {})
        
        if 'success' in response:
            return response['success']
        elif 'error' in response:
            return False
        elif 'filePath' in response:  # Write/Edit operations
            return True
        else:
            return True  # Assume success if no error
    
    def _extract_confidence_score(self, hook_data):
        """Extract or estimate confidence score"""
        # Try to extract from response
        response = hook_data.get('tool_response', {})
        
        if 'confidence' in response:
            return response['confidence']
        
        # Estimate based on success and execution time
        success = self._extract_success_status(hook_data)
        execution_time = self._extract_execution_time(hook_data)
        
        if not success:
            return 0.3
        
        # Higher confidence for faster execution (within reason)
        if execution_time < 100:
            return 0.95
        elif execution_time < 500:
            return 0.9
        elif execution_time < 2000:
            return 0.85
        else:
            return 0.75
    
    def _analyze_tool_performance(self, tool_name):
        """Analyze performance trends for a specific tool"""
        history = list(self.metrics_history[tool_name])
        
        if len(history) < 5:
            return {'status': 'insufficient_data', 'count': len(history)}
        
        # Calculate statistics
        recent_times = [entry['execution_time_ms'] for entry in history[-20:]]
        recent_successes = [entry['success'] for entry in history[-20:]]
        recent_confidence = [entry['confidence_score'] for entry in history[-20:]]
        
        stats = {
            'tool_name': tool_name,
            'sample_size': len(history),
            'recent_sample_size': len(recent_times),
            'avg_execution_time': statistics.mean(recent_times),
            'median_execution_time': statistics.median(recent_times),
            'std_execution_time': statistics.stdev(recent_times) if len(recent_times) > 1 else 0,
            'success_rate': sum(recent_successes) / len(recent_successes),
            'avg_confidence': statistics.mean(recent_confidence),
            'timestamp': datetime.now().isoformat()
        }
        
        # Detect anomalies
        anomalies = self._detect_anomalies(tool_name, history, stats)
        stats['anomalies'] = anomalies
        
        # Performance trends
        trends = self._analyze_trends(history)
        stats['trends'] = trends
        
        # Performance status
        stats['status'] = self._determine_status(stats, anomalies)
        
        return stats
    
    def _detect_anomalies(self, tool_name, history, stats):
        """Detect performance anomalies"""
        anomalies = []
        
        try:
            if len(history) < 10:
                return anomalies
            
            recent_entry = history[-1]
            avg_time = stats['avg_execution_time']
            std_time = stats['std_execution_time']
            
            # Execution time anomaly
            if std_time > 0:
                z_score = abs(recent_entry['execution_time_ms'] - avg_time) / std_time
                if z_score > ANOMALY_THRESHOLD:
                    anomalies.append({
                        'type': 'execution_time_anomaly',
                        'severity': 'high' if z_score > 3 else 'medium',
                        'z_score': z_score,
                        'current_time': recent_entry['execution_time_ms'],
                        'expected_time': avg_time,
                        'message': f'{tool_name} execution time {z_score:.1f}σ from normal'
                    })
            
            # Success rate anomaly
            recent_failures = sum(1 for entry in history[-10:] if not entry['success'])
            if recent_failures >= 3:
                anomalies.append({
                    'type': 'success_rate_anomaly',
                    'severity': 'high',
                    'recent_failures': recent_failures,
                    'message': f'{tool_name} has {recent_failures} failures in last 10 attempts'
                })
            
            # Confidence drop anomaly
            if len(history) >= 20:
                old_confidence = statistics.mean([e['confidence_score'] for e in history[-20:-10]])
                new_confidence = statistics.mean([e['confidence_score'] for e in history[-10:]])
                confidence_drop = old_confidence - new_confidence
                
                if confidence_drop > 0.2:
                    anomalies.append({
                        'type': 'confidence_drop_anomaly',
                        'severity': 'medium',
                        'confidence_drop': confidence_drop,
                        'old_confidence': old_confidence,
                        'new_confidence': new_confidence,
                        'message': f'{tool_name} confidence dropped by {confidence_drop:.2f}'
                    })
            
        except Exception as e:
            self.log_debug(f"Error detecting anomalies: {e}")
        
        return anomalies
    
    def _analyze_trends(self, history):
        """Analyze performance trends"""
        trends = {}
        
        try:
            if len(history) < 20:
                return {'status': 'insufficient_data'}
            
            # Split into old and new halves
            mid_point = len(history) // 2
            old_half = history[:mid_point]
            new_half = history[mid_point:]
            
            # Execution time trend
            old_avg_time = statistics.mean([e['execution_time_ms'] for e in old_half])
            new_avg_time = statistics.mean([e['execution_time_ms'] for e in new_half])
            time_change = ((new_avg_time - old_avg_time) / old_avg_time) * 100
            
            trends['execution_time_trend'] = {
                'change_percent': time_change,
                'direction': 'improving' if time_change < -5 else 'degrading' if time_change > 5 else 'stable',
                'old_avg': old_avg_time,
                'new_avg': new_avg_time
            }
            
            # Success rate trend
            old_success_rate = sum(e['success'] for e in old_half) / len(old_half)
            new_success_rate = sum(e['success'] for e in new_half) / len(new_half)
            success_change = new_success_rate - old_success_rate
            
            trends['success_rate_trend'] = {
                'change': success_change,
                'direction': 'improving' if success_change > 0.05 else 'degrading' if success_change < -0.05 else 'stable',
                'old_rate': old_success_rate,
                'new_rate': new_success_rate
            }
            
        except Exception as e:
            self.log_debug(f"Error analyzing trends: {e}")
            trends['error'] = str(e)
        
        return trends
    
    def _determine_status(self, stats, anomalies):
        """Determine overall performance status"""
        if any(a['severity'] == 'high' for a in anomalies):
            return 'critical'
        elif any(a['severity'] == 'medium' for a in anomalies):
            return 'warning'
        elif stats['success_rate'] < 0.8:
            return 'warning'
        elif stats['avg_execution_time'] > 5000:  # 5 seconds
            return 'warning'
        else:
            return 'healthy'
    
    def send_analysis(self, analysis):
        """Send performance analysis to server"""
        try:
            url = f"{OBSERVABILITY_SERVER}/api/hooks/performance"
            response = requests.post(
                url,
                json=analysis,
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                self.log_debug("Performance analysis sent successfully")
                return True
            else:
                self.log_debug(f"Server responded with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_debug(f"Failed to send analysis: {e}")
            return False

def main():
    """Main performance monitoring execution"""
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            sys.exit(0)
        
        # Parse JSON
        hook_data = json.loads(input_data)
        
        # Only monitor PostToolUse events
        if hook_data.get('hook_event_name') != 'PostToolUse':
            sys.exit(0)
        
        # Initialize monitor and analyze
        monitor = PerformanceMonitor()
        analysis = monitor.analyze_performance(hook_data)
        
        if analysis:
            # Send analysis to server
            monitor.send_analysis(analysis)
            
            # Log critical anomalies
            if analysis.get('status') == 'critical':
                print(f"⚠️ CRITICAL: Performance anomaly detected in {analysis['tool_name']}", 
                      file=sys.stderr)
                
                for anomaly in analysis.get('anomalies', []):
                    if anomaly['severity'] == 'high':
                        print(f"   {anomaly['message']}", file=sys.stderr)
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        if DEBUG_MODE:
            print(f"[PERF] JSON decode error: {e}", file=sys.stderr)
        sys.exit(1)
        
    except Exception as e:
        if DEBUG_MODE:
            print(f"[PERF] Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()