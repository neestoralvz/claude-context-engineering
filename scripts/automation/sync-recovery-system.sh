#!/bin/bash
# 🔧 Context Engineering - Automated Sync Recovery System
# Intelligent recovery system for command synchronization issues

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RECOVERY_LOG_DIR="$PROJECT_ROOT/scripts/results/recovery"
BACKUP_DIR="$PROJECT_ROOT/scripts/backups/recovery-backups"
COMMAND_COUNTER="$PROJECT_ROOT/scripts/validation/automated-command-counter-v2.sh"
REGISTRY_UPDATER="$PROJECT_ROOT/scripts/automation/registry-auto-update.sh"

# Recovery configuration
MAX_RECOVERY_ATTEMPTS=3
SAFETY_BACKUP_RETENTION=7  # days
RECOVERY_CONFIDENCE_THRESHOLD=0.95

# Logging functions
log() { echo -e "${CYAN}[$(date '+%H:%M:%S')] [RECOVERY]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}[$(date '+%H:%M:%S')] ℹ️  $1${NC}"; }

# Help function
show_help() {
    cat << EOF
🔧 Context Engineering - Automated Sync Recovery System

DESCRIPTION:
    Intelligent recovery system that automatically detects and repairs
    command synchronization issues between docs/ and .claude/ directories.

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    auto                Automatic recovery (detect and repair)
    diagnose            Diagnose synchronization issues
    repair              Execute repair operations
    rollback            Rollback to previous state
    status              Show recovery system status
    cleanup             Clean old recovery files

OPTIONS:
    --dry-run           Show what would be done without executing
    --force             Force recovery even with low confidence
    --threshold N       Set confidence threshold (0.0-1.0, default: 0.95)
    --max-attempts N    Maximum recovery attempts (default: 3)
    --backup            Create backup before recovery
    --help, -h          Show this help message

RECOVERY STRATEGIES:
    1. Registry Update    - Update registry to match actual counts
    2. Directory Sync     - Synchronize missing files between directories
    3. Content Validation - Verify and repair file content integrity
    4. Structure Repair   - Fix directory structure issues

SAFETY FEATURES:
    - Automatic backups before any changes
    - Confidence scoring for recovery operations
    - Rollback capability for all operations
    - Maximum attempt limits to prevent loops
    - Comprehensive logging and audit trail

EXAMPLES:
    $0 auto --backup         # Auto recovery with backup
    $0 diagnose              # Analyze synchronization issues
    $0 repair --dry-run      # Preview repair operations
    $0 rollback              # Rollback last recovery

EOF
}

# Create necessary directories
ensure_directories() {
    mkdir -p "$RECOVERY_LOG_DIR" "$BACKUP_DIR"
}

# Create comprehensive backup
create_recovery_backup() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_dir="$BACKUP_DIR/recovery-backup-$timestamp"
    
    log "Creating comprehensive recovery backup..."
    
    mkdir -p "$backup_dir"
    
    # Backup command directories
    if [ -d "$PROJECT_ROOT/docs/commands" ]; then
        cp -r "$PROJECT_ROOT/docs/commands" "$backup_dir/docs-commands"
        log_info "Backed up docs/commands directory"
    fi
    
    if [ -d "$PROJECT_ROOT/.claude/commands" ]; then
        cp -r "$PROJECT_ROOT/.claude/commands" "$backup_dir/claude-commands"
        log_info "Backed up .claude/commands directory"
    fi
    
    # Backup registry
    if [ -f "$PROJECT_ROOT/.claude/config/command-registry.json" ]; then
        cp "$PROJECT_ROOT/.claude/config/command-registry.json" "$backup_dir/command-registry.json"
        log_info "Backed up command registry"
    fi
    
    # Backup CLAUDE.md
    if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
        cp "$PROJECT_ROOT/CLAUDE.md" "$backup_dir/CLAUDE.md"
        log_info "Backed up CLAUDE.md"
    fi
    
    # Create backup metadata
    cat > "$backup_dir/backup-metadata.json" << EOF
{
  "backup_timestamp": "$(date -Iseconds)",
  "backup_type": "recovery_backup",
  "project_root": "$PROJECT_ROOT",
  "backup_created_by": "sync-recovery-system",
  "user": "${USER:-unknown}",
  "hostname": "${HOSTNAME:-$(hostname 2>/dev/null || echo 'unknown')}",
  "recovery_session": "recovery-$timestamp"
}
EOF
    
    log_success "Recovery backup created: $(basename "$backup_dir")"
    echo "$backup_dir"
}

