#!/bin/bash
# 📊 Context Engineering - Real-time Command Synchronization Monitor
# Continuous monitoring with notifications for command synchronization issues

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MONITOR_CONFIG="$PROJECT_ROOT/scripts/config/monitor-config.json"
LOG_DIR="$PROJECT_ROOT/scripts/results/monitoring"
PID_FILE="$PROJECT_ROOT/scripts/results/monitoring/command-monitor.pid"
COMMAND_COUNTER="$PROJECT_ROOT/scripts/validation/automated-command-counter-v2.sh"
REGISTRY_UPDATER="$PROJECT_ROOT/scripts/automation/registry-auto-update.sh"

# Default configuration
DEFAULT_CHECK_INTERVAL=300  # 5 minutes
DEFAULT_NOTIFICATION_COOLDOWN=3600  # 1 hour
DEFAULT_ALERT_THRESHOLD=1  # Alert on any discrepancy

# Logging functions
log() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] [MONITOR]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }

# Help function
show_help() {
    cat << EOF
📊 Context Engineering - Real-time Command Synchronization Monitor

DESCRIPTION:
    Continuous monitoring daemon for command synchronization between docs/
    and .claude/ directories with real-time notifications.

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    start           Start the monitoring daemon
    stop            Stop the monitoring daemon
    status          Show current daemon status
    check           Run single validation check
    config          Show current configuration
    logs            Show recent monitoring logs

OPTIONS:
    --interval N    Check interval in seconds (default: 300)
    --threshold N   Alert threshold for discrepancies (default: 1)
    --cooldown N    Notification cooldown in seconds (default: 3600)
    --daemon        Run as daemon (background process)
    --no-notify     Disable notifications
    --help, -h      Show this help message

EXAMPLES:
    $0 start --daemon              # Start as background daemon
    $0 start --interval 60         # Check every minute
    $0 check                       # Single validation check
    $0 stop                        # Stop monitoring daemon

NOTIFICATIONS:
    - Console output (always enabled)
    - Log files (always enabled)
    - Webhook notifications (if configured)
    - Email notifications (if configured)

CONFIGURATION:
    Configuration file: $MONITOR_CONFIG
    Logs directory: $LOG_DIR

EOF
}

# Create necessary directories
ensure_directories() {
    mkdir -p "$LOG_DIR" "$(dirname "$MONITOR_CONFIG")"
}

# Load configuration
load_config() {
    # Set defaults first
    CHECK_INTERVAL="$DEFAULT_CHECK_INTERVAL"
    NOTIFICATION_COOLDOWN="$DEFAULT_NOTIFICATION_COOLDOWN"
    ALERT_THRESHOLD="$DEFAULT_ALERT_THRESHOLD"
    WEBHOOK_URL=""
    EMAIL_TO=""
    NOTIFICATIONS_ENABLED="true"
    AUTO_RECOVERY="true"
    
    if [ -f "$MONITOR_CONFIG" ]; then
        if command -v jq &> /dev/null; then
            CHECK_INTERVAL=$(jq -r ".check_interval // $DEFAULT_CHECK_INTERVAL" "$MONITOR_CONFIG" 2>/dev/null)
            NOTIFICATION_COOLDOWN=$(jq -r ".notification_cooldown // $DEFAULT_NOTIFICATION_COOLDOWN" "$MONITOR_CONFIG" 2>/dev/null)
            ALERT_THRESHOLD=$(jq -r ".alert_threshold // $DEFAULT_ALERT_THRESHOLD" "$MONITOR_CONFIG" 2>/dev/null)
            WEBHOOK_URL=$(jq -r '.webhook_url // ""' "$MONITOR_CONFIG" 2>/dev/null)
            EMAIL_TO=$(jq -r '.email_to // ""' "$MONITOR_CONFIG" 2>/dev/null)
            NOTIFICATIONS_ENABLED=$(jq -r '.notifications_enabled // true' "$MONITOR_CONFIG" 2>/dev/null)
            AUTO_RECOVERY=$(jq -r '.auto_recovery // true' "$MONITOR_CONFIG" 2>/dev/null)
        else
            log_warning "jq not available, using default configuration"
        fi
    else
        create_default_config
        load_config  # Recursive call after creating config
    fi
}

