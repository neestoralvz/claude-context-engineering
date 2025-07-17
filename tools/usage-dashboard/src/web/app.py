"""
Flask application for Personal Usage Dashboard
"""

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import json
import sys
from pathlib import Path

# Add config to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config.database import get_connection, get_current_session_id
from config.settings import SECRET_KEY

def create_app():
    app = Flask(__name__, 
                template_folder=str(Path(__file__).parent / 'templates'),
                static_folder=str(Path(__file__).parent.parent.parent / 'static'))
    app.config['SECRET_KEY'] = SECRET_KEY
    
    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    @app.route('/')
    def dashboard():
        """Main dashboard page"""
        return render_template('dashboard.html')
    
    @app.route('/api/session/current')
    def current_session():
        """Get current session info"""
        session_id = get_current_session_id()
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT session_id, start_time, working_directory, 
                   commands_used, context_switches, objectives_completed
            FROM sessions 
            WHERE session_id = ?
        ''', (session_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return jsonify({
                'session_id': result[0],
                'start_time': result[1],
                'working_directory': result[2],
                'commands_used': result[3],
                'context_switches': result[4],
                'objectives_completed': result[5]
            })
        else:
            return jsonify({'error': 'Session not found'}), 404
    
    @app.route('/api/metrics/summary')
    def metrics_summary():
        """Get dashboard metrics summary"""
        conn = get_connection()
        cursor = conn.cursor()
        
        # Total sessions
        cursor.execute('SELECT COUNT(*) FROM sessions')
        total_sessions = cursor.fetchone()[0]
        
        # Total commands
        cursor.execute('SELECT COUNT(*) FROM commands')
        total_commands = cursor.fetchone()[0]
        
        # Active session
        cursor.execute('SELECT COUNT(*) FROM sessions WHERE active = 1')
        active_sessions = cursor.fetchone()[0]
        
        # Recent commands (last 24 hours)
        cursor.execute('''
            SELECT COUNT(*) FROM commands 
            WHERE execution_time > datetime('now', '-1 day')
        ''')
        recent_commands = cursor.fetchone()[0]
        
        # Average session duration
        cursor.execute('''
            SELECT AVG(julianday(end_time) - julianday(start_time)) * 24 * 60
            FROM sessions WHERE end_time IS NOT NULL
        ''')
        avg_duration_result = cursor.fetchone()[0]
        avg_session_duration = avg_duration_result if avg_duration_result else 0
        
        conn.close()
        
        return jsonify({
            'total_sessions': total_sessions,
            'total_commands': total_commands,
            'active_sessions': active_sessions,
            'recent_commands': recent_commands,
            'avg_session_duration_minutes': round(avg_session_duration, 1)
        })
    
    @app.route('/api/commands/recent')
    def recent_commands():
        """Get recent command executions"""
        limit = request.args.get('limit', 20, type=int)
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT command_name, execution_time, success, 
                   execution_duration, working_directory
            FROM commands
            ORDER BY execution_time DESC
            LIMIT ?
        ''', (limit,))
        
        commands = []
        for row in cursor.fetchall():
            commands.append({
                'command_name': row[0],
                'execution_time': row[1],
                'success': row[2],
                'execution_duration': row[3],
                'working_directory': row[4]
            })
        
        conn.close()
        return jsonify(commands)
    
    @app.route('/api/goals')
    def goals():
        """Get user goals and progress"""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, description, target_metric, 
                   target_value, current_value, deadline, completed
            FROM goals
            ORDER BY created_at DESC
        ''')
        
        goals_list = []
        for row in cursor.fetchall():
            progress = (row[5] / row[4] * 100) if row[4] > 0 else 0
            goals_list.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'target_metric': row[3],
                'target_value': row[4],
                'current_value': row[5],
                'deadline': row[6],
                'completed': bool(row[7]),
                'progress_percent': min(100, round(progress, 1))
            })
        
        conn.close()
        return jsonify(goals_list)
    
    @app.route('/api/notifications/unread')
    def unread_notifications():
        """Get unread notifications"""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, type, message, severity, created_at
            FROM notifications
            WHERE read = 0
            ORDER BY created_at DESC
        ''')
        
        notifications = []
        for row in cursor.fetchall():
            notifications.append({
                'id': row[0],
                'type': row[1],
                'message': row[2],
                'severity': row[3],
                'created_at': row[4]
            })
        
        conn.close()
        return jsonify(notifications)
    
    @app.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
    def mark_notification_read(notification_id):
        """Mark notification as read"""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notifications SET read = 1 WHERE id = ?
        ''', (notification_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    
    # SocketIO events for real-time updates
    @socketio.on('connect')
    def handle_connect():
        print('Client connected to dashboard')
        emit('status', {'msg': 'Connected to Personal Usage Dashboard'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected from dashboard')
    
    # Store socketio reference in app for external access
    app.socketio = socketio
    
    return app

def broadcast_update(update_type, data):
    """Broadcast real-time update to connected clients"""
    # This will be called from external collectors
    pass