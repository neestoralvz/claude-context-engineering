# Claude Code Native Commands - Complete Reference

**Meta-Principle**: "Master the full spectrum of Claude Code's native capabilities for optimal development workflow integration"

**Purpose**: CRITICAL comprehensive reference for all Claude Code native commands including CLI interface, built-in slash commands, interactive mode controls, and custom command system. Essential for understanding the complete Claude Code ecosystem and its integration with Context Engineering workflows.

**Coverage**: Complete command reference from CLI flags to interactive shortcuts with practical usage patterns and Context Engineering integration strategies.

---

## 🎯 **Command Architecture Overview**

### **Command Categories**
- **CLI Commands**: Terminal interface with flags and options
- **Built-in Slash Commands**: Native system commands within Claude Code
- **Interactive Mode Commands**: REPL navigation and control shortcuts
- **Custom Command System**: User-defined commands for workflow automation

### **Integration Hierarchy**
```
CLI Commands (Entry Point)
├── Interactive Mode (REPL Environment)
│   ├── Built-in Slash Commands (System Functions)
│   ├── Custom Slash Commands (User-defined)
│   └── Keyboard Shortcuts (Navigation)
└── Headless Mode (Direct Execution)
```

---

## 🖥️ **CLI Commands Reference**

### **Primary CLI Interface**

**Basic Usage Patterns**:
```bash
claude                           # Start interactive REPL
claude "your query here"         # Start REPL with initial prompt
claude -p "query"               # Execute query and exit (headless mode)
claude update                   # Update to latest version
```

### **CLI Flags and Options**

**Core Flags**:
- `--print` / `-p` - Execute query without entering interactive mode
- `--model` - Specify Claude model for session (Opus, Sonnet, etc.)
- `--continue` / `-c` - Load most recent conversation
- `--resume` - Resume specific session by ID
- `--verbose` - Enable detailed logging for debugging
- `--output-format` - Set response format (text, json, stream-json)

**Advanced Usage**:
```bash
# Headless execution with JSON output
claude -p "analyze this code" --output-format json

# Resume previous session with specific model
claude --resume session-id --model opus

# Pipe content for processing
cat file.txt | claude -p "summarize this content"

# Continue with verbose logging
claude --continue --verbose
```

**Permission and Tool Control**:
- `--add-dir` - Add working directories to session
- `--permissions` - Set tool access permissions
- `--tools` - Specify available tools for session

### **Environment Integration**
```bash
# Project-specific configuration
cd /project && claude --add-dir .

# Global configuration with model preference
claude --model sonnet --config global

# Development workflow integration
claude -p "run tests" && claude -p "generate report"
```

---

## ⚡ **Built-in Slash Commands**

### **Session Management**

**`/help`**
- **Purpose**: Display all available slash commands with descriptions
- **Usage**: `/help` or `/help [command]`
- **Output**: Complete command reference with brief descriptions

**`/clear`**
- **Purpose**: Reset conversation history and context
- **Usage**: `/clear`
- **Benefits**: Faster than restarting session, clean context for new tasks

**`/compact`**
- **Purpose**: Summarize conversation preserving key information
- **Usage**: `/compact [focus_area]`
- **Benefits**: Extend conversation length without hitting context limits

### **Project and Configuration**

**`/init`**
- **Purpose**: Create CLAUDE.md file in project root
- **Usage**: `/init`
- **Creates**: Project memory file for Claude with architecture, dependencies, conventions
- **Integration**: Foundation for Context Engineering workflows

**`/model`**
- **Purpose**: Switch Claude model for current session
- **Usage**: `/model [opus|sonnet|haiku]`
- **Options**: Model-specific capabilities and performance characteristics

**`/config`**
- **Purpose**: View and modify Claude Code configuration
- **Usage**: `/config [setting] [value]`
- **Scope**: Session and global configuration management

### **Development Workflow**

**`/review`**
- **Purpose**: Request code review for files, PRs, or code blocks
- **Usage**: `/review [file_path|pr_url]`
- **Features**: Bug detection, style checks, improvement suggestions

**`/status`**
- **Purpose**: Display system status and session information
- **Usage**: `/status`
- **Output**: Model info, token usage, active tools, session state

**`/cost`**
- **Purpose**: Show token usage and associated costs
- **Usage**: `/cost`
- **Tracking**: Real-time usage monitoring for budget management

### **Integration and Setup**