# Create default configuration
create_default_config() {
    log "Creating default configuration file..."
    
    cat > "$MONITOR_CONFIG" << EOF
{
  "check_interval": $DEFAULT_CHECK_INTERVAL,
  "notification_cooldown": $DEFAULT_NOTIFICATION_COOLDOWN,
  "alert_threshold": $DEFAULT_ALERT_THRESHOLD,
  "notifications_enabled": true,
  "webhook_url": "",
  "email_to": "",
  "auto_recovery": true,
  "log_level": "info",
  "created": "$(date -Iseconds)",
  "comment": "Command synchronization monitoring configuration"
}
EOF
    
    log_success "Default configuration created: $MONITOR_CONFIG"
}

# Show current configuration
show_config() {
    load_config
    
    echo -e "${BOLD}📊 Current Monitor Configuration${NC}"
    echo "=================================="
    echo ""
    echo "Check Interval:         ${CHECK_INTERVAL}s ($(echo "scale=1; $CHECK_INTERVAL/60" | bc 2>/dev/null || echo "$CHECK_INTERVAL/60")m)"
    echo "Alert Threshold:        $ALERT_THRESHOLD discrepancies"
    echo "Notification Cooldown:  ${NOTIFICATION_COOLDOWN}s ($(echo "scale=1; $NOTIFICATION_COOLDOWN/3600" | bc 2>/dev/null || echo "$NOTIFICATION_COOLDOWN/3600")h)"
    echo "Notifications Enabled:  $NOTIFICATIONS_ENABLED"
    echo "Webhook URL:           ${WEBHOOK_URL:-"Not configured"}"
    echo "Email Recipient:       ${EMAIL_TO:-"Not configured"}"
    echo ""
    echo "Configuration file:     $MONITOR_CONFIG"
    echo "Log directory:         $LOG_DIR"
    echo "PID file:              $PID_FILE"
}

# Check if daemon is running
is_daemon_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            # PID file exists but process doesn't - clean up
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1
    fi
}

# Get daemon status
get_daemon_status() {
    if is_daemon_running; then
        local pid=$(cat "$PID_FILE")
        echo -e "${GREEN}✅ Running${NC} (PID: $pid)"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

# Send notification
send_notification() {
    local level="$1"
    local title="$2"
    local message="$3"
    local timestamp=$(date -Iseconds)
    
    # Always log to console
    case "$level" in
        "error")
            log_error "$title: $message"
            ;;
        "warning")
            log_warning "$title: $message"
            ;;
        "info")
            log_info "$title: $message"
            ;;
        *)
            log "$title: $message"
            ;;
    esac
    
    # Skip external notifications if disabled
    if [ "$NOTIFICATIONS_ENABLED" != "true" ]; then
        return 0
    fi
    
    # Check notification cooldown
    local last_notification_file="$LOG_DIR/last-notification-$level.txt"
    if [ -f "$last_notification_file" ]; then
        local last_notification=$(cat "$last_notification_file")
        local current_time=$(date +%s)
        local time_diff=$((current_time - last_notification))
        
        if [ "$time_diff" -lt "$NOTIFICATION_COOLDOWN" ]; then
            log_info "Notification cooldown active, skipping external notification"
            return 0
        fi
    fi
    
    # Send webhook notification
    if [ -n "$WEBHOOK_URL" ] && command -v curl &> /dev/null; then
        local payload=$(cat << EOF
{
  "timestamp": "$timestamp",
  "level": "$level",
  "title": "$title",
  "message": "$message",
  "source": "command-sync-monitor",
  "project": "context-engineering"
}
EOF
)
        
        if curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$WEBHOOK_URL" > /dev/null; then
            log_info "Webhook notification sent successfully"
        else
            log_warning "Failed to send webhook notification"
        fi
    fi
    
    # Send email notification (if configured)
    if [ -n "$EMAIL_TO" ] && command -v mail &> /dev/null; then
        local email_body="$title

$message

Timestamp: $timestamp
Source: Command Synchronization Monitor
Project: Context Engineering

This is an automated notification from the command synchronization monitoring system."
        
        if echo "$email_body" | mail -s "[$level] $title" "$EMAIL_TO"; then
            log_info "Email notification sent to $EMAIL_TO"
        else
            log_warning "Failed to send email notification"
        fi
    fi
    
    # Update cooldown tracker
    echo "$(date +%s)" > "$last_notification_file"
}