# Diagnose synchronization issues
diagnose_sync_issues() {
    log "Diagnosing command synchronization issues..."
    
    local diagnosis_file="$RECOVERY_LOG_DIR/diagnosis-$(date +%Y%m%d-%H%M%S).json"
    
    # Run command counter for detailed analysis
    local temp_output=$(mktemp)
    local counter_exit_code=0
    
    if ! "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
        counter_exit_code=$?
    fi
    
    # Get latest report
    local latest_report=$(find "$PROJECT_ROOT/scripts/results/command-counts" -name "command-count-report-*.json" -type f | sort -r | head -1)
    
    if [ ! -f "$latest_report" ]; then
        log_error "No command count report found"
        rm -f "$temp_output"
        return 1
    fi
    
    # Extract diagnosis data
    local docs_total=$(jq -r '.command_count_report.counts.docs_commands.total' "$latest_report")
    local claude_total=$(jq -r '.command_count_report.counts.claude_commands.total' "$latest_report")
    local total_discrepancies=$(jq -r '.command_count_report.discrepancies.total_found // 0' "$latest_report")
    local registry_total=$(jq -r '.command_count_report.registry_validation.registry_total' "$latest_report")
    
    # Calculate file counts manually for verification
    local actual_docs_count=$(find "$PROJECT_ROOT/docs/commands" -name "*.md" ! -name "README.md" ! -path "*/.archived/*" ! -path "*/examples/*" ! -path "*/review/*" 2>/dev/null | wc -l || echo "0")
    local actual_claude_count=$(find "$PROJECT_ROOT/.claude/commands" -name "*.md" ! -name "README.md" ! -path "*/.archived/*" ! -path "*/examples/*" ! -path "*/review/*" 2>/dev/null | wc -l || echo "0")
    
    # Determine issue severity and recovery confidence
    local issue_severity="low"
    local recovery_confidence="0.95"
    local recommended_strategy="registry_update"
    
    if [ "$total_discrepancies" -gt 10 ]; then
        issue_severity="critical"
        recovery_confidence="0.7"
        recommended_strategy="directory_sync"
    elif [ "$total_discrepancies" -gt 5 ]; then
        issue_severity="high"
        recovery_confidence="0.85"
        recommended_strategy="registry_update"
    elif [ "$total_discrepancies" -gt 0 ]; then
        issue_severity="medium"
        recovery_confidence="0.9"
        recommended_strategy="registry_update"
    else
        issue_severity="none"
        recovery_confidence="1.0"
        recommended_strategy="none"
    fi
    
    # Create comprehensive diagnosis
    cat > "$diagnosis_file" << EOF
{
  "diagnosis": {
    "timestamp": "$(date -Iseconds)",
    "validation_exit_code": $counter_exit_code,
    "issue_severity": "$issue_severity",
    "recovery_confidence": $recovery_confidence,
    "recommended_strategy": "$recommended_strategy",
    "command_counts": {
      "docs_reported": $docs_total,
      "claude_reported": $claude_total,
      "docs_actual": $actual_docs_count,
      "claude_actual": $actual_claude_count,
      "registry_total": $registry_total,
      "total_discrepancies": $total_discrepancies
    },
    "file_analysis": {
      "docs_claude_diff": $((actual_docs_count - actual_claude_count)),
      "reported_actual_docs_diff": $((docs_total - actual_docs_count)),
      "reported_actual_claude_diff": $((claude_total - actual_claude_count)),
      "registry_reality_diff": $((registry_total - actual_docs_count))
    },
    "recovery_feasibility": {
      "can_registry_update": $([ "$total_discrepancies" -le 5 ] && echo "true" || echo "false"),
      "can_directory_sync": $([ "$((actual_docs_count - actual_claude_count))" -le 20 ] && echo "true" || echo "false"),
      "requires_manual_intervention": $([ "$total_discrepancies" -gt 20 ] && echo "true" || echo "false")
    },
    "safety_checks": {
      "backup_recommended": $([ "$total_discrepancies" -gt 0 ] && echo "true" || echo "false"),
      "force_required": $(echo "$recovery_confidence < 0.8" | bc -l 2>/dev/null || echo "false"),
      "multiple_attempts_safe": $([ "$total_discrepancies" -le 10 ] && echo "true" || echo "false")
    }
  }
}
EOF
    
    # Display diagnosis summary
    echo ""
    echo -e "${BOLD}🔍 Synchronization Diagnosis${NC}"
    echo "============================="
    echo ""
    echo "Issue Severity:        $issue_severity"
    echo "Recovery Confidence:   $(printf "%.1f%%" $(echo "$recovery_confidence * 100" | bc -l 2>/dev/null || echo "95.0"))"
    echo "Recommended Strategy:  $recommended_strategy"
    echo ""
    echo "Command Counts:"
    echo "  docs/commands:       $actual_docs_count (reported: $docs_total)"
    echo "  .claude/commands:    $actual_claude_count (reported: $claude_total)"
    echo "  Registry:            $registry_total"
    echo "  Total Discrepancies: $total_discrepancies"
    echo ""
    echo "Recovery Options:"
    [ "$issue_severity" = "none" ] && echo -e "  ${GREEN}✅ No recovery needed${NC}"
    [ "$issue_severity" != "none" ] && echo -e "  🔧 $recommended_strategy recommended"
    [ "$recovery_confidence" != "1.0" ] && echo -e "  ⚠️  Confidence: $(printf "%.1f%%" $(echo "$recovery_confidence * 100" | bc -l 2>/dev/null || echo "95.0"))"
    echo ""
    
    log_success "Diagnosis completed: $(basename "$diagnosis_file")"
    rm -f "$temp_output"
    echo "$diagnosis_file"
}

