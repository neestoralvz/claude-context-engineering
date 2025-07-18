# Claude Code Memory Management - Complete Reference

**Meta-Principle**: "Enable persistent context through intelligent memory architecture"

**Purpose**: MANDATORY comprehensive authority for Claude Code memory management. REQUIRED guide covering the `/memory` command, memory types, import systems, and CRITICAL best practices for maintaining persistent AI context across development sessions.

**Context Engineering Integration**: CRITICAL component of the Context Engineering ecosystem. MANDATORY enablement of persistent behavioral patterns and contextual intelligence across ALL Claude Code sessions.

---

## 🧠 Memory Architecture Overview

Claude Code implements a **MANDATORY hierarchical memory system** that ENABLES persistent context, behavioral patterns, and project-specific knowledge across ALL development sessions.

### **Memory Hierarchy**
```python
User Memory (~/.claude/CLAUDE.md)
├── Global preferences and behaviors
├── Personal development patterns
└── Cross-project standards

Project Memory (./CLAUDE.md)
├── Team-shared project knowledge
├── Project-specific rules and patterns
└── Codebase context and conventions

Import Network (@./path/to/file.md)
├── Modular content organization
├── Specialized knowledge modules
└── Recursive context composition
```

---

## ⚡ The `/memory` Command

### **Core Functionality**
The `/memory` command provides **MANDATORY interactive memory management** for viewing, editing, and organizing Claude's persistent context.

```bash
/memory
```

### **CRITICAL Command Capabilities**
- **View Active Memory**: DISPLAY all currently loaded memory files
- **Edit Memory Files**: OPEN CLAUDE.md files in your system editor
- **Manage Imports**: VIEW and MODIFY import relationships
- **Verify Loading**: CONFIRM which memories are active in current session

### **Interactive Interface**
When you run `/memory`, Claude Code PRESENTS:
1. **COMPLETE list** of loaded memory files with their locations
2. **MANDATORY import chain visualization** showing file relationships
3. **IMMEDIATE edit options** for each memory file
4. **REQUIRED memory verification** to confirm loading status

---

## 📂 Memory Types and Locations

### **1. User Memory** (`~/.claude/CLAUDE.md`)
**Scope**: Global across all projects
**Purpose**: Personal preferences, universal behaviors, development patterns

**Example Content**:
```markdown
# Personal Development Preferences

## Code Style
- Always use TypeScript over JavaScript
- Prefer functional programming patterns
- Use strict linting and formatting

## Behavioral Patterns
- Always run tests before committing
- Document complex algorithms inline
- Use meaningful variable names

## Universal Tools
- Default to pnpm for package management
- Use Vitest for testing
- Prefer ESLint + Prettier for formatting
```

### **2. Project Memory** (`./CLAUDE.md`)
**Scope**: Specific project and team
**Purpose**: Project rules, codebase context, team conventions

**Example Content**:
```markdown
# Project: E-commerce Platform

## Architecture
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- Redis for caching

## Team Conventions
- Feature branch workflow
- Conventional commit messages
- Test coverage minimum 80%

## Codebase Context
- API routes in /app/api/
- Components in /components/
- Database schemas in /prisma/
```

### **3. Import Network** (`@./path/to/file.md`)
**Scope**: Modular memory composition
**Purpose**: Organize complex context into manageable modules

**Example Structure**:
```markdown
# Main CLAUDE.md
@./docs/architecture.md
@./docs/coding-standards.md
@./docs/deployment-guide.md
```

---

## 🚀 Quick Memory Addition

### **Rapid Memory Creation**
Start any message with `#` to add memory content IMMEDIATELY:

```bash
# Use React Query for all API calls
# Always validate props with PropTypes
# Prefer CSS Modules over styled-components
```

Claude will PROMPT you to select which memory file to update.

### **Memory Selection Dialog**
When using `#` syntax, Claude PRESENTS:
1. **User memory** - APPLY to ALL projects
2. **Project memory** - APPLY to current project ONLY
3. **Create new file** - FOR specialized memory modules

---

## 🔄 Memory Import System

### **Import Syntax**
Use `@` symbol to import additional files into CLAUDE.md:

```markdown
# Basic import
@./config/development-rules.md

# Relative paths
@../shared/team-standards.md

# Absolute paths
@/Users/username/global-preferences.md
```