# Run single validation check
run_validation_check() {
    local quiet_mode=${1:-false}
    
    if [ "$quiet_mode" = false ]; then
        log "Running command synchronization validation..."
    fi
    
    # Check if command counter script exists
    if [ ! -x "$COMMAND_COUNTER" ]; then
        local error_msg="Command counter script not executable: $COMMAND_COUNTER"
        if [ "$quiet_mode" = false ]; then
            log_error "$error_msg"
        fi
        send_notification "error" "Monitor Configuration Error" "$error_msg"
        return 1
    fi
    
    # Run validation
    local temp_output=$(mktemp)
    if "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
        if [ "$quiet_mode" = false ]; then
            log_success "Command synchronization validation passed"
        fi
        rm -f "$temp_output"
        return 0
    else
        local exit_code=$?
        local error_output=$(cat "$temp_output")
        rm -f "$temp_output"
        
        # Parse the latest report for details
        local latest_report=$(find "$PROJECT_ROOT/scripts/results/command-counts" -name "command-count-report-*.json" -type f 2>/dev/null | sort -r | head -1)
        
        local details=""
        if [ -f "$latest_report" ] && command -v jq &> /dev/null; then
            local total_discrepancies=$(jq -r '.command_count_report.discrepancies.total_found // "unknown"' "$latest_report" 2>/dev/null)
            local docs_total=$(jq -r '.command_count_report.counts.docs_commands.total // "unknown"' "$latest_report" 2>/dev/null)
            local claude_total=$(jq -r '.command_count_report.counts.claude_commands.total // "unknown"' "$latest_report" 2>/dev/null)
            
            details="Discrepancies: $total_discrepancies, docs/commands: $docs_total, .claude/commands: $claude_total"
        fi
        
        local error_msg="Command synchronization validation failed (exit code: $exit_code). $details"
        
        if [ "$quiet_mode" = false ]; then
            log_error "$error_msg"
        fi
        
        # Send notification based on severity
        if [ "$total_discrepancies" != "unknown" ] && [ "$total_discrepancies" != "null" ] && [ "$total_discrepancies" -ge "$ALERT_THRESHOLD" ]; then
            send_notification "error" "Command Synchronization Failed" "$error_msg"
            
            # Attempt automatic recovery if enabled
            attempt_auto_recovery "$total_discrepancies"
        else
            send_notification "warning" "Command Synchronization Warning" "$error_msg"
        fi
        
        return 1
    fi
}

# Attempt automatic recovery
attempt_auto_recovery() {
    local discrepancies="$1"
    
    log "Attempting automatic recovery for $discrepancies discrepancies..."
    
    # Check if auto recovery is enabled
    if [ "$AUTO_RECOVERY" != "true" ]; then
        log_info "Auto recovery disabled, manual intervention required"
        return 1
    fi
    
    # Check if registry updater exists
    if [ ! -x "$REGISTRY_UPDATER" ]; then
        log_error "Registry updater script not executable: $REGISTRY_UPDATER"
        return 1
    fi
    
    # Attempt registry update
    local temp_output=$(mktemp)
    if "$REGISTRY_UPDATER" --force-update > "$temp_output" 2>&1; then
        log_success "Automatic registry update completed"
        send_notification "info" "Auto Recovery Successful" "Registry updated automatically to resolve $discrepancies discrepancies"
        rm -f "$temp_output"
        return 0
    else
        local error_output=$(cat "$temp_output")
        log_error "Automatic recovery failed: $error_output"
        send_notification "error" "Auto Recovery Failed" "Could not automatically resolve discrepancies: $error_output"
        rm -f "$temp_output"
        return 1
    fi
}

