#!/bin/bash

# Automated Command Counter with Precise Methodology and Validation
# Maintains accurate counts of commands in docs/commands/ and .claude/commands/
# Generates comprehensive reports with discrepancy detection

set -e

# Check bash version and upgrade if needed
if [ "${BASH_VERSION%%.*}" -lt 4 ]; then
    if command -v bash4 &> /dev/null; then
        exec bash4 "$0" "$@"
    elif command -v /usr/local/bin/bash &> /dev/null; then
        exec /usr/local/bin/bash "$0" "$@"
    else
        echo "Warning: This script requires bash 4.0+. Current version: $BASH_VERSION"
        echo "Some features may not work correctly."
    fi
fi

echo "🔢 Context Engineering - Automated Command Counter"
echo "================================================"
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
DOCS_COMMANDS_DIR="$BASE_DIR/docs/commands"
CLAUDE_COMMANDS_DIR="$BASE_DIR/.claude/commands"
RESULTS_DIR="$BASE_DIR/scripts/results"
REGISTRY_FILE="$BASE_DIR/.claude/config/command-registry.json"

# Create results directory
mkdir -p "$RESULTS_DIR/command-counts"

# Global counters
if [ "${BASH_VERSION%%.*}" -ge 4 ]; then
    declare -A command_counts
    declare -A category_counts
    declare -A discrepancies
else
    # Fallback for older bash versions
    echo "Warning: Using bash version $BASH_VERSION. Some features may be limited."
fi
total_commands=0
total_discrepancies=0

# Timestamp for reports
TIMESTAMP=$(date -Iseconds)
REPORT_DATE=$(date "+%Y%m%d-%H%M%S")

# Progress indicator
show_section_header() {
    local section_name="$1"
    echo ""
    echo -e "${BOLD}${PURPLE}━━━ $section_name ━━━${NC}"
    echo ""
}

# Command validation function
is_valid_command() {
    local file="$1"
    
    # Skip if not markdown file
    [[ "$file" != *.md ]] && return 1
    
    # Skip README files
    [[ "$(basename "$file")" == "README.md" ]] && return 1
    
    # Skip backup directories
    [[ "$file" =~ \.backup\. ]] && return 1
    
    # Skip archived directories
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
    local location_key="$2"
    local count=0
    
    echo -e "${CYAN}📁 Analyzing directory: $directory${NC}"
    
    if [ ! -d "$directory" ]; then
        echo -e "${RED}❌ Directory not found: $directory${NC}"
        return 1
    fi
    
    # Initialize category counters for this location
    declare -A local_categories
    local_categories["behavioral"]=0
    local_categories["executable"]=0
    local_categories["cores"]=0
    local_categories["shared"]=0
    local_categories["other"]=0
    
    # Find all markdown files
    while IFS= read -r -d '' file; do
        if is_valid_command "$file"; then
            count=$((count + 1))
            
            # Determine category
            local category="other"
            if [[ "$file" =~ /behavioral/ ]]; then
                category="behavioral"
            elif [[ "$file" =~ /executable/ ]]; then
                category="executable"
            elif [[ "$file" =~ /cores/ ]]; then
                category="cores"
            elif [[ "$file" =~ /shared/ ]]; then
                category="shared"
            fi
            
            local_categories["$category"]=$((local_categories["$category"] + 1))
            
            # Store relative path for reporting
            local relative_path="${file#$BASE_DIR/}"
            command_counts["${location_key}_files"]+="$relative_path|"
            
            echo -e "  ${GREEN}✓${NC} $relative_path [$category]"
        fi
    done < <(find "$directory" -name "*.md" -type f -print0)
    
    # Store counts
    command_counts["${location_key}_total"]=$count
    for category in "${!local_categories[@]}"; do
        command_counts["${location_key}_${category}"]=${local_categories["$category"]}
        category_counts["${category}_${location_key}"]=${local_categories["$category"]}
    done
    
    echo -e "${BOLD}📊 $location_key Total: ${GREEN}$count${NC} commands${NC}"
    echo -e "   • Behavioral: ${local_categories["behavioral"]}"
    echo -e "   • Executable: ${local_categories["executable"]}"
    echo -e "   • Cores: ${local_categories["cores"]}"
    echo -e "   • Shared: ${local_categories["shared"]}"
    echo -e "   • Other: ${local_categories["other"]}"
    
    return 0
}

