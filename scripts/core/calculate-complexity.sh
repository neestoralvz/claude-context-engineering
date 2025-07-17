#!/bin/bash

# Context Engineering - Complexity Calculation Script
# Calculates complexity scores (0.0-2.0) for enhanced-phase-protocols

echo "🧮 Context Engineering - Complexity Calculation"
echo "==============================================="

# Check if objective is provided
if [ -z "$1" ]; then
    echo "Usage: $0 \"<objective>\" [context_file]"
    echo "Example: $0 \"Implement user authentication system\""
    exit 1
fi

OBJECTIVE="$1"
CONTEXT_FILE="${2:-}"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S")

echo "📋 Analyzing objective: \"$OBJECTIVE\""
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Load mathematical formulas if available
if [ -f "scripts/formulas/context_engineering_formulas.sh" ]; then
    source scripts/formulas/context_engineering_formulas.sh
    echo "✅ Mathematical formulas loaded"
else
    echo "⚠️  Mathematical formulas not found - using basic calculation"
fi

echo ""
echo "🔍 PHASE 1: COMPLEXITY FACTOR ANALYSIS"
echo "====================================="

# Factor 1: Keyword complexity analysis
echo "  📊 Analyzing keyword complexity..."
KEYWORD_SCORE=0.0

# High complexity keywords (0.3 each)
HIGH_COMPLEXITY_KEYWORDS=("architecture" "microservices" "distributed" "scalable" "enterprise" "infrastructure" "migration" "integration" "optimization" "security" "performance" "algorithm" "machine learning" "AI" "blockchain" "kubernetes" "docker" "cloud" "aws" "azure" "gcp")

# Medium complexity keywords (0.2 each)
MEDIUM_COMPLEXITY_KEYWORDS=("system" "database" "api" "service" "framework" "library" "component" "module" "interface" "authentication" "authorization" "validation" "configuration" "deployment" "testing" "monitoring" "logging" "caching" "session" "workflow")

# Low complexity keywords (0.1 each)
LOW_COMPLEXITY_KEYWORDS=("add" "create" "update" "delete" "modify" "fix" "change" "improve" "enhance" "implement" "feature" "function" "method" "class" "variable" "parameter" "property" "attribute" "field" "button" "form" "page" "view" "template" "style" "css" "html" "javascript" "python" "java" "php" "ruby" "go" "rust" "swift")

# Count keyword occurrences
for keyword in "${HIGH_COMPLEXITY_KEYWORDS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$keyword"; then
        KEYWORD_SCORE=$(echo "$KEYWORD_SCORE + 0.3" | bc -l)
        echo "    🔴 High complexity keyword found: '$keyword' (+0.3)"
    fi
done

for keyword in "${MEDIUM_COMPLEXITY_KEYWORDS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$keyword"; then
        KEYWORD_SCORE=$(echo "$KEYWORD_SCORE + 0.2" | bc -l)
        echo "    🟡 Medium complexity keyword found: '$keyword' (+0.2)"
    fi
done

for keyword in "${LOW_COMPLEXITY_KEYWORDS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$keyword"; then
        KEYWORD_SCORE=$(echo "$KEYWORD_SCORE + 0.1" | bc -l)
        echo "    🟢 Low complexity keyword found: '$keyword' (+0.1)"
    fi
done

echo "    📊 Keyword complexity score: $KEYWORD_SCORE"

