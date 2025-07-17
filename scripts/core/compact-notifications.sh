#!/bin/bash

# ⚡ Compact Notification Library
# High-density, color-coded notifications for maximum value per character

# ================================================================
# CORE CONFIGURATION
# ================================================================

# Essential colors only (4 core states)
readonly R='\033[31m'    # Error
readonly G='\033[32m'    # Success  
readonly Y='\033[33m'    # Warning
readonly B='\033[34m'    # Info
readonly N='\033[0m'     # Reset

# Compact symbols
readonly ✓='✓'   # Success
readonly ✗='✗'   # Error  
readonly ⚠='⚠'   # Warning
readonly ℹ='ℹ'   # Info
readonly ⟳='⟳'   # Processing
readonly ◉='◉'   # Active

# ================================================================
# CORE NOTIFICATION FUNCTIONS
# ================================================================

# Compact status line: [STATUS] Action → Result (time)
cn_status() {
    local status="$1" action="$2" result="$3" time="$4"
    local symbol color
    
    case "$status" in
        "ok"|"success") symbol="$✓"; color="$G" ;;
        "fail"|"error") symbol="$✗"; color="$R" ;;
        "warn"|"warning") symbol="$⚠"; color="$Y" ;;
        "info") symbol="$ℹ"; color="$B" ;;
        "active"|"running") symbol="$◉"; color="$B" ;;
        "process") symbol="$⟳"; color="$Y" ;;
        *) symbol="$ℹ"; color="$B" ;;
    esac
    
    printf "${color}[%s]${N} %s" "$symbol" "$action"
    [[ -n "$result" ]] && printf " → %s" "$result"
    [[ -n "$time" ]] && printf " (%s)" "$time"
    printf "\n"
}

# Dense progress: Phase 1/3 ██████░░░░ 60% Action
cn_progress() {
    local current="$1" total="$2" percent="$3" action="$4"
    local filled=$((percent / 10))
    local bar=""
    
    for ((i=1; i<=10; i++)); do
        [[ $i -le $filled ]] && bar+="█" || bar+="░"
    done
    
    printf "${B}Phase %d/%d${N} %s %d%% %s\n" "$current" "$total" "$bar" "$percent" "$action"
}

# Compact metrics: 76cmd 12auth 16mod [2.1s]
cn_metrics() {
    local -A metrics=()
    
    # Parse key=value pairs
    for arg in "$@"; do
        if [[ "$arg" =~ ^([^=]+)=(.+)$ ]]; then
            metrics["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
        fi
    done
    
    local output=""
    for key in "${!metrics[@]}"; do
        output+="${metrics[$key]}$key "
    done
    
    printf "${B}%s${N}\n" "${output% }"
}

# Dense summary: ✓12 ⚠3 ✗1 [4.2s] 76% efficiency
cn_summary() {
    local success="$1" warnings="$2" errors="$3" time="$4" efficiency="$5"
    
    printf "${G}$✓%d${N} ${Y}$⚠%d${N} ${R}$✗%d${N}" "$success" "$warnings" "$errors"
    [[ -n "$time" ]] && printf " [%s]" "$time"
    [[ -n "$efficiency" ]] && printf " %s%% efficiency" "$efficiency"
    printf "\n"
}

# Ultra-compact file operation: ✓ file.md (1.2K→0.8K) -33%
cn_file_op() {
    local status="$1" file="$2" before="$3" after="$4"
    local symbol color
    
    case "$status" in
        "ok"|"success") symbol="$✓"; color="$G" ;;
        "fail"|"error") symbol="$✗"; color="$R" ;;
        "warn") symbol="$⚠"; color="$Y" ;;
        *) symbol="$ℹ"; color="$B" ;;
    esac
    
    printf "${color}%s${N} %s" "$symbol" "$(basename "$file")"
    
    if [[ -n "$before" && -n "$after" ]]; then
        local change_percent=$(( (after - before) * 100 / before ))
        local sign=""
        [[ $change_percent -gt 0 ]] && sign="+"
        printf " (%s→%s) %s%d%%" "$before" "$after" "$sign" "$change_percent"
    fi
    printf "\n"
}

# Compact error with context: ✗ validate.sh:42 TypeError → retry 3/5
cn_error() {
    local file="$1" line="$2" error="$3" action="$4" attempt="$5" max="$6"
    
    printf "${R}$✗${N} %s" "$(basename "$file")"
    [[ -n "$line" ]] && printf ":%s" "$line"
    printf " %s" "$error"
    [[ -n "$action" ]] && printf " → %s" "$action"
    [[ -n "$attempt" && -n "$max" ]] && printf " %d/%d" "$attempt" "$max"
    printf "\n"
}

# Dense validation result: ✓ P55/P56 ✓ Math ⚠ Links [2.1s]
cn_validation() {
    local -A results=()
    local time=""
    
    # Parse validation results
    for arg in "$@"; do
        if [[ "$arg" =~ ^time=(.+)$ ]]; then
            time="${BASH_REMATCH[1]}"
        elif [[ "$arg" =~ ^([^=]+)=(.+)$ ]]; then
            results["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
        fi
    done
    
    local output=""
    for category in "${!results[@]}"; do
        local status="${results[$category]}"
        case "$status" in
            "ok"|"pass"|"success") output+="${G}$✓${N} $category " ;;
            "fail"|"error") output+="${R}$✗${N} $category " ;;
            "warn"|"warning") output+="${Y}$⚠${N} $category " ;;
            *) output+="${B}$ℹ${N} $category " ;;
        esac
    done
    
    printf "%s" "${output% }"
    [[ -n "$time" ]] && printf " [%s]" "$time"
    printf "\n"
}

# Compact command execution: ⟳ /context-eng → ✓ 76cmd loaded [1.8s]
cn_command() {
    local cmd="$1" result="$2" time="$3"
    
    printf "${Y}$⟳${N} %s → ${G}$✓${N} %s" "$cmd" "$result"
    [[ -n "$time" ]] && printf " [%s]" "$time"
    printf "\n"
}

# Dense system health: CPU 45% MEM 2.1G DISK 67% NET ok
cn_health() {
    local cpu="$1" memory="$2" disk="$3" network="$4"
    
    printf "${B}CPU${N} %s ${B}MEM${N} %s ${B}DISK${N} %s ${B}NET${N} %s\n" \
           "$cpu" "$memory" "$disk" "$network"
}

# ================================================================
# UTILITY FUNCTIONS
# ================================================================

# Convert bytes to human readable: 1234567 → 1.2M
cn_human_size() {
    local bytes="$1"
    local units=("B" "K" "M" "G" "T")
    local unit=0
    
    while (( bytes > 1024 && unit < 4 )); do
        bytes=$((bytes / 1024))
        ((unit++))
    done
    
    printf "%.1f%s" "$bytes" "${units[$unit]}"
}

# Elapsed time formatter: 125 → 2m5s
cn_format_time() {
    local seconds="$1"
    
    if (( seconds < 60 )); then
        printf "%ds" "$seconds"
    elif (( seconds < 3600 )); then
        printf "%dm%ds" $((seconds / 60)) $((seconds % 60))
    else
        printf "%dh%dm" $((seconds / 3600)) $(((seconds % 3600) / 60))
    fi
}

# ================================================================
# EXPORT FUNCTIONS
# ================================================================

# Make functions available when sourced
export -f cn_status cn_progress cn_metrics cn_summary cn_file_op
export -f cn_error cn_validation cn_command cn_health
export -f cn_human_size cn_format_time