#!/bin/bash
# Claude Code Worktree Manager
# Enhanced automation script for managing multiple Claude Code sessions with git worktrees

set -euo pipefail

# Configuration
WORKTREES_DIR="../worktrees"
USER_PREFIX=$(whoami)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/claude-worktree.log"

# Timing for reports
START_TIME=$(date +%s)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo "⟳ /claude-worktree-manager → ERROR: $1 🎯" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo "⟳ /claude-worktree-manager → ✅ $1 🎯"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo "⟳ /claude-worktree-manager → ⚠️ $1 🎯"
    log "WARNING: $1"
}

# Info message
info() {
    echo "⟳ /claude-worktree-manager → ℹ️ $1 🎯"
    log "INFO: $1"
}

# Check prerequisites
check_prerequisites() {
    if ! command -v git &> /dev/null; then
        error_exit "Git is not installed or not in PATH"
    fi
    
    if ! command -v claude &> /dev/null; then
        warning "Claude Code is not in PATH - Claude sessions will need to be launched manually"
    fi
    
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        error_exit "Not inside a Git repository"
    fi
}

# Create worktree with Claude session
create_worktree() {
    local session_name="$1"
    local branch_name="${USER_PREFIX}-${session_name}"
    local auto_claude="${2:-false}"
    local context_file="${3:-}"
    
    if [[ -z "$session_name" ]]; then
        error_exit "Session name is required"
    fi
    
    local worktree_path="${WORKTREES_DIR}/${session_name}"
    
    # Check if worktree already exists
    if [[ -d "$worktree_path" ]]; then
        error_exit "Worktree '$session_name' already exists at $worktree_path"
    fi
    
    # Create worktrees directory if it doesn't exist
    mkdir -p "$(dirname "$worktree_path")"
    
    info "Creating worktree: $session_name"
    
    # Create the worktree
    if ! git worktree add "$worktree_path" -b "$branch_name"; then
        error_exit "Failed to create worktree for $session_name"
    fi
    
    # Navigate to worktree
    cd "$worktree_path" || error_exit "Failed to navigate to worktree"
    
    # Setup environment
    setup_worktree_environment "$session_name" "$context_file"
    
    # Launch Claude if requested
    if [[ "$auto_claude" == "true" || "$auto_claude" == "claude" ]]; then
        launch_claude_session "$session_name"
    fi
    
    success "Worktree created: $worktree_path"
    info "To enter worktree: cd $worktree_path"
    info "To launch Claude: cd $worktree_path && claude"
}

# Setup worktree environment
setup_worktree_environment() {
    local session_name="$1"
    local context_file="${2:-}"
    
    info "Setting up environment for: $session_name"
    
    # Copy environment files if they exist in the main project
    local main_project_path
    main_project_path=$(git worktree list | head -1 | awk '{print $1}')
    
    for env_file in .env .env.local .env.development .env.production; do
        if [[ -f "${main_project_path}/${env_file}" ]]; then
            cp "${main_project_path}/${env_file}" . 2>/dev/null || true
            info "Copied ${env_file} from main project"
        fi
    done
    
    # Create session context file
    create_session_context "$session_name" "$context_file"
    
    # Setup package dependencies if needed
    if [[ -f package.json ]]; then
        info "Installing Node.js dependencies..."
        if command -v npm &> /dev/null; then
            npm install --silent || warning "Failed to install npm dependencies"
        fi
    fi
    
    # Setup Python dependencies if needed
    if [[ -f requirements.txt ]]; then
        info "Installing Python dependencies..."
        if command -v pip &> /dev/null; then
            pip install -r requirements.txt --quiet || warning "Failed to install pip dependencies"
        fi
    fi
    
    # Setup development database if script exists
    if [[ -f scripts/setup-dev-db.sh ]]; then
        info "Setting up development database..."
        bash scripts/setup-dev-db.sh || warning "Failed to setup development database"
    fi
    
    success "Environment setup complete for: $session_name"
}

