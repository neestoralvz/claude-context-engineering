#!/bin/bash
# 🔒 Context Engineering - Pre-Commit Reference Integrity Check
# Git hook para validación automática de referencias cruzadas

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
HOOK_CONFIG="$PROJECT_ROOT/scripts/data/cross-reference-registry.json"
ANALYSIS_SCRIPT="$PROJECT_ROOT/scripts/maintenance/analyze-cross-references.sh"
VALIDATION_SCRIPT="$PROJECT_ROOT/scripts/validation/validate-reference-integrity.sh"

echo -e "${BLUE}🔒 Context Engineering - Pre-Commit Reference Check${NC}"
echo "=================================================================="

# Function to log with timestamp
log() {
    echo -e "${CYAN}[HOOK]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if this is a reference-related commit
is_reference_commit() {
    local changed_files=$(git diff --cached --name-only)
    
    # Check if any principle files are modified
    if echo "$changed_files" | grep -q "docs/knowledge/principles/"; then
        return 0
    fi
    
    # Check if CLAUDE.md is modified
    if echo "$changed_files" | grep -q "CLAUDE.md"; then
        return 0
    fi
    
    # Check if any markdown files with potential references are modified
    if echo "$changed_files" | grep -q "\.md$"; then
        # Check if any of these files contain principle references
        for file in $changed_files; do
            if [ -f "$file" ] && git diff --cached "$file" | grep -q "#[0-9]\+\|[0-9]\+ principle"; then
                return 0
            fi
        done
    fi
    
    return 1
}

# Validate principle sequence integrity
validate_principle_sequence() {
    log "Validating principle sequence integrity..."
    
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
    
    local principle_numbers=()
    local errors=0
    
    # Extract all principle numbers from staged changes
    for file in "${principle_files[@]}"; do
        if [ -f "$file" ] && git diff --cached --quiet "$file" 2>/dev/null; then
            # File is staged, check staged content
            git show ":$file" 2>/dev/null | while IFS= read -r line; do
                if [[ "$line" =~ ###[[:space:]]*([0-9]+)\. ]]; then
                    principle_numbers+=("${BASH_REMATCH[1]}")
                fi
            done
        elif [ -f "$file" ]; then
            # File not staged, check current content
            while IFS= read -r line; do
                if [[ "$line" =~ ###[[:space:]]*([0-9]+)\. ]]; then
                    principle_numbers+=("${BASH_REMATCH[1]}")
                fi
            done < "$file"
        fi
    done
    
    # Check for duplicates
    local unique_count=$(printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq | wc -l)
    local total_count=${#principle_numbers[@]}
    
    if [ "$total_count" -ne "$unique_count" ]; then
        log_error "Duplicate principle numbers detected in staged changes"
        printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq -d | while read -r dup; do
            log_error "  Duplicate principle #$dup"
        done
        ((errors++))
    fi
    
    # Check for proper sequence (allow gaps but no overlaps)
    local sorted_nums=($(printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq))
    local max_expected=100  # Current maximum expected
    
    for num in "${sorted_nums[@]}"; do
        if [ "$num" -gt "$max_expected" ]; then
            log_warning "Principle #$num exceeds expected maximum ($max_expected)"
        fi
    done
    
    if [ "$errors" -eq 0 ]; then
        log_success "Principle sequence validation passed"
        return 0
    else
        return 1
    fi
}

# Check for consistent principle counts
validate_principle_counts() {
    log "Validating principle count consistency..."
    
    local files_to_check=(
        "CLAUDE.md"
        "docs/knowledge/principles/README.md"
        "docs/knowledge/principles/principle-cross-reference-network.md"
        "docs/knowledge/principles/_shared/navigation.md"
    )
    
    local expected_total=100
    local errors=0
    
    for file in "${files_to_check[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ] && git diff --cached --quiet "$PROJECT_ROOT/$file" 2>/dev/null; then
            # Check staged content
            local content=$(git show ":$file" 2>/dev/null || cat "$PROJECT_ROOT/$file")
        elif [ -f "$PROJECT_ROOT/$file" ]; then
            local content=$(cat "$PROJECT_ROOT/$file")
        else
            continue
        fi
        
        # Extract principle counts
        local counts=$(echo "$content" | grep -o '[0-9]\+[[:space:]]*principle' | grep -o '[0-9]\+' | sort -n | uniq)
        
        for count in $counts; do
            if [ "$count" -ne "$expected_total" ] && [ "$count" -gt 50 ]; then  # Filter out small numbers
                log_warning "File $file contains principle count $count (expected $expected_total)"
                ((errors++))
            fi
        done
    done
    
    if [ "$errors" -eq 0 ]; then
        log_success "Principle count validation passed"
        return 0
    else
        log_warning "Principle count inconsistencies detected (non-blocking)"
        return 0  # Don't block commit for count inconsistencies
    fi
}

# Check for broken cross-references in staged changes
validate_staged_cross_references() {
    log "Validating cross-references in staged changes..."
    
    local staged_md_files=$(git diff --cached --name-only | grep '\.md$' || true)
    local errors=0
    
    for file in $staged_md_files; do
        if [ -f "$file" ]; then
            # Get staged content
            local staged_content=$(git show ":$file" 2>/dev/null || continue)
            
            # Check markdown links in staged content
            echo "$staged_content" | grep -o '\]\([^)]*\.md[^)]*\)' | sed 's/](\([^)]*\))/\1/' | while read -r link; do
                # Convert relative link to absolute path
                local target_file
                if [[ "$link" =~ ^\./ ]]; then
                    target_file="$(dirname "$file")/${link#./}"
                elif [[ "$link" =~ ^\.\./ ]]; then
                    target_file="$(dirname "$file")/$link"
                else
                    target_file="$PROJECT_ROOT/$link"
                fi
                
                # Remove anchor fragments
                target_file="${target_file%%#*}"
                
                # Check if target file exists
                if [ ! -f "$target_file" ]; then
                    log_warning "Potentially broken link in $file: $link"
                fi
            done
        fi
    done
    
    log_success "Cross-reference validation completed"
    return 0
}

# Main validation function
main() {
    # Skip validation if not a reference-related commit
    if ! is_reference_commit; then
        log "No reference-related changes detected, skipping validation"
        exit 0
    fi
    
    log "Reference-related changes detected, running validation..."
    
    local validation_errors=0
    
    # Run validations
    if ! validate_principle_sequence; then
        ((validation_errors++))
    fi
    
    if ! validate_principle_counts; then
        ((validation_errors++))
    fi
    
    if ! validate_staged_cross_references; then
        ((validation_errors++))
    fi
    
    # Summary
    echo ""
    if [ "$validation_errors" -eq 0 ]; then
        log_success "All reference integrity checks passed!"
        echo ""
        echo -e "${GREEN}✅ Commit approved - no reference integrity issues detected${NC}"
        exit 0
    else
        log_error "$validation_errors validation error(s) detected"
        echo ""
        echo -e "${RED}❌ Commit blocked - please fix reference integrity issues${NC}"
        echo ""
        echo "To fix issues:"
        echo "  1. Review the errors above"
        echo "  2. Fix principle numbering conflicts"
        echo "  3. Update principle counts if needed"
        echo "  4. Re-stage your changes and commit again"
        echo ""
        echo "To skip this check (not recommended):"
        echo "  git commit --no-verify"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    if ! command -v git &> /dev/null; then
        log_error "Git not found"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
🔒 Context Engineering - Pre-Commit Reference Integrity Check

DESCRIPTION:
    Git pre-commit hook that validates reference integrity before allowing commits.
    
VALIDATIONS:
    - Principle sequence integrity (no duplicates)
    - Principle count consistency across files
    - Cross-reference validity in staged changes
    
USAGE:
    This script runs automatically as a git pre-commit hook.
    
    To install as a git hook:
        ln -sf ../../scripts/hooks/pre-commit-reference-check.sh .git/hooks/pre-commit
    
    To run manually:
        $0
    
    To skip validation (not recommended):
        git commit --no-verify

CONFIGURATION:
    Edit scripts/data/cross-reference-registry.json to modify validation rules.

EOF
}

# Parse arguments
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    show_help
    exit 0
fi

# Run validation
check_dependencies
main