#!/bin/bash

# Automated Command Counter with Precise Methodology and Validation
# Compatible with macOS default bash 3.2+
# Maintains accurate counts of commands in docs/commands/ and .claude/commands/
# Generates comprehensive reports with discrepancy detection

set -e

echo "⟳ /automated-command-counter-v2 → Context Engineering - Automated Command Counter v2 🎯"
echo "===================================================="
echo ""

# Timing for reports
START_TIME=$(date +%s)

# System paths
BASE_DIR="/Users/nalve/claude-context-engineering"
DOCS_COMMANDS_DIR="$BASE_DIR/docs/commands"
CLAUDE_COMMANDS_DIR="$BASE_DIR/.claude/commands"
RESULTS_DIR="$BASE_DIR/scripts/results"
REGISTRY_FILE="$BASE_DIR/.claude/config/command-registry.json"

# Create results directory
mkdir -p "$RESULTS_DIR/command-counts"

# Global counters (using simple variables instead of associative arrays)
docs_total=0
docs_behavioral=0
docs_executable=0
docs_cores=0
docs_shared=0
docs_other=0

claude_total=0
claude_behavioral=0
claude_executable=0
claude_cores=0
claude_shared=0
claude_other=0

total_discrepancies=0

# Timestamp for reports
TIMESTAMP=$(date -Iseconds)
REPORT_DATE=$(date "+%Y%m%d-%H%M%S")

# Temporary files for storing results
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

DOCS_FILES="$TEMP_DIR/docs_files.txt"
CLAUDE_FILES="$TEMP_DIR/claude_files.txt"
DISCREPANCIES_FILE="$TEMP_DIR/discrepancies.txt"

# Progress indicator
show_section_header() {
    local section_name="$1"
    echo ""
    echo "⟳ /automated-command-counter-v2 → $section_name 🎯"
    echo ""
}