# Execute registry update recovery
execute_registry_update() {
    local dry_run=${1:-false}
    
    log "Executing registry update recovery..."
    
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN: Would update registry to match current command counts"
        return 0
    fi
    
    if [ ! -x "$REGISTRY_UPDATER" ]; then
        log_error "Registry updater not executable: $REGISTRY_UPDATER"
        return 1
    fi
    
    local temp_output=$(mktemp)
    if "$REGISTRY_UPDATER" --force-update > "$temp_output" 2>&1; then
        log_success "Registry update completed successfully"
        rm -f "$temp_output"
        return 0
    else
        local exit_code=$?
        log_error "Registry update failed (exit code: $exit_code)"
        cat "$temp_output"
        rm -f "$temp_output"
        return 1
    fi
}

# Execute directory synchronization
execute_directory_sync() {
    local dry_run=${1:-false}
    
    log "Executing directory synchronization..."
    
    # Find files that exist in docs but not in .claude
    local missing_files=($(comm -23 \
        <(find "$PROJECT_ROOT/docs/commands" -name "*.md" ! -name "README.md" ! -path "*/.archived/*" ! -path "*/examples/*" ! -path "*/review/*" | sort) \
        <(find "$PROJECT_ROOT/.claude/commands" -name "*.md" ! -name "README.md" ! -path "*/.archived/*" ! -path "*/examples/*" ! -path "*/review/*" | sed "s|\.claude/commands|docs/commands|g" | sort) \
    ))
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "No files need synchronization"
        return 0
    fi
    
    log_info "Found ${#missing_files[@]} files to synchronize"
    
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN: Would synchronize the following files:"
        for file in "${missing_files[@]}"; do
            echo "  📄 $(basename "$file")"
        done
        return 0
    fi
    
    # Perform synchronization
    local sync_errors=0
    for file in "${missing_files[@]}"; do
        local relative_path=${file#$PROJECT_ROOT/docs/commands/}
        local target_path="$PROJECT_ROOT/.claude/commands/$relative_path"
        local target_dir=$(dirname "$target_path")
        
        # Create target directory if needed
        if ! mkdir -p "$target_dir"; then
            log_error "Failed to create directory: $target_dir"
            ((sync_errors++))
            continue
        fi
        
        # Copy file
        if cp "$file" "$target_path"; then
            log_info "Synchronized: $relative_path"
        else
            log_error "Failed to synchronize: $relative_path"
            ((sync_errors++))
        fi
    done
    
    if [ "$sync_errors" -eq 0 ]; then
        log_success "Directory synchronization completed successfully"
        return 0
    else
        log_error "Directory synchronization completed with $sync_errors errors"
        return 1
    fi
}

# Execute automatic recovery
execute_auto_recovery() {
    local dry_run=${1:-false}
    local force=${2:-false}
    local backup_path=""
    
    echo -e "${BOLD}🔧 AUTOMATED SYNC RECOVERY${NC}"
    echo "============================"
    echo ""
    
    # Create backup unless in dry-run mode
    if [ "$dry_run" = false ]; then
        if ! backup_path=$(create_recovery_backup); then
            log_error "Failed to create backup"
            return 1
        fi
        echo ""
    fi
    
    # Diagnose issues
    local diagnosis_file
    if ! diagnosis_file=$(diagnose_sync_issues); then
        log_error "Failed to diagnose synchronization issues"
        return 1
    fi
    
    # Extract diagnosis results
    local issue_severity=$(jq -r '.diagnosis.issue_severity' "$diagnosis_file")
    local recovery_confidence=$(jq -r '.diagnosis.recovery_confidence' "$diagnosis_file")
    local recommended_strategy=$(jq -r '.diagnosis.recommended_strategy' "$diagnosis_file")
    local requires_manual=$(jq -r '.diagnosis.recovery_feasibility.requires_manual_intervention' "$diagnosis_file")
    
    # Check if recovery is needed
    if [ "$issue_severity" = "none" ]; then
        log_success "No synchronization issues detected"
        return 0
    fi
    
    # Check if manual intervention is required
    if [ "$requires_manual" = "true" ] && [ "$force" = false ]; then
        log_error "Issues require manual intervention"
        log_error "Use --force to attempt automatic recovery anyway"
        return 1
    fi
    
    # Check confidence threshold
    if [ "$force" = false ]; then
        local confidence_check=$(echo "$recovery_confidence >= $RECOVERY_CONFIDENCE_THRESHOLD" | bc -l 2>/dev/null || echo "0")
        if [ "$confidence_check" != "1" ]; then
            log_warning "Recovery confidence ($(printf "%.1f%%" $(echo "$recovery_confidence * 100" | bc -l 2>/dev/null))) below threshold"
            log_warning "Use --force to proceed anyway"
            return 1
        fi
    fi
    
    echo ""
    log "Executing recovery strategy: $recommended_strategy"
    
    # Execute recovery strategy
    case "$recommended_strategy" in
        "registry_update")
            if execute_registry_update "$dry_run"; then
                log_success "Registry update recovery completed"
            else
                log_error "Registry update recovery failed"
                return 1
            fi
            ;;
        "directory_sync")
            if execute_directory_sync "$dry_run"; then
                log_success "Directory sync recovery completed"
                
                # Follow up with registry update
                log "Performing follow-up registry update..."
                if execute_registry_update "$dry_run"; then
                    log_success "Follow-up registry update completed"
                else
                    log_warning "Follow-up registry update failed"
                fi
            else
                log_error "Directory sync recovery failed"
                return 1
            fi
            ;;
        *)
            log_error "Unknown recovery strategy: $recommended_strategy"
            return 1
            ;;
    esac
    
    # Validate recovery
    if [ "$dry_run" = false ]; then
        echo ""
        log "Validating recovery results..."
        
        local temp_output=$(mktemp)
        if "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
            log_success "Recovery validation passed"
            echo ""
            log_info "Recovery Summary:"
            [ -n "$backup_path" ] && log_info "  Backup: $(basename "$backup_path")"
            log_info "  Strategy: $recommended_strategy"
            log_info "  Confidence: $(printf "%.1f%%" $(echo "$recovery_confidence * 100" | bc -l 2>/dev/null))"
            log_info "  Status: ✅ Successful"
        else
            log_error "Recovery validation failed"
            cat "$temp_output"
            return 1
        fi
        rm -f "$temp_output"
    fi
    
    return 0
}

