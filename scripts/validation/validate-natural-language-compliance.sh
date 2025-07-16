#!/bin/bash
# Natural Language Compliance Validation (Principle #6)

# Source JSON safety functions
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$script_dir/json_safety_functions.sh" || {
    echo "Error: JSON safety functions not found"
    exit 1
}

command_file="$1"
if [ ! -f "$command_file" ]; then
    echo "Error: Command file not found: $command_file"
    exit 1
fi

# Check for human-readable language patterns
technical_jargon=$(sanitize_integer "$(grep -c -E '\b(API|HTTP|JSON|XML|SQL|CRUD)\b' "$command_file" 2>/dev/null || echo "0")" "0")
explanatory_text=$(sanitize_integer "$(grep -c -E 'means|explains|in other words|simply put' "$command_file" 2>/dev/null || echo "0")" "0")
total_sentences=$(sanitize_integer "$(grep -o -E '[.!?]+' "$command_file" 2>/dev/null | wc -l || echo "1")" "1")

# Calculate accessibility score using safe bc calculation
accessibility_base=$(safe_bc_calc "1.0 - ($technical_jargon / ($total_sentences + 1))" "0.8000")
explanation_boost=$(safe_bc_calc "$explanatory_text * 0.1" "0.0000")
accessibility_raw=$(safe_bc_calc "$accessibility_base + $explanation_boost" "0.8000")
accessibility_score=$(safe_bc_calc "if ($accessibility_raw > 1.0) 1.0 else $accessibility_raw" "$accessibility_raw")

# Check instruction clarity
imperative_verbs=$(sanitize_integer "$(grep -c -E '\b(Execute|Apply|Use|Create|Validate|Implement|Analyze)\b' "$command_file" 2>/dev/null || echo "0")" "0")
step_indicators=$(sanitize_integer "$(grep -c -E 'Step [0-9]|Phase [0-9]|[0-9]\.' "$command_file" 2>/dev/null || echo "0")" "0")
instruction_clarity_raw=$(safe_bc_calc "($imperative_verbs + $step_indicators) / 20.0" "0.0000")
instruction_clarity=$(safe_bc_calc "if ($instruction_clarity_raw > 1.0) 1.0 else $instruction_clarity_raw" "$instruction_clarity_raw")

# Principle #6 compliance assessment
principle_6_compliance=$(safe_bc_calc "($accessibility_score * 0.6) + ($instruction_clarity * 0.4)" "0.8000")

# Generate compliance status using JSON safety functions
accessibility_status=$(json_string "$([ $(echo "$accessibility_score >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")")
clarity_status=$(json_string "$([ $(echo "$instruction_clarity >= 0.85" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")")
overall_status=$(json_string "$([ $(echo "$principle_6_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")")

# Output results with guaranteed valid JSON
cat > "/Users/nalve/claude-context-engineering/scripts/results/content-analysis/natural_language_compliance.json" << EOM
{
  "natural_language_compliance": {
    "timestamp": $(json_string "$(date -Iseconds)"),
    "file_analyzed": $(json_string "$command_file"),
    "principle_6_metrics": {
      "accessibility_score": $accessibility_score,
      "instruction_clarity": $instruction_clarity,
      "principle_6_compliance": $principle_6_compliance,
      "technical_jargon_count": $technical_jargon,
      "explanatory_elements": $explanatory_text
    },
    "compliance_status": {
      "accessibility_status": $accessibility_status,
      "clarity_status": $clarity_status,
      "overall_principle_6": $overall_status
    }
  }
}
EOM

echo "Natural language compliance validation completed. Results saved to natural_language_compliance.json"
