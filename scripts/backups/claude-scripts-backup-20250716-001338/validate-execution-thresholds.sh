#!/bin/bash

# Context Engineering - Execution Threshold Validator
# Validates mathematical thresholds for Principle #55 compliance

echo "🎯 Context Engineering - Execution Threshold Validator"
echo "====================================================="
echo ""

# Source mathematical formulas
FORMULAS_DIR="/Users/nalve/claude-context-engineering/scripts/formulas"
if [ -f "$FORMULAS_DIR/context_engineering_formulas.sh" ]; then
    source "$FORMULAS_DIR/context_engineering_formulas.sh"
    echo "✅ Mathematical formulas loaded successfully"
else
    echo "❌ Error: Mathematical formulas not found"
    exit 1
fi

echo ""
echo "🧮 PHASE 1: MATHEMATICAL THRESHOLD VALIDATION"
echo "============================================="

# Get latest compliance report
LATEST_REPORT=$(ls -t scripts/results/p55-compliance/p55-compliance-report-*.json 2>/dev/null | head -1)

if [ -z "$LATEST_REPORT" ]; then
    echo "❌ Error: No P55 compliance report found. Run generate-p55-compliance-report.sh first"
    exit 1
fi

echo "📊 Analyzing latest report: $LATEST_REPORT"

# Extract metrics from JSON report using grep and sed
TOOL_CALL_RATIO=$(grep '"tool_call_execution_ratio"' "$LATEST_REPORT" | sed 's/.*: \([0-9.]*\).*/\1/')
REAL_WORK_RATIO=$(grep '"real_work_ratio"' "$LATEST_REPORT" | sed 's/.*: \([0-9.]*\).*/\1/')
SCRIPT_EXECUTION_RATIO=$(grep '"script_execution_ratio"' "$LATEST_REPORT" | sed 's/.*: \([0-9.]*\).*/\1/')

echo ""
echo "📈 Current Metrics:"
echo "  Tool Call Execution Ratio: $TOOL_CALL_RATIO"
echo "  Real Work Ratio: $REAL_WORK_RATIO"
echo "  Script Execution Ratio: $SCRIPT_EXECUTION_RATIO"

echo ""
echo "🔍 PHASE 2: THRESHOLD COMPLIANCE ANALYSIS"
echo "========================================="

# Define thresholds
TOOL_CALL_THRESHOLD="0.80"    # 80%
REAL_WORK_THRESHOLD="0.70"    # 70%
SCRIPT_EXEC_THRESHOLD="0.95"  # 95%

# Mathematical validation using bc
TOOL_CALL_COMPLIANT=$(echo "$TOOL_CALL_RATIO >= $TOOL_CALL_THRESHOLD" | bc)
REAL_WORK_COMPLIANT=$(echo "$REAL_WORK_RATIO >= $REAL_WORK_THRESHOLD" | bc)
SCRIPT_EXEC_COMPLIANT=$(echo "$SCRIPT_EXECUTION_RATIO >= $SCRIPT_EXEC_THRESHOLD" | bc)

# Calculate deviations
TOOL_CALL_DEVIATION=$(echo "scale=4; $TOOL_CALL_RATIO - $TOOL_CALL_THRESHOLD" | bc)
REAL_WORK_DEVIATION=$(echo "scale=4; $REAL_WORK_RATIO - $REAL_WORK_THRESHOLD" | bc)
SCRIPT_EXEC_DEVIATION=$(echo "scale=4; $SCRIPT_EXECUTION_RATIO - $SCRIPT_EXEC_THRESHOLD" | bc)

echo "🎯 Threshold Analysis:"
echo "  Tool Call Execution:"
echo "    Current: $(echo "scale=1; $TOOL_CALL_RATIO * 100" | bc)%"
echo "    Threshold: $(echo "scale=1; $TOOL_CALL_THRESHOLD * 100" | bc)%"
echo "    Deviation: $([ $(echo "$TOOL_CALL_DEVIATION >= 0" | bc) -eq 1 ] && echo "+")$(echo "scale=1; $TOOL_CALL_DEVIATION * 100" | bc)%"
echo "    Status: $([ $TOOL_CALL_COMPLIANT -eq 1 ] && echo "✅ COMPLIANT" || echo "❌ NON-COMPLIANT")"

