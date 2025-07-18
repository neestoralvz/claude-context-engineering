#!/bin/bash
# 🔄 Context Engineering - Automated Registry Update with Audit Trail
# Automatically updates command registry when discrepancies are detected

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
REGISTRY_FILE="$PROJECT_ROOT/.claude/config/command-registry.json"
BACKUP_DIR="$PROJECT_ROOT/scripts/backups/registry-backups"
AUDIT_DIR="$PROJECT_ROOT/scripts/results/registry-updates"
COMMAND_COUNTER="$PROJECT_ROOT/scripts/validation/automated-command-counter-v2.sh"

# Logging functions
log() { echo -e "${CYAN}[REGISTRY-UPDATE]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Help function
show_help() {
    cat << EOF
🔄 Context Engineering - Automated Registry Update

DESCRIPTION:
    Automatically updates the command registry when discrepancies are detected
    between actual command counts and registry values.

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --check-only        Check for discrepancies without updating
    --force-update      Update registry even if discrepancies are minor
    --backup-only       Create backup without running update
    --audit-trail       Show recent audit trail
    --help, -h          Show this help message

EXAMPLES:
    $0                  # Run full automated update process
    $0 --check-only     # Check for discrepancies only
    $0 --force-update   # Force update regardless of threshold
    $0 --audit-trail    # Show recent registry changes

AUDIT TRAIL:
    All updates are logged with timestamps, change details, and justification.
    Audit logs are stored in: $AUDIT_DIR

SAFETY FEATURES:
    - Automatic backup before any changes
    - Threshold-based updates (prevents minor fluctuation updates)
    - Audit trail with rollback capability
    - Validation after updates

EOF
}

# Create necessary directories
ensure_directories() {
    mkdir -p "$BACKUP_DIR" "$AUDIT_DIR"
}

# Create backup of current registry
create_backup() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/command-registry-backup-$timestamp.json"
    
    if [ -f "$REGISTRY_FILE" ]; then
        cp "$REGISTRY_FILE" "$backup_file"
        log_success "Registry backup created: $(basename "$backup_file")"
        echo "$backup_file"
    else
        log_error "Registry file not found: $REGISTRY_FILE"
        return 1
    fi
}

# Get current command counts from validation script
get_current_counts() {
    log "Running command count validation..."
    
    if [ ! -x "$COMMAND_COUNTER" ]; then
        log_error "Command counter script not executable: $COMMAND_COUNTER"
        return 1
    fi
    
    # Run command counter and capture output
    local temp_output=$(mktemp)
    if "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
        # Find the latest report
        local latest_report=$(find "$PROJECT_ROOT/scripts/results/command-counts" -name "command-count-report-*.json" -type f | sort -r | head -1)
        
        if [ -f "$latest_report" ]; then
            echo "$latest_report"
            rm -f "$temp_output"
            return 0
        else
            log_error "Could not find command count report"
            cat "$temp_output"
            rm -f "$temp_output"
            return 1
        fi
    else
        local exit_code=$?
        log_error "Command counting failed (exit code: $exit_code)"
        cat "$temp_output"
        rm -f "$temp_output"
        return 1
    fi
}

# Extract counts from report
extract_counts_from_report() {
    local report_file="$1"
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        return 1
    fi
    
    local docs_total=$(jq -r '.command_count_report.counts.docs_commands.total' "$report_file")
    local docs_behavioral=$(jq -r '.command_count_report.counts.docs_commands.behavioral' "$report_file")
    local docs_executable=$(jq -r '.command_count_report.counts.docs_commands.executable' "$report_file")
    local docs_cores=$(jq -r '.command_count_report.counts.docs_commands.cores' "$report_file")
    local docs_shared=$(jq -r '.command_count_report.counts.docs_commands.shared' "$report_file")
    local discrepancies=$(jq -r '.command_count_report.discrepancies.total_found // 0' "$report_file")
    
    # Export as global variables
    CURRENT_TOTAL="$docs_total"
    CURRENT_BEHAVIORAL="$docs_behavioral"
    CURRENT_EXECUTABLE="$docs_executable"
    CURRENT_CORES="$docs_cores"
    CURRENT_SHARED="$docs_shared"
    CURRENT_DISCREPANCIES="$discrepancies"
    
    log_info "Current counts - Total: $CURRENT_TOTAL, Behavioral: $CURRENT_BEHAVIORAL, Executable: $CURRENT_EXECUTABLE, Cores: $CURRENT_CORES, Shared: $CURRENT_SHARED"
}

# Extract counts from current registry
extract_registry_counts() {
    if [ ! -f "$REGISTRY_FILE" ]; then
        log_error "Registry file not found: $REGISTRY_FILE"
        return 1
    fi
    
    REGISTRY_TOTAL=$(jq -r '.statistics.totalCommands' "$REGISTRY_FILE")
    REGISTRY_BEHAVIORAL=$(jq -r '.statistics.behavioralCommands' "$REGISTRY_FILE")
    REGISTRY_EXECUTABLE=$(jq -r '.statistics.executableCommands' "$REGISTRY_FILE")
    REGISTRY_CORES=$(jq -r '.statistics.coreCommands' "$REGISTRY_FILE")
    REGISTRY_SHARED=$(jq -r '.statistics.sharedCommands' "$REGISTRY_FILE")
    
    log_info "Registry counts - Total: $REGISTRY_TOTAL, Behavioral: $REGISTRY_BEHAVIORAL, Executable: $REGISTRY_EXECUTABLE, Cores: $REGISTRY_CORES, Shared: $REGISTRY_SHARED"
}

