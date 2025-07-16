#!/bin/bash

# Script: validate-adaptive-thresholds.sh
# Purpose: Validate adaptive thresholds and quality measurements in command content
# Usage: ./validate-adaptive-thresholds.sh [command_file_path]

COMMAND_FILE="$1"
SCRIPT_DIR="$(dirname "$0")"
RESULTS_DIR="$SCRIPT_DIR/../results/validation"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Initialize validation results
THRESHOLD_SCORE=0
TOTAL_CHECKS=6
PASSED_CHECKS=0

echo "📏 Adaptive Thresholds Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Command File: $COMMAND_FILE"
echo "Timestamp: $(date)"

if [ ! -f "$COMMAND_FILE" ]; then
    echo "❌ ERROR: Command file not found: $COMMAND_FILE"
    exit 1
fi

# Check 1: Quality target specifications
echo "🔍 Checking quality target specifications..."
if grep -qE "≥[0-9]+%|>=[0-9]+%|≤[0-9]+%|<=[0-9]+%" "$COMMAND_FILE"; then
    echo "✅ Quality target specifications found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Quality target specifications missing"
fi

# Check 2: Adaptive threshold mechanisms
echo "🔍 Checking adaptive threshold mechanisms..."
if grep -qi "adaptive.*threshold|dynamic.*threshold|threshold.*adjust" "$COMMAND_FILE"; then
    echo "✅ Adaptive threshold mechanisms found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Adaptive threshold mechanisms missing"
fi

# Check 3: Confidence-based validation
echo "🔍 Checking confidence-based validation..."
if grep -qi "confidence.*threshold|confidence.*level|confidence.*scor" "$COMMAND_FILE"; then
    echo "✅ Confidence-based validation found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Confidence-based validation missing"
fi

# Check 4: Multi-dimensional assessment
echo "🔍 Checking multi-dimensional assessment..."
if grep -qi "multi-dimensional|multiple.*dimension|dimension.*assess" "$COMMAND_FILE"; then
    echo "✅ Multi-dimensional assessment found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Multi-dimensional assessment missing"
fi

# Check 5: Mathematical validation criteria
echo "🔍 Checking mathematical validation criteria..."
if grep -qi "mathematical.*validation|quantitative.*measure|metric.*calculation" "$COMMAND_FILE"; then
    echo "✅ Mathematical validation criteria found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Mathematical validation criteria missing"
fi

# Check 6: Success criteria definition
echo "🔍 Checking success criteria definition..."
if grep -qi "success.*criteria|target.*achievement|criteria.*met" "$COMMAND_FILE"; then
    echo "✅ Success criteria definition found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Success criteria definition missing"
fi

# Extract threshold values for analysis
QUALITY_THRESHOLDS=$(grep -oE "≥[0-9]+%|>=[0-9]+%|≤[0-9]+%|<=[0-9]+%" "$COMMAND_FILE" | wc -l)
CONFIDENCE_MENTIONS=$(grep -oi "confidence" "$COMMAND_FILE" | wc -l)
METRIC_MENTIONS=$(grep -oi "metric\|measure\|score" "$COMMAND_FILE" | wc -l)

# Calculate threshold validation score
THRESHOLD_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Adaptive Thresholds Validation Results:"
echo "   ├── Checks Passed: $PASSED_CHECKS/$TOTAL_CHECKS"
echo "   ├── Threshold Score: $THRESHOLD_SCORE%"
echo "   ├── Quality Thresholds Found: $QUALITY_THRESHOLDS"
echo "   ├── Confidence Mentions: $CONFIDENCE_MENTIONS"
echo "   ├── Metric Mentions: $METRIC_MENTIONS"
echo "   └── Status: $([ $THRESHOLD_SCORE -ge 85 ] && echo "✅ WELL-DEFINED" || echo "⚠️ NEEDS IMPROVEMENT")"

# Determine threshold sophistication level
if [ $QUALITY_THRESHOLDS -ge 10 ] && [ $CONFIDENCE_MENTIONS -ge 5 ]; then
    SOPHISTICATION="high"
elif [ $QUALITY_THRESHOLDS -ge 5 ] && [ $CONFIDENCE_MENTIONS -ge 3 ]; then
    SOPHISTICATION="medium"
else
    SOPHISTICATION="low"
fi

echo "   └── Sophistication Level: $(echo $SOPHISTICATION | tr '[:lower:]' '[:upper:]')"

# Generate JSON report
cat > "$RESULTS_DIR/adaptive_thresholds_validation.json" <<EOF
{
  "command_file": "$COMMAND_FILE",
  "timestamp": "$(date -Iseconds)",
  "adaptive_thresholds_validation": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "threshold_score": $THRESHOLD_SCORE,
    "sophistication_level": "$SOPHISTICATION",
    "status": "$([ $THRESHOLD_SCORE -ge 85 ] && echo "well_defined" || echo "needs_improvement")",
    "check_details": {
      "quality_targets": $(grep -qE "≥[0-9]+%|>=[0-9]+%|≤[0-9]+%|<=[0-9]+%" "$COMMAND_FILE" && echo "true" || echo "false"),
      "adaptive_mechanisms": $(grep -qi "adaptive.*threshold|dynamic.*threshold|threshold.*adjust" "$COMMAND_FILE" && echo "true" || echo "false"),
      "confidence_validation": $(grep -qi "confidence.*threshold|confidence.*level|confidence.*scor" "$COMMAND_FILE" && echo "true" || echo "false"),
      "multi_dimensional": $(grep -qi "multi-dimensional|multiple.*dimension|dimension.*assess" "$COMMAND_FILE" && echo "true" || echo "false"),
      "mathematical_criteria": $(grep -qi "mathematical.*validation|quantitative.*measure|metric.*calculation" "$COMMAND_FILE" && echo "true" || echo "false"),
      "success_criteria": $(grep -qi "success.*criteria|target.*achievement|criteria.*met" "$COMMAND_FILE" && echo "true" || echo "false")
    },
    "metrics": {
      "quality_thresholds_count": $QUALITY_THRESHOLDS,
      "confidence_mentions_count": $CONFIDENCE_MENTIONS,
      "metric_mentions_count": $METRIC_MENTIONS
    }
  }
}
EOF

echo "📄 Results saved to: $RESULTS_DIR/adaptive_thresholds_validation.json"

exit $((100 - THRESHOLD_SCORE))