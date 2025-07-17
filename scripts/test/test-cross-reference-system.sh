#!/bin/bash
# 🧪 Context Engineering - Cross-Reference System Testing Suite
# Comprehensive testing of the automated cross-reference management system

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
TEST_RESULTS_DIR="$PROJECT_ROOT/scripts/results/testing"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
TEST_LOG="$TEST_RESULTS_DIR/cross-reference-system-test-$TIMESTAMP.log"

# Test scripts
ANALYSIS_SCRIPT="$PROJECT_ROOT/scripts/maintenance/analyze-cross-references.sh"
VALIDATION_SCRIPT="$PROJECT_ROOT/scripts/validation/validate-reference-integrity.sh"
UPDATE_SCRIPT="$PROJECT_ROOT/scripts/maintenance/update-cross-references.sh"
HOOK_SCRIPT="$PROJECT_ROOT/scripts/hooks/pre-commit-reference-check.sh"
REGISTRY_FILE="$PROJECT_ROOT/scripts/data/cross-reference-registry.json"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNINGS=0

# Ensure test results directory exists
mkdir -p "$TEST_RESULTS_DIR"

# Redirect all output to both console and log file
exec > >(tee "$TEST_LOG")
exec 2>&1

echo -e "${BLUE}🧪 Context Engineering - Cross-Reference System Testing${NC}"
echo "=================================================================="
echo "Test started: $(date)"
echo "Project root: $PROJECT_ROOT"
echo "Test log: $TEST_LOG"
echo ""

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local message="${3:-}"
    
    ((TESTS_RUN++))
    
    case "$status" in
        "PASS")
            ((TESTS_PASSED++))
            echo -e "${GREEN}✅ PASS${NC} $test_name"
            ;;
        "FAIL")
            ((TESTS_FAILED++))
            echo -e "${RED}❌ FAIL${NC} $test_name"
            if [ -n "$message" ]; then
                echo -e "    ${RED}Error: $message${NC}"
            fi
            ;;
        "WARN")
            ((TESTS_WARNINGS++))
            echo -e "${YELLOW}⚠️  WARN${NC} $test_name"
            if [ -n "$message" ]; then
                echo -e "    ${YELLOW}Warning: $message${NC}"
            fi
            ;;
    esac
}

# Test 1: Check if all scripts exist and are executable
test_script_existence() {
    echo -e "${CYAN}[TEST 1] Script Existence and Permissions${NC}"
    
    local scripts=(
        "$ANALYSIS_SCRIPT"
        "$VALIDATION_SCRIPT"
        "$UPDATE_SCRIPT"
        "$HOOK_SCRIPT"
    )
    
    for script in "${scripts[@]}"; do
        local script_name=$(basename "$script")
        
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                log_test "Script $script_name exists and is executable" "PASS"
            else
                log_test "Script $script_name exists but is not executable" "FAIL"
            fi
        else
            log_test "Script $script_name missing" "FAIL"
        fi
    done
    
    # Test registry file
    if [ -f "$REGISTRY_FILE" ]; then
        if jq . "$REGISTRY_FILE" > /dev/null 2>&1; then
            log_test "Registry file exists and is valid JSON" "PASS"
        else
            log_test "Registry file exists but contains invalid JSON" "FAIL"
        fi
    else
        log_test "Registry file missing" "FAIL"
    fi
}

# Test 2: Validate dependencies
test_dependencies() {
    echo ""
    echo -e "${CYAN}[TEST 2] Dependency Validation${NC}"
    
    local dependencies=("rg" "jq" "git")
    
    for dep in "${dependencies[@]}"; do
        if command -v "$dep" &> /dev/null; then
            log_test "Dependency $dep available" "PASS"
        else
            log_test "Dependency $dep missing" "FAIL"
        fi
    done
}

# Test 3: Analysis script functionality
test_analysis_script() {
    echo ""
    echo -e "${CYAN}[TEST 3] Analysis Script Functionality${NC}"
    
    if [ -x "$ANALYSIS_SCRIPT" ]; then
        # Test help option
        if "$ANALYSIS_SCRIPT" --help > /dev/null 2>&1; then
            log_test "Analysis script help option works" "PASS"
        else
            log_test "Analysis script help option fails" "FAIL"
        fi
        
        # Test dry run (with timeout)
        local temp_output=$(mktemp)
        if timeout 30 "$ANALYSIS_SCRIPT" > "$temp_output" 2>&1; then
            if [ -s "$temp_output" ]; then
                log_test "Analysis script produces output" "PASS"
            else
                log_test "Analysis script produces no output" "WARN"
            fi
        else
            log_test "Analysis script times out or fails" "FAIL"
        fi
        rm -f "$temp_output"
    else
        log_test "Analysis script not executable" "FAIL"
    fi
}

