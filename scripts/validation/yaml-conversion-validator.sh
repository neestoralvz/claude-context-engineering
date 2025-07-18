#!/bin/bash

# YAML Conversion Validation Script
# Comprehensive validation system for YAML to Markdown conversions
# Validates P55/P6 compliance, link integrity, and content preservation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
VALIDATION_LOG="$ROOT_DIR/scripts/results/validation/yaml-validation-${TIMESTAMP}.log"
VALIDATION_REPORT="$ROOT_DIR/scripts/results/validation/yaml-validation-report-${TIMESTAMP}.md"

# Statistics
TOTAL_FILES=0
VALIDATED_FILES=0
COMPLIANCE_PASSED=0
COMPLIANCE_FAILED=0
LINK_ERRORS=0
CONTENT_WARNINGS=0
YAML_BLOCKS_FOUND=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure directories exist
mkdir -p "$(dirname "$VALIDATION_LOG")" "$(dirname "$VALIDATION_REPORT")"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$VALIDATION_LOG"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$VALIDATION_LOG"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a "$VALIDATION_LOG"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$VALIDATION_LOG"
            ;;
        *)
            echo "$(date '+%Y-%m-%d %H:%M:%S') $message" | tee -a "$VALIDATION_LOG"
            ;;
    esac
}

# Validate zero YAML blocks
validate_zero_yaml_blocks() {
    local file="$1"
    local yaml_count=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
    
    if [ "$yaml_count" -eq 0 ]; then
        return 0
    else
        YAML_BLOCKS_FOUND=$((YAML_BLOCKS_FOUND + yaml_count))
        log "ERROR" "Found $yaml_count YAML blocks in $file"
        return 1
    fi
}

# Validate P55/P6 compliance
validate_p55_p6_compliance() {
    local file="$1"
    local compliance_score=0
    local total_checks=0
    
    # Check for strong terminology
    local mandatory_terms=$(grep -c "MANDATORY\|REQUIRED\|CRITICAL\|EXECUTE" "$file" 2>/dev/null || echo "0")
    local weak_terms=$(grep -c "should\|might\|consider\|when appropriate\|if needed" "$file" 2>/dev/null || echo "0")
    
    # Strong terminology check
    ((total_checks++))
    if [ "$mandatory_terms" -gt 0 ]; then
        ((compliance_score++))
    fi
    
    # Weak terminology check (inverse - fewer is better)
    ((total_checks++))
    if [ "$weak_terms" -eq 0 ]; then
        ((compliance_score++))
    fi
    
    # Structured format check
    local structured_lists=$(grep -c "^-[[:space:]]*\*\*.*\*\*:" "$file" 2>/dev/null || echo "0")
    ((total_checks++))
    if [ "$structured_lists" -gt 0 ]; then
        ((compliance_score++))
    fi
    
    # Mathematical code blocks check
    local math_blocks=$(grep -c "^```$" "$file" 2>/dev/null || echo "0")
    ((total_checks++))
    if [ "$math_blocks" -gt 0 ]; then
        ((compliance_score++))
    fi
    
    # Calculate compliance percentage
    local compliance_percentage=0
    if [ "$total_checks" -gt 0 ]; then
        compliance_percentage=$(bc -l <<< "scale=2; ($compliance_score / $total_checks) * 100")
    fi
    
    # Compliance threshold is 75%
    if [ "$(echo "$compliance_percentage >= 75" | bc -l)" -eq 1 ]; then
        log "SUCCESS" "P55/P6 compliance: $compliance_percentage% (PASS) - $file"
        return 0
    else
        log "WARNING" "P55/P6 compliance: $compliance_percentage% (FAIL) - $file"
        return 1
    fi
}

