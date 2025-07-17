#!/bin/bash

# Timing Monitoring Integration
# Context Engineering System - Integration with existing performance monitoring
# P55/P56 Compliance: Real-time execution metrics with transparency

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
METRICS_DIR="$PROJECT_ROOT/scripts/results/compliance/metrics"
TIMING_METRICS_DIR="$PROJECT_ROOT/scripts/results/performance"
DASHBOARD_DIR="$PROJECT_ROOT/projects/context-engineering-dashboard"
AGGREGATOR_SCRIPT="$SCRIPT_DIR/timing-metrics-aggregator.py"

# Timing thresholds (milliseconds)
FAST_EXECUTION_THRESHOLD=5000        # 5 seconds
STANDARD_EXECUTION_THRESHOLD=30000   # 30 seconds
COMPLEX_EXECUTION_THRESHOLD=120000   # 2 minutes
SUCCESS_RATE_THRESHOLD=87.7          # 87.7% minimum
P55_COMPLIANCE_THRESHOLD=95.0        # 95% minimum
P56_TRANSPARENCY_THRESHOLD=95.0      # 95% minimum

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize timing monitoring integration
init_timing_monitoring() {
    echo -e "${BLUE}🕐 Initializing Timing Monitoring Integration${NC}"
    
    # Create necessary directories
    mkdir -p "$TIMING_METRICS_DIR"
    mkdir -p "$DASHBOARD_DIR/server/data"
    
    # Initialize execution metrics database
    init_execution_metrics_database
    
    # Start timing monitoring services
    start_timing_monitoring_services
    
    echo -e "${GREEN}✅ Timing Monitoring Integration initialized${NC}"
}

# Initialize execution metrics database
init_execution_metrics_database() {
    local db_file="$TIMING_METRICS_DIR/execution_metrics.db"
    local schema_file="$SCRIPT_DIR/instruction-execution-metrics-schema.sql"
    
    if [[ -f "$schema_file" ]]; then
        sqlite3 "$db_file" < "$schema_file"
        echo "Execution metrics database initialized at: $db_file"
    else
        echo -e "${RED}❌ Schema file not found: $schema_file${NC}"
        return 1
    fi
}

# Start timing monitoring services
start_timing_monitoring_services() {
    # Start timing metrics aggregator in background
    start_timing_aggregator &
    
    # Start timing compliance checker
    start_timing_compliance_checker &
    
    # Start dashboard updater
    start_dashboard_updater &
    
    echo "Timing monitoring services started"
}

# Continuous timing metrics aggregator
start_timing_aggregator() {
    while true; do
        local start_time=$(date +%s%3N)
        
        # Run timing aggregation
        run_timing_aggregation
        
        local end_time=$(date +%s%3N)
        local aggregation_time=$((end_time - start_time))
        
        # Log performance
        echo "$(date -Iseconds): Timing aggregation completed in ${aggregation_time}ms" >> "$TIMING_METRICS_DIR/timing-monitor.log"
        
        # Wait for next interval
        sleep 30  # Run every 30 seconds
    done
}

# Run timing aggregation
run_timing_aggregation() {
    if [[ -x "$AGGREGATOR_SCRIPT" ]]; then
        python3 "$AGGREGATOR_SCRIPT" --update-dashboard 2>/dev/null || {
            echo "$(date -Iseconds): Timing aggregation failed" >> "$TIMING_METRICS_DIR/timing-monitor.log"
        }
    fi
}

# Continuous timing compliance checker
start_timing_compliance_checker() {
    while true; do
        check_timing_compliance
        sleep 60  # Check every minute
    done
}

