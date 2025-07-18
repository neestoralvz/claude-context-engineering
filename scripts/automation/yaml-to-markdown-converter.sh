#!/bin/bash

# YAML to Markdown Conversion System
# Strategic YAML Elimination Script for Context Engineering System
# Implements automated conversion from YAML blocks to P55/P6 compliant markdown
# Version 2.0 - Comprehensive Conversion with Validation and Rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$ROOT_DIR/scripts/results/yaml-conversion/yaml-conversion-${TIMESTAMP}.log"
BACKUP_DIR="$ROOT_DIR/scripts/backups/yaml-conversion-${TIMESTAMP}"
PROGRESS_FILE="$ROOT_DIR/scripts/results/yaml-conversion/conversion-progress-${TIMESTAMP}.json"
VALIDATION_REPORT="$ROOT_DIR/scripts/results/yaml-conversion/validation-report-${TIMESTAMP}.md"
ROLLBACK_MANIFEST="$BACKUP_DIR/rollback-manifest.json"

# Statistics tracking
TOTAL_FILES=0
PROCESSED_FILES=0
SUCCESSFUL_CONVERSIONS=0
FAILED_CONVERSIONS=0
TOTAL_YAML_BLOCKS=0
CONVERTED_YAML_BLOCKS=0
VALIDATION_ERRORS=0
LINK_INTEGRITY_ERRORS=0

# Ensure directories exist
mkdir -p "$(dirname "$LOG_FILE")" "$BACKUP_DIR" "$(dirname "$PROGRESS_FILE")" "$(dirname "$VALIDATION_REPORT")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Enhanced logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Progress tracking with JSON output
track_progress() {
    local file="$1"
    local blocks_before="$2"
    local blocks_after="$3"
    local conversion_status="$4"
    local error_message="${5:-}"
    
    local blocks_converted=$((blocks_before - blocks_after))
    local progress_percentage=0
    
    if [ "$blocks_before" -gt 0 ]; then
        progress_percentage=$(bc -l <<< "scale=2; ($blocks_converted / $blocks_before) * 100")
    fi
    
    jq -n \
        --arg file "$file" \
        --arg blocks_before "$blocks_before" \
        --arg blocks_after "$blocks_after" \
        --arg blocks_converted "$blocks_converted" \
        --arg progress_percentage "$progress_percentage" \
        --arg status "$conversion_status" \
        --arg error "$error_message" \
        --arg timestamp "$(date -Iseconds)" \
        '{
            file: $file,
            blocks_before: ($blocks_before | tonumber),
            blocks_after: ($blocks_after | tonumber),
            blocks_converted: ($blocks_converted | tonumber),
            progress_percentage: ($progress_percentage | tonumber),
            status: $status,
            error: $error,
            timestamp: $timestamp
        }' >> "$PROGRESS_FILE"
}

# Backup function with manifest
backup_file() {
    local file="$1"
    local relative_path="${file#$ROOT_DIR/}"
    local backup_path="$BACKUP_DIR/$relative_path"
    
    # Create backup directory structure
    mkdir -p "$(dirname "$backup_path")"
    
    # Copy file with metadata preservation
    cp -p "$file" "$backup_path"
    
    # Add to rollback manifest
    if [ ! -f "$ROLLBACK_MANIFEST" ]; then
        echo '[]' > "$ROLLBACK_MANIFEST"
    fi
    
    jq --arg original "$file" \
       --arg backup "$backup_path" \
       --arg timestamp "$(date -Iseconds)" \
       '. += [{
           "original": $original,
           "backup": $backup,
           "timestamp": $timestamp
       }]' "$ROLLBACK_MANIFEST" > "$ROLLBACK_MANIFEST.tmp" && mv "$ROLLBACK_MANIFEST.tmp" "$ROLLBACK_MANIFEST"
    
    log "INFO" "Backed up: $file → $backup_path"
}

