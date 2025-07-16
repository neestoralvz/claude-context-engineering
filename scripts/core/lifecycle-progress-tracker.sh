#!/bin/bash

# Conversation Lifecycle Progress Tracker
# Real-time milestone monitoring and checkpoint management

# ================================================================
# CONFIGURATION AND INITIALIZATION
# ================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
LIFECYCLE_DIR="$RESULTS_DIR/lifecycle"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
SESSION_STATE_FILE="$LIFECYCLE_DIR/current_session.txt"

# Create directories
mkdir -p "$LIFECYCLE_DIR"
mkdir -p "$LIFECYCLE_DIR/checkpoints"
mkdir -p "$LIFECYCLE_DIR/progress"
mkdir -p "$LIFECYCLE_DIR/handoffs"

# Get current session ID
get_current_session_id() {
    if [[ -f "$SESSION_STATE_FILE" ]]; then
        cat "$SESSION_STATE_FILE"
    else
        echo ""
    fi
}

# Set current session ID
set_current_session_id() {
    echo "$1" > "$SESSION_STATE_FILE"
}

SESSION_ID=$(get_current_session_id)

# ================================================================
# MATHEMATICAL FOUNDATION INTEGRATION
# ================================================================

source "$SCRIPT_DIR/../formulas/context_engineering_formulas.sh" 2>/dev/null || {
    echo "Warning: Mathematical formulas not found - using fallback calculations"
    
    # Fallback mathematical functions
    calculate_session_complexity() {
        local commands_active=${1:-1}
        local scripts_running=${2:-0}
        local agents_deployed=${3:-0}
        echo "scale=4; ($commands_active * 0.1) + ($scripts_running * 0.2) + ($agents_deployed * 0.5)" | bc -l
    }
    
    calculate_progress_score() {
        local completed=${1:-0}
        local total=${2:-1}
        if command -v bc >/dev/null 2>&1; then
            echo "scale=4; $completed / $total" | bc -l
        else
            local result=$(( (completed * 10000) / total ))
            printf "0.%04d" "$result"
        fi
    }
    
    calculate_context_efficiency() {
        local used_context=${1:-1000}
        local total_context=${2:-18000}
        echo "scale=4; 1 - ($used_context / $total_context)" | bc -l
    }
}

# ================================================================
# PROGRESS TRACKING FUNCTIONS
# ================================================================

initialize_session() {
    SESSION_ID="session_$TIMESTAMP"
    set_current_session_id "$SESSION_ID"
    local session_config="$LIFECYCLE_DIR/progress/${SESSION_ID}_config.json"
    
    cat > "$session_config" << EOF
{
  "session_id": "$SESSION_ID",
  "start_time": "$(date -Iseconds)",
  "complexity_level": 3.0,
  "estimated_duration": "15-30 minutes",
  "phases": {
    "initialization": {
      "status": "in_progress",
      "milestones": {
        "context_engineering_activation": false,
        "script_integration_validation": false,
        "mathematical_foundation_loaded": false,
        "progressive_thinking_armed": false
      },
      "progress": 0.0,
      "start_time": "$(date -Iseconds)"
    },
    "discovery": {
      "status": "pending",
      "milestones": {
        "system_health_assessment": false,
        "pattern_recognition_complete": false,
        "crystallization_opportunities": false,
        "knowledge_gaps_identified": false
      },
      "progress": 0.0
    },
    "execution": {
      "status": "pending",
      "milestones": {
        "parallel_execution_initiated": false,
        "tool_call_compliance_verified": false,
        "mathematical_validation_active": false,
        "automation_scripts_engaged": false
      },
      "progress": 0.0
    },
    "validation": {
      "status": "pending",
      "milestones": {
        "verification_loops_complete": false,
        "confidence_thresholds_met": false,
        "system_integrity_verified": false,
        "pattern_crystallization_ready": false
      },
      "progress": 0.0
    },
    "handoff": {
      "status": "pending",
      "milestones": {
        "documentation_updated": false,
        "session_state_preserved": false,
        "continuation_protocol_ready": false,
        "next_session_briefing": false
      },
      "progress": 0.0
    }
  },
  "metrics": {
    "context_usage": 0,
    "commands_executed": 0,
    "scripts_running": 0,
    "agents_deployed": 0,
    "checkpoints_created": 0
  }
}
EOF
    
    echo "Session initialized: $SESSION_ID"
    echo "Configuration saved: $session_config"
}