# Check if update is needed
needs_update() {
    local threshold=${1:-1}  # Default threshold of 1 command difference
    
    # Calculate differences
    local total_diff=$((CURRENT_TOTAL - REGISTRY_TOTAL))
    local behavioral_diff=$((CURRENT_BEHAVIORAL - REGISTRY_BEHAVIORAL))
    local executable_diff=$((CURRENT_EXECUTABLE - REGISTRY_EXECUTABLE))
    local cores_diff=$((CURRENT_CORES - REGISTRY_CORES))
    local shared_diff=$((CURRENT_SHARED - REGISTRY_SHARED))
    
    # Check if any difference exceeds threshold
    if [ ${total_diff#-} -gt $threshold ] || \
       [ ${behavioral_diff#-} -gt $threshold ] || \
       [ ${executable_diff#-} -gt $threshold ] || \
       [ ${cores_diff#-} -gt $threshold ] || \
       [ ${shared_diff#-} -gt $threshold ]; then
        
        log_warning "Significant discrepancies detected:"
        [ ${total_diff#-} -gt $threshold ] && log_warning "  Total: registry=$REGISTRY_TOTAL vs actual=$CURRENT_TOTAL (diff: $total_diff)"
        [ ${behavioral_diff#-} -gt $threshold ] && log_warning "  Behavioral: registry=$REGISTRY_BEHAVIORAL vs actual=$CURRENT_BEHAVIORAL (diff: $behavioral_diff)"
        [ ${executable_diff#-} -gt $threshold ] && log_warning "  Executable: registry=$REGISTRY_EXECUTABLE vs actual=$CURRENT_EXECUTABLE (diff: $executable_diff)"
        [ ${cores_diff#-} -gt $threshold ] && log_warning "  Cores: registry=$REGISTRY_CORES vs actual=$CURRENT_CORES (diff: $cores_diff)"
        [ ${shared_diff#-} -gt $threshold ] && log_warning "  Shared: registry=$REGISTRY_SHARED vs actual=$CURRENT_SHARED (diff: $shared_diff)"
        
        return 0  # Update needed
    else
        log_success "Registry counts are within acceptable threshold ($threshold)"
        return 1  # No update needed
    fi
}

# Update registry with new counts
update_registry() {
    local backup_file="$1"
    local timestamp=$(date -Iseconds)
    
    log "Updating registry with current command counts..."
    
    # Create updated registry with new statistics
    jq --arg timestamp "$timestamp" \
       --argjson total "$CURRENT_TOTAL" \
       --argjson behavioral "$CURRENT_BEHAVIORAL" \
       --argjson executable "$CURRENT_EXECUTABLE" \
       --argjson cores "$CURRENT_CORES" \
       --argjson shared "$CURRENT_SHARED" \
       '.statistics.totalCommands = $total |
        .statistics.activeCommands = $total |
        .statistics.behavioralCommands = $behavioral |
        .statistics.executableCommands = $executable |
        .statistics.coreCommands = $cores |
        .statistics.sharedCommands = $shared |
        .statistics.lastCalculated = $timestamp' \
       "$REGISTRY_FILE" > "$REGISTRY_FILE.tmp"
    
    if [ $? -eq 0 ]; then
        mv "$REGISTRY_FILE.tmp" "$REGISTRY_FILE"
        log_success "Registry updated successfully"
        return 0
    else
        log_error "Failed to update registry"
        rm -f "$REGISTRY_FILE.tmp"
        return 1
    fi
}

# Create audit trail entry
create_audit_entry() {
    local backup_file="$1"
    local timestamp=$(date -Iseconds)
    local audit_file="$AUDIT_DIR/registry-update-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$audit_file" << EOF
{
  "audit_entry": {
    "timestamp": "$timestamp",
    "operation": "automated_registry_update",
    "trigger": "command_count_discrepancy",
    "changes": {
      "before": {
        "totalCommands": $REGISTRY_TOTAL,
        "behavioralCommands": $REGISTRY_BEHAVIORAL,
        "executableCommands": $REGISTRY_EXECUTABLE,
        "coreCommands": $REGISTRY_CORES,
        "sharedCommands": $REGISTRY_SHARED
      },
      "after": {
        "totalCommands": $CURRENT_TOTAL,
        "behavioralCommands": $CURRENT_BEHAVIORAL,
        "executableCommands": $CURRENT_EXECUTABLE,
        "coreCommands": $CURRENT_CORES,
        "sharedCommands": $CURRENT_SHARED
      },
      "differences": {
        "totalCommands": $((CURRENT_TOTAL - REGISTRY_TOTAL)),
        "behavioralCommands": $((CURRENT_BEHAVIORAL - REGISTRY_BEHAVIORAL)),
        "executableCommands": $((CURRENT_EXECUTABLE - REGISTRY_EXECUTABLE)),
        "coreCommands": $((CURRENT_CORES - REGISTRY_CORES)),
        "sharedCommands": $((CURRENT_SHARED - REGISTRY_SHARED))
      }
    },
    "validation": {
      "discrepancies_before_update": $CURRENT_DISCREPANCIES,
      "backup_created": "$(basename "$backup_file")",
      "command_sync_status": "synchronized"
    },
    "metadata": {
      "script_version": "1.0",
      "project_root": "$PROJECT_ROOT",
      "user": "${USER:-unknown}",
      "hostname": "${HOSTNAME:-$(hostname 2>/dev/null || echo 'unknown')}"
    }
  }
}
EOF
    
    log_success "Audit entry created: $(basename "$audit_file")"
    echo "$audit_file"
}

# Validate update was successful
validate_update() {
    log "Validating registry update..."
    
    # Re-run command counter to verify
    local temp_output=$(mktemp)
    if "$COMMAND_COUNTER" --quiet > "$temp_output" 2>&1; then
        log_success "Registry update validation passed"
        rm -f "$temp_output"
        return 0
    else
        log_error "Registry update validation failed"
        cat "$temp_output"
        rm -f "$temp_output"
        return 1
    fi
}

# Show recent audit trail
show_audit_trail() {
    log "Recent registry update audit trail:"
    echo ""
    
    local audit_files=($(find "$AUDIT_DIR" -name "registry-update-*.json" -type f | sort -r | head -5))
    
    if [ ${#audit_files[@]} -eq 0 ]; then
        log_info "No audit entries found"
        return 0
    fi
    
    for audit_file in "${audit_files[@]}"; do
        local timestamp=$(jq -r '.audit_entry.timestamp' "$audit_file" 2>/dev/null)
        local total_before=$(jq -r '.audit_entry.changes.before.totalCommands' "$audit_file" 2>/dev/null)
        local total_after=$(jq -r '.audit_entry.changes.after.totalCommands' "$audit_file" 2>/dev/null)
        local total_diff=$(jq -r '.audit_entry.changes.differences.totalCommands' "$audit_file" 2>/dev/null)
        
        echo -e "${CYAN}📅 $timestamp${NC}"
        echo -e "   Total Commands: $total_before → $total_after (${total_diff:+$total_diff})"
        echo -e "   File: $(basename "$audit_file")"
        echo ""
    done
}

# Main execution function
main() {
    local check_only=false
    local force_update=false
    local backup_only=false
    local show_audit=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check-only)
                check_only=true
                shift
                ;;
            --force-update)
                force_update=true
                shift
                ;;
            --backup-only)
                backup_only=true
                shift
                ;;
            --audit-trail)
                show_audit=true
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
    
    echo -e "${BOLD}🔄 AUTOMATED REGISTRY UPDATE${NC}"
    echo "=================================="
    echo ""
    
    ensure_directories
    
    # Show audit trail if requested
    if [ "$show_audit" = true ]; then
        show_audit_trail
        exit 0
    fi
    
    # Create backup
    local backup_file
    if ! backup_file=$(create_backup); then
        exit 1
    fi
    
    if [ "$backup_only" = true ]; then
        log_success "Backup created successfully"
        exit 0
    fi
    
    # Get current counts
    local report_file
    if ! report_file=$(get_current_counts); then
        exit 1
    fi
    
    # Extract counts from report and registry
    if ! extract_counts_from_report "$report_file"; then
        exit 1
    fi
    
    if ! extract_registry_counts; then
        exit 1
    fi
    
    # Check if update is needed
    local threshold=0  # Always check for any discrepancy
    if [ "$force_update" = true ]; then
        threshold=-1  # Force update by using impossible threshold
    fi
    
    if needs_update $threshold || [ "$force_update" = true ]; then
        if [ "$check_only" = true ]; then
            log_warning "Update needed but check-only mode enabled"
            exit 1
        fi
        
        log "Proceeding with registry update..."
        
        # Update registry
        if update_registry "$backup_file"; then
            # Create audit trail
            local audit_file
            if audit_file=$(create_audit_entry "$backup_file"); then
                # Validate update
                if validate_update; then
                    log_success "Registry update completed successfully"
                    echo ""
                    log_info "Summary:"
                    log_info "  Backup: $(basename "$backup_file")"
                    log_info "  Audit: $(basename "$audit_file")"
                    log_info "  Total commands: $REGISTRY_TOTAL → $CURRENT_TOTAL"
                    exit 0
                else
                    log_error "Update validation failed"
                    exit 1
                fi
            else
                log_error "Failed to create audit entry"
                exit 1
            fi
        else
            log_error "Registry update failed"
            exit 1
        fi
    else
        if [ "$check_only" = true ]; then
            log_success "Registry is up to date"
            exit 0
        else
            log_success "No registry update needed"
            exit 0
        fi
    fi
}

# Run main function
main "$@"