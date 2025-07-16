#!/bin/bash

# Script: analyze-domain-consistency.sh
# Purpose: Analyze domain alignment and consistency in command content
# Usage: ./analyze-domain-consistency.sh [command_file_path]

COMMAND_FILE="$1"
SCRIPT_DIR="$(dirname "$0")"
RESULTS_DIR="$SCRIPT_DIR/../results/nomenclature"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Initialize analysis results
CONSISTENCY_SCORE=0
TOTAL_CHECKS=5
PASSED_CHECKS=0

echo "🎯 Domain Consistency Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Command File: $COMMAND_FILE"
echo "Timestamp: $(date)"

if [ ! -f "$COMMAND_FILE" ]; then
    echo "❌ ERROR: Command file not found: $COMMAND_FILE"
    exit 1
fi

# Extract command category from path
COMMAND_CATEGORY=$(echo "$COMMAND_FILE" | grep -o '/[0-9][0-9]-[^/]*/' | sed 's|/||g' | head -1)
echo "📂 Detected Category: $COMMAND_CATEGORY"

# Check 1: Category alignment
echo "🔍 Checking category alignment..."
case "$COMMAND_CATEGORY" in
    "01-core-intelligence")
        EXPECTED_TERMS="intelligence|decision|thinking|cognitive|autonomous"
        ;;
    "02-mathematical-verification")
        EXPECTED_TERMS="mathematical|verification|validate|measure|metric"
        ;;
    "03-discovery-exploration")
        EXPECTED_TERMS="discovery|exploration|pattern|recognize|analyze"
        ;;
    "04-orchestration-flow")
        EXPECTED_TERMS="orchestration|flow|parallel|coordination|execution"
        ;;
    "05-context-optimization")
        EXPECTED_TERMS="context|optimization|economy|efficiency|reduction"
        ;;
    "06-system-architecture")
        EXPECTED_TERMS="architecture|system|structure|organization|hierarchy"
        ;;
    "07-development-methodology")
        EXPECTED_TERMS="development|methodology|planning|documentation|workflow"
        ;;
    "08-automation-tools")
        EXPECTED_TERMS="automation|tools|monitoring|registry|metrics"
        ;;
    *)
        EXPECTED_TERMS="command|execution|protocol|process|system"
        ;;
esac

if grep -qi "$EXPECTED_TERMS" "$COMMAND_FILE"; then
    echo "✅ Category-aligned terminology found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Category-aligned terminology missing"
fi

# Check 2: Consistent terminology usage
echo "🔍 Checking consistent terminology usage..."
INCONSISTENT_COUNT=0

# Check for mixed naming conventions
if grep -q "camelCase\|PascalCase" "$COMMAND_FILE" && grep -q "kebab-case\|snake_case" "$COMMAND_FILE"; then
    ((INCONSISTENT_COUNT++))
fi

# Check for mixed language
if grep -q "[Spanish|French|German]" "$COMMAND_FILE" && [ "$COMMAND_FILE" != *"multi-language"* ]; then
    ((INCONSISTENT_COUNT++))
fi

if [ $INCONSISTENT_COUNT -eq 0 ]; then
    echo "✅ Consistent terminology usage"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Inconsistent terminology detected ($INCONSISTENT_COUNT issues)"
fi

# Check 3: Domain-specific patterns
echo "🔍 Checking domain-specific patterns..."
if grep -qi "principle\|pattern\|protocol\|methodology" "$COMMAND_FILE"; then
    echo "✅ Domain-specific patterns found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Domain-specific patterns missing"
fi

# Check 4: Universal standards compliance
echo "🔍 Checking universal standards compliance..."
STANDARDS_VIOLATIONS=0

# Check for non-English primary language (allowing technical terms)
if grep -E "[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]" "$COMMAND_FILE" | grep -v "naïve\|café\|résumé" > /dev/null; then
    ((STANDARDS_VIOLATIONS++))
fi

# Check for inconsistent case in command names
if grep -o '/[a-z-]*' "$COMMAND_FILE" | grep -E '[A-Z]|_' > /dev/null; then
    ((STANDARDS_VIOLATIONS++))
fi

if [ $STANDARDS_VIOLATIONS -eq 0 ]; then
    echo "✅ Universal standards compliance"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Universal standards violations ($STANDARDS_VIOLATIONS issues)"
fi

# Check 5: Cross-reference alignment
echo "🔍 Checking cross-reference alignment..."
if grep -q "\.claude/commands/" "$COMMAND_FILE"; then
    REFS=$(grep -o "\.claude/commands/[^\"]*" "$COMMAND_FILE" | wc -l)
    if [ "$REFS" -gt 0 ]; then
        echo "✅ Cross-reference alignment found ($REFS references)"
        ((PASSED_CHECKS++))
    else
        echo "⚠️ Cross-reference alignment issues"
    fi
else
    echo "⚠️ No cross-references found"
fi

# Calculate consistency score
CONSISTENCY_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Domain Consistency Analysis Results:"
echo "   ├── Checks Passed: $PASSED_CHECKS/$TOTAL_CHECKS"
echo "   ├── Consistency Score: $CONSISTENCY_SCORE%"
echo "   ├── Category: $COMMAND_CATEGORY"
echo "   └── Status: $([ $CONSISTENCY_SCORE -ge 80 ] && echo "✅ CONSISTENT" || echo "⚠️ NEEDS ALIGNMENT")"

# Generate JSON report
cat > "$RESULTS_DIR/domain_consistency_analysis.json" <<EOF
{
  "command_file": "$COMMAND_FILE",
  "timestamp": "$(date -Iseconds)",
  "domain_consistency_analysis": {
    "command_category": "$COMMAND_CATEGORY",
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "consistency_score": $CONSISTENCY_SCORE,
    "status": "$([ $CONSISTENCY_SCORE -ge 80 ] && echo "consistent" || echo "needs_alignment")",
    "check_details": {
      "category_alignment": $(grep -qi "$EXPECTED_TERMS" "$COMMAND_FILE" && echo "true" || echo "false"),
      "terminology_consistency": $([ $INCONSISTENT_COUNT -eq 0 ] && echo "true" || echo "false"),
      "domain_patterns": $(grep -qi "principle\|pattern\|protocol\|methodology" "$COMMAND_FILE" && echo "true" || echo "false"),
      "universal_standards": $([ $STANDARDS_VIOLATIONS -eq 0 ] && echo "true" || echo "false"),
      "cross_reference_alignment": $(grep -q "\.claude/commands/" "$COMMAND_FILE" && echo "true" || echo "false")
    },
    "metrics": {
      "inconsistent_terminology_count": $INCONSISTENT_COUNT,
      "standards_violations_count": $STANDARDS_VIOLATIONS,
      "cross_references_count": $(grep -o "\.claude/commands/[^\"]*" "$COMMAND_FILE" | wc -l | tr -d ' ')
    }
  }
}
EOF

echo "📄 Results saved to: $RESULTS_DIR/domain_consistency_analysis.json"

exit $((100 - CONSISTENCY_SCORE))