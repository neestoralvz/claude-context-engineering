#!/bin/bash

# Emergency Link Repair System
# Immediate response protocol for broken links during YAML cleanup
# Provides automated diagnosis and repair capabilities

set -e

echo "🚨 Emergency Link Repair System"
echo "==============================="
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
REPAIR_DIR="$RESULTS_DIR/emergency-repairs"

# Create repair directory
mkdir -p "$REPAIR_DIR"

# Global repair state
repair_session_id=$(date +%Y%m%d-%H%M%S)
total_repairs=0
successful_repairs=0
failed_repairs=0

show_emergency_header() {
    echo -e "${BOLD}${RED}🚨 EMERGENCY LINK REPAIR PROTOCOL ACTIVATED 🚨${NC}"
    echo -e "${BOLD}${RED}=============================================${NC}"
    echo -e "Session ID: ${CYAN}$repair_session_id${NC}"
    echo -e "Started: ${CYAN}$(date)${NC}"
    echo ""
}

log_repair_event() {
    local event_type="$1"
    local message="$2"
    local severity="${3:-INFO}"
    local log_file="$REPAIR_DIR/emergency-repair-$repair_session_id.log"
    
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
        "REPAIR")
            echo -e "${PURPLE}🔧 REPAIR:${NC} $message"
            ;;
        *)
            echo -e "${BLUE}ℹ️ INFO:${NC} $message"
            ;;
    esac
}

# Diagnostic function
diagnose_link_failure() {
    local validation_log="$1"
    
    log_repair_event "DIAGNOSIS_START" "Analyzing validation failure from: $validation_log" "INFO"
    
    echo -e "${CYAN}🔍 DIAGNOSTIC PHASE${NC}"
    echo -e "==================="
    
    # Check if validation log exists
    if [ ! -f "$validation_log" ]; then
        log_repair_event "DIAGNOSIS_ERROR" "Validation log not found: $validation_log" "ERROR"
        return 1
    fi
    
    # Analyze validation failures
    local failed_checks=$(grep "❌ FAIL" "$validation_log" 2>/dev/null | wc -l)
    
    if [ "$failed_checks" -eq 0 ]; then
        log_repair_event "DIAGNOSIS_RESULT" "No failed checks found in validation log" "WARNING"
        echo -e "${YELLOW}⚠️ No explicit failures found in validation log${NC}"
        return 0
    fi
    
    echo -e "${RED}Found $failed_checks failed checks:${NC}"
    grep "❌ FAIL" "$validation_log" 2>/dev/null | while read -r failure; do
        echo -e "  ${RED}• $failure${NC}"
        log_repair_event "FAILURE_DETECTED" "$failure" "ERROR"
    done
    
    log_repair_event "DIAGNOSIS_COMPLETE" "Found $failed_checks failed checks" "INFO"
    return $failed_checks
}

# Identify broken links
identify_broken_links() {
    local scan_directory="${1:-$BASE_DIR/docs}"
    
    log_repair_event "LINK_SCAN_START" "Scanning for broken links in: $scan_directory" "INFO"
    
    echo -e "${CYAN}🔗 LINK ANALYSIS PHASE${NC}"
    echo -e "======================"
    
    local broken_links_file="$REPAIR_DIR/broken-links-$repair_session_id.txt"
    local link_count=0
    local broken_count=0
    
    # Find all markdown files and check their links
    find "$scan_directory" -name "*.md" -type f | while read -r file; do
        # Extract relative links
        grep -n "](\./" "$file" 2>/dev/null | while IFS=: read -r line_num link_line; do
            link_count=$((link_count + 1))
            
            # Extract the link path
            local link_path=$(echo "$link_line" | sed -n 's/.*](\.\(\/[^)]*\)).*/\1/p')
            if [ -n "$link_path" ]; then
                local target_file="$BASE_DIR$link_path"
                
                # Check if target exists
                if [ ! -f "$target_file" ] && [ ! -d "$target_file" ]; then
                    broken_count=$((broken_count + 1))
                    echo "BROKEN: $file:$line_num -> $link_path" >> "$broken_links_file"
                    log_repair_event "BROKEN_LINK" "$file:$line_num -> $link_path" "ERROR"
                    echo -e "${RED}❌ $file:$line_num -> $link_path${NC}"
                fi
            fi
        done
    done
    
    if [ -f "$broken_links_file" ]; then
        local total_broken=$(wc -l < "$broken_links_file")
        log_repair_event "LINK_SCAN_RESULT" "Found $total_broken broken links" "WARNING"
        echo -e "${RED}Found $total_broken broken links${NC}"
        return $total_broken
    else
        log_repair_event "LINK_SCAN_RESULT" "No broken links found" "SUCCESS"
        echo -e "${GREEN}✅ No broken links found${NC}"
        return 0
    fi
}