# Create session context file
create_session_context() {
    local session_name="$1"
    local context_file="${2:-}"
    
    cat > .claude-memory.md << EOF
# Claude Session Context: ${session_name}

**Branch**: $(git branch --show-current)
**Session Focus**: [TO BE DEFINED]
**Current Objective**: [TO BE DEFINED]
**Created**: $(date '+%Y-%m-%d %H:%M:%S')
**Worktree Path**: $(pwd)

## Session Specialization
- **Primary Focus**: [FEATURE/BUGFIX/REFACTOR/DOCUMENTATION]
- **Technical Area**: [BACKEND/FRONTEND/FULLSTACK/DEVOPS]
- **Complexity Level**: [LOW/MEDIUM/HIGH]

## Progress Tracking
### Completed Tasks
- [ ] Initial setup and environment configuration

### In Progress
- [ ] [CURRENT_TASK]

### Pending
- [ ] [NEXT_TASK_1]
- [ ] [NEXT_TASK_2]

## Key Decisions Made
1. **Decision**: [DECISION_DESCRIPTION]
   - **Rationale**: [REASONING]
   - **Alternatives Considered**: [OTHER_OPTIONS]

## Technical Context
- **Architecture Approach**: [PATTERN/FRAMEWORK]
- **Dependencies Added**: None yet
- **Files Modified**: None yet
- **Database Changes**: None yet

## Integration Notes
- **Shared Dependencies**: [DEPENDENCIES_AFFECTING_OTHER_SESSIONS]
- **Integration Points**: [INTERFACES_WITH_OTHER_FEATURES]
- **Potential Conflicts**: [AREAS_REQUIRING_COORDINATION]

## Next Session Handoff
**When resuming this session:**
1. Review progress tracking above
2. Check git log for recent changes
3. Review any TODO comments in code
4. Continue with: [NEXT_SPECIFIC_ACTION]

## Context Files
$(if [[ -n "$context_file" ]]; then echo "- $context_file"; else echo "- No specific context files loaded"; fi)

## Session Commands Used
- Created: $(date '+%Y-%m-%d %H:%M:%S')

---
*This file is automatically updated by the Claude worktree manager*
EOF

    # Copy context file if specified
    if [[ -n "$context_file" && -f "../main-project/$context_file" ]]; then
        cp "../main-project/$context_file" . || warning "Failed to copy context file: $context_file"
        info "Copied context file: $context_file"
    fi
}

# Launch Claude session
launch_claude_session() {
    local session_name="$1"
    
    if ! command -v claude &> /dev/null; then
        warning "Claude Code not found in PATH - please launch manually"
        return 1
    fi
    
    info "Launching Claude Code session for: $session_name"
    
    # Create session log file
    local session_log=".claude-session.log"
    
    # Launch Claude in background
    nohup claude > "$session_log" 2>&1 &
    local claude_pid=$!
    
    # Save PID for later management
    echo "$claude_pid" > .claude-session.pid
    
    success "Claude session launched (PID: $claude_pid) for: $session_name"
    info "Session log: $(pwd)/$session_log"
}

