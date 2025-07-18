# Claude Code Permissions System

**CRITICAL**: Complete reference for tool permission management, pre-approval/denial mechanisms, and security protocols in Claude Code 2025.

## ⚡ Quick Reference

**ESSENTIAL Commands**:
```bash
/permissions                    # Interactive permission management interface
claude --allow-bash            # Pre-approve bash commands for session
claude --deny-edit             # Pre-deny edit operations for session
claude --mcp-permissions       # Configure MCP tool permissions
```

**CRITICAL Security**: Pre-execution validation + privacy-first architecture + P55/P56 compliance protocols

## 🔐 Permission Management Methods

### **1. Interactive /permissions Command**

The `/permissions` command provides a user-friendly interface for managing tool permissions without manual JSON editing.

**USAGE**:
```bash
/permissions                    # Open interactive permission manager
/permissions bash allow         # Pre-approve bash commands
/permissions edit deny          # Pre-deny edit operations
/permissions mcp configure      # Configure MCP tool permissions
/permissions reset              # Reset to default permissions
/permissions status             # Show current permission configuration
```

**FEATURES**:
- **Visual Interface**: User-friendly permission management without JSON editing
- **Granular Control**: Individual tool permission configuration
- **Session Scope**: Permissions apply to current Claude Code session
- **Persistent Config**: Option to save permissions to settings file

### **2. CLI Flag-Based Permissions**

**Pre-approval Flags**:
```bash
claude --allow-bash             # Auto-approve all bash commands
claude --allow-edit             # Auto-approve all edit operations
claude --allow-mcp              # Auto-approve all MCP tool calls
claude --allow-all              # Auto-approve all tool categories
```

**Pre-denial Flags**:
```bash
claude --deny-bash              # Auto-deny all bash commands
claude --deny-edit              # Auto-deny all edit operations
claude --no-mcp                 # Disable all MCP tools
claude --no-magic               # Disable Magic MCP server
claude --no-seq                 # Disable Sequential MCP server
```

**Combined Usage**:
```bash
claude --allow-edit --deny-bash     # Allow edits, deny bash
claude --mcp --no-magic             # Enable MCP except Magic server
```

### **3. Configuration File Permissions**

**Settings Location**: `~/.claude/settings.json`

**Permission Configuration Structure**:
```json
{
  "permissions": {
    "bash": {
      "default": "ask",           // ask | allow | deny
      "pre_approved": [           // Auto-approve specific commands
        "ls", "cat", "grep", "find"
      ],
      "pre_denied": [             // Auto-deny specific commands
        "rm -rf", "sudo", "chmod 777"
      ]
    },
    "edit": {
      "default": "ask",
      "file_patterns": {
        "allow": ["*.md", "*.txt"], // Auto-approve by file type
        "deny": ["*.exe", "*.bin"]  // Auto-deny by file type
      }
    },
    "mcp": {
      "servers": {
        "context7": "allow",      // always | ask | deny
        "sequential": "ask",
        "magic": "deny"
      },
      "tools": {
        "mcp__ide__executeCode": "ask",
        "mcp__context7__get-library-docs": "allow"
      }
    }
  }
}
```

### **4. Hook-Based Permission Control**

**Claude Hooks Integration**: `~/.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": {
      "commands": [
        {
          "name": "permission_validator",
          "command": "python ~/.claude/scripts/validate_permissions.py",
          "args": ["{{tool_name}}", "{{tool_args}}"]
        }
      ]
    }
  }
}
```

**Custom Permission Script Example**:
```python
#!/usr/bin/env python3
import sys
import json

def validate_permission(tool_name, tool_args):
    """Custom permission validation logic"""
    
    # Example: Block dangerous bash commands
    if tool_name == "bash" and any(danger in tool_args for danger in ["rm -rf", "sudo rm"]):
        return {"allowed": False, "reason": "Dangerous command blocked"}
    
    # Example: Allow specific MCP tools only
    if tool_name.startswith("mcp__") and tool_name not in ALLOWED_MCP_TOOLS:
        return {"allowed": False, "reason": "MCP tool not in allowlist"}
    
    return {"allowed": True}

if __name__ == "__main__":
    tool_name = sys.argv[1]
    tool_args = sys.argv[2] if len(sys.argv) > 2 else ""
    
    result = validate_permission(tool_name, tool_args)
    print(json.dumps(result))
```

## 🛡️ Security Framework Integration

### **P55/P56 Compliance Protocols**

**MANDATORY Requirements**:
- **P55 Protocol**: 100% real tool execution rate (FORBIDDEN simulation)
- **P56 Protocol**: Transparent execution with visual confirmation
- **Pre-execution Validation**: Privacy-first architecture validation

**Permission Enforcement**:
```bash
# P55 Compliance: Real execution only
claude --p55-strict             # Enforce 100% real execution
claude --no-simulation          # Forbid any simulated responses

# P56 Compliance: Transparency requirements  
claude --visual-execution       # Enable visual execution protocol
claude --execution-logging      # Log all tool executions
```

### **Security Best Practices**

**CRITICAL Security Measures**:

1. **Principle of Least Privilege**:
   ```json
   {
     "permissions": {
       "default_policy": "deny",
       "explicit_allows": ["specific_commands_only"]
     }
   }
   ```

2. **Environment Isolation**:
   ```bash
   claude --sandbox-mode           # Run in isolated environment
   claude --read-only             # Allow only read operations
   ```

3. **Audit and Monitoring**:
   ```json
   {
     "audit": {
       "log_all_permissions": true,
       "log_file": "~/.claude/logs/permissions.log",
       "alert_on_denied": true
     }
   }
   ```

## 🔧 MCP Tool Permission Management