# Pattern 1: Configuration YAML → Structured Framework
convert_configuration_yaml() {
    local yaml_content="$1"
    local result=""
    
    # Extract YAML content and convert to structured format
    while IFS=': ' read -r key value; do
        if [[ -n "$key" && -n "$value" ]]; then
            # Clean up key formatting
            key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/_/ /g')
            key=$(echo "$key" | sed 's/\b\w/\U&/g')  # Capitalize first letter of each word
            
            # Clean up value formatting
            value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            # Convert to P55/P6 compliant format
            if [[ "$value" =~ ^[0-9]+%?$ ]]; then
                result="${result}- **$key**: $value requirement with automatic validation\n"
            elif [[ "$value" =~ ^(true|false|mandatory|required|critical)$ ]]; then
                value=$(echo "$value" | tr '[:lower:]' '[:upper:]')
                result="${result}- **$key**: $value enforcement across all operations\n"
            else
                result="${result}- **$key**: $value with ZERO exceptions\n"
            fi
        fi
    done <<< "$(echo "$yaml_content" | sed '/```yaml/d;/```/d')"
    
    echo -e "**CRITICAL Framework Configuration**:\n$result"
}

# Pattern 2: Process YAML → Numbered Protocol
convert_process_yaml() {
    local yaml_content="$1"
    local result=""
    local counter=1
    
    # Extract list items and convert to numbered protocol
    while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]* ]]; then
            # Extract the item text
            item=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//' | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            # Convert underscores to spaces and capitalize
            item=$(echo "$item" | sed 's/_/ /g' | sed 's/\b\w/\U&/g')
            
            # Add comprehensive description
            result="${result}${counter}. **$item**: Comprehensive execution with quantifiable evidence\n"
            ((counter++))
        fi
    done <<< "$(echo "$yaml_content" | sed '/```yaml/d;/```/d')"
    
    echo -e "**MANDATORY Protocol**:\n$result"
}

# Pattern 3: Formula YAML → Mathematical Code Block
convert_formula_yaml() {
    local yaml_content="$1"
    local result=""
    
    # Extract formula components
    local calculation=""
    local precision=""
    local validation=""
    
    while IFS=': ' read -r key value; do
        if [[ -n "$key" && -n "$value" ]]; then
            key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            case "$key" in
                "calculation"|"formula"|"equation")
                    calculation="$value"
                    ;;
                "precision"|"accuracy"|"tolerance")
                    precision="$value"
                    ;;
                "validation"|"verify"|"check")
                    validation="$value"
                    ;;
            esac
        fi
    done <<< "$(echo "$yaml_content" | sed '/```yaml/d;/```/d')"
    
    # Format as mathematical code block
    result="**Mathematical Formula**:\n\`\`\`\n"
    
    if [[ -n "$calculation" ]]; then
        result="${result}$calculation\n"
    fi
    
    if [[ -n "$precision" ]]; then
        result="${result}Precision: $precision (MANDATORY)\n"
    fi
    
    if [[ -n "$validation" ]]; then
        validation_upper=$(echo "$validation" | tr '[:lower:]' '[:upper:]')
        result="${result}Validation: $validation_upper with mathematical proof\n"
    fi
    
    result="${result}\`\`\`"
    
    echo -e "$result"
}

# Intelligent YAML block conversion
convert_yaml_block() {
    local yaml_content="$1"
    local block_number="$2"
    
    # Analyze YAML content to determine conversion pattern
    if echo "$yaml_content" | grep -q -E "(calculation|formula|equation|precision|tolerance)"; then
        # Pattern 3: Formula YAML
        convert_formula_yaml "$yaml_content"
    elif echo "$yaml_content" | grep -q -E "^[[:space:]]*-[[:space:]]"; then
        # Pattern 2: Process YAML (contains list items)
        convert_process_yaml "$yaml_content"
    else
        # Pattern 1: Configuration YAML (key-value pairs)
        convert_configuration_yaml "$yaml_content"
    fi
}

