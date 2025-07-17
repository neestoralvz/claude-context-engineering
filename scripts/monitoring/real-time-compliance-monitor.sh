#!/bin/bash

# Real-Time Compliance Monitor - Context Engineering
# Continuous compliance monitoring with ≤5 second response time
# MANDATORY: Real-time violation detection and automated remediation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MONITOR_PID_FILE="/tmp/compliance-monitor.pid"
LOG_FILE="$PROJECT_ROOT/scripts/results/compliance/real-time-monitor.log"
ALERT_LOG="$PROJECT_ROOT/scripts/results/compliance/alerts.log"
METRICS_DIR="$PROJECT_ROOT/scripts/results/compliance/metrics"
DASHBOARD_DIR="$PROJECT_ROOT/projects/context-engineering-dashboard"

# Performance requirements
MAX_DETECTION_TIME=5  # seconds
MONITORING_INTERVAL=2  # seconds
ALERT_THRESHOLD=3     # violations before alert

# Compliance thresholds
TOOL_EXECUTION_THRESHOLD=80
SCRIPT_EXECUTION_THRESHOLD=95
TRANSPARENCY_THRESHOLD=90
REAL_WORK_THRESHOLD=70
PRINCIPLE_COMPLIANCE_THRESHOLD=85

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize monitoring infrastructure
init_monitoring() {
    echo -e "${BLUE}🚀 Initializing Real-Time Compliance Monitor${NC}"
    
    # Create necessary directories
    mkdir -p "$METRICS_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$ALERT_LOG")"
    
    # Initialize log files
    echo "$(date -Iseconds): Real-Time Compliance Monitor initialized" >> "$LOG_FILE"
    
    # Create monitoring database
    init_monitoring_database
    
    # Start monitoring services
    start_monitoring_services
    
    echo -e "${GREEN}✅ Real-Time Compliance Monitor initialized successfully${NC}"
}

# Initialize monitoring database
init_monitoring_database() {
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    
    sqlite3 "$db_file" << 'EOF'
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metric_type TEXT NOT NULL,
    metric_value REAL NOT NULL,
    threshold_value REAL NOT NULL,
    is_compliant BOOLEAN NOT NULL,
    details TEXT,
    violation_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS violation_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    violation_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER
);

CREATE TABLE IF NOT EXISTS remediation_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    violation_id INTEGER REFERENCES violation_alerts(id),
    action_type TEXT NOT NULL,
    action_details TEXT,
    success BOOLEAN DEFAULT FALSE,
    execution_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_compliance_timestamp ON compliance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON violation_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_remediation_timestamp ON remediation_actions(timestamp);
EOF
    
    echo "Database initialized at: $db_file"
}

# Start monitoring services
start_monitoring_services() {
    # Start real-time file watcher
    start_file_watcher &
    
    # Start compliance checker
    start_compliance_checker &
    
    # Start metrics collector
    start_metrics_collector &
    
    # Start alert processor
    start_alert_processor &
    
    # Start dashboard notifier
    start_dashboard_notifier &
    
    echo "All monitoring services started"
}

# Real-time file watcher for immediate violation detection
start_file_watcher() {
    local watch_dirs=(
        "$PROJECT_ROOT/docs/commands"
        "$PROJECT_ROOT/docs/knowledge"
        "$PROJECT_ROOT/scripts"
        "$PROJECT_ROOT/CLAUDE.md"
    )
    
    # Use inotify for real-time file monitoring
    for dir in "${watch_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            inotifywait -m -r -e modify,create,delete,move "$dir" --format '%w%f %e %T' --timefmt '%Y-%m-%d %H:%M:%S' 2>/dev/null | while read file event time; do
                echo "$(date -Iseconds): File event detected - $file ($event)" >> "$LOG_FILE"
                
                # Trigger immediate compliance check
                check_file_compliance "$file" "$event" &
            done &
        fi
    done
}

