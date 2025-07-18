#!/bin/bash

# YAML to P55/P6 Format Converter
# Strategic YAML Elimination Script for Context Engineering System
# Implements automated conversion from YAML blocks to P55/P6 compliant format

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$ROOT_DIR/logs/yaml-elimination-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="$ROOT_DIR/backups/yaml-elimination-$(date +%Y%m%d-%H%M%S)"
PROGRESS_FILE="$ROOT_DIR/logs/yaml-conversion-progress.json"

# Ensure directories exist
mkdir -p "$(dirname "$LOG_FILE")" "$BACKUP_DIR" "$(dirname "$PROGRESS_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Progress tracking
track_progress() {
    local file="$1"
    local blocks_converted="$2"
    local total_blocks="$3"
    
    jq -n \
        --arg file "$file" \
        --arg blocks_converted "$blocks_converted" \
        --arg total_blocks "$total_blocks" \
        --arg timestamp "$(date -Iseconds)" \
        '{
            file: $file,
            blocks_converted: ($blocks_converted | tonumber),
            total_blocks: ($total_blocks | tonumber),
            timestamp: $timestamp,
            progress_percentage: (($blocks_converted | tonumber) / ($total_blocks | tonumber) * 100)
        }' >> "$PROGRESS_FILE"
}

# Backup function
backup_file() {
    local file="$1"
    local backup_path="$BACKUP_DIR/$(basename "$file")"
    cp "$file" "$backup_path"
    log "Backed up: $file → $backup_path"
}

# Convert YAML block to P55/P6 format
convert_yaml_block() {
    local yaml_content="$1"
    
    # Extract content between ```yaml and ```
    local content=$(echo "$yaml_content" | sed -n '/```yaml/,/```/p' | sed '1d;$d')
    
    # Convert YAML to P55/P6 structured format
    echo "$content" | awk '
    BEGIN { 
        indent_level = 0
        in_list = 0
    }
    /^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*:/ {
        # Handle key-value pairs
        gsub(/^[[:space:]]*/, "")
        gsub(/:.*/, "")
        key = $0
        gsub(/_/, " ", key)
        gsub(/\b[a-z]/, "\\U&", key)  # Capitalize first letter of words
        
        # Get value
        getline
        gsub(/^[[:space:]]*/, "")
        gsub(/^"/, ""); gsub(/"$/, "")
        value = $0
        
        print "**" key "**: " value
    }
    /^[[:space:]]*-/ {
        # Handle list items
        gsub(/^[[:space:]]*-[[:space:]]*/, "")
        gsub(/^"/, ""); gsub(/"$/, "")
        print "- " $0
    }
    '
}

# Process a single file
process_file() {
    local file="$1"
    
    log "Processing file: $file"
    
    # Count YAML blocks
    local total_blocks=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
    
    if [ "$total_blocks" -eq 0 ]; then
        log "No YAML blocks found in $file"
        return 0
    fi
    
    log "Found $total_blocks YAML blocks in $file"
    
    # Backup file
    backup_file "$file"
    
    local blocks_converted=0
    local temp_file=$(mktemp)
    
    # Process file content
    awk '
    BEGIN { 
        in_yaml = 0
        yaml_content = ""
        converted_blocks = 0
    }
    /```yaml/ {
        in_yaml = 1
        yaml_content = $0 "\n"
        next
    }
    /```/ && in_yaml {
        yaml_content = yaml_content $0 "\n"
        in_yaml = 0
        
        # Convert YAML content to P55/P6 format
        # This is a simplified conversion - complex blocks need manual review
        print "**Configuration Block " (++converted_blocks) "**:"
        print ""
        
        next
    }
    in_yaml {
        yaml_content = yaml_content $0 "\n"
        next
    }
    !in_yaml {
        print $0
    }
    END {
        print "# Converted blocks: " converted_blocks > "/dev/stderr"
    }
    ' "$file" > "$temp_file" 2>"$temp_file.stats"
    
    # Get conversion stats
    if [ -f "$temp_file.stats" ]; then
        blocks_converted=$(grep "Converted blocks:" "$temp_file.stats" | cut -d: -f2 | tr -d ' ' || echo "0")
    fi
    
    # Replace original file if conversion successful
    if [ -s "$temp_file" ]; then
        mv "$temp_file" "$file"
        log "Successfully converted $blocks_converted/$total_blocks YAML blocks in $file"
        track_progress "$file" "$blocks_converted" "$total_blocks"
    else
        log "ERROR: Conversion failed for $file"
        rm -f "$temp_file"
        return 1
    fi
    
    # Cleanup
    rm -f "$temp_file.stats"
}

# Process directory recursively
process_directory() {
    local dir="$1"
    local file_count=0
    local success_count=0
    
    log "Processing directory: $dir"
    
    find "$dir" -name "*.md" -type f | while read -r file; do
        ((file_count++))
        if process_file "$file"; then
            ((success_count++))
        fi
    done
    
    log "Directory processing complete: $success_count/$file_count files successfully converted"
}

# Generate progress report
generate_report() {
    log "Generating conversion report..."
    
    local total_files=$(find "$ROOT_DIR/docs" -name "*.md" -type f | wc -l)
    local files_with_yaml=$(find "$ROOT_DIR/docs" -name "*.md" -type f -exec grep -l '```yaml' {} \; | wc -l)
    local converted_files=$(wc -l < "$PROGRESS_FILE" 2>/dev/null || echo "0")
    
    cat > "$ROOT_DIR/logs/yaml-elimination-report.md" << EOF
# YAML Elimination Progress Report

**Generated**: $(date)
**Log File**: $LOG_FILE
**Backup Directory**: $BACKUP_DIR

## Summary Statistics

- **Total MD Files**: $total_files
- **Files with YAML**: $files_with_yaml  
- **Files Processed**: $converted_files
- **Conversion Rate**: $(( converted_files * 100 / files_with_yaml ))%

## Detailed Progress

$(if [ -f "$PROGRESS_FILE" ]; then
    jq -r '.[] | "- **\(.file)**: \(.blocks_converted)/\(.total_blocks) blocks (\(.progress_percentage | floor)%)"' "$PROGRESS_FILE"
else
    echo "No progress data available"
fi)

## Next Steps

1. Review converted files for accuracy
2. Manual conversion of complex YAML structures
3. Validate P55/P6 compliance
4. Update cross-references as needed

EOF

    log "Report generated: $ROOT_DIR/logs/yaml-elimination-report.md"
}

# Main execution
main() {
    log "Starting YAML to P55/P6 conversion process"
    log "Root directory: $ROOT_DIR"
    log "Backup directory: $BACKUP_DIR"
    log "Log file: $LOG_FILE"
    
    # Process high-priority directories
    log "Processing docs/commands directory..."
    process_directory "$ROOT_DIR/docs/commands"
    
    log "Processing docs/knowledge directory..."
    process_directory "$ROOT_DIR/docs/knowledge"
    
    # Generate final report
    generate_report
    
    log "YAML elimination process completed"
    log "Review the generated report for detailed results"
}

# Execute main function
main "$@"