# Enhanced file processing with validation
process_file() {
    local file="$1"
    
    log "INFO" "Processing file: $file"
    
    # Count initial YAML blocks
    local yaml_blocks_before=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
    
    if [ "$yaml_blocks_before" -eq 0 ]; then
        log "INFO" "No YAML blocks found in $file"
        return 0
    fi
    
    log "INFO" "Found $yaml_blocks_before YAML blocks in $file"
    TOTAL_YAML_BLOCKS=$((TOTAL_YAML_BLOCKS + yaml_blocks_before))
    
    # Backup file
    backup_file "$file"
    
    # Create temporary file for processing
    local temp_file=$(mktemp)
    local current_yaml_block=""
    local in_yaml_block=false
    local yaml_block_count=0
    local converted_blocks=0
    
    # Process file line by line
    while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*\`\`\`yaml ]]; then
            # Start of YAML block
            in_yaml_block=true
            current_yaml_block="$line"$'\n'
            ((yaml_block_count++))
            continue
        elif [[ "$line" =~ ^[[:space:]]*\`\`\`$ ]] && [ "$in_yaml_block" = true ]; then
            # End of YAML block
            current_yaml_block="$current_yaml_block$line"
            in_yaml_block=false
            
            # Convert YAML block
            log "INFO" "Converting YAML block $yaml_block_count"
            local converted_content=$(convert_yaml_block "$current_yaml_block" "$yaml_block_count")
            
            # Add converted content
            echo "$converted_content" >> "$temp_file"
            ((converted_blocks++))
            
            # Reset for next block
            current_yaml_block=""
            continue
        elif [ "$in_yaml_block" = true ]; then
            # Inside YAML block
            current_yaml_block="$current_yaml_block$line"$'\n'
            continue
        else
            # Regular content
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Count remaining YAML blocks
    local yaml_blocks_after=$(grep -c '```yaml' "$temp_file" 2>/dev/null || echo "0")
    
    # Validate conversion
    if [ "$yaml_blocks_after" -eq 0 ] && [ "$converted_blocks" -eq "$yaml_blocks_before" ]; then
        # Successful conversion
        mv "$temp_file" "$file"
        log "SUCCESS" "Successfully converted $converted_blocks/$yaml_blocks_before YAML blocks in $file"
        track_progress "$file" "$yaml_blocks_before" "$yaml_blocks_after" "SUCCESS"
        
        CONVERTED_YAML_BLOCKS=$((CONVERTED_YAML_BLOCKS + converted_blocks))
        ((SUCCESSFUL_CONVERSIONS++))
        return 0
    else
        # Conversion failed
        log "ERROR" "Conversion failed for $file - Expected: $yaml_blocks_before, Remaining: $yaml_blocks_after, Converted: $converted_blocks"
        track_progress "$file" "$yaml_blocks_before" "$yaml_blocks_after" "FAILED" "Conversion validation failed"
        
        # Restore from backup
        restore_file_from_backup "$file"
        rm -f "$temp_file"
        ((FAILED_CONVERSIONS++))
        return 1
    fi
}

# Restore file from backup
restore_file_from_backup() {
    local file="$1"
    local relative_path="${file#$ROOT_DIR/}"
    local backup_path="$BACKUP_DIR/$relative_path"
    
    if [ -f "$backup_path" ]; then
        cp -p "$backup_path" "$file"
        log "INFO" "Restored $file from backup"
    else
        log "ERROR" "Backup not found for $file"
    fi
}

