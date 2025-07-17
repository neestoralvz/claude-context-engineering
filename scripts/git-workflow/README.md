# Git Workflow Scripts - Claude Code Worktree Management

**Purpose**: Comprehensive automation suite for managing multiple Claude Code sessions with git worktrees, enabling parallel AI-assisted development with monitoring and optimization.

---

## 🛠️ Scripts Overview

### **1. Claude Worktree Manager** (`claude-worktree-manager.sh`)
**Primary automation script for worktree and session management**

#### **Features**
- Create worktrees with automatic Claude session launching
- Environment setup with dependency installation
- Session context file generation
- List active worktrees and Claude sessions
- Synchronize all worktrees with main branch
- Clean up completed/merged worktrees
- Comprehensive status reporting

#### **Usage**
```bash
# Create new worktree with Claude session
./claude-worktree-manager.sh create feature-auth claude

# Create worktree with context file
./claude-worktree-manager.sh create feature-ui claude frontend-patterns.md

# List all active sessions
./claude-worktree-manager.sh list

# Status check with system resources
./claude-worktree-manager.sh status

# Sync all worktrees with main branch
./claude-worktree-manager.sh sync

# Auto-resolve conflicts during sync
./claude-worktree-manager.sh sync --resolve-conflicts

# Clean up completed worktrees
./claude-worktree-manager.sh cleanup

# Force cleanup all worktrees
./claude-worktree-manager.sh cleanup --force
```

### **2. Worktree Session Monitor** (`worktree-session-monitor.py`)
**Advanced Python monitoring system with real-time dashboard**

#### **Features**
- Real-time system resource monitoring
- Claude process tracking and analysis
- Git status and branch information
- File system usage analysis
- Session context extraction
- Performance recommendations
- JSON dashboard export
- Watch mode for continuous monitoring

#### **Usage**
```bash
# Basic dashboard view
python3 worktree-session-monitor.py

# Save dashboard to JSON
python3 worktree-session-monitor.py --output dashboard.json

# Continuous monitoring (updates every 30 seconds)
python3 worktree-session-monitor.py --watch

# Custom update interval (60 seconds)
python3 worktree-session-monitor.py --watch --interval 60

# Monitor custom worktrees directory
python3 worktree-session-monitor.py --worktrees-dir /path/to/worktrees
```

---

## 📊 Dashboard Features

### **System Overview**
- **CPU Usage**: Real-time CPU utilization across all processes
- **Memory Usage**: RAM consumption with available/total metrics
- **Disk Usage**: Storage utilization and available space
- **Claude Process Count**: Active Claude Code instances

### **Worktree Analysis**
- **Git Status**: Branch, uncommitted files, commits ahead of main
- **Claude Session**: PID, uptime, memory usage, CPU percentage
- **File System**: Directory size, file counts by type, recent modifications
- **Session Context**: Focus area, objectives, project type detection

### **Recommendations Engine**
- **Performance Optimization**: Session count and resource usage suggestions
- **Git Workflow**: Uncommitted changes and sync recommendations
- **Cleanup Suggestions**: Stale sessions and large worktree identification
- **Resource Management**: Memory and disk space optimization tips

---

## ⚙️ Configuration

### **Environment Variables**
```bash
# Worktrees directory (default: ../worktrees)
export WORKTREES_DIR="../my-worktrees"

# User prefix for branch names (default: current user)
export USER_PREFIX="dev"

# Default Claude launch behavior
export AUTO_CLAUDE=true
```

### **Directory Structure**
```
project-root/
├── main-project/                 # Original repository
├── worktrees/                   # Managed worktrees
│   ├── feature-auth/           # Authentication feature
│   │   ├── .claude-memory.md   # Session context
│   │   ├── .claude-session.pid # Session process ID
│   │   └── .claude-session.log # Session log
│   ├── feature-ui/             # UI development
│   └── bugfix-perf/            # Performance fixes
└── scripts/git-workflow/        # These management scripts
    ├── claude-worktree-manager.sh
    ├── worktree-session-monitor.py
    └── session-monitor.log
```

---

## 🔧 Advanced Features

### **Automatic Environment Setup**
- **Dependencies**: Auto-install npm/pip packages in new worktrees
- **Environment Files**: Copy .env files from main project
- **Database Setup**: Execute development database setup scripts
- **Context Loading**: Load project-specific Claude context files

