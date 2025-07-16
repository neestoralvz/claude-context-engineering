#!/bin/bash
# Content Quality Analysis Script with Mathematical Precision

command_file="$1"
if [ ! -f "$command_file" ]; then
    echo "Error: Command file not found: $command_file"
    exit 1
fi

# Source mathematical formulas
source "/Users/nalve/claude-context-engineering/scripts/formulas/context_engineering_formulas.sh" 2>/dev/null || {
    echo "Warning: Mathematical formula library not found. Run verify-mathematical-formulas.sh first."
    exit 1
}

# Content analysis metrics
total_words=$(wc -w < "$command_file")
total_lines=$(wc -l < "$command_file")
total_chars=$(wc -c < "$command_file")

# Information density calculation (meaningful content vs total content)
meaningful_lines=$(grep -E "^[#]*[[:space:]]*[A-Za-z]" "$command_file" | wc -l)
information_density=$(echo "scale=4; $meaningful_lines / $total_lines" | bc)

# Clarity score based on sentence structure and readability
avg_words_per_line=$(echo "scale=2; $total_words / $total_lines" | bc)
clarity_base=$(echo "scale=4; if ($avg_words_per_line <= 15) 1.0 else (15 / $avg_words_per_line)" | bc)

# Technical accuracy assessment (presence of required elements)
has_purpose=$(grep -c "Purpose" "$command_file" || echo "0")
has_examples=$(grep -c -i "example\|sample" "$command_file" || echo "0")
has_structure=$(grep -c "##\|###" "$command_file" || echo "0")
technical_score=$(echo "scale=4; ($has_purpose + $has_examples + $has_structure) / 10.0" | bc)
if (( $(echo "$technical_score > 1.0" | bc -l) )); then
    technical_score="1.0000"
fi

# Natural language compliance (human readability factors)
complex_words=$(grep -o -E '\b[A-Za-z]{12,}\b' "$command_file" | wc -l)
total_words_clean=$(grep -o -E '\b[A-Za-z]+\b' "$command_file" | wc -l)
readability_score=$(echo "scale=4; 1.0 - ($complex_words / $total_words_clean)" | bc)

# Output results in JSON format
cat > "/Users/nalve/claude-context-engineering/scripts/results/content-analysis/content_quality_analysis.json" << EOM
{
  "content_quality_analysis": {
    "timestamp": "$(date -Iseconds)",
    "file_analyzed": "$command_file",
    "metrics": {
      "information_density": $information_density,
      "clarity_score": $clarity_base,
      "technical_accuracy": $technical_score,
      "readability_score": $readability_score,
      "total_words": $total_words,
      "total_lines": $total_lines,
      "meaningful_lines": $meaningful_lines
    },
    "quality_assessment": {
      "information_density_status": "$([ $(echo "$information_density >= 0.95" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "clarity_status": "$([ $(echo "$clarity_base >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "technical_status": "$([ $(echo "$technical_score >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "readability_status": "$([ $(echo "$readability_score >= 0.85" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")"
    }
  }
}
EOM

echo "Content quality analysis completed. Results saved to content_quality_analysis.json"