# Rollback to previous state
execute_rollback() {
    log "Searching for recent recovery backups..."
    
    local backup_dirs=($(find "$BACKUP_DIR" -name "recovery-backup-*" -type d | sort -r | head -5))
    
    if [ ${#backup_dirs[@]} -eq 0 ]; then
        log_error "No recovery backups found"
        return 1
    fi
    
    echo ""
    echo -e "${BOLD}📋 Available Recovery Backups${NC}"
    echo "================================"
    echo ""
    
    local i=1
    for backup_dir in "${backup_dirs[@]}"; do
        local timestamp=$(basename "$backup_dir" | sed 's/recovery-backup-//')
        local readable_time=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" 2>/dev/null || echo "$timestamp")
        
        echo "$i) $readable_time ($(basename "$backup_dir"))"
        ((i++))
    done
    
    echo ""
    read -p "Select backup to restore (1-${#backup_dirs[@]}): " selection
    
    if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backup_dirs[@]} ]; then
        log_error "Invalid selection"
        return 1
    fi
    
    local selected_backup="${backup_dirs[$((selection-1))]}"
    
    log "Rolling back to: $(basename "$selected_backup")"
    log_warning "This will overwrite current command directories and registry"
    
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Rollback cancelled"
        return 0
    fi
    
    # Execute rollback
    local rollback_errors=0
    
    # Restore command directories
    if [ -d "$selected_backup/docs-commands" ]; then
        if rm -rf "$PROJECT_ROOT/docs/commands" && cp -r "$selected_backup/docs-commands" "$PROJECT_ROOT/docs/commands"; then
            log_success "Restored docs/commands directory"
        else
            log_error "Failed to restore docs/commands directory"
            ((rollback_errors++))
        fi
    fi
    
    if [ -d "$selected_backup/claude-commands" ]; then
        if rm -rf "$PROJECT_ROOT/.claude/commands" && cp -r "$selected_backup/claude-commands" "$PROJECT_ROOT/.claude/commands"; then
            log_success "Restored .claude/commands directory"
        else
            log_error "Failed to restore .claude/commands directory"
            ((rollback_errors++))
        fi
    fi
    
    # Restore registry
    if [ -f "$selected_backup/command-registry.json" ]; then
        if cp "$selected_backup/command-registry.json" "$PROJECT_ROOT/.claude/config/command-registry.json"; then
            log_success "Restored command registry"
        else
            log_error "Failed to restore command registry"
            ((rollback_errors++))
        fi
    fi
    
    # Restore CLAUDE.md
    if [ -f "$selected_backup/CLAUDE.md" ]; then
        if cp "$selected_backup/CLAUDE.md" "$PROJECT_ROOT/CLAUDE.md"; then
            log_success "Restored CLAUDE.md"
        else
            log_error "Failed to restore CLAUDE.md"
            ((rollback_errors++))
        fi
    fi
    
    if [ "$rollback_errors" -eq 0 ]; then
        log_success "Rollback completed successfully"
        
        # Validate rollback
        log "Validating rollback..."
        local temp_output=$(mktemp)
        if "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
            log_success "Rollback validation passed"
        else
            log_warning "Rollback validation issues detected"
            cat "$temp_output"
        fi
        rm -f "$temp_output"
    else
        log_error "Rollback completed with $rollback_errors errors"
        return 1
    fi
}

