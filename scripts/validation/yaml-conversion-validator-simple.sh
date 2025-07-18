#!/bin/bash

# Simple YAML Conversion Validation Script
# Quick validation system for YAML to Markdown conversions

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

# Statistics
TOTAL_FILES=0
YAML_BLOCKS_FOUND=0
BROKEN_LINKS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Validate single file
validate_file() {
    local file="$1"
    local file_passed=true
    
    # Check for YAML blocks
    local yaml_count=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
    if [ "$yaml_count" -gt 0 ]; then
        log "ERROR" "Found $yaml_count YAML blocks in $file"
        YAML_BLOCKS_FOUND=$((YAML_BLOCKS_FOUND + yaml_count))
        file_passed=false
    fi
    
    # Check for broken links
    local broken_count=0
    while IFS= read -r link_match; do
        local link_url=$(echo "$link_match" | sed 's/.*](\([^)]*\)).*/\1/')
        
        # Skip external links and anchors
        if [[ "$link_url" =~ ^https?:// ]] || [[ "$link_url" =~ ^# ]]; then
            continue
        fi
        
        # Check internal links
        local target_file=""
        if [[ "$link_url" =~ ^/ ]]; then
            target_file="$ROOT_DIR$link_url"
        else
            target_file="$(dirname "$file")/$link_url"
        fi
        
        # Remove anchors
        target_file="${target_file%#*}"
        
        if [[ "$link_url" =~ \.(md|txt)$ ]] && [ ! -f "$target_file" ]; then
            log "WARNING" "Broken link in $file: $link_url"
            ((broken_count++))
            file_passed=false
        fi
    done < <(grep -o '\[[^]]*\]([^)]*)' "$file" 2>/dev/null || true)
    
    BROKEN_LINKS=$((BROKEN_LINKS + broken_count))
    
    if [ "$file_passed" = true ]; then
        log "SUCCESS" "Validation passed: $file"
        return 0
    else
        log "ERROR" "Validation failed: $file"
        return 1
    fi
}

# Validate directory
validate_directory() {
    local dir="$1"
    local passed_files=0
    local failed_files=0
    
    log "INFO" "Validating directory: $dir"
    
    # Find all markdown files
    while IFS= read -r file; do
        ((TOTAL_FILES++))
        log "INFO" "Validating file $TOTAL_FILES: $file"
        
        if validate_file "$file"; then
            ((passed_files++))
        else
            ((failed_files++))
        fi
    done < <(find "$dir" -name "*.md" -type f 2>/dev/null)
    
    log "INFO" "Validation complete for $dir"
    log "INFO" "Files passed: $passed_files"
    log "INFO" "Files failed: $failed_files"
    log "INFO" "YAML blocks found: $YAML_BLOCKS_FOUND"
    log "INFO" "Broken links found: $BROKEN_LINKS"
    
    return $failed_files
}

# System scan for YAML
scan_yaml_blocks() {
    local dir="$1"
    
    log "INFO" "Scanning for YAML blocks in: $dir"
    
    local yaml_files=()
    while IFS= read -r file; do
        yaml_files+=("$file")
    done < <(find "$dir" -name "*.md" -type f -exec grep -l '```yaml' {} \; 2>/dev/null)
    
    if [ ${#yaml_files[@]} -eq 0 ]; then
        log "SUCCESS" "No YAML blocks found in $dir"
        return 0
    else
        log "ERROR" "Found YAML blocks in ${#yaml_files[@]} files:"
        for file in "${yaml_files[@]}"; do
            local count=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
            log "ERROR" "  $file: $count blocks"
            YAML_BLOCKS_FOUND=$((YAML_BLOCKS_FOUND + count))
        done
        return 1
    fi
}

# Help function
show_help() {
    cat << EOF
YAML Conversion Validation Script (Simple)

Usage: $0 [OPTIONS] [DIRECTORY]

Options:
    -h, --help              Show this help message
    -d, --directory DIR     Validate specific directory (default: docs/)
    -s, --system-scan       Scan entire system for YAML blocks

Examples:
    $0                      # Validate all docs/
    $0 docs/knowledge/      # Validate specific directory
    $0 --system-scan        # Full system YAML detection

Validation checks:
    1. Zero YAML blocks
    2. Link integrity (basic check)
EOF
}

# Main function
main() {
    local target_dir="$ROOT_DIR/docs"
    local system_scan=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--directory)
                target_dir="$2"
                shift 2
                ;;
            -s|--system-scan)
                system_scan=true
                shift
                ;;
            *)
                if [ -d "$1" ]; then
                    target_dir="$1"
                else
                    log "ERROR" "Unknown option or invalid directory: $1"
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    log "INFO" "Starting YAML conversion validation: $TIMESTAMP"
    log "INFO" "Target directory: $target_dir"
    
    # Execute validation
    if [ "$system_scan" = true ]; then
        log "INFO" "System scan mode: Detecting remaining YAML blocks"
        if scan_yaml_blocks "$ROOT_DIR"; then
            log "SUCCESS" "System scan completed - no YAML blocks found"
            exit 0
        else
            log "ERROR" "System scan found $YAML_BLOCKS_FOUND YAML blocks"
            exit 1
        fi
    else
        log "INFO" "Full validation mode: Comprehensive file validation"
        if validate_directory "$target_dir"; then
            log "SUCCESS" "All validation checks passed"
            exit 0
        else
            log "WARNING" "Some validation checks failed"
            log "INFO" "YAML blocks found: $YAML_BLOCKS_FOUND"
            log "INFO" "Broken links found: $BROKEN_LINKS"
            exit 1
        fi
    fi
}

# Execute main
main "$@"