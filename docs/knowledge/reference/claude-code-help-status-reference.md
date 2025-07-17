# Claude Code `/help` and `/status` Commands - Specialized Reference

**Meta-Principle**: "Master essential system discovery and status verification for optimal Claude Code workflow integration"

**Purpose**: CRITICAL focused reference for Claude Code's two most fundamental commands - `/help` for command discovery and `/status` for system verification. Essential for Context Engineering workflow initiation and troubleshooting.

**Coverage**: Comprehensive usage patterns, integration strategies, troubleshooting guides, and Context Engineering optimization techniques.

---

## 🎯 **Command Overview**

### **Essential System Commands**
- **`/help`**: Complete command ecosystem discovery and usage guidance
- **`/status`**: Comprehensive system state verification and session information

### **Usage Context**
```text
Session Start → /status (verify setup) → /help (discover commands) → Workflow Execution
```

---

## 📋 **`/help` Command - Complete Reference**

### **Core Functionality**

**Basic Usage**:
```bash
/help                    # List all available commands
/help [command]          # Get specific command details (if supported)
```

**Command Discovery Features**:
- **Built-in Commands**: Native Claude Code system commands
- **Project Commands**: Commands from `.claude/commands/` directory
- **User Commands**: Personal commands from `~/.claude/commands/`
- **MCP Commands**: Dynamic commands added by MCP servers during session

### **Output Format and Interpretation**

**Standard Output Structure**:
```yaml
Available commands:
/command-name            Description of functionality
/another-command (user)  User-defined command indicator
/project-cmd (project)   Project-specific command indicator
/mcp-command (server)    MCP server-provided command indicator
```

**Context Indicators**:
- **No indicator**: Built-in Claude Code command
- **(user)**: Personal command from `~/.claude/commands/`
- **(project)**: Project-specific from `.claude/commands/`
- **(server)**: MCP server-provided command

### **Performance Characteristics**

**Response Metrics**:
- **Standard Listing**: <50ms response time
- **Command Count**: Varies by project (10-100+ commands typical)
- **Memory Impact**: Minimal (commands loaded on-demand)

### **Integration with Context Engineering**

**Workflow Initiation Pattern**:
```bash
# Discovery → Activation workflow
/help                           # Discover available commands
/context-eng [objective]        # Activate Context Engineering system
/help                           # Verify expanded command ecosystem (85+ commands)
```

**Command Ecosystem Verification**:
- Use `/help` to verify Context Engineering command loading
- Confirm availability of critical commands (`/context-eng`, `/decision`, `/thinking`)
- Validate project-specific command integration

### **Advanced Usage Patterns**

**Command Discovery Workflow**:
1. **Initial Discovery**: `/help` to understand base capabilities
2. **System Activation**: Load Context Engineering or project commands
3. **Extended Discovery**: `/help` again to see expanded ecosystem
4. **Targeted Usage**: Execute specific commands based on objectives

**Integration Optimization**:
- Combine with `/memory` to verify CLAUDE.md loading
- Use before major workflow transitions
- Essential for new user onboarding and system verification

---

## 📊 **`/status` Command - Complete Reference**

### **Core Functionality**

**Basic Usage**:
```bash
/status                  # Display comprehensive system information
```

**Information Categories Provided**:

### **System Information**

**Model and Performance**:
- **Active Model**: Current Claude model (Opus/Sonnet/Haiku) with capabilities
- **Performance Metrics**: Response time, context usage, token consumption
- **Model Capabilities**: Available tools, context window, specialty features

**Session State**:
- **Conversation Length**: Message count, context usage percentage
- **Active Modes**: Current mode (Default/Plan/Auto), settings status
- **Memory Status**: CLAUDE.md loading status, custom command availability

### **Tool and Integration Status**

**Available Tools**:
- **Core Tools**: File access, code execution, web browsing capabilities
- **MCP Integrations**: Connected servers, authentication status
- **Permission Levels**: Directory access, tool restrictions, security settings

**Environment Information**:
- **Working Directory**: Current path, Git repository status
- **System Environment**: OS version, Claude Code version, configuration
- **Integration Health**: IDE connections, hook configurations, automation status

### **Account and Authentication**

**Account Details**:
- **Current Account**: Active Anthropic account, subscription status
- **Usage Information**: Token consumption, cost tracking, rate limits
- **Authentication**: Login status, API key validity, permission scope

### **Performance Characteristics**

**Response Metrics**:
- **Information Gathering**: <10ms typical response time
- **Comprehensive Status**: Real-time data with minimal system impact
- **Update Frequency**: Live status updates during session

### **Limitations and Considerations**

**Headless Mode Restrictions**:
- **Interactive Features**: Some status information may be limited in non-interactive sessions
- **Real-time Updates**: Reduced functionality in programmatic usage
- **Display Format**: May vary between interactive and headless execution

