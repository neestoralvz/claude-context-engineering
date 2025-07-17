#!/bin/bash
# Token Optimization Mathematical Formulas
# Implementation of Principle #83: Token-Saving Intelligence mathematical validation

set -euo pipefail

# Source mathematical constants
CONSTANTS_FILE="$(dirname "$0")/../results/formulas/mathematical_verification_report.json"

# Extract constants from JSON using jq or basic parsing
get_threshold() {
    local key=$1
    grep "\"$key\"" "$CONSTANTS_FILE" | grep -o '[0-9]\+\.[0-9]\+' || echo "0.5"
}

# Mathematical Constants  
readonly TOKEN_EFFICIENCY_MINIMUM=0.4
readonly TOKEN_EFFICIENCY_TARGET=0.5
readonly QUALITY_PRESERVATION_MINIMUM=0.95
readonly BUDGET_UTILIZATION_MAXIMUM=0.8
readonly COMBINED_EFFICIENCY_TARGET=0.55

# Token Efficiency Calculation
# Formula: TE = ((O-C)/O) × 100, where O=original tokens, C=compressed tokens
calculate_token_efficiency() {
    local original_tokens=$1
    local compressed_tokens=$2
    
    if [[ $original_tokens -eq 0 ]]; then
        echo "0"
        return 1
    fi
    
    local efficiency=$(echo "scale=4; (($original_tokens - $compressed_tokens) * 100) / $original_tokens" | bc)
    echo "$efficiency"
}

# Compression Ratio Calculation  
# Formula: CR = C/O, target: 0.4-0.6 (40-60% reduction)
calculate_compression_ratio() {
    local original_tokens=$1
    local compressed_tokens=$2
    
    if [[ $original_tokens -eq 0 ]]; then
        echo "1.0000"
        return 1
    fi
    
    local ratio=$(echo "scale=4; $compressed_tokens / $original_tokens" | bc)
    echo "$ratio"
}

# Quality Coefficient Calculation
# Formula: QC = InformationValue(compressed)/InformationValue(original), target: ≥1.0
calculate_quality_coefficient() {
    local original_info_value=$1
    local compressed_info_value=$2
    
    if [[ $original_info_value -eq 0 ]]; then
        echo "1.0000"
        return 1
    fi
    
    local coefficient=$(echo "scale=4; $compressed_info_value / $original_info_value" | bc)
    echo "$coefficient"
}

# Budget Utilization Calculation
# Formula: BU = TokensUsed/TokensBudgeted, target: ≤0.8 (80% utilization)
calculate_budget_utilization() {
    local tokens_used=$1
    local tokens_budgeted=$2
    
    if [[ $tokens_budgeted -eq 0 ]]; then
        echo "1.0000"
        return 1
    fi
    
    local utilization=$(echo "scale=4; $tokens_used / $tokens_budgeted" | bc)
    echo "$utilization"
}

# Combined Efficiency Calculation
# Formula: CE = (VE + TE) / 2, where VE=visual efficiency, TE=token efficiency
calculate_combined_efficiency() {
    local visual_efficiency=$1
    local token_efficiency=$2
    
    local combined=$(echo "scale=4; ($visual_efficiency + $token_efficiency) / 2" | bc)
    echo "$combined"
}

# Token Savings Calculation
# Formula: TS = O - C, absolute token savings
calculate_token_savings() {
    local original_tokens=$1
    local compressed_tokens=$2
    
    local savings=$((original_tokens - compressed_tokens))
    echo "$savings"
}

# Information Density Calculation
# Formula: ID = InformationValue / TokenCount
calculate_information_density() {
    local information_value=$1
    local token_count=$2
    
    if [[ $token_count -eq 0 ]]; then
        echo "0.0000"
        return 1
    fi
    
    local density=$(echo "scale=4; $information_value / $token_count" | bc)
    echo "$density"
}

# Validate Token Efficiency Against Targets
validate_token_efficiency() {
    local efficiency=$1
    local minimum=${2:-$TOKEN_EFFICIENCY_MINIMUM}
    
    local efficiency_decimal=$(echo "scale=4; $efficiency / 100" | bc)
    local result=$(echo "$efficiency_decimal >= $minimum" | bc -l)
    
    if [[ $result -eq 1 ]]; then
        echo "✓ Token efficiency: ${efficiency}% (≥${minimum})"
        return 0
    else
        echo "✗ Token efficiency: ${efficiency}% (below ${minimum})"
        return 1
    fi
}

# Validate Quality Preservation
validate_quality_preservation() {
    local quality_coefficient=$1
    local minimum=${2:-$QUALITY_PRESERVATION_MINIMUM}
    
    local result=$(echo "$quality_coefficient >= $minimum" | bc -l)
    
    if [[ $result -eq 1 ]]; then
        echo "✓ Quality preserved: ${quality_coefficient} (≥${minimum})"
        return 0
    else
        echo "✗ Quality degraded: ${quality_coefficient} (below ${minimum})"
        return 1
    fi
}

