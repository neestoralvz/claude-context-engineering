#!/bin/bash
# Tool Call Compliance Validation (Principles #55 & #56)

command_file="$1"
if [ ! -f "$command_file" ]; then
    echo "Error: Command file not found: $command_file"
    exit 1
fi

# Check for tool call execution requirements
tool_call_mentions=$(grep -c -E 'TOOL CALL|BASH TOOL|READ TOOL|EDIT TOOL|TASK TOOL' "$command_file" || echo "0")
execution_requirements=$(grep -c -E 'EXECUTION REQUIRED|MANDATORY|MUST' "$command_file" || echo "0")
simulation_prevention=$(grep -c -E 'never simulate|no simulation|real execution' "$command_file" || echo "0")

# Check for P56 transparency elements
visual_announcements=$(grep -c -E 'visual announcement|╔═══|║' "$command_file" || echo "0")
progress_tracking=$(grep -c -E 'progress|status|tracking' "$command_file" || echo "0")
transparency_elements=$(grep -c -E 'transparency|visible|announce' "$command_file" || echo "0")

# Calculate compliance scores
total_sections=$(grep -c '^###' "$command_file" || echo "1")
p55_compliance=$(echo "scale=4; ($tool_call_mentions + $execution_requirements + $simulation_prevention) / ($total_sections * 3)" | bc)
if (( $(echo "$p55_compliance > 1.0" | bc -l) )); then
    p55_compliance="1.0000"
fi

p56_compliance=$(echo "scale=4; ($visual_announcements + $progress_tracking + $transparency_elements) / ($total_sections * 2)" | bc)
if (( $(echo "$p56_compliance > 1.0" | bc -l) )); then
    p56_compliance="1.0000"
fi

# Overall tool call compliance
overall_compliance=$(echo "scale=4; ($p55_compliance * 0.6) + ($p56_compliance * 0.4)" | bc)

# Output results
cat > "/Users/nalve/claude-context-engineering/scripts/results/compliance/tool_call_compliance.json" << EOM
{
  "tool_call_compliance": {
    "timestamp": "$(date -Iseconds)",
    "file_analyzed": "$command_file",
    "compliance_metrics": {
      "p55_compliance": $p55_compliance,
      "p56_compliance": $p56_compliance,
      "overall_compliance": $overall_compliance,
      "tool_call_mentions": $tool_call_mentions,
      "execution_requirements": $execution_requirements,
      "simulation_prevention": $simulation_prevention,
      "visual_announcements": $visual_announcements,
      "transparency_elements": $transparency_elements
    },
    "compliance_status": {
      "p55_status": "$([ $(echo "$p55_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
      "p56_status": "$([ $(echo "$p56_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
      "overall_status": "$([ $(echo "$overall_compliance >= 0.98" | bc -l) -eq 1 ] && echo "FULLY_COMPLIANT" || echo "NEEDS_IMPROVEMENT")"
    }
  }
}
EOM

echo "Tool call compliance validation completed. Results saved to tool_call_compliance.json"
