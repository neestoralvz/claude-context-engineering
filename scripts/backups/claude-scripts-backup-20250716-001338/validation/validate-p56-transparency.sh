#!/bin/bash

# Script: validate-p56-transparency.sh
# Purpose: Validate P56 Command Execution Transparency compliance
# Usage: ./validate-p56-transparency.sh [command_file_path]

COMMAND_FILE="$1"
SCRIPT_DIR="$(dirname "$0")"
RESULTS_DIR="$SCRIPT_DIR/../results/compliance"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Initialize validation results
TRANSPARENCY_SCORE=0
TOTAL_CHECKS=5
PASSED_CHECKS=0

echo "🛡️ P56 Transparency Compliance Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Command File: $COMMAND_FILE"
echo "Timestamp: $(date)"

if [ ! -f "$COMMAND_FILE" ]; then
    echo "❌ ERROR: Command file not found: $COMMAND_FILE"
    exit 1
fi

# Check 1: Visual Announcement Protocol
echo "🔍 Checking visual announcement protocol..."
if grep -q "visual announcement" "$COMMAND_FILE" && grep -q "P56" "$COMMAND_FILE"; then
    echo "✅ Visual announcement protocol found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Visual announcement protocol missing or incomplete"
fi

# Check 2: Progress Tracking Requirements
echo "🔍 Checking progress tracking requirements..."
if grep -q "progress.*track" "$COMMAND_FILE" && grep -q "real-time" "$COMMAND_FILE"; then
    echo "✅ Progress tracking requirements found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Progress tracking requirements missing"
fi

# Check 3: Tool Call Documentation
echo "🔍 Checking tool call documentation..."
if grep -q "tool call.*documentation" "$COMMAND_FILE" || grep -q "TOOL CALL EXECUTION" "$COMMAND_FILE"; then
    echo "✅ Tool call documentation found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Tool call documentation missing"
fi

# Check 4: Success Metrics Display
echo "🔍 Checking success metrics display..."
if grep -q "success.*metric" "$COMMAND_FILE" || grep -q "performance.*tracking" "$COMMAND_FILE"; then
    echo "✅ Success metrics display found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ Success metrics display missing"
fi

# Check 5: Compliance Requirements
echo "🔍 Checking P56 compliance requirements..."
if grep -q "Compliance.*P56" "$COMMAND_FILE" || grep -q "transparency.*requirement" "$COMMAND_FILE"; then
    echo "✅ P56 compliance requirements found"
    ((PASSED_CHECKS++))
else
    echo "⚠️ P56 compliance requirements missing"
fi

# Calculate transparency score
TRANSPARENCY_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 P56 Transparency Validation Results:"
echo "   ├── Checks Passed: $PASSED_CHECKS/$TOTAL_CHECKS"
echo "   ├── Transparency Score: $TRANSPARENCY_SCORE%"
echo "   └── Status: $([ $TRANSPARENCY_SCORE -ge 80 ] && echo "✅ COMPLIANT" || echo "⚠️ NEEDS IMPROVEMENT")"

# Generate JSON report
cat > "$RESULTS_DIR/p56_transparency_validation.json" <<EOF
{
  "command_file": "$COMMAND_FILE",
  "timestamp": "$(date -Iseconds)",
  "p56_transparency_validation": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "transparency_score": $TRANSPARENCY_SCORE,
    "status": "$([ $TRANSPARENCY_SCORE -ge 80 ] && echo "compliant" || echo "needs_improvement")",
    "check_details": {
      "visual_announcement_protocol": $([ $(grep -c "visual announcement" "$COMMAND_FILE" && grep -c "P56" "$COMMAND_FILE") -gt 0 ] && echo "true" || echo "false"),
      "progress_tracking_requirements": $([ $(grep -c "progress.*track" "$COMMAND_FILE" && grep -c "real-time" "$COMMAND_FILE") -gt 0 ] && echo "true" || echo "false"),
      "tool_call_documentation": $([ $(grep -c "tool call.*documentation" "$COMMAND_FILE" || grep -c "TOOL CALL EXECUTION" "$COMMAND_FILE") -gt 0 ] && echo "true" || echo "false"),
      "success_metrics_display": $([ $(grep -c "success.*metric" "$COMMAND_FILE" || grep -c "performance.*tracking" "$COMMAND_FILE") -gt 0 ] && echo "true" || echo "false"),
      "compliance_requirements": $([ $(grep -c "Compliance.*P56" "$COMMAND_FILE" || grep -c "transparency.*requirement" "$COMMAND_FILE") -gt 0 ] && echo "true" || echo "false")
    }
  }
}
EOF

echo "📄 Results saved to: $RESULTS_DIR/p56_transparency_validation.json"

exit $((100 - TRANSPARENCY_SCORE))