# Detect discrepancies between directories
detect_discrepancies() {
    show_section_header "DISCREPANCY DETECTION"
    
    local docs_total=${command_counts["docs_total"]}
    local claude_total=${command_counts["claude_total"]}
    
    # Total count discrepancy
    if [ "$docs_total" -ne "$claude_total" ]; then
        local diff=$((docs_total - claude_total))
        discrepancies["total_count"]="docs:$docs_total vs claude:$claude_total (diff:$diff)"
        total_discrepancies=$((total_discrepancies + 1))
        echo -e "${YELLOW}⚠️ Total count discrepancy: docs($docs_total) vs claude($claude_total)${NC}"
    else
        echo -e "${GREEN}✅ Total counts match: $docs_total commands in both locations${NC}"
    fi
    
    # Category-wise discrepancies
    for category in behavioral executable cores shared other; do
        local docs_count=${command_counts["docs_${category}"]}
        local claude_count=${command_counts["claude_${category}"]}
        
        if [ "$docs_count" -ne "$claude_count" ]; then
            local diff=$((docs_count - claude_count))
            discrepancies["${category}_count"]="docs:$docs_count vs claude:$claude_count (diff:$diff)"
            total_discrepancies=$((total_discrepancies + 1))
            echo -e "${YELLOW}⚠️ $category discrepancy: docs($docs_count) vs claude($claude_count)${NC}"
        else
            echo -e "${GREEN}✅ $category counts match: $docs_count commands${NC}"
        fi
    done
    
    # File-level comparison (detect missing files)
    local docs_files="${command_counts["docs_files"]}"
    local claude_files="${command_counts["claude_files"]}"
    
    # Convert to arrays for comparison
    IFS='|' read -ra docs_array <<< "$docs_files"
    IFS='|' read -ra claude_array <<< "$claude_files"
    
    # Check for files in docs but not in claude
    local missing_in_claude=()
    for file in "${docs_array[@]}"; do
        if [[ -n "$file" ]]; then
            local claude_equivalent="${file/docs\/commands/.claude\/commands}"
            if [[ ! " ${claude_array[@]} " =~ " ${claude_equivalent} " ]]; then
                missing_in_claude+=("$file")
            fi
        fi
    done
    
    # Check for files in claude but not in docs
    local missing_in_docs=()
    for file in "${claude_array[@]}"; do
        if [[ -n "$file" ]]; then
            local docs_equivalent="${file/.claude\/commands/docs\/commands}"
            if [[ ! " ${docs_array[@]} " =~ " ${docs_equivalent} " ]]; then
                missing_in_docs+=("$file")
            fi
        fi
    done
    
    # Report file discrepancies
    if [ ${#missing_in_claude[@]} -gt 0 ]; then
        echo -e "${YELLOW}📂 Files in docs/commands but missing in .claude/commands:${NC}"
        for file in "${missing_in_claude[@]}"; do
            echo -e "  • $file"
        done
        discrepancies["missing_in_claude"]="${#missing_in_claude[@]} files"
        total_discrepancies=$((total_discrepancies + 1))
    fi
    
    if [ ${#missing_in_docs[@]} -gt 0 ]; then
        echo -e "${YELLOW}📂 Files in .claude/commands but missing in docs/commands:${NC}"
        for file in "${missing_in_docs[@]}"; do
            echo -e "  • $file"
        done
        discrepancies["missing_in_docs"]="${#missing_in_docs[@]} files"
        total_discrepancies=$((total_discrepancies + 1))
    fi
    
    if [ ${#missing_in_claude[@]} -eq 0 ] && [ ${#missing_in_docs[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All files present in both locations${NC}"
    fi
}

# Validate against registry
validate_against_registry() {
    show_section_header "REGISTRY VALIDATION"
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        echo -e "${YELLOW}⚠️ Registry file not found: $REGISTRY_FILE${NC}"
        return 1
    fi
    
    # Extract registry counts
    local registry_atomic=$(jq -r '.commands.atomic | length' "$REGISTRY_FILE")
    local registry_orchestrators=$(jq -r '.commands.orchestrators | length' "$REGISTRY_FILE")
    local registry_meta=$(jq -r '.commands.meta | length' "$REGISTRY_FILE")
    local registry_system=$(jq -r '.commands.system | length' "$REGISTRY_FILE")
    local registry_total=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE")
    
    echo -e "${CYAN}📋 Registry counts:${NC}"
    echo -e "   • Atomic: $registry_atomic"
    echo -e "   • Orchestrators: $registry_orchestrators"
    echo -e "   • Meta: $registry_meta"
    echo -e "   • System: $registry_system"
    echo -e "   • Total: $registry_total"
    
    # Compare with our counts
    local our_total=${command_counts["claude_total"]}
    if [ "$registry_total" -ne "$our_total" ]; then
        local diff=$((registry_total - our_total))
        discrepancies["registry_total"]="registry:$registry_total vs counted:$our_total (diff:$diff)"
        total_discrepancies=$((total_discrepancies + 1))
        echo -e "${YELLOW}⚠️ Registry total ($registry_total) doesn't match counted total ($our_total)${NC}"
    else
        echo -e "${GREEN}✅ Registry total matches counted total: $registry_total${NC}"
    fi
}

# Generate JSON report
generate_json_report() {
    local report_file="$RESULTS_DIR/command-counts/command-count-report-${REPORT_DATE}.json"
    
    # Build discrepancies JSON
    local discrepancies_json="{"
    local first=true
    for key in "${!discrepancies[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            discrepancies_json="$discrepancies_json,"
        fi
        discrepancies_json="$discrepancies_json\"$key\":\"${discrepancies[$key]}\""
    done
    discrepancies_json="$discrepancies_json}"
    
    # Registry validation
    local registry_validation="null"
    if [ -f "$REGISTRY_FILE" ]; then
        local registry_total=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE" 2>/dev/null || echo "0")
        registry_validation="{\"registry_total\":$registry_total,\"counted_total\":${command_counts["claude_total"]},\"matches\":$([ "$registry_total" -eq "${command_counts["claude_total"]}" ] && echo "true" || echo "false")}"
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
        "total": ${command_counts["docs_total"]},
        "behavioral": ${command_counts["docs_behavioral"]},
        "executable": ${command_counts["docs_executable"]},
        "cores": ${command_counts["docs_cores"]},
        "shared": ${command_counts["docs_shared"]},
        "other": ${command_counts["docs_other"]}
      },
      "claude_commands": {
        "total": ${command_counts["claude_total"]},
        "behavioral": ${command_counts["claude_behavioral"]},
        "executable": ${command_counts["claude_executable"]},
        "cores": ${command_counts["claude_cores"]},
        "shared": ${command_counts["claude_shared"]},
        "other": ${command_counts["claude_other"]}
      }
    },
    "discrepancies": {
      "total_found": $total_discrepancies,
      "details": $discrepancies_json
    },
    "registry_validation": $registry_validation,
    "summary": {
      "total_unique_commands": ${command_counts["claude_total"]},
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

    echo -e "📁 JSON report generated: ${CYAN}$report_file${NC}"
    return 0
}

# Generate human-readable summary
generate_summary_report() {
    local summary_file="$RESULTS_DIR/command-counts/command-count-summary-${REPORT_DATE}.md"
    
    cat > "$summary_file" << EOF
# Command Count Report - $(date)

## Summary
- **Total Commands (docs/)**: ${command_counts["docs_total"]}
- **Total Commands (.claude/)**: ${command_counts["claude_total"]}
- **Total Discrepancies**: $total_discrepancies
- **Validation Status**: $([ $total_discrepancies -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")

## Category Breakdown

### docs/commands/
- Behavioral: ${command_counts["docs_behavioral"]}
- Executable: ${command_counts["docs_executable"]}
- Cores: ${command_counts["docs_cores"]}
- Shared: ${command_counts["docs_shared"]}
- Other: ${command_counts["docs_other"]}

### .claude/commands/
- Behavioral: ${command_counts["claude_behavioral"]}
- Executable: ${command_counts["claude_executable"]}
- Cores: ${command_counts["claude_cores"]}
- Shared: ${command_counts["claude_shared"]}
- Other: ${command_counts["claude_other"]}

## Discrepancies
$([ $total_discrepancies -eq 0 ] && echo "✅ No discrepancies detected - directories are synchronized" || echo "⚠️ Discrepancies detected:")

$(for key in "${!discrepancies[@]}"; do
    echo "- **$key**: ${discrepancies[$key]}"
done)

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
Generated by: Automated Command Counter v1.0
EOF

    echo -e "📁 Summary report generated: ${CYAN}$summary_file${NC}"
    return 0
}

# Main execution
main() {
    echo -e "${BOLD}🔍 AUTOMATED COMMAND COUNTING ANALYSIS${NC}"
    echo -e "${BOLD}=====================================${NC}"
    echo ""
    echo -e "🕐 Started at: ${CYAN}$(date)${NC}"
    echo -e "📂 Base directory: ${CYAN}$BASE_DIR${NC}"
    echo -e "📊 Results directory: ${CYAN}$RESULTS_DIR/command-counts${NC}"
    
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
    echo ""
    echo -e "${BOLD}${PURPLE}🏁 COMMAND COUNTING COMPLETE${NC}"
    echo -e "${BOLD}==============================${NC}"
    echo -e "Total Commands (docs): ${GREEN}${command_counts["docs_total"]}${NC}"
    echo -e "Total Commands (claude): ${GREEN}${command_counts["claude_total"]}${NC}"
    echo -e "Discrepancies Found: ${YELLOW}$total_discrepancies${NC}"
    echo -e "Validation Status: $([ $total_discrepancies -eq 0 ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
    echo ""
    
    # Exit with appropriate code for CI/CD integration
    if [ $total_discrepancies -gt 0 ]; then
        echo -e "${YELLOW}⚠️ DISCREPANCIES DETECTED - REVIEW REQUIRED${NC}"
        exit 1
    else
        echo -e "${GREEN}🎉 COMMAND COUNTING SUCCESSFUL${NC}"
        echo -e "${GREEN}✅ All directories synchronized and validated!${NC}"
        exit 0
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Automated Command Counter - Context Engineering"
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
        # Run counting silently and generate only JSON
        exec > /dev/null 2>&1
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs"
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude"
        detect_discrepancies
        validate_against_registry
        generate_json_report
        exit $?
        ;;
    "--summary-only")
        # Run counting silently and generate only summary
        exec > /dev/null 2>&1
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs"
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude"
        detect_discrepancies
        validate_against_registry
        generate_summary_report
        exit $?
        ;;
    "--quiet")
        # Suppress progress output but show final results
        exec 3>&1
        exec > /dev/null 2>&1
        count_commands_in_directory "$DOCS_COMMANDS_DIR" "docs"
        count_commands_in_directory "$CLAUDE_COMMANDS_DIR" "claude"
        detect_discrepancies
        validate_against_registry
        generate_json_report
        generate_summary_report
        exec 1>&3
        echo "Command counting complete. Check results directory for reports."
        exit $?
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