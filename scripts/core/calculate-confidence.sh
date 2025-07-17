#!/bin/bash

# Context Engineering - Confidence Calculation Script
# Calculates confidence levels (0.0-1.0) for decision analysis

echo "🎯 Context Engineering - Confidence Calculation"
echo "==============================================="

# Check if parameters are provided
if [ -z "$1" ]; then
    echo "Usage: $0 \"<objective>\" [context_file] [complexity_score]"
    echo "Example: $0 \"Implement user authentication\" ./context.md 1.2"
    exit 1
fi

OBJECTIVE="$1"
CONTEXT_FILE="${2:-}"
COMPLEXITY_SCORE="${3:-1.0}"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S")

echo "📋 Analyzing objective: \"$OBJECTIVE\""
echo "📊 Input complexity score: $COMPLEXITY_SCORE"
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
echo "🔍 PHASE 1: CONFIDENCE FACTOR ANALYSIS"
echo "====================================="

# Factor 1: Domain familiarity analysis
echo "  🧠 Analyzing domain familiarity..."
DOMAIN_CONFIDENCE=0.0

# High confidence domains
HIGH_CONFIDENCE_DOMAINS=("web development" "javascript" "python" "api" "database" "sql" "html" "css" "rest" "json" "git" "linux" "bash" "scripting" "automation" "documentation" "testing" "debugging" "optimization" "refactoring")

# Medium confidence domains
MEDIUM_CONFIDENCE_DOMAINS=("machine learning" "ai" "data science" "cloud" "aws" "docker" "kubernetes" "microservices" "architecture" "system design" "security" "authentication" "encryption" "performance" "scaling" "monitoring" "logging" "devops" "ci/cd")

# Low confidence domains
LOW_CONFIDENCE_DOMAINS=("blockchain" "quantum computing" "embedded systems" "hardware" "assembly" "kernel development" "compilers" "graphics programming" "game development" "mobile development" "ios" "android" "enterprise" "legacy systems" "mainframe" "cobol" "fortran")

# Analyze objective for domain keywords
for domain in "${HIGH_CONFIDENCE_DOMAINS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$domain"; then
        DOMAIN_CONFIDENCE=$(echo "$DOMAIN_CONFIDENCE + 0.2" | bc -l)
        echo "    🟢 High confidence domain: '$domain' (+0.2)"
    fi
done

for domain in "${MEDIUM_CONFIDENCE_DOMAINS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$domain"; then
        DOMAIN_CONFIDENCE=$(echo "$DOMAIN_CONFIDENCE + 0.1" | bc -l)
        echo "    🟡 Medium confidence domain: '$domain' (+0.1)"
    fi
done

for domain in "${LOW_CONFIDENCE_DOMAINS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$domain"; then
        DOMAIN_CONFIDENCE=$(echo "$DOMAIN_CONFIDENCE - 0.1" | bc -l)
        echo "    🔴 Low confidence domain: '$domain' (-0.1)"
    fi
done

# Ensure domain confidence is not negative
if (( $(echo "$DOMAIN_CONFIDENCE < 0" | bc -l) )); then
    DOMAIN_CONFIDENCE=0.0
fi

echo "    📊 Domain confidence score: $DOMAIN_CONFIDENCE"

# Factor 2: Technical clarity analysis
echo "  🔧 Analyzing technical clarity..."
CLARITY_CONFIDENCE=0.0

# Clear technical terms
CLEAR_TERMS=("create" "add" "update" "delete" "implement" "build" "fix" "optimize" "test" "deploy" "configure" "setup" "install" "remove" "modify" "enhance" "improve" "integrate" "validate" "verify")

# Vague terms (reduce confidence)
VAGUE_TERMS=("somehow" "maybe" "possibly" "might" "could" "should" "would" "probably" "potentially" "approximately" "roughly" "about" "around" "generally" "usually" "typically" "sort of" "kind of")

# Count clear terms
CLEAR_COUNT=0
for term in "${CLEAR_TERMS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$term"; then
        CLEAR_COUNT=$((CLEAR_COUNT + 1))
    fi
done

# Count vague terms
VAGUE_COUNT=0
for term in "${VAGUE_TERMS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$term"; then
        VAGUE_COUNT=$((VAGUE_COUNT + 1))
    fi
done

# Calculate clarity confidence
if [ $CLEAR_COUNT -gt 0 ]; then
    CLARITY_CONFIDENCE=$(echo "$CLARITY_CONFIDENCE + ($CLEAR_COUNT * 0.05)" | bc -l)
    echo "    ✅ Clear technical terms found: $CLEAR_COUNT (+$(echo "$CLEAR_COUNT * 0.05" | bc -l))"
fi

