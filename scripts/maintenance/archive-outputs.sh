#!/bin/bash

# Archive Outputs Maintenance Script
# Purpose: Automated archival of old analysis and script results to maintain clean working environment
# Integration: Context Engineering project organization (respects project autonomy)

set -euo pipefail

# Configuration
PROJECT_ROOT="/Users/nalve/claude-context-engineering"
OUTPUTS_DIR="$PROJECT_ROOT/docs/operations/outputs"
SCRIPTS_RESULTS_DIR="$PROJECT_ROOT/scripts/results"
ARCHIVE_DAYS=30
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create archive directories if they don't exist
create_archive_structure() {
    log "Creating archive directory structure..."
    
    # Create outputs archive
    mkdir -p "$OUTPUTS_DIR/archive/$CURRENT_YEAR"
    
    # Create scripts results archive
    mkdir -p "$SCRIPTS_RESULTS_DIR/archive/$CURRENT_YEAR/$CURRENT_MONTH"/{compliance,content-analysis,context-optimization,formulas,lifecycle,metrics,nomenclature,p55-compliance,system-integrity,tdd,triggers,validation}
    
    success "Archive structure created"
}

# Archive old outputs/analysis files
archive_analysis_files() {
    log "Checking docs/operations/outputs/analysis for files older than $ARCHIVE_DAYS days..."
    
    if [ ! -d "$OUTPUTS_DIR/analysis" ]; then
        warning "docs/operations/outputs/analysis directory not found, skipping..."
        return
    fi
    
    # Find and move files older than ARCHIVE_DAYS
    local files_moved=0
    find "$OUTPUTS_DIR/analysis" -name "*.md" -type f -mtime +$ARCHIVE_DAYS -print0 | while IFS= read -r -d '' file; do
        local filename=$(basename "$file")
        local target_dir="$OUTPUTS_DIR/archive/$CURRENT_YEAR"
        
        mkdir -p "$target_dir"
        mv "$file" "$target_dir/"
        log "Moved: $filename → archive/$CURRENT_YEAR/"
        ((files_moved++))
    done
    
    if [ $files_moved -eq 0 ]; then
        log "No analysis files older than $ARCHIVE_DAYS days found"
    else
        success "Archived $files_moved analysis files"
    fi
}

# Archive old script results by category
archive_script_results() {
    log "Archiving script results by category..."
    
    if [ ! -d "$SCRIPTS_RESULTS_DIR" ]; then
        warning "scripts/results directory not found, skipping..."
        return
    fi
    
    local total_files_moved=0
    
    # Archive by date pattern (files with YYYYMMDD or YYYY-MM-DD patterns)
    local date_patterns=("*20[0-9][0-9][0-1][0-9][0-3][0-9]*" "*20[0-9][0-9]-[0-1][0-9]-[0-3][0-9]*")
    
    for pattern in "${date_patterns[@]}"; do
        # Find files matching date pattern that are older than 7 days
        find "$SCRIPTS_RESULTS_DIR" -name "$pattern" -type f -mtime +7 | while read -r file; do
            if [ -f "$file" ]; then
                local filename=$(basename "$file")
                local dir_name=$(dirname "$file")
                local category=$(basename "$dir_name")
                
                # Determine target category
                local target_category="validation"
                case "$category" in
                    "compliance"|"p55-compliance") target_category="compliance" ;;
                    "content-analysis") target_category="content-analysis" ;;
                    "context-optimization") target_category="context-optimization" ;;
                    "formulas") target_category="formulas" ;;
                    "lifecycle") target_category="lifecycle" ;;
                    "metrics") target_category="metrics" ;;
                    "nomenclature") target_category="nomenclature" ;;
                    "system-integrity") target_category="system-integrity" ;;
                    "tdd") target_category="tdd" ;;
                    "triggers") target_category="triggers" ;;
                    "validation") target_category="validation" ;;
                esac
                
                local target_dir="$SCRIPTS_RESULTS_DIR/archive/$CURRENT_YEAR/$CURRENT_MONTH/$target_category"
                mkdir -p "$target_dir"
                
                mv "$file" "$target_dir/"
                log "Moved: $filename → archive/$CURRENT_YEAR/$CURRENT_MONTH/$target_category/"
                ((total_files_moved++))
            fi
        done
    done
    
    if [ $total_files_moved -eq 0 ]; then
        log "No old script result files found for archival"
    else
        success "Archived $total_files_moved script result files"
    fi
}

# Clean up empty directories
cleanup_empty_directories() {
    log "Cleaning up empty directories..."
    
    # Remove empty subdirectories in outputs
    find "$OUTPUTS_DIR" -type d -empty -not -path "*/archive/*" -delete 2>/dev/null || true
    
    # Remove empty subdirectories in scripts/results (except archive)
    find "$SCRIPTS_RESULTS_DIR" -type d -empty -not -path "*/archive/*" -delete 2>/dev/null || true
    
    success "Empty directories cleaned up"
}

# Generate archive report
generate_archive_report() {
    log "Generating archive report..."
    
    local report_file="$SCRIPTS_RESULTS_DIR/archive/archive-report-$CURRENT_DATE.md"
    
    cat > "$report_file" << EOF
# Archive Report - $CURRENT_DATE

**Archive Operation**: Automated maintenance run for Context Engineering project

## Archive Summary

### **Outputs Archive**
- **Location**: \`docs/operations/outputs/archive/$CURRENT_YEAR/\`
- **Files Archived**: Analysis files older than $ARCHIVE_DAYS days
- **Archive Date**: $CURRENT_DATE

### **Scripts Results Archive**
- **Location**: \`scripts/results/archive/$CURRENT_YEAR/$CURRENT_MONTH/\`
- **Files Archived**: Result files older than 7 days with date patterns
- **Categories**: compliance, content-analysis, context-optimization, formulas, lifecycle, metrics, nomenclature, p55-compliance, system-integrity, tdd, triggers, validation

## Archive Structure

\`\`\`
docs/operations/outputs/archive/$CURRENT_YEAR/           ← Analysis files
scripts/results/archive/
└── $CURRENT_YEAR/$CURRENT_MONTH/        ← Script results by category
    ├── compliance/
    ├── content-analysis/
    ├── context-optimization/
    ├── formulas/
    ├── lifecycle/
    ├── metrics/
    ├── nomenclature/
    ├── p55-compliance/
    ├── system-integrity/
    ├── tdd/
    ├── triggers/
    └── validation/
\`\`\`

## Project Autonomy Compliance

✅ **Project Scope**: Archive operations applied ONLY to main Context Engineering project  
✅ **Autonomous Projects**: \`/projects/\` directories remain untouched  
✅ **Boundary Respect**: No interference with individual project output strategies

## Archive Benefits

- **Working Environment**: Reduced clutter in active directories
- **Historical Preservation**: Complete audit trail maintained
- **Performance**: Improved directory navigation and script execution
- **Organization**: Systematic categorization and date-based organization

---

**Generated**: $CURRENT_DATE | **Script**: archive-outputs.sh | **Project**: Context Engineering
EOF

    success "Archive report generated: $report_file"
}

# Main execution
main() {
    log "Starting automated archive maintenance for Context Engineering project..."
    log "Respecting project autonomy - no changes to /projects/ directories"
    
    create_archive_structure
    archive_analysis_files
    archive_script_results
    cleanup_empty_directories
    generate_archive_report
    
    success "Archive maintenance completed successfully!"
    log "Working directories cleaned, historical data preserved"
}

# Execute main function
main "$@"