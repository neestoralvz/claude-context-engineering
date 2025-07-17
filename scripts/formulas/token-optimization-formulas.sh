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
readonly TOKEN_EFFICIENCY_MINIMUM=$(get_threshold "token_efficiency_minimum")
readonly TOKEN_EFFICIENCY_TARGET=$(get_threshold "token_efficiency_target")
readonly QUALITY_PRESERVATION_MINIMUM=$(get_threshold "quality_preservation_minimum")
readonly BUDGET_UTILIZATION_MAXIMUM=$(get_threshold "budget_utilization_maximum")
readonly COMBINED_EFFICIENCY_TARGET=$(get_threshold "combined_efficiency_target")

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
        *)
            echo "Usage: $0 {test|monitor|validate|efficiency|ratio|quality|budget}"
            echo ""
            echo "Commands:"
            echo "  test                     - Run formula tests with sample data"
            echo "  monitor [file] [target]  - Real-time token efficiency monitoring"
            echo "  validate [args...]       - Complete optimization validation"
            echo "  efficiency [orig] [comp] - Calculate token efficiency"
            echo "  ratio [orig] [comp]      - Calculate compression ratio"
            echo "  quality [orig] [comp]    - Calculate quality coefficient"
            echo "  budget [used] [total]    - Calculate budget utilization"
            exit 1
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi