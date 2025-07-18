#!/bin/bash
# 🔄 Context Engineering - Systematic Cross-Reference Update System
# Actualización segura y sistemática de referencias cruzadas

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/scripts/results/updates"
BACKUP_DIR="$PROJECT_ROOT/scripts/backups/cross-references"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
UPDATE_LOG="$RESULTS_DIR/update-log-$TIMESTAMP.json"
BACKUP_MANIFEST="$BACKUP_DIR/backup-manifest-$TIMESTAMP.json"

# Ripgrep path detection
if command -v rg &> /dev/null; then
    RG_CMD="rg"
elif [ -f "/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg" ]; then
    RG_CMD="/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg"
else
    RG_CMD="grep" # fallback
fi

# Global variables
OLD_REF=""
NEW_REF=""
DRY_RUN=false
FORCE_UPDATE=false
BACKUP_CREATED=false
UPDATED_FILES=()
FAILED_FILES=()
VALIDATION_SCRIPT="$PROJECT_ROOT/scripts/validation/validate-reference-integrity.sh"

# Ensure directories exist
mkdir -p "$RESULTS_DIR" "$BACKUP_DIR"

echo -e "${BLUE}🔄 Context Engineering - Systematic Cross-Reference Update${NC}"
echo "=================================================================="
echo ""

# Function to log with timestamp
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to create backup
create_backup() {
    log "Creating backup of affected files..."
    
    local backup_name="cross-ref-backup-$TIMESTAMP"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Find all files that would be affected
    local affected_files=$(mktemp)
    $RG_CMD -l "$OLD_REF" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null > "$affected_files" || true
    
    local backed_up_count=0
    local backup_manifest=()
    
    while read -r file; do
        if [ -f "$file" ]; then
            # Create relative path structure in backup
            local relative_path="${file#$PROJECT_ROOT/}"
            local backup_file_path="$backup_path/$relative_path"
            local backup_dir_path="$(dirname "$backup_file_path")"
            
            # Create directory structure
            mkdir -p "$backup_dir_path"
            
            # Copy file with metadata preservation
            cp -p "$file" "$backup_file_path"
            
            # Add to manifest
            backup_manifest+=("\"$relative_path\"")
            ((backed_up_count++))
        fi
    done < "$affected_files"
    
    rm "$affected_files"
    
    # Create backup manifest
    cat > "$BACKUP_MANIFEST" << EOF
{
  "backup_metadata": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_name": "$backup_name",
    "backup_path": "$backup_path",
    "old_reference": "$OLD_REF",
    "new_reference": "$NEW_REF",
    "backed_up_count": $backed_up_count
  },
  "backed_up_files": [
$(IFS=','; echo "${backup_manifest[*]}")
  ],
  "restore_command": "rsync -av '$backup_path/' '$PROJECT_ROOT/'"
}
EOF

    BACKUP_CREATED=true
    log_success "Backup created: $backup_path ($backed_up_count files)"
    echo -e "  📋 Manifest: ${YELLOW}$BACKUP_MANIFEST${NC}"
}

# Function to validate before update
validate_before_update() {
    log "Running pre-update validation..."
    
    if [ ! -f "$VALIDATION_SCRIPT" ]; then
        log_error "Validation script not found: $VALIDATION_SCRIPT"
        exit 1
    fi
    
    # Run validation in simulation mode
    if ! "$VALIDATION_SCRIPT" "$OLD_REF" "$NEW_REF" > /dev/null 2>&1; then
        log_error "Pre-update validation failed"
        echo ""
        echo "Run the following command to see validation details:"
        echo "  $VALIDATION_SCRIPT '$OLD_REF' '$NEW_REF'"
        exit 1
    fi
    
    log_success "Pre-update validation passed"
}

# Function to update a single file
update_file() {
    local file="$1"
    local temp_file=$(mktemp)
    
    # Use sed for safe replacement with backup
    if sed "s|$OLD_REF|$NEW_REF|g" "$file" > "$temp_file"; then
        # Verify the replacement was made
        local old_count=$(grep -c "$OLD_REF" "$file" 2>/dev/null || echo 0)
        local new_count=$(grep -c "$NEW_REF" "$temp_file" 2>/dev/null || echo 0)
        
        if [ "$old_count" -eq "$new_count" ] && [ "$new_count" -gt 0 ]; then
            # Apply the changes
            if [ "$DRY_RUN" = false ]; then
                mv "$temp_file" "$file"
            else
                rm "$temp_file"
            fi
            
            local relative_path="${file#$PROJECT_ROOT/}"
            UPDATED_FILES+=("$relative_path:$old_count")
            log_success "Updated: $relative_path ($old_count replacements)"
        else
            rm "$temp_file"
            log_warning "No changes needed: ${file#$PROJECT_ROOT/}"
        fi
    else
        rm "$temp_file"
        local relative_path="${file#$PROJECT_ROOT/}"
        FAILED_FILES+=("$relative_path")
        log_error "Failed to update: $relative_path"
    fi
}