# Check file compliance immediately after changes
check_file_compliance() {
    local file="$1"
    local event="$2"
    local start_time=$(date +%s%3N)
    
    # Skip if file doesn't exist or is temporary
    [[ -f "$file" ]] || return 0
    [[ "$file" == *.tmp ]] || [[ "$file" == *.swp ]] && return 0
    
    local violations=()
    
    # Check Zero-Root File Policy (Principle #81)
    if [[ "$file" =~ ^$PROJECT_ROOT/[^/]+\.(md|txt|json|yml|yaml|sh|js|py)$ ]] && [[ "$file" != "$PROJECT_ROOT/CLAUDE.md" ]] && [[ "$file" != "$PROJECT_ROOT/README.md" ]]; then
        violations+=("ZERO_ROOT_FILE_VIOLATION:$file")
    fi
    
    # Check P55/P56 compliance in command files
    if [[ "$file" =~ docs/commands/.*\.md$ ]]; then
        local p55_violations=$(grep -c "would execute\|recommend running\|you should.*run\|could run" "$file" 2>/dev/null || echo 0)
        if [[ $p55_violations -gt 0 ]]; then
            violations+=("P55_SIMULATION_VIOLATION:$file:$p55_violations")
        fi
    fi
    
    # Check writing standards compliance
    if [[ "$file" =~ \.md$ ]]; then
        local missing_mandatory=$(grep -c "MANDATORY\|CRITICAL\|REQUIRED" "$file" 2>/dev/null || echo 0)
        if [[ $missing_mandatory -eq 0 ]] && [[ "$file" =~ docs/knowledge/.*\.md$ ]]; then
            violations+=("WRITING_STANDARDS_VIOLATION:$file")
        fi
    fi
    
    # Process violations
    if [[ ${#violations[@]} -gt 0 ]]; then
        local end_time=$(date +%s%3N)
        local detection_time=$((end_time - start_time))
        
        for violation in "${violations[@]}"; do
            process_violation "$violation" "$detection_time"
        done
    fi
}

# Process detected violations
process_violation() {
    local violation="$1"
    local detection_time="$2"
    local violation_type="${violation%%:*}"
    local violation_details="${violation#*:}"
    
    # Log violation
    echo "$(date -Iseconds): VIOLATION DETECTED - $violation_type ($violation_details) - Detection time: ${detection_time}ms" >> "$ALERT_LOG"
    
    # Determine severity
    local severity="HIGH"
    case "$violation_type" in
        "ZERO_ROOT_FILE_VIOLATION") severity="CRITICAL" ;;
        "P55_SIMULATION_VIOLATION") severity="HIGH" ;;
        "WRITING_STANDARDS_VIOLATION") severity="MEDIUM" ;;
    esac
    
    # Store in database
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    sqlite3 "$db_file" << EOF
INSERT INTO violation_alerts (violation_type, severity, message, response_time_ms)
VALUES ('$violation_type', '$severity', '$violation_details', $detection_time);
EOF
    
    # Trigger automated remediation for critical violations
    if [[ "$severity" == "CRITICAL" ]]; then
        trigger_automated_remediation "$violation_type" "$violation_details"
    fi
    
    # Send alert to dashboard
    send_dashboard_alert "$violation_type" "$severity" "$violation_details" "$detection_time"
}

# Automated remediation for critical violations
trigger_automated_remediation() {
    local violation_type="$1"
    local violation_details="$2"
    local start_time=$(date +%s%3N)
    
    case "$violation_type" in
        "ZERO_ROOT_FILE_VIOLATION")
            remediate_zero_root_file_violation "$violation_details"
            ;;
        "P55_SIMULATION_VIOLATION")
            remediate_p55_simulation_violation "$violation_details"
            ;;
    esac
    
    local end_time=$(date +%s%3N)
    local execution_time=$((end_time - start_time))
    
    # Log remediation action
    echo "$(date -Iseconds): REMEDIATION EXECUTED - $violation_type - Execution time: ${execution_time}ms" >> "$ALERT_LOG"
}

