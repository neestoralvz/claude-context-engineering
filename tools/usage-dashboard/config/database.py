"""
Database configuration and schema for Personal Usage Dashboard
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime

DATABASE_PATH = Path(__file__).parent.parent / 'data' / 'usage.db'

def get_connection():
    """Get database connection"""
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    return sqlite3.connect(str(DATABASE_PATH), check_same_thread=False)

def init_database():
    """Initialize database with schema"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Sessions table - Track Claude Code sessions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            working_directory TEXT,
            context_switches INTEGER DEFAULT 0,
            commands_used INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            objectives_completed INTEGER DEFAULT 0,
            active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Commands table - Track individual command executions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            command_name TEXT,
            execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN,
            execution_duration REAL,
            context TEXT,
            tokens_used INTEGER DEFAULT 0,
            working_directory TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        )
    ''')
    
    # Context switches table - Track context changes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS context_switches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            switch_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            from_context TEXT,
            to_context TEXT,
            reason TEXT,
            switch_type TEXT, -- 'directory', 'project', 'objective'
            FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        )
    ''')
    
    # Goals table - Personal productivity goals
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            target_metric TEXT, -- 'commands_per_day', 'session_duration', 'context_switches'
            target_value REAL,
            current_value REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deadline TIMESTAMP,
            completed BOOLEAN DEFAULT 0
        )
    ''')
    
    # Notifications table - Context-aware notifications
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT, -- 'info', 'warning', 'success', 'goal_milestone'
            message TEXT,
            severity TEXT, -- 'low', 'medium', 'high', 'critical'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read BOOLEAN DEFAULT 0,
            context_data TEXT, -- JSON
            target_session TEXT,
            delivered BOOLEAN DEFAULT 0
        )
    ''')
    
    # Usage patterns table - Learn from user behavior
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usage_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern_type TEXT, -- 'daily_peak', 'command_sequence', 'context_preference'
            pattern_data TEXT, -- JSON
            confidence REAL, -- 0.0 to 1.0
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes for performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(active)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_commands_session ON commands(session_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_commands_time ON commands(execution_time)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(read)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_context_switches_session ON context_switches(session_id)')
    
    conn.commit()
    conn.close()

def get_current_session_id():
    """Get or create current session ID based on working directory and timestamp"""
    import uuid
    import os
    
    working_dir = os.getcwd()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check for active session in this directory
    cursor.execute('''
        SELECT session_id FROM sessions 
        WHERE working_directory = ? AND active = 1
        ORDER BY start_time DESC LIMIT 1
    ''', (working_dir,))
    
    result = cursor.fetchone()
    if result:
        session_id = result[0]
    else:
        # Create new session
        session_id = str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO sessions (session_id, working_directory)
            VALUES (?, ?)
        ''', (session_id, working_dir))
        conn.commit()
    
    conn.close()
    return session_id