# Function to update all references
update_references() {
    log "Starting systematic reference update..."
    
    local temp_file=$(mktemp)
    local total_files=0
    
    # Find all files containing the old reference
    $RG_CMD -l "$OLD_REF" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null > "$temp_file" || true
    
    while read -r file; do
        if [ -f "$file" ]; then
            ((total_files++))
            update_file "$file"
        fi
    done < "$temp_file"
    
    rm "$temp_file"
    
    log "Update process completed"
    echo "  📊 Total files processed: $total_files"
    echo "  ✅ Successfully updated: ${#UPDATED_FILES[@]}"
    echo "  ❌ Failed updates: ${#FAILED_FILES[@]}"
}

# Function to validate after update
validate_after_update() {
    if [ "$DRY_RUN" = true ]; then
        log "Skipping post-update validation (dry run mode)"
        return
    fi
    
    log "Running post-update validation..."
    
    # Check for any remaining old references
    local remaining_refs=$($RG_CMD -c "$OLD_REF" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
    
    if [ "$remaining_refs" -gt 0 ]; then
        log_warning "$remaining_refs old references still remain"
        echo ""
        echo "Remaining references:"
        $RG_CMD -n "$OLD_REF" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null | head -10
    else
        log_success "All old references successfully updated"
    fi
    
    # Verify new references exist
    local new_ref_count=$($RG_CMD -c "$NEW_REF" "$PROJECT_ROOT" --type md --type json --type js --type ts --type sh 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
    
    if [ "$new_ref_count" -gt 0 ]; then
        log_success "New references detected: $new_ref_count instances"
    else
        log_warning "No new references found - this may indicate an issue"
    fi
}

# Function to generate update report
generate_update_report() {
    log "Generating update report..."
    
    # Create JSON log
    cat > "$UPDATE_LOG" << EOF
{
  "update_metadata": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "old_reference": "$OLD_REF",
    "new_reference": "$NEW_REF",
    "dry_run": $DRY_RUN,
    "force_update": $FORCE_UPDATE,
    "backup_created": $BACKUP_CREATED,
    "backup_manifest": "$([ "$BACKUP_CREATED" = true ] && echo "$BACKUP_MANIFEST" || echo "null")"
  },
  "update_results": {
    "updated_files_count": ${#UPDATED_FILES[@]},
    "failed_files_count": ${#FAILED_FILES[@]},
    "total_replacements": $(printf '%s\n' "${UPDATED_FILES[@]}" | cut -d: -f2 | awk '{sum+=$1} END {print sum+0}')
  },
  "updated_files": [
$(printf '    "%s"' "${UPDATED_FILES[@]}" | paste -sd ',\n' -)
  ],
  "failed_files": [
$(printf '    "%s"' "${FAILED_FILES[@]}" | paste -sd ',\n' -)
  ],
  "next_steps": [
    "Review updated files for correctness",
    "Test critical functionality",
    "Commit changes with descriptive message",
    "Monitor for any broken references"
  ]
}
EOF

    # Create markdown report
    local report_file="$RESULTS_DIR/update-report-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# 🔄 Cross-Reference Update Report

**Generated**: $(date)
**Update**: \`$OLD_REF\` → \`$NEW_REF\`
**Mode**: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE UPDATE")

## 📊 Update Summary

- **Files Updated**: ${#UPDATED_FILES[@]}
- **Files Failed**: ${#FAILED_FILES[@]}
- **Total Replacements**: $(printf '%s\n' "${UPDATED_FILES[@]}" | cut -d: -f2 | awk '{sum+=$1} END {print sum+0}')
- **Backup Created**: $([ "$BACKUP_CREATED" = true ] && echo "✅ Yes" || echo "❌ No")

## ✅ Successfully Updated Files

$(if [ ${#UPDATED_FILES[@]} -eq 0 ]; then
    echo "No files were updated."
else
    printf '- **%s**: %s replacement(s)\n' $(printf '%s\n' "${UPDATED_FILES[@]}" | sed 's/:/ /')
fi)

## ❌ Failed Updates

$(if [ ${#FAILED_FILES[@]} -eq 0 ]; then
    echo "No failures occurred."
else
    printf '- %s\n' "${FAILED_FILES[@]}"
fi)

## 🔄 Backup Information

$(if [ "$BACKUP_CREATED" = true ]; then
    echo "**Backup Created**: ✅ Yes"
    echo "**Backup Manifest**: \`$BACKUP_MANIFEST\`"
    echo ""
    echo "**Restore Command** (if needed):"
    echo "\`\`\`bash"
    echo "rsync -av '$BACKUP_DIR/cross-ref-backup-$TIMESTAMP/' '$PROJECT_ROOT/'"
    echo "\`\`\`"
else
    echo "**Backup Created**: ❌ No"
fi)

## 📋 Next Steps

$(if [ "$DRY_RUN" = true ]; then
    echo "1. **Review this report** to understand the impact"
    echo "2. **Run without --dry-run** to apply changes:"
    echo "   \`\`\`bash"
    echo "   $0 '$OLD_REF' '$NEW_REF'"
    echo "   \`\`\`"
    echo "3. **Validate results** after applying changes"
else
    echo "1. **Review updated files** for correctness"
    echo "2. **Test critical functionality** affected by changes"
    echo "3. **Commit changes** with descriptive message"
    echo "4. **Monitor** for any broken references"
fi)

---

*Generated by Context Engineering Cross-Reference Update System*
EOF

    echo ""
    log_success "Reports generated:"
    echo -e "  📊 JSON Log: ${YELLOW}$UPDATE_LOG${NC}"
    echo -e "  📄 Report: ${YELLOW}$report_file${NC}"
}

# Function to show help
show_help() {
    cat << EOF
🔄 Context Engineering - Systematic Cross-Reference Update System

USAGE:
    $0 [OPTIONS] OLD_REFERENCE NEW_REFERENCE

ARGUMENTS:
    OLD_REFERENCE    Current reference to be replaced
    NEW_REFERENCE    New reference to replace it with

OPTIONS:
    -h, --help       Show this help message
    -n, --dry-run    Show what would be changed without making changes
    -f, --force      Skip validation and proceed with update
    -v, --verbose    Enable verbose output
    --no-backup      Skip creating backup (not recommended)

EXAMPLES:
    $0 --dry-run "#94" "#100"           # Preview changes
    $0 "#94" "#100"                     # Apply changes
    $0 "94 principios" "103 principios" # Update count references

DESCRIPTION:
    Systematically updates cross-references throughout the project with:
    - Pre-update validation
    - Automatic backup creation
    - Safe atomic updates
    - Post-update verification
    - Detailed reporting

SAFETY FEATURES:
    - Validation before changes
    - Automatic backups
    - Rollback capability
    - Dry run mode
    - Change verification

EOF
}

# Function to rollback changes
rollback_changes() {
    if [ "$BACKUP_CREATED" = false ]; then
        log_error "No backup available for rollback"
        exit 1
    fi
    
    local backup_manifest_path="$BACKUP_MANIFEST"
    
    if [ ! -f "$backup_manifest_path" ]; then
        log_error "Backup manifest not found: $backup_manifest_path"
        exit 1
    fi
    
    log "Rolling back changes from backup..."
    
    local backup_path=$(jq -r '.backup_metadata.backup_path' "$backup_manifest_path")
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        exit 1
    fi
    
    # Restore files
    if rsync -av "$backup_path/" "$PROJECT_ROOT/"; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed"
        exit 1
    fi
}

# Main update function
main() {
    if [ -z "$OLD_REF" ] || [ -z "$NEW_REF" ]; then
        echo -e "${RED}❌ Error: Both OLD_REFERENCE and NEW_REFERENCE are required${NC}"
        show_help
        exit 1
    fi
    
    log "Starting systematic cross-reference update..."
    echo "  📝 Old reference: '$OLD_REF'"
    echo "  📝 New reference: '$NEW_REF'"
    echo "  🔧 Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE UPDATE")"
    echo ""
    
    # Validation phase
    if [ "$FORCE_UPDATE" = false ]; then
        validate_before_update
    else
        log_warning "Skipping validation (forced mode)"
    fi
    
    # Backup phase
    if [ "$DRY_RUN" = false ] && [ "${NO_BACKUP:-false}" = false ]; then
        create_backup
    fi
    
    # Update phase
    update_references
    
    # Validation phase
    validate_after_update
    
    # Reporting phase
    generate_update_report
    
    # Summary
    echo ""
    if [ ${#FAILED_FILES[@]} -eq 0 ]; then
        log_success "Update completed successfully!"
        echo "  ✅ ${#UPDATED_FILES[@]} files updated"
        if [ "$DRY_RUN" = false ]; then
            echo "  📦 Backup available for rollback if needed"
        fi
    else
        log_error "Update completed with ${#FAILED_FILES[@]} failures"
        echo "  ✅ ${#UPDATED_FILES[@]} files updated successfully"
        echo "  ❌ ${#FAILED_FILES[@]} files failed to update"
    fi
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! $RG_CMD --version &> /dev/null; then
        missing_deps+=("ripgrep (rg)")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies:${NC}"
        printf '%s\n' "${missing_deps[@]}"
        echo ""
        echo "Please install missing dependencies and try again."
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE_UPDATE=true
            shift
            ;;
        -v|--verbose)
            set -x
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --rollback)
            if [ -n "${2:-}" ] && [ -f "$2" ]; then
                BACKUP_MANIFEST="$2"
                rollback_changes
                exit 0
            else
                echo -e "${RED}❌ Error: --rollback requires backup manifest file${NC}"
                exit 1
            fi
            ;;
        *)
            if [ -z "$OLD_REF" ]; then
                OLD_REF="$1"
            elif [ -z "$NEW_REF" ]; then
                NEW_REF="$1"
            else
                echo -e "${RED}❌ Unknown argument: $1${NC}"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Run update
check_dependencies
main

echo ""
echo -e "${GREEN}🎉 Cross-reference update process completed!${NC}"