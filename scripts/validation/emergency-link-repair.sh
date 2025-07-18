#!/bin/bash

# Emergency Link Repair System
# Immediate response protocol for broken links during YAML cleanup
# Provides automated diagnosis and repair capabilities

set -e

echo "⟳ /emergency-link-repair → Emergency Link Repair System 🎯"
echo "==============================="
echo ""

# Timing for reports
START_TIME=$(date +%s)

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
    echo "⟳ /emergency-link-repair → 🚨 EMERGENCY LINK REPAIR PROTOCOL ACTIVATED 🚨 🎯"
    echo "============================================="
    echo "⟳ /emergency-link-repair → Session ID: $repair_session_id 🎯"
    echo "⟳ /emergency-link-repair → Started: $(date) 🎯"
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
            echo "⟳ /emergency-link-repair → 💀 CRITICAL: $message 🎯"
            ;;
        "ERROR")
            echo "⟳ /emergency-link-repair → ❌ ERROR: $message 🎯"
            ;;
        "WARNING")
            echo "⟳ /emergency-link-repair → ⚠️ WARNING: $message 🎯"
            ;;
        "SUCCESS")
            echo "⟳ /emergency-link-repair → ✅ SUCCESS: $message 🎯"
            ;;
        "REPAIR")
            echo "⟳ /emergency-link-repair → 🔧 REPAIR: $message 🎯"
            ;;
        *)
            echo "⟳ /emergency-link-repair → ℹ️ INFO: $message 🎯"
            ;;
    esac
}

# Diagnostic function
diagnose_link_failure() {
    local validation_log="$1"
    
    log_repair_event "DIAGNOSIS_START" "Analyzing validation failure from: $validation_log" "INFO"
    
    echo "⟳ /emergency-link-repair → 🔍 DIAGNOSTIC PHASE 🎯"
    echo "==================="
    
    # Check if validation log exists
    if [ ! -f "$validation_log" ]; then
        log_repair_event "DIAGNOSIS_ERROR" "Validation log not found: $validation_log" "ERROR"
        return 1
    fi
    
    # Analyze validation failures
    local failed_checks=$(grep "❌ FAIL" "$validation_log" 2>/dev/null | wc -l)
    
    if [ "$failed_checks" -eq 0 ]; then
        log_repair_event "DIAGNOSIS_RESULT" "No failed checks found in validation log" "WARNING"
        echo "⟳ /emergency-link-repair → ⚠️ No explicit failures found in validation log 🎯"
        return 0
    fi
    
    echo "⟳ /emergency-link-repair → Found $failed_checks failed checks 🎯"
    grep "❌ FAIL" "$validation_log" 2>/dev/null | while read -r failure; do
        echo "⟳ /emergency-link-repair → • $failure 🎯"
        log_repair_event "FAILURE_DETECTED" "$failure" "ERROR"
    done
    
    log_repair_event "DIAGNOSIS_COMPLETE" "Found $failed_checks failed checks" "INFO"
    return $failed_checks
}

# Identify broken links
identify_broken_links() {
    local scan_directory="${1:-$BASE_DIR/docs}"
    
    log_repair_event "LINK_SCAN_START" "Scanning for broken links in: $scan_directory" "INFO"
    
    echo "⟳ /emergency-link-repair → 🔗 LINK ANALYSIS PHASE 🎯"
    echo "======================"
    
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
                    echo "⟳ /emergency-link-repair → ❌ $file:$line_num -> $link_path 🎯"
                fi
            fi
        done
    done
    
    if [ -f "$broken_links_file" ]; then
        local total_broken=$(wc -l < "$broken_links_file")
        log_repair_event "LINK_SCAN_RESULT" "Found $total_broken broken links" "WARNING"
        echo "⟳ /emergency-link-repair → Found $total_broken broken links 🎯"
        return $total_broken
    else
        log_repair_event "LINK_SCAN_RESULT" "No broken links found" "SUCCESS"
        echo "⟳ /emergency-link-repair → ✅ No broken links found 🎯"
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
            echo "⟳ /emergency-link-repair → ✅ Repaired: $broken_link -> $relative_path 🎯"
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
        echo "⟳ /emergency-link-repair → ⚠️ Multiple potential targets for $broken_link 🎯"
        for target in "${potential_targets[@]}"; do
            echo "⟳ /emergency-link-repair → • $target 🎯"
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
    
    echo "⟳ /emergency-link-repair → 🔧 REPAIR PHASE 🎯"
    echo "==============="
    
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
    echo "⟳ /emergency-link-repair → 🔍 POST-REPAIR VALIDATION 🎯"
    echo "========================="
    
    log_repair_event "POST_REPAIR_VALIDATION" "Running validation after repairs" "INFO"
    
    # Run navigation validation
    if "$SCRIPTS_DIR/validation/validate-navigation.sh" > "$REPAIR_DIR/post-repair-validation-$repair_session_id.log" 2>&1; then
        log_repair_event "POST_REPAIR_SUCCESS" "Post-repair validation passed" "SUCCESS"
        echo "⟳ /emergency-link-repair → ✅ Post-repair validation passed 🎯"
        return 0
    else
        log_repair_event "POST_REPAIR_FAILED" "Post-repair validation failed" "ERROR"
        echo "⟳ /emergency-link-repair → ❌ Post-repair validation failed 🎯"
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
    echo "⟳ /emergency-link-repair → 📊 Repair report: $report_file 🎯"
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
    
    echo "⟳ /emergency-link-repair → 🚨 FULL EMERGENCY REPAIR CYCLE 🎯"
    echo "=============================="
    echo ""
    
    # Step 1: Identify broken links
    if ! identify_broken_links "$scan_dir"; then
        log_repair_event "FULL_REPAIR_SUCCESS" "No broken links found - no repairs needed" "SUCCESS"
        echo "⟳ /emergency-link-repair → ✅ No repairs needed - system is healthy 🎯"
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
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    echo ""
    echo "⟳ /emergency-link-repair → 📊 EMERGENCY REPAIR SUMMARY 🎯 [${ELAPSED_TIME}s]"
    echo "==========================="
    echo "⟳ /emergency-link-repair → Total Repairs Attempted: $total_repairs 🎯"
    echo "⟳ /emergency-link-repair → Successful Repairs: $successful_repairs 🎯"
    echo "⟳ /emergency-link-repair → Failed Repairs: $failed_repairs 🎯"
    echo "⟳ /emergency-link-repair → Success Rate: $(echo "scale=2; $successful_repairs / $total_repairs * 100" | bc -l 2>/dev/null || echo "0")% 🎯"
    echo "⟳ /emergency-link-repair → Post-Repair Validation: $([ $validation_result -eq 0 ] && echo "PASSED" || echo "FAILED") 🎯"
    echo ""
    
    if [ $failed_repairs -eq 0 ] && [ $validation_result -eq 0 ]; then
        echo "⟳ /emergency-link-repair → 🎉 EMERGENCY REPAIR SUCCESSFUL - SYSTEM RESTORED 🎯 [${ELAPSED_TIME}s]"
        log_repair_event "EMERGENCY_RESOLVED" "All repairs successful and validation passed" "SUCCESS"
        return 0
    else
        echo "⟳ /emergency-link-repair → ⚠️ MANUAL INTERVENTION REQUIRED 🎯 [${ELAPSED_TIME}s]"
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