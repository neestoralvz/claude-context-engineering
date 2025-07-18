#!/bin/bash
# ✅ Context Engineering - Reference Integrity Validation System
# Validación previa y simulación de cambios en referencias cruzadas

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/scripts/results/validation"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
VALIDATION_FILE="$RESULTS_DIR/reference-validation-$TIMESTAMP.json"

# Ripgrep path detection
if command -v rg &> /dev/null; then
    RG_CMD="rg"
elif [ -f "/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg" ]; then
    RG_CMD="/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg"
else
    RG_CMD="grep" # fallback
fi
REPORT_FILE="$RESULTS_DIR/reference-validation-report-$TIMESTAMP.md"

# Global variables
SIMULATE_MODE=true
OLD_REF=""
NEW_REF=""
CHANGE_TYPE=""
AFFECTED_FILES=()
ERRORS=()
WARNINGS=()

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}✅ Context Engineering - Reference Integrity Validation${NC}"
echo "=================================================================="
echo ""

# Function to log with timestamp
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to add error
add_error() {
    ERRORS+=("$1")
    echo -e "${RED}❌ ERROR: $1${NC}"
}

# Function to add warning
add_warning() {
    WARNINGS+=("$1")
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Function to detect change type
detect_change_type() {
    local old="$1"
    local new="$2"
    
    # Principle renumbering
    if [[ "$old" =~ ^#[0-9]+$ ]] && [[ "$new" =~ ^#[0-9]+$ ]]; then
        echo "principle_renumber"
        return
    fi
    
    # Principle count update
    if [[ "$old" =~ [0-9]+.*principle ]] && [[ "$new" =~ [0-9]+.*principle ]]; then
        echo "principle_count"
        return
    fi
    
    # Text replacement
    if [[ "$old" != "$new" ]]; then
        echo "text_replacement"
        return
    fi
    
    echo "unknown"
}

# Function to find affected files
find_affected_files() {
    local pattern="$1"
    local temp_file=$(mktemp)
    
    log "Searching for pattern: '$pattern'"
    
    # Search in different file types
    local file_types=("md" "json" "js" "ts" "sh" "txt")
    
    for file_type in "${file_types[@]}"; do
        $RG_CMD -l "$pattern" "$PROJECT_ROOT" --type "$file_type" 2>/dev/null >> "$temp_file" || true
    done
    
    # Remove duplicates and sort
    sort "$temp_file" | uniq | while read -r file; do
        if [ -f "$file" ]; then
            AFFECTED_FILES+=("$file")
            echo "$file"
        fi
    done
    
    rm "$temp_file"
}

# Function to validate principle references
validate_principle_references() {
    log "Validating principle references..."
    
    local principle_files=(
        "$PROJECT_ROOT/docs/knowledge/principles/philosophical-foundations.md"
        "$PROJECT_ROOT/docs/knowledge/principles/operational-excellence.md"
        "$PROJECT_ROOT/docs/knowledge/principles/technical-standards.md"
        "$PROJECT_ROOT/docs/knowledge/principles/mathematical-rigor.md"
        "$PROJECT_ROOT/docs/knowledge/principles/validation-protocols.md"
        "$PROJECT_ROOT/docs/knowledge/principles/cognitive-optimization.md"
        "$PROJECT_ROOT/docs/knowledge/principles/intelligent-adaptation.md"
        "$PROJECT_ROOT/docs/knowledge/principles/security-privacy.md"
        "$PROJECT_ROOT/docs/knowledge/principles/advanced-automation.md"
        "$PROJECT_ROOT/docs/knowledge/principles/performance-intelligence.md"
        "$PROJECT_ROOT/docs/knowledge/principles/integration-ecosystem.md"
    )
    
    local total_principles=0
    local principle_numbers=()
    
    # Extract all principle numbers
    for file in "${principle_files[@]}"; do
        if [ -f "$file" ]; then
            while IFS= read -r line; do
                if [[ "$line" =~ ^###[[:space:]]*([0-9]+)\.[[:space:]] ]]; then
                    local num="${BASH_REMATCH[1]}"
                    principle_numbers+=("$num")
                    ((total_principles++))
                fi
            done < "$file"
        fi
    done
    
    # Check for gaps and duplicates
    local sorted_nums=($(printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq))
    local expected=1
    
    for num in "${sorted_nums[@]}"; do
        if [ "$num" -ne "$expected" ]; then
            add_warning "Gap in principle sequence: expected $expected, found $num"
        fi
        ((expected++))
    done
    
    # Check for duplicates
    local unique_count=$(printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq | wc -l)
    if [ "$total_principles" -ne "$unique_count" ]; then
        add_error "Duplicate principle numbers detected"
    fi
    
    echo "$total_principles"
}

# Function to validate cross-references
validate_cross_references() {
    log "Validating cross-references..."
    
    local broken_refs=0
    
    # Find all markdown links
    find "$PROJECT_ROOT" -name "*.md" -type f | while read -r file; do
        local relative_path="${file#$PROJECT_ROOT/}"
        
        # Extract markdown links
        $RG_CMD -o '\]\(([^)]*\.md[^)]*)\)' "$file" 2>/dev/null | sed 's/](\([^)]*\))/\1/' | while read -r link; do
            # Convert relative link to absolute path
            local target_file
            if [[ "$link" =~ ^\./ ]]; then
                # Relative to current file
                target_file="$(dirname "$file")/${link#./}"
            elif [[ "$link" =~ ^\.\./ ]]; then
                # Relative to parent directory
                target_file="$(dirname "$file")/$link"
            else
                # Assume relative to project root
                target_file="$PROJECT_ROOT/$link"
            fi
            
            # Remove anchor fragments
            target_file="${target_file%%#*}"
            
            # Check if target file exists
            if [ ! -f "$target_file" ]; then
                add_warning "Broken link in $relative_path: $link -> $target_file"
                ((broken_refs++))
            fi
        done
    done
    
    echo "$broken_refs"
}

# Function to simulate change impact
simulate_change_impact() {
    local old_pattern="$1"
    local new_pattern="$2"
    
    log "Simulating impact of change: '$old_pattern' -> '$new_pattern'"
    
    local temp_file=$(mktemp)
    local affected_count=0
    
    # Find all files with the old pattern
    $RG_CMD -l "$old_pattern" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null > "$temp_file" || true
    
    while read -r file; do
        if [ -f "$file" ]; then
            local relative_path="${file#$PROJECT_ROOT/}"
            local match_count=$($RG_CMD -c "$old_pattern" "$file" 2>/dev/null || echo 0)
            
            if [ "$match_count" -gt 0 ]; then
                AFFECTED_FILES+=("$relative_path:$match_count")
                ((affected_count++))
                
                # Check if this is a critical file
                if [[ "$file" =~ (CLAUDE\.md|README\.md|principle.*\.md) ]]; then
                    add_warning "Critical file affected: $relative_path ($match_count matches)"
                fi
            fi
        fi
    done < "$temp_file"
    
    rm "$temp_file"
    echo "$affected_count"
}

# Function to validate change consistency
validate_change_consistency() {
    local old_ref="$1"
    local new_ref="$2"
    
    log "Validating change consistency..."
    
    # Check if the new reference already exists elsewhere
    local existing_count=$($RG_CMD -c "$new_ref" "$PROJECT_ROOT" --type md 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
    
    if [ "$existing_count" -gt 0 ]; then
        add_warning "New reference '$new_ref' already exists in $existing_count locations"
    fi
    
    # For principle changes, validate numbering logic
    if [[ "$old_ref" =~ ^#[0-9]+$ ]] && [[ "$new_ref" =~ ^#[0-9]+$ ]]; then
        local old_num="${old_ref#\#}"
        local new_num="${new_ref#\#}"
        
        if [ "$new_num" -le "$old_num" ]; then
            add_warning "Renumbering to lower number ($old_num -> $new_num) may create conflicts"
        fi
        
        # Check if new number is already in use
        local new_ref_pattern="### $new_num\."
        local existing_principle=$($RG_CMD -l "$new_ref_pattern" "$PROJECT_ROOT/docs/knowledge/principles/" --type md 2>/dev/null || true)
        
        if [ -n "$existing_principle" ]; then
            add_error "Principle #$new_num already exists in: $existing_principle"
        fi
    fi
}

# Function to generate validation report
generate_validation_report() {
    log "Generating validation report..."
    
    # Create JSON output
    cat > "$VALIDATION_FILE" << EOF
{
  "validation_metadata": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "project_root": "$PROJECT_ROOT",
    "old_reference": "$OLD_REF",
    "new_reference": "$NEW_REF",
    "change_type": "$CHANGE_TYPE",
    "simulate_mode": $SIMULATE_MODE
  },
  "validation_results": {
    "total_principles": $(validate_principle_references),
    "broken_cross_references": $(validate_cross_references),
    "affected_files_count": ${#AFFECTED_FILES[@]},
    "error_count": ${#ERRORS[@]},
    "warning_count": ${#WARNINGS[@]}
  },
  "affected_files": [
$(printf '    "%s"' "${AFFECTED_FILES[@]}" | paste -sd ',\n' -)
  ],
  "errors": [
$(printf '    "%s"' "${ERRORS[@]}" | paste -sd ',\n' -)
  ],
  "warnings": [
$(printf '    "%s"' "${WARNINGS[@]}" | paste -sd ',\n' -)
  ],
  "recommendations": [
    "Review all affected files before proceeding",
    "Backup project state before making changes",
    "Test critical files after changes",
    "Validate cross-references after updates"
  ]
}
EOF

    # Create markdown report
    cat > "$REPORT_FILE" << EOF
# ✅ Reference Integrity Validation Report

**Generated**: $(date)
**Change**: \`$OLD_REF\` → \`$NEW_REF\`
**Type**: $CHANGE_TYPE
**Mode**: $([ "$SIMULATE_MODE" = true ] && echo "SIMULATION" || echo "VALIDATION")

## 📊 Validation Summary

- **Total Principles**: $(validate_principle_references)
- **Affected Files**: ${#AFFECTED_FILES[@]}
- **Errors**: ${#ERRORS[@]}
- **Warnings**: ${#WARNINGS[@]}
- **Broken Cross-References**: $(validate_cross_references)

## 🚨 Errors

$(if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "✅ No errors detected"
else
    printf '- %s\n' "${ERRORS[@]}"
fi)

## ⚠️ Warnings

$(if [ ${#WARNINGS[@]} -eq 0 ]; then
    echo "✅ No warnings"
else
    printf '- %s\n' "${WARNINGS[@]}"
fi)

## 📁 Affected Files

$(if [ ${#AFFECTED_FILES[@]} -eq 0 ]; then
    echo "No files would be affected by this change."
else
    printf '- %s\n' "${AFFECTED_FILES[@]}"
fi)

## 🎯 Recommendations

1. **Pre-Change**: Backup all affected files
2. **Execution**: Use systematic update script
3. **Post-Change**: Validate all cross-references
4. **Testing**: Check critical files functionality

## 📋 Next Steps

$(if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "✅ **SAFE TO PROCEED**: No critical errors detected"
    echo ""
    echo "Recommended command:"
    echo "\`\`\`bash"
    echo "./scripts/maintenance/update-cross-references.sh '$OLD_REF' '$NEW_REF'"
    echo "\`\`\`"
else
    echo "❌ **DO NOT PROCEED**: Critical errors must be resolved first"
fi)

---

*Generated by Context Engineering Reference Integrity Validation System*
EOF
}

# Function to show help
show_help() {
    cat << EOF
✅ Context Engineering - Reference Integrity Validation System

USAGE:
    $0 [OPTIONS] OLD_REFERENCE NEW_REFERENCE

ARGUMENTS:
    OLD_REFERENCE    Current reference to be changed
    NEW_REFERENCE    New reference to replace it with

OPTIONS:
    -h, --help       Show this help message
    -v, --verbose    Enable verbose output
    --no-simulate    Perform actual validation (default: simulate)

EXAMPLES:
    $0 "#94" "#100"                    # Validate principle renumbering
    $0 "94 principios" "103 principios" # Validate count update
    $0 --no-simulate "#94" "#100"      # Real validation mode

DESCRIPTION:
    Validates the integrity of cross-references before making changes.
    Identifies potential issues, affected files, and provides recommendations.

OUTPUT:
    - JSON validation results
    - Human-readable report
    - Impact assessment
    - Safety recommendations

EOF
}

# Main validation function
main() {
    if [ -z "$OLD_REF" ] || [ -z "$NEW_REF" ]; then
        echo -e "${RED}❌ Error: Both OLD_REFERENCE and NEW_REFERENCE are required${NC}"
        show_help
        exit 1
    fi
    
    log "Starting reference integrity validation..."
    
    # Detect change type
    CHANGE_TYPE=$(detect_change_type "$OLD_REF" "$NEW_REF")
    
    log "Change type detected: $CHANGE_TYPE"
    log "Old reference: '$OLD_REF'"
    log "New reference: '$NEW_REF'"
    log "Simulation mode: $SIMULATE_MODE"
    
    # Perform validations
    simulate_change_impact "$OLD_REF" "$NEW_REF"
    validate_change_consistency "$OLD_REF" "$NEW_REF"
    
    # Generate reports
    generate_validation_report
    
    # Show summary
    echo ""
    if [ ${#ERRORS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Validation passed! Safe to proceed with changes.${NC}"
    else
        echo -e "${RED}❌ Validation failed! ${#ERRORS[@]} error(s) detected.${NC}"
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${#WARNINGS[@]} warning(s) require attention.${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}📊 Results saved to:${NC}"
    echo -e "  📋 JSON: ${YELLOW}$VALIDATION_FILE${NC}"
    echo -e "  📄 Report: ${YELLOW}$REPORT_FILE${NC}"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! $RG_CMD --version &> /dev/null; then
        missing_deps+=("ripgrep (rg)")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies:${NC}"
        printf '%s\n' "${missing_deps[@]}"
        echo ""
        echo "Please install missing dependencies and try again."
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            set -x
            shift
            ;;
        --no-simulate)
            SIMULATE_MODE=false
            shift
            ;;
        *)
            if [ -z "$OLD_REF" ]; then
                OLD_REF="$1"
            elif [ -z "$NEW_REF" ]; then
                NEW_REF="$1"
            else
                echo -e "${RED}❌ Unknown argument: $1${NC}"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Run validation
check_dependencies
main

echo ""
echo -e "${GREEN}🎉 Reference integrity validation completed!${NC}"