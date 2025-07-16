#!/bin/bash
# Technical Nomenclature Validation Script

command_file="$1"
if [ ! -f "$command_file" ]; then
    echo "Error: Command file not found: $command_file"
    exit 1
fi

# Check universal naming standards
kebab_case_compliance=$(grep -c -E '^[a-z]+(-[a-z]+)*:' "$command_file" || echo "0")
camel_case_usage=$(grep -c -E '\b[a-z]+[A-Z][a-zA-Z]*\b' "$command_file" || echo "0")
consistent_capitalization=$(grep -c -E '^## [A-Z]' "$command_file" || echo "0")

# Domain-specific pattern validation
command_patterns=$(grep -c -E '/[a-z-]+' "$command_file" || echo "0")
principle_references=$(grep -c -E 'Principle #[0-9]+' "$command_file" || echo "0")
standard_terminology=$(grep -c -E '\b(execution|validation|optimization|integration)\b' "$command_file" || echo "0")

# Calculate nomenclature scores - Fix division by zero
total_headers=$(grep -c '^##' "$command_file" || echo "1")
if [ "$total_headers" -eq 0 ]; then
    total_headers=1
fi
naming_consistency=$(echo "scale=4; $consistent_capitalization / $total_headers" | bc)
domain_alignment=$(echo "scale=4; ($command_patterns + $principle_references + $standard_terminology) / 50.0" | bc)
# Fix bc comparison - Handle empty results
domain_check=$(echo "$domain_alignment > 1.0" | bc -l 2>/dev/null || echo "0")
if [ "$domain_check" = "1" ]; then
    domain_alignment="1.0000"
fi

# Overall nomenclature compliance
nomenclature_compliance=$(echo "scale=4; ($naming_consistency * 0.5) + ($domain_alignment * 0.5)" | bc)

# Output results
cat > "/Users/nalve/claude-context-engineering/scripts/results/nomenclature/technical_nomenclature_validation.json" << EOM
{
  "technical_nomenclature_validation": {
    "timestamp": "$(date -Iseconds)",
    "file_analyzed": "$command_file",
    "nomenclature_metrics": {
      "naming_consistency": $naming_consistency,
      "domain_alignment": $domain_alignment,
      "nomenclature_compliance": $nomenclature_compliance,
      "kebab_case_count": $kebab_case_compliance,
      "command_patterns": $command_patterns,
      "principle_references": $principle_references
    },
    "compliance_status": {
      "naming_status": "$(naming_check=$(echo "$naming_consistency >= 0.95" | bc -l 2>/dev/null || echo "0"); [ "$naming_check" = "1" ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "domain_status": "$(domain_status_check=$(echo "$domain_alignment >= 0.90" | bc -l 2>/dev/null || echo "0"); [ "$domain_status_check" = "1" ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "overall_nomenclature": "$(nomenclature_check=$(echo "$nomenclature_compliance >= 0.95" | bc -l 2>/dev/null || echo "0"); [ "$nomenclature_check" = "1" ] && echo "COMPLIANT" || echo "NON_COMPLIANT")"
    }
  }
}
EOM

echo "Technical nomenclature validation completed. Results saved to technical_nomenclature_validation.json"