if [ $VAGUE_COUNT -gt 0 ]; then
    CLARITY_CONFIDENCE=$(echo "$CLARITY_CONFIDENCE - ($VAGUE_COUNT * 0.1)" | bc -l)
    echo "    ❌ Vague terms found: $VAGUE_COUNT (-$(echo "$VAGUE_COUNT * 0.1" | bc -l))"
fi

# Ensure clarity confidence is not negative
if (( $(echo "$CLARITY_CONFIDENCE < 0" | bc -l) )); then
    CLARITY_CONFIDENCE=0.0
fi

echo "    📊 Clarity confidence score: $CLARITY_CONFIDENCE"

# Factor 3: Complexity inverse correlation
echo "  ⚖️  Analyzing complexity impact on confidence..."
COMPLEXITY_IMPACT=0.0

# Higher complexity reduces confidence
if (( $(echo "$COMPLEXITY_SCORE >= 1.5" | bc -l) )); then
    COMPLEXITY_IMPACT=-0.3
    echo "    🔴 High complexity reduces confidence (-0.3)"
elif (( $(echo "$COMPLEXITY_SCORE >= 1.0" | bc -l) )); then
    COMPLEXITY_IMPACT=-0.15
    echo "    🟡 Medium complexity reduces confidence (-0.15)"
else
    COMPLEXITY_IMPACT=0.1
    echo "    🟢 Low complexity increases confidence (+0.1)"
fi

echo "    📊 Complexity impact score: $COMPLEXITY_IMPACT"

# Factor 4: Context availability analysis
echo "  📄 Analyzing context availability..."
CONTEXT_CONFIDENCE=0.0

if [ -n "$CONTEXT_FILE" ] && [ -f "$CONTEXT_FILE" ]; then
    CONTEXT_SIZE=$(wc -l < "$CONTEXT_FILE")
    if [ $CONTEXT_SIZE -gt 200 ]; then
        CONTEXT_CONFIDENCE=0.2
        echo "    📚 Rich context available (>200 lines): +0.2"
    elif [ $CONTEXT_SIZE -gt 50 ]; then
        CONTEXT_CONFIDENCE=0.1
        echo "    📖 Good context available (50-200 lines): +0.1"
    else
        CONTEXT_CONFIDENCE=0.05
        echo "    📄 Basic context available (<50 lines): +0.05"
    fi
    
    # Check for specific helpful context
    if grep -qi "example\|sample\|template" "$CONTEXT_FILE"; then
        CONTEXT_CONFIDENCE=$(echo "$CONTEXT_CONFIDENCE + 0.1" | bc -l)
        echo "    ✨ Examples/templates found in context (+0.1)"
    fi
    
    if grep -qi "requirement\|specification\|spec" "$CONTEXT_FILE"; then
        CONTEXT_CONFIDENCE=$(echo "$CONTEXT_CONFIDENCE + 0.1" | bc -l)
        echo "    📋 Requirements/specifications found (+0.1)"
    fi
else
    echo "    ❌ No context file provided (-0.1)"
    CONTEXT_CONFIDENCE=-0.1
fi

echo "    📊 Context confidence score: $CONTEXT_CONFIDENCE"

# Factor 5: Experience pattern matching
echo "  🎯 Analyzing experience patterns..."
PATTERN_CONFIDENCE=0.0

# Common successful patterns
SUCCESS_PATTERNS=("crud" "rest api" "authentication" "database" "form validation" "user interface" "responsive design" "unit test" "integration" "deployment" "configuration" "logging" "error handling" "optimization" "refactoring")

for pattern in "${SUCCESS_PATTERNS[@]}"; do
    if echo "$OBJECTIVE" | grep -qi "$pattern"; then
        PATTERN_CONFIDENCE=$(echo "$PATTERN_CONFIDENCE + 0.08" | bc -l)
        echo "    ✅ Successful pattern detected: '$pattern' (+0.08)"
    fi
done

echo "    📊 Pattern confidence score: $PATTERN_CONFIDENCE"

echo ""
echo "🧮 PHASE 2: CONFIDENCE CALCULATION"
echo "================================="

# Base confidence calculation
BASE_CONFIDENCE=0.5  # Start with neutral confidence
ADJUSTED_CONFIDENCE=$(echo "$BASE_CONFIDENCE + $DOMAIN_CONFIDENCE + $CLARITY_CONFIDENCE + $COMPLEXITY_IMPACT + $CONTEXT_CONFIDENCE + $PATTERN_CONFIDENCE" | bc -l)

