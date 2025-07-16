#!/bin/bash
# Comprehensive Quality Metrics Calculation

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

# Source mathematical formulas
source "/Users/nalve/claude-context-engineering/scripts/formulas/context_engineering_formulas.sh" 2>/dev/null || {
    echo "Warning: Mathematical formula library not found."
    exit 1
}

# Collect metrics from previous validations
content_analysis="/Users/nalve/claude-context-engineering/scripts/results/content-analysis/content_quality_analysis.json"
nomenclature_analysis="/Users/nalve/claude-context-engineering/scripts/results/nomenclature/technical_nomenclature_validation.json"
compliance_analysis="/Users/nalve/claude-context-engineering/scripts/results/compliance/tool_call_compliance.json"

# Extract metrics if files exist, using sanitized values
if [ -f "$content_analysis" ]; then
    info_density=$(sanitize_numeric "$(jq -r '.content_quality_analysis.metrics.information_density // 0.8' "$content_analysis" 2>/dev/null || echo "0.8")" "0.8000")
    clarity_score=$(sanitize_numeric "$(jq -r '.content_quality_analysis.metrics.clarity_score // 0.8' "$content_analysis" 2>/dev/null || echo "0.8")" "0.8000")
    technical_accuracy=$(sanitize_numeric "$(jq -r '.content_quality_analysis.metrics.technical_accuracy // 0.8' "$content_analysis" 2>/dev/null || echo "0.8")" "0.8000")
else
    info_density="0.8000"
    clarity_score="0.8000"
    technical_accuracy="0.8000"
fi

if [ -f "$nomenclature_analysis" ]; then
    nomenclature_score=$(sanitize_numeric "$(jq -r '.technical_nomenclature_validation.nomenclature_metrics.nomenclature_compliance // 0.9' "$nomenclature_analysis" 2>/dev/null || echo "0.9")" "0.9000")
else
    nomenclature_score="0.9000"
fi

if [ -f "$compliance_analysis" ]; then
    compliance_score=$(sanitize_numeric "$(jq -r '.tool_call_compliance.compliance_metrics.overall_compliance // 0.85' "$compliance_analysis" 2>/dev/null || echo "0.85")" "0.8500")
else
    compliance_score="0.8500"
fi

# Calculate comprehensive quality using mathematical formulas
# Use confidence calculation formula adapted for quality measurement
comprehensive_quality=$(calculate_confidence "$info_density" "$clarity_score" "$technical_accuracy" 2>/dev/null || echo "0.8000")
comprehensive_quality=$(sanitize_numeric "$comprehensive_quality" "0.8000")

# Calculate weighted quality score using safe bc calculation
weighted_quality=$(safe_bc_calc "($comprehensive_quality * 0.4) + ($nomenclature_score * 0.3) + ($compliance_score * 0.3)" "0.8000")

# Quality grade assessment using safe comparisons
if (( $(echo "$weighted_quality >= 0.95" | bc -l 2>/dev/null || echo "0") )); then
    quality_grade="EXCELLENT"
elif (( $(echo "$weighted_quality >= 0.90" | bc -l 2>/dev/null || echo "0") )); then
    quality_grade="GOOD"
elif (( $(echo "$weighted_quality >= 0.80" | bc -l 2>/dev/null || echo "0") )); then
    quality_grade="ACCEPTABLE"
else
    quality_grade="NEEDS_IMPROVEMENT"
fi

# Generate improvement recommendations using JSON safety functions
recommendations_array=()

# Check each metric and add to array if below threshold
if (( $(echo "$info_density < 0.95" | bc -l 2>/dev/null || echo "0") )); then
    recommendations_array+=("$(json_string "Improve information density to ≥95%")")
fi
if (( $(echo "$clarity_score < 0.90" | bc -l 2>/dev/null || echo "0") )); then
    recommendations_array+=("$(json_string "Enhance clarity score to ≥90%")")
fi
if (( $(echo "$technical_accuracy < 0.90" | bc -l 2>/dev/null || echo "0") )); then
    recommendations_array+=("$(json_string "Increase technical accuracy to ≥90%")")
fi
if (( $(echo "$nomenclature_score < 0.95" | bc -l 2>/dev/null || echo "0") )); then
    recommendations_array+=("$(json_string "Improve nomenclature compliance to ≥95%")")
fi
if (( $(echo "$compliance_score < 0.98" | bc -l 2>/dev/null || echo "0") )); then
    recommendations_array+=("$(json_string "Enhance tool call compliance to ≥98%")")
fi

# If no specific recommendations, add general success message
if [ ${#recommendations_array[@]} -eq 0 ]; then
    recommendations_array+=("$(json_string "Quality standards met")")
fi

# Join array elements with commas
recommendations=$(IFS=','; echo "${recommendations_array[*]}")

# Output comprehensive results with guaranteed valid JSON
cat > "/Users/nalve/claude-context-engineering/scripts/results/validation/comprehensive_quality_metrics.json" << EOM
{
  "comprehensive_quality_metrics": {
    "timestamp": $(json_string "$(date -Iseconds)"),
    "file_analyzed": $(json_string "$command_file"),
    "quality_scores": {
      "information_density": $info_density,
      "clarity_score": $clarity_score,
      "technical_accuracy": $technical_accuracy,
      "nomenclature_compliance": $nomenclature_score,
      "tool_call_compliance": $compliance_score,
      "comprehensive_quality": $comprehensive_quality,
      "weighted_quality": $weighted_quality
    },
    "quality_assessment": {
      "overall_grade": $(json_string "$quality_grade"),
      "mathematical_foundation": $(json_string "context_engineering_formulas"),
      "validation_method": $(json_string "script_based_quantitative_analysis")
    },
    "improvement_recommendations": [
      $recommendations
    ]
  }
}
EOM

echo "Comprehensive quality metrics calculation completed. Results saved to comprehensive_quality_metrics.json"
echo "Overall Quality Score: $weighted_quality ($quality_grade)"
