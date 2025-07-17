#!/bin/bash

# Script: validate-p56-transparency.sh  
# Purpose: Validate P56 Command Execution Transparency compliance
# Usage: ./validate-p56-transparency.sh [command_file_path]

source "$(dirname "$0")/../core/compact-notifications.sh"

COMMAND_FILE="$1"
SCRIPT_DIR="$(dirname "$0")"
RESULTS_DIR="$SCRIPT_DIR/../results/compliance"
START_TIME=$(date +%s)

mkdir -p "$RESULTS_DIR"

# Initialize validation results
TRANSPARENCY_SCORE=0
TOTAL_CHECKS=5
PASSED_CHECKS=0

cn_status "info" "P56 Transparency Validation" "$COMMAND_FILE"

if [ ! -f "$COMMAND_FILE" ]; then
    cn_error "$COMMAND_FILE" "" "File not found" "exit"
    exit 1
fi

# Check 1: Visual announcement protocol
if grep -q "visual announcement" "$COMMAND_FILE" && grep -q "P56" "$COMMAND_FILE"; then
    cn_status "ok" "Visual announcement" "found"
    ((PASSED_CHECKS++))
else
    cn_status "warn" "Visual announcement" "missing"
fi

# Check 2: Progress tracking requirements  
if grep -q "progress.*track" "$COMMAND_FILE" && grep -q "real-time" "$COMMAND_FILE"; then
    cn_status "ok" "Progress tracking" "found"
    ((PASSED_CHECKS++))
else
    cn_status "warn" "Progress tracking" "missing"
fi

# Check 3: Tool call documentation
if grep -q "tool call.*documentation" "$COMMAND_FILE" || grep -q "TOOL CALL EXECUTION" "$COMMAND_FILE"; then
    cn_status "ok" "Tool call docs" "found"
    ((PASSED_CHECKS++))
else
    cn_status "warn" "Tool call docs" "missing"
fi

# Check 4: Success metrics display
if grep -q "success.*metric" "$COMMAND_FILE" || grep -q "performance.*tracking" "$COMMAND_FILE"; then
    cn_status "ok" "Success metrics" "found"
    ((PASSED_CHECKS++))
else
    cn_status "warn" "Success metrics" "missing"
fi

# Check 5: Compliance requirements
if grep -q "Compliance.*P56" "$COMMAND_FILE" || grep -q "transparency.*requirement" "$COMMAND_FILE"; then
    cn_status "ok" "P56 compliance" "found"
    ((PASSED_CHECKS++))
else
    cn_status "warn" "P56 compliance" "missing"
fi

# Calculate results
TRANSPARENCY_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
ELAPSED_TIME=$(($(date +%s) - START_TIME))
STATUS=$([ $TRANSPARENCY_SCORE -ge 80 ] && echo "COMPLIANT" || echo "NEEDS_IMPROVEMENT")

cn_validation "P56=$STATUS" "Checks=$PASSED_CHECKS/$TOTAL_CHECKS" "Score=$TRANSPARENCY_SCORE%" "time=$(cn_format_time $ELAPSED_TIME)"

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