#!/bin/bash

# High-Risk Operations Monitoring Protocol
# Automated integration with other handoff operations
# Provides continuous monitoring during critical system changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

BASE_DIR="/Users/nalve/claude-context-engineering"
MONITOR_DIR="$BASE_DIR/scripts/results/yaml-cleanup-monitoring"
VALIDATION_SCRIPT="$BASE_DIR/scripts/validation/yaml-cleanup-link-monitor.sh"

echo -e "${BOLD}${PURPLE}🔗 HIGH-RISK OPERATIONS MONITORING PROTOCOL${NC}"
echo -e "${BOLD}${PURPLE}===========================================${NC}"
echo ""

# High-risk file patterns that require immediate monitoring
HIGH_RISK_PATTERNS=(
    "docs/knowledge/principles/principle-cross-reference-network.md"
    "docs/knowledge/principles/*.md"
    "docs/commands/**/*.md"
    "CLAUDE.md"
    "docs/knowledge/README.md"
    "docs/commands/README.md"
)

# Operation types that trigger monitoring
OPERATION_TYPES=(
    "YAML_CLEANUP"
    "PRINCIPLE_UPDATE"
    "COMMAND_DOCUMENTATION"
    "CROSS_REFERENCE_MODIFICATION"
    "NAVIGATION_RESTRUCTURE"
)

log_monitoring_event() {
    local operation="$1"
    local file_path="$2"
    local status="$3"
    local timestamp=$(date -Iseconds)
    local log_file="$MONITOR_DIR/high-risk-operations.log"
    
    echo "[$timestamp] OPERATION:$operation FILE:$file_path STATUS:$status" >> "$log_file"
}

validate_before_operation() {
    local operation_type="$1"
    local files_to_modify="$2"
    
    echo -e "${CYAN}🔍 PRE-OPERATION VALIDATION: $operation_type${NC}"
    
    # Run baseline validation
    if $VALIDATION_SCRIPT pre-phase "$operation_type"; then
        echo -e "${GREEN}✅ PRE-VALIDATION PASSED${NC}"
        log_monitoring_event "$operation_type" "$files_to_modify" "PRE_VALIDATION_PASSED"
        return 0
    else
        echo -e "${RED}❌ PRE-VALIDATION FAILED${NC}"
        log_monitoring_event "$operation_type" "$files_to_modify" "PRE_VALIDATION_FAILED"
        return 1
    fi
}

validate_during_operation() {
    local operation_type="$1"
    local batch_number="$2"
    local files_processed="$3"
    
    echo -e "${CYAN}🔄 BATCH VALIDATION: $operation_type Batch $batch_number${NC}"
    
    if $VALIDATION_SCRIPT batch "$batch_number" "$files_processed"; then
        echo -e "${GREEN}✅ BATCH VALIDATION PASSED${NC}"
        log_monitoring_event "$operation_type" "batch_$batch_number" "BATCH_VALIDATION_PASSED"
        return 0
    else
        echo -e "${RED}❌ BATCH VALIDATION FAILED - EMERGENCY STOP${NC}"
        log_monitoring_event "$operation_type" "batch_$batch_number" "BATCH_VALIDATION_FAILED_EMERGENCY_STOP"
        return 1
    fi
}

validate_after_operation() {
    local operation_type="$1"
    local files_modified="$2"
    
    echo -e "${CYAN}✅ POST-OPERATION VALIDATION: $operation_type${NC}"
    
    if $VALIDATION_SCRIPT post-phase "$operation_type" "$files_modified"; then
        echo -e "${GREEN}✅ POST-VALIDATION PASSED${NC}"
        log_monitoring_event "$operation_type" "$files_modified" "POST_VALIDATION_PASSED"
        return 0
    else
        echo -e "${RED}❌ POST-VALIDATION FAILED${NC}"
        log_monitoring_event "$operation_type" "$files_modified" "POST_VALIDATION_FAILED"
        return 1
    fi
}

monitor_high_risk_file() {
    local file_path="$1"
    local modification_type="$2"
    
    echo -e "${YELLOW}⚠️ HIGH-RISK FILE MODIFICATION: $file_path${NC}"
    
    if $VALIDATION_SCRIPT high-risk "$file_path" "$modification_type"; then
        echo -e "${GREEN}✅ HIGH-RISK FILE VALIDATION PASSED${NC}"
        log_monitoring_event "HIGH_RISK_FILE" "$file_path" "VALIDATION_PASSED"
        return 0
    else
        echo -e "${RED}❌ HIGH-RISK FILE VALIDATION FAILED${NC}"
        log_monitoring_event "HIGH_RISK_FILE" "$file_path" "VALIDATION_FAILED"
        return 1
    fi
}

# Command interface
case "${1:-}" in
    "yaml-cleanup-pre")
        validate_before_operation "YAML_CLEANUP" "${2:-unknown}"
        ;;
    "yaml-cleanup-batch")
        validate_during_operation "YAML_CLEANUP" "${2:-1}" "${3:-0}"
        ;;
    "yaml-cleanup-post")
        validate_after_operation "YAML_CLEANUP" "${2:-0}"
        ;;
    "principle-update-pre")
        validate_before_operation "PRINCIPLE_UPDATE" "${2:-unknown}"
        ;;
    "principle-update-post")
        validate_after_operation "PRINCIPLE_UPDATE" "${2:-0}"
        ;;
    "high-risk")
        monitor_high_risk_file "${2:-unknown}" "${3:-modification}"
        ;;
    "status")
        echo -e "${BLUE}📊 MONITORING STATUS${NC}"
        echo "Active monitoring for high-risk operations"
        echo "Log file: $MONITOR_DIR/high-risk-operations.log"
        if [[ -f "$MONITOR_DIR/high-risk-operations.log" ]]; then
            echo "Recent events:"
            tail -5 "$MONITOR_DIR/high-risk-operations.log"
        fi
        ;;
    *)
        echo "Usage: $0 {yaml-cleanup-pre|yaml-cleanup-batch|yaml-cleanup-post|principle-update-pre|principle-update-post|high-risk|status}"
        echo ""
        echo "Examples:"
        echo "  $0 yaml-cleanup-pre 'YAML Elimination Phase 1'"
        echo "  $0 yaml-cleanup-batch 1 15"
        echo "  $0 yaml-cleanup-post 27"
        echo "  $0 high-risk docs/knowledge/principles/technical-standards.md 'YAML removal'"
        echo "  $0 status"
        exit 1
        ;;
esac