# Show recent logs
show_logs() {
    local lines=${1:-50}
    
    echo -e "${BOLD}📊 Recent Monitor Logs${NC}"
    echo "====================="
    echo ""
    
    # Show from daemon log if available
    local daemon_log="$LOG_DIR/command-monitor-daemon.log"
    if [ -f "$daemon_log" ]; then
        echo -e "${CYAN}Daemon Log (last $lines lines):${NC}"
        tail -n "$lines" "$daemon_log"
        echo ""
    fi
    
    # Show validation results
    local results_dir="$PROJECT_ROOT/scripts/results/command-counts"
    if [ -d "$results_dir" ]; then
        echo -e "${CYAN}Recent Validation Reports:${NC}"
        find "$results_dir" -name "command-count-summary-*.md" -type f | sort -r | head -3 | while read -r file; do
            local timestamp=$(basename "$file" | sed 's/command-count-summary-\(.*\)\.md/\1/')
            echo "  📄 $timestamp"
        done
        echo ""
    fi
    
    # Show notification history
    local notification_files=($(find "$LOG_DIR" -name "last-notification-*.txt" -type f 2>/dev/null))
    if [ ${#notification_files[@]} -gt 0 ]; then
        echo -e "${CYAN}Recent Notifications:${NC}"
        for file in "${notification_files[@]}"; do
            local level=$(basename "$file" | sed 's/last-notification-\(.*\)\.txt/\1/')
            local timestamp=$(cat "$file" 2>/dev/null)
            if [ -n "$timestamp" ]; then
                local readable_time=$(date -d "@$timestamp" 2>/dev/null || echo "Invalid timestamp")
                echo "  🔔 $level: $readable_time"
            fi
        done
    fi
}

# Start monitoring daemon
start_daemon() {
    if is_daemon_running; then
        local pid=$(cat "$PID_FILE")
        log_error "Monitor daemon already running (PID: $pid)"
        return 1
    fi
    
    load_config
    
    log "Starting command synchronization monitor daemon..."
    log_info "Check interval: ${CHECK_INTERVAL}s"
    log_info "Alert threshold: $ALERT_THRESHOLD discrepancies"
    log_info "Notification cooldown: ${NOTIFICATION_COOLDOWN}s"
    
    # Create daemon log file
    local daemon_log="$LOG_DIR/command-monitor-daemon.log"
    
    # Start daemon in background
    {
        echo $$ > "$PID_FILE"
        
        while true; do
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running validation check..." >> "$daemon_log"
            
            if run_validation_check true; then
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Validation passed" >> "$daemon_log"
            else
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Validation failed" >> "$daemon_log"
            fi
            
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sleeping for ${CHECK_INTERVAL}s..." >> "$daemon_log"
            sleep "$CHECK_INTERVAL"
        done
    } &
    
    local daemon_pid=$!
    echo "$daemon_pid" > "$PID_FILE"
    
    log_success "Monitor daemon started (PID: $daemon_pid)"
    log_info "Log file: $daemon_log"
    
    # Initial validation check
    run_validation_check
}

# Stop monitoring daemon
stop_daemon() {
    if ! is_daemon_running; then
        log_warning "Monitor daemon is not running"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    log "Stopping monitor daemon (PID: $pid)..."
    
    if kill "$pid" 2>/dev/null; then
        # Wait for process to terminate
        local attempts=0
        while ps -p "$pid" > /dev/null 2>&1 && [ $attempts -lt 10 ]; do
            sleep 1
            ((attempts++))
        done
        
        if ps -p "$pid" > /dev/null 2>&1; then
            log_warning "Process still running, forcing termination..."
            kill -9 "$pid" 2>/dev/null || true
        fi
        
        rm -f "$PID_FILE"
        log_success "Monitor daemon stopped"
    else
        log_error "Failed to stop daemon process"
        rm -f "$PID_FILE"  # Clean up stale PID file
        return 1
    fi
}

# Main execution function
main() {
    local command=""
    local daemon_mode=false
    local no_notify=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            start|stop|status|check|config|logs)
                command="$1"
                shift
                ;;
            --interval)
                DEFAULT_CHECK_INTERVAL="$2"
                shift 2
                ;;
            --threshold)
                DEFAULT_ALERT_THRESHOLD="$2"
                shift 2
                ;;
            --cooldown)
                DEFAULT_NOTIFICATION_COOLDOWN="$2"
                shift 2
                ;;
            --daemon)
                daemon_mode=true
                shift
                ;;
            --no-notify)
                no_notify=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default command
    if [ -z "$command" ]; then
        command="check"
    fi
    
    ensure_directories
    
    # Override notification setting if requested
    if [ "$no_notify" = true ]; then
        NOTIFICATIONS_ENABLED="false"
    fi
    
    # Execute command
    case "$command" in
        start)
            if [ "$daemon_mode" = true ]; then
                start_daemon
            else
                log_info "Starting monitor (use --daemon for background mode)"
                load_config
                while true; do
                    run_validation_check
                    log_info "Sleeping for ${CHECK_INTERVAL}s... (Ctrl+C to stop)"
                    sleep "$CHECK_INTERVAL"
                done
            fi
            ;;
        stop)
            stop_daemon
            ;;
        status)
            echo -e "${BOLD}📊 Monitor Status${NC}"
            echo "================"
            echo ""
            echo -n "Daemon: "
            get_daemon_status
            echo ""
            show_config
            ;;
        check)
            run_validation_check
            ;;
        config)
            show_config
            ;;
        logs)
            show_logs
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Signal handlers for graceful shutdown
trap 'log_info "Received SIGTERM, shutting down..."; exit 0' TERM
trap 'log_info "Received SIGINT, shutting down..."; exit 0' INT

# Run main function
main "$@"