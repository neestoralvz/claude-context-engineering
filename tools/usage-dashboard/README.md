# Personal Usage Dashboard

Lightweight personal dashboard for tracking Claude Code usage metrics and implementing context-aware notifications.

## Features

- **Personal Usage Metrics**: Track commands, sessions, context switches
- **Context-Aware Notifications**: Intelligent routing to closest Claude instance  
- **Goal Tracking**: Monitor productivity objectives and milestones
- **Real-time Analytics**: Live dashboard with WebSocket updates

## Quick Start

```bash
# Setup
python setup.py

# Run dashboard
python main.py

# Access dashboard
open http://localhost:5000
```

## Architecture

- **Backend**: Python Flask + SQLite
- **Frontend**: Vanilla HTML/JS + WebSocket
- **Integration**: Claude Code hooks + monitoring scripts
- **Storage**: Local SQLite database with automated backups

## Development Status

🚧 **In Development** - Phase 1 Foundation