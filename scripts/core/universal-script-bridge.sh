#!/bin/bash

# Universal Script Integration Bridge - Context Engineering
# Provides unified interface for command-script integration with P55/P56 compliance

echo "🌉 Universal Script Integration Bridge"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ Error: Must run from Context Engineering root directory"
    exit 1
fi

# Parse command line arguments
SCRIPT_NAME=""
SCRIPT_CATEGORY=""
COMMAND_CONTEXT=""
PARAMETERS=""
P56_ANNOUNCE=true
INTEGRATION_MODE="direct"

while [[ $# -gt 0 ]]; do
    case $1 in
        --script)
            SCRIPT_NAME="$2"
            shift 2
            ;;
        --category)
            SCRIPT_CATEGORY="$2"
            shift 2
            ;;
        --context)
            COMMAND_CONTEXT="$2"
            shift 2
            ;;
        --params)
            PARAMETERS="$2"
            shift 2
            ;;
        --no-announce)
            P56_ANNOUNCE=false
            shift
            ;;
        --mode)
            INTEGRATION_MODE="$2"
            shift 2
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Usage: $0 --script <script_name> [--category <category>] [--context <context>] [--params <params>] [--no-announce] [--mode <mode>]"
            exit 1
            ;;
    esac
done

if [ -z "$SCRIPT_NAME" ]; then
    echo "❌ Error: --script parameter is required"
    echo "Usage: $0 --script <script_name> [options]"
    exit 1
fi

TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S")
echo "📋 Script: $SCRIPT_NAME"
echo "📂 Category: ${SCRIPT_CATEGORY:-auto-detect}"
echo "🎯 Context: ${COMMAND_CONTEXT:-none}"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# P56 Compliance: Visual announcement
if [ "$P56_ANNOUNCE" = true ]; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║               ACTIVE SCRIPT EXECUTION                    ║"
    echo "╠═══════════════════════════════════════════════════════════╣"
    echo "║ Script: $SCRIPT_NAME                                     ║"
    echo "║ Mode: $INTEGRATION_MODE          │  Context: ${COMMAND_CONTEXT:-none}         ║"
    echo "║ Category: ${SCRIPT_CATEGORY:-auto}               │  P55/P56: ✅           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
fi

echo "🔍 PHASE 1: SCRIPT DISCOVERY AND VALIDATION"
echo "==========================================="

