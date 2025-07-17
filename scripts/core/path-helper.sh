#!/bin/bash

# Path Helper for Context Engineering Commands
# Provides robust path resolution for commands at any depth level

# Function to get the project root directory
get_project_root() {
    local current_dir="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    echo "${current_dir}" | sed 's|/.claude/commands.*||'
}

# Function to source scripts from project root
source_script() {
    local script_path="$1"
    local project_root="$(get_project_root)"
    local full_path="${project_root}/${script_path}"
    
    if [[ -f "${full_path}" ]]; then
        source "${full_path}"
        echo "✅ Sourced: ${script_path}"
    else
        echo "❌ Script not found: ${full_path}"
        return 1
    fi
}

# Function to execute scripts from project root
execute_script() {
    local script_path="$1"
    local project_root="$(get_project_root)"
    local full_path="${project_root}/${script_path}"
    
    if [[ -f "${full_path}" ]]; then
        cd "${project_root}"
        "${full_path}" "${@:2}"
        echo "✅ Executed: ${script_path}"
    else
        echo "❌ Script not found: ${full_path}"
        return 1
    fi
}

# Function to validate project root detection
validate_project_root() {
    local project_root="$(get_project_root)"
    echo "📁 Detected Project Root: ${project_root}"
    
    # Verify key directories exist
    local key_dirs=("scripts" "scripts/formulas" "scripts/core" ".claude/commands")
    for dir in "${key_dirs[@]}"; do
        if [[ -d "${project_root}/${dir}" ]]; then
            echo "✅ Found: ${dir}"
        else
            echo "❌ Missing: ${dir}"
        fi
    done
}

# Export functions for use in other scripts
export -f get_project_root
export -f source_script
export -f execute_script
export -f validate_project_root