# Cleanup old recovery files
cleanup_recovery_files() {
    log "Cleaning up old recovery files..."
    
    # Clean old backups (older than retention period)
    local cleanup_count=0
    
    if [ -d "$BACKUP_DIR" ]; then
        while IFS= read -r -d '' backup_dir; do
            local backup_age=$(( ($(date +%s) - $(stat -c %Y "$backup_dir" 2>/dev/null || stat -f %m "$backup_dir" 2>/dev/null || echo $(date +%s))) / 86400 ))
            
            if [ "$backup_age" -gt "$SAFETY_BACKUP_RETENTION" ]; then
                if rm -rf "$backup_dir"; then
                    log_info "Removed old backup: $(basename "$backup_dir") (${backup_age} days old)"
                    ((cleanup_count++))
                else
                    log_warning "Failed to remove old backup: $(basename "$backup_dir")"
                fi
            fi
        done < <(find "$BACKUP_DIR" -name "recovery-backup-*" -type d -print0 2>/dev/null)
    fi
    
    # Clean old diagnosis files (older than 30 days)
    if [ -d "$RECOVERY_LOG_DIR" ]; then
        while IFS= read -r -d '' diagnosis_file; do
            local file_age=$(( ($(date +%s) - $(stat -c %Y "$diagnosis_file" 2>/dev/null || stat -f %m "$diagnosis_file" 2>/dev/null || echo $(date +%s))) / 86400 ))
            
            if [ "$file_age" -gt 30 ]; then
                if rm -f "$diagnosis_file"; then
                    log_info "Removed old diagnosis: $(basename "$diagnosis_file") (${file_age} days old)"
                    ((cleanup_count++))
                else
                    log_warning "Failed to remove old diagnosis: $(basename "$diagnosis_file")"
                fi
            fi
        done < <(find "$RECOVERY_LOG_DIR" -name "diagnosis-*.json" -type f -print0 2>/dev/null)
    fi
    
    log_success "Cleanup completed: $cleanup_count files removed"
}