# Remediate zero-root file violations
remediate_zero_root_file_violation() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    local file_ext="${file_name##*.}"
    
    # Determine appropriate subdirectory
    local target_dir
    case "$file_ext" in
        "md") target_dir="docs/miscellaneous" ;;
        "sh") target_dir="scripts/miscellaneous" ;;
        "json"|"yml"|"yaml") target_dir="configs" ;;
        "js"|"py") target_dir="utilities" ;;
        *) target_dir="miscellaneous" ;;
    esac
    
    # Create target directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/$target_dir"
    
    # Move file to appropriate location
    local target_path="$PROJECT_ROOT/$target_dir/$file_name"
    if [[ -f "$file_path" ]]; then
        mv "$file_path" "$target_path"
        echo "$(date -Iseconds): REMEDIATION SUCCESS - Moved $file_path to $target_path" >> "$ALERT_LOG"
    fi
}

# Remediate P55 simulation violations
remediate_p55_simulation_violation() {
    local file_path="$1"
    
    # Create backup
    cp "$file_path" "$file_path.backup.$(date +%Y%m%d%H%M%S)"
    
    # Replace simulation language with actual execution
    sed -i '' \
        -e 's/would execute/EXECUTE/g' \
        -e 's/recommend running/RUN/g' \
        -e 's/you should run/EXECUTE/g' \
        -e 's/could run/EXECUTE/g' \
        "$file_path"
    
    echo "$(date -Iseconds): REMEDIATION SUCCESS - Fixed P55 simulation in $file_path" >> "$ALERT_LOG"
}

# Continuous compliance checker
start_compliance_checker() {
    while true; do
        local start_time=$(date +%s%3N)
        
        # Run comprehensive compliance check
        run_compliance_check
        
        local end_time=$(date +%s%3N)
        local check_time=$((end_time - start_time))
        
        # Log performance metrics
        echo "$(date -Iseconds): Compliance check completed in ${check_time}ms" >> "$LOG_FILE"
        
        # Wait for next interval
        sleep $MONITORING_INTERVAL
    done
}

# Run comprehensive compliance check
run_compliance_check() {
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    local timestamp=$(date -Iseconds)
    
    # Check tool execution compliance
    local tool_execution_rate=$(calculate_tool_execution_rate)
    local tool_compliant=$([[ $(echo "$tool_execution_rate >= $TOOL_EXECUTION_THRESHOLD" | bc -l) -eq 1 ]] && echo "1" || echo "0")
    
    # Check script execution compliance
    local script_execution_rate=$(calculate_script_execution_rate)
    local script_compliant=$([[ $(echo "$script_execution_rate >= $SCRIPT_EXECUTION_THRESHOLD" | bc -l) -eq 1 ]] && echo "1" || echo "0")
    
    # Check transparency compliance
    local transparency_rate=$(calculate_transparency_rate)
    local transparency_compliant=$([[ $(echo "$transparency_rate >= $TRANSPARENCY_THRESHOLD" | bc -l) -eq 1 ]] && echo "1" || echo "0")
    
    # Check real work ratio
    local real_work_rate=$(calculate_real_work_rate)
    local real_work_compliant=$([[ $(echo "$real_work_rate >= $REAL_WORK_THRESHOLD" | bc -l) -eq 1 ]] && echo "1" || echo "0")
    
    # Check principle compliance
    local principle_compliance_rate=$(calculate_principle_compliance_rate)
    local principle_compliant=$([[ $(echo "$principle_compliance_rate >= $PRINCIPLE_COMPLIANCE_THRESHOLD" | bc -l) -eq 1 ]] && echo "1" || echo "0")
    
    # Store metrics in database
    sqlite3 "$db_file" << EOF
INSERT INTO compliance_metrics (metric_type, metric_value, threshold_value, is_compliant, details)
VALUES 
    ('tool_execution', $tool_execution_rate, $TOOL_EXECUTION_THRESHOLD, $tool_compliant, 'Tool execution compliance rate'),
    ('script_execution', $script_execution_rate, $SCRIPT_EXECUTION_THRESHOLD, $script_compliant, 'Script execution compliance rate'),
    ('transparency', $transparency_rate, $TRANSPARENCY_THRESHOLD, $transparency_compliant, 'P56 transparency compliance rate'),
    ('real_work', $real_work_rate, $REAL_WORK_THRESHOLD, $real_work_compliant, 'Real work ratio compliance'),
    ('principle_compliance', $principle_compliance_rate, $PRINCIPLE_COMPLIANCE_THRESHOLD, $principle_compliant, 'Principle compliance rate');
EOF
    
    # Generate compliance report
    generate_compliance_report "$tool_execution_rate" "$script_execution_rate" "$transparency_rate" "$real_work_rate" "$principle_compliance_rate"
}