# Validate Budget Utilization
validate_budget_utilization() {
    local utilization=$1
    local maximum=${2:-$BUDGET_UTILIZATION_MAXIMUM}
    
    local result=$(echo "$utilization <= $maximum" | bc -l)
    
    if [[ $result -eq 1 ]]; then
        echo "✓ Budget efficient: ${utilization} (≤${maximum})"
        return 0
    else
        echo "⚠ Budget exceeded: ${utilization} (above ${maximum})"
        return 1
    fi
}

# Comprehensive Token Optimization Validation
validate_complete_optimization() {
    local original_tokens=$1
    local compressed_tokens=$2
    local original_info_value=$3
    local compressed_info_value=$4
    local tokens_budgeted=$5
    local visual_efficiency=${6:-70}  # Default visual efficiency
    
    echo "=== Token Optimization Validation ==="
    
    # Calculate all metrics
    local token_efficiency
    token_efficiency=$(calculate_token_efficiency "$original_tokens" "$compressed_tokens")
    
    local compression_ratio
    compression_ratio=$(calculate_compression_ratio "$original_tokens" "$compressed_tokens")
    
    local quality_coefficient
    quality_coefficient=$(calculate_quality_coefficient "$original_info_value" "$compressed_info_value")
    
    local budget_utilization
    budget_utilization=$(calculate_budget_utilization "$compressed_tokens" "$tokens_budgeted")
    
    local combined_efficiency
    combined_efficiency=$(calculate_combined_efficiency "$visual_efficiency" "$token_efficiency")
    
    local token_savings
    token_savings=$(calculate_token_savings "$original_tokens" "$compressed_tokens")
    
    # Display metrics
    echo "Original Tokens: $original_tokens"
    echo "Compressed Tokens: $compressed_tokens"
    echo "Token Savings: $token_savings"
    echo "Token Efficiency: ${token_efficiency}%"
    echo "Compression Ratio: $compression_ratio"
    echo "Quality Coefficient: $quality_coefficient"
    echo "Budget Utilization: $budget_utilization"
    echo "Combined Efficiency: ${combined_efficiency}%"
    echo ""
    
    # Validate against targets
    local validation_results=0
    
    validate_token_efficiency "$token_efficiency" || ((validation_results++))
    validate_quality_preservation "$quality_coefficient" || ((validation_results++))
    validate_budget_utilization "$budget_utilization" || ((validation_results++))
    
    # Combined efficiency validation
    local combined_decimal=$(echo "scale=4; $combined_efficiency / 100" | bc)
    local combined_result=$(echo "$combined_decimal >= $COMBINED_EFFICIENCY_TARGET" | bc -l)
    
    if [[ $combined_result -eq 1 ]]; then
        echo "✓ Combined efficiency: ${combined_efficiency}% (≥${COMBINED_EFFICIENCY_TARGET})"
    else
        echo "✗ Combined efficiency: ${combined_efficiency}% (below ${COMBINED_EFFICIENCY_TARGET})"
        ((validation_results++))
    fi
    
    echo ""
    if [[ $validation_results -eq 0 ]]; then
        echo "✅ ALL TOKEN OPTIMIZATION TARGETS MET"
        return 0
    else
        echo "❌ ${validation_results} VALIDATION FAILURES"
        return 1
    fi
}

# Real-time Token Monitoring
monitor_token_efficiency() {
    local session_file=${1:-"/tmp/token_session.log"}
    local target_efficiency=${2:-50}
    
    echo "Starting real-time token efficiency monitoring..."
    echo "Target efficiency: ${target_efficiency}%"
    echo "Session log: $session_file"
    echo ""
    
    while true; do
        if [[ -f "$session_file" ]]; then
            # Read current session data
            local original_tokens=$(grep "original_tokens:" "$session_file" | tail -1 | cut -d: -f2 | tr -d ' ')
            local current_tokens=$(grep "current_tokens:" "$session_file" | tail -1 | cut -d: -f2 | tr -d ' ')
            
            if [[ -n "$original_tokens" ]] && [[ -n "$current_tokens" ]]; then
                local efficiency
                efficiency=$(calculate_token_efficiency "$original_tokens" "$current_tokens")
                
                local timestamp=$(date '+%H:%M:%S')
                
                if (( $(echo "$efficiency >= $target_efficiency" | bc -l) )); then
                    echo "[$timestamp] ✓ Token efficiency: ${efficiency}% (target: ≥${target_efficiency}%)"
                else
                    echo "[$timestamp] ⚠ Token efficiency: ${efficiency}% (below target: ${target_efficiency}%)"
                fi
            fi
        fi
        
        sleep 30
    done
}

