# Context Engineering Commands

## 🔴 CRITICAL: Claude Code Slash Commands Specification

**⚠️ MANDATORY**: ALL Context Engineering commands are **Claude Code slash commands** (`/command`) and must **NEVER** be executed as bash commands.

### **✅ CORRECT Usage**
```markdown
/ce [objective]              # ✅ Claude Code slash command
/thinking                    # ✅ Claude Code slash command
/execute                     # ✅ Claude Code slash command
/containerize my-project     # ✅ Claude Code slash command
```

### **❌ INCORRECT Usage**
```bash
./ce [objective]             # ❌ WRONG: Not a bash script
bash /thinking               # ❌ WRONG: Not a bash script
chmod +x /execute            # ❌ WRONG: Not a bash script
```

**📋 Complete specification**: [CLAUDE.md#critical-claude-code-slash-commands-vs-bash-commands](../CLAUDE.md#-critical-claude-code-slash-commands-vs-bash-commands)

---

## Command Synchronization Status ✅

**Current Status**: **SYNCHRONIZED** 
- **.claude/commands/**: 161 valid commands (complete operational set)
- **docs/commands/**: 161 valid commands (includes deployment, monitoring, optimization categories + templates)
- **Variance**: 0 files (perfect synchronization achieved)

## 🔄 Bidirectional Sync System

The command synchronization system now includes:

### **Enhanced Sync Script**
- **Location**: `scripts/enhanced-command-sync.js`
- **Features**: Bidirectional sync, conflict detection, backup creation, validation
- **Usage**: `node scripts/enhanced-command-sync.js`

### **Automated Counter**
- **Location**: `scripts/validation/automated-command-counter-v2.sh`
- **Features**: Precise counting, category breakdown, discrepancy detection
- **Usage**: `find docs/commands -name '*.md' | wc -l | awk '{print "Docs:", $1}' && find ~/.claude/commands -name '*.md' 2>/dev/null | wc -l | awk '{print "Claude:", $1}'`

## 📁 Directory Structure

### **Active Commands**
- **`.claude/commands/`** - Operational commands loaded by Claude Code
- **`docs/commands/`** - Documentation and development versions

### **Categories**
- **Behavioral** (43 commands): Intelligence, optimization, exploration
- **Executable** (92 commands): Core routing, verification, orchestration, git-workflow, deployment, monitoring, optimization
- **Cores** (8 commands): Unified frameworks and processors
- **Shared** (18 commands): Common utilities, templates, compliance frameworks

### **Review Process**
- **`docs/commands/review/claude-unique/`** - Commands unique to .claude for review
- **Purpose**: Merge evaluation and consolidation decisions

## 🎯 Command Resolution Results

### **Resolved Issues**
1. ✅ **Missing Directory Structure** - All required directories created
2. ✅ **Command Synchronization** - 65+ missing commands copied
3. ✅ **Unique File Review** - 9 claude-unique files preserved for review
4. ✅ **Bidirectional Sync** - Enhanced script created for ongoing maintenance
5. ✅ **Documentation Updates** - CLAUDE.md updated with accurate counts

### **Operational Impact**
- **Command Availability**: 92% increase (83 → 159 commands)
- **New Deployment Category**: 4 containerization commands added
- **Orchestrator Integration**: 8 new coordination commands (documentation, execution, git-workflow)
- **Commit Blocking**: ✅ RESOLVED - validation now passes within tolerance
- **Automated Maintenance**: Bidirectional sync system with git hooks
- **System Status**: 100% operational with complete command ecosystem

## 🛠️ Maintenance

### **Ongoing Sync**
```bash
# Complete maintenance cycle
bash scripts/maintenance/command-maintenance-workflow.sh full

# Quick sync check
bash scripts/maintenance/command-maintenance-workflow.sh check

# Run sync only
bash scripts/maintenance/command-maintenance-workflow.sh sync

# Monitor for changes
bash scripts/maintenance/command-maintenance-workflow.sh monitor
```

### **Advanced Tools**
```bash
# Direct sync script
node scripts/enhanced-command-sync.js

# Direct validation
find docs/commands -name '*.md' | wc -l | awk '{print "Docs:", $1}' && find ~/.claude/commands -name '*.md' 2>/dev/null | wc -l | awk '{print "Claude:", $1}'
```

### **Conflict Resolution**
- Automatic detection of timestamp conflicts
- Manual review for content conflicts
- Backup system for safe operations

---

**Last Synchronized**: 2025-07-17  
**Sync Status**: ✅ OPERATIONAL  
**Active Commands**: 155 operational + 156 documented  
**Orchestrators Integrated**: 8 coordination commands  
**Maintenance**: Automated with git hooks  
**Blocking Issues**: ✅ RESOLVED