# Calculate tool execution rate
calculate_tool_execution_rate() {
    local recent_logs=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" -exec grep -l "tool call\|BASH TOOL\|READ TOOL\|WRITE TOOL\|EDIT TOOL" {} \; | wc -l)
    local total_operations=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" | wc -l)
    
    if [[ $total_operations -eq 0 ]]; then
        echo "0"
    else
        echo "scale=2; $recent_logs * 100 / $total_operations" | bc -l
    fi
}

# Calculate script execution rate
calculate_script_execution_rate() {
    local script_executions=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" -exec grep -l "executed.*\.sh\|script.*completed" {} \; | wc -l)
    local required_scripts=$(find "$PROJECT_ROOT/docs/commands" -name "*.md" -exec grep -l "MANDATORY.*script\|REQUIRED.*script" {} \; | wc -l)
    
    if [[ $required_scripts -eq 0 ]]; then
        echo "100"
    else
        echo "scale=2; $script_executions * 100 / $required_scripts" | bc -l
    fi
}

# Calculate transparency rate
calculate_transparency_rate() {
    local transparency_indicators=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" -exec grep -l "║\|╔\|╚\|EXECUTING\|ACTIVE TOOL CALL" {} \; | wc -l)
    local total_operations=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" | wc -l)
    
    if [[ $total_operations -eq 0 ]]; then
        echo "0"
    else
        echo "scale=2; $transparency_indicators * 100 / $total_operations" | bc -l
    fi
}

# Calculate real work rate
calculate_real_work_rate() {
    local real_work=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" -exec grep -l "tool call\|file created\|executed\|completed" {} \; | wc -l)
    local simulation_work=$(find "$PROJECT_ROOT/scripts/results" -name "*.log" -newermt "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')" -exec grep -l "would execute\|recommend\|should run" {} \; | wc -l)
    local total_work=$((real_work + simulation_work))
    
    if [[ $total_work -eq 0 ]]; then
        echo "0"
    else
        echo "scale=2; $real_work * 100 / $total_work" | bc -l
    fi
}

# Calculate principle compliance rate
calculate_principle_compliance_rate() {
    local principle_references=$(find "$PROJECT_ROOT/docs" -name "*.md" -exec grep -l "Principle #[0-9]\+\|P[0-9]\+\|#[0-9]\+ " {} \; | wc -l)
    local total_docs=$(find "$PROJECT_ROOT/docs" -name "*.md" | wc -l)
    
    if [[ $total_docs -eq 0 ]]; then
        echo "0"
    else
        echo "scale=2; $principle_references * 100 / $total_docs" | bc -l
    fi
}

# Generate compliance report
generate_compliance_report() {
    local tool_rate="$1"
    local script_rate="$2"
    local transparency_rate="$3"
    local real_work_rate="$4"
    local principle_rate="$5"
    local timestamp=$(date -Iseconds)
    
    local report_file="$METRICS_DIR/compliance_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "compliance_metrics": {
    "tool_execution_rate": $tool_rate,
    "script_execution_rate": $script_rate,
    "transparency_rate": $transparency_rate,
    "real_work_rate": $real_work_rate,
    "principle_compliance_rate": $principle_rate
  },
  "thresholds": {
    "tool_execution": $TOOL_EXECUTION_THRESHOLD,
    "script_execution": $SCRIPT_EXECUTION_THRESHOLD,
    "transparency": $TRANSPARENCY_THRESHOLD,
    "real_work": $REAL_WORK_THRESHOLD,
    "principle_compliance": $PRINCIPLE_COMPLIANCE_THRESHOLD
  },
  "compliance_status": {
    "tool_execution": $(echo "$tool_rate >= $TOOL_EXECUTION_THRESHOLD" | bc -l),
    "script_execution": $(echo "$script_rate >= $SCRIPT_EXECUTION_THRESHOLD" | bc -l),
    "transparency": $(echo "$transparency_rate >= $TRANSPARENCY_THRESHOLD" | bc -l),
    "real_work": $(echo "$real_work_rate >= $REAL_WORK_THRESHOLD" | bc -l),
    "principle_compliance": $(echo "$principle_rate >= $PRINCIPLE_COMPLIANCE_THRESHOLD" | bc -l)
  },
  "overall_compliance": $(echo "($tool_rate + $script_rate + $transparency_rate + $real_work_rate + $principle_rate) / 5" | bc -l)
}
EOF
    
    echo "Compliance report generated: $report_file"
}

