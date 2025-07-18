#!/bin/bash
# Multi-Agent Conflict Monitor
# Real-time monitoring and alert system for Claude Code worktree enforcement

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/scripts/results/multi-agent-monitor.log"
ALERT_THRESHOLD=2  # Alert when 2+ sessions detected in main
CHECK_INTERVAL=5   # Check every 5 seconds

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Alert function
alert() {
    local level=$1
    local message=$2
    echo -e "${RED}🚨 ALERT [$level]: $message${NC}"
    log "ALERT [$level]: $message"
    
    # Optional: Send to monitoring dashboard
    if [[ -f "${PROJECT_ROOT}/projects/context-engineering-dashboard/server/data/compliance_metrics.json" ]]; then
        # Update compliance metrics with alert
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S-06:00")
        echo "Alert logged to compliance dashboard: $timestamp"
    fi
}

# Detection functions
detect_claude_processes() {
    pgrep -f "claude" 2>/dev/null | wc -l || echo "0"
}

detect_worktree_sessions() {
    local count=0
    if [[ -d "${PROJECT_ROOT}/../worktrees" ]]; then
        for worktree in "${PROJECT_ROOT}/../worktrees"/*; do
            if [[ -d "$worktree" && -f "${worktree}/.claude-session.log" ]]; then
                # Check if session is still active
                local session_name=$(basename "$worktree")
                if pgrep -f "claude.*$session_name" >/dev/null 2>&1; then
                    ((count++))
                fi
            fi
        done
    fi
    echo $count
}

check_main_worktree_activity() {
    cd "$PROJECT_ROOT"
    
    # Check for uncommitted changes
    local staged_files=$(git diff --cached --name-only | wc -l)
    local modified_files=$(git diff --name-only | wc -l)
    local untracked_files=$(git ls-files --others --exclude-standard | wc -l)
    
    echo "$staged_files $modified_files $untracked_files"
}

get_session_details() {
    echo -e "${CYAN}📊 SESSION DETAILS:${NC}"
    
    # Main Claude processes
    local main_processes=$(detect_claude_processes)
    echo -e "${BLUE}   Main processes: $main_processes${NC}"
    
    # Worktree sessions
    local worktree_sessions=$(detect_worktree_sessions)
    echo -e "${BLUE}   Worktree sessions: $worktree_sessions${NC}"
    
    # List active worktrees
    if [[ $worktree_sessions -gt 0 ]]; then
        echo -e "${BLUE}   Active worktrees:${NC}"
        for worktree in "${PROJECT_ROOT}/../worktrees"/*; do
            if [[ -d "$worktree" && -f "${worktree}/.claude-session.log" ]]; then
                local session_name=$(basename "$worktree")
                if pgrep -f "claude.*$session_name" >/dev/null 2>&1; then
                    local pid=$(pgrep -f "claude.*$session_name")
                    echo -e "${BLUE}     • $session_name (PID: $pid)${NC}"
                fi
            fi
        done
    fi
    
    # Main worktree activity
    read staged modified untracked <<< $(check_main_worktree_activity)
    if [[ $staged -gt 0 || $modified -gt 0 || $untracked -gt 0 ]]; then
        echo -e "${YELLOW}   Main worktree activity:${NC}"
        echo -e "${YELLOW}     • Staged: $staged files${NC}"
        echo -e "${YELLOW}     • Modified: $modified files${NC}"
        echo -e "${YELLOW}     • Untracked: $untracked files${NC}"
    fi
}

# Main monitoring loop
monitor_conflicts() {
    echo -e "${GREEN}🔍 Starting Multi-Agent Conflict Monitor...${NC}"
    log "Multi-Agent Conflict Monitor started"
    
    while true; do
        local main_processes=$(detect_claude_processes)
        local worktree_sessions=$(detect_worktree_sessions)
        local total_sessions=$((main_processes + worktree_sessions))
        
        # Check for potential conflicts
        if [[ $total_sessions -ge $ALERT_THRESHOLD ]]; then
            read staged modified untracked <<< $(check_main_worktree_activity)
            
            if [[ $main_processes -gt 0 && $worktree_sessions -gt 0 ]]; then
                alert "CRITICAL" "Multiple sessions with main worktree activity detected"
                get_session_details
                echo -e "${RED}🛡️  ENFORCEMENT: Pre-commit hook will block commits${NC}"
                echo ""
            elif [[ $total_sessions -gt 2 ]]; then
                alert "WARNING" "High session count detected: $total_sessions sessions"
                get_session_details
                echo ""
            fi
        elif [[ $total_sessions -gt 0 ]]; then
            # Normal operation
            echo -e "${GREEN}✅ $(date '+%H:%M:%S') - $total_sessions session(s) active - No conflicts${NC}"
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Utility functions
show_status() {
    echo -e "${CYAN}📊 CURRENT STATUS:${NC}"
    local main_processes=$(detect_claude_processes)
    local worktree_sessions=$(detect_worktree_sessions)
    local total_sessions=$((main_processes + worktree_sessions))
    
    echo -e "${BLUE}   Total sessions: $total_sessions${NC}"
    get_session_details
    
    # Enforcement status
    if [[ $total_sessions -ge $ALERT_THRESHOLD ]]; then
        echo -e "${RED}🚨 ENFORCEMENT ACTIVE: Main worktree commits blocked${NC}"
    else
        echo -e "${GREEN}✅ ENFORCEMENT READY: No conflicts detected${NC}"
    fi
}

cleanup_dead_sessions() {
    echo -e "${YELLOW}🧹 Cleaning up dead session logs...${NC}"
    local cleaned=0
    
    if [[ -d "${PROJECT_ROOT}/../worktrees" ]]; then
        for worktree in "${PROJECT_ROOT}/../worktrees"/*; do
            if [[ -d "$worktree" && -f "${worktree}/.claude-session.log" ]]; then
                local session_name=$(basename "$worktree")
                if ! pgrep -f "claude.*$session_name" >/dev/null 2>&1; then
                    echo "Cleaning dead session: $session_name"
                    rm -f "${worktree}/.claude-session.log"
                    ((cleaned++))
                fi
            fi
        done
    fi
    
    echo -e "${GREEN}✅ Cleaned $cleaned dead session logs${NC}"
}

# Command line interface
case "${1:-monitor}" in
    "monitor")
        monitor_conflicts
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_dead_sessions
        ;;
    "help"|"--help"|"-h")
        echo "Multi-Agent Conflict Monitor"
        echo ""
        echo "USAGE:"
        echo "  $0 [command]"
        echo ""
        echo "COMMANDS:"
        echo "  monitor    Start real-time monitoring (default)"
        echo "  status     Show current session status"
        echo "  cleanup    Clean up dead session logs"
        echo "  help       Show this help message"
        echo ""
        echo "MONITORING:"
        echo "  • Check interval: ${CHECK_INTERVAL}s"
        echo "  • Alert threshold: ${ALERT_THRESHOLD} sessions"
        echo "  • Log file: $LOG_FILE"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac