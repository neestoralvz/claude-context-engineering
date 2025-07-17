#!/bin/bash

# YAML Cleanup Link Monitoring System
# Real-time link validation during YAML cleanup operations
# Ensures 0 broken links maintained throughout cleanup process

set -e

echo "🔗 YAML Cleanup Link Monitoring System"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# System paths
BASE_DIR="/Users/nalve/claude-context-engineering"
SCRIPTS_DIR="$BASE_DIR/scripts"
RESULTS_DIR="$BASE_DIR/scripts/results"
MONITOR_DIR="$RESULTS_DIR/yaml-cleanup-monitoring"

# Create monitoring directory
mkdir -p "$MONITOR_DIR"

# Global monitoring state
monitoring_active=false
total_validations=0
failed_validations=0
emergency_stops=0
timestamp=$(date -Iseconds)

# Configuration
VALIDATION_FREQUENCY="batch"  # batch, file, continuous
EMERGENCY_RESPONSE="auto"     # auto, manual
MONITORING_LEVEL="high"       # low, medium, high

show_header() {
    echo -e "${BOLD}${PURPLE}🔗 YAML CLEANUP LINK MONITORING${NC}"
    echo -e "${BOLD}${PURPLE}===============================${NC}"
    echo -e "Started: ${CYAN}$(date)${NC}"
    echo -e "Mode: ${CYAN}$VALIDATION_FREQUENCY${NC}"
    echo -e "Emergency Response: ${CYAN}$EMERGENCY_RESPONSE${NC}"
    echo -e "Monitoring Level: ${CYAN}$MONITORING_LEVEL${NC}"
    echo ""
}

log_event() {
    local event_type="$1"
    local message="$2"
    local severity="${3:-INFO}"
    local log_file="$MONITOR_DIR/yaml-cleanup-monitoring.log"
    
    local timestamp=$(date -Iseconds)
    echo "[$timestamp] [$severity] [$event_type] $message" >> "$log_file"
    
    case $severity in
        "CRITICAL")
            echo -e "${RED}💀 CRITICAL:${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}❌ ERROR:${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️ WARNING:${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ SUCCESS:${NC} $message"
            ;;
        *)
            echo -e "${BLUE}ℹ️ INFO:${NC} $message"
            ;;
    esac
}

# Emergency stop protocol
emergency_stop() {
    local reason="$1"
    local details="$2"
    
    emergency_stops=$((emergency_stops + 1))
    
    log_event "EMERGENCY_STOP" "YAML cleanup stopped: $reason" "CRITICAL"
    log_event "EMERGENCY_DETAILS" "$details" "CRITICAL"
    
    echo ""
    echo -e "${RED}${BOLD}🚨 EMERGENCY STOP ACTIVATED 🚨${NC}"
    echo -e "${RED}Reason: $reason${NC}"
    echo -e "${RED}Details: $details${NC}"
    echo ""
    echo -e "${YELLOW}REQUIRED ACTIONS:${NC}"
    echo -e "1. ${YELLOW}STOP all YAML cleanup operations immediately${NC}"
    echo -e "2. ${YELLOW}Investigate root cause of link breakage${NC}"
    echo -e "3. ${YELLOW}Fix broken links before resuming${NC}"
    echo -e "4. ${YELLOW}Re-run validation to confirm fix${NC}"
    echo -e "5. ${YELLOW}Resume YAML cleanup only after validation passes${NC}"
    echo ""
    
    # Create emergency stop marker
    echo "$reason: $details" > "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE"
    
    exit 1
}

# Core validation function
run_link_validation() {
    local validation_type="$1"
    local context="$2"
    
    log_event "VALIDATION_START" "Running $validation_type validation for: $context" "INFO"
    
    total_validations=$((total_validations + 1))
    
    # Run navigation validation (quick check)
    if ! "$SCRIPTS_DIR/validation/validate-navigation.sh" > "$MONITOR_DIR/validation-$total_validations.log" 2>&1; then
        failed_validations=$((failed_validations + 1))
        log_event "VALIDATION_FAILED" "Navigation validation failed during $context" "ERROR"
        
        if [ "$EMERGENCY_RESPONSE" = "auto" ]; then
            emergency_stop "Link validation failure detected" "Navigation validation failed during $context - check $MONITOR_DIR/validation-$total_validations.log"
        else
            log_event "MANUAL_INTERVENTION" "Manual intervention required - validation failed but emergency response disabled" "WARNING"
            return 1
        fi
    fi
    
    log_event "VALIDATION_SUCCESS" "Validation passed for: $context" "SUCCESS"
    return 0
}