# Start metrics collector
start_metrics_collector() {
    while true; do
        collect_system_metrics
        sleep $MONITORING_INTERVAL
    done
}

# Collect system metrics
collect_system_metrics() {
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    local timestamp=$(date -Iseconds)
    
    # Collect system performance metrics
    local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    local memory_usage=$(top -l 1 -n 0 | grep "PhysMem" | awk '{print $2}' | sed 's/M//')
    local disk_usage=$(df -h "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    # Store metrics
    sqlite3 "$db_file" << EOF
INSERT INTO compliance_metrics (metric_type, metric_value, threshold_value, is_compliant, details)
VALUES 
    ('cpu_usage', ${cpu_usage:-0}, 80, $([[ ${cpu_usage:-0} -lt 80 ]] && echo "1" || echo "0"), 'System CPU usage'),
    ('memory_usage', ${memory_usage:-0}, 80, $([[ ${memory_usage:-0} -lt 80 ]] && echo "1" || echo "0"), 'System memory usage'),
    ('disk_usage', ${disk_usage:-0}, 90, $([[ ${disk_usage:-0} -lt 90 ]] && echo "1" || echo "0"), 'Disk space usage');
EOF
}

# Start alert processor
start_alert_processor() {
    while true; do
        process_alerts
        sleep $MONITORING_INTERVAL
    done
}

# Process alerts
process_alerts() {
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    
    # Get unresolved alerts
    local alerts=$(sqlite3 "$db_file" "SELECT id, violation_type, severity, message FROM violation_alerts WHERE resolved = 0 ORDER BY timestamp DESC LIMIT 10")
    
    if [[ -n "$alerts" ]]; then
        echo "$alerts" | while IFS='|' read -r id violation_type severity message; do
            # Send alert notification
            send_alert_notification "$id" "$violation_type" "$severity" "$message"
            
            # Mark as processed
            sqlite3 "$db_file" "UPDATE violation_alerts SET resolved = 1 WHERE id = $id"
        done
    fi
}

# Send alert notification
send_alert_notification() {
    local id="$1"
    local violation_type="$2"
    local severity="$3"
    local message="$4"
    local timestamp=$(date -Iseconds)
    
    # Format alert message
    local alert_msg="[${severity}] ${violation_type}: ${message}"
    
    # Log alert
    echo "$(date -Iseconds): ALERT SENT - ID:$id - $alert_msg" >> "$ALERT_LOG"
    
    # Send to dashboard if available
    if [[ -d "$DASHBOARD_DIR" ]]; then
        send_dashboard_alert "$violation_type" "$severity" "$message" "0"
    fi
    
    # Send system notification (macOS)
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"$alert_msg\" with title \"Compliance Alert\" sound name \"Glass\""
    fi
}

# Start dashboard notifier
start_dashboard_notifier() {
    while true; do
        if [[ -d "$DASHBOARD_DIR" ]]; then
            update_dashboard_metrics
        fi
        sleep $MONITORING_INTERVAL
    done
}

# Update dashboard metrics
update_dashboard_metrics() {
    local db_file="$METRICS_DIR/compliance_monitoring.db"
    local dashboard_data_file="$DASHBOARD_DIR/server/data/compliance_metrics.json"
    
    # Get latest metrics
    local latest_metrics=$(sqlite3 "$db_file" "
        SELECT metric_type, metric_value, threshold_value, is_compliant, timestamp 
        FROM compliance_metrics 
        WHERE timestamp > datetime('now', '-5 minutes') 
        ORDER BY timestamp DESC
    ")
    
    # Generate dashboard data
    local dashboard_json=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "metrics": {
$(echo "$latest_metrics" | while IFS='|' read -r metric_type metric_value threshold_value is_compliant timestamp; do
    echo "    \"$metric_type\": {\"value\": $metric_value, \"threshold\": $threshold_value, \"compliant\": $is_compliant, \"timestamp\": \"$timestamp\"},"
done | sed '$ s/,$//')
  },
  "status": "active",
  "monitoring_interval": $MONITORING_INTERVAL
}
EOF
)
    
    # Write to dashboard data file
    mkdir -p "$(dirname "$dashboard_data_file")"
    echo "$dashboard_json" > "$dashboard_data_file"
}