# Learning effectiveness calculation
calculate_learning_effectiveness() {
    local patterns_recognized=$1
    local strategies_improved=$2
    local predictions_accurate=$3
    local adaptation_speed=$4
    
    # Weighted learning effectiveness score
    local effectiveness=$(echo "scale=4; ($patterns_recognized * 0.3) + ($strategies_improved * 0.25) + ($predictions_accurate * 0.25) + ($adaptation_speed * 0.2)" | bc)
    echo "$effectiveness"
}

# Pattern recognition accuracy calculation
calculate_pattern_recognition_accuracy() {
    local successful_recognitions=$1
    local total_patterns_evaluated=$2
    
    if [[ $total_patterns_evaluated -eq 0 ]]; then
        echo "0.0000"
        return 1
    fi
    
    local accuracy=$(echo "scale=4; $successful_recognitions / $total_patterns_evaluated" | bc)
    echo "$accuracy"
}

# Strategy improvement rate calculation
calculate_strategy_improvement_rate() {
    local efficiency_before=$1
    local efficiency_after=$2
    local interactions_count=$3
    
    local improvement=$(echo "scale=4; ($efficiency_after - $efficiency_before) / $efficiency_before" | bc)
    local improvement_per_interaction=$(echo "scale=4; $improvement / $interactions_count" | bc)
    
    echo "$improvement_per_interaction"
}

# Cross-context learning transfer effectiveness
calculate_cross_context_effectiveness() {
    local successful_transfers=$1
    local attempted_transfers=$2
    local transfer_accuracy=$3
    
    if [[ $attempted_transfers -eq 0 ]]; then
        echo "0.0000"
        return 1
    fi
    
    local transfer_rate=$(echo "scale=4; $successful_transfers / $attempted_transfers" | bc)
    local combined_effectiveness=$(echo "scale=4; ($transfer_rate + $transfer_accuracy) / 2" | bc)
    
    echo "$combined_effectiveness"
}

# Learning validation test cases
test_learning_formulas() {
    echo "=== Testing Token Learning Formulas ==="
    echo ""
    
    # Test pattern recognition accuracy
    echo "Test Case: Pattern Recognition Accuracy"
    local recognition_accuracy
    recognition_accuracy=$(calculate_pattern_recognition_accuracy 85 100)
    echo "Pattern Recognition Accuracy: ${recognition_accuracy} (85/100 = 0.85)"
    
    # Test learning effectiveness
    echo ""
    echo "Test Case: Learning Effectiveness"
    local learning_effectiveness
    learning_effectiveness=$(calculate_learning_effectiveness 0.9 0.8 0.85 0.75)
    echo "Learning Effectiveness: ${learning_effectiveness} (weighted score)"
    
    # Test strategy improvement rate
    echo ""
    echo "Test Case: Strategy Improvement Rate"
    local improvement_rate
    improvement_rate=$(calculate_strategy_improvement_rate 0.4 0.55 100)
    echo "Strategy Improvement Rate: ${improvement_rate} per interaction"
    
    # Test cross-context learning
    echo ""
    echo "Test Case: Cross-Context Learning Effectiveness"
    local cross_context_effectiveness
    cross_context_effectiveness=$(calculate_cross_context_effectiveness 15 20 0.85)
    echo "Cross-Context Effectiveness: ${cross_context_effectiveness}"
    
    echo ""
    echo "=== Learning Formula Testing Complete ==="
}