# Test 4: Validation script functionality
test_validation_script() {
    echo ""
    echo -e "${CYAN}[TEST 4] Validation Script Functionality${NC}"
    
    if [ -x "$VALIDATION_SCRIPT" ]; then
        # Test help option
        if "$VALIDATION_SCRIPT" --help > /dev/null 2>&1; then
            log_test "Validation script help option works" "PASS"
        else
            log_test "Validation script help option fails" "FAIL"
        fi
        
        # Test with dummy data
        local temp_output=$(mktemp)
        if "$VALIDATION_SCRIPT" "#test1" "#test2" > "$temp_output" 2>&1; then
            log_test "Validation script accepts test parameters" "PASS"
        else
            log_test "Validation script rejects test parameters" "WARN" "Expected for non-existent references"
        fi
        rm -f "$temp_output"
    else
        log_test "Validation script not executable" "FAIL"
    fi
}

# Test 5: Update script safety features
test_update_script_safety() {
    echo ""
    echo -e "${CYAN}[TEST 5] Update Script Safety Features${NC}"
    
    if [ -x "$UPDATE_SCRIPT" ]; then
        # Test help option
        if "$UPDATE_SCRIPT" --help > /dev/null 2>&1; then
            log_test "Update script help option works" "PASS"
        else
            log_test "Update script help option fails" "FAIL"
        fi
        
        # Test dry run mode
        local temp_output=$(mktemp)
        if "$UPDATE_SCRIPT" --dry-run "#test1" "#test2" > "$temp_output" 2>&1; then
            if grep -q "DRY RUN" "$temp_output"; then
                log_test "Update script dry run mode works" "PASS"
            else
                log_test "Update script dry run mode unclear" "WARN"
            fi
        else
            log_test "Update script dry run fails" "FAIL"
        fi
        rm -f "$temp_output"
        
        # Test parameter validation
        local temp_output2=$(mktemp)
        if "$UPDATE_SCRIPT" > "$temp_output2" 2>&1; then
            log_test "Update script allows execution without parameters" "FAIL" "Should require parameters"
        else
            if grep -q "required" "$temp_output2"; then
                log_test "Update script parameter validation works" "PASS"
            else
                log_test "Update script parameter validation unclear" "WARN"
            fi
        fi
        rm -f "$temp_output2"
    else
        log_test "Update script not executable" "FAIL"
    fi
}

# Test 6: Git hook functionality
test_git_hook() {
    echo ""
    echo -e "${CYAN}[TEST 6] Git Hook Functionality${NC}"
    
    if [ -x "$HOOK_SCRIPT" ]; then
        # Test help option
        if "$HOOK_SCRIPT" --help > /dev/null 2>&1; then
            log_test "Git hook help option works" "PASS"
        else
            log_test "Git hook help option fails" "FAIL"
        fi
        
        # Test execution in git environment
        if git rev-parse --git-dir > /dev/null 2>&1; then
            local temp_output=$(mktemp)
            if "$HOOK_SCRIPT" > "$temp_output" 2>&1; then
                log_test "Git hook executes in git environment" "PASS"
            else
                log_test "Git hook fails in git environment" "WARN" "May be expected if no staged changes"
            fi
            rm -f "$temp_output"
        else
            log_test "Not in git repository - skipping git hook test" "WARN"
        fi
    else
        log_test "Git hook script not executable" "FAIL"
    fi
}

# Test 7: Registry file validation
test_registry_validation() {
    echo ""
    echo -e "${CYAN}[TEST 7] Registry File Validation${NC}"
    
    if [ -f "$REGISTRY_FILE" ]; then
        # Test JSON structure
        local required_fields=(
            ".registry_metadata"
            ".reference_patterns"
            ".critical_files"
            ".automation_config"
            ".statistics"
        )
        
        for field in "${required_fields[@]}"; do
            if jq -e "$field" "$REGISTRY_FILE" > /dev/null 2>&1; then
                log_test "Registry contains required field $field" "PASS"
            else
                log_test "Registry missing required field $field" "FAIL"
            fi
        done
        
        # Test specific configurations
        local total_principles=$(jq -r '.statistics.total_principles' "$REGISTRY_FILE" 2>/dev/null || echo "null")
        if [ "$total_principles" = "100" ]; then
            log_test "Registry shows correct total principles (100)" "PASS"
        else
            log_test "Registry shows incorrect total principles ($total_principles)" "FAIL"
        fi
    else
        log_test "Registry file does not exist" "FAIL"
    fi
}

# Test 8: System integration
test_system_integration() {
    echo ""
    echo -e "${CYAN}[TEST 8] System Integration${NC}"
    
    # Test that scripts can find each other
    if [ -x "$VALIDATION_SCRIPT" ] && [ -x "$UPDATE_SCRIPT" ]; then
        # Check if update script references validation script
        if grep -q "validate-reference-integrity.sh" "$UPDATE_SCRIPT"; then
            log_test "Update script integrates with validation script" "PASS"
        else
            log_test "Update script does not integrate with validation script" "WARN"
        fi
    fi
    
    # Test directory structure
    local expected_dirs=(
        "$PROJECT_ROOT/scripts/maintenance"
        "$PROJECT_ROOT/scripts/validation"
        "$PROJECT_ROOT/scripts/hooks"
        "$PROJECT_ROOT/scripts/data"
        "$PROJECT_ROOT/scripts/results"
    )
    
    for dir in "${expected_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log_test "Directory structure: $(basename "$dir") exists" "PASS"
        else
            log_test "Directory structure: $(basename "$dir") missing" "FAIL"
        fi
    done
}

