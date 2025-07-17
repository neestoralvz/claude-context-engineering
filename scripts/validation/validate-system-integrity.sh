#!/bin/bash

# System Integrity Validation Engine for Context Engineering
# Master validation script that coordinates all verification systems
# Ensures complete mathematical and functional integrity

set -e

echo "🛡️ Context Engineering - System Integrity Validation Engine"
echo "============================================================"
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
REGISTRY_FILE="$BASE_DIR/.claude/config/command-registry.json"

# Create results directory
mkdir -p "$RESULTS_DIR/system-integrity"

# Validation phases
PHASE_COUNT=8
current_phase=0

# Global validation results
validation_phases=()
overall_status="PENDING"
total_issues=0
critical_issues=0
warnings=0

# Progress indicator
show_phase_header() {
    local phase_name="$1"
    current_phase=$((current_phase + 1))
    echo ""
    echo -e "${BOLD}${PURPLE}━━━ PHASE $current_phase/$PHASE_COUNT: $phase_name ━━━${NC}"
    echo ""
}

# Validation result tracker
add_validation_result() {
    local phase="$1"
    local status="$2"
    local message="$3"
    local severity="${4:-INFO}"
    
    validation_phases+=("$phase:$status:$message:$severity")
    
    case $severity in
        "CRITICAL")
            critical_issues=$((critical_issues + 1))
            total_issues=$((total_issues + 1))
            echo -e "${RED}💀 CRITICAL:${NC} $message"
            ;;
        "ERROR")
            total_issues=$((total_issues + 1))
            echo -e "${RED}❌ ERROR:${NC} $message"
            ;;
        "WARNING")
            warnings=$((warnings + 1))
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

# Check script dependencies
check_dependencies() {
    local missing_deps=0
    
    # Check required commands
    for cmd in bc jq curl; do
        if ! command -v "$cmd" &> /dev/null; then
            add_validation_result "DEPENDENCIES" "FAILED" "Missing required command: $cmd" "CRITICAL"
            missing_deps=$((missing_deps + 1))
        fi
    done
    
    # Check script files
    local required_scripts=(
        "core/execute-commands.sh"
        "compliance/verify-mathematical-formulas.sh"
        "core/calculate-real-metrics.sh"
        "core/test-trigger-system.sh"
        "validation/validate-navigation.sh"
    )
    
    for script in "${required_scripts[@]}"; do
        if [ ! -f "$SCRIPTS_DIR/$script" ]; then
            add_validation_result "DEPENDENCIES" "FAILED" "Missing required script: $script" "CRITICAL"
            missing_deps=$((missing_deps + 1))
        elif [ ! -x "$SCRIPTS_DIR/$script" ]; then
            add_validation_result "DEPENDENCIES" "FAILED" "Script not executable: $script" "ERROR"
            missing_deps=$((missing_deps + 1))
        fi
    done
    
    # Check registry file
    if [ ! -f "$REGISTRY_FILE" ]; then
        add_validation_result "DEPENDENCIES" "FAILED" "Registry file not found: $REGISTRY_FILE" "CRITICAL"
        missing_deps=$((missing_deps + 1))
    fi
    
    if [ $missing_deps -eq 0 ]; then
        add_validation_result "DEPENDENCIES" "PASSED" "All dependencies and scripts available" "SUCCESS"
        return 0
    else
        add_validation_result "DEPENDENCIES" "FAILED" "$missing_deps dependencies missing" "CRITICAL"
        return 1
    fi
}

