#!/usr/bin/env python3
"""
Hook Collector - Captures Claude Code events and sends to personal dashboard
"""

import json
import os
import sys
import sqlite3
from datetime import datetime
from pathlib import Path

# Add config to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config.database import get_connection, get_current_session_id
from config.settings import CLAUDE_ENGINEERING_ROOT

class HookCollector:
    """Collects events from Claude Code hooks and stores in personal dashboard"""
    
    def __init__(self):
        self.session_id = get_current_session_id()
        self.working_directory = os.getcwd()
    
    def capture_user_prompt_submit(self, prompt_data):
        """Capture user prompt submission event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Update session activity
            cursor.execute('''
                UPDATE sessions 
                SET commands_used = commands_used + 1
                WHERE session_id = ?
            ''', (self.session_id,))
            
            # Record command execution
            cursor.execute('''
                INSERT INTO commands (session_id, command_name, execution_time, 
                                    success, context, working_directory)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                self.session_id,
                'user_prompt',
                datetime.now().isoformat(),
                True,
                prompt_data.get('prompt', '')[:500],  # Truncate long prompts
                self.working_directory
            ))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('command_executed', {
                'session_id': self.session_id,
                'command_name': 'user_prompt',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing user prompt submit: {e}")
    
    def capture_tool_use(self, tool_data):
        """Capture tool usage event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            tool_name = tool_data.get('tool_name', 'unknown_tool')
            success = tool_data.get('success', True)
            duration = tool_data.get('duration', 0)
            
            # Record tool execution
            cursor.execute('''
                INSERT INTO commands (session_id, command_name, execution_time, 
                                    success, execution_duration, context, working_directory)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                self.session_id,
                tool_name,
                datetime.now().isoformat(),
                success,
                duration,
                json.dumps(tool_data),
                self.working_directory
            ))
            
            # Update session statistics
            cursor.execute('''
                UPDATE sessions 
                SET commands_used = commands_used + 1
                WHERE session_id = ?
            ''', (self.session_id,))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('command_executed', {
                'session_id': self.session_id,
                'command_name': tool_name,
                'success': success,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing tool use: {e}")
    
    def capture_context_switch(self, from_context, to_context, reason='manual'):
        """Capture context switch event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Record context switch
            cursor.execute('''
                INSERT INTO context_switches (session_id, switch_time, from_context, 
                                            to_context, reason, switch_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                self.session_id,
                datetime.now().isoformat(),
                from_context,
                to_context,
                reason,
                self._detect_switch_type(from_context, to_context)
            ))
            
            # Update session context switch count
            cursor.execute('''
                UPDATE sessions 
                SET context_switches = context_switches + 1
                WHERE session_id = ?
            ''', (self.session_id,))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('context_switch', {
                'session_id': self.session_id,
                'from_context': from_context,
                'to_context': to_context,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing context switch: {e}")
    
    def capture_session_start(self):
        """Capture session start event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Ensure session exists
            cursor.execute('''
                INSERT OR IGNORE INTO sessions (session_id, working_directory, start_time)
                VALUES (?, ?, ?)
            ''', (self.session_id, self.working_directory, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('session_update', {
                'session_id': self.session_id,
                'event': 'session_start',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing session start: {e}")
    
    def capture_session_end(self):
        """Capture session end event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Update session end time
            cursor.execute('''
                UPDATE sessions 
                SET end_time = ?, active = 0
                WHERE session_id = ? AND active = 1
            ''', (datetime.now().isoformat(), self.session_id))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('session_update', {
                'session_id': self.session_id,
                'event': 'session_end',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing session end: {e}")
    
    def capture_notification(self, notification_type, message, severity='medium', context_data=None):
        """Capture notification event"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Find best session for this notification
            target_session = self._find_best_session_for_notification(context_data)
            
            cursor.execute('''
                INSERT INTO notifications (type, message, severity, context_data, target_session)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                notification_type,
                message,
                severity,
                json.dumps(context_data) if context_data else None,
                target_session
            ))
            
            conn.commit()
            conn.close()
            
            self._notify_real_time('new_notification', {
                'type': notification_type,
                'message': message,
                'severity': severity,
                'target_session': target_session,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error capturing notification: {e}")
    
    def _detect_switch_type(self, from_context, to_context):
        """Detect the type of context switch"""
        if from_context and to_context:
            # Check if it's a directory change
            if '/' in from_context and '/' in to_context:
                return 'directory'
            # Check if it's a project change
            elif 'project' in from_context.lower() or 'project' in to_context.lower():
                return 'project'
        return 'objective'
    
    def _find_best_session_for_notification(self, context_data):
        """Find the best session to send notification to (context-aware routing)"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Get context from notification
            working_dir = None
            if context_data and isinstance(context_data, dict):
                working_dir = context_data.get('working_directory')
            
            if not working_dir:
                working_dir = self.working_directory
            
            # Find active session in same directory
            cursor.execute('''
                SELECT session_id FROM sessions 
                WHERE working_directory = ? AND active = 1
                ORDER BY start_time DESC LIMIT 1
            ''', (working_dir,))
            
            result = cursor.fetchone()
            if result:
                return result[0]
            
            # Fallback to most recent active session
            cursor.execute('''
                SELECT session_id FROM sessions 
                WHERE active = 1
                ORDER BY start_time DESC LIMIT 1
            ''')
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else self.session_id
            
        except Exception as e:
            print(f"Error finding best session: {e}")
            return self.session_id
    
    def _notify_real_time(self, event_type, data):
        """Send real-time notification to dashboard (if running)"""
        try:
            # This would connect to the dashboard's WebSocket server
            # For now, we'll implement a simple file-based notification system
            notifications_file = Path(__file__).parent.parent.parent / 'data' / 'realtime_events.json'
            
            event = {
                'event_type': event_type,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            # Append to file (dashboard can watch this file)
            with open(notifications_file, 'a') as f:
                f.write(json.dumps(event) + '\n')
                
        except Exception as e:
            # Don't fail if real-time notification fails
            pass

def create_hook_scripts():
    """Create hook scripts for Claude Code integration"""
    
    hook_dir = Path(__file__).parent.parent.parent
    collector_path = Path(__file__).absolute()
    
    # UserPromptSubmit hook
    user_prompt_hook = f'''#!/usr/bin/env python3
import sys
import json
sys.path.insert(0, "{collector_path.parent}")
from hook_collector import HookCollector

def main():
    try:
        # Read hook data from stdin
        hook_data = json.loads(sys.stdin.read())
        
        collector = HookCollector()
        collector.capture_user_prompt_submit(hook_data)
        collector.capture_session_start()
        
    except Exception as e:
        # Don't fail Claude Code if hook fails
        pass

if __name__ == "__main__":
    main()
'''
    
    # Tool execution hook
    tool_hook = f'''#!/usr/bin/env python3
import sys
import json
sys.path.insert(0, "{collector_path.parent}")
from hook_collector import HookCollector

def main():
    try:
        # Read hook data from stdin
        hook_data = json.loads(sys.stdin.read())
        
        collector = HookCollector()
        collector.capture_tool_use(hook_data)
        
    except Exception as e:
        # Don't fail Claude Code if hook fails
        pass

if __name__ == "__main__":
    main()
'''
    
    # Write hook scripts
    hooks_dir = hook_dir / 'hooks'
    hooks_dir.mkdir(exist_ok=True)
    
    (hooks_dir / 'user_prompt_submit.py').write_text(user_prompt_hook)
    (hooks_dir / 'tool_execution.py').write_text(tool_hook)
    
    # Make executable
    os.chmod(hooks_dir / 'user_prompt_submit.py', 0o755)
    os.chmod(hooks_dir / 'tool_execution.py', 0o755)
    
    print(f"✅ Hook scripts created in {hooks_dir}")

if __name__ == '__main__':
    # Command line interface for testing
    import argparse
    
    parser = argparse.ArgumentParser(description='Hook Collector CLI')
    parser.add_argument('--create-hooks', action='store_true', help='Create hook scripts')
    parser.add_argument('--test-notification', help='Test notification system')
    
    args = parser.parse_args()
    
    if args.create_hooks:
        create_hook_scripts()
    elif args.test_notification:
        collector = HookCollector()
        collector.capture_notification('info', args.test_notification)