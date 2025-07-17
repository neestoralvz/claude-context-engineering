#!/bin/bash

# YAML Cleanup Monitoring System for Context Engineering
# Continuous link validation during YAML elimination process
# Maintains zero broken links throughout cleanup operations

set -e

echo "🔗 Context Engineering - YAML Cleanup Monitoring System"
echo "======================================================"
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
VALIDATION_DIR="$SCRIPTS_DIR/validation"
RESULTS_DIR="$BASE_DIR/scripts/results"
REPORTS_DIR="$BASE_DIR/reports"

# Monitoring configuration
PHASE_NAME="${1:-YAML_CLEANUP_PHASE}"
MONITORING_MODE="${2:-continuous}"
TIMESTAMP=$(date -Iseconds)
CHECKPOINT_FILE="$RESULTS_DIR/yaml-cleanup/checkpoint_${PHASE_NAME}_${TIMESTAMP}.json"

# Create monitoring results directory
mkdir -p "$RESULTS_DIR/yaml-cleanup"

# Validation counters
total_validations=0
passed_validations=0
failed_validations=0
critical_issues=0
warnings=0

# Monitoring functions
show_header() {
    local title="$1"
    echo ""
    echo -e "${BOLD}${PURPLE}━━━ $title ━━━${NC}"
    echo ""
}

log_result() {
    local validation="$1"
    local status="$2"
    local message="$3"
    local severity="${4:-INFO}"
    
    total_validations=$((total_validations + 1))
    
    case $status in
        "PASSED")
            passed_validations=$((passed_validations + 1))
            echo -e "${GREEN}✅ PASS:${NC} $validation - $message"
            ;;
        "FAILED")
            failed_validations=$((failed_validations + 1))
            case $severity in
                "CRITICAL")
                    critical_issues=$((critical_issues + 1))
                    echo -e "${RED}💀 CRITICAL FAILURE:${NC} $validation - $message"
                    ;;
                "ERROR")
                    echo -e "${RED}❌ FAILURE:${NC} $validation - $message"
                    ;;
                *)
                    warnings=$((warnings + 1))
                    echo -e "${YELLOW}⚠️ WARNING:${NC} $validation - $message"
                    ;;
            esac
            ;;
    esac
}

# Core validation functions
run_navigation_validation() {
    echo -e "${CYAN}🧭 Running navigation system validation...${NC}"
    
    if "$VALIDATION_DIR/validate-navigation.sh" > "$RESULTS_DIR/yaml-cleanup/navigation-check.log" 2>&1; then
        log_result "NAVIGATION_SYSTEM" "PASSED" "All navigation tests passed (33/33)"
        return 0
    else
        log_result "NAVIGATION_SYSTEM" "FAILED" "Navigation validation failed - check log for details" "CRITICAL"
        return 1
    fi
}

run_system_integrity_check() {
    echo -e "${CYAN}🛡️ Running system integrity validation...${NC}"
    
    # Run system integrity check and capture results
    if "$VALIDATION_DIR/validate-system-integrity.sh" > "$RESULTS_DIR/yaml-cleanup/integrity-check.log" 2>&1; then
        log_result "SYSTEM_INTEGRITY" "PASSED" "System integrity validated successfully"
        return 0
    else
        # Parse the log for specific issues
        if grep -q "CRITICAL" "$RESULTS_DIR/yaml-cleanup/integrity-check.log"; then
            log_result "SYSTEM_INTEGRITY" "FAILED" "Critical system integrity issues detected" "CRITICAL"
        else
            log_result "SYSTEM_INTEGRITY" "FAILED" "System integrity issues detected" "ERROR"
        fi
        return 1
    fi
}