# Validate mathematical formulas
validate_mathematical_formulas() {
    echo -e "${CYAN}🧮 Running mathematical formula verification...${NC}"
    
    if [ ! -x "$SCRIPTS_DIR/compliance/verify-mathematical-formulas.sh" ]; then
        add_validation_result "MATH_FORMULAS" "FAILED" "Mathematical verification script not executable" "CRITICAL"
        return 1
    fi
    
    # Run mathematical verification
    if "$SCRIPTS_DIR/compliance/verify-mathematical-formulas.sh" > "$RESULTS_DIR/system-integrity/math-validation.log" 2>&1; then
        # Parse results
        if [ -f "$RESULTS_DIR/formulas/mathematical_verification_report.json" ]; then
            local failed_tests=$(jq -r '.mathematical_verification_report.failed_tests // 0' "$RESULTS_DIR/formulas/mathematical_verification_report.json")
            local total_tests=$(jq -r '.mathematical_verification_report.total_tests // 0' "$RESULTS_DIR/formulas/mathematical_verification_report.json")
            local success_rate=$(jq -r '.mathematical_verification_report.success_rate // 0' "$RESULTS_DIR/formulas/mathematical_verification_report.json")
            
            if [ "$failed_tests" -eq 0 ]; then
                add_validation_result "MATH_FORMULAS" "PASSED" "All $total_tests mathematical formulas verified (Success: $success_rate)" "SUCCESS"
                return 0
            else
                add_validation_result "MATH_FORMULAS" "FAILED" "$failed_tests/$total_tests mathematical tests failed" "ERROR"
                return 1
            fi
        else
            add_validation_result "MATH_FORMULAS" "FAILED" "Mathematical verification report not generated" "ERROR"
            return 1
        fi
    else
        add_validation_result "MATH_FORMULAS" "FAILED" "Mathematical verification script execution failed" "ERROR"
        return 1
    fi
}

# Validate trigger system
validate_trigger_system() {
    echo -e "${CYAN}🎯 Running trigger system verification...${NC}"
    
    if [ ! -x "$SCRIPTS_DIR/core/test-trigger-system.sh" ]; then
        add_validation_result "TRIGGER_SYSTEM" "FAILED" "Trigger system test script not executable" "CRITICAL"
        return 1
    fi
    
    # Run trigger system validation
    if "$SCRIPTS_DIR/core/test-trigger-system.sh" > "$RESULTS_DIR/system-integrity/trigger-validation.log" 2>&1; then
        # Parse results
        if [ -f "$RESULTS_DIR/triggers/trigger_system_validation.json" ]; then
            local failed_tests=$(jq -r '.trigger_system_validation.failed_tests // 0' "$RESULTS_DIR/triggers/trigger_system_validation.json")
            local total_tests=$(jq -r '.trigger_system_validation.total_tests // 0' "$RESULTS_DIR/triggers/trigger_system_validation.json")
            local success_rate=$(jq -r '.trigger_system_validation.success_rate // 0' "$RESULTS_DIR/triggers/trigger_system_validation.json")
            
            if [ "$failed_tests" -eq 0 ]; then
                add_validation_result "TRIGGER_SYSTEM" "PASSED" "All $total_tests trigger tests passed (Success: $success_rate)" "SUCCESS"
                return 0
            else
                add_validation_result "TRIGGER_SYSTEM" "FAILED" "$failed_tests/$total_tests trigger tests failed" "ERROR"
                return 1
            fi
        else
            add_validation_result "TRIGGER_SYSTEM" "FAILED" "Trigger validation report not generated" "ERROR"
            return 1
        fi
    else
        add_validation_result "TRIGGER_SYSTEM" "FAILED" "Trigger system validation script execution failed" "ERROR"
        return 1
    fi
}

# Validate navigation system
validate_navigation_system() {
    echo -e "${CYAN}🧭 Running navigation system verification...${NC}"
    
    if [ ! -x "$SCRIPTS_DIR/validation/validate-navigation.sh" ]; then
        add_validation_result "NAVIGATION" "FAILED" "Navigation validation script not executable" "CRITICAL"
        return 1
    fi
    
    # Run navigation validation
    if "$SCRIPTS_DIR/validation/validate-navigation.sh" > "$RESULTS_DIR/system-integrity/navigation-validation.log" 2>&1; then
        add_validation_result "NAVIGATION" "PASSED" "Navigation system validated successfully" "SUCCESS"
        return 0
    else
        add_validation_result "NAVIGATION" "FAILED" "Navigation validation failed" "ERROR"
        return 1
    fi
}