# Check timing compliance
check_timing_compliance() {
    local db_file="$TIMING_METRICS_DIR/execution_metrics.db"
    
    if [[ ! -f "$db_file" ]]; then
        return 0
    fi
    
    local timestamp=$(date -Iseconds)
    local compliance_db="$METRICS_DIR/compliance_monitoring.db"
    
    # Get recent timing metrics (last hour)
    local recent_metrics=$(sqlite3 "$db_file" "
        SELECT 
            AVG(total_execution_time_ms) as avg_execution_time,
            COUNT(*) as total_instructions,
            SUM(CASE WHEN success THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate,
            AVG(CASE WHEN p55_compliance THEN 1 ELSE 0 END) * 100 as p55_rate,
            AVG(CASE WHEN p56_transparency THEN 1 ELSE 0 END) * 100 as p56_rate,
            SUM(CASE WHEN total_execution_time_ms <= $STANDARD_EXECUTION_THRESHOLD THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as within_threshold_rate
        FROM instruction_execution_metrics 
        WHERE timestamp > datetime('now', '-1 hour')
    ")
    
    if [[ -n "$recent_metrics" ]]; then
        # Parse metrics
        IFS='|' read -r avg_time total_instr success_rate p55_rate p56_rate threshold_rate <<< "$recent_metrics"
        
        # Check compliance and store in compliance database
        check_and_store_timing_compliance "$compliance_db" "$avg_time" "$success_rate" "$p55_rate" "$p56_rate" "$threshold_rate"
        
        # Check for violations
        check_timing_violations "$avg_time" "$success_rate" "$p55_rate" "$p56_rate" "$threshold_rate"
    fi
}

# Check and store timing compliance
check_and_store_timing_compliance() {
    local compliance_db="$1"
    local avg_time="$2"
    local success_rate="$3"
    local p55_rate="$4"
    local p56_rate="$5"
    local threshold_rate="$6"
    
    # Store timing compliance metrics
    sqlite3 "$compliance_db" << EOF
INSERT INTO compliance_metrics (metric_type, metric_value, threshold_value, is_compliant, details)
VALUES 
    ('execution_time_avg', ${avg_time:-0}, $STANDARD_EXECUTION_THRESHOLD, $(echo "${avg_time:-999999} <= $STANDARD_EXECUTION_THRESHOLD" | bc -l), 'Average execution time compliance'),
    ('execution_success_rate', ${success_rate:-0}, $SUCCESS_RATE_THRESHOLD, $(echo "${success_rate:-0} >= $SUCCESS_RATE_THRESHOLD" | bc -l), 'Execution success rate compliance'),
    ('timing_p55_compliance', ${p55_rate:-0}, $P55_COMPLIANCE_THRESHOLD, $(echo "${p55_rate:-0} >= $P55_COMPLIANCE_THRESHOLD" | bc -l), 'P55 compliance in timed executions'),
    ('timing_p56_transparency', ${p56_rate:-0}, $P56_TRANSPARENCY_THRESHOLD, $(echo "${p56_rate:-0} >= $P56_TRANSPARENCY_THRESHOLD" | bc -l), 'P56 transparency in timed executions'),
    ('execution_efficiency', ${threshold_rate:-0}, 80, $(echo "${threshold_rate:-0} >= 80" | bc -l), 'Percentage of executions within time thresholds');
EOF
}

# Check for timing violations
check_timing_violations() {
    local avg_time="$1"
    local success_rate="$2"
    local p55_rate="$3"
    local p56_rate="$4"
    local threshold_rate="$5"
    
    # Check average execution time violation
    if (( $(echo "${avg_time:-0} > $COMPLEX_EXECUTION_THRESHOLD" | bc -l) )); then
        trigger_timing_violation "CRITICAL_EXECUTION_TIME" "Average execution time ${avg_time}ms exceeds critical threshold ${COMPLEX_EXECUTION_THRESHOLD}ms"
    fi
    
    # Check success rate violation
    if (( $(echo "${success_rate:-100} < $SUCCESS_RATE_THRESHOLD" | bc -l) )); then
        trigger_timing_violation "LOW_SUCCESS_RATE" "Execution success rate ${success_rate}% below threshold ${SUCCESS_RATE_THRESHOLD}%"
    fi
    
    # Check P55 compliance violation
    if (( $(echo "${p55_rate:-100} < $P55_COMPLIANCE_THRESHOLD" | bc -l) )); then
        trigger_timing_violation "P55_COMPLIANCE_VIOLATION" "P55 compliance rate ${p55_rate}% below threshold ${P55_COMPLIANCE_THRESHOLD}%"
    fi
    
    # Check P56 transparency violation
    if (( $(echo "${p56_rate:-100} < $P56_TRANSPARENCY_THRESHOLD" | bc -l) )); then
        trigger_timing_violation "P56_TRANSPARENCY_VIOLATION" "P56 transparency rate ${p56_rate}% below threshold ${P56_TRANSPARENCY_THRESHOLD}%"
    fi
    
    # Check execution efficiency violation
    if (( $(echo "${threshold_rate:-100} < 70" | bc -l) )); then
        trigger_timing_violation "LOW_EXECUTION_EFFICIENCY" "Only ${threshold_rate}% of executions within acceptable time thresholds"
    fi
}

# Trigger timing violation
trigger_timing_violation() {
    local violation_type="$1"
    local message="$2"
    local compliance_db="$METRICS_DIR/compliance_monitoring.db"
    local detection_time=$(date +%s%3N)
    local start_time=$detection_time
    
    # Log violation
    echo "$(date -Iseconds): TIMING VIOLATION - $violation_type: $message" >> "$TIMING_METRICS_DIR/timing-violations.log"
    
    # Store in compliance database
    sqlite3 "$compliance_db" << EOF
INSERT INTO violation_alerts (violation_type, severity, message, response_time_ms)
VALUES ('$violation_type', 'HIGH', '$message', $((detection_time - start_time)));
EOF
    
    # Send notification
    send_timing_violation_notification "$violation_type" "$message"
}

# Send timing violation notification
send_timing_violation_notification() {
    local violation_type="$1"
    local message="$2"
    
    # Send to dashboard if available
    if [[ -d "$DASHBOARD_DIR" ]]; then
        local alert_file="$DASHBOARD_DIR/server/data/timing_alerts.json"
        local alert_json=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "violation_type": "$violation_type",
  "severity": "HIGH",
  "message": "$message",
  "source": "timing_monitor"
}
EOF
)
        
        # Append to alerts file
        mkdir -p "$(dirname "$alert_file")"
        echo "$alert_json" >> "$alert_file"
    fi
    
    # System notification (macOS)
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"$message\" with title \"Timing Violation: $violation_type\" sound name \"Glass\""
    fi
}

# Start dashboard updater
start_dashboard_updater() {
    while true; do
        update_dashboard_timing_data
        sleep 10  # Update every 10 seconds
    done
}

# Update dashboard timing data
update_dashboard_timing_data() {
    if [[ -x "$AGGREGATOR_SCRIPT" ]] && [[ -d "$DASHBOARD_DIR" ]]; then
        python3 "$AGGREGATOR_SCRIPT" --update-dashboard 2>/dev/null || {
            echo "$(date -Iseconds): Dashboard update failed" >> "$TIMING_METRICS_DIR/timing-monitor.log"
        }
    fi
}

# Generate timing summary report
generate_timing_report() {
    echo -e "${BLUE}📊 Execution Timing Summary Report${NC}"
    
    if [[ -x "$AGGREGATOR_SCRIPT" ]]; then
        python3 "$AGGREGATOR_SCRIPT" --report
    else
        echo -e "${RED}❌ Aggregator script not available${NC}"
    fi
}

# Stop timing monitoring
stop_timing_monitoring() {
    echo -e "${YELLOW}🛑 Stopping Timing Monitoring Integration${NC}"
    
    # Kill timing monitoring processes
    pkill -f "timing-monitoring-integration" 2>/dev/null || true
    pkill -f "timing-metrics-aggregator" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Timing Monitoring stopped${NC}"
}

# Get timing monitoring status
get_timing_status() {
    echo -e "${BLUE}📊 Timing Monitoring Status${NC}"
    
    # Check database
    local db_file="$TIMING_METRICS_DIR/execution_metrics.db"
    if [[ -f "$db_file" ]]; then
        local instruction_count=$(sqlite3 "$db_file" "SELECT COUNT(*) FROM instruction_execution_metrics WHERE timestamp > datetime('now', '-24 hours')" 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ Database available: ${instruction_count} instructions in last 24h${NC}"
    else
        echo -e "${RED}❌ Database not found${NC}"
    fi
    
    # Check aggregator
    if [[ -x "$AGGREGATOR_SCRIPT" ]]; then
        echo -e "${GREEN}✅ Aggregator script available${NC}"
    else
        echo -e "${RED}❌ Aggregator script not executable${NC}"
    fi
    
    # Check dashboard data
    local dashboard_data="$DASHBOARD_DIR/server/data/execution_timing_metrics.json"
    if [[ -f "$dashboard_data" ]]; then
        local last_update=$(jq -r '.timestamp' "$dashboard_data" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Dashboard data available: $last_update${NC}"
    else
        echo -e "${YELLOW}⚠️  Dashboard data not found${NC}"
    fi
}

# Main execution
main() {
    case "${1:-}" in
        "start")
            init_timing_monitoring
            ;;
        "stop")
            stop_timing_monitoring
            ;;
        "status")
            get_timing_status
            ;;
        "report")
            generate_timing_report
            ;;
        "restart")
            stop_timing_monitoring
            sleep 2
            init_timing_monitoring
            ;;
        *)
            echo "Usage: $0 {start|stop|status|report|restart}"
            echo ""
            echo "Timing Monitoring Integration for Context Engineering"
            echo "- Real-time execution time tracking and compliance monitoring"
            echo "- Dashboard integration with performance analytics"
            echo "- P55/P56 compliance validation"
            exit 1
            ;;
    esac
}

# Ensure we're in the right directory
cd "$PROJECT_ROOT" || exit 1

# Run main function
main "$@"