# Send dashboard alert
send_dashboard_alert() {
    local violation_type="$1"
    local severity="$2"
    local details="$3"
    local response_time="$4"
    local timestamp=$(date -Iseconds)
    
    if [[ -d "$DASHBOARD_DIR" ]]; then
        local alert_file="$DASHBOARD_DIR/server/data/compliance_alerts.json"
        
        # Create alert data
        local alert_json=$(cat << EOF
{
  "timestamp": "$timestamp",
  "violation_type": "$violation_type",
  "severity": "$severity",
  "details": "$details",
  "response_time_ms": $response_time,
  "auto_remediation": $([ "$severity" = "CRITICAL" ] && echo "true" || echo "false")
}
EOF
)
        
        # Append to alerts file
        mkdir -p "$(dirname "$alert_file")"
        echo "$alert_json" >> "$alert_file"
    fi
}

# Stop monitoring
stop_monitoring() {
    echo -e "${YELLOW}🛑 Stopping Real-Time Compliance Monitor${NC}"
    
    # Kill monitoring processes
    if [[ -f "$MONITOR_PID_FILE" ]]; then
        local pid=$(cat "$MONITOR_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill "$pid"
            echo "Monitoring process $pid stopped"
        fi
        rm -f "$MONITOR_PID_FILE"
    fi
    
    # Kill background processes
    pkill -f "real-time-compliance-monitor" 2>/dev/null || true
    pkill -f "inotifywait" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Real-Time Compliance Monitor stopped${NC}"
}

# Get monitoring status
get_status() {
    echo -e "${BLUE}📊 Real-Time Compliance Monitor Status${NC}"
    
    if [[ -f "$MONITOR_PID_FILE" ]]; then
        local pid=$(cat "$MONITOR_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Monitor is running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Monitor is not running (stale PID file)${NC}"
            rm -f "$MONITOR_PID_FILE"
        fi
    else
        echo -e "${RED}❌ Monitor is not running${NC}"
    fi
    
    # Show recent metrics
    if [[ -f "$METRICS_DIR/compliance_monitoring.db" ]]; then
        echo -e "\n${BLUE}📈 Recent Compliance Metrics:${NC}"
        sqlite3 "$METRICS_DIR/compliance_monitoring.db" "
            SELECT metric_type, metric_value, threshold_value, is_compliant, timestamp 
            FROM compliance_metrics 
            WHERE timestamp > datetime('now', '-10 minutes') 
            ORDER BY timestamp DESC LIMIT 10
        " | while IFS='|' read -r metric_type metric_value threshold_value is_compliant timestamp; do
            local status_icon=$([[ "$is_compliant" == "1" ]] && echo "✅" || echo "❌")
            echo "  $status_icon $metric_type: ${metric_value}% (threshold: ${threshold_value}%) - $timestamp"
        done
    fi
}

# Main execution
main() {
    case "${1:-}" in
        "start")
            init_monitoring
            echo $$ > "$MONITOR_PID_FILE"
            
            # Keep monitoring running
            while true; do
                sleep $MONITORING_INTERVAL
            done
            ;;
        "stop")
            stop_monitoring
            ;;
        "status")
            get_status
            ;;
        "restart")
            stop_monitoring
            sleep 2
            "$0" start
            ;;
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            echo ""
            echo "Real-Time Compliance Monitor for Context Engineering"
            echo "- Continuous monitoring with ≤5 second response time"
            echo "- Automated violation detection and remediation"
            echo "- Dashboard integration and alerting"
            exit 1
            ;;
    esac
}

# Ensure we're in the right directory
cd "$PROJECT_ROOT" || exit 1

# Run main function
main "$@"