"""
Hook configuration and Claude Code integration setup
"""

import json
import os
from pathlib import Path

def generate_claude_hooks_config():
    """Generate hooks configuration for Claude Code"""
    
    dashboard_root = Path(__file__).parent.parent
    hook_collector = dashboard_root / 'src' / 'collectors' / 'hook_collector.py'
    
    hooks_config = {
        "UserPromptSubmit": {
            "script": str(hook_collector),
            "enabled": True,
            "description": "Capture user prompts for usage analytics"
        },
        "PreToolUse": {
            "script": str(hook_collector),
            "enabled": True,
            "description": "Capture tool usage for command tracking"
        },
        "PostToolUse": {
            "script": str(hook_collector),
            "enabled": True,
            "description": "Capture tool results and timing"
        },
        "Stop": {
            "script": str(hook_collector),
            "enabled": True,
            "description": "Capture session end events"
        },
        "Notification": {
            "script": str(hook_collector),
            "enabled": True,
            "description": "Capture notifications for context-aware routing"
        }
    }
    
    return hooks_config

def create_hooks_integration_guide():
    """Create guide for integrating with Claude Code hooks"""
    
    dashboard_root = Path(__file__).parent.parent
    guide_file = dashboard_root / 'HOOKS_INTEGRATION.md'
    
    guide_content = """# Claude Code Hooks Integration Guide

This guide explains how to integrate the Personal Usage Dashboard with Claude Code's hook system.

## What Are Claude Code Hooks?

Claude Code hooks allow you to run custom scripts at specific points during Claude's execution:

- **UserPromptSubmit**: Triggered when you submit a prompt
- **PreToolUse**: Triggered before Claude uses a tool
- **PostToolUse**: Triggered after Claude uses a tool  
- **Stop**: Triggered when Claude stops
- **Notification**: Triggered for notifications

## Automatic Integration

The dashboard provides automatic hook integration. Run this command to set up hooks:

```bash
python src/collectors/hook_collector.py --create-hooks
```

## Manual Integration

### 1. Find Your Claude Code Settings

Claude Code settings are typically located at:
- macOS: `~/.claude/settings.json`
- Linux: `~/.claude/settings.json`
- Windows: `%USERPROFILE%\\.claude\\settings.json`

### 2. Add Hook Configuration

Add this to your `settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": {
      "script": "DASHBOARD_PATH/src/collectors/hook_collector.py",
      "enabled": true
    },
    "PreToolUse": {
      "script": "DASHBOARD_PATH/src/collectors/hook_collector.py", 
      "enabled": true
    },
    "PostToolUse": {
      "script": "DASHBOARD_PATH/src/collectors/hook_collector.py",
      "enabled": true
    },
    "Stop": {
      "script": "DASHBOARD_PATH/src/collectors/hook_collector.py",
      "enabled": true
    },
    "Notification": {
      "script": "DASHBOARD_PATH/src/collectors/hook_collector.py",
      "enabled": true
    }
  }
}
```

Replace `DASHBOARD_PATH` with the full path to your dashboard installation.

### 3. Test Integration

Test that hooks are working:

```bash
# Test notification capture
python src/collectors/hook_collector.py --test-notification "Test message"

# Check dashboard data
python main.py --debug
```

## Hook Data Format

The dashboard expects hook data in this format:

### UserPromptSubmit
```json
{
  "prompt": "User's prompt text",
  "timestamp": "2025-01-17T12:00:00Z"
}
```

### Tool Use
```json
{
  "tool_name": "Read",
  "success": true,
  "duration": 1.23,
  "parameters": {...}
}
```

### Notifications
```json
{
  "type": "info",
  "message": "Notification message",
  "severity": "medium",
  "context": {...}
}
```

## Context-Aware Notifications

The dashboard implements intelligent notification routing:

1. **Directory Context**: Notifications related to specific directories are sent to sessions working in those directories
2. **Project Context**: Project-specific notifications are routed to relevant project sessions
3. **Global Notifications**: Critical notifications are broadcast to all active sessions
4. **Fallback**: If no specific context is found, notifications go to the most recent active session

## Privacy and Security

- All data is stored locally in SQLite database
- No external network access required
- Hook scripts fail gracefully and don't interrupt Claude Code
- Personal usage data never leaves your machine

## Troubleshooting

### Hooks Not Working
1. Check that `hook_collector.py` is executable: `chmod +x hook_collector.py`
2. Verify paths in `settings.json` are absolute paths
3. Check Claude Code logs for hook errors

### Data Not Appearing
1. Ensure database is initialized: `python main.py --init-db`
2. Check that dashboard is running: `python main.py`
3. Verify hook scripts have correct permissions

### Performance Issues
1. Hooks are designed to be lightweight and non-blocking
2. Database operations are optimized for minimal overhead
3. Real-time updates use efficient WebSocket connections

## Advanced Configuration

### Custom Session Detection
Modify `hook_collector.py` to customize how sessions are detected and grouped.

### Custom Notification Rules
Extend the notification routing logic to implement custom rules for your workflow.

### Integration with External Tools
The dashboard can be extended to integrate with external monitoring tools or send data to other systems.
"""
    
    guide_file.write_text(guide_content)
    return guide_file

def check_claude_code_integration():
    """Check if Claude Code is properly integrated"""
    
    claude_settings_paths = [
        Path.home() / '.claude' / 'settings.json',
        Path.home() / '.config' / 'claude' / 'settings.json'
    ]
    
    for settings_path in claude_settings_paths:
        if settings_path.exists():
            try:
                with open(settings_path, 'r') as f:
                    settings = json.load(f)
                
                hooks = settings.get('hooks', {})
                if hooks:
                    return True, f"Found Claude Code settings with hooks at {settings_path}"
                else:
                    return False, f"Found Claude Code settings but no hooks configured at {settings_path}"
                    
            except (json.JSONDecodeError, IOError) as e:
                return False, f"Error reading Claude Code settings: {e}"
    
    return False, "Claude Code settings not found. Dashboard will work independently."

if __name__ == '__main__':
    # CLI for hook configuration
    import argparse
    
    parser = argparse.ArgumentParser(description='Claude Code Hooks Configuration')
    parser.add_argument('--check', action='store_true', help='Check Claude Code integration')
    parser.add_argument('--create-guide', action='store_true', help='Create integration guide')
    parser.add_argument('--generate-config', action='store_true', help='Generate hooks config')
    
    args = parser.parse_args()
    
    if args.check:
        success, message = check_claude_code_integration()
        print("✅" if success else "⚠️", message)
    
    if args.create_guide:
        guide_file = create_hooks_integration_guide()
        print(f"📖 Integration guide created: {guide_file}")
    
    if args.generate_config:
        config = generate_claude_hooks_config()
        print("🔧 Claude Code hooks configuration:")
        print(json.dumps(config, indent=2))