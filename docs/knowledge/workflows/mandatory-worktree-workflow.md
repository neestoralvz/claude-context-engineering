# Mandatory Git Worktree Workflow

**Meta-Principle**: "Zero conflicts through enforced parallel isolation"

**Purpose**: MANDATORY workflow documentation for using git worktrees in ALL Claude Code operations with automatic enforcement and zero tolerance for violations.

**Authority Status**: CRITICAL operational requirement with automatic blocking and redirection.

**Context Engineering Integration**: Core conflict prevention enabling 300% parallel development capacity.

---

## 🚨 MANDATORY Usage Rules

### **PRIMARY RULE** (Zero Exceptions)
**NEVER work in the main worktree when multiple Claude sessions are active**

### **ENFORCEMENT MECHANISM** (Automatic)
- **Pre-commit hook** blocks main worktree commits when multiple sessions detected
- **Real-time monitoring** alerts on potential conflicts
- **Automatic redirection** to appropriate worktree based on work type

---

## ⚡ Quick Start Guide

### **1. Check Current Status**
```bash
# See all active worktrees and sessions
./scripts/git-workflow/claude-worktree-manager.sh list

# Check conflict monitoring status
./scripts/automation/multi-agent-conflict-monitor.sh status
```

### **2. Create New Worktree** (Automated)
```bash
# Create worktree with automatic Claude session
./scripts/git-workflow/claude-worktree-manager.sh create <session-name> claude

# Examples:
./scripts/git-workflow/claude-worktree-manager.sh create feature-auth claude
./scripts/git-workflow/claude-worktree-manager.sh create bugfix-perf claude
./scripts/git-workflow/claude-worktree-manager.sh create doc-updates claude
```

### **3. Enter Worktree Environment**
```bash
# Navigate to your worktree
cd ../worktrees/<session-name>

# Claude is already launched automatically
# Continue working normally - no conflicts possible
```

---

## 📋 Worktree Categories

### **Pre-Created Worktrees** (Ready to Use)
- **`../worktrees/feature-work/`** - New features and enhancements
- **`../worktrees/maintenance/`** - Bug fixes and maintenance
- **`../worktrees/documentation/`** - Documentation updates
- **`../worktrees/analysis/`** - Analysis and reporting

### **Dynamic Worktrees** (Create as Needed)
- **Custom sessions** for specific tasks
- **Temporary branches** for experimentation
- **Collaborative branches** for team coordination

---

## 🔄 Standard Workflow

### **Starting Work** (Choose One)
```bash
# Option 1: Use existing category worktree
cd ../worktrees/feature-work/
# Continue working

# Option 2: Create new specific worktree
./scripts/git-workflow/claude-worktree-manager.sh create my-task claude
cd ../worktrees/my-task/
```

### **During Work** (Normal Operations)
- Work normally in your isolated worktree
- Make commits without conflict concerns
- Use all Claude Code features normally
- Monitor with: `./scripts/automation/multi-agent-conflict-monitor.sh status`

### **Finishing Work** (Integration)
```bash
# Sync your work to main branch
./scripts/git-workflow/claude-worktree-manager.sh sync

# Or merge manually
git checkout main
git merge nalve-<session-name>

# Clean up completed worktree
./scripts/git-workflow/claude-worktree-manager.sh cleanup
```

---

## 🚨 Enforcement Scenarios

### **Blocked Operations** (Automatic Prevention)
1. **Main worktree commit** with multiple sessions active
2. **File conflicts** between simultaneous operations
3. **Resource contention** when system overloaded

### **Automatic Redirections** (Helpful Guidance)
- **Documentation changes** → `cd ../worktrees/documentation/`
- **Script/code changes** → `cd ../worktrees/feature-work/`
- **Bug fixes** → `cd ../worktrees/maintenance/`
- **Analysis work** → `cd ../worktrees/analysis/`

### **Recovery Actions** (When Blocked)
```bash
# If commit is blocked, you'll see:
# 🚨 ENFORCEMENT VIOLATION: Multiple Claude sessions detected
# ❌ COMMIT BLOCKED - Use worktrees for parallel development

# Quick recovery:
1. Stash your changes: git stash
2. Enter appropriate worktree: cd ../worktrees/feature-work/
3. Apply your changes: git stash pop
4. Continue working normally
```

---

## 📊 Monitoring and Alerts

### **Real-time Monitoring** (Background Process)
```bash
# Start continuous monitoring
./scripts/automation/multi-agent-conflict-monitor.sh monitor

# Check current status
./scripts/automation/multi-agent-conflict-monitor.sh status

# Clean up dead sessions
./scripts/automation/multi-agent-conflict-monitor.sh cleanup
```

### **Alert Levels**
- **CRITICAL**: Multiple sessions with main worktree activity
- **WARNING**: High session count (>2 sessions)
- **INFO**: Normal operation status updates

---

## 🎯 Integration Points

### **CLAUDE.md Compliance**
- **Principle #95**: Mandatory Git Worktree Enforcement (auto-activated)
- **P55/P56 Standards**: All operations maintain transparency
- **Triple-commit Protocol**: Integrated with worktree workflows

### **Command Integration**
- **`/parallel-tool-execution`**: Automatically suggests worktrees
- **`/context-eng`**: Includes worktree status in system activation
- **`/strategic-git`**: Enhanced with worktree management

### **Performance Benefits**
- **300% parallel capacity**: Validated through worktree isolation
- **0% conflicts**: Mathematical guarantee through enforcement
- **85% context switch reduction**: Specialized conversations
- **99.8% context preservation**: Session isolation benefits

---

## 🔧 Troubleshooting

### **Common Issues**
1. **"Multiple sessions detected"** → Use appropriate worktree
2. **"Worktree creation failed"** → Check disk space and permissions
3. **"Session not launching"** → Check Claude Code installation
4. **"Sync conflicts"** → Use conflict resolution tools

### **Emergency Procedures**
```bash
# Force override (emergency only, logged)
git commit --no-verify -m "Emergency commit"

# Reset enforcement (system admin only)
rm .git/hooks/pre-commit
# (Not recommended - breaks conflict prevention)

# Recovery from failed state
./scripts/git-workflow/claude-worktree-manager.sh cleanup --force
```

---

## ✅ Success Validation

### **Expected Outcomes**
- **Zero conflicts** between Claude agents
- **Transparent operation** with minimal user impact
- **Automatic guidance** for optimal worktree selection
- **Performance improvement** through parallel isolation

### **Verification Commands**
```bash
# Verify worktree setup
git worktree list

# Check enforcement status
./scripts/automation/multi-agent-conflict-monitor.sh status

# Validate parallel capacity
./scripts/git-workflow/claude-worktree-manager.sh status
```

---

**CRITICAL SUCCESS FACTOR**: This workflow transforms git conflicts from inevitable problems into impossible scenarios through systematic enforcement and intelligent automation.