### **Recursive Loading**
- **MAXIMUM depth**: 5 import hops (ENFORCED limit)
- **ABSOLUTE circular protection**: PREVENTS infinite loops
- **MANDATORY hierarchical loading**: Parent files load BEFORE imported files
- **ROBUST error handling**: CONTINUES loading even if some imports fail

### **Import Network Example**
```markdown
# ./CLAUDE.md (Root)
@./docs/knowledge/core-principles.md
@./docs/knowledge/coding-standards.md

# ./docs/knowledge/core-principles.md
@./docs/knowledge/writing-standards.md
@./docs/knowledge/technical-standards.md

# ./docs/knowledge/coding-standards.md
@./templates/code-patterns.md
@./templates/testing-patterns.md
```

---

## 🔍 Memory Loading Process

### **Automatic Loading Sequence**
1. **Session Start**: Claude Code SEARCHES for CLAUDE.md files
2. **Directory Traversal**: SEARCHES from current directory upward
3. **Import Resolution**: RECURSIVELY loads ALL imported files
4. **Memory Activation**: ALL content becomes ACTIVE context
5. **Verification**: `/memory` command CONFIRMS loading status

### **Loading Hierarchy**
```yaml
Current Directory: ./project/feature/
├── ./project/feature/CLAUDE.md        (Most specific)
├── ./project/CLAUDE.md                (Project level)
├── ./CLAUDE.md                        (Repository root)
└── ~/.claude/CLAUDE.md                (User global)
```

### **Memory Priority**
- **SPECIFIC locations** OVERRIDE general ones
- **PROJECT memory** takes PRECEDENCE over user memory
- **LOCAL files** OVERRIDE imported content for conflicts
- **LAST loaded** WINS for duplicate instructions

---

## 💡 Best Practices

### **Memory Organization**
1. **MANDATORY Specificity**: Use PRECISE, actionable instructions
2. **REQUIRED Structure**: Organize with CLEAR markdown headings
3. **CRITICAL Modular Design**: Split complex context into imported modules
4. **ESSENTIAL Regular Review**: Periodically audit and update memory content
5. **MANDATORY Version Control**: Include CLAUDE.md in your git repository

### **Content Guidelines**
```markdown
# ✅ Good Memory Content
## API Development
- Use Zod for input validation
- Always return typed responses
- Include error handling for all endpoints

# ❌ Poor Memory Content
## Development
- Write good code
- Make it work
- Don't break things
```

### **Import Strategy**
- **MANDATORY Foundation First**: Import core principles BEFORE specific rules
- **REQUIRED Logical Grouping**: Group related concepts in SAME files
- **CRITICAL Avoid Deep Nesting**: Keep import chains ≤3 levels deep
- **ESSENTIAL Document Dependencies**: Comment import purposes

---

## 🔧 Advanced Memory Management

### **Memory Verification**
```bash
# Check memory status
/memory

# Verify specific imports are loaded
grep -r "imported concept" ~/.claude/
```

### **Memory Debugging**
```bash
# View raw memory content
cat ./CLAUDE.md
cat ~/.claude/CLAUDE.md

# Check import resolution
# Look for broken import paths or circular references
```

### **Memory Optimization**
- **MANDATORY Remove Outdated Content**: Clean up obsolete instructions
- **REQUIRED Consolidate Duplicates**: Merge similar rules across files
- **CRITICAL Optimize Import Chains**: Reduce unnecessary nesting
- **ESSENTIAL Monitor Performance**: Large memory files can slow loading

---

## 🔄 Integration with Context Engineering

### **Context Engineering Memory Patterns**
```markdown
# CLAUDE.md Integration Example
@./docs/knowledge/writing-standards.md
@./docs/knowledge/core-principles.md
@./.claude/commands/README.md

## Context Engineering Activation
- Use `/context-eng` for system-wide activation
- Apply P55/P56 compliance standards automatically
- Enable Cross-Reference Intelligence behavioral patterns
```

### **Command Integration**
```markdown
# Memory-Enabled Command Usage
## Automatic Behaviors
- Always use /thinking for complexity ≥0.9
- Apply /verify-flow after major implementations
- Execute /systematic-quality-improvement weekly

## Project-Specific Commands
- Use /tdd for all new features
- Apply /optimize-context before major commits
- Run /validate-sys monthly
```