# Auto-detect script category if not provided
if [ -z "$SCRIPT_CATEGORY" ]; then
    echo "  🔍 Auto-detecting script category..."
    
    if [ -f "scripts/core/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="core"
        SCRIPT_PATH="scripts/core/$SCRIPT_NAME"
    elif [ -f "scripts/validation/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="validation"
        SCRIPT_PATH="scripts/validation/$SCRIPT_NAME"
    elif [ -f "scripts/compliance/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="compliance"
        SCRIPT_PATH="scripts/compliance/$SCRIPT_NAME"
    elif [ -f "scripts/automation/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="automation"
        SCRIPT_PATH="scripts/automation/$SCRIPT_NAME"
    elif [ -f "scripts/tdd/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="tdd"
        SCRIPT_PATH="scripts/tdd/$SCRIPT_NAME"
    elif [ -f "scripts/formulas/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="formulas"
        SCRIPT_PATH="scripts/formulas/$SCRIPT_NAME"
    elif [ -f "scripts/git-workflow/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="git-workflow"
        SCRIPT_PATH="scripts/git-workflow/$SCRIPT_NAME"
    elif [ -f "scripts/deployment/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="deployment"
        SCRIPT_PATH="scripts/deployment/$SCRIPT_NAME"
    elif [ -f "scripts/maintenance/$SCRIPT_NAME" ]; then
        SCRIPT_CATEGORY="maintenance"
        SCRIPT_PATH="scripts/maintenance/$SCRIPT_NAME"
    else
        echo "    ❌ Script not found in standard categories"
        echo "    🔍 Searching entire scripts directory..."
        FOUND_SCRIPT=$(find scripts -name "$SCRIPT_NAME" -type f | head -1)
        if [ -n "$FOUND_SCRIPT" ]; then
            SCRIPT_PATH="$FOUND_SCRIPT"
            SCRIPT_CATEGORY=$(dirname "$FOUND_SCRIPT" | cut -d'/' -f2)
            echo "    ✅ Found script: $SCRIPT_PATH"
        else
            echo "    ❌ Script '$SCRIPT_NAME' not found anywhere in scripts directory"
            exit 1
        fi
    fi
else
    SCRIPT_PATH="scripts/$SCRIPT_CATEGORY/$SCRIPT_NAME"
fi

echo "    ✅ Script located: $SCRIPT_PATH"
echo "    📂 Category: $SCRIPT_CATEGORY"

# Validate script exists and is executable
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "    ❌ Script file does not exist: $SCRIPT_PATH"
    exit 1
fi

if [ ! -x "$SCRIPT_PATH" ]; then
    echo "    ⚠️  Script not executable, making executable..."
    chmod +x "$SCRIPT_PATH"
    echo "    ✅ Script made executable"
fi

echo ""
echo "🔧 PHASE 2: INTEGRATION CONTEXT SETUP"
echo "====================================="

# Create execution results directory
EXECUTION_DIR="scripts/results/integration"
mkdir -p "$EXECUTION_DIR"

# Set up integration context
INTEGRATION_LOG="$EXECUTION_DIR/integration-$(date +%Y%m%d-%H%M%S).log"
EXECUTION_START=$(date +%s)

echo "  📝 Integration log: $INTEGRATION_LOG"
echo "  🎯 Command context: ${COMMAND_CONTEXT:-none}"
echo "  🔧 Integration mode: $INTEGRATION_MODE"
echo "  📊 Parameters: ${PARAMETERS:-none}"

# Log integration start
cat > "$INTEGRATION_LOG" << EOF
Universal Script Integration Bridge - Execution Log
==================================================
Timestamp: $TIMESTAMP
Script: $SCRIPT_NAME
Path: $SCRIPT_PATH
Category: $SCRIPT_CATEGORY
Command Context: ${COMMAND_CONTEXT:-none}
Parameters: ${PARAMETERS:-none}
Integration Mode: $INTEGRATION_MODE
P56 Announcement: $P56_ANNOUNCE

EOF

echo ""
echo "🚀 PHASE 3: SCRIPT EXECUTION WITH P55 COMPLIANCE"
echo "==============================================="

# P55 Compliance: Real script execution (no simulation)
echo "  🚀 Executing script with P55 compliance (real execution only)..."

if [ -n "$PARAMETERS" ]; then
    echo "  📋 Executing: $SCRIPT_PATH $PARAMETERS"
    echo "Script execution with parameters:" >> "$INTEGRATION_LOG"
    echo "Command: $SCRIPT_PATH $PARAMETERS" >> "$INTEGRATION_LOG"
    echo "Output:" >> "$INTEGRATION_LOG"
    echo "======" >> "$INTEGRATION_LOG"
    
    # Execute script with parameters and capture output
    if "$SCRIPT_PATH" $PARAMETERS 2>&1 | tee -a "$INTEGRATION_LOG"; then
        EXECUTION_SUCCESS=true
        EXECUTION_EXIT_CODE=$?
    else
        EXECUTION_SUCCESS=false
        EXECUTION_EXIT_CODE=$?
    fi
else
    echo "  📋 Executing: $SCRIPT_PATH"
    echo "Script execution without parameters:" >> "$INTEGRATION_LOG"
    echo "Command: $SCRIPT_PATH" >> "$INTEGRATION_LOG"
    echo "Output:" >> "$INTEGRATION_LOG"
    echo "======" >> "$INTEGRATION_LOG"
    
    # Execute script and capture output
    if "$SCRIPT_PATH" 2>&1 | tee -a "$INTEGRATION_LOG"; then
        EXECUTION_SUCCESS=true
        EXECUTION_EXIT_CODE=$?
    else
        EXECUTION_SUCCESS=false
        EXECUTION_EXIT_CODE=$?
    fi
fi

EXECUTION_END=$(date +%s)
EXECUTION_DURATION=$((EXECUTION_END - EXECUTION_START))

echo ""
echo "📊 PHASE 4: EXECUTION RESULTS AND INTEGRATION"
echo "============================================="

# Log execution completion
cat >> "$INTEGRATION_LOG" << EOF

======
Execution Summary:
- Success: $EXECUTION_SUCCESS
- Exit Code: $EXECUTION_EXIT_CODE
- Duration: ${EXECUTION_DURATION}s
- Integration Mode: $INTEGRATION_MODE
- P55 Compliance: ✅ (Real execution completed)
- P56 Compliance: $P56_ANNOUNCE

EOF

echo "  📊 Execution completed:"
echo "    ✅ Success: $EXECUTION_SUCCESS"
echo "    📋 Exit Code: $EXECUTION_EXIT_CODE"
echo "    ⏱️  Duration: ${EXECUTION_DURATION}s"
echo "    🔗 Integration Log: $INTEGRATION_LOG"

# Integration results based on mode
if [ "$INTEGRATION_MODE" = "meta-command" ]; then
    echo ""
    echo "🎯 META-COMMAND INTEGRATION RESULTS"
    echo "=================================="
    
    # Export results for meta-command consumption
    if [ -f "scripts/results/complexity/complexity-$(date +%Y%m%d)*.json" ]; then
        LATEST_COMPLEXITY=$(ls -t scripts/results/complexity/complexity-$(date +%Y%m%d)*.json 2>/dev/null | head -1)
        if [ -n "$LATEST_COMPLEXITY" ]; then
            COMPLEXITY_SCORE=$(jq -r '.complexity_analysis.final_results.complexity_score' "$LATEST_COMPLEXITY" 2>/dev/null)
            echo "    📊 Complexity Score Available: $COMPLEXITY_SCORE"
            export META_COMPLEXITY_SCORE="$COMPLEXITY_SCORE"
        fi
    fi
    
    if [ -f "scripts/results/confidence/confidence-$(date +%Y%m%d)*.json" ]; then
        LATEST_CONFIDENCE=$(ls -t scripts/results/confidence/confidence-$(date +%Y%m%d)*.json 2>/dev/null | head -1)
        if [ -n "$LATEST_CONFIDENCE" ]; then
            CONFIDENCE_SCORE=$(jq -r '.confidence_analysis.final_results.confidence_score' "$LATEST_CONFIDENCE" 2>/dev/null)
            echo "    🎯 Confidence Score Available: $CONFIDENCE_SCORE"
            export META_CONFIDENCE_SCORE="$CONFIDENCE_SCORE"
        fi
    fi
    
    echo "    🔗 Integration Status: Meta-command data ready"
fi

# P56 Compliance: Execution completion announcement
if [ "$P56_ANNOUNCE" = true ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║             SCRIPT EXECUTION COMPLETED                   ║"
    echo "╠═══════════════════════════════════════════════════════════╣"
    echo "║ Script: $SCRIPT_NAME                                     ║"
    echo "║ Status: $([ "$EXECUTION_SUCCESS" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED")          │  Duration: ${EXECUTION_DURATION}s      ║"
    echo "║ Exit Code: $EXECUTION_EXIT_CODE              │  P55/P56: ✅           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
fi

echo ""
echo "🚀 SUCCESS: Universal script integration completed!"
echo "📊 Script: $SCRIPT_NAME (Category: $SCRIPT_CATEGORY)"
echo "📋 Execution: $([ "$EXECUTION_SUCCESS" = true ] && echo "SUCCESS" || echo "FAILED") (Exit: $EXECUTION_EXIT_CODE, Duration: ${EXECUTION_DURATION}s)"
echo "📝 Log: $INTEGRATION_LOG"

# Return script's exit code
exit $EXECUTION_EXIT_CODE