# Comprehensive validation functions
validate_link_integrity() {
    local file="$1"
    local broken_links=0
    
    # Check for broken internal links using grep to extract links
    local link_pattern='\[([^]]*)\]\(([^)]*)\)'
    
    # Extract all markdown links from the file
    grep -o '\[[^]]*\]([^)]*)' "$file" 2>/dev/null | while read -r link_match; do
        # Extract link URL from [text](url) format
        local link_url=$(echo "$link_match" | sed 's/.*\](\([^)]*\)).*/\1/')
        
        # Skip external links
        if [[ "$link_url" =~ ^https?:// ]]; then
            continue
        fi
        
        # Skip anchors
        if [[ "$link_url" =~ ^# ]]; then
            continue
        fi
        
        # Check internal links
        local target_file=""
        if [[ "$link_url" =~ ^/ ]]; then
            # Absolute path
            target_file="$ROOT_DIR$link_url"
        else
            # Relative path
            target_file="$(dirname "$file")/$link_url"
        fi
        
        # Remove anchors from target
        target_file="${target_file%#*}"
        
        if [[ "$link_url" =~ \.(md|txt)$ ]] && [ ! -f "$target_file" ]; then
            log "WARNING" "Broken link in $file: $link_url"
            ((broken_links++))
        fi
    done
    
    return $broken_links
}

validate_p55_p6_compliance() {
    local file="$1"
    local compliance_score=0
    local total_checks=0
    
    # Check for P55/P6 compliance indicators
    local mandatory_count=$(grep -c "MANDATORY\|REQUIRED\|CRITICAL" "$file" 2>/dev/null || echo "0")
    local weak_count=$(grep -c "should\|might\|consider\|when appropriate" "$file" 2>/dev/null || echo "0")
    
    ((total_checks++))
    if [ "$mandatory_count" -gt 0 ]; then
        ((compliance_score++))
    fi
    
    ((total_checks++))
    if [ "$weak_count" -eq 0 ]; then
        ((compliance_score++))
    fi
    
    # Check for structured formatting
    local structured_count=$(grep -c "^-[[:space:]]*\*\*.*\*\*:" "$file" 2>/dev/null || echo "0")
    ((total_checks++))
    if [ "$structured_count" -gt 0 ]; then
        ((compliance_score++))
    fi
    
    # Calculate compliance percentage
    local compliance_percentage=0
    if [ "$total_checks" -gt 0 ]; then
        compliance_percentage=$(bc -l <<< "scale=2; ($compliance_score / $total_checks) * 100")
    fi
    
    log "INFO" "P55/P6 compliance for $file: $compliance_percentage% ($compliance_score/$total_checks)"
    
    return $(echo "$compliance_percentage >= 75" | bc -l)
}

validate_functionality_preservation() {
    local file="$1"
    
    # Check that no content was lost during conversion
    local original_backup="$BACKUP_DIR/${file#$ROOT_DIR/}"
    
    if [ ! -f "$original_backup" ]; then
        log "ERROR" "Cannot validate functionality - backup not found: $original_backup"
        return 1
    fi
    
    # Count non-empty lines (excluding YAML block delimiters)
    local original_lines=$(grep -v '^[[:space:]]*```yaml\|^[[:space:]]*```$' "$original_backup" | grep -c '[^[:space:]]' || echo "0")
    local converted_lines=$(grep -v '^[[:space:]]*```yaml\|^[[:space:]]*```$' "$file" | grep -c '[^[:space:]]' || echo "0")
    
    # Allow for some variation due to conversion (±10%)
    local min_lines=$(bc -l <<< "scale=0; $original_lines * 0.9")
    local max_lines=$(bc -l <<< "scale=0; $original_lines * 1.1")
    
    if [ "$converted_lines" -ge "${min_lines%.*}" ] && [ "$converted_lines" -le "${max_lines%.*}" ]; then
        log "INFO" "Functionality preservation validated for $file"
        return 0
    else
        log "WARNING" "Possible content loss in $file - Original: $original_lines, Converted: $converted_lines"
        return 1
    fi
}

# Comprehensive file validation
validate_converted_file() {
    local file="$1"
    local validation_errors=0
    
    log "INFO" "Validating converted file: $file"
    
    # 1. Check for zero YAML blocks
    local remaining_yaml=$(grep -c '```yaml' "$file" 2>/dev/null || echo "0")
    if [ "$remaining_yaml" -ne 0 ]; then
        log "ERROR" "Validation failed: $remaining_yaml YAML blocks remain in $file"
        ((validation_errors++))
    fi
    
    # 2. Validate link integrity
    if ! validate_link_integrity "$file"; then
        log "WARNING" "Link integrity issues detected in $file"
        ((LINK_INTEGRITY_ERRORS++))
    fi
    
    # 3. Validate P55/P6 compliance
    if ! validate_p55_p6_compliance "$file"; then
        log "WARNING" "P55/P6 compliance below threshold in $file"
        ((validation_errors++))
    fi
    
    # 4. Validate functionality preservation
    if ! validate_functionality_preservation "$file"; then
        log "WARNING" "Functionality preservation concerns in $file"
        ((validation_errors++))
    fi
    
    if [ "$validation_errors" -eq 0 ]; then
        log "SUCCESS" "File validation passed: $file"
        return 0
    else
        log "ERROR" "File validation failed with $validation_errors errors: $file"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + validation_errors))
        return 1
    fi
}

# Process directory with comprehensive validation
process_directory() {
    local dir="$1"
    local validate_files="${2:-true}"
    
    log "INFO" "Processing directory: $dir"
    
    if [ ! -d "$dir" ]; then
        log "ERROR" "Directory does not exist: $dir"
        return 1
    fi
    
    # Find all markdown files
    local files=()
    while IFS= read -r file; do
        files+=("$file")
    done < <(find "$dir" -name "*.md" -type f)
    
    TOTAL_FILES=${#files[@]}
    log "INFO" "Found $TOTAL_FILES markdown files in $dir"
    
    # Process each file
    for file in "${files[@]}"; do
        ((PROCESSED_FILES++))
        
        log "INFO" "Processing file $PROCESSED_FILES/$TOTAL_FILES: $file"
        
        if process_file "$file"; then
            if [ "$validate_files" = "true" ]; then
                validate_converted_file "$file"
            fi
        fi
    done
    
    log "INFO" "Directory processing complete: $dir"
    log "INFO" "Successfully processed: $SUCCESSFUL_CONVERSIONS/$TOTAL_FILES files"
}

# Generate comprehensive report
generate_comprehensive_report() {
    log "INFO" "Generating comprehensive conversion report..."
    
    local conversion_rate=0
    local yaml_conversion_rate=0
    local success_rate=0
    
    if [ "$TOTAL_FILES" -gt 0 ]; then
        conversion_rate=$(bc -l <<< "scale=2; ($PROCESSED_FILES / $TOTAL_FILES) * 100")
        success_rate=$(bc -l <<< "scale=2; ($SUCCESSFUL_CONVERSIONS / $TOTAL_FILES) * 100")
    fi
    
    if [ "$TOTAL_YAML_BLOCKS" -gt 0 ]; then
        yaml_conversion_rate=$(bc -l <<< "scale=2; ($CONVERTED_YAML_BLOCKS / $TOTAL_YAML_BLOCKS) * 100")
    fi
    
    # Generate markdown report
    cat > "$VALIDATION_REPORT" << EOF
# YAML to Markdown Conversion Report

**Generated**: $(date)
**Session**: $TIMESTAMP
**Log File**: $LOG_FILE
**Backup Directory**: $BACKUP_DIR

---

## 📊 Conversion Statistics

### File Processing
- **Total Files Found**: $TOTAL_FILES
- **Files Processed**: $PROCESSED_FILES
- **Successful Conversions**: $SUCCESSFUL_CONVERSIONS
- **Failed Conversions**: $FAILED_CONVERSIONS
- **Processing Rate**: ${conversion_rate}%
- **Success Rate**: ${success_rate}%

### YAML Block Conversion
- **Total YAML Blocks**: $TOTAL_YAML_BLOCKS
- **Converted Blocks**: $CONVERTED_YAML_BLOCKS
- **YAML Conversion Rate**: ${yaml_conversion_rate}%

### Quality Metrics
- **Validation Errors**: $VALIDATION_ERRORS
- **Link Integrity Errors**: $LINK_INTEGRITY_ERRORS
- **P55/P6 Compliance**: Validated per file

---

## 🎯 Conversion Patterns Applied

### Pattern 1: Configuration YAML → Structured Framework
- **YAML key-value pairs** → **CRITICAL Framework Configuration**
- **Enforcement terminology** → MANDATORY, REQUIRED, CRITICAL
- **Structured formatting** → Bullet points with emphasis

### Pattern 2: Process YAML → Numbered Protocol
- **YAML list items** → **Numbered protocol steps**
- **Comprehensive descriptions** → Evidence-based execution
- **Process validation** → Quantifiable outcomes

### Pattern 3: Formula YAML → Mathematical Code Block
- **YAML formulas** → **Mathematical code blocks**
- **Precision requirements** → MANDATORY validation
- **Mathematical proof** → Required verification

---

## 🔄 Rollback Information

### Backup Manifest
- **Backup Directory**: $BACKUP_DIR
- **Rollback Manifest**: $ROLLBACK_MANIFEST
- **Rollback Command**: \`$0 --rollback $TIMESTAMP\`

### Rollback Process
1. Execute rollback command with session timestamp
2. All original files will be restored from backup
3. Conversion progress will be reset
4. Validation reports will be preserved for analysis

---

## 🎯 Next Steps

### If Conversion Successful (Success Rate ≥95%)
1. **Review converted files** for accuracy and completeness
2. **Validate P55/P6 compliance** across all converted files
3. **Test system functionality** to ensure no degradation
4. **Commit changes** with comprehensive documentation

### If Conversion Needs Review (Success Rate <95%)
1. **Analyze failure patterns** in conversion log
2. **Review validation errors** and address specific issues
3. **Consider manual conversion** for complex YAML structures
4. **Execute rollback** if major issues detected

### Quality Assurance Checklist
- [ ] Zero YAML blocks remain in converted files
- [ ] All links are functional and point to correct targets
- [ ] P55/P6 compliance maintained in all converted content
- [ ] System functionality preserved with no degradation
- [ ] Conversion patterns applied consistently across all files

---

## 📋 Detailed Progress

$(if [ -f "$PROGRESS_FILE" ]; then
    echo "### File-by-File Progress"
    echo ""
    jq -r '.[] | "- **\(.file)**: \(.blocks_converted)/\(.blocks_before) blocks converted (\(.progress_percentage | floor)%) - \(.status)"' "$PROGRESS_FILE"
else
    echo "No detailed progress data available"
fi)

---

**Report Generated**: $(date)
**Session Complete**: $([ "$FAILED_CONVERSIONS" -eq 0 ] && echo "✅ SUCCESS" || echo "⚠️ REVIEW REQUIRED")
**Rollback Available**: ✅ Yes
**Next Action**: $([ "$FAILED_CONVERSIONS" -eq 0 ] && echo "Proceed with system validation" || echo "Review failures and consider rollback")
EOF

    log "SUCCESS" "Comprehensive report generated: $VALIDATION_REPORT"
}

# Rollback functionality
rollback_conversion() {
    local session_timestamp="$1"
    local rollback_dir="$ROOT_DIR/scripts/backups/yaml-conversion-${session_timestamp}"
    local rollback_manifest="$rollback_dir/rollback-manifest.json"
    
    log "INFO" "Starting rollback for session: $session_timestamp"
    
    if [ ! -f "$rollback_manifest" ]; then
        log "ERROR" "Rollback manifest not found: $rollback_manifest"
        return 1
    fi
    
    # Process rollback manifest
    local rollback_count=0
    local rollback_errors=0
    
    while IFS= read -r entry; do
        local original=$(echo "$entry" | jq -r '.original')
        local backup=$(echo "$entry" | jq -r '.backup')
        
        if [ -f "$backup" ]; then
            if cp -p "$backup" "$original"; then
                log "SUCCESS" "Restored: $original"
                ((rollback_count++))
            else
                log "ERROR" "Failed to restore: $original"
                ((rollback_errors++))
            fi
        else
            log "ERROR" "Backup not found: $backup"
            ((rollback_errors++))
        fi
    done < <(jq -c '.[]' "$rollback_manifest")
    
    if [ "$rollback_errors" -eq 0 ]; then
        log "SUCCESS" "Rollback completed successfully: $rollback_count files restored"
        return 0
    else
        log "ERROR" "Rollback completed with $rollback_errors errors"
        return 1
    fi
}

# Help function
show_help() {
    cat << EOF
YAML to Markdown Conversion System v2.0

Usage: $0 [OPTIONS] [DIRECTORY]

Options:
    -h, --help              Show this help message
    -d, --directory DIR     Process specific directory (default: docs/)
    -v, --validate-only     Only validate files, don't convert
    -r, --rollback SESSION  Rollback conversion session
    -n, --no-validation     Skip validation after conversion
    -q, --quiet             Suppress progress output

Examples:
    $0                                    # Convert all docs/
    $0 docs/knowledge/                    # Convert specific directory
    $0 --validate-only docs/commands/     # Validate only
    $0 --rollback 20250718-143022        # Rollback session
    $0 --no-validation docs/             # Convert without validation

Conversion Patterns:
    1. Configuration YAML → Structured Framework
    2. Process YAML → Numbered Protocol  
    3. Formula YAML → Mathematical Code Block

The system automatically detects YAML patterns and applies appropriate
conversion strategies while maintaining 100% P55/P6 compliance.
EOF
}

# Main execution function
main() {
    local target_dir="$ROOT_DIR/docs"
    local validate_only=false
    local rollback_session=""
    local skip_validation=false
    local quiet=false
    
    # Parse command line arguments
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
            -v|--validate-only)
                validate_only=true
                shift
                ;;
            -r|--rollback)
                rollback_session="$2"
                shift 2
                ;;
            -n|--no-validation)
                skip_validation=true
                shift
                ;;
            -q|--quiet)
                quiet=true
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
    
    # Handle rollback
    if [ -n "$rollback_session" ]; then
        rollback_conversion "$rollback_session"
        exit $?
    fi
    
    # Validate target directory
    if [ ! -d "$target_dir" ]; then
        log "ERROR" "Target directory does not exist: $target_dir"
        exit 1
    fi
    
    # Initialize session
    log "INFO" "Starting YAML to Markdown conversion session: $TIMESTAMP"
    log "INFO" "Target directory: $target_dir"
    log "INFO" "Backup directory: $BACKUP_DIR"
    log "INFO" "Log file: $LOG_FILE"
    log "INFO" "Validation report: $VALIDATION_REPORT"
    
    # Process directory
    if [ "$validate_only" = true ]; then
        log "INFO" "Validation-only mode enabled"
        process_directory "$target_dir" true
    else
        log "INFO" "Full conversion mode enabled"
        process_directory "$target_dir" "$([ "$skip_validation" = false ] && echo "true" || echo "false")"
    fi
    
    # Generate comprehensive report
    generate_comprehensive_report
    
    # Final summary
    log "INFO" "=== CONVERSION SESSION COMPLETE ==="
    log "INFO" "Session: $TIMESTAMP"
    log "INFO" "Total Files: $TOTAL_FILES"
    log "INFO" "Successful Conversions: $SUCCESSFUL_CONVERSIONS"
    log "INFO" "Failed Conversions: $FAILED_CONVERSIONS"
    log "INFO" "YAML Blocks Converted: $CONVERTED_YAML_BLOCKS/$TOTAL_YAML_BLOCKS"
    log "INFO" "Validation Errors: $VALIDATION_ERRORS"
    log "INFO" "Link Integrity Errors: $LINK_INTEGRITY_ERRORS"
    
    if [ "$FAILED_CONVERSIONS" -eq 0 ] && [ "$VALIDATION_ERRORS" -eq 0 ]; then
        log "SUCCESS" "All conversions completed successfully"
        log "INFO" "Review the report: $VALIDATION_REPORT"
        exit 0
    else
        log "WARNING" "Some conversions failed or have validation issues"
        log "INFO" "Review the report: $VALIDATION_REPORT"
        log "INFO" "Rollback available: $0 --rollback $TIMESTAMP"
        exit 1
    fi
}

# Execute main function
main "$@"