# Factor 2: Length and structure analysis
echo "  📏 Analyzing length and structure..."
OBJECTIVE_LENGTH=${#OBJECTIVE}
LENGTH_SCORE=0.0

if [ $OBJECTIVE_LENGTH -gt 100 ]; then
    LENGTH_SCORE=0.4
    echo "    📏 Very long objective (>100 chars): +0.4"
elif [ $OBJECTIVE_LENGTH -gt 50 ]; then
    LENGTH_SCORE=0.2
    echo "    📏 Long objective (50-100 chars): +0.2"
elif [ $OBJECTIVE_LENGTH -gt 20 ]; then
    LENGTH_SCORE=0.1
    echo "    📏 Medium objective (20-50 chars): +0.1"
else
    LENGTH_SCORE=0.0
    echo "    📏 Short objective (<20 chars): +0.0"
fi

# Factor 3: Action complexity analysis
echo "  ⚡ Analyzing action complexity..."
ACTION_SCORE=0.0

# Multiple actions indicator
ACTION_COUNT=$(echo "$OBJECTIVE" | grep -o -i "\(and\|with\|plus\|also\|including\|&\)" | wc -l)
if [ $ACTION_COUNT -gt 2 ]; then
    ACTION_SCORE=$(echo "$ACTION_SCORE + 0.3" | bc -l)
    echo "    🔄 Multiple complex actions detected (+0.3)"
elif [ $ACTION_COUNT -gt 0 ]; then
    ACTION_SCORE=$(echo "$ACTION_SCORE + 0.15" | bc -l)
    echo "    🔄 Multiple actions detected (+0.15)"
fi

# Technical implementation indicators
if echo "$OBJECTIVE" | grep -qi "\(implement\|build\|create\|develop\|design\)"; then
    ACTION_SCORE=$(echo "$ACTION_SCORE + 0.2" | bc -l)
    echo "    🛠️  Implementation action detected (+0.2)"
fi

if echo "$OBJECTIVE" | grep -qi "\(optimize\|improve\|enhance\|refactor\|migrate\)"; then
    ACTION_SCORE=$(echo "$ACTION_SCORE + 0.25" | bc -l)
    echo "    ⚡ Optimization action detected (+0.25)"
fi

echo "    📊 Action complexity score: $ACTION_SCORE"

# Factor 4: Context file analysis (if provided)
CONTEXT_SCORE=0.0
if [ -n "$CONTEXT_FILE" ] && [ -f "$CONTEXT_FILE" ]; then
    echo "  📄 Analyzing context file: $CONTEXT_FILE"
    CONTEXT_SIZE=$(wc -l < "$CONTEXT_FILE")
    if [ $CONTEXT_SIZE -gt 500 ]; then
        CONTEXT_SCORE=0.3
        echo "    📄 Large context file (>500 lines): +0.3"
    elif [ $CONTEXT_SIZE -gt 100 ]; then
        CONTEXT_SCORE=0.15
        echo "    📄 Medium context file (100-500 lines): +0.15"
    else
        CONTEXT_SCORE=0.05
        echo "    📄 Small context file (<100 lines): +0.05"
    fi
else
    echo "  📄 No context file provided"
fi

echo "    📊 Context complexity score: $CONTEXT_SCORE"

echo ""
echo "🧮 PHASE 2: COMPLEXITY CALCULATION"
echo "=================================="

# Base complexity calculation
BASE_COMPLEXITY=$(echo "$KEYWORD_SCORE + $LENGTH_SCORE + $ACTION_SCORE + $CONTEXT_SCORE" | bc -l)
echo "  📊 Base complexity: $BASE_COMPLEXITY"

# Apply normalization and bounds (0.0-2.0)
if (( $(echo "$BASE_COMPLEXITY > 2.0" | bc -l) )); then
    FINAL_COMPLEXITY=2.0
    echo "  ⚠️  Complexity capped at maximum: 2.0"
elif (( $(echo "$BASE_COMPLEXITY < 0.1" | bc -l) )); then
    FINAL_COMPLEXITY=0.1
    echo "  ℹ️  Minimum complexity applied: 0.1"
else
    FINAL_COMPLEXITY=$BASE_COMPLEXITY
fi

# Round to 2 decimal places
FINAL_COMPLEXITY=$(printf "%.2f" $FINAL_COMPLEXITY)

echo ""
echo "🎯 PHASE 3: COMPLEXITY CLASSIFICATION"
echo "===================================="

if (( $(echo "$FINAL_COMPLEXITY >= 1.5" | bc -l) )); then
    COMPLEXITY_CLASS="HIGH"
    COMPLEXITY_COLOR="\033[31m" # Red
    RECOMMENDED_PHASES=5
    ESTIMATED_TIME="20-35 minutes"
elif (( $(echo "$FINAL_COMPLEXITY >= 1.0" | bc -l) )); then
    COMPLEXITY_CLASS="MEDIUM"
    COMPLEXITY_COLOR="\033[33m" # Yellow
    RECOMMENDED_PHASES=3
    ESTIMATED_TIME="8-12 minutes"
else
    COMPLEXITY_CLASS="LOW"
    COMPLEXITY_COLOR="\033[32m" # Green
    RECOMMENDED_PHASES=2
    ESTIMATED_TIME="3-6 minutes"
fi

echo -e "  🎯 Complexity Score: ${COMPLEXITY_COLOR}${FINAL_COMPLEXITY}\033[0m"
echo -e "  📊 Complexity Class: ${COMPLEXITY_COLOR}${COMPLEXITY_CLASS}\033[0m"
echo "  📋 Recommended Phases: $RECOMMENDED_PHASES"
echo "  ⏱️  Estimated Time: $ESTIMATED_TIME"

echo ""
echo "📄 PHASE 4: RESULTS OUTPUT"
echo "========================="

# Create results directory
mkdir -p scripts/results/complexity

# Generate results file
RESULTS_FILE="scripts/results/complexity/complexity-$(date +%Y%m%d-%H%M%S).json"
cat > "$RESULTS_FILE" << EOF
{
  "complexity_analysis": {
    "timestamp": "$TIMESTAMP",
    "objective": "$OBJECTIVE",
    "context_file": "$CONTEXT_FILE",
    "analysis_factors": {
      "keyword_score": $KEYWORD_SCORE,
      "length_score": $LENGTH_SCORE,
      "action_score": $ACTION_SCORE,
      "context_score": $CONTEXT_SCORE,
      "base_complexity": $BASE_COMPLEXITY
    },
    "final_results": {
      "complexity_score": $FINAL_COMPLEXITY,
      "complexity_class": "$COMPLEXITY_CLASS",
      "recommended_phases": $RECOMMENDED_PHASES,
      "estimated_time": "$ESTIMATED_TIME"
    },
    "classification_thresholds": {
      "low_max": 0.99,
      "medium_max": 1.49,
      "high_min": 1.50
    },
    "calculation_method": "KEYWORD_LENGTH_ACTION_CONTEXT_ANALYSIS"
  }
}
EOF

echo "  ✅ Results saved: $RESULTS_FILE"
echo "  📊 Complexity Score: $FINAL_COMPLEXITY"
echo "  📈 Classification: $COMPLEXITY_CLASS"

# Export for command integration
export CALCULATED_COMPLEXITY="$FINAL_COMPLEXITY"
export COMPLEXITY_CLASS="$COMPLEXITY_CLASS"
export RECOMMENDED_PHASES="$RECOMMENDED_PHASES"

echo ""
echo "🚀 SUCCESS: Complexity calculation complete!"
echo "📊 Final Complexity Score: $FINAL_COMPLEXITY ($COMPLEXITY_CLASS)"

# Return complexity score as exit code (scaled by 10 for integer)
SCALED_COMPLEXITY=$(echo "$FINAL_COMPLEXITY * 10" | bc -l | cut -d. -f1)
exit $SCALED_COMPLEXITY