### **Session Context Management**
```markdown
# .claude-memory.md template generated for each worktree
# Claude Session Context: feature-auth

**Branch**: dev-feature-auth
**Session Focus**: JWT authentication implementation
**Current Objective**: Complete user registration endpoint
**Created**: 2025-01-17 14:30:00

## Progress Tracking
### Completed Tasks
- [x] Initial setup and environment configuration
- [x] User model schema design

### In Progress
- [ ] JWT token generation logic

### Pending
- [ ] Password reset functionality
- [ ] Email verification system

## Technical Context
- **Architecture Approach**: REST API with JWT
- **Dependencies Added**: jsonwebtoken, bcrypt
- **Files Modified**: models/User.js, routes/auth.js
```

### **Integration with Git Workflow**
- **Branch Naming**: Automatic user-prefixed branch creation
- **Conflict Prevention**: Regular sync with main branch
- **Merge Detection**: Automatic cleanup of merged branches
- **Commit Automation**: Auto-commit before sync operations

---

## 📈 Performance Optimization

### **Resource Management**
- **Session Limits**: Recommended maximum 3-4 concurrent Claude sessions
- **Memory Monitoring**: Track RAM usage per session (typical: ~500MB each)
- **CPU Distribution**: Monitor CPU usage across all sessions
- **Disk Space**: Track worktree sizes and clean up large directories

### **Optimization Strategies**
```bash
# Monitor resource usage in real-time
python3 worktree-session-monitor.py --watch

# Clean up completed work regularly
./claude-worktree-manager.sh cleanup

# Sync worktrees daily to prevent conflicts
./claude-worktree-manager.sh sync

# Review large worktrees
python3 worktree-session-monitor.py | grep "total_size_mb"
```

---

## 🔗 Integration with Context Engineering

### **Command Integration**
- **Claude Session Worktrees**: `/claude-session-worktrees` command calls these scripts
- **Strategic Git**: Integration with git workflow optimization
- **Monitoring**: Real-time session tracking for system health
- **Automation**: Hooks integration for workflow automation

### **Quality Assurance**
- **P55/P56 Compliance**: Session validation and monitoring
- **Documentation Standards**: Automated context file generation
- **Performance Metrics**: Quantified resource usage tracking
- **Workflow Optimization**: Continuous improvement recommendations

---

## 🛡️ Troubleshooting

### **Common Issues**

#### **Script Permissions**
```bash
# Make scripts executable
chmod +x claude-worktree-manager.sh
chmod +x worktree-session-monitor.py
```

#### **Python Dependencies**
```bash
# Install required Python packages
pip install psutil

# For systems without pip
python3 -m ensurepip --upgrade
pip install psutil
```

#### **Git Worktree Issues**
```bash
# Remove corrupted worktree
git worktree remove path/to/worktree --force

# Prune deleted worktrees
git worktree prune

# List all worktrees
git worktree list
```

#### **Claude Session Problems**
```bash
# Find orphaned Claude processes
ps aux | grep claude

# Kill specific Claude session
kill <PID>

# Clean up PID files
find ../worktrees -name ".claude-session.pid" -exec rm {} \;
```

### **Debug Mode**
```bash
# Enable verbose logging in bash script
BASH_XRACE=1 ./claude-worktree-manager.sh status

# Python debug mode
python3 -u worktree-session-monitor.py --watch
```

---

## 📚 Related Documentation

- **[Git Worktrees with Claude Code](../../docs/knowledge/reference/git-worktrees-claude-code.md)** - Complete implementation guide
- **[Claude Session Worktrees Command](../../.claude/commands/executable/git-workflow/claude-session-worktrees.md)** - Command interface
- **[Strategic Git Operations](../../.claude/commands/executable/execution/strategic-git.md)** - Advanced git workflows
- **[Claude Hooks Documentation](../../docs/knowledge/reference/claude-hooks.md)** - Automation integration

---

## 🔄 Future Enhancements

### **Planned Features**
- **Docker Integration**: Containerized development environments per worktree
- **Cloud Sync**: Remote worktree state synchronization
- **Team Coordination**: Multi-developer worktree management
- **Performance Analytics**: Historical session performance tracking
- **AI Insights**: Claude conversation quality analysis
- **Integration Testing**: Automated cross-worktree compatibility testing

### **Contributing**
These scripts are part of the Context Engineering ecosystem. Improvements and extensions should:
- Follow the established architecture patterns
- Maintain backward compatibility
- Include comprehensive error handling
- Update this documentation
- Add appropriate logging and monitoring

---

**Quick Navigation**: [CLAUDE.md](../../../CLAUDE.md) | **Documentation**: [Git Worktrees Guide](../../docs/knowledge/reference/git-worktrees-claude-code.md) | **Commands**: [Session Management](../../.claude/commands/executable/git-workflow/)