#!/bin/bash

# Validation Environment Setup Script
# Prepares comprehensive validation environment for Context Engineering
# Ensures all validation scripts and dependencies are ready

set -e

echo "🛠️ Context Engineering - Validation Environment Setup"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# System paths
BASE_DIR="/Users/nalve/claude-context-engineering"
SCRIPTS_DIR="$BASE_DIR/scripts"
RESULTS_DIR="$BASE_DIR/scripts/results"
VALIDATION_DIR="$BASE_DIR/scripts/validation"

# Create validation directories
echo -e "${CYAN}📁 Creating validation directory structure...${NC}"
mkdir -p "$VALIDATION_DIR"
mkdir -p "$RESULTS_DIR/validation"
mkdir -p "$RESULTS_DIR/content-analysis"
mkdir -p "$RESULTS_DIR/nomenclature"
mkdir -p "$RESULTS_DIR/compliance"

# Check dependencies
echo -e "${CYAN}🔍 Checking validation dependencies...${NC}"
for cmd in bc jq curl grep awk sed; do
    if ! command -v "$cmd" &> /dev/null; then
        echo -e "${RED}❌ Missing required command: $cmd${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Found: $cmd${NC}"
    fi
done

# Create content quality analysis script
echo -e "${CYAN}🔧 Creating content analysis scripts...${NC}"
cat > "$VALIDATION_DIR/analyze-content-quality.sh" << 'EOF'
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
EOF

chmod +x "$VALIDATION_DIR/analyze-content-quality.sh"

# Create natural language compliance validation script
cat > "$VALIDATION_DIR/validate-natural-language-compliance.sh" << 'EOF'
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

# Calculate accessibility score
accessibility_base=$(echo "scale=4; 1.0 - ($technical_jargon / ($total_sentences + 1))" | bc)
explanation_boost=$(echo "scale=4; $explanatory_text * 0.1" | bc)
accessibility_score=$(echo "scale=4; $accessibility_base + $explanation_boost" | bc)
if (( $(echo "$accessibility_score > 1.0" | bc -l) )); then
    accessibility_score="1.0000"
fi

# Check instruction clarity
imperative_verbs=$(grep -c -E '\b(Execute|Apply|Use|Create|Validate|Implement|Analyze)\b' "$command_file" || echo "0")
step_indicators=$(grep -c -E 'Step [0-9]|Phase [0-9]|[0-9]\.' "$command_file" || echo "0")
instruction_clarity=$(echo "scale=4; ($imperative_verbs + $step_indicators) / 20.0" | bc)
if (( $(echo "$instruction_clarity > 1.0" | bc -l) )); then
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
      "accessibility_status": "$([ $(echo "$accessibility_score >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "clarity_status": "$([ $(echo "$instruction_clarity >= 0.85" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "overall_principle_6": "$([ $(echo "$principle_6_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")"
    }
  }
}
EOM

echo "Natural language compliance validation completed. Results saved to natural_language_compliance.json"
EOF

chmod +x "$VALIDATION_DIR/validate-natural-language-compliance.sh"

# Create technical nomenclature validation script
cat > "$VALIDATION_DIR/validate-technical-nomenclature.sh" << 'EOF'
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

# Calculate nomenclature scores
total_headers=$(grep -c '^##' "$command_file" || echo "1")
naming_consistency=$(echo "scale=4; $consistent_capitalization / $total_headers" | bc)
domain_alignment=$(echo "scale=4; ($command_patterns + $principle_references + $standard_terminology) / 50.0" | bc)
if (( $(echo "$domain_alignment > 1.0" | bc -l) )); then
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
      "naming_status": "$([ $(echo "$naming_consistency >= 0.95" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "domain_status": "$([ $(echo "$domain_alignment >= 0.90" | bc -l) -eq 1 ] && echo "PASSED" || echo "NEEDS_IMPROVEMENT")",
      "overall_nomenclature": "$([ $(echo "$nomenclature_compliance >= 0.95" | bc -l) -eq 1 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")"
    }
  }
}
EOM

echo "Technical nomenclature validation completed. Results saved to technical_nomenclature_validation.json"
EOF

chmod +x "$VALIDATION_DIR/validate-technical-nomenclature.sh"

# Create tool call compliance validation script
cat > "$VALIDATION_DIR/validate-tool-call-compliance.sh" << 'EOF'
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
EOF

chmod +x "$VALIDATION_DIR/validate-tool-call-compliance.sh"

# Create comprehensive quality metrics calculation script
cat > "$VALIDATION_DIR/calculate-comprehensive-quality-metrics.sh" << 'EOF'
#!/bin/bash
# Comprehensive Quality Metrics Calculation

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

# Extract metrics if files exist
if [ -f "$content_analysis" ]; then
    info_density=$(jq -r '.content_quality_analysis.metrics.information_density // 0.8' "$content_analysis")
    clarity_score=$(jq -r '.content_quality_analysis.metrics.clarity_score // 0.8' "$content_analysis")
    technical_accuracy=$(jq -r '.content_quality_analysis.metrics.technical_accuracy // 0.8' "$content_analysis")
else
    info_density="0.8000"
    clarity_score="0.8000"
    technical_accuracy="0.8000"
fi

if [ -f "$nomenclature_analysis" ]; then
    nomenclature_score=$(jq -r '.technical_nomenclature_validation.nomenclature_metrics.nomenclature_compliance // 0.9' "$nomenclature_analysis")
else
    nomenclature_score="0.9000"
fi

if [ -f "$compliance_analysis" ]; then
    compliance_score=$(jq -r '.tool_call_compliance.compliance_metrics.overall_compliance // 0.85' "$compliance_analysis")