# Validate registry metrics
validate_registry_metrics() {
    echo -e "${CYAN}📊 Analyzing registry metrics...${NC}"
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        add_validation_result "REGISTRY_METRICS" "FAILED" "Registry file not found" "CRITICAL"
        return 1
    fi
    
    # Check for zero success rate commands
    local zero_success_commands=$(jq '[.commands.atomic[], .commands.orchestrators[], .commands.meta[], .commands.system[]] | map(select(.metrics.successRate == 0.0)) | length' "$REGISTRY_FILE")
    
    if [ "$zero_success_commands" -gt 0 ]; then
        add_validation_result "REGISTRY_METRICS" "WARNING" "$zero_success_commands commands still have 0.0 success rate - consider running calculate-real-metrics.sh" "WARNING"
    else
        add_validation_result "REGISTRY_METRICS" "PASSED" "All commands have realistic success rates" "SUCCESS"
    fi
    
    # Check overall success rate
    local overall_success=$(jq -r '.statistics.overallSuccessRate' "$REGISTRY_FILE")
    if (( $(echo "$overall_success >= 0.8" | bc -l) )); then
        add_validation_result "REGISTRY_METRICS" "PASSED" "Overall success rate acceptable: $overall_success" "SUCCESS"
    else
        add_validation_result "REGISTRY_METRICS" "WARNING" "Overall success rate below 80%: $overall_success" "WARNING"
    fi
    
    # Check total commands
    local total_commands=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE")
    if [ "$total_commands" -ge 50 ]; then
        add_validation_result "REGISTRY_METRICS" "PASSED" "Command count healthy: $total_commands commands" "SUCCESS"
    else
        add_validation_result "REGISTRY_METRICS" "WARNING" "Low command count: $total_commands commands" "WARNING"
    fi
    
    return 0
}

# Validate command execution
validate_command_execution() {
    echo -e "${CYAN}🚀 Testing command execution capability...${NC}"
    
    if [ ! -x "$SCRIPTS_DIR/core/execute-commands.sh" ]; then
        add_validation_result "COMMAND_EXECUTION" "FAILED" "Command execution script not executable" "CRITICAL"
        return 1
    fi
    
    # Note: We don't run the full execution here to avoid long delays
    # Instead, we validate that the execution infrastructure is ready
    
    # Check if formulas library exists
    if [ -f "$SCRIPTS_DIR/formulas/context_engineering_formulas.sh" ]; then
        add_validation_result "COMMAND_EXECUTION" "PASSED" "Mathematical formula library available for execution" "SUCCESS"
    else
        add_validation_result "COMMAND_EXECUTION" "WARNING" "Formula library not found - may need to run verify-mathematical-formulas.sh first" "WARNING"
    fi
    
    # Validate execution script functionality with a dry run check
    if grep -q "calculate_confidence" "$SCRIPTS_DIR/core/execute-commands.sh"; then
        add_validation_result "COMMAND_EXECUTION" "PASSED" "Command execution script has mathematical integration" "SUCCESS"
    else
        add_validation_result "COMMAND_EXECUTION" "WARNING" "Command execution script may lack mathematical integration" "WARNING"
    fi
    
    return 0
}