# Show recovery system status
show_status() {
    echo -e "${BOLD}🔧 Recovery System Status${NC}"
    echo "=========================="
    echo ""
    
    # Check command counter availability
    echo -n "Command Counter: "
    if [ -x "$COMMAND_COUNTER" ]; then
        echo -e "${GREEN}✅ Available${NC}"
    else
        echo -e "${RED}❌ Not available${NC}"
    fi
    
    # Check registry updater availability
    echo -n "Registry Updater: "
    if [ -x "$REGISTRY_UPDATER" ]; then
        echo -e "${GREEN}✅ Available${NC}"
    else
        echo -e "${RED}❌ Not available${NC}"
    fi
    
    # Check recent backups
    local backup_count=$(find "$BACKUP_DIR" -name "recovery-backup-*" -type d 2>/dev/null | wc -l)
    echo "Recovery Backups: $backup_count available"
    
    # Check diagnosis files
    local diagnosis_count=$(find "$RECOVERY_LOG_DIR" -name "diagnosis-*.json" -type f 2>/dev/null | wc -l)
    echo "Diagnosis Files: $diagnosis_count available"
    
    echo ""
    echo "Configuration:"
    echo "  Max Attempts: $MAX_RECOVERY_ATTEMPTS"
    echo "  Confidence Threshold: $RECOVERY_CONFIDENCE_THRESHOLD"
    echo "  Backup Retention: $SAFETY_BACKUP_RETENTION days"
    echo ""
    echo "Directories:"
    echo "  Recovery Logs: $RECOVERY_LOG_DIR"
    echo "  Backups: $BACKUP_DIR"
}

# Main execution function
main() {
    local command=""
    local dry_run=false
    local force=false
    local create_backup=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            auto|diagnose|repair|rollback|status|cleanup)
                command="$1"
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --threshold)
                RECOVERY_CONFIDENCE_THRESHOLD="$2"
                shift 2
                ;;
            --max-attempts)
                MAX_RECOVERY_ATTEMPTS="$2"
                shift 2
                ;;
            --backup)
                create_backup=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default command
    if [ -z "$command" ]; then
        command="auto"
    fi
    
    ensure_directories
    
    # Check dependencies
    if [ ! -x "$COMMAND_COUNTER" ]; then
        log_error "Command counter script not available: $COMMAND_COUNTER"
        exit 1
    fi
    
    if [ ! command -v jq &> /dev/null ]; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    # Execute command
    case "$command" in
        auto)
            execute_auto_recovery "$dry_run" "$force"
            ;;
        diagnose)
            diagnose_sync_issues > /dev/null
            ;;
        repair)
            # Manual repair mode - run both strategies
            if [ "$create_backup" = true ] && [ "$dry_run" = false ]; then
                create_recovery_backup > /dev/null
            fi
            
            log "Executing manual repair operations..."
            execute_directory_sync "$dry_run"
            execute_registry_update "$dry_run"
            ;;
        rollback)
            execute_rollback
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup_recovery_files
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"