### **Quality Standards Integration**
```markdown
# Writing Standards Memory
@./docs/knowledge/writing-standards.md

## Automatic Quality Behaviors
- Apply MANDATORY terminology in all documentation
- Use Cross-Reference Intelligence for conceptual connections
- Maintain ≥95% precision in technical writing
- Follow mathematical validation protocols
```

---

## 📊 Memory Performance Metrics

### **Loading Performance**
- **MAXIMUM Load Time**: <500ms for standard memory files
- **CRITICAL Large Files**: >1MB WILL impact session startup
- **MEASURED Import Depth**: Each level adds ~50ms processing time
- **WARNING Network Files**: Remote imports significantly slower

### **Memory Efficiency**
- **REQUIRED Optimal File Size**: 50-200KB per CLAUDE.md file
- **MANDATORY Import Limit**: ≤10 imported files per memory hierarchy
- **CRITICAL Content Density**: Focus on actionable, specific instructions
- **ESSENTIAL Regular Cleanup**: Archive or remove unused memory content

### **Context Quality Metrics**
- **MANDATORY Instruction Clarity**: Measurable, specific directives
- **REQUIRED Behavioral Consistency**: Predictable AI responses
- **CRITICAL Context Relevance**: Project-appropriate knowledge activation
- **ESSENTIAL Memory Persistence**: Consistent behavior across sessions

---

## ⚠️ Common Issues and Solutions

### **Memory Not Loading**
```bash
# Check file exists and has content
ls -la ./CLAUDE.md
cat ./CLAUDE.md

# Verify file permissions
chmod 644 ./CLAUDE.md

# Check for syntax errors in imports
grep "@" ./CLAUDE.md
```

### **Import Failures**
```bash
# Check import paths are correct
ls -la ./docs/knowledge/file.md

# Use absolute paths if relative paths fail
@/full/path/to/file.md

# Verify import depth isn't too deep (max 5)
```

### **Conflicting Instructions**
```bash
# Review memory hierarchy
/memory

# Check for contradictory rules
grep -i "always\|never" ./CLAUDE.md ~/.claude/CLAUDE.md

# Prioritize more specific over general instructions
```

### **Performance Issues**
```bash
# Check memory file sizes
du -h ./CLAUDE.md ~/.claude/CLAUDE.md

# Reduce import depth
# Split large files into smaller modules
# Remove unused content
```

---

## 🔗 Related Documentation

### **Context Engineering Integration**
- **[CLAUDE.md Import System](./claude-md-imports.md)** - Advanced import patterns and automation
- **[Writing Standards](../writing-standards.md)** - Quality standards for memory content
- **[Core Principles](../principles/)** - Foundational principles for memory design

### **Technical Implementation**
- **[Enhanced Command Execution](../technical/enhanced-command-execution.md)** - Tool execution with memory context
- **[Cross-Reference Intelligence](../patterns/)** - Behavioral patterns in memory
- **[Quality Assurance](../patterns/quality-optimization-application.md)** - Memory content validation

### **Official Claude Code Documentation**
- **[Claude Code Memory Documentation](https://docs.anthropic.com/en/docs/claude-code/memory)** - Official memory reference
- **[Settings and Configuration](https://docs.anthropic.com/en/docs/claude-code/settings)** - Memory file locations
- **[Common Workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)** - Memory usage patterns

---

## 📋 Quick Reference

### **Essential Commands**
```bash
/memory                    # View and manage memory
# Add quick memory         # Start message with # to add memory
cat ./CLAUDE.md           # View project memory
cat ~/.claude/CLAUDE.md   # View user memory
```

### **Memory File Locations**
```bash
~/.claude/CLAUDE.md       # User global memory
./CLAUDE.md               # Project memory (team shared)
./docs/*/CLAUDE.md        # Modular memory files
```

### **Import Syntax**
```markdown
@./relative/path.md       # Relative import
@../parent/path.md        # Parent directory import
@/absolute/path.md        # Absolute import
```

---

**Navigation**: [Knowledge Hub](../README.md) | **Integration**: [CLAUDE.md Import System](./claude-md-imports.md) | **Quality**: [Writing Standards](../writing-standards.md)

**Memory Authorities**: [Core Principles](../principles/) | [Writing Standards](../writing-standards.md) | [Command System](../commands/README.md)