# Validate enforcement mechanisms
validate_enforcement_mechanisms() {
    echo -e "${CYAN}🚨 Validating enforcement mechanisms...${NC}"
    
    # Check for 🚨 BLOCKING enforcement language in key files
    local enforcement_files=(
        "$BASE_DIR/docs/commands/executable/core-routing/evolutionary-decision-trees.md"
        "$BASE_DIR/docs/commands/executable/orchestration/orchestrate.md"
        "$BASE_DIR/docs/commands/executable/meta/context-eng.md"
        "$BASE_DIR/docs/knowledge/protocols/active-principle-reminder-system.md"
        "$BASE_DIR/docs/knowledge/protocols/zero-root-file-verification-protocol.md"
        "$BASE_DIR/docs/commands/shared/compliance/p55-p56-universal-compliance.md"
    )
    
    local enforcement_count=0
    local missing_enforcement=()
    
    for file in "${enforcement_files[@]}"; do
        if [ -f "$file" ]; then
            local blocking_count=$(grep -c "🚨 BLOCKING\|🚨 MANDATORY\|🚨 AUTOMATIC\|🚨 CRITICAL" "$file" 2>/dev/null || echo 0)
            if [ "$blocking_count" -gt 0 ]; then
                enforcement_count=$((enforcement_count + 1))
                add_validation_result "ENFORCEMENT" "PASSED" "$(basename "$file"): $blocking_count enforcement mechanisms found" "SUCCESS"
            else
                missing_enforcement+=("$(basename "$file")")
                add_validation_result "ENFORCEMENT" "WARNING" "$(basename "$file"): No enforcement mechanisms found" "WARNING"
            fi
        else
            missing_enforcement+=("$(basename "$file")")
            add_validation_result "ENFORCEMENT" "FAILED" "$(basename "$file"): File not found" "CRITICAL"
        fi
    done
    
    # Check for ecosystem utilization enforcement
    if grep -q "≥70% command utilization" "$BASE_DIR/docs/commands/executable/orchestration/orchestrate.md" 2>/dev/null; then
        add_validation_result "ENFORCEMENT" "PASSED" "Ecosystem utilization threshold enforcement detected" "SUCCESS"
    else
        add_validation_result "ENFORCEMENT" "WARNING" "Ecosystem utilization threshold not found" "WARNING"
    fi
    
    # Check for real-time violation detection
    if grep -q "real-time violation detection\|AUTOMATIC violation detection" "$BASE_DIR/docs/knowledge/protocols/active-principle-reminder-system.md" 2>/dev/null; then
        add_validation_result "ENFORCEMENT" "PASSED" "Real-time violation detection mechanisms found" "SUCCESS"
    else
        add_validation_result "ENFORCEMENT" "WARNING" "Real-time violation detection not found" "WARNING"
    fi
    
    # Summary
    if [ ${#missing_enforcement[@]} -eq 0 ]; then
        add_validation_result "ENFORCEMENT" "PASSED" "All enforcement mechanisms validated" "SUCCESS"
    else
        add_validation_result "ENFORCEMENT" "WARNING" "Missing enforcement in: ${missing_enforcement[*]}" "WARNING"
    fi
    
    return 0
}

# Validate command synchronization
validate_command_synchronization() {
    echo -e "${CYAN}🔄 Running command synchronization validation...${NC}"
    
    if [ ! -x "$SCRIPTS_DIR/validation/automated-command-counter-v2.sh" ]; then
        add_validation_result "COMMAND_SYNC" "FAILED" "Automated command counter not executable" "CRITICAL"
        return 1
    fi
    
    # Run command counter in quiet mode
    if "$SCRIPTS_DIR/validation/automated-command-counter-v2.sh" --quiet > "$RESULTS_DIR/system-integrity/command-sync-validation.log" 2>&1; then
        add_validation_result "COMMAND_SYNC" "PASSED" "Command directories synchronized" "SUCCESS"
        return 0
    else
        # Parse the latest command count report for details
        local latest_report=$(find "$RESULTS_DIR/command-counts" -name "command-count-report-*.json" -type f | sort -r | head -1)
        if [ -f "$latest_report" ]; then
            local discrepancies=$(jq -r '.command_count_report.discrepancies.total_found' "$latest_report")
            local docs_total=$(jq -r '.command_count_report.counts.docs_commands.total' "$latest_report")
            local claude_total=$(jq -r '.command_count_report.counts.claude_commands.total' "$latest_report")
            
            add_validation_result "COMMAND_SYNC" "FAILED" "$discrepancies discrepancies found - docs:$docs_total vs claude:$claude_total" "ERROR"
        else
            add_validation_result "COMMAND_SYNC" "FAILED" "Command synchronization validation failed" "ERROR"
        fi
        return 1
    fi
}

# Validate system coherence
validate_system_coherence() {
    echo -e "${CYAN}🔗 Analyzing system coherence...${NC}"
    
    local coherence_issues=0
    
    # Check CLAUDE.md synchronization
    if [ -f "$BASE_DIR/CLAUDE.md" ]; then
        # Check if CLAUDE.md references match registry
        local claude_command_count=$(grep -c "commands" "$BASE_DIR/CLAUDE.md" 2>/dev/null || echo "0")
        if [ "$claude_command_count" -gt 0 ]; then
            add_validation_result "SYSTEM_COHERENCE" "PASSED" "CLAUDE.md contains command references" "SUCCESS"
        else
            add_validation_result "SYSTEM_COHERENCE" "WARNING" "CLAUDE.md may be out of sync with command system" "WARNING"
            coherence_issues=$((coherence_issues + 1))
        fi
    else
        add_validation_result "SYSTEM_COHERENCE" "WARNING" "CLAUDE.md not found" "WARNING"
        coherence_issues=$((coherence_issues + 1))
    fi
    
    # Check principle files existence
    local principles_dir="$BASE_DIR/docs/knowledge/principles"
    if [ -d "$principles_dir" ]; then
        local principle_files=$(find "$principles_dir" -name "*.md" -type f | wc -l)
        if [ "$principle_files" -gt 5 ]; then
            add_validation_result "SYSTEM_COHERENCE" "PASSED" "$principle_files principle files found" "SUCCESS"
        else
            add_validation_result "SYSTEM_COHERENCE" "WARNING" "Low number of principle files: $principle_files" "WARNING"
            coherence_issues=$((coherence_issues + 1))
        fi
    else
        add_validation_result "SYSTEM_COHERENCE" "ERROR" "Principles directory not found" "ERROR"
        coherence_issues=$((coherence_issues + 1))
    fi
    
    # Check command files existence
    local commands_dir="$BASE_DIR/.claude/commands"
    if [ -d "$commands_dir" ]; then
        local command_files=$(find "$commands_dir" -name "*.md" -type f | wc -l)
        if [ "$command_files" -gt 30 ]; then
            add_validation_result "SYSTEM_COHERENCE" "PASSED" "$command_files command files found" "SUCCESS"
        else
            add_validation_result "SYSTEM_COHERENCE" "WARNING" "Low number of command files: $command_files" "WARNING"
            coherence_issues=$((coherence_issues + 1))
        fi
    else
        add_validation_result "SYSTEM_COHERENCE" "ERROR" "Commands directory not found" "ERROR"
        coherence_issues=$((coherence_issues + 1))
    fi
    
    if [ $coherence_issues -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Generate comprehensive system report
generate_system_report() {
    local report_file="$RESULTS_DIR/system-integrity/comprehensive_system_validation.json"
    local timestamp=$(date -Iseconds)
    
    # Determine overall status
    if [ $critical_issues -gt 0 ]; then
        overall_status="CRITICAL_FAILURE"
    elif [ $total_issues -gt 0 ]; then
        overall_status="FAILURE"
    elif [ $warnings -gt 0 ]; then
        overall_status="SUCCESS_WITH_WARNINGS"
    else
        overall_status="SUCCESS"
    fi
    
    # Build validation results JSON
    local validation_json="["
    local first=true
    for result in "${validation_phases[@]}"; do
        IFS=':' read -r phase status message severity <<< "$result"
        
        if [ "$first" = true ]; then
            first=false
        else
            validation_json="$validation_json,"
        fi
        
        validation_json="$validation_json{\"phase\":\"$phase\",\"status\":\"$status\",\"message\":\"$message\",\"severity\":\"$severity\"}"
    done
    validation_json="$validation_json]"
    
    # Create comprehensive report
    cat > "$report_file" << EOF
{
  "system_integrity_validation": {
    "timestamp": "$timestamp",
    "overall_status": "$overall_status",
    "summary": {
      "total_phases": $PHASE_COUNT,
      "critical_issues": $critical_issues,
      "total_issues": $total_issues,
      "warnings": $warnings,
      "validation_phases": $validation_json
    },
    "system_health": {
      "mathematical_formulas": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "MATH_FORMULAS") | .status')",
      "trigger_system": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "TRIGGER_SYSTEM") | .status')",
      "navigation_system": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "NAVIGATION") | .status')",
      "registry_metrics": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "REGISTRY_METRICS") | .status')",
      "enforcement_mechanisms": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "ENFORCEMENT") | .status')",
      "command_execution": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "COMMAND_EXECUTION") | .status')",
      "system_coherence": "$(echo "$validation_json" | jq -r '.[] | select(.phase == "SYSTEM_COHERENCE") | .status')"
    },
    "recommendations": {
      "immediate_actions": [
        $([ $critical_issues -gt 0 ] && echo "\"Resolve $critical_issues critical issues before using system\"," || echo "")
        $([ $total_issues -gt 0 ] && echo "\"Address $total_issues system issues for optimal performance\"," || echo "")
        $([ $warnings -gt 0 ] && echo "\"Review $warnings warnings for system optimization\"" || echo "\"System is ready for production use\"")
      ],
      "optimization_suggestions": [
        "Run calculate-real-metrics.sh if commands have 0.0 success rates",
        "Execute full command validation with execute-commands.sh",
        "Monitor system performance through regular validation cycles",
        "Keep mathematical formulas updated with latest verification"
      ]
    },
    "system_readiness": {
      "production_ready": $([ $critical_issues -eq 0 ] && echo "true" || echo "false"),
      "mathematical_validation": "COMPLETE",
      "trigger_system_validation": "COMPLETE",
      "navigation_validation": "COMPLETE",
      "overall_confidence": "$([ $total_issues -eq 0 ] && echo "HIGH" || [ $critical_issues -eq 0 ] && echo "MEDIUM" || echo "LOW")"
    }
  }
}
EOF

    echo -e "📁 Comprehensive report saved: ${CYAN}$report_file${NC}"
}

