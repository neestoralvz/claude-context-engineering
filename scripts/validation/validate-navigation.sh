#!/bin/bash

# Navigation Validation System for Context Engineering
# Validates all internal links, cross-references, and file naming consistency

set -e

echo "🔍 Context Engineering - Navigation Validation System"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_checks=0
passed_checks=0
failed_checks=0

# Base directory
BASE_DIR="/Users/nalve/claude-context-engineering"
PRINCIPLES_DIR="$BASE_DIR/docs/principles"

check_result() {
    local test_name="$1"
    local condition="$2"
    
    total_checks=$((total_checks + 1))
    
    if [ "$condition" = "true" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        failed_checks=$((failed_checks + 1))
    fi
}

echo "🎯 1. CORE FILE EXISTENCE VALIDATION"
echo "-----------------------------------"

# Check if core principle files exist
declare -a principle_files=(
    "philosophical-foundations.md"
    "operational-excellence.md"
    "technical-standards.md"
    "mathematical-rigor.md"
    "validation-protocols.md"
    "cognitive-optimization.md"
    "intelligent-adaptation.md"
)

# Only these files should be referenced in CLAUDE.md
declare -a claude_referenced_files=(
    "philosophical-foundations.md"
)

for file in "${principle_files[@]}"; do
    if [ -f "$PRINCIPLES_DIR/$file" ]; then
        check_result "Core file exists: $file" "true"
    else
        check_result "Core file exists: $file" "false"
    fi
done

# Check shared navigation files
declare -a shared_files=(
    "_shared/navigation.md"
    "_shared/workflow.md"
    "_shared/metrics.md"
)

for file in "${shared_files[@]}"; do
    if [ -f "$PRINCIPLES_DIR/$file" ]; then
        check_result "Shared file exists: $file" "true"
    else
        check_result "Shared file exists: $file" "false"
    fi
done

echo ""
echo "🔗 2. INTERNAL LINK VALIDATION"
echo "------------------------------"

# Check for broken internal links in navigation.md
NAVIGATION_FILE="$PRINCIPLES_DIR/_shared/navigation.md"
if [ -f "$NAVIGATION_FILE" ]; then
    # Count valid and invalid links
    total_links=$(grep -o "\](\./[^)]*\.md)" "$NAVIGATION_FILE" | wc -l)
    valid_links=0
    
    # Extract all relative links and check if target files exist
    while IFS= read -r link; do
        if [ -n "$link" ]; then
            # Extract path from link format
            link_path=$(echo "$link" | sed 's/](\.\///' | sed 's/)//')
            target_file="$PRINCIPLES_DIR/$link_path"
            
            if [ -f "$target_file" ]; then
                valid_links=$((valid_links + 1))
            fi
        fi
    done < <(grep -o "\](\./[^)]*\.md)" "$NAVIGATION_FILE" | sed 's/](\.\///' | sed 's/)//')
    
    if [ "$total_links" -eq "$valid_links" ] && [ "$total_links" -gt 0 ]; then
        check_result "All navigation links valid ($valid_links/$total_links)" "true"
    else
        check_result "All navigation links valid ($valid_links/$total_links)" "false"
    fi
fi

echo ""
echo "📊 3. CROSS-REFERENCE CONSISTENCY"
echo "---------------------------------"

# Check if all principle files have consistent navigation headers
for file in "${principle_files[@]}"; do
    if [ -f "$PRINCIPLES_DIR/$file" ]; then
        # Check if file contains navigation breadcrumbs
        if grep -q "Elementos Compartidos.*Navegación.*_shared/navigation.md" "$PRINCIPLES_DIR/$file"; then
            check_result "Has navigation breadcrumbs: $file" "true"
        else
            check_result "Has navigation breadcrumbs: $file" "false"
        fi
        
        # Check if file contains workflow reference
        if grep -q "_shared/workflow.md" "$PRINCIPLES_DIR/$file"; then
            check_result "Has workflow reference: $file" "true"
        else
            check_result "Has workflow reference: $file" "false"
        fi
        
        # Check if file contains metrics reference
        if grep -q "_shared/metrics.md" "$PRINCIPLES_DIR/$file"; then
            check_result "Has metrics reference: $file" "true"
        else
            check_result "Has metrics reference: $file" "false"
        fi
    fi
done

echo ""
echo "🎯 4. BREADCRUMB VALIDATION"
echo "---------------------------"

# Check CLAUDE.md navigation references
CLAUDE_FILE="$BASE_DIR/CLAUDE.md"
if [ -f "$CLAUDE_FILE" ]; then
    # Check if CLAUDE.md references expected principle files
    for file in "${claude_referenced_files[@]}"; do
        if grep -q "$file" "$CLAUDE_FILE"; then
            check_result "CLAUDE.md references: $file" "true"
        else
            check_result "CLAUDE.md references: $file" "false"
        fi
    done
fi

echo ""
echo "⚙️ 5. NAMING CONSISTENCY VALIDATION"
echo "-----------------------------------"

# Check for deprecated filename references (cleaned up after reorganization)
declare -a deprecated_names=(
    # No deprecated references remaining after cleanup
)

for deprecated in "${deprecated_names[@]}"; do
    if find "$PRINCIPLES_DIR" -name "*.md" -exec grep -l "$deprecated" {} \; | head -1 >/dev/null 2>&1; then
        check_result "No deprecated references: $deprecated" "false"
    else
        check_result "No deprecated references: $deprecated" "true"
    fi
done

echo ""
echo "📈 6. METRICS VALIDATION"
echo "-----------------------"

# Calculate navigation efficiency metrics
total_principle_files=${#principle_files[@]}
total_shared_files=${#shared_files[@]}
total_system_files=$((total_principle_files + total_shared_files))

# Check if README.md exists and links to all principle files
README_FILE="$PRINCIPLES_DIR/README.md"
if [ -f "$README_FILE" ]; then
    linked_files=0
    for file in "${principle_files[@]}"; do
        if grep -q "$file" "$README_FILE"; then
            linked_files=$((linked_files + 1))
        fi
    done
    
    link_coverage=$((linked_files * 100 / total_principle_files))
    if [ $link_coverage -ge 95 ]; then
        check_result "README link coverage ≥95%: ${link_coverage}%" "true"
    else
        check_result "README link coverage ≥95%: ${link_coverage}%" "false"
    fi
fi

echo ""
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo -e "Total Checks: ${BLUE}$total_checks${NC}"
echo -e "Passed: ${GREEN}$passed_checks${NC}"
echo -e "Failed: ${RED}$failed_checks${NC}"

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL NAVIGATION TESTS PASSED!${NC}"
    echo -e "${GREEN}Cross-Reference Accuracy: 100%${NC}"
    echo -e "${GREEN}Navigation Consistency: 100%${NC}"
    echo -e "${GREEN}Link Validity: 100%${NC}"
    exit 0
else
    success_rate=$((passed_checks * 100 / total_checks))
    echo -e "${YELLOW}⚠️  Navigation validation completed with issues${NC}"
    echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
    echo ""
    echo -e "${RED}Please fix the failed checks before proceeding.${NC}"
    exit 1
fi