# Automated link repair
repair_broken_link() {
    local source_file="$1"
    local line_number="$2"
    local broken_link="$3"
    
    total_repairs=$((total_repairs + 1))
    
    log_repair_event "REPAIR_ATTEMPT" "Attempting to repair: $source_file:$line_number -> $broken_link" "REPAIR"
    
    # Try to find the correct target
    local target_name=$(basename "$broken_link")
    local potential_targets=()
    
    # Search for files with similar names
    while IFS= read -r -d '' file; do
        potential_targets+=("$file")
    done < <(find "$BASE_DIR" -name "*$target_name*" -type f -print0)
    
    if [ ${#potential_targets[@]} -eq 0 ]; then
        log_repair_event "REPAIR_FAILED" "No potential targets found for: $broken_link" "ERROR"
        failed_repairs=$((failed_repairs + 1))
        return 1
    elif [ ${#potential_targets[@]} -eq 1 ]; then
        # Single match - attempt automatic repair
        local new_target="${potential_targets[0]}"
        local relative_path=$(python3 -c "import os; print(os.path.relpath('$new_target', '$(dirname "$source_file")'))")
        
        # Create backup
        cp "$source_file" "$source_file.backup-$repair_session_id"
        
        # Perform replacement
        if sed -i.tmp "$line_number s|$broken_link|$relative_path|" "$source_file"; then
            rm "$source_file.tmp"
            log_repair_event "REPAIR_SUCCESS" "Repaired: $broken_link -> $relative_path" "SUCCESS"
            successful_repairs=$((successful_repairs + 1))
            echo -e "${GREEN}✅ Repaired: $broken_link -> $relative_path${NC}"
            return 0
        else
            # Restore backup on failure
            mv "$source_file.backup-$repair_session_id" "$source_file"
            log_repair_event "REPAIR_FAILED" "Sed replacement failed for: $broken_link" "ERROR"
            failed_repairs=$((failed_repairs + 1))
            return 1
        fi
    else
        # Multiple matches - require manual intervention
        log_repair_event "REPAIR_MANUAL" "Multiple targets found for $broken_link - manual intervention required" "WARNING"
        echo -e "${YELLOW}⚠️ Multiple potential targets for $broken_link:${NC}"
        for target in "${potential_targets[@]}"; do
            echo -e "  ${CYAN}• $target${NC}"
        done
        failed_repairs=$((failed_repairs + 1))
        return 2
    fi
}

# Batch repair function
repair_all_broken_links() {
    local broken_links_file="$REPAIR_DIR/broken-links-$repair_session_id.txt"
    
    if [ ! -f "$broken_links_file" ]; then
        log_repair_event "BATCH_REPAIR_ERROR" "No broken links file found" "ERROR"
        return 1
    fi
    
    echo -e "${CYAN}🔧 REPAIR PHASE${NC}"
    echo -e "==============="
    
    local repair_count=0
    while IFS=: read -r source_file line_number broken_link; do
        if [[ "$source_file" == "BROKEN" ]]; then
            # Parse the actual broken link format
            local actual_file=$(echo "$line_number" | cut -d' ' -f1)
            local actual_line=$(echo "$line_number" | cut -d' ' -f1 | cut -d':' -f2)
            local actual_link=$(echo "$broken_link" | sed 's/^[[:space:]]*->[[:space:]]*//')
            
            repair_broken_link "$actual_file" "$actual_line" "$actual_link"
            repair_count=$((repair_count + 1))
        fi
    done < "$broken_links_file"
    
    log_repair_event "BATCH_REPAIR_COMPLETE" "Attempted $repair_count repairs: $successful_repairs successful, $failed_repairs failed" "INFO"
}

# Post-repair validation
validate_repairs() {
    echo -e "${CYAN}🔍 POST-REPAIR VALIDATION${NC}"
    echo -e "========================="
    
    log_repair_event "POST_REPAIR_VALIDATION" "Running validation after repairs" "INFO"
    
    # Run navigation validation
    if "$SCRIPTS_DIR/validation/validate-navigation.sh" > "$REPAIR_DIR/post-repair-validation-$repair_session_id.log" 2>&1; then
        log_repair_event "POST_REPAIR_SUCCESS" "Post-repair validation passed" "SUCCESS"
        echo -e "${GREEN}✅ Post-repair validation passed${NC}"
        return 0
    else
        log_repair_event "POST_REPAIR_FAILED" "Post-repair validation failed" "ERROR"
        echo -e "${RED}❌ Post-repair validation failed${NC}"
        return 1
    fi
}

# Generate repair report
generate_repair_report() {
    local report_file="$REPAIR_DIR/emergency-repair-report-$repair_session_id.json"
    
    cat > "$report_file" << EOF
{
  "emergency_repair_report": {
    "session_id": "$repair_session_id",
    "timestamp": "$(date -Iseconds)",
    "repair_summary": {
      "total_repairs_attempted": $total_repairs,
      "successful_repairs": $successful_repairs,
      "failed_repairs": $failed_repairs,
      "success_rate": $(echo "scale=4; $successful_repairs / $total_repairs * 100" | bc -l 2>/dev/null || echo "0")
    },
    "system_status": {
      "emergency_resolved": $([ $failed_repairs -eq 0 ] && echo "true" || echo "false"),
      "manual_intervention_required": $([ $failed_repairs -gt 0 ] && echo "true" || echo "false"),
      "post_repair_validation": "$([ -f "$REPAIR_DIR/post-repair-validation-$repair_session_id.log" ] && echo "COMPLETED" || echo "PENDING")"
    },
    "files": {
      "repair_log": "emergency-repair-$repair_session_id.log",
      "broken_links_analysis": "broken-links-$repair_session_id.txt",
      "post_repair_validation": "post-repair-validation-$repair_session_id.log"
    }
  }
}
EOF
    
    log_repair_event "REPORT_GENERATED" "Emergency repair report generated: $report_file" "INFO"
    echo -e "${BLUE}📊 Repair report: $report_file${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  diagnose <validation_log>     - Diagnose validation failure"
    echo "  scan [directory]              - Scan for broken links (default: docs/)"
    echo "  repair-all                    - Attempt automatic repair of all broken links"
    echo "  validate                      - Run post-repair validation"
    echo "  full-repair [directory]       - Complete repair cycle: scan -> repair -> validate"
    echo ""
    echo "Examples:"
    echo "  $0 diagnose scripts/results/yaml-cleanup-monitoring/validation-5.log"
    echo "  $0 scan docs/knowledge/principles/"
    echo "  $0 full-repair"
}

# Full repair cycle
full_repair_cycle() {
    local scan_dir="${1:-$BASE_DIR/docs}"
    
    show_emergency_header
    
    echo -e "${BOLD}${PURPLE}🚨 FULL EMERGENCY REPAIR CYCLE${NC}"
    echo -e "${BOLD}${PURPLE}==============================${NC}"
    echo ""
    
    # Step 1: Identify broken links
    if ! identify_broken_links "$scan_dir"; then
        log_repair_event "FULL_REPAIR_SUCCESS" "No broken links found - no repairs needed" "SUCCESS"
        echo -e "${GREEN}✅ No repairs needed - system is healthy${NC}"
        return 0
    fi
    
    # Step 2: Attempt repairs
    repair_all_broken_links
    
    # Step 3: Validate repairs
    validate_repairs
    local validation_result=$?
    
    # Step 4: Generate report
    generate_repair_report
    
    # Summary
    echo ""
    echo -e "${BOLD}${PURPLE}📊 EMERGENCY REPAIR SUMMARY${NC}"
    echo -e "${BOLD}${PURPLE}===========================${NC}"
    echo -e "Total Repairs Attempted: ${CYAN}$total_repairs${NC}"
    echo -e "Successful Repairs: ${GREEN}$successful_repairs${NC}"
    echo -e "Failed Repairs: ${RED}$failed_repairs${NC}"
    echo -e "Success Rate: ${CYAN}$(echo "scale=2; $successful_repairs / $total_repairs * 100" | bc -l 2>/dev/null || echo "0")%${NC}"
    echo -e "Post-Repair Validation: $([ $validation_result -eq 0 ] && echo -e "${GREEN}PASSED${NC}" || echo -e "${RED}FAILED${NC}")"
    echo ""
    
    if [ $failed_repairs -eq 0 ] && [ $validation_result -eq 0 ]; then
        echo -e "${GREEN}🎉 EMERGENCY REPAIR SUCCESSFUL - SYSTEM RESTORED${NC}"
        log_repair_event "EMERGENCY_RESOLVED" "All repairs successful and validation passed" "SUCCESS"
        return 0
    else
        echo -e "${RED}⚠️ MANUAL INTERVENTION REQUIRED${NC}"
        log_repair_event "MANUAL_REQUIRED" "Some repairs failed or validation did not pass" "WARNING"
        return 1
    fi
}

# Main execution
main() {
    case "${1:-}" in
        "diagnose")
            show_emergency_header
            diagnose_link_failure "$2"
            ;;
        "scan")
            show_emergency_header
            identify_broken_links "$2"
            ;;
        "repair-all")
            show_emergency_header
            repair_all_broken_links
            ;;
        "validate")
            show_emergency_header
            validate_repairs
            ;;
        "full-repair")
            full_repair_cycle "$2"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"