# Test 9: Current system state validation
test_current_system_state() {
    echo ""
    echo -e "${CYAN}[TEST 9] Current System State Validation${NC}"
    
    # Check for principle numbering consistency
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
    local files_checked=0
    
    for file in "${principle_files[@]}"; do
        if [ -f "$file" ]; then
            ((files_checked++))
            while IFS= read -r line; do
                if [[ "$line" =~ ^###[[:space:]]*([0-9]+)\.[[:space:]] ]]; then
                    principle_numbers+=("${BASH_REMATCH[1]}")
                fi
            done < "$file"
        fi
    done
    
    if [ "$files_checked" -gt 0 ]; then
        log_test "Found $files_checked principle files" "PASS"
        
        # Check for duplicates
        local unique_count=$(printf '%s\n' "${principle_numbers[@]}" | sort -n | uniq | wc -l)
        local total_count=${#principle_numbers[@]}
        
        if [ "$total_count" -eq "$unique_count" ]; then
            log_test "No duplicate principle numbers detected" "PASS"
        else
            log_test "Duplicate principle numbers detected" "FAIL"
        fi
        
        log_test "Found $total_count total principles" "PASS"
    else
        log_test "No principle files found" "FAIL"
    fi
}

# Test 10: Performance and reliability
test_performance() {
    echo ""
    echo -e "${CYAN}[TEST 10] Performance and Reliability${NC}"
    
    # Test analysis script performance
    if [ -x "$ANALYSIS_SCRIPT" ]; then
        local start_time=$(date +%s)
        local temp_output=$(mktemp)
        
        if timeout 60 "$ANALYSIS_SCRIPT" > "$temp_output" 2>&1; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            
            if [ "$duration" -le 30 ]; then
                log_test "Analysis script completes within 30 seconds ($duration s)" "PASS"
            else
                log_test "Analysis script takes too long ($duration s)" "WARN"
            fi
        else
            log_test "Analysis script times out or fails" "FAIL"
        fi
        
        rm -f "$temp_output"
    fi
}

# Generate test summary
generate_test_summary() {
    echo ""
    echo "=================================================================="
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo "=================================================================="
    echo "Test completed: $(date)"
    echo ""
    echo -e "📋 Results:"
    echo -e "  Total tests run: ${BLUE}$TESTS_RUN${NC}"
    echo -e "  Tests passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "  Tests failed: ${RED}$TESTS_FAILED${NC}"
    echo -e "  Warnings: ${YELLOW}$TESTS_WARNINGS${NC}"
    echo ""
    
    local success_rate=0
    if [ "$TESTS_RUN" -gt 0 ]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
    fi
    
    echo -e "🎯 Success rate: ${success_rate}%"
    echo ""
    
    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed! Cross-reference system is ready for use.${NC}"
        echo ""
        echo "📋 Next steps:"
        echo "  1. Optionally install git hook: ln -sf ../../scripts/hooks/pre-commit-reference-check.sh .git/hooks/pre-commit"
        echo "  2. Run analysis: ./scripts/maintenance/analyze-cross-references.sh"
        echo "  3. Use validation before changes: ./scripts/validation/validate-reference-integrity.sh 'old' 'new'"
        echo "  4. Apply updates safely: ./scripts/maintenance/update-cross-references.sh 'old' 'new'"
    else
        echo -e "${RED}❌ $TESTS_FAILED test(s) failed. Please review and fix issues before using the system.${NC}"
    fi
    
    echo ""
    echo -e "📄 Full test log: ${YELLOW}$TEST_LOG${NC}"
}

# Main function
main() {
    echo "Starting comprehensive cross-reference system testing..."
    echo ""
    
    # Run all tests
    test_script_existence
    test_dependencies
    test_analysis_script
    test_validation_script
    test_update_script_safety
    test_git_hook
    test_registry_validation
    test_system_integration
    test_current_system_state
    test_performance
    
    # Generate summary
    generate_test_summary
}

# Show help
show_help() {
    cat << EOF
🧪 Context Engineering - Cross-Reference System Testing Suite

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -h, --help     Show this help message
    -v, --verbose  Enable verbose output

DESCRIPTION:
    Comprehensive testing suite for the automated cross-reference management system.
    Tests all components for functionality, integration, and current system state.

TESTS PERFORMED:
    1. Script existence and permissions
    2. Dependency validation
    3. Analysis script functionality
    4. Validation script functionality
    5. Update script safety features
    6. Git hook functionality
    7. Registry file validation
    8. System integration
    9. Current system state validation
    10. Performance and reliability

OUTPUT:
    - Real-time test results
    - Comprehensive test log
    - Success rate and recommendations

EOF
}

# Parse arguments
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    show_help
    exit 0
fi

if [[ "${1:-}" == "--verbose" ]] || [[ "${1:-}" == "-v" ]]; then
    set -x
fi

# Run tests
main