# Claude Code Hooks Integration Guide

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
- Windows: `%USERPROFILE%\.claude\settings.json`

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