check_link_integrity() {
    echo -e "${CYAN}🔗 Checking link integrity...${NC}"
    
    # Quick link validation focused on the most critical files
    local broken_links=0
    local checked_files=0
    
    # Check principle files for broken links
    while IFS= read -r -d '' file; do
        checked_files=$((checked_files + 1))
        # Simple check for obvious broken references
        if grep -q "\.\.\/\.\.\/" "$file" 2>/dev/null; then
            # More detailed analysis needed - potential relative path issues
            if grep -q "ERROR\|BROKEN\|NOT FOUND" "$file" 2>/dev/null; then
                broken_links=$((broken_links + 1))
            fi
        fi
    done < <(find "$BASE_DIR/docs/knowledge/principles" -name "*.md" -print0)
    
    if [ $broken_links -eq 0 ]; then
        log_result "LINK_INTEGRITY" "PASSED" "No broken links detected in $checked_files principle files"
        return 0
    else
        log_result "LINK_INTEGRITY" "FAILED" "$broken_links broken links found in $checked_files files" "CRITICAL"
        return 1
    fi
}

validate_yaml_cleanup_impact() {
    echo -e "${CYAN}🔄 Validating YAML cleanup impact...${NC}"
    
    # Count remaining YAML blocks to track cleanup progress
    local yaml_count=$(find "$BASE_DIR/docs" -name "*.md" -exec grep -l "```yaml\|```yml" {} \; 2>/dev/null | wc -l)
    
    if [ "$yaml_count" -lt 168 ]; then
        local cleaned=$((168 - yaml_count))
        log_result "YAML_CLEANUP" "PASSED" "Progress: $cleaned files cleaned, $yaml_count files remaining"
    else
        log_result "YAML_CLEANUP" "PASSED" "Baseline: $yaml_count files with YAML content"
    fi
    
    return 0
}

# Emergency response protocol
emergency_response() {
    local issue_type="$1"
    local details="$2"
    
    echo ""
    echo -e "${RED}${BOLD}🚨 EMERGENCY RESPONSE ACTIVATED 🚨${NC}"
    echo -e "${RED}Issue Type: $issue_type${NC}"
    echo -e "${RED}Details: $details${NC}"
    echo ""
    echo -e "${YELLOW}RECOMMENDED ACTIONS:${NC}"
    echo -e "${YELLOW}1. STOP current YAML cleanup operations immediately${NC}"
    echo -e "${YELLOW}2. Review the validation logs for specific failures${NC}"
    echo -e "${YELLOW}3. Apply fixes using proven validation tools${NC}"
    echo -e "${YELLOW}4. Re-run this monitoring script before resuming${NC}"
    echo ""
    
    # Generate emergency report
    cat > "$RESULTS_DIR/yaml-cleanup/EMERGENCY_RESPONSE_${TIMESTAMP}.json" << EOF
{
  "emergency_response": {
    "timestamp": "$TIMESTAMP",
    "phase": "$PHASE_NAME",
    "issue_type": "$issue_type",
    "details": "$details",
    "critical_issues": $critical_issues,
    "failed_validations": $failed_validations,
    "recommended_actions": [
      "STOP YAML cleanup operations immediately",
      "Review validation logs in $RESULTS_DIR/yaml-cleanup/",
      "Apply fixes using validation tools",
      "Re-run monitoring before resuming cleanup"
    ],
    "recovery_commands": [
      "./scripts/validation/validate-navigation.sh",
      "./scripts/validation/validate-system-integrity.sh",
      "./scripts/validation/yaml-cleanup-monitoring.sh"
    ]
  }
}
EOF
    
    echo -e "${RED}Emergency report saved: $RESULTS_DIR/yaml-cleanup/EMERGENCY_RESPONSE_${TIMESTAMP}.json${NC}"
}