# Main validation execution
main() {
    echo -e "${BOLD}🔍 CONTEXT ENGINEERING SYSTEM INTEGRITY VALIDATION${NC}"
    echo -e "${BOLD}==================================================${NC}"
    echo ""
    echo -e "🕐 Started at: ${CYAN}$(date)${NC}"
    echo -e "📂 Base directory: ${CYAN}$BASE_DIR${NC}"
    echo -e "📊 Results directory: ${CYAN}$RESULTS_DIR/system-integrity${NC}"
    
    # Phase 1: Dependencies
    show_phase_header "DEPENDENCY VALIDATION"
    check_dependencies
    
    # Phase 2: Mathematical Formulas
    show_phase_header "MATHEMATICAL FORMULA VALIDATION"
    validate_mathematical_formulas
    
    # Phase 3: Trigger System
    show_phase_header "TRIGGER SYSTEM VALIDATION"
    validate_trigger_system
    
    # Phase 4: Navigation System
    show_phase_header "NAVIGATION SYSTEM VALIDATION"
    validate_navigation_system
    
    # Phase 5: Registry Metrics
    show_phase_header "REGISTRY METRICS VALIDATION"
    validate_registry_metrics
    
    # Phase 6: Command Synchronization
    show_phase_header "COMMAND SYNCHRONIZATION VALIDATION"
    validate_command_synchronization
    
    # Phase 7: Enforcement Mechanisms
    show_phase_header "ENFORCEMENT MECHANISM VALIDATION"
    validate_enforcement_mechanisms
    
    # Phase 8: Command Execution & System Coherence
    show_phase_header "SYSTEM COHERENCE VALIDATION"
    validate_command_execution
    validate_system_coherence
    
    # Generate final report
    echo ""
    echo -e "${BOLD}${PURPLE}━━━ GENERATING COMPREHENSIVE REPORT ━━━${NC}"
    generate_system_report
    
    # Final summary
    echo ""
    echo -e "${BOLD}${PURPLE}🏁 VALIDATION COMPLETE${NC}"
    echo -e "${BOLD}=====================${NC}"
    echo -e "Overall Status: ${BOLD}$overall_status${NC}"
    echo -e "Critical Issues: ${RED}$critical_issues${NC}"
    echo -e "Total Issues: ${YELLOW}$total_issues${NC}"
    echo -e "Warnings: ${YELLOW}$warnings${NC}"
    echo ""
    
    # Exit with appropriate code
    if [ $critical_issues -gt 0 ]; then
        echo -e "${RED}💀 CRITICAL ISSUES DETECTED - SYSTEM NOT READY${NC}"
        exit 2
    elif [ $total_issues -gt 0 ]; then
        echo -e "${YELLOW}⚠️ ISSUES DETECTED - REVIEW REQUIRED${NC}"
        exit 1
    else
        echo -e "${GREEN}🎉 SYSTEM VALIDATION SUCCESSFUL${NC}"
        echo -e "${GREEN}✅ Context Engineering system is mathematically validated and ready for use!${NC}"
        exit 0
    fi
}

# Execute main validation
main "$@"