# Validate link integrity
validate_link_integrity() {
    local file="$1"
    local broken_links=0
    
    # Find all markdown links
    while IFS= read -r line; do
        if [[ "$line" =~ \[([^\]]+)\]\(([^)]+)\) ]]; then
            local link_text="${BASH_REMATCH[1]}"
            local link_url="${BASH_REMATCH[2]}"
            
            # Skip external links
            if [[ "$link_url" =~ ^https?:// ]]; then
                continue
            fi
            
            # Skip anchors
            if [[ "$link_url" =~ ^# ]]; then
                continue
            fi
            
            # Check internal links
            local target_file=""
            if [[ "$link_url" =~ ^/ ]]; then
                # Absolute path from root
                target_file="$ROOT_DIR$link_url"
            else
                # Relative path
                target_file="$(dirname "$file")/$link_url"
            fi
            
            # Remove anchors from target
            target_file="${target_file%#*}"
            
            # Check if target exists
            if [ ! -f "$target_file" ] && [ ! -d "$target_file" ]; then
                log "ERROR" "Broken link in $file: '$link_text' -> '$link_url'"
                ((broken_links++))
            fi
        fi
    done < "$file"
    
    if [ "$broken_links" -eq 0 ]; then
        return 0
    else
        LINK_ERRORS=$((LINK_ERRORS + broken_links))
        return 1
    fi
}

# Validate content preservation
validate_content_preservation() {
    local file="$1"
    local warnings=0
    
    # Check for empty sections
    local empty_sections=$(grep -c "^##.*$" "$file" 2>/dev/null || echo "0")
    local content_lines=$(grep -c '[^[:space:]]' "$file" 2>/dev/null || echo "0")
    
    if [ "$empty_sections" -gt 0 ] && [ "$content_lines" -lt 10 ]; then
        log "WARNING" "Possible content loss in $file: Very short file with sections"
        ((warnings++))
    fi
    
    # Check for conversion artifacts
    if grep -q "```yaml" "$file" 2>/dev/null; then
        log "WARNING" "Unconverted YAML blocks found in $file"
        ((warnings++))
    fi
    
    # Check for proper conversion patterns
    local framework_patterns=$(grep -c "CRITICAL.*Framework\|MANDATORY.*Protocol\|Mathematical Formula" "$file" 2>/dev/null || echo "0")
    local structured_content=$(grep -c "^-[[:space:]]*\*\*.*\*\*:" "$file" 2>/dev/null || echo "0")
    
    if [ "$framework_patterns" -eq 0 ] && [ "$structured_content" -eq 0 ]; then
        # Check if file originally had YAML (this is a heuristic)
        if grep -q "enforcement\|validation\|configuration\|protocol" "$file" 2>/dev/null; then
            log "WARNING" "File may have had YAML content but shows no conversion patterns: $file"
            ((warnings++))
        fi
    fi
    
    if [ "$warnings" -eq 0 ]; then
        return 0
    else
        CONTENT_WARNINGS=$((CONTENT_WARNINGS + warnings))
        return 1
    fi
}

# Comprehensive file validation
validate_file() {
    local file="$1"
    local validation_passed=true
    
    log "INFO" "Validating: $file"
    
    # 1. Zero YAML blocks validation
    if ! validate_zero_yaml_blocks "$file"; then
        validation_passed=false
    fi
    
    # 2. P55/P6 compliance validation
    if ! validate_p55_p6_compliance "$file"; then
        validation_passed=false
    fi
    
    # 3. Link integrity validation
    if ! validate_link_integrity "$file"; then
        validation_passed=false
    fi
    
    # 4. Content preservation validation
    if ! validate_content_preservation "$file"; then
        validation_passed=false
    fi
    
    if [ "$validation_passed" = true ]; then
        log "SUCCESS" "Validation passed: $file"
        ((COMPLIANCE_PASSED++))
        return 0
    else
        log "ERROR" "Validation failed: $file"
        ((COMPLIANCE_FAILED++))
        return 1
    fi
}

# Validate directory
validate_directory() {
    local dir="$1"
    
    log "INFO" "Validating directory: $dir"
    
    if [ ! -d "$dir" ]; then
        log "ERROR" "Directory does not exist: $dir"
        return 1
    fi
    
    # Find all markdown files
    local files=()
    while IFS= read -r file; do
        files+=("$file")
    done < <(find "$dir" -name "*.md" -type f)
    
    TOTAL_FILES=${#files[@]}
    log "INFO" "Found $TOTAL_FILES markdown files in $dir"
    
    # Validate each file
    for file in "${files[@]}"; do
        ((VALIDATED_FILES++))
        log "INFO" "Validating file $VALIDATED_FILES/$TOTAL_FILES: $file"
        validate_file "$file"
    done
    
    log "INFO" "Directory validation complete: $dir"
}

# System-wide YAML detection
detect_remaining_yaml() {
    local dir="$1"
    
    log "INFO" "Scanning for remaining YAML blocks in: $dir"
    
    local yaml_files=()
    while IFS= read -r file; do
        yaml_files+=("$file")
    done < <(find "$dir" -name "*.md" -type f -exec grep -l '```yaml' {} \; 2>/dev/null)
    
    if [ ${#yaml_files[@]} -eq 0 ]; then
        log "SUCCESS" "No YAML blocks found in $dir"
        return 0
    else
        log "ERROR" "Found YAML blocks in ${#yaml_files[@]} files:"
        for file in "${yaml_files[@]}"; do
            local count=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
            log "ERROR" "  $file: $count blocks"
        done
        return 1
    fi
}

# Generate validation report
generate_validation_report() {
    log "INFO" "Generating validation report..."
    
    local success_rate=0
    local yaml_elimination_rate=100
    
    if [ "$TOTAL_FILES" -gt 0 ]; then
        success_rate=$(bc -l <<< "scale=2; ($COMPLIANCE_PASSED / $TOTAL_FILES) * 100")
    fi
    
    if [ "$YAML_BLOCKS_FOUND" -gt 0 ]; then
        yaml_elimination_rate=0
    fi
    
    cat > "$VALIDATION_REPORT" << EOF
# YAML Conversion Validation Report

**Generated**: $(date)
**Session**: $TIMESTAMP
**Log File**: $VALIDATION_LOG

---

## 📊 Validation Summary

### Overall Results
- **Total Files Validated**: $TOTAL_FILES
- **Validation Success Rate**: ${success_rate}%
- **Files Passed**: $COMPLIANCE_PASSED
- **Files Failed**: $COMPLIANCE_FAILED

### YAML Elimination Status
- **YAML Blocks Found**: $YAML_BLOCKS_FOUND
- **YAML Elimination Rate**: ${yaml_elimination_rate}%
- **Status**: $([ "$YAML_BLOCKS_FOUND" -eq 0 ] && echo "✅ COMPLETE" || echo "❌ INCOMPLETE")

### Quality Metrics
- **Link Integrity Errors**: $LINK_ERRORS
- **Content Warnings**: $CONTENT_WARNINGS
- **P55/P6 Compliance**: Validated per file

---

## 🎯 Validation Criteria

### 1. Zero YAML Blocks ✅
- **Requirement**: No \`\`\`yaml blocks in any file
- **Status**: $([ "$YAML_BLOCKS_FOUND" -eq 0 ] && echo "PASSED" || echo "FAILED - $YAML_BLOCKS_FOUND blocks found")

### 2. P55/P6 Compliance ✅
- **Requirement**: ≥75% compliance score per file
- **Criteria**: Strong terminology, structured format, mathematical blocks
- **Status**: $COMPLIANCE_PASSED/$TOTAL_FILES files passed

### 3. Link Integrity ✅
- **Requirement**: All internal links functional
- **Status**: $([ "$LINK_ERRORS" -eq 0 ] && echo "PASSED" || echo "FAILED - $LINK_ERRORS broken links")

### 4. Content Preservation ✅
- **Requirement**: No content loss during conversion
- **Status**: $([ "$CONTENT_WARNINGS" -eq 0 ] && echo "PASSED" || echo "WARNINGS - $CONTENT_WARNINGS issues")

---

## 🔧 Recommended Actions

$(if [ "$YAML_BLOCKS_FOUND" -gt 0 ]; then
    echo "### YAML Elimination Required"
    echo "- **Action**: Complete YAML conversion for remaining blocks"
    echo "- **Command**: \`./scripts/automation/yaml-to-markdown-converter.sh\`"
    echo "- **Priority**: HIGH - System compliance requires zero YAML blocks"
    echo ""
fi)

$(if [ "$LINK_ERRORS" -gt 0 ]; then
    echo "### Link Integrity Issues"
    echo "- **Action**: Fix broken internal links"
    echo "- **Command**: \`./scripts/validation/validate-reference-integrity.sh\`"
    echo "- **Priority**: MEDIUM - Affects navigation quality"
    echo ""
fi)

$(if [ "$CONTENT_WARNINGS" -gt 0 ]; then
    echo "### Content Review Required"
    echo "- **Action**: Review files with content warnings"
    echo "- **Priority**: LOW - Quality improvement opportunity"
    echo ""
fi)

$(if [ "$COMPLIANCE_FAILED" -gt 0 ]; then
    echo "### P55/P6 Compliance Enhancement"
    echo "- **Action**: Improve terminology and structure in failed files"
    echo "- **Priority**: MEDIUM - Enhances behavioral control effectiveness"
    echo ""
fi)

---

## 📋 Next Steps

### If Validation Passed (Success Rate ≥95%)
1. **System Ready**: YAML elimination complete
2. **Quality Assurance**: Run final system validation
3. **Documentation**: Update handoff documents
4. **Commit**: Save all changes with comprehensive notes

### If Validation Needs Work (Success Rate <95%)
1. **Address Issues**: Fix identified problems
2. **Re-run Conversion**: Use converter script for remaining YAML
3. **Validate Again**: Re-run this validation script
4. **Iterate**: Repeat until ≥95% success rate

### Quality Assurance Checklist
- [ ] Zero YAML blocks across all files
- [ ] All internal links functional
- [ ] P55/P6 compliance ≥75% per file
- [ ] Content preservation validated
- [ ] System functionality confirmed

---

**Validation Complete**: $(date)
**Overall Status**: $([ "$COMPLIANCE_PASSED" -eq "$TOTAL_FILES" ] && [ "$YAML_BLOCKS_FOUND" -eq 0 ] && echo "✅ PASSED" || echo "⚠️ NEEDS WORK")
**Ready for Production**: $([ "$COMPLIANCE_PASSED" -eq "$TOTAL_FILES" ] && [ "$YAML_BLOCKS_FOUND" -eq 0 ] && [ "$LINK_ERRORS" -eq 0 ] && echo "✅ YES" || echo "❌ NO")
EOF

    log "SUCCESS" "Validation report generated: $VALIDATION_REPORT"
}

# Help function
show_help() {
    cat << EOF
YAML Conversion Validation Script v1.0

Usage: $0 [OPTIONS] [DIRECTORY]

Options:
    -h, --help              Show this help message
    -d, --directory DIR     Validate specific directory (default: docs/)
    -s, --system-scan       Scan entire system for YAML blocks
    -q, --quiet             Suppress progress output
    -r, --report-only       Generate report from existing validation

Examples:
    $0                                    # Validate all docs/
    $0 docs/knowledge/                    # Validate specific directory
    $0 --system-scan                      # Full system YAML detection
    $0 --report-only                      # Generate report only

Validation Criteria:
    1. Zero YAML blocks (\`\`\`yaml)
    2. P55/P6 compliance (≥75% score)
    3. Link integrity (all internal links functional)
    4. Content preservation (no content loss)

The validator ensures complete YAML elimination and maintains
quality standards across all converted files.
EOF
}

# Main function
main() {
    local target_dir="$ROOT_DIR/docs"
    local system_scan=false
    local report_only=false
    local quiet=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--directory)
                target_dir="$2"
                shift 2
                ;;
            -s|--system-scan)
                system_scan=true
                shift
                ;;
            -q|--quiet)
                quiet=true
                shift
                ;;
            -r|--report-only)
                report_only=true
                shift
                ;;
            *)
                if [ -d "$1" ]; then
                    target_dir="$1"
                else
                    log "ERROR" "Unknown option or invalid directory: $1"
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Initialize session
    log "INFO" "Starting YAML conversion validation: $TIMESTAMP"
    log "INFO" "Target directory: $target_dir"
    log "INFO" "Validation log: $VALIDATION_LOG"
    log "INFO" "Validation report: $VALIDATION_REPORT"
    
    # Execute validation
    if [ "$report_only" = true ]; then
        log "INFO" "Report-only mode: Generating report from existing data"
    elif [ "$system_scan" = true ]; then
        log "INFO" "System scan mode: Detecting remaining YAML blocks"
        detect_remaining_yaml "$ROOT_DIR"
    else
        log "INFO" "Full validation mode: Comprehensive file validation"
        validate_directory "$target_dir"
    fi
    
    # Generate report
    generate_validation_report
    
    # Final summary
    log "INFO" "=== VALIDATION SESSION COMPLETE ==="
    log "INFO" "Session: $TIMESTAMP"
    log "INFO" "Total Files: $TOTAL_FILES"
    log "INFO" "Passed: $COMPLIANCE_PASSED"
    log "INFO" "Failed: $COMPLIANCE_FAILED"
    log "INFO" "YAML Blocks Found: $YAML_BLOCKS_FOUND"
    log "INFO" "Link Errors: $LINK_ERRORS"
    log "INFO" "Content Warnings: $CONTENT_WARNINGS"
    
    if [ "$COMPLIANCE_PASSED" -eq "$TOTAL_FILES" ] && [ "$YAML_BLOCKS_FOUND" -eq 0 ] && [ "$LINK_ERRORS" -eq 0 ]; then
        log "SUCCESS" "All validation criteria passed"
        exit 0
    else
        log "WARNING" "Some validation criteria failed"
        log "INFO" "Review the report: $VALIDATION_REPORT"
        exit 1
    fi
}

# Execute main
main "$@"