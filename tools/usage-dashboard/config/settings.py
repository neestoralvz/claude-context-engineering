"""
Configuration settings for Personal Usage Dashboard
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
BACKUPS_DIR = DATA_DIR / 'backups'

# Database
DATABASE_PATH = DATA_DIR / 'usage.db'
BACKUP_RETENTION_DAYS = 30

# Web server
DEFAULT_HOST = '127.0.0.1'
DEFAULT_PORT = 5000
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Claude Code integration
CLAUDE_ENGINEERING_ROOT = Path(__file__).parent.parent.parent.parent
HOOKS_DIR = CLAUDE_ENGINEERING_ROOT / 'projects' / 'context-engineering-dashboard' / 'hooks'
SCRIPTS_DIR = CLAUDE_ENGINEERING_ROOT / 'scripts'

# Monitoring
SESSION_TIMEOUT_MINUTES = 60
CONTEXT_SWITCH_THRESHOLD_SECONDS = 300  # 5 minutes
NOTIFICATION_BATCH_SIZE = 50

# Analytics
PATTERN_CONFIDENCE_THRESHOLD = 0.7
GOAL_CHECK_INTERVAL_MINUTES = 15
USAGE_ANALYSIS_WINDOW_DAYS = 7

# Context-aware notifications
NOTIFICATION_TYPES = {
    'info': 'Information',
    'warning': 'Warning', 
    'success': 'Success',
    'goal_milestone': 'Goal Achievement',
    'context_switch': 'Context Change',
    'session_reminder': 'Session Reminder'
}

SEVERITY_LEVELS = {
    'low': 1,
    'medium': 2, 
    'high': 3,
    'critical': 4
}

# Default goals for new users
DEFAULT_GOALS = [
    {
        'name': 'Daily Command Usage',
        'description': 'Maintain consistent daily Claude Code usage',
        'target_metric': 'commands_per_day',
        'target_value': 50
    },
    {
        'name': 'Focused Sessions',
        'description': 'Keep context switches under control',
        'target_metric': 'context_switches_per_session',
        'target_value': 5
    },
    {
        'name': 'Productive Session Length',
        'description': 'Maintain optimal session duration',
        'target_metric': 'average_session_minutes',
        'target_value': 45
    }
]

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
BACKUPS_DIR.mkdir(exist_ok=True)