### **MCP Server Control**

**Server-Level Permissions**:
```bash
# Enable/disable entire MCP servers
claude --mcp context7,sequential    # Enable specific servers only
claude --no-mcp                     # Disable all MCP servers
claude --mcp-allowlist="context7"   # Allowlist approach
```

**Tool-Level Permissions**:
```json
{
  "mcp_permissions": {
    "mcp__ide__getDiagnostics": "allow",
    "mcp__ide__executeCode": "ask",
    "mcp__context7__resolve-library-id": "allow",
    "mcp__context7__get-library-docs": "allow"
  }
}
```

### **MCP Security Considerations**

**IMPORTANT Limitations**:
- **No Traditional Gates**: MCP uses compliance-based rather than permission-based control
- **Trust Through Transparency**: Security relies on P55/P56 compliance
- **Real-Time Validation**: Continuous monitoring rather than pre-approval

**Risk Mitigation**:
- **Mandatory Transparency**: All MCP tool execution must be visible
- **Performance Monitoring**: ≥99.9% measurable outcome verification
- **Circuit Breaker Patterns**: Prevent cascading failures

## 📋 Common Permission Scenarios

### **Development Environment Setup**

**Permissive Development**:
```bash
claude --allow-edit --allow-bash --mcp
```

**Secure Review Environment**:
```bash
claude --deny-bash --allow-edit="*.md,*.txt" --no-mcp
```

**Read-Only Analysis**:
```bash
claude --deny-edit --deny-bash --mcp="context7"
```

### **CI/CD Pipeline Integration**

**Automated Documentation**:
```json
{
  "permissions": {
    "bash": {"default": "deny", "pre_approved": ["git", "npm test"]},
    "edit": {"default": "allow", "file_patterns": {"allow": ["docs/*.md"]}},
    "mcp": {"servers": {"context7": "allow"}}
  }
}
```

**Deployment Validation**:
```bash
claude --allow-bash="git,npm,docker" --deny-edit --mcp="sequential"
```

## 🔍 Troubleshooting Permission Issues

### **Common Problems and Solutions**

**Problem**: `/permissions` command not found
```bash
# Solution: Update Claude Code to latest version
claude --version                # Check current version
claude update                   # Update to latest
```

**Problem**: Permissions not persisting between sessions
```bash
# Solution: Save to configuration file
/permissions save               # Save current permissions
claude --config-file ~/.claude/my-permissions.json
```

**Problem**: MCP tools being blocked
```bash
# Debug MCP permission issues
claude --debug-mcp              # Enable MCP debugging
claude --mcp-verbose            # Verbose MCP logging
/permissions mcp status         # Check MCP permission status
```

**Problem**: Hook permission scripts failing
```bash
# Debug hook execution
claude --debug-hooks            # Enable hook debugging
claude --hook-timeout=30        # Increase hook timeout
```

### **Permission Debugging Commands**

```bash
/permissions debug              # Show detailed permission state
/permissions trace              # Trace permission decisions
/permissions test bash "ls"     # Test specific command permission
/permissions audit              # Show permission audit log
```

## 📊 Performance and Monitoring

### **Permission System Metrics**

**MANDATORY Performance Standards**:
- **Permission Check Latency**: ≤10ms average response time
- **Hook Execution Time**: ≤100ms maximum for permission hooks
- **Configuration Load Time**: ≤50ms for settings file parsing

**Monitoring Commands**:
```bash
/permissions metrics            # Show permission system performance
/permissions health             # Health check for permission system
claude --permission-benchmark   # Benchmark permission checking speed
```

### **Audit and Compliance Reporting**

**Audit Configuration**:
```json
{
  "audit": {
    "enabled": true,
    "log_file": "~/.claude/logs/permissions.log",
    "retention_days": 30,
    "include_denied": true,
    "include_allowed": false,
    "alert_patterns": ["sudo", "rm -rf", "chmod 777"]
  }
}
```

**Compliance Validation**:
```bash
claude --validate-permissions   # Validate current permission config
claude --permission-report      # Generate compliance report
claude --security-audit         # Full security audit including permissions
```

## 🔗 Integration with Claude Code Ecosystem

### **Memory Management Integration**

The permission system integrates with Claude Code's memory management:

```bash
/memory permissions             # Show permission-related memory usage
/memory clear permissions       # Clear permission cache
```

### **Git Worktree Permissions**

**Per-Worktree Permissions**:
```bash
# Set permissions per worktree
claude worktree permissions feature-branch --allow-edit --deny-bash
claude worktree permissions main --read-only
```

### **GitHub Integration Permissions**

**GitHub Actions Security**:
```json
{
  "github_integration": {
    "permissions": {
      "read_repo": true,
      "write_issues": false,
      "execute_actions": false
    }
  }
}
```

## 📚 Related Documentation

**ESSENTIAL References**:
- **[Security & Privacy Rules](../command-rules/security-privacy-rules.md)** - MANDATORY security framework
- **[Claude Hooks](./claude-hooks.md)** - Hook-based permission automation
- **[Enhanced Command Execution](../technical/enhanced-command-execution.md)** - P55/P56 compliance protocols
- **[Claude Code 2025 Features](./claude-code-2025-features.md)** - Complete feature reference

**STRATEGIC Navigation**:
- **[Knowledge Hub](../README.md)** - Complete unified navigation
- **[Writing Standards](../writing-standards.md)** - MANDATORY terminology compliance
- **[Git Worktrees](./git-worktrees-claude-code.md)** - Parallel development with permissions

---

**CRITICAL**: This permission system enables secure, transparent tool execution while maintaining Claude Code's intelligent automation capabilities. Always prioritize security through compliance rather than restriction.