# List all active worktrees and sessions
list_sessions() {
    info "Active Claude Code Worktrees:"
    
    if [[ ! -d "$WORKTREES_DIR" ]]; then
        warning "No worktrees directory found at: $WORKTREES_DIR"
        return
    fi
    
    local count=0
    for worktree in "${WORKTREES_DIR}"/*/; do
        if [[ -d "$worktree" ]]; then
            local name
            name=$(basename "$worktree")
            local branch
            branch=$(git -C "$worktree" branch --show-current 2>/dev/null || echo "unknown")
            local changes
            changes=$(git -C "$worktree" status --porcelain 2>/dev/null | wc -l)
            local claude_status="Not running"
            
            # Check if Claude is running in this worktree
            if [[ -f "${worktree}/.claude-session.pid" ]]; then
                local pid
                pid=$(cat "${worktree}/.claude-session.pid")
                if ps -p "$pid" > /dev/null 2>&1; then
                    claude_status="Running (PID: $pid)"
                else
                    claude_status="Stopped"
                fi
            fi
            
            echo "⟳ /claude-worktree-manager → 📁 $name 🎯"
            echo "⟳ /claude-worktree-manager → Branch: $branch 🎯"
            echo "⟳ /claude-worktree-manager → Changes: $changes files modified 🎯"
            echo "⟳ /claude-worktree-manager → Claude: $claude_status 🎯"
            echo "⟳ /claude-worktree-manager → Path: $worktree 🎯"
            echo
            ((count++))
        fi
    done
    
    if [[ $count -eq 0 ]]; then
        info "No active worktrees found"
    else
        success "Found $count active worktrees"
    fi
}

# Check status of all sessions
status_check() {
    info "Claude Code Worktree Status Report"
    echo "⟳ /claude-worktree-manager → Generated: $(date '+%Y-%m-%d %H:%M:%S') 🎯"
    echo
    
    # System resource overview
    echo "⟳ /claude-worktree-manager → === System Resources === 🎯"
    echo "⟳ /claude-worktree-manager → Memory Usage: $(free -h | awk '/^Mem:/ {print $3 "/" $2}') 🎯"
    echo "⟳ /claude-worktree-manager → CPU Load: $(uptime | awk -F'load average:' '{print $2}') 🎯"
    echo "⟳ /claude-worktree-manager → Disk Usage: $(df -h . | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}') 🎯"
    echo
    
    # Git repository status
    echo "⟳ /claude-worktree-manager → === Git Repository Status === 🎯"
    echo "⟳ /claude-worktree-manager → Main Branch: $(git branch --show-current) 🎯"
    echo "⟳ /claude-worktree-manager → Total Worktrees: $(git worktree list | wc -l) 🎯"
    echo "⟳ /claude-worktree-manager → Uncommitted Changes: $(git status --porcelain | wc -l) files 🎯"
    echo
    
    # Individual worktree status
    echo "⟳ /claude-worktree-manager → === Worktree Details === 🎯"
    list_sessions
    
    # Performance recommendations
    echo "⟳ /claude-worktree-manager → === Recommendations === 🎯"
    local active_sessions
    active_sessions=$(pgrep -c claude || echo "0")
    
    if [[ $active_sessions -gt 4 ]]; then
        warning "High session count ($active_sessions) - consider reducing for optimal performance"
    elif [[ $active_sessions -eq 0 ]]; then
        info "No active Claude sessions - good for system resources"
    else
        success "Session count ($active_sessions) is within optimal range"
    fi
}

# Synchronize all worktrees with main branch
sync_all() {
    local resolve_conflicts="${1:-false}"
    
    info "Synchronizing all worktrees with main branch"
    
    if [[ ! -d "$WORKTREES_DIR" ]]; then
        warning "No worktrees directory found"
        return
    fi
    
    # Fetch latest changes first
    git fetch origin
    
    local success_count=0
    local conflict_count=0
    
    for worktree in "${WORKTREES_DIR}"/*/; do
        if [[ -d "$worktree" ]]; then
            local name
            name=$(basename "$worktree")
            info "Syncing worktree: $name"
            
            cd "$worktree" || continue
            
            # Check for uncommitted changes
            if [[ -n "$(git status --porcelain)" ]]; then
                warning "Uncommitted changes in $name - committing automatically"
                git add .
                git commit -m "WIP: Auto-commit before sync on $(date)"
            fi
            
            # Attempt rebase
            if git rebase origin/main; then
                success "Sync successful for: $name"
                ((success_count++))
            else
                warning "Conflicts detected in: $name"
                ((conflict_count++))
                
                if [[ "$resolve_conflicts" == "true" ]]; then
                    warning "Auto-resolving conflicts for: $name"
                    # Simple conflict resolution - prefer incoming changes
                    git checkout --theirs . || true
                    git add .
                    git rebase --continue || warning "Could not auto-resolve conflicts in $name"
                fi
            fi
            
            cd - > /dev/null
        fi
    done
    
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    echo
    success "Sync complete - Success: $success_count, Conflicts: $conflict_count [${ELAPSED_TIME}s]"
    
    if [[ $conflict_count -gt 0 ]]; then
        warning "Manual conflict resolution required for $conflict_count worktrees"
        info "Use 'git status' and 'git rebase --continue' in affected worktrees"
    fi
}

