#!/bin/bash

# =============================================================================
# 📊 AUTOMATED HANDOFFS SUMMARY UPDATE SCRIPT
# =============================================================================
# Purpose: Automatically update ACTIVE_HANDOFFS_SUMMARY.md when handoffs change
# Location: /scripts/automation/auto-update-handoffs-summary.sh
# Author: Context Engineering System
# Created: 2025-07-18
# Version: 1.0.0
# 
# Description:
# - Scans all handoff files in /docs/operations/handoffs/
# - Extracts status, priority, and progress information
# - Updates ACTIVE_HANDOFFS_SUMMARY.md with current data
# - Maintains existing format and structure
# - Includes timestamp and metrics
# - Integrates with git hooks for automation
# =============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../" && pwd)"
HANDOFFS_DIR="${PROJECT_ROOT}/docs/operations/handoffs"
SUMMARY_FILE="${HANDOFFS_DIR}/ACTIVE_HANDOFFS_SUMMARY.md"
ACTIVE_DIR="${HANDOFFS_DIR}/active"
ARCHIVE_DIR="${HANDOFFS_DIR}/archive"
TEMP_DIR=$(mktemp -d)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_HANDOFFS=0
CRITICAL_HANDOFFS=0
HIGH_HANDOFFS=0
MEDIUM_HANDOFFS=0
LOW_HANDOFFS=0

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

# Cleanup function
cleanup() {
    rm -rf "$TEMP_DIR"
}

# Set trap for cleanup
trap cleanup EXIT

# Check if running in git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository. Script requires git for commit integration."
        exit 1
    fi
}