# Pre-phase validation
validate_pre_phase() {
    local phase_name="$1"
    
    echo -e "${CYAN}🔍 Pre-Phase Validation: $phase_name${NC}"
    
    # Check if emergency stop is active
    if [ -f "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE" ]; then
        log_event "PRE_PHASE_BLOCKED" "Emergency stop active - cannot proceed with $phase_name" "CRITICAL"
        echo -e "${RED}❌ Emergency stop active - resolve issues before proceeding${NC}"
        exit 1
    fi
    
    run_link_validation "pre-phase" "$phase_name"
    
    # Create phase marker
    echo "$phase_name started at $(date -Iseconds)" > "$MONITOR_DIR/current_phase"
    
    log_event "PHASE_START" "Phase $phase_name authorized to proceed" "SUCCESS"
    echo -e "${GREEN}✅ Pre-phase validation passed - $phase_name authorized${NC}"
}

# Post-phase validation  
validate_post_phase() {
    local phase_name="$1"
    local files_modified="$2"
    
    echo -e "${CYAN}🔍 Post-Phase Validation: $phase_name${NC}"
    
    run_link_validation "post-phase" "$phase_name ($files_modified files modified)"
    
    # Clear phase marker
    rm -f "$MONITOR_DIR/current_phase"
    
    log_event "PHASE_COMPLETE" "Phase $phase_name completed successfully" "SUCCESS"
    echo -e "${GREEN}✅ Post-phase validation passed - $phase_name completed${NC}"
}

# Batch validation (every 10-15 files)
validate_batch() {
    local batch_number="$1"
    local files_in_batch="$2"
    
    echo -e "${CYAN}🔍 Batch Validation: Batch $batch_number${NC}"
    
    run_link_validation "batch" "Batch $batch_number ($files_in_batch files)"
    
    log_event "BATCH_COMPLETE" "Batch $batch_number validated successfully" "SUCCESS"
    echo -e "${GREEN}✅ Batch validation passed - Batch $batch_number${NC}"
}

# High-risk file validation
validate_high_risk_file() {
    local file_path="$1"
    local modification_type="$2"
    
    echo -e "${CYAN}🔍 High-Risk File Validation: $(basename "$file_path")${NC}"
    
    # Special validation for high-risk files
    local file_basename=$(basename "$file_path")
    
    case $file_basename in
        "principle-cross-reference-network.md")
            log_event "HIGH_RISK_FILE" "Validating principle cross-reference network after $modification_type" "WARNING"
            ;;
        "CLAUDE.md")
            log_event "HIGH_RISK_FILE" "Validating main navigation file after $modification_type" "WARNING"
            ;;
        *".md")
            if [[ "$file_path" == *"/principles/"* ]]; then
                log_event "HIGH_RISK_FILE" "Validating principle file after $modification_type" "WARNING"
            fi
            ;;
    esac
    
    run_link_validation "high-risk-file" "$file_basename ($modification_type)"
    
    echo -e "${GREEN}✅ High-risk file validation passed - $file_basename${NC}"
}

# Final comprehensive validation
validate_final_comprehensive() {
    echo -e "${CYAN}🔍 Final Comprehensive Validation${NC}"
    
    # Run full system integrity check
    if ! "$SCRIPTS_DIR/validation/validate-system-integrity.sh" > "$MONITOR_DIR/final-comprehensive-validation.log" 2>&1; then
        failed_validations=$((failed_validations + 1))
        log_event "FINAL_VALIDATION_FAILED" "Final comprehensive validation failed" "CRITICAL"
        emergency_stop "Final validation failure" "Comprehensive system validation failed - check $MONITOR_DIR/final-comprehensive-validation.log"
    fi
    
    # Generate final report
    generate_monitoring_report "FINAL"
    
    log_event "FINAL_VALIDATION_SUCCESS" "Final comprehensive validation completed successfully" "SUCCESS"
    echo -e "${GREEN}✅ Final comprehensive validation passed${NC}"
}

