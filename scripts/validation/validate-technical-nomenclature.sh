#!/bin/bash
# Technical Nomenclature Validation Script

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

# Check universal naming standards using sanitized inputs
kebab_case_compliance=$(sanitize_integer "$(grep -c -E '^[a-z]+(-[a-z]+)*:' "$command_file" 2>/dev/null || echo "0")" "0")
camel_case_usage=$(sanitize_integer "$(grep -c -E '\b[a-z]+[A-Z][a-zA-Z]*\b' "$command_file" 2>/dev/null || echo "0")" "0")
consistent_capitalization=$(sanitize_integer "$(grep -c -E '^## [A-Z]' "$command_file" 2>/dev/null || echo "0")" "0")

# Domain-specific pattern validation
command_patterns=$(sanitize_integer "$(grep -c -E '/[a-z-]+' "$command_file" 2>/dev/null || echo "0")" "0")
principle_references=$(sanitize_integer "$(grep -c -E 'Principle #[0-9]+' "$command_file" 2>/dev/null || echo "0")" "0")
standard_terminology=$(sanitize_integer "$(grep -c -E '\b(execution|validation|optimization|integration)\b' "$command_file" 2>/dev/null || echo "0")" "0")

# Calculate nomenclature scores using safe bc calculation
total_headers=$(sanitize_integer "$(grep -c '^##' "$command_file" 2>/dev/null || echo "1")" "1")
naming_consistency=$(safe_bc_calc "$consistent_capitalization / $total_headers" "0.0000")
domain_alignment_raw=$(safe_bc_calc "($command_patterns + $principle_references + $standard_terminology) / 50.0" "0.0000")
domain_alignment=$(safe_bc_calc "if ($domain_alignment_raw > 1.0) 1.0 else $domain_alignment_raw" "$domain_alignment_raw")

# Overall nomenclature compliance
nomenclature_compliance=$(safe_bc_calc "($naming_consistency * 0.5) + ($domain_alignment * 0.5)" "0.0000")

# Generate compliance status using JSON safety functions
naming_status=$(json_string "$([ $(echo "$naming_consistency >= 0.95" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")")
domain_status=$(json_string "$([ $(echo "$domain_alignment >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")")
overall_nomenclature=$(json_string "$([ $(echo "$nomenclature_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")")

# Output results with guaranteed valid JSON
cat > "/Users/nalve/claude-context-engineering/scripts/results/nomenclature/technical_nomenclature_validation.json" << EOM
{
  "technical_nomenclature_validation": {
    "timestamp": $(json_string "$(date -Iseconds)"),
    "file_analyzed": $(json_string "$command_file"),
    "nomenclature_metrics": {
      "naming_consistency": $naming_consistency,
      "domain_alignment": $domain_alignment,
      "nomenclature_compliance": $nomenclature_compliance,
      "kebab_case_count": $kebab_case_compliance,
      "command_patterns": $command_patterns,
      "principle_references": $principle_references
    },
    "compliance_status": {
      "naming_status": $naming_status,
      "domain_status": $domain_status,
      "overall_nomenclature": $overall_nomenclature
    }
  }
}
EOM

echo "Technical nomenclature validation completed. Results saved to technical_nomenclature_validation.json"