**Performance Impact**:
- **System Resources**: Minimal CPU/memory usage for status gathering
- **Network Usage**: Minimal for account verification
- **Session Impact**: No conversation context consumption

### **Integration with Context Engineering**

**System Verification Workflow**:
```bash
# Complete system verification pattern
/status                         # Verify base system health
/memory                         # Check CLAUDE.md loading
/help                          # Confirm command availability
/context-eng system-check      # Activate comprehensive verification
```

**Troubleshooting Integration**:
- **Problem Identification**: Use `/status` to identify system issues
- **Configuration Validation**: Verify settings and integrations
- **Performance Monitoring**: Track system performance during operations

### **Advanced Usage Patterns**

**Development Workflow Integration**:
```bash
# Session optimization pattern
claude "/status && /memory && /context-eng ready-check"
```

**Continuous Monitoring**:
- Use `/status` at session start for baseline verification
- Monitor during long sessions for performance tracking
- Essential for troubleshooting integration issues

---

## 🔧 **Troubleshooting Guide**

### **Common `/help` Issues**

**Commands Not Listed**:
- **Verification**: Check command file locations (`.claude/commands/`, `~/.claude/commands/`)
- **Syntax**: Validate command file YAML frontmatter and structure
- **Permissions**: Ensure file read permissions and accessibility
- **MCP**: Verify MCP server connections if expecting server commands

**Performance Issues**:
- **Slow Response**: Check filesystem permissions and command file count
- **Missing Commands**: Verify Context Engineering system loading with `/memory`

### **Common `/status` Issues**

**Limited Information**:
- **Headless Mode**: Switch to interactive mode for complete status information
- **Authentication**: Check account login status with `/login`
- **Permissions**: Verify API key and account permissions

**Outdated Information**:
- **Cache Issues**: Restart session if status appears stale
- **Network Problems**: Check internet connection for account verification

### **Integration Troubleshooting**

**Context Engineering Integration**:
```bash
# Comprehensive troubleshooting workflow
/status                         # Verify system health
/help | grep context           # Check Context Engineering availability
/memory                        # Verify CLAUDE.md loading
/doctor                        # System diagnostics if issues persist
```

**Performance Optimization**:
- Use `/status` to identify performance bottlenecks
- Monitor token usage and model performance
- Optimize session configuration based on status information

---

## 📈 **Best Practices and Optimization**

### **Session Management**

**Startup Routine**:
```bash
# Optimal session initialization
/status                         # Verify system readiness
/help                          # Discover available commands
/context-eng [objective]       # Activate Context Engineering if needed
```

**Performance Monitoring**:
- Regular `/status` checks during long sessions
- Monitor token usage and conversation length
- Use for troubleshooting and optimization decisions

### **Context Engineering Integration**

**Command Discovery Pattern**:
1. **Base Discovery**: `/help` for native commands
2. **System Activation**: Load Context Engineering ecosystem
3. **Extended Discovery**: `/help` for complete command availability
4. **Workflow Execution**: Use discovered commands strategically

**System Verification Protocol**:
- **Health Check**: `/status` for system verification
- **Memory Check**: `/memory` for CLAUDE.md validation
- **Command Check**: `/help` for ecosystem confirmation
- **Integration Check**: Context Engineering specific verification

### **Automation Integration**

**Hook Integration**:
```bash
# Example hook using help/status for verification
UserPromptSubmit: "/status && echo 'System ready'"
```

**Script Integration**:
- Use `/status` output for conditional script execution
- Parse `/help` output for dynamic command discovery
- Integrate with monitoring and logging systems

---

## 🔗 **Cross-Reference Network**

### **Related Documentation**
- **[Claude Code Native Commands](./claude-code-native-commands.md)** - Complete command ecosystem reference
- **[CLAUDE.md Import System](./claude-md-imports.md)** - Memory and context management
- **[Context Engineering Commands](../commands/)** - Advanced workflow automation

### **Integration Patterns**
- **System Health**: `/status` + [System Health Monitor](../commands/executable/maintenance/system-health.md)
- **Command Discovery**: `/help` + [Command Relationships](../commands/executable/mapping/command-relationships.md)
- **Workflow Automation**: Both commands + [Orchestration Hub](../commands/cores/orchestration-hub.md)

### **Knowledge Base Navigation**
- **[Knowledge Hub](../README.md)** - Complete unified navigation
- **[Technical Documentation](../technical/)** - Advanced system information
- **[Writing Standards](../writing-standards.md)** - Documentation quality standards

---

**Essential Commands**: `/help` and `/status` provide the foundation for all Claude Code operations, offering complete command discovery and comprehensive system verification capabilities.

**Performance**: Combined <60ms response time for complete system discovery and verification with seamless Context Engineering integration.

**Navigation**: [Knowledge Hub](../README.md) | [Native Commands](./claude-code-native-commands.md) | [Context Engineering](../commands/) | [CLAUDE.md](../CLAUDE.md)