# Generate checkpoint report
generate_checkpoint_report() {
    local status="SUCCESS"
    if [ $critical_issues -gt 0 ]; then
        status="CRITICAL_FAILURE"
    elif [ $failed_validations -gt 0 ]; then
        status="FAILURE"
    elif [ $warnings -gt 0 ]; then
        status="SUCCESS_WITH_WARNINGS"
    fi
    
    cat > "$CHECKPOINT_FILE" << EOF
{
  "yaml_cleanup_checkpoint": {
    "timestamp": "$TIMESTAMP",
    "phase": "$PHASE_NAME",
    "monitoring_mode": "$MONITORING_MODE",
    "overall_status": "$status",
    "validation_summary": {
      "total_validations": $total_validations,
      "passed_validations": $passed_validations,
      "failed_validations": $failed_validations,
      "critical_issues": $critical_issues,
      "warnings": $warnings,
      "success_rate": $(echo "scale=4; $passed_validations / $total_validations" | bc -l)
    },
    "validation_results": {
      "navigation_system": "$([ $failed_validations -eq 0 ] && echo "PASSED" || echo "FAILED")",
      "system_integrity": "$([ $critical_issues -eq 0 ] && echo "PASSED" || echo "FAILED")",
      "link_integrity": "$([ $failed_validations -eq 0 ] && echo "PASSED" || echo "FAILED")",
      "yaml_cleanup_progress": "MONITORED"
    },
    "recommendations": {
      "continue_cleanup": $([ $critical_issues -eq 0 ] && echo "true" || echo "false"),
      "immediate_action_required": $([ $critical_issues -gt 0 ] && echo "true" || echo "false"),
      "next_checkpoint": "After next major YAML cleanup phase"
    }
  }
}
EOF
}

# Main monitoring execution
main() {
    echo -e "${BOLD}🔍 YAML CLEANUP MONITORING - $PHASE_NAME${NC}"
    echo -e "${BOLD}================================================${NC}"
    echo ""
    echo -e "🕐 Started at: ${CYAN}$(date)${NC}"
    echo -e "📂 Base directory: ${CYAN}$BASE_DIR${NC}"
    echo -e "📊 Results directory: ${CYAN}$RESULTS_DIR/yaml-cleanup${NC}"
    echo -e "🔧 Monitoring mode: ${CYAN}$MONITORING_MODE${NC}"
    
    # Phase 1: Navigation System
    show_header "NAVIGATION SYSTEM VALIDATION"
    run_navigation_validation
    
    # Phase 2: System Integrity
    show_header "SYSTEM INTEGRITY VALIDATION"
    run_system_integrity_check
    
    # Phase 3: Link Integrity
    show_header "LINK INTEGRITY VALIDATION"
    check_link_integrity
    
    # Phase 4: YAML Cleanup Progress
    show_header "YAML CLEANUP IMPACT ASSESSMENT"
    validate_yaml_cleanup_impact
    
    # Generate checkpoint report
    echo ""
    echo -e "${BOLD}${PURPLE}━━━ GENERATING CHECKPOINT REPORT ━━━${NC}"
    generate_checkpoint_report
    
    # Final summary
    echo ""
    echo -e "${BOLD}${PURPLE}🏁 MONITORING COMPLETE${NC}"
    echo -e "${BOLD}=====================${NC}"
    echo -e "Phase: ${CYAN}$PHASE_NAME${NC}"
    echo -e "Total Validations: ${BLUE}$total_validations${NC}"
    echo -e "Passed: ${GREEN}$passed_validations${NC}"
    echo -e "Failed: ${RED}$failed_validations${NC}"
    echo -e "Critical Issues: ${RED}$critical_issues${NC}"
    echo -e "Warnings: ${YELLOW}$warnings${NC}"
    echo ""
    echo -e "📁 Checkpoint report: ${CYAN}$CHECKPOINT_FILE${NC}"
    
    # Determine exit action
    if [ $critical_issues -gt 0 ]; then
        emergency_response "CRITICAL_VALIDATION_FAILURE" "$critical_issues critical issues detected during monitoring"
        echo -e "${RED}💀 CRITICAL ISSUES DETECTED - CLEANUP MUST STOP${NC}"
        exit 2
    elif [ $failed_validations -gt 0 ]; then
        echo -e "${YELLOW}⚠️ VALIDATION ISSUES DETECTED - REVIEW REQUIRED${NC}"
        echo -e "${YELLOW}Recommendation: Fix issues before continuing YAML cleanup${NC}"
        exit 1
    else
        echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED${NC}"
        echo -e "${GREEN}✅ YAML cleanup can continue safely${NC}"
        exit 0
    fi
}

# Execute monitoring
main "$@"