# Clear emergency stop
clear_emergency_stop() {
    if [ -f "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE" ]; then
        local reason=$(cat "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE")
        rm -f "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE"
        log_event "EMERGENCY_CLEARED" "Emergency stop cleared: $reason" "SUCCESS"
        echo -e "${GREEN}✅ Emergency stop cleared${NC}"
    else
        echo -e "${YELLOW}ℹ️ No active emergency stop${NC}"
    fi
}

# Generate monitoring report
generate_monitoring_report() {
    local report_type="${1:-INTERIM}"
    local report_file="$MONITOR_DIR/monitoring-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "yaml_cleanup_monitoring_report": {
    "timestamp": "$(date -Iseconds)",
    "report_type": "$report_type",
    "monitoring_session": {
      "total_validations": $total_validations,
      "failed_validations": $failed_validations,
      "emergency_stops": $emergency_stops,
      "success_rate": $(echo "scale=4; ($total_validations - $failed_validations) / $total_validations * 100" | bc -l 2>/dev/null || echo "100")
    },
    "system_status": {
      "emergency_stop_active": $([ -f "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE" ] && echo "true" || echo "false"),
      "current_phase": "$([ -f "$MONITOR_DIR/current_phase" ] && cat "$MONITOR_DIR/current_phase" || echo "None")",
      "monitoring_active": $monitoring_active
    },
    "validation_summary": {
      "link_integrity": "$([ $failed_validations -eq 0 ] && echo "MAINTAINED" || echo "COMPROMISED")",
      "navigation_functionality": "$([ $failed_validations -eq 0 ] && echo "100%" || echo "DEGRADED")",
      "cross_reference_network": "$([ $failed_validations -eq 0 ] && echo "OPERATIONAL" || echo "IMPAIRED")"
    }
  }
}
EOF
    
    log_event "REPORT_GENERATED" "Monitoring report generated: $report_file" "INFO"
    echo -e "${BLUE}📊 Monitoring report: $report_file${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  pre-phase <phase_name>              - Validate before starting a cleanup phase"
    echo "  post-phase <phase_name> <files>     - Validate after completing a cleanup phase"  
    echo "  batch <batch_number> <files>        - Validate after a batch of file modifications"
    echo "  high-risk <file_path> <mod_type>    - Validate after modifying a high-risk file"
    echo "  final                               - Run final comprehensive validation"
    echo "  clear-emergency                     - Clear active emergency stop"
    echo "  status                              - Show current monitoring status"
    echo "  report                              - Generate monitoring report"
    echo ""
    echo "Examples:"
    echo "  $0 pre-phase 'YAML Elimination Batch 1'"
    echo "  $0 batch 3 15"
    echo "  $0 high-risk docs/knowledge/principles/technical-standards.md 'YAML removal'"
    echo "  $0 final"
}

# Show status
show_status() {
    echo -e "${BOLD}${BLUE}📊 YAML Cleanup Monitoring Status${NC}"
    echo -e "${BOLD}=================================${NC}"
    echo -e "Total Validations: ${CYAN}$total_validations${NC}"
    echo -e "Failed Validations: ${RED}$failed_validations${NC}"
    echo -e "Emergency Stops: ${RED}$emergency_stops${NC}"
    echo -e "Success Rate: ${GREEN}$(echo "scale=2; ($total_validations - $failed_validations) / $total_validations * 100" | bc -l 2>/dev/null || echo "100")%${NC}"
    echo ""
    echo -e "Emergency Stop Active: $([ -f "$MONITOR_DIR/EMERGENCY_STOP_ACTIVE" ] && echo -e "${RED}YES${NC}" || echo -e "${GREEN}NO${NC}")"
    echo -e "Current Phase: ${CYAN}$([ -f "$MONITOR_DIR/current_phase" ] && cat "$MONITOR_DIR/current_phase" || echo "None")${NC}"
    echo ""
}

# Main execution
main() {
    monitoring_active=true
    
    case "${1:-}" in
        "pre-phase")
            show_header
            validate_pre_phase "$2"
            ;;
        "post-phase")
            show_header
            validate_post_phase "$2" "$3"
            ;;
        "batch")
            show_header
            validate_batch "$2" "$3"
            ;;
        "high-risk")
            show_header
            validate_high_risk_file "$2" "$3"
            ;;
        "final")
            show_header
            validate_final_comprehensive
            ;;
        "clear-emergency")
            clear_emergency_stop
            ;;
        "status")
            show_status
            ;;
        "report")
            generate_monitoring_report "INTERIM"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
    
    monitoring_active=false
}

# Execute main function
main "$@"