**`/ide`**
- **Purpose**: Connect Claude to IDE for file awareness and linter integration
- **Usage**: `/ide`
- **Features**: Open file detection, linter warnings, IDE context

**`/hooks`**
- **Purpose**: Interactive hook configuration interface
- **Usage**: `/hooks`
- **Features**: Menu-driven hook setup, validation, testing

**`/mcp`**
- **Purpose**: Manage Model Context Protocol server connections
- **Usage**: `/mcp [connect|disconnect|list] [server]`
- **Features**: External tool integration, OAuth authentication

### **Utility Commands**

**`/add-dir`**
- **Purpose**: Add working directories to current session
- **Usage**: `/add-dir [path]`
- **Scope**: Expand Claude's file access permissions

**`/memory`**
- **Purpose**: Edit memory files and project context
- **Usage**: `/memory [edit|view]`
- **Features**: Direct memory management interface

**`/doctor`**
- **Purpose**: Check Claude Code installation health
- **Usage**: `/doctor`
- **Output**: System diagnostics, dependency verification, troubleshooting

### **Account and Authentication**

**`/login`**
- **Purpose**: Switch Anthropic accounts
- **Usage**: `/login [account]`
- **Features**: Multi-account support, session management

**`/logout`**
- **Purpose**: Sign out of current account
- **Usage**: `/logout`
- **Security**: Clean session termination

**`/bug`**
- **Purpose**: Report bugs directly to Anthropic
- **Usage**: `/bug [description]`
- **Features**: Integrated feedback system with context

### **GitHub Integration**

**`/install-github-app`**
- **Purpose**: Install GitHub app for automatic PR reviews
- **Usage**: `/install-github-app`
- **Features**: Automated code review, PR analysis, continuous integration

---

## ⌨️ **Interactive Mode Commands**

### **Keyboard Shortcuts**

**Navigation and Control**:
- `Ctrl+C` - Cancel current input or operation
- `Ctrl+D` - Exit Claude Code session
- `Ctrl+L` - Clear screen (maintain conversation history)
- `Ctrl+R` - Reverse search in command history (if supported)

**Input Management**:
- `Up/Down Arrow` - Navigate command history
- `Shift+Tab` - Switch between modes (Default/Plan/Auto)
- `Alt+M` - Alternative mode switching for Windows

**Multiline Input**:
- `\` + `Enter` - Quick line continuation escape
- `Option+Enter` - macOS multiline input
- `Shift+Enter` - Terminal-specific multiline (configurable)

### **Vim Mode Integration**

**`/vim`**
- **Purpose**: Enable Vim-style editing in Claude Code
- **Features**: Modal editing, Vim keybindings, navigation commands
- **Navigation**: `h/j/k/l` movement, `i/a` insert modes, `Esc` normal mode

### **Mode Management**

**Plan Mode**:
- **Activation**: `Shift+Tab` twice or `Alt+M` (Windows)
- **Purpose**: Research and analysis without execution
- **Tools**: Read-only operations (Read, LS, Glob, Grep, Task, WebSearch)
- **Benefits**: Safe exploration, structured planning, user approval workflow

**Auto Mode**:
- **Purpose**: Enhanced autonomous operation
- **Features**: Intelligent tool selection, workflow automation
- **Control**: Reduced user intervention requirements

---

## 🔧 **Custom Command System**

### **Command Creation**

**Directory Structure**:
```
.claude/commands/           # Project-specific commands
~/.claude/commands/         # Global user commands
```

**Command Definition**:
```markdown
---
description: "Brief command description"
allowed-tools: "Tool1, Tool2"
argument-hint: "Expected argument format"
examples: ["usage example 1", "usage example 2"]
---

Command content with $ARGUMENTS placeholder

!bash command execution
@file.txt reference
```

### **Advanced Features**

**Namespacing**:
```
.claude/commands/dev/review.md    # /dev:review
.claude/commands/test/unit.md     # /test:unit
.claude/commands/deploy/prod.md   # /deploy:prod
```

**Dynamic Content**:
- `$ARGUMENTS` - User-provided arguments
- File references with `@` prefix
- Bash execution with `!` prefix
- Conditional logic and templating

### **Integration Patterns**

**Context Engineering Integration**:
```markdown
---
description: "Context Engineering workflow activator"
allowed-tools: "Task, Read, Write, Bash"
---

Activate Context Engineering system for: $ARGUMENTS

