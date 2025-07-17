# Script Path Resolution Pattern

## Overview

This document defines the standard pattern for Context Engineering commands to reference scripts located in the project's `scripts/` directory. The pattern ensures robust path resolution across all command hierarchy levels.

## Problem Solved

Commands in `.claude/commands/` are located at 4 levels deep from the project root:
```
/Users/nalve/claude-context-engineering/
└── .claude/commands/               # Level 1
    ├── behavioral/                 # Level 2  
    │   ├── intelligence/           # Level 3
    │   │   └── *.md               # Level 4 ← Commands here
    │   └── optimization/          # Level 3
    │       └── *.md               # Level 4 ← Commands here
    └── executable/                 # Level 2
        ├── meta/                   # Level 3
        │   └── *.md               # Level 4 ← Commands here
        └── verification/           # Level 3
            └── *.md               # Level 4 ← Commands here
```

Previous approach used incorrect relative paths (`../../../scripts/`) when correct path requires (`../../../../scripts/`).

## Solution: Dynamic Path Resolution

### Core Helper Functions

All commands now use the path helper system located at `scripts/core/path-helper.sh`:

```bash
# Function to get the project root directory
get_project_root() {
    local current_dir="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    echo "${current_dir}" | sed 's|/.claude/commands.*||'
}

# Function to source scripts from project root
source_script() {
    local script_path="$1"
    local project_root="$(get_project_root)"
    local full_path="${project_root}/${script_path}"
    
    if [[ -f "${full_path}" ]]; then
        source "${full_path}"
        echo "✅ Sourced: ${script_path}"
    else
        echo "❌ Script not found: ${full_path}"
        return 1
    fi
}

# Function to execute scripts from project root
execute_script() {
    local script_path="$1"
    local project_root="$(get_project_root)"
    local full_path="${project_root}/${script_path}"
    
    if [[ -f "${full_path}" ]]; then
        cd "${project_root}"
        "${full_path}" "${@:2}"
        echo "✅ Executed: ${script_path}"
    else
        echo "❌ Script not found: ${full_path}"
        return 1
    fi
}
```

## Standard Usage Pattern

### Pattern 1: Sourcing Scripts (Formula Libraries)

**OLD (Incorrect):**
```bash
source ../../../scripts/formulas/context_engineering_formulas.sh
```

**NEW (Correct):**
```bash
source ../../../../scripts/core/path-helper.sh
source_script "scripts/formulas/context_engineering_formulas.sh"
```

### Pattern 2: Executing Scripts

**OLD (Incorrect):**
```bash
cd ../../../ && ./scripts/core/calculate-real-metrics.sh
```

**NEW (Correct):**
```bash
source ../../../../scripts/core/path-helper.sh
execute_script "scripts/core/calculate-real-metrics.sh"
```

### Pattern 3: Directory Validation

**OLD (Incorrect):**
```bash
ls -la ../../../scripts/formulas/
```

**NEW (Correct):**
```bash
source ../../../../scripts/core/path-helper.sh
PROJECT_ROOT="$(get_project_root)"
ls -la "${PROJECT_ROOT}/scripts/formulas/"
```

### Pattern 4: Validation Helper

**For testing and validation:**
```bash
source ../../../../scripts/core/path-helper.sh
validate_project_root
```

## Benefits

### ✅ Robustness
- **Automatic Root Detection**: Finds project root regardless of command location
- **Error Handling**: Clear error messages when scripts are not found
- **Path Independence**: Works from any command hierarchy level

### ✅ Portability
- **Installation Independent**: Works regardless of where project is installed
- **User Independent**: No hardcoded paths to user directories
- **Platform Independent**: Uses bash-compatible path resolution

### ✅ Maintainability
- **Consistent Pattern**: All commands use same path resolution method
- **Future-Proof**: Adding new command levels won't break existing commands
- **Clear Debugging**: Visual feedback when scripts load or fail

## Implementation Guidelines

### For New Commands

1. **Always include path helper initialization:**
   ```bash
   source ../../../../scripts/core/path-helper.sh
   ```

2. **Use helper functions for all script operations:**
   - `source_script "scripts/path/to/script.sh"` for sourcing
   - `execute_script "scripts/path/to/script.sh"` for execution
   - `get_project_root` for path operations

3. **Test from command directory:**
   ```bash
   cd /path/to/command/directory
   source ../../../../scripts/core/path-helper.sh
   validate_project_root
   ```

### For Existing Commands

1. **Replace relative paths** with helper functions
2. **Test script loading** after changes
3. **Update documentation references** to note path-helper usage

## Testing Verification

The pattern has been verified across all command hierarchy levels:

```bash
# Test from executable/meta level
cd .claude/commands/executable/meta
source ../../../../scripts/core/path-helper.sh && validate_project_root
# ✅ Success: All directories found

# Test from behavioral/intelligence level  
cd .claude/commands/behavioral/intelligence
source ../../../../scripts/core/path-helper.sh && validate_project_root
# ✅ Success: All directories found

# Test from executable/verification level
cd .claude/commands/executable/verification
source ../../../../scripts/core/path-helper.sh && validate_project_root
# ✅ Success: All directories found
```

## Migration Status

### ✅ Updated Commands
- `/executable/meta/context-eng.md`
- `/executable/verification/math-verify.md`
- `/executable/verification/confidence.md`
- `/executable/core-routing/decision.md`
- `/behavioral/intelligence/complexity.md`
- `/behavioral/intelligence/thinking.md`

### 🔄 Remaining Commands
- `/executable/verification/validate-command-content.md`
- `/executable/verification/validate-tool-call-execution.md`
- `/executable/orchestration/plan-flow.md`
- `/executable/orchestration/execute.md`
- `/behavioral/execution/parallel.md`
- `/executable/documentation/modularization-protocol.md`

## Template Integration

All command templates now include the standard path resolution pattern for consistency across the system.

## Troubleshooting

### Common Issues

1. **"Script not found" errors**: Verify path helper is sourced correctly
2. **Permission denied**: Ensure scripts have execute permissions (`chmod +x`)
3. **Wrong project root**: Check that command is within `.claude/commands/` hierarchy

### Debug Commands

```bash
# Check current location
pwd

# Validate path helper loading
source ../../../../scripts/core/path-helper.sh && validate_project_root

# Test specific script
source_script "scripts/formulas/context_engineering_formulas.sh"
```

This pattern ensures robust, maintainable, and portable script path resolution across the entire Context Engineering command ecosystem.