# Clean up completed worktrees
cleanup() {
    local force="${1:-false}"
    
    info "Cleaning up completed worktrees"
    
    if [[ ! -d "$WORKTREES_DIR" ]]; then
        info "No worktrees directory found - nothing to clean"
        return
    fi
    
    local cleanup_count=0
    
    for worktree in "${WORKTREES_DIR}"/*/; do
        if [[ -d "$worktree" ]]; then
            local name
            name=$(basename "$worktree")
            
            cd "$worktree" || continue
            
            # Check if this worktree has been merged
            local current_branch
            current_branch=$(git branch --show-current)
            local main_commit
            main_commit=$(git rev-parse origin/main)
            local branch_commit
            branch_commit=$(git rev-parse HEAD)
            
            # Check if branch is merged or if forced cleanup
            if git merge-base --is-ancestor "$branch_commit" "$main_commit" || [[ "$force" == "true" ]]; then
                info "Removing merged/completed worktree: $name"
                
                # Stop Claude session if running
                if [[ -f .claude-session.pid ]]; then
                    local pid
                    pid=$(cat .claude-session.pid)
                    if ps -p "$pid" > /dev/null 2>&1; then
                        kill "$pid" || warning "Failed to stop Claude session (PID: $pid)"
                        success "Stopped Claude session for: $name"
                    fi
                fi
                
                cd - > /dev/null
                
                # Remove worktree
                git worktree remove "$worktree" --force
                
                # Delete branch if it exists
                git branch -D "$current_branch" 2>/dev/null || true
                
                success "Cleaned up worktree: $name"
                ((cleanup_count++))
            else
                info "Worktree has unmerged changes, skipping: $name"
            fi
            
            cd - > /dev/null
        fi
    done
    
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    success "Cleanup complete - Removed $cleanup_count worktrees [${ELAPSED_TIME}s]"
}

# Show usage information
usage() {
    echo "Claude Code Worktree Manager"
    echo
    echo "USAGE:"
    echo "  $0 create <session_name> [claude] [context_file]"
    echo "  $0 list"
    echo "  $0 status"
    echo "  $0 sync [--resolve-conflicts]"
    echo "  $0 cleanup [--force]"
    echo "  $0 help"
    echo
    echo "COMMANDS:"
    echo "  create    Create new worktree with optional Claude session"
    echo "  list      List all active worktrees and sessions"
    echo "  status    Show detailed status and system resources"
    echo "  sync      Synchronize all worktrees with main branch"
    echo "  cleanup   Remove completed/merged worktrees"
    echo "  help      Show this help message"
    echo
    echo "EXAMPLES:"
    echo "  $0 create feature-auth claude"
    echo "  $0 create bugfix-perf"
    echo "  $0 create feature-ui claude frontend-context.md"
    echo "  $0 sync --resolve-conflicts"
    echo "  $0 cleanup --force"
    echo
    echo "CONFIGURATION:"
    echo "  WORKTREES_DIR: $WORKTREES_DIR"
    echo "  USER_PREFIX: $USER_PREFIX"
    echo "  LOG_FILE: $LOG_FILE"
}

# Main script logic
main() {
    check_prerequisites
    
    case "${1:-help}" in
        create)
            if [[ $# -lt 2 ]]; then
                error_exit "Session name is required for create command"
            fi
            create_worktree "$2" "${3:-false}" "${4:-}"
            ;;
        list|ls)
            list_sessions
            ;;
        status|stat)
            status_check
            ;;
        sync)
            local resolve_conflicts=false
            if [[ "${2:-}" == "--resolve-conflicts" ]]; then
                resolve_conflicts=true
            fi
            sync_all "$resolve_conflicts"
            ;;
        cleanup|clean)
            local force=false
            if [[ "${2:-}" == "--force" ]]; then
                force=true
            fi
            cleanup "$force"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            error_exit "Unknown command: $1. Use '$0 help' for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"