@./docs/knowledge/README.md
@./CLAUDE.md

Execute systematic workflow with P55/P56 compliance.
```

---

## 📊 **Command Categories and Usage Patterns**

### **Development Workflow Commands**

**Code Analysis**:
- `/review` - Code review and feedback
- `/status` - System and project status
- Built-in quality assurance integration

**Project Management**:
- `/init` - Project setup and memory creation
- `/add-dir` - Workspace management
- `/config` - Environment configuration

### **Session Management**:
- `/clear` - Context reset
- `/compact` - Conversation optimization
- `/model` - Performance tuning

### **Integration Commands**:
- `/hooks` - Automation setup
- `/ide` - Development environment connection
- `/mcp` - External tool integration

---

## 🔗 **Context Engineering Integration**

### **Native Commands + Context Engineering**

**Workflow Initiation**:
```bash
# Initialize project with Context Engineering
claude "/init && /context-eng project-setup"

# Review with Context Engineering standards
claude "/review --apply-writing-standards"
```

**Automation Integration**:
- Native `/hooks` + Context Engineering hook templates
- Custom commands calling Context Engineering workflows
- Parallel execution with git worktrees

### **Best Practices**

**Command Selection Strategy**:
1. **Native Commands**: System functions, session management, basic operations
2. **Context Engineering Commands**: Complex workflows, quality assurance, documentation
3. **Custom Commands**: Project-specific automation, team workflows

**Integration Patterns**:
- Use native `/init` to create CLAUDE.md
- Apply Context Engineering patterns in custom commands
- Leverage native `/hooks` for Context Engineering automation
- Combine native `/model` with Context Engineering complexity routing

---

## 📈 **Performance and Usage Optimization**

### **Command Efficiency**

**Fast Operations**:
- `/clear` - Instant context reset
- `/status` - Quick system overview
- `/help` - Immediate command reference

**Resource Management**:
- `/compact` - Memory optimization
- `/cost` - Usage monitoring
- `/model` - Performance tuning

### **Workflow Optimization**

**Session Patterns**:
```bash
# Efficient development session
claude --model sonnet "/init && /ide"

# Quick analysis without persistence
claude -p "/review analysis" --output-format json

# Long-form development with optimization
claude "/compact every 50 messages"
```

### **Integration Metrics**

**Performance Benchmarks**:
- **Command Response Time**: <50ms for native commands
- **Session Startup**: <2s with optimal configuration
- **Context Switch**: <100ms between modes
- **Integration Overhead**: <5% when combining native + Context Engineering

---

## 🔧 **Troubleshooting and Debugging**

### **Common Issues**

**Command Not Found**:
- Verify spelling and availability with `/help`
- Check custom command file location and syntax
- Validate permissions and accessibility

**Performance Issues**:
- Use `/doctor` for system diagnostics
- Monitor usage with `/cost`
- Optimize with `/compact` for long sessions

**Integration Problems**:
- Check `/ide` connection status
- Validate `/hooks` configuration
- Test `/mcp` server connections

### **Debugging Tools**

**Native Debugging**:
- `--verbose` flag for detailed logging
- `/status` for system state inspection
- `/doctor` for health verification

**Advanced Debugging**:
```bash
# Debug with maximum information
claude --verbose --output-format json

# Test specific configurations
claude "/config debug true && /status"
```

---

## 📚 **Cross-Reference Network**

### **Related Documentation**
- **[Claude Code 2025 Features](./claude-code-2025-features.md)** - Latest features and enhancements
- **[Claude Hooks Reference](./claude-hooks.md)** - Automation and workflow customization
- **[CLAUDE.md Import System](./claude-md-imports.md)** - Memory and context management

### **Integration Patterns**
- **Quality Assurance**: Native commands + [Writing Standards](../writing-standards.md)
- **Automation**: Native `/hooks` + [Script Ecosystem](../../../scripts/)
- **Development**: Native `/ide` + [Command System](../../commands/)

---

**Native Commands**: Complete Claude Code native command ecosystem providing foundation for all Claude Code operations and optimal integration with Context Engineering workflows.

**Performance**: Native commands provide <50ms response time for system operations with seamless integration capabilities for advanced workflow automation.

**Navigation**: [Knowledge Hub](../README.md) | [Technical Documentation](../technical/) | [Context Engineering Commands](../../commands/) | [CLAUDE.md Integration](../../../CLAUDE.md)