echo ""
echo "  Real Work Execution:"
echo "    Current: $(echo "scale=1; $REAL_WORK_RATIO * 100" | bc)%"
echo "    Threshold: $(echo "scale=1; $REAL_WORK_THRESHOLD * 100" | bc)%"
echo "    Deviation: $([ $(echo "$REAL_WORK_DEVIATION >= 0" | bc) -eq 1 ] && echo "+")$(echo "scale=1; $REAL_WORK_DEVIATION * 100" | bc)%"
echo "    Status: $([ $REAL_WORK_COMPLIANT -eq 1 ] && echo "✅ COMPLIANT" || echo "❌ NON-COMPLIANT")"

echo ""
echo "  Script Execution:"
echo "    Current: $(echo "scale=1; $SCRIPT_EXECUTION_RATIO * 100" | bc)%"
echo "    Threshold: $(echo "scale=1; $SCRIPT_EXEC_THRESHOLD * 100" | bc)%"
echo "    Deviation: $([ $(echo "$SCRIPT_EXEC_DEVIATION >= 0" | bc) -eq 1 ] && echo "+")$(echo "scale=1; $SCRIPT_EXEC_DEVIATION * 100" | bc)%"
echo "    Status: $([ $SCRIPT_EXEC_COMPLIANT -eq 1 ] && echo "✅ COMPLIANT" || echo "❌ NON-COMPLIANT")"

echo ""
echo "🧮 PHASE 3: STATISTICAL CONFIDENCE CALCULATION"
echo "=============================================="

# Calculate overall compliance confidence using context engineering formulas
TOTAL_COMPLIANT=$((TOOL_CALL_COMPLIANT + REAL_WORK_COMPLIANT + SCRIPT_EXEC_COMPLIANT))
COMPLIANCE_RATE=$(echo "scale=4; $TOTAL_COMPLIANT / 3" | bc)
CONFIDENCE_SCORE=$(echo "scale=2; $COMPLIANCE_RATE * 10" | bc)

echo "📊 Statistical Summary:"
echo "  Compliant Metrics: $TOTAL_COMPLIANT/3"
echo "  Compliance Rate: $(echo "scale=1; $COMPLIANCE_RATE * 100" | bc)%"
echo "  Confidence Score: $CONFIDENCE_SCORE/10.0"

# Calculate statistical significance
P_VALUE=$(echo "scale=4; 1 - $COMPLIANCE_RATE" | bc)
STATISTICAL_SIGNIFICANCE=$(echo "$P_VALUE <= 0.05" | bc)

echo "  P-Value: $P_VALUE"
echo "  Statistical Significance: $([ $STATISTICAL_SIGNIFICANCE -eq 1 ] && echo "✅ SIGNIFICANT (p ≤ 0.05)" || echo "⚠️  NOT SIGNIFICANT (p > 0.05)")"

echo ""
echo "🏆 PHASE 4: OVERALL THRESHOLD VALIDATION"
echo "========================================"

# Overall compliance determination
if [ $TOOL_CALL_COMPLIANT -eq 1 ] && [ $REAL_WORK_COMPLIANT -eq 1 ] && [ $SCRIPT_EXEC_COMPLIANT -eq 1 ]; then
    OVERALL_STATUS="PASSED"
    STATUS_COLOR="\033[32m" # Green
    EXIT_CODE=0
else
    OVERALL_STATUS="FAILED"
    STATUS_COLOR="\033[31m" # Red
    EXIT_CODE=1
fi

echo -e "🎯 THRESHOLD VALIDATION RESULT: ${STATUS_COLOR}${OVERALL_STATUS}\033[0m"
echo ""

if [ "$OVERALL_STATUS" = "FAILED" ]; then
    echo "🔧 REMEDIATION RECOMMENDATIONS:"
    echo "==============================="
    
    if [ $TOOL_CALL_COMPLIANT -eq 0 ]; then
        echo "  ❌ Tool Call Execution below 80%"
        echo "     → Increase use of Bash, Read, Write, Edit tools"
        echo "     → Reduce descriptive language, increase actual execution"
    fi
    
    if [ $REAL_WORK_COMPLIANT -eq 0 ]; then
        echo "  ❌ Real Work Ratio below 70%"
        echo "     → Execute commands instead of describing them"
        echo "     → Use tool calls for concrete actions"
    fi
    
    if [ $SCRIPT_EXEC_COMPLIANT -eq 0 ]; then
        echo "  ❌ Script Execution Rate below 95%"
        echo "     → Actually run scripts instead of just referencing them"
        echo "     → Implement script execution validation"
    fi
    echo ""
fi

echo "📊 Validation complete. Report available in: $LATEST_REPORT"
echo ""

# Generate threshold validation timestamp
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S")
echo "✅ Threshold validation completed at: $TIMESTAMP"

exit $EXIT_CODE