# Command validation function - aligned with unidirectional sync exclusions
is_valid_command() {
    local file="$1"
    local basename_file=$(basename "$file")
    
    # Skip if not markdown file
    [[ "$file" != *.md ]] && return 1
    
    # Skip README files
    [[ "$basename_file" == "README.md" ]] && return 1
    
    # Skip analysis files (aligned with unidirectional exclusions)
    [[ "$basename_file" == "command-structure-analysis-matrix.md" ]] && return 1
    [[ "$basename_file" =~ -analysis.*\.md$ ]] && return 1
    [[ "$basename_file" =~ -matrix\.md$ ]] && return 1
    
    # Skip review directories
    [[ "$file" =~ /review/ ]] && return 1
    
    # Skip backup and archive files
    [[ "$file" =~ \.backup ]] && return 1
    [[ "$file" =~ \.archive ]] && return 1
    [[ "$file" =~ /\.archived/ ]] && return 1
    
    # Skip examples directory (non-executable commands)
    [[ "$file" =~ /examples/ ]] && return 1
    
    # Must contain trigger or command structure
    if [ -f "$file" ]; then
        # Check for command triggers or meta-command structure
        if grep -q "^## Trigger" "$file" 2>/dev/null || \
           grep -q "^# " "$file" 2>/dev/null || \
           grep -q "^## " "$file" 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Count commands in a directory
count_commands_in_directory() {
    local directory="$1"
    local location="$2"
    local count=0
    local behavioral_count=0
    local executable_count=0
    local cores_count=0
    local shared_count=0
    local other_count=0
    
    echo "⟳ /automated-command-counter-v2 → 📁 Analyzing directory: $directory 🎯"
    
    if [ ! -d "$directory" ]; then
        echo "⟳ /automated-command-counter-v2 → ❌ Directory not found: $directory 🎯"
        return 1
    fi
    
    # Store files for this location
    local files_list="$TEMP_DIR/${location}_files.txt"
    > "$files_list"
    
    # Find all markdown files
    while IFS= read -r file; do
        if is_valid_command "$file"; then
            count=$((count + 1))
            
            # Determine category
            local category="other"
            if [[ "$file" =~ /behavioral/ ]]; then
                category="behavioral"
                behavioral_count=$((behavioral_count + 1))
            elif [[ "$file" =~ /executable/ ]]; then
                category="executable"
                executable_count=$((executable_count + 1))
            elif [[ "$file" =~ /cores/ ]]; then
                category="cores"
                cores_count=$((cores_count + 1))
            elif [[ "$file" =~ /shared/ ]]; then
                category="shared"
                shared_count=$((shared_count + 1))
            else
                other_count=$((other_count + 1))
            fi
            
            # Store relative path for reporting
            local relative_path="${file#$BASE_DIR/}"
            echo "$relative_path" >> "$files_list"
            
            echo "⟳ /automated-command-counter-v2 → ✓ $relative_path [$category] 🎯"
        fi
    done < <(find "$directory" -name "*.md" -type f)
    
    # Store counts in global variables
    if [ "$location" = "docs" ]; then
        docs_total=$count
        docs_behavioral=$behavioral_count
        docs_executable=$executable_count
        docs_cores=$cores_count
        docs_shared=$shared_count
        docs_other=$other_count
    else
        claude_total=$count
        claude_behavioral=$behavioral_count
        claude_executable=$executable_count
        claude_cores=$cores_count
        claude_shared=$shared_count
        claude_other=$other_count
    fi
    
    echo "⟳ /automated-command-counter-v2 → 📊 $location Total: $count commands 🎯"
    echo "⟳ /automated-command-counter-v2 → • Behavioral: $behavioral_count 🎯"
    echo "⟳ /automated-command-counter-v2 → • Executable: $executable_count 🎯"
    echo "⟳ /automated-command-counter-v2 → • Cores: $cores_count 🎯"
    echo "⟳ /automated-command-counter-v2 → • Shared: $shared_count 🎯"
    echo "⟳ /automated-command-counter-v2 → • Other: $other_count 🎯"
    
    return 0
}

# Detect discrepancies between directories
detect_discrepancies() {
    show_section_header "DISCREPANCY DETECTION"
    
    local discrepancy_count=0
    > "$DISCREPANCIES_FILE"
    
    # Total count discrepancy
    if [ "$docs_total" -ne "$claude_total" ]; then
        local diff=$((docs_total - claude_total))
        echo "total_count:docs:$docs_total vs claude:$claude_total (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Total count discrepancy: docs($docs_total) vs claude($claude_total) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Total counts match: $docs_total commands in both locations 🎯"
    fi
    
    # Category-wise discrepancies
    if [ "$docs_behavioral" -ne "$claude_behavioral" ]; then
        local diff=$((docs_behavioral - claude_behavioral))
        echo "behavioral_count:docs:$docs_behavioral vs claude:$claude_behavioral (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Behavioral discrepancy: docs($docs_behavioral) vs claude($claude_behavioral) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Behavioral counts match: $docs_behavioral commands 🎯"
    fi
    
    if [ "$docs_executable" -ne "$claude_executable" ]; then
        local diff=$((docs_executable - claude_executable))
        echo "executable_count:docs:$docs_executable vs claude:$claude_executable (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Executable discrepancy: docs($docs_executable) vs claude($claude_executable) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Executable counts match: $docs_executable commands 🎯"
    fi
    
    if [ "$docs_cores" -ne "$claude_cores" ]; then
        local diff=$((docs_cores - claude_cores))
        echo "cores_count:docs:$docs_cores vs claude:$claude_cores (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Cores discrepancy: docs($docs_cores) vs claude($claude_cores) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Cores counts match: $docs_cores commands 🎯"
    fi
    
    if [ "$docs_shared" -ne "$claude_shared" ]; then
        local diff=$((docs_shared - claude_shared))
        echo "shared_count:docs:$docs_shared vs claude:$claude_shared (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Shared discrepancy: docs($docs_shared) vs claude($claude_shared) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Shared counts match: $docs_shared commands 🎯"
    fi
    
    if [ "$docs_other" -ne "$claude_other" ]; then
        local diff=$((docs_other - claude_other))
        echo "other_count:docs:$docs_other vs claude:$claude_other (diff:$diff)" >> "$DISCREPANCIES_FILE"
        discrepancy_count=$((discrepancy_count + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Other discrepancy: docs($docs_other) vs claude($claude_other) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Other counts match: $docs_other commands 🎯"
    fi
    
    # File-level comparison
    local docs_files_list="$TEMP_DIR/docs_files.txt"
    local claude_files_list="$TEMP_DIR/claude_files.txt"
    
    if [ -f "$docs_files_list" ] && [ -f "$claude_files_list" ]; then
        # Check for files in docs but not in claude
        local missing_in_claude=0
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                local claude_equivalent="${file/docs\/commands/.claude\/commands}"
                if ! grep -q "^$claude_equivalent$" "$claude_files_list" 2>/dev/null; then
                    missing_in_claude=$((missing_in_claude + 1))
                fi
            fi
        done < "$docs_files_list"
        
        # Check for files in claude but not in docs
        local missing_in_docs=0
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                local docs_equivalent="${file/.claude\/commands/docs\/commands}"
                if ! grep -q "^$docs_equivalent$" "$docs_files_list" 2>/dev/null; then
                    missing_in_docs=$((missing_in_docs + 1))
                fi
            fi
        done < "$claude_files_list"
        
        if [ $missing_in_claude -gt 0 ]; then
            echo "missing_in_claude:$missing_in_claude files" >> "$DISCREPANCIES_FILE"
            discrepancy_count=$((discrepancy_count + 1))
            echo "⟳ /automated-command-counter-v2 → 📂 $missing_in_claude files in docs/commands but missing in .claude/commands 🎯"
        fi
        
        if [ $missing_in_docs -gt 0 ]; then
            echo "missing_in_docs:$missing_in_docs files" >> "$DISCREPANCIES_FILE"
            discrepancy_count=$((discrepancy_count + 1))
            echo "⟳ /automated-command-counter-v2 → 📂 $missing_in_docs files in .claude/commands but missing in docs/commands 🎯"
        fi
        
        if [ $missing_in_claude -eq 0 ] && [ $missing_in_docs -eq 0 ]; then
            echo "⟳ /automated-command-counter-v2 → ✅ All files present in both locations 🎯"
        fi
    fi
    
    total_discrepancies=$discrepancy_count
}

# Validate against registry
validate_against_registry() {
    show_section_header "REGISTRY VALIDATION"
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        echo "⟳ /automated-command-counter-v2 → ⚠️ Registry file not found: $REGISTRY_FILE 🎯"
        return 1
    fi
    
    # Extract registry counts
    local registry_atomic=$(jq -r '.commands.atomic | length' "$REGISTRY_FILE" 2>/dev/null || echo "0")
    local registry_orchestrators=$(jq -r '.commands.orchestrators | length' "$REGISTRY_FILE" 2>/dev/null || echo "0")
    local registry_meta=$(jq -r '.commands.meta | length' "$REGISTRY_FILE" 2>/dev/null || echo "0")
    local registry_system=$(jq -r '.commands.system | length' "$REGISTRY_FILE" 2>/dev/null || echo "0")
    local registry_total=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE" 2>/dev/null || echo "0")
    
    echo "⟳ /automated-command-counter-v2 → 📋 Registry counts 🎯"
    echo "⟳ /automated-command-counter-v2 → • Atomic: $registry_atomic 🎯"
    echo "⟳ /automated-command-counter-v2 → • Orchestrators: $registry_orchestrators 🎯"
    echo "⟳ /automated-command-counter-v2 → • Meta: $registry_meta 🎯"
    echo "⟳ /automated-command-counter-v2 → • System: $registry_system 🎯"
    echo "⟳ /automated-command-counter-v2 → • Total: $registry_total 🎯"
    
    # Compare with our counts
    if [ "$registry_total" -ne "$claude_total" ]; then
        local diff=$((registry_total - claude_total))
        echo "registry_total:registry:$registry_total vs counted:$claude_total (diff:$diff)" >> "$DISCREPANCIES_FILE"
        total_discrepancies=$((total_discrepancies + 1))
        echo "⟳ /automated-command-counter-v2 → ⚠️ Registry total ($registry_total) doesn't match counted total ($claude_total) 🎯"
    else
        echo "⟳ /automated-command-counter-v2 → ✅ Registry total matches counted total: $registry_total 🎯"
    fi
}

# Generate JSON report
generate_json_report() {
    local report_file="$RESULTS_DIR/command-counts/command-count-report-${REPORT_DATE}.json"
    
    # Build discrepancies JSON
    local discrepancies_json="{"
    local first=true
    if [ -f "$DISCREPANCIES_FILE" ]; then
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                local key="${line%%:*}"
                local value="${line#*:}"
                if [ "$first" = true ]; then
                    first=false
                else
                    discrepancies_json="$discrepancies_json,"
                fi
                discrepancies_json="$discrepancies_json\"$key\":\"$value\""
            fi
        done < "$DISCREPANCIES_FILE"
    fi
    discrepancies_json="$discrepancies_json}"
    
    # Registry validation
    local registry_validation="null"
    if [ -f "$REGISTRY_FILE" ]; then
        local registry_total=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE" 2>/dev/null || echo "0")
        registry_validation="{\"registry_total\":$registry_total,\"counted_total\":$claude_total,\"matches\":$([ "$registry_total" -eq "$claude_total" ] && echo "true" || echo "false")}"
    fi
    
    # Generate comprehensive report
    cat > "$report_file" << EOF
{
  "command_count_report": {
    "timestamp": "$TIMESTAMP",
    "report_date": "$REPORT_DATE",
    "methodology": {
      "description": "Automated command counting with validation",
      "criteria": [
        "Must be .md file",
        "Must not be README.md",
        "Must not be in backup/archived directories",
        "Must not be in examples directory",
        "Must contain command structure or triggers"
      ],
      "directories_analyzed": [
        "docs/commands/",
        ".claude/commands/"
      ]
    },
    "counts": {
      "docs_commands": {
        "total": $docs_total,
        "behavioral": $docs_behavioral,
        "executable": $docs_executable,
        "cores": $docs_cores,
        "shared": $docs_shared,
        "other": $docs_other
      },
      "claude_commands": {
        "total": $claude_total,
        "behavioral": $claude_behavioral,
        "executable": $claude_executable,
        "cores": $claude_cores,
        "shared": $claude_shared,
        "other": $claude_other
      }
    },
    "discrepancies": {
      "total_found": $total_discrepancies,
      "details": $discrepancies_json
    },
    "registry_validation": $registry_validation,
    "summary": {
      "total_unique_commands": $claude_total,
      "synchronization_status": "$([ $total_discrepancies -eq 0 ] && echo "SYNCHRONIZED" || echo "DISCREPANCIES_DETECTED")",
      "validation_status": "$([ $total_discrepancies -eq 0 ] && echo "PASSED" || echo "FAILED")",
      "recommendations": [
        $([ $total_discrepancies -gt 0 ] && echo "\"Resolve $total_discrepancies discrepancies for full synchronization\"," || echo "")
        "Regular automated counting maintains accuracy",
        "Integration with CI/CD ensures continuous validation",
        "Registry synchronization maintains system coherence"
      ]
    },
    "ci_cd_integration": {
      "exit_code": $([ $total_discrepancies -eq 0 ] && echo "0" || echo "1"),
      "suitable_for_automation": true,
      "monitoring_ready": true
    }
  }
}
EOF

    echo "⟳ /automated-command-counter-v2 → 📁 JSON report generated: $report_file 🎯"
    return 0
}

# Generate human-readable summary
generate_summary_report() {
    local summary_file="$RESULTS_DIR/command-counts/command-count-summary-${REPORT_DATE}.md"
    
    cat > "$summary_file" << EOF
# Command Count Report - $(date)

## Summary
- **Total Commands (docs/)**: $docs_total
- **Total Commands (.claude/)**: $claude_total
- **Total Discrepancies**: $total_discrepancies
- **Validation Status**: $([ $total_discrepancies -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")

## Category Breakdown

### docs/commands/
- Behavioral: $docs_behavioral
- Executable: $docs_executable
- Cores: $docs_cores
- Shared: $docs_shared
- Other: $docs_other

### .claude/commands/
- Behavioral: $claude_behavioral
- Executable: $claude_executable
- Cores: $claude_cores
- Shared: $claude_shared
- Other: $claude_other

## Discrepancies
$([ $total_discrepancies -eq 0 ] && echo "✅ No discrepancies detected - directories are synchronized" || echo "⚠️ $total_discrepancies discrepancies detected")

$(if [ -f "$DISCREPANCIES_FILE" ]; then
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            local key="${line%%:*}"
            local value="${line#*:}"
            echo "- **$key**: $value"
        fi
    done < "$DISCREPANCIES_FILE"
fi)

## Methodology
This report uses automated counting with the following criteria:
- Must be .md file
- Must not be README.md
- Must not be in backup/archived directories
- Must not be in examples directory
- Must contain command structure or triggers

## Recommendations
$([ $total_discrepancies -gt 0 ] && echo "1. Resolve $total_discrepancies discrepancies for full synchronization" || echo "1. Directories are synchronized - no action needed")
2. Integrate this script with CI/CD for continuous validation
3. Run regularly to maintain accuracy
4. Consider registry synchronization for complete system coherence

---
Generated by: Automated Command Counter v2.0
EOF

    echo "⟳ /automated-command-counter-v2 → 📁 Summary report generated: $summary_file 🎯"
    return 0
}

# Main execution
main() {
    echo "⟳ /automated-command-counter-v2 → 🔍 AUTOMATED COMMAND COUNTING ANALYSIS 🎯"
    echo "====================================="
    echo ""
    echo "⟳ /automated-command-counter-v2 → 🕐 Started at: $(date) 🎯"
    echo "⟳ /automated-command-counter-v2 → 📂 Base directory: $BASE_DIR 🎯"
    echo "⟳ /automated-command-counter-v2 → 📊 Results directory: $RESULTS_DIR/command-counts 🎯"
    
    # Count commands in docs/commands
    show_section_header "DOCS/COMMANDS ANALYSIS"
    count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs"
    
    # Count commands in .claude/commands
    show_section_header ".CLAUDE/COMMANDS ANALYSIS"
    count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude"
    
    # Detect discrepancies
    detect_discrepancies
    
    # Validate against registry
    validate_against_registry
    
    # Generate reports
    show_section_header "REPORT GENERATION"
    generate_json_report
    generate_summary_report
    
    # Final summary
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    echo ""
    echo "⟳ /automated-command-counter-v2 → 🏁 COMMAND COUNTING COMPLETE 🎯 [${ELAPSED_TIME}s]"
    echo "=============================="
    echo "⟳ /automated-command-counter-v2 → Total Commands (docs): $docs_total 🎯"
    echo "⟳ /automated-command-counter-v2 → Total Commands (claude): $claude_total 🎯"
    echo "⟳ /automated-command-counter-v2 → Discrepancies Found: $total_discrepancies 🎯"
    echo "⟳ /automated-command-counter-v2 → Validation Status: $([ $total_discrepancies -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") 🎯"
    echo ""
    
    # Exit with appropriate code for CI/CD integration
    if [ $total_discrepancies -gt 0 ]; then
        echo "⟳ /automated-command-counter-v2 → ⚠️ DISCREPANCIES DETECTED - REVIEW REQUIRED 🎯 [${ELAPSED_TIME}s]"
        exit 1
    else
        echo "⟳ /automated-command-counter-v2 → 🎉 COMMAND COUNTING SUCCESSFUL 🎯 [${ELAPSED_TIME}s]"
        echo "⟳ /automated-command-counter-v2 → ✅ All directories synchronized and validated! 🎯"
        exit 0
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Automated Command Counter v2 - Context Engineering"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --json-only    Generate only JSON report"
        echo "  --summary-only Generate only summary report"
        echo "  --quiet        Suppress progress output"
        echo ""
        echo "Exit codes:"
        echo "  0 - Success (no discrepancies)"
        echo "  1 - Discrepancies found"
        echo "  2 - Critical error"
        exit 0
        ;;
    "--json-only")
        # Run counting and generate only JSON
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs" > /dev/null 2>&1
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude" > /dev/null 2>&1
        detect_discrepancies > /dev/null 2>&1
        validate_against_registry > /dev/null 2>&1
        generate_json_report
        exit $([ $total_discrepancies -eq 0 ] && echo "0" || echo "1")
        ;;
    "--summary-only")
        # Run counting and generate only summary
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs" > /dev/null 2>&1
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude" > /dev/null 2>&1
        detect_discrepancies > /dev/null 2>&1
        validate_against_registry > /dev/null 2>&1
        generate_summary_report
        exit $([ $total_discrepancies -eq 0 ] && echo "0" || echo "1")
        ;;
    "--quiet")
        # Suppress progress output but show final results
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs" > /dev/null 2>&1
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude" > /dev/null 2>&1
        detect_discrepancies > /dev/null 2>&1
        validate_against_registry > /dev/null 2>&1
        generate_json_report > /dev/null 2>&1
        generate_summary_report > /dev/null 2>&1
        echo "⟳ /automated-command-counter-v2 → Command counting complete. Check results directory for reports 🎯"
        echo "⟳ /automated-command-counter-v2 → Total Commands (docs): $docs_total 🎯"
        echo "⟳ /automated-command-counter-v2 → Total Commands (claude): $claude_total 🎯"
        echo "⟳ /automated-command-counter-v2 → Discrepancies: $total_discrepancies 🎯"
        echo "⟳ /automated-command-counter-v2 → Status: $([ $total_discrepancies -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") 🎯"
        exit $([ $total_discrepancies -eq 0 ] && echo "0" || echo "1")
        ;;
    "")
        # Default: run full analysis
        main "$@"
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 2
        ;;
esac