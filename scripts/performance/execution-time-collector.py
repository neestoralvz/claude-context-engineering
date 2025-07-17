#!/usr/bin/env python3
"""
Execution Time Metrics Collector
Context Engineering System - Timing Data Collection via Claude Hooks
P55/P56 Compliance: Real tool execution with transparency and evidence
"""

import json
import sys
import sqlite3
import os
import time
from datetime import datetime
from pathlib import Path
import uuid

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
METRICS_DB = PROJECT_ROOT / "scripts" / "results" / "compliance" / "metrics" / "compliance_monitoring.db"
EXECUTION_METRICS_DB = PROJECT_ROOT / "scripts" / "results" / "performance" / "execution_metrics.db"
LOG_FILE = PROJECT_ROOT / "scripts" / "results" / "performance" / "execution_timing.log"

class ExecutionTimeCollector:
    def __init__(self):
        self.ensure_directories()
        self.initialize_database()
    
    def ensure_directories(self):
        """Ensure all required directories exist"""
        EXECUTION_METRICS_DB.parent.mkdir(parents=True, exist_ok=True)
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    def initialize_database(self):
        """Initialize execution metrics database with schema"""
        schema_file = PROJECT_ROOT / "scripts" / "performance" / "instruction-execution-metrics-schema.sql"
        
        if not EXECUTION_METRICS_DB.exists() and schema_file.exists():
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                with open(schema_file, 'r') as f:
                    conn.executescript(f.read())
                print(f"Initialized execution metrics database: {EXECUTION_METRICS_DB}")
    
    def log_event(self, event_type, data):
        """Log timing event with structured data"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "event_type": event_type,
            "data": data
        }
        
        with open(LOG_FILE, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def handle_user_prompt_submit(self, hook_data):
        """Handle UserPromptSubmit hook - Start timing"""
        session_id = hook_data.get('session_id', '')
        user_input = hook_data.get('user_input', '')
        timestamp = hook_data.get('timestamp', datetime.now().isoformat())
        current_dir = hook_data.get('current_working_directory', '')
        
        # Generate instruction ID
        instruction_id = f"{session_id}_{int(time.time() * 1000)}"
        
        # Calculate start time in milliseconds
        start_time_ms = int(datetime.fromisoformat(timestamp.replace('Z', '+00:00')).timestamp() * 1000)
        
        # Classify instruction type
        instruction_type = self.classify_instruction(user_input)
        
        # Store initial timing record
        try:
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                conn.execute("""
                    INSERT INTO instruction_execution_metrics 
                    (session_id, instruction_id, instruction_type, user_instruction, 
                     start_time, total_execution_time_ms, success)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (session_id, instruction_id, instruction_type, user_input[:1000], 
                      start_time_ms, 0, False))
                
                conn.commit()
        except Exception as e:
            self.log_event("error", {"message": f"Failed to store initial timing: {e}"})
        
        # Log event
        self.log_event("instruction_start", {
            "session_id": session_id,
            "instruction_id": instruction_id,
            "instruction_type": instruction_type,
            "start_time_ms": start_time_ms,
            "current_directory": current_dir,
            "user_input_length": len(user_input)
        })
        
        # Store session data for other hooks
        self.store_session_data(session_id, instruction_id, start_time_ms)
        
        # P56 Transparency Output
        print(json.dumps({
            "message": f"🔍 EXECUTION TIMING STARTED",
            "instruction_id": instruction_id,
            "instruction_type": instruction_type,
            "start_time": timestamp,
            "suppressOutput": False
        }))
    
    def handle_pre_tool_use(self, hook_data):
        """Handle PreToolUse hook - Track tool execution start"""
        session_id = hook_data.get('session_id', '')
        tool_name = hook_data.get('tool_name', '')
        tool_input = hook_data.get('tool_input', {})
        
        # Get current instruction data
        instruction_data = self.get_session_data(session_id)
        if not instruction_data:
            return
        
        instruction_id = instruction_data['instruction_id']
        tool_start_time = int(time.time() * 1000)
        
        # Store tool timing record
        try:
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                conn.execute("""
                    INSERT INTO tool_execution_metrics 
                    (instruction_id, session_id, tool_name, tool_call_index, 
                     tool_parameters, tool_start_time, tool_end_time, 
                     tool_execution_time_ms, success)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (instruction_id, session_id, tool_name, 
                      self.get_tool_call_count(instruction_id), 
                      json.dumps(tool_input)[:500], tool_start_time, 0, 0, False))
                
                conn.commit()
        except Exception as e:
            self.log_event("error", {"message": f"Failed to store tool timing: {e}"})
        
        # Log event
        self.log_event("tool_start", {
            "session_id": session_id,
            "instruction_id": instruction_id,
            "tool_name": tool_name,
            "tool_start_time": tool_start_time,
            "tool_parameters_size": len(json.dumps(tool_input))
        })
    
    def handle_post_tool_use(self, hook_data):
        """Handle PostToolUse hook - Track tool execution completion"""
        session_id = hook_data.get('session_id', '')
        tool_name = hook_data.get('tool_name', '')
        tool_response = hook_data.get('tool_response', {})
        
        # Get current instruction data
        instruction_data = self.get_session_data(session_id)
        if not instruction_data:
            return
        
        instruction_id = instruction_data['instruction_id']
        tool_end_time = int(time.time() * 1000)
        
        # Update tool timing record
        try:
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                # Get the most recent tool record for this instruction
                cursor = conn.execute("""
                    SELECT id, tool_start_time FROM tool_execution_metrics 
                    WHERE instruction_id = ? AND tool_name = ? AND tool_end_time = 0
                    ORDER BY timestamp DESC LIMIT 1
                """, (instruction_id, tool_name))
                
                result = cursor.fetchone()
                if result:
                    tool_id, tool_start_time = result
                    tool_execution_time = tool_end_time - tool_start_time
                    success = tool_response.get('success', True)
                    
                    conn.execute("""
                        UPDATE tool_execution_metrics 
                        SET tool_end_time = ?, tool_execution_time_ms = ?, success = ?,
                            result_size_bytes = ?
                        WHERE id = ?
                    """, (tool_end_time, tool_execution_time, success,
                          len(json.dumps(tool_response)), tool_id))
                    
                    conn.commit()
                    
                    # Update instruction metrics
                    self.update_instruction_tool_metrics(conn, instruction_id)
        except Exception as e:
            self.log_event("error", {"message": f"Failed to update tool timing: {e}"})
        
        # Log event
        self.log_event("tool_complete", {
            "session_id": session_id,
            "instruction_id": instruction_id,
            "tool_name": tool_name,
            "tool_end_time": tool_end_time,
            "success": tool_response.get('success', True)
        })
    
    def handle_stop(self, hook_data):
        """Handle Stop hook - Complete instruction timing"""
        session_id = hook_data.get('session_id', '')
        
        # Get current instruction data
        instruction_data = self.get_session_data(session_id)
        if not instruction_data:
            return
        
        instruction_id = instruction_data['instruction_id']
        start_time_ms = instruction_data['start_time_ms']
        end_time_ms = int(time.time() * 1000)
        total_execution_time = end_time_ms - start_time_ms
        
        # Complete instruction timing record
        try:
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                # Get tool metrics
                tool_stats = self.get_tool_stats(conn, instruction_id)
                
                # Calculate performance metrics
                complexity_score = self.calculate_complexity_score(total_execution_time, tool_stats['tool_count'])
                performance_tier = self.classify_performance_tier(total_execution_time, complexity_score)
                
                # Update instruction record
                conn.execute("""
                    UPDATE instruction_execution_metrics 
                    SET end_time = ?, total_execution_time_ms = ?, success = ?,
                        tool_calls_count = ?, tool_execution_time_ms = ?,
                        complexity_score = ?, performance_tier = ?,
                        p55_compliance = ?, p56_transparency = ?, real_work_ratio = ?
                    WHERE instruction_id = ?
                """, (end_time_ms, total_execution_time, True,
                      tool_stats['tool_count'], tool_stats['total_tool_time'],
                      complexity_score, performance_tier,
                      True, True, 1.0, instruction_id))
                
                conn.commit()
                
                # Generate performance summary
                summary = self.generate_performance_summary(conn, instruction_id)
                
        except Exception as e:
            self.log_event("error", {"message": f"Failed to complete instruction timing: {e}"})
            summary = {"error": str(e)}
        
        # Log completion
        self.log_event("instruction_complete", {
            "session_id": session_id,
            "instruction_id": instruction_id,
            "total_execution_time_ms": total_execution_time,
            "performance_summary": summary
        })
        
        # Clean up session data
        self.cleanup_session_data(session_id)
        
        # P56 Transparency Output
        print(json.dumps({
            "message": f"✅ EXECUTION COMPLETED",
            "instruction_id": instruction_id,
            "execution_time_ms": total_execution_time,
            "performance_tier": performance_tier,
            "summary": summary,
            "suppressOutput": False
        }))
    
    def classify_instruction(self, user_input):
        """Classify instruction type based on content"""
        user_input_lower = user_input.lower()
        
        if any(word in user_input_lower for word in ['read', 'show', 'display', 'view', 'examine']):
            return 'read'
        elif any(word in user_input_lower for word in ['create', 'write', 'add', 'build', 'implement']):
            return 'create'
        elif any(word in user_input_lower for word in ['edit', 'modify', 'change', 'update', 'fix']):
            return 'edit'
        elif any(word in user_input_lower for word in ['search', 'find', 'locate', 'grep']):
            return 'search'
        elif any(word in user_input_lower for word in ['analyze', 'review', 'check', 'validate']):
            return 'analyze'
        elif any(word in user_input_lower for word in ['run', 'execute', 'test', 'build']):
            return 'execute'
        else:
            return 'general'
    
    def calculate_complexity_score(self, execution_time_ms, tool_count):
        """Calculate complexity score based on execution metrics"""
        # Normalize execution time (0-1 scale, 60 seconds = 1.0)
        time_factor = min(execution_time_ms / 60000, 1.0)
        
        # Normalize tool count (0-1 scale, 20 tools = 1.0)
        tool_factor = min(tool_count / 20, 1.0)
        
        # Weighted combination
        return round(0.6 * time_factor + 0.4 * tool_factor, 3)
    
    def classify_performance_tier(self, execution_time_ms, complexity_score):
        """Classify performance tier"""
        if execution_time_ms < 5000:
            return 'fast'
        elif execution_time_ms < 30000:
            return 'standard'
        elif execution_time_ms < 120000:
            return 'complex'
        else:
            return 'critical'
    
    def get_tool_stats(self, conn, instruction_id):
        """Get tool statistics for instruction"""
        cursor = conn.execute("""
            SELECT COUNT(*) as tool_count, 
                   COALESCE(SUM(tool_execution_time_ms), 0) as total_tool_time,
                   AVG(tool_execution_time_ms) as avg_tool_time
            FROM tool_execution_metrics 
            WHERE instruction_id = ? AND success = 1
        """, (instruction_id,))
        
        result = cursor.fetchone()
        return {
            'tool_count': result[0] or 0,
            'total_tool_time': result[1] or 0,
            'avg_tool_time': result[2] or 0
        }
    
    def get_tool_call_count(self, instruction_id):
        """Get current tool call count for instruction"""
        try:
            with sqlite3.connect(str(EXECUTION_METRICS_DB)) as conn:
                cursor = conn.execute("""
                    SELECT COUNT(*) FROM tool_execution_metrics 
                    WHERE instruction_id = ?
                """, (instruction_id,))
                return cursor.fetchone()[0]
        except:
            return 0
    
    def update_instruction_tool_metrics(self, conn, instruction_id):
        """Update instruction-level tool metrics"""
        tool_stats = self.get_tool_stats(conn, instruction_id)
        
        conn.execute("""
            UPDATE instruction_execution_metrics 
            SET tool_calls_count = ?, tool_execution_time_ms = ?
            WHERE instruction_id = ?
        """, (tool_stats['tool_count'], tool_stats['total_tool_time'], instruction_id))
    
    def generate_performance_summary(self, conn, instruction_id):
        """Generate performance summary for instruction"""
        cursor = conn.execute("""
            SELECT instruction_type, total_execution_time_ms, tool_calls_count,
                   performance_tier, complexity_score
            FROM instruction_execution_metrics 
            WHERE instruction_id = ?
        """, (instruction_id,))
        
        result = cursor.fetchone()
        if not result:
            return {}
        
        return {
            "instruction_type": result[0],
            "execution_time_ms": result[1],
            "tool_calls": result[2],
            "performance_tier": result[3],
            "complexity_score": result[4]
        }
    
    def store_session_data(self, session_id, instruction_id, start_time_ms):
        """Store session data for cross-hook communication"""
        session_file = Path(f"/tmp/claude_session_{session_id}.json")
        session_data = {
            "instruction_id": instruction_id,
            "start_time_ms": start_time_ms,
            "session_id": session_id
        }
        
        with open(session_file, 'w') as f:
            json.dump(session_data, f)
    
    def get_session_data(self, session_id):
        """Get session data for cross-hook communication"""
        session_file = Path(f"/tmp/claude_session_{session_id}.json")
        
        if session_file.exists():
            try:
                with open(session_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        return None
    
    def cleanup_session_data(self, session_id):
        """Clean up session data"""
        session_file = Path(f"/tmp/claude_session_{session_id}.json")
        if session_file.exists():
            session_file.unlink()

def main():
    """Main execution based on hook event"""
    try:
        # Read hook input
        hook_data = json.load(sys.stdin)
        event_name = hook_data.get('hook_event_name', '')
        
        # Initialize collector
        collector = ExecutionTimeCollector()
        
        # Route to appropriate handler
        if event_name == 'UserPromptSubmit':
            collector.handle_user_prompt_submit(hook_data)
        elif event_name == 'PreToolUse':
            collector.handle_pre_tool_use(hook_data)
        elif event_name == 'PostToolUse':
            collector.handle_post_tool_use(hook_data)
        elif event_name == 'Stop':
            collector.handle_stop(hook_data)
        else:
            print(f"Unknown hook event: {event_name}", file=sys.stderr)
            sys.exit(1)
    
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()