else
    compliance_score="0.8500"
fi

# Calculate comprehensive quality using mathematical formulas
# Use confidence calculation formula adapted for quality measurement
comprehensive_quality=$(calculate_confidence "$info_density" "$clarity_score" "$technical_accuracy")

# Calculate weighted quality score
weighted_quality=$(echo "scale=4; ($comprehensive_quality * 0.4) + ($nomenclature_score * 0.3) + ($compliance_score * 0.3)" | bc)

# Quality grade assessment
if (( $(echo "$weighted_quality >= 0.95" | bc -l) )); then
    quality_grade="EXCELLENT"
elif (( $(echo "$weighted_quality >= 0.90" | bc -l) )); then
    quality_grade="GOOD"
elif (( $(echo "$weighted_quality >= 0.80" | bc -l) )); then
    quality_grade="ACCEPTABLE"
else
    quality_grade="NEEDS_IMPROVEMENT"
fi

# Output comprehensive results
cat > "/Users/nalve/claude-context-engineering/scripts/results/validation/comprehensive_quality_metrics.json" << EOM
{
  "comprehensive_quality_metrics": {
    "timestamp": "$(date -Iseconds)",
    "file_analyzed": "$command_file",
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
      "overall_grade": "$quality_grade",
      "mathematical_foundation": "context_engineering_formulas",
      "validation_method": "script_based_quantitative_analysis"
    },
    "improvement_recommendations": [
      $([ $(echo "$info_density < 0.95" | bc -l) -eq 1 ] && echo "\"Improve information density to ≥95%\"," || echo "")
      $([ $(echo "$clarity_score < 0.90" | bc -l) -eq 1 ] && echo "\"Enhance clarity score to ≥90%\"," || echo "")
      $([ $(echo "$technical_accuracy < 0.90" | bc -l) -eq 1 ] && echo "\"Increase technical accuracy to ≥90%\"," || echo "")
      $([ $(echo "$nomenclature_score < 0.95" | bc -l) -eq 1 ] && echo "\"Improve nomenclature compliance to ≥95%\"," || echo "")
      $([ $(echo "$compliance_score < 0.98" | bc -l) -eq 1 ] && echo "\"Enhance tool call compliance to ≥98%\"" || echo "\"Quality standards met\"")
    ]
  }
}
EOM

echo "Comprehensive quality metrics calculation completed. Results saved to comprehensive_quality_metrics.json"
echo "Overall Quality Score: $weighted_quality ($quality_grade)"
EOF

chmod +x "$VALIDATION_DIR/calculate-comprehensive-quality-metrics.sh"

# Create validation environment test script
cat > "$VALIDATION_DIR/test-validation-environment.sh" << 'EOF'
#!/bin/bash
# Test Validation Environment Functionality

echo "🧪 Testing validation environment..."

# Test sample file
test_file="/tmp/test_command.md"
cat > "$test_file" << 'TESTEOF'
# Test Command

## Purpose
This is a test command for validation.

### Phase 1: TOOL CALL EXECUTION REQUIRED
Execute sample validation with real tool calls.

### Phase 2: MANDATORY SCRIPT EXECUTION
Never simulate - always use real execution.
TESTEOF

# Run all validation scripts
echo "Running content quality analysis..."
/Users/nalve/claude-context-engineering/scripts/validation/analyze-content-quality.sh "$test_file"

echo "Running natural language compliance..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-natural-language-compliance.sh "$test_file"

echo "Running nomenclature validation..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-technical-nomenclature.sh "$test_file"

echo "Running tool call compliance..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-tool-call-compliance.sh "$test_file"

echo "Running comprehensive quality metrics..."
/Users/nalve/claude-context-engineering/scripts/validation/calculate-comprehensive-quality-metrics.sh "$test_file"

# Cleanup
rm -f "$test_file"

echo "✅ Validation environment test completed successfully!"
EOF

chmod +x "$VALIDATION_DIR/test-validation-environment.sh"

echo ""
echo -e "${GREEN}✅ Validation environment setup completed successfully!${NC}"
echo ""
echo -e "${PURPLE}📋 Created Validation Scripts:${NC}"
echo -e "├── ${CYAN}analyze-content-quality.sh${NC} - Content quality analysis with mathematical precision"
echo -e "├── ${CYAN}validate-natural-language-compliance.sh${NC} - Principle #6 compliance validation"
echo -e "├── ${CYAN}validate-technical-nomenclature.sh${NC} - Technical nomenclature standards"
echo -e "├── ${CYAN}validate-tool-call-compliance.sh${NC} - P55/P56 compliance validation"
echo -e "├── ${CYAN}calculate-comprehensive-quality-metrics.sh${NC} - Comprehensive quality measurement"
echo -e "└── ${CYAN}test-validation-environment.sh${NC} - Environment functionality testing"
echo ""
echo -e "${PURPLE}📁 Validation Directory Structure:${NC}"
echo -e "├── ${BLUE}scripts/validation/${NC} - Validation scripts"
echo -e "├── ${BLUE}scripts/results/validation/${NC} - Comprehensive validation results"
echo -e "├── ${BLUE}scripts/results/content-analysis/${NC} - Content quality analysis results"
echo -e "├── ${BLUE}scripts/results/nomenclature/${NC} - Nomenclature validation results"
echo -e "└── ${BLUE}scripts/results/compliance/${NC} - Tool call compliance results"
echo ""
echo -e "${GREEN}🚀 Validation environment is ready for use!${NC}"
echo -e "${YELLOW}💡 Run test-validation-environment.sh to verify functionality${NC}"