echo "  📊 Base confidence: $BASE_CONFIDENCE"
echo "  📊 Domain adjustment: +$DOMAIN_CONFIDENCE"
echo "  📊 Clarity adjustment: +$CLARITY_CONFIDENCE"
echo "  📊 Complexity adjustment: $COMPLEXITY_IMPACT"
echo "  📊 Context adjustment: +$CONTEXT_CONFIDENCE"
echo "  📊 Pattern adjustment: +$PATTERN_CONFIDENCE"
echo "  📊 Raw adjusted confidence: $ADJUSTED_CONFIDENCE"

# Apply bounds (0.0-1.0)
if (( $(echo "$ADJUSTED_CONFIDENCE > 1.0" | bc -l) )); then
    FINAL_CONFIDENCE=1.0
    echo "  ⚠️  Confidence capped at maximum: 1.0"
elif (( $(echo "$ADJUSTED_CONFIDENCE < 0.1" | bc -l) )); then
    FINAL_CONFIDENCE=0.1
    echo "  ⚠️  Minimum confidence applied: 0.1"
else
    FINAL_CONFIDENCE=$ADJUSTED_CONFIDENCE
fi

# Round to 2 decimal places
FINAL_CONFIDENCE=$(printf "%.2f" $FINAL_CONFIDENCE)

echo ""
echo "🎯 PHASE 3: CONFIDENCE CLASSIFICATION"
echo "===================================="

if (( $(echo "$FINAL_CONFIDENCE >= 0.8" | bc -l) )); then
    CONFIDENCE_CLASS="HIGH"
    CONFIDENCE_COLOR="\033[32m" # Green
    RECOMMENDATION="Proceed with standard approach"
elif (( $(echo "$FINAL_CONFIDENCE >= 0.6" | bc -l) )); then
    CONFIDENCE_CLASS="MEDIUM"
    CONFIDENCE_COLOR="\033[33m" # Yellow
    RECOMMENDATION="Consider additional research or validation"
else
    CONFIDENCE_CLASS="LOW"
    CONFIDENCE_COLOR="\033[31m" # Red
    RECOMMENDATION="Recommend expert consultation or incremental approach"
fi

echo -e "  🎯 Confidence Score: ${CONFIDENCE_COLOR}${FINAL_CONFIDENCE}\033[0m"
echo -e "  📊 Confidence Class: ${CONFIDENCE_COLOR}${CONFIDENCE_CLASS}\033[0m"
echo "  💡 Recommendation: $RECOMMENDATION"

echo ""
echo "📄 PHASE 4: RESULTS OUTPUT"
echo "========================="

# Create results directory
mkdir -p scripts/results/confidence

# Generate results file
RESULTS_FILE="scripts/results/confidence/confidence-$(date +%Y%m%d-%H%M%S).json"
cat > "$RESULTS_FILE" << EOF
{
  "confidence_analysis": {
    "timestamp": "$TIMESTAMP",
    "objective": "$OBJECTIVE",
    "context_file": "$CONTEXT_FILE",
    "complexity_score": $COMPLEXITY_SCORE,
    "analysis_factors": {
      "domain_confidence": $DOMAIN_CONFIDENCE,
      "clarity_confidence": $CLARITY_CONFIDENCE,
      "complexity_impact": $COMPLEXITY_IMPACT,
      "context_confidence": $CONTEXT_CONFIDENCE,
      "pattern_confidence": $PATTERN_CONFIDENCE,
      "base_confidence": $BASE_CONFIDENCE,
      "adjusted_confidence": $ADJUSTED_CONFIDENCE
    },
    "final_results": {
      "confidence_score": $FINAL_CONFIDENCE,
      "confidence_class": "$CONFIDENCE_CLASS",
      "recommendation": "$RECOMMENDATION"
    },
    "classification_thresholds": {
      "low_max": 0.59,
      "medium_max": 0.79,
      "high_min": 0.80
    },
    "calculation_method": "DOMAIN_CLARITY_COMPLEXITY_CONTEXT_PATTERN_ANALYSIS"
  }
}
EOF

echo "  ✅ Results saved: $RESULTS_FILE"
echo "  📊 Confidence Score: $FINAL_CONFIDENCE"
echo "  📈 Classification: $CONFIDENCE_CLASS"

# Export for command integration
export CALCULATED_CONFIDENCE="$FINAL_CONFIDENCE"
export CONFIDENCE_CLASS="$CONFIDENCE_CLASS"
export CONFIDENCE_RECOMMENDATION="$RECOMMENDATION"

echo ""
echo "🚀 SUCCESS: Confidence calculation complete!"
echo "📊 Final Confidence Score: $FINAL_CONFIDENCE ($CONFIDENCE_CLASS)"

# Return confidence score as exit code (scaled by 100 for integer)
SCALED_CONFIDENCE=$(echo "$FINAL_CONFIDENCE * 100" | bc -l | cut -d. -f1)
exit $SCALED_CONFIDENCE