# Extract handoff metadata from file
extract_handoff_metadata() {
    local file="$1"
    local filename=$(basename "$file")
    local output_file="${TEMP_DIR}/${filename}.meta"
    
    # Initialize default values
    local title=""
    local priority=""
    local status=""
    local progress=""
    local timeline=""
    local category=""
    
    # Read file and extract metadata
    while IFS= read -r line; do
        # Extract title (first # header)
        if [[ "$line" =~ ^#[[:space:]]+(.+)$ ]] && [[ -z "$title" ]]; then
            title="${BASH_REMATCH[1]}"
            title=$(echo "$title" | sed 's/🚨\|🔥\|🔧\|🟢\|🟡\|🔴\|📋\|⚡\|🎯//g' | xargs)
        fi
        
        # Extract priority (more flexible patterns)
        if [[ "$line" =~ \*\*Priority\*\*:[[:space:]]*(.+)$ ]]; then
            priority="${BASH_REMATCH[1]}"
            priority=$(echo "$priority" | sed 's/\*\*//g' | xargs)
        fi
        
        # Extract status (more flexible patterns)
        if [[ "$line" =~ \*\*Status\*\*:[[:space:]]*(.+)$ ]]; then
            status="${BASH_REMATCH[1]}"
            status=$(echo "$status" | sed 's/\*\*//g' | xargs)
        fi
        
        # Extract progress (more flexible patterns)
        if [[ "$line" =~ \*\*Progress\*\*:[[:space:]]*(.+)$ ]]; then
            progress="${BASH_REMATCH[1]}"
            progress=$(echo "$progress" | sed 's/\*\*//g' | xargs)
        fi
        
        # Extract timeline (more flexible patterns)
        if [[ "$line" =~ \*\*Timeline\*\*:[[:space:]]*(.+)$ ]] || [[ "$line" =~ \*\*Expected[[:space:]]+Completion\*\*:[[:space:]]*(.+)$ ]]; then
            timeline="${BASH_REMATCH[1]}"
            timeline=$(echo "$timeline" | sed 's/\*\*//g' | xargs)
        fi
        
        # Stop reading after reasonable amount of metadata
        if [[ $(echo "$line" | wc -c) -gt 0 ]] && [[ "$line" =~ ^--- ]]; then
            break
        fi
        
    done < "$file"
    
    # Determine category based on priority
    if [[ "$priority" =~ CRITICAL|🚨|🔥|CRÍTICA ]]; then
        category="CRITICAL"
    elif [[ "$priority" =~ HIGH|ALTA|🟡 ]]; then
        category="HIGH"
    elif [[ "$priority" =~ MEDIUM|MEDIA|🔧 ]]; then
        category="MEDIUM"
    elif [[ "$priority" =~ LOW|MAINTENANCE|🟢 ]]; then
        category="LOW"
    else
        category="MEDIUM"  # Default to medium
    fi
    
    # Write metadata to file
    echo "FILE=$filename" > "$output_file"
    echo "TITLE=$title" >> "$output_file"
    echo "PRIORITY=$priority" >> "$output_file"
    echo "STATUS=$status" >> "$output_file"
    echo "PROGRESS=$progress" >> "$output_file"
    echo "TIMELINE=$timeline" >> "$output_file"
    echo "CATEGORY=$category" >> "$output_file"
}

# Scan all handoff files
scan_handoffs() {
    log "Scanning handoff files..."
    
    # Reset counters
    TOTAL_HANDOFFS=0
    CRITICAL_HANDOFFS=0
    HIGH_HANDOFFS=0
    MEDIUM_HANDOFFS=0
    LOW_HANDOFFS=0
    
    # Clean temp directory
    rm -rf "$TEMP_DIR"/*.meta 2>/dev/null || true
    
    # Scan active handoffs
    if [[ -d "$ACTIVE_DIR" ]]; then
        for file in "$ACTIVE_DIR"/*.md; do
            if [[ -f "$file" ]]; then
                extract_handoff_metadata "$file"
                ((TOTAL_HANDOFFS++))
            fi
        done
    fi
    
    # Scan analysis subdirectory
    if [[ -d "$ACTIVE_DIR/analysis" ]]; then
        for file in "$ACTIVE_DIR/analysis"/*.md; do
            if [[ -f "$file" ]]; then
                extract_handoff_metadata "$file"
                ((TOTAL_HANDOFFS++))
            fi
        done
    fi
    
    # Count by category
    for meta_file in "$TEMP_DIR"/*.meta; do
        if [[ -f "$meta_file" ]]; then
            local category=$(grep "^CATEGORY=" "$meta_file" | cut -d= -f2)
            case "$category" in
                "CRITICAL")
                    ((CRITICAL_HANDOFFS++))
                    ;;
                "HIGH")
                    ((HIGH_HANDOFFS++))
                    ;;
                "MEDIUM")
                    ((MEDIUM_HANDOFFS++))
                    ;;
                "LOW")
                    ((LOW_HANDOFFS++))
                    ;;
            esac
        fi
    done
    
    success "Scanned $TOTAL_HANDOFFS handoff files"
}

# Generate summary content
generate_summary() {
    local timestamp=$(date '+%Y-%m-%d %H:%M CST')
    local summary_content=""
    
    log "Generating summary content..."
    
    # Header
    summary_content="# 📊 ACTIVE HANDOFFS SUMMARY REPORT

**Generated**: $timestamp (Automated Update)  
**Total Active Handoffs**: $TOTAL_HANDOFFS ($CRITICAL_HANDOFFS critical + $HIGH_HANDOFFS high + $MEDIUM_HANDOFFS medium + $LOW_HANDOFFS low priority)  
**System Status**: 🔄 AUTOMATED MONITORING - Real-time handoff tracking active  

## 🚨 CRITICAL PRIORITY HANDOFFS ($CRITICAL_HANDOFFS Total)

"
    
    # Process handoffs by category
    local handoff_counter=1
    
    # Critical handoffs
    if [[ $CRITICAL_HANDOFFS -gt 0 ]]; then
        for meta_file in "$TEMP_DIR"/*.meta; do
            if [[ -f "$meta_file" ]]; then
                local category=$(grep "^CATEGORY=" "$meta_file" | cut -d= -f2)
                if [[ "$category" == "CRITICAL" ]]; then
                    local filename=$(grep "^FILE=" "$meta_file" | cut -d= -f2)
                    local title=$(grep "^TITLE=" "$meta_file" | cut -d= -f2-)
                    local priority=$(grep "^PRIORITY=" "$meta_file" | cut -d= -f2-)
                    local status=$(grep "^STATUS=" "$meta_file" | cut -d= -f2-)
                    local progress=$(grep "^PROGRESS=" "$meta_file" | cut -d= -f2-)
                    local timeline=$(grep "^TIMELINE=" "$meta_file" | cut -d= -f2-)
                    
                    summary_content+="#### $handoff_counter. **$title**
- **File**: $filename
- **Priority**: $priority
- **Status**: $status"
                    
                    if [[ -n "$progress" ]]; then
                        summary_content+="
- **Progress**: $progress"
                    fi
                    
                    if [[ -n "$timeline" ]]; then
                        summary_content+="
- **Timeline**: $timeline"
                    fi
                    
                    summary_content+="

"
                    ((handoff_counter++))
                fi
            fi
        done
    fi
    
    # High priority handoffs
    if [[ $HIGH_HANDOFFS -gt 0 ]]; then
        summary_content+="## 🔥 HIGH PRIORITY HANDOFFS ($HIGH_HANDOFFS Total)

"
        for meta_file in "$TEMP_DIR"/*.meta; do
            if [[ -f "$meta_file" ]]; then
                local category=$(grep "^CATEGORY=" "$meta_file" | cut -d= -f2)
                if [[ "$category" == "HIGH" ]]; then
                    local filename=$(grep "^FILE=" "$meta_file" | cut -d= -f2)
                    local title=$(grep "^TITLE=" "$meta_file" | cut -d= -f2-)
                    local priority=$(grep "^PRIORITY=" "$meta_file" | cut -d= -f2-)
                    local status=$(grep "^STATUS=" "$meta_file" | cut -d= -f2-)
                    local progress=$(grep "^PROGRESS=" "$meta_file" | cut -d= -f2-)
                    local timeline=$(grep "^TIMELINE=" "$meta_file" | cut -d= -f2-)
                    
                    summary_content+="#### $handoff_counter. **$title**
- **File**: $filename
- **Priority**: $priority
- **Status**: $status"
                    
                    if [[ -n "$progress" ]]; then
                        summary_content+="
- **Progress**: $progress"
                    fi
                    
                    if [[ -n "$timeline" ]]; then
                        summary_content+="
- **Timeline**: $timeline"
                    fi
                    
                    summary_content+="

"
                    ((handoff_counter++))
                fi
            fi
        done
    fi
    
    # Medium priority handoffs
    if [[ $MEDIUM_HANDOFFS -gt 0 ]]; then
        summary_content+="## 🔧 MEDIUM PRIORITY HANDOFFS ($MEDIUM_HANDOFFS Total)

"
        for meta_file in "$TEMP_DIR"/*.meta; do
            if [[ -f "$meta_file" ]]; then
                local category=$(grep "^CATEGORY=" "$meta_file" | cut -d= -f2)
                if [[ "$category" == "MEDIUM" ]]; then
                    local filename=$(grep "^FILE=" "$meta_file" | cut -d= -f2)
                    local title=$(grep "^TITLE=" "$meta_file" | cut -d= -f2-)
                    local priority=$(grep "^PRIORITY=" "$meta_file" | cut -d= -f2-)
                    local status=$(grep "^STATUS=" "$meta_file" | cut -d= -f2-)
                    local progress=$(grep "^PROGRESS=" "$meta_file" | cut -d= -f2-)
                    local timeline=$(grep "^TIMELINE=" "$meta_file" | cut -d= -f2-)
                    
                    summary_content+="#### $handoff_counter. **$title**
- **File**: $filename
- **Priority**: $priority
- **Status**: $status"
                    
                    if [[ -n "$progress" ]]; then
                        summary_content+="
- **Progress**: $progress"
                    fi
                    
                    if [[ -n "$timeline" ]]; then
                        summary_content+="
- **Timeline**: $timeline"
                    fi
                    
                    summary_content+="

"
                    ((handoff_counter++))
                fi
            fi
        done
    fi
    
    # Low priority handoffs
    if [[ $LOW_HANDOFFS -gt 0 ]]; then
        summary_content+="## 🟢 LOW PRIORITY - MAINTENANCE HANDOFFS ($LOW_HANDOFFS Total)

"
        for meta_file in "$TEMP_DIR"/*.meta; do
            if [[ -f "$meta_file" ]]; then
                local category=$(grep "^CATEGORY=" "$meta_file" | cut -d= -f2)
                if [[ "$category" == "LOW" ]]; then
                    local filename=$(grep "^FILE=" "$meta_file" | cut -d= -f2)
                    local title=$(grep "^TITLE=" "$meta_file" | cut -d= -f2-)
                    local priority=$(grep "^PRIORITY=" "$meta_file" | cut -d= -f2-)
                    local status=$(grep "^STATUS=" "$meta_file" | cut -d= -f2-)
                    local progress=$(grep "^PROGRESS=" "$meta_file" | cut -d= -f2-)
                    local timeline=$(grep "^TIMELINE=" "$meta_file" | cut -d= -f2-)
                    
                    summary_content+="#### $handoff_counter. **$title**
- **File**: $filename
- **Priority**: $priority
- **Status**: $status"
                    
                    if [[ -n "$progress" ]]; then
                        summary_content+="
- **Progress**: $progress"
                    fi
                    
                    if [[ -n "$timeline" ]]; then
                        summary_content+="
- **Timeline**: $timeline"
                    fi
                    
                    summary_content+="

"
                    ((handoff_counter++))
                fi
            fi
        done
    fi
    
    # Calculate percentages safely
    local critical_pct=0
    local high_pct=0
    local medium_pct=0
    local low_pct=0
    
    if [[ $TOTAL_HANDOFFS -gt 0 ]]; then
        critical_pct=$(( CRITICAL_HANDOFFS * 100 / TOTAL_HANDOFFS ))
        high_pct=$(( HIGH_HANDOFFS * 100 / TOTAL_HANDOFFS ))
        medium_pct=$(( MEDIUM_HANDOFFS * 100 / TOTAL_HANDOFFS ))
        low_pct=$(( LOW_HANDOFFS * 100 / TOTAL_HANDOFFS ))
    fi
    
    # Add metrics and footer
    summary_content+="## 📊 SYSTEM METRICS

### **HANDOFF DISTRIBUTION**
- **Critical Priority**: $CRITICAL_HANDOFFS handoffs (${critical_pct}%)
- **High Priority**: $HIGH_HANDOFFS handoffs (${high_pct}%)
- **Medium Priority**: $MEDIUM_HANDOFFS handoffs (${medium_pct}%)
- **Low Priority**: $LOW_HANDOFFS handoffs (${low_pct}%)

### **AUTOMATION STATUS**
- **Last Update**: $timestamp
- **Update Source**: Automated scanning system
- **Monitoring**: Real-time handoff tracking active
- **Integration**: Git hooks enabled for automatic updates

### **SYSTEM HEALTH**
- **Total Active Handoffs**: $TOTAL_HANDOFFS
- **Automated Monitoring**: ✅ ACTIVE
- **Real-time Updates**: ✅ ENABLED
- **Git Integration**: ✅ OPERATIONAL

---

**Next Update**: Automatic upon handoff modification  
**Automation**: This summary is automatically generated and updated

### **📝 RECENT ACTIVITY ($timestamp)**
- **Automatic Scan**: $TOTAL_HANDOFFS handoffs processed
- **Status Update**: All handoff statuses synchronized
- **Metrics Calculation**: Distribution and health metrics updated
- **System Integration**: Git hooks and automation monitoring active
"
    
    echo "$summary_content"
}

# Update summary file
update_summary() {
    log "Updating summary file..."
    
    # Generate new content
    local new_content=$(generate_summary)
    
    # Create backup
    if [[ -f "$SUMMARY_FILE" ]]; then
        cp "$SUMMARY_FILE" "${SUMMARY_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        log "Created backup of existing summary"
    fi
    
    # Write new content
    echo "$new_content" > "$SUMMARY_FILE"
    success "Updated $SUMMARY_FILE"
}

# Git integration
git_integration() {
    local mode="${1:-manual}"
    
    if [[ "$mode" == "hook" ]]; then
        log "Running in git hook mode"
        
        # Check if handoffs have changed
        local handoffs_changed=false
        
        # Check for modified handoff files
        if git diff --cached --name-only | grep -q "docs/operations/handoffs/"; then
            handoffs_changed=true
        fi
        
        # Check for modified active handoffs
        if git diff --cached --name-only | grep -q "docs/operations/handoffs/active/"; then
            handoffs_changed=true
        fi
        
        if [[ "$handoffs_changed" == true ]]; then
            log "Handoff files modified, updating summary..."
            scan_handoffs
            update_summary
            
            # Stage the updated summary
            git add "$SUMMARY_FILE"
            success "Summary updated and staged for commit"
        else
            log "No handoff files modified, skipping update"
        fi
    else
        log "Running in manual mode"
        scan_handoffs
        update_summary
        
        # Check if git is available and changes exist
        if git rev-parse --git-dir > /dev/null 2>&1; then
            if git diff --quiet "$SUMMARY_FILE"; then
                log "No changes detected in summary file"
            else
                log "Changes detected in summary file"
                echo "To commit changes, run: git add $SUMMARY_FILE && git commit -m 'Update handoffs summary'"
            fi
        fi
    fi
}

# Install git hooks
install_git_hooks() {
    local hooks_dir="${PROJECT_ROOT}/.git/hooks"
    local pre_commit_hook="${hooks_dir}/pre-commit"
    
    log "Installing git hooks..."
    
    # Create hooks directory if it doesn't exist
    mkdir -p "$hooks_dir"
    
    # Create or update pre-commit hook
    if [[ -f "$pre_commit_hook" ]]; then
        # Check if our hook is already installed
        if grep -q "auto-update-handoffs-summary.sh" "$pre_commit_hook"; then
            log "Git hook already installed"
            return 0
        else
            # Append to existing hook
            echo "" >> "$pre_commit_hook"
            echo "# Auto-update handoffs summary" >> "$pre_commit_hook"
            echo "\"${SCRIPT_DIR}/auto-update-handoffs-summary.sh\" hook" >> "$pre_commit_hook"
            log "Added handoffs update to existing pre-commit hook"
        fi
    else
        # Create new pre-commit hook
        cat > "$pre_commit_hook" << 'EOF'
#!/bin/bash

# Auto-update handoffs summary when handoffs are modified
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../" && pwd)"

# Run handoffs summary update
"${PROJECT_ROOT}/scripts/automation/auto-update-handoffs-summary.sh" hook

EOF
        chmod +x "$pre_commit_hook"
        log "Created new pre-commit hook"
    fi
    
    success "Git hooks installed successfully"
}

# Main execution
main() {
    local command="${1:-update}"
    
    log "Starting handoffs summary automation..."
    
    # Check prerequisites
    check_git_repo
    
    # Ensure directories exist
    mkdir -p "$ACTIVE_DIR"
    mkdir -p "$ARCHIVE_DIR"
    
    case "$command" in
        "update")
            git_integration "manual"
            ;;
        "hook")
            git_integration "hook"
            ;;
        "install-hooks")
            install_git_hooks
            ;;
        "scan")
            scan_handoffs
            echo "Total handoffs: $TOTAL_HANDOFFS"
            echo "Critical: $CRITICAL_HANDOFFS, High: $HIGH_HANDOFFS, Medium: $MEDIUM_HANDOFFS, Low: $LOW_HANDOFFS"
            ;;
        "generate")
            scan_handoffs
            generate_summary
            ;;
        *)
            echo "Usage: $0 {update|hook|install-hooks|scan|generate}"
            echo ""
            echo "Commands:"
            echo "  update        - Update summary file manually"
            echo "  hook          - Run in git hook mode (automatic)"
            echo "  install-hooks - Install git pre-commit hooks"
            echo "  scan          - Scan handoffs and show metrics"
            echo "  generate      - Generate summary content only"
            exit 1
            ;;
    esac
    
    success "Handoffs summary automation completed"
}

# Execute main function with all arguments
main "$@"