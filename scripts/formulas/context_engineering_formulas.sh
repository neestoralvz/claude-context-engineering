#!/bin/bash
# Context Engineering Mathematical Formula Library
# All verified mathematical formulas ready for production use

# Confidence calculation
calculate_confidence() {
    local domain_familiarity=$1
    local requirement_clarity=$2
    local resource_availability=$3
    echo "scale=4; ($domain_familiarity * 0.4) + ($requirement_clarity * 0.4) + ($resource_availability * 0.2)" | bc
}

# Complexity calculation
calculate_complexity() {
    local objective_count=$1
    local dependency_factor=$2
    local integration_complexity=$3
    local log_objectives=$(echo "scale=6; l($objective_count + 1)" | bc -l)
    local complexity=$(echo "scale=4; ($log_objectives * 0.4) + ($dependency_factor * 0.4) + ($integration_complexity * 0.2)" | bc)
    echo "scale=4; if ($complexity > 3.0) 3.0 else $complexity" | bc
}

# Functional score calculation
calculate_functional_score() {
    local completeness=$1
    local correctness=$2
    local edge_cases=$3
    echo "scale=4; ($completeness * 0.4) + ($correctness * 0.4) + ($edge_cases * 0.2)" | bc
}

# Threshold compliance
calculate_threshold_compliance() {
    local current_value=$1
    local threshold_value=$2
    local comparison_type=$3
    case $comparison_type in
        "gte") if (( $(echo "$current_value >= $threshold_value" | bc -l) )); then echo "1"; else echo "0"; fi ;;
        "lte") if (( $(echo "$current_value <= $threshold_value" | bc -l) )); then echo "1"; else echo "0"; fi ;;
        "eq") if (( $(echo "$current_value == $threshold_value" | bc -l) )); then echo "1"; else echo "0"; fi ;;
        *) echo "0" ;;
    esac
}

# Parallel benefit calculation
calculate_parallel_benefit() {
    local sequential_time=$1
    local parallel_time=$2
    local coordination_overhead=$3
    local total_parallel_time=$(echo "scale=4; $parallel_time + $coordination_overhead" | bc)
    local time_saved=$(echo "scale=4; $sequential_time - $total_parallel_time" | bc)
    echo "scale=4; $time_saved / $sequential_time" | bc
}

# Adaptive threshold calculation
calculate_adaptive_threshold() {
    local task_criticality=$1
    case $task_criticality in
        "production_critical") echo "9.5" ;;
        "high") echo "9.0" ;;
        "medium") echo "8.5" ;;
        "low") echo "7.5" ;;
        *) echo "8.0" ;;
    esac
}