update_milestone() {
    local phase="$1"
    local milestone="$2"
    local status="$3"  # true/false
    local session_config="$LIFECYCLE_DIR/progress/${SESSION_ID}_config.json"
    
    if [[ ! -f "$session_config" ]]; then
        echo "Error: Session not initialized"
        return 1
    fi
    
    # Update milestone using jq (fallback to manual if not available)
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ".phases.${phase}.milestones.${milestone} = ${status}" "$session_config" > "$temp_file"
        mv "$temp_file" "$session_config"
        
        # Recalculate phase progress
        local completed_count=$(jq ".phases.${phase}.milestones | to_entries | map(select(.value == true)) | length" "$session_config")
        local total_count=$(jq ".phases.${phase}.milestones | length" "$session_config")
        local progress=$(calculate_progress_score "$completed_count" "$total_count")
        
        temp_file=$(mktemp)
        jq ".phases.${phase}.progress = ${progress}" "$session_config" > "$temp_file"
        mv "$temp_file" "$session_config"
        
        # Update phase status
        if (( $(echo "$progress >= 1.0" | bc -l) )); then
            temp_file=$(mktemp)
            jq ".phases.${phase}.status = \"completed\"" "$session_config" > "$temp_file"
            mv "$temp_file" "$session_config"
            jq ".phases.${phase}.end_time = \"$(date -Iseconds)\"" "$session_config" > "$temp_file"
            mv "$temp_file" "$session_config"
        fi
    else
        # Manual update without jq
        echo "Warning: jq not available - milestone update logged only"
        echo "$(date -Iseconds): ${phase}.${milestone} = ${status}" >> "$LIFECYCLE_DIR/progress/${SESSION_ID}_manual.log"
    fi
    
    echo "Milestone updated: ${phase}.${milestone} = ${status}"
    generate_progress_report
}

create_checkpoint() {
    local checkpoint_name="${1:-auto_checkpoint_$(date +%H%M%S)}"
    local session_config="$LIFECYCLE_DIR/progress/${SESSION_ID}_config.json"
    local checkpoint_file="$LIFECYCLE_DIR/checkpoints/${SESSION_ID}_${checkpoint_name}.json"
    
    if [[ ! -f "$session_config" ]]; then
        echo "Error: Session not initialized"
        return 1
    fi
    
    # Create checkpoint snapshot
    cp "$session_config" "$checkpoint_file"
    
    # Add checkpoint metadata
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ". + {\"checkpoint_name\": \"$checkpoint_name\", \"checkpoint_time\": \"$(date -Iseconds)\"}" "$checkpoint_file" > "$temp_file"
        mv "$temp_file" "$checkpoint_file"
        
        # Update checkpoint count in session
        temp_file=$(mktemp)
        jq ".metrics.checkpoints_created += 1" "$session_config" > "$temp_file"
        mv "$temp_file" "$session_config"
    fi
    
    echo "Checkpoint created: $checkpoint_name"
    echo "Checkpoint file: $checkpoint_file"
}

generate_progress_report() {
    local session_config="$LIFECYCLE_DIR/progress/${SESSION_ID}_config.json"
    local report_file="$LIFECYCLE_DIR/progress/${SESSION_ID}_report.md"
    
    if [[ ! -f "$session_config" ]]; then
        echo "Error: Session not initialized"
        return 1
    fi
    
    cat > "$report_file" << EOF
# Conversation Lifecycle Progress Report

**Session ID**: $SESSION_ID  
**Generated**: $(date)  
**Duration**: $(($(date +%s) - $(date -d "$(jq -r '.start_time' "$session_config" 2>/dev/null || echo "$(date -Iseconds)")" +%s 2>/dev/null || echo 0))) seconds

## Phase Progress Overview

EOF
    
    # Generate phase progress (with or without jq)
    if command -v jq >/dev/null 2>&1; then
        for phase in initialization discovery execution validation handoff; do
            local status=$(jq -r ".phases.${phase}.status" "$session_config")
            local progress=$(jq -r ".phases.${phase}.progress" "$session_config")
            local progress_percent=$(echo "scale=1; $progress * 100" | bc -l 2>/dev/null || echo "0.0")
            
            echo "### $phase Phase" >> "$report_file"
            echo "- **Status**: $status" >> "$report_file"
            echo "- **Progress**: ${progress_percent}%" >> "$report_file"
            echo "- **Milestones**:" >> "$report_file"
            
            # List milestones
            jq -r ".phases.${phase}.milestones | to_entries[] | \"  - \\(.key): \\(if .value then \"✅\" else \"⏳\" end)\"" "$session_config" >> "$report_file"
            echo "" >> "$report_file"
        done
    else
        echo "Manual progress tracking active (jq not available)" >> "$report_file"
        if [[ -f "$LIFECYCLE_DIR/progress/${SESSION_ID}_manual.log" ]]; then
            echo "## Manual Progress Log" >> "$report_file"
            echo '```' >> "$report_file"
            cat "$LIFECYCLE_DIR/progress/${SESSION_ID}_manual.log" >> "$report_file"
            echo '```' >> "$report_file"
        fi
    fi
    
    echo "Progress report generated: $report_file"
}

get_session_status() {
    local session_config="$LIFECYCLE_DIR/progress/${SESSION_ID}_config.json"
    
    if [[ ! -f "$session_config" ]]; then
        echo "No active session found"
        return 1
    fi
    
    echo "═══════════════════════════════════════════════════════════"
    echo "           🎯 LIFECYCLE PROGRESS STATUS"
    echo "═══════════════════════════════════════════════════════════"
    echo "Session: $SESSION_ID"
    echo "Started: $(jq -r '.start_time' "$session_config" 2>/dev/null || echo "Unknown")"
    echo "Duration: $(($(date +%s) - $(date -d "$(jq -r '.start_time' "$session_config" 2>/dev/null || echo "$(date -Iseconds)")" +%s 2>/dev/null || echo 0))) seconds"
    echo ""
    
    if command -v jq >/dev/null 2>&1; then
        for phase in initialization discovery execution validation handoff; do
            local status=$(jq -r ".phases.${phase}.status" "$session_config")
            local progress=$(jq -r ".phases.${phase}.progress" "$session_config")
            local progress_percent=$(echo "scale=1; $progress * 100" | bc -l 2>/dev/null || echo "0.0")
            
            case $status in
                "completed") icon="✅" ;;
                "in_progress") icon="🔄" ;;
                *) icon="⏳" ;;
            esac
            
            printf "%-15s %s %6s%% [" "$phase" "$icon" "$progress_percent"
            
            # Progress bar
            local filled=$(echo "scale=0; $progress * 20" | bc -l 2>/dev/null || echo 0)
            for ((i=1; i<=20; i++)); do
                if (( i <= filled )); then
                    printf "█"
                else
                    printf "░"
                fi
            done
            printf "]\n"
        done
    else
        echo "Manual tracking mode (install jq for detailed progress)"
    fi
    
    echo "═══════════════════════════════════════════════════════════"
}

# ================================================================
# COMMAND LINE INTERFACE
# ================================================================

case "${1:-status}" in
    "init"|"initialize")
        initialize_session
        ;;
    "milestone")
        if [[ $# -ge 4 ]]; then
            update_milestone "$2" "$3" "$4"
        else
            echo "Usage: $0 milestone <phase> <milestone_name> <true|false>"
            exit 1
        fi
        ;;
    "checkpoint")
        create_checkpoint "$2"
        ;;
    "report")
        generate_progress_report
        ;;
    "status")
        get_session_status
        ;;
    *)
        echo "Conversation Lifecycle Progress Tracker"
        echo ""
        echo "Usage: $0 <command> [arguments]"
        echo ""
        echo "Commands:"
        echo "  init                           - Initialize new session"
        echo "  milestone <phase> <name> <bool> - Update milestone status"
        echo "  checkpoint [name]              - Create checkpoint"
        echo "  report                         - Generate progress report"
        echo "  status                         - Show current status"
        echo ""
        echo "Phases: initialization, discovery, execution, validation, handoff"
        echo ""
        echo "Examples:"
        echo "  $0 init"
        echo "  $0 milestone initialization context_engineering_activation true"
        echo "  $0 checkpoint phase_1_complete"
        echo "  $0 status"
        ;;
esac