#!/bin/bash
# Natural Language Compliance Validation (Principle #6)

command_file="$1"
if [ ! -f "$command_file" ]; then
    echo "Error: Command file not found: $command_file"
    exit 1
fi

# Check for human-readable language patterns
technical_jargon=$(grep -c -E '\b(API|HTTP|JSON|XML|SQL|CRUD)\b' "$command_file" || echo "0")
explanatory_text=$(grep -c -E 'means|explains|in other words|simply put' "$command_file" || echo "0")
total_sentences=$(grep -o -E '[.!?]+' "$command_file" | wc -l)

# Calculate accessibility score - Fix division by zero
if [ "$total_sentences" -eq 0 ]; then
    total_sentences=1
fi
accessibility_base=$(echo "scale=4; 1.0 - ($technical_jargon / ($total_sentences + 1))" | bc)
explanation_boost=$(echo "scale=4; $explanatory_text * 0.1" | bc)
accessibility_score=$(echo "scale=4; $accessibility_base + $explanation_boost" | bc)
# Fix bc comparison - Handle empty results
accessibility_check=$(echo "$accessibility_score > 1.0" | bc -l 2>/dev/null || echo "0")
if [ "$accessibility_check" = "1" ]; then
    accessibility_score="1.0000"
fi

# Check instruction clarity
imperative_verbs=$(grep -c -E '\b(Execute|Apply|Use|Create|Validate|Implement|Analyze)\b' "$command_file" || echo "0")
step_indicators=$(grep -c -E 'Step [0-9]|Phase [0-9]|[0-9]\.' "$command_file" || echo "0")
instruction_clarity=$(echo "scale=4; ($imperative_verbs + $step_indicators) / 20.0" | bc)
# Fix bc comparison - Handle empty results
clarity_check=$(echo "$instruction_clarity > 1.0" | bc -l 2>/dev/null || echo "0")
if [ "$clarity_check" = "1" ]; then
    instruction_clarity="1.0000"
fi

# Principle #6 compliance assessment
principle_6_compliance=$(echo "scale=4; ($accessibility_score * 0.6) + ($instruction_clarity * 0.4)" | bc)

# Output results
cat > "/Users/nalve/claude-context-engineering/scripts/results/content-analysis/natural_language_compliance.json" << EOM
{
  "natural_language_compliance": {
    "timestamp": "$(date -Iseconds)",
    "file_analyzed": "$command_file",
    "principle_6_metrics": {
      "accessibility_score": $accessibility_score,
      "instruction_clarity": $instruction_clarity,
      "principle_6_compliance": $principle_6_compliance,
      "technical_jargon_count": $technical_jargon,
      "explanatory_elements": $explanatory_text
    },
    "compliance_status": {
      "accessibility_status": "$(accessibility_status_check=$(echo "$accessibility_score >= 0.90" | bc -l 2>/dev/null || echo "0"); [ "$accessibility_status_check" = "1" ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "clarity_status": "$(clarity_status_check=$(echo "$instruction_clarity >= 0.85" | bc -l 2>/dev/null || echo "0"); [ "$clarity_status_check" = "1" ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "overall_principle_6": "$(compliance_status_check=$(echo "$principle_6_compliance >= 0.95" | bc -l 2>/dev/null || echo "0"); [ "$compliance_status_check" = "1" ] && echo "COMPLIANT" || echo "NON_COMPLIANT")"
    }
  }
}
EOM

echo "Natural language compliance validation completed. Results saved to natural_language_compliance.json"