# Comprehensive learning validation
validate_learning_system() {
    local pattern_accuracy=$1
    local learning_effectiveness=$2
    local improvement_rate=$3
    local adaptation_speed=$4
    local cross_context_effectiveness=$5
    
    echo "=== Learning System Validation ==="
    echo "Pattern Recognition Accuracy: $pattern_accuracy"
    echo "Learning Effectiveness: $learning_effectiveness"
    echo "Strategy Improvement Rate: $improvement_rate"
    echo "Adaptation Speed: $adaptation_speed"
    echo "Cross-Context Effectiveness: $cross_context_effectiveness"
    echo ""
    
    local validation_results=0
    
    # Validate pattern recognition (≥80% target)
    if (( $(echo "$pattern_accuracy >= 0.8" | bc -l) )); then
        echo "✓ Pattern recognition accuracy: ${pattern_accuracy} (≥0.8)"
    else
        echo "✗ Pattern recognition accuracy: ${pattern_accuracy} (below 0.8)"
        ((validation_results++))
    fi
    
    # Validate learning effectiveness (≥75% target)
    if (( $(echo "$learning_effectiveness >= 0.75" | bc -l) )); then
        echo "✓ Learning effectiveness: ${learning_effectiveness} (≥0.75)"
    else
        echo "✗ Learning effectiveness: ${learning_effectiveness} (below 0.75)"
        ((validation_results++))
    fi
    
    # Validate improvement rate (≥10% per 100 interactions)
    if (( $(echo "$improvement_rate >= 0.001" | bc -l) )); then
        echo "✓ Strategy improvement rate: ${improvement_rate} (≥0.001 per interaction)"
    else
        echo "✗ Strategy improvement rate: ${improvement_rate} (below 0.001)"
        ((validation_results++))
    fi
    
    # Validate adaptation speed (≤5 interactions target)
    if (( $(echo "$adaptation_speed <= 5" | bc -l) )); then
        echo "✓ Adaptation speed: ${adaptation_speed} interactions (≤5)"
    else
        echo "✗ Adaptation speed: ${adaptation_speed} interactions (above 5)"
        ((validation_results++))
    fi
    
    # Validate cross-context effectiveness (≥70% target)
    if (( $(echo "$cross_context_effectiveness >= 0.7" | bc -l) )); then
        echo "✓ Cross-context effectiveness: ${cross_context_effectiveness} (≥0.7)"
    else
        echo "✗ Cross-context effectiveness: ${cross_context_effectiveness} (below 0.7)"
        ((validation_results++))
    fi
    
    echo ""
    if [[ $validation_results -eq 0 ]]; then
        echo "✅ ALL LEARNING SYSTEM TARGETS MET"
        return 0
    else
        echo "❌ ${validation_results} LEARNING VALIDATION FAILURES"
        return 1
    fi
}

# Test all formulas with sample data
test_token_optimization_formulas() {
    echo "=== Testing Token Optimization Formulas ==="
    echo ""
    
    # Test case 1: Good optimization
    echo "Test Case 1: Good Optimization"
    validate_complete_optimization 1000 400 100 98 500 75
    echo ""
    
    # Test case 2: Poor optimization
    echo "Test Case 2: Poor Optimization"
    validate_complete_optimization 1000 800 100 85 900 60
    echo ""
    
    # Test case 3: Excellent optimization
    echo "Test Case 3: Excellent Optimization"
    validate_complete_optimization 1000 300 100 100 400 80
    echo ""
    
    # Test learning formulas
    test_learning_formulas
    echo ""
    
    # Test comprehensive learning validation
    echo "Test Case: Comprehensive Learning System"
    validate_learning_system 0.85 0.82 0.0015 4 0.78
    echo ""
    
    echo "=== Formula Testing Complete ==="
}

# Main function for direct script execution
main() {
    local command=${1:-"test"}
    
    case $command in
        "test")
            test_token_optimization_formulas
            ;;
        "monitor")
            monitor_token_efficiency "$2" "$3"
            ;;
        "validate")
            validate_complete_optimization "$2" "$3" "$4" "$5" "$6" "$7"
            ;;
        "efficiency")
            calculate_token_efficiency "$2" "$3"
            ;;
        "ratio")
            calculate_compression_ratio "$2" "$3"
            ;;
        "quality")
            calculate_quality_coefficient "$2" "$3"
            ;;
        "budget")
            calculate_budget_utilization "$2" "$3"
            ;;
        "learning")
            calculate_learning_effectiveness "$2" "$3" "$4" "$5"
            ;;
        "pattern")
            calculate_pattern_recognition_accuracy "$2" "$3"
            ;;
        "improvement")
            calculate_strategy_improvement_rate "$2" "$3" "$4"
            ;;
        "cross-context")
            calculate_cross_context_effectiveness "$2" "$3" "$4"
            ;;
        "validate-learning")
            validate_learning_system "$2" "$3" "$4" "$5" "$6"
            ;;
        *)
            echo "Usage: $0 {test|monitor|validate|efficiency|ratio|quality|budget|learning|pattern|improvement|cross-context|validate-learning}"
            echo ""
            echo "Commands:"
            echo "  test                     - Run formula tests with sample data"
            echo "  monitor [file] [target]  - Real-time token efficiency monitoring"
            echo "  validate [args...]       - Complete optimization validation"
            echo "  efficiency [orig] [comp] - Calculate token efficiency"
            echo "  ratio [orig] [comp]      - Calculate compression ratio"
            echo "  quality [orig] [comp]    - Calculate quality coefficient"
            echo "  budget [used] [total]    - Calculate budget utilization"
            echo "  learning [p] [s] [a] [sp] - Calculate learning effectiveness"
            echo "  pattern [succ] [total]   - Calculate pattern recognition accuracy"
            echo "  improvement [bef] [aft] [int] - Calculate strategy improvement rate"
            echo "  cross-context [succ] [att] [acc] - Calculate cross-context effectiveness"
            echo "  validate-learning [args...] - Validate complete learning system"
            exit 1
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi