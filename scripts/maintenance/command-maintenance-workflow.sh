#!/bin/bash

# Command Maintenance Workflow
# Automated synchronization and validation for command modifications
# Integrates enhanced-command-sync.js into development workflow

set -e

echo "🔧 Context Engineering - Command Maintenance Workflow"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
BASE_DIR="/Users/nalve/claude-context-engineering"
DOCS_COMMANDS_DIR="$BASE_DIR/docs/commands"
CLAUDE_COMMANDS_DIR="$BASE_DIR/.claude/commands"
SYNC_SCRIPT="$BASE_DIR/scripts/unidirectional-command-sync.js"
VALIDATION_SCRIPT="$BASE_DIR/scripts/validation/automated-command-counter-v2.sh"
RESULTS_DIR="$BASE_DIR/scripts/results/maintenance"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to display help
show_help() {
    echo "Command Maintenance Workflow Usage:"
    echo ""
    echo "ARCHITECTURE:"
    echo "  📍 docs/commands/     - SOURCE OF TRUTH (development, authoritative)"
    echo "  🪞 .claude/commands/  - OPERATIONAL MIRROR (auto-synced from docs)"
    echo ""
    echo "COMMANDS:"
    echo "  check         - Check source of truth vs mirror status"
    echo "  sync          - Run unidirectional mirroring (docs → .claude)"
    echo "  validate      - Validate command counts and integrity"
    echo "  full          - Complete maintenance cycle (mirror + validate)"
    echo "  monitor       - Watch for changes and auto-mirror"
    echo "  backup        - Create backup before maintenance"
    echo ""
    echo "HOOKS:"
    echo "  pre-commit    - Run as git pre-commit hook"
    echo "  post-modify   - Run after command modifications"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 full                    # Complete maintenance cycle"
    echo "  $0 sync                    # Mirror docs → .claude"
    echo "  $0 validate                # Validate counts only"
    echo ""
}

# Function to check sync status
check_sync_status() {
    echo -e "${BLUE}🔍 Checking command synchronization status...${NC}"
    
    docs_count=$(find "$DOCS_COMMANDS_DIR" -name "*.md" -type f | grep -v README | wc -l | tr -d ' ')
    claude_count=$(find "$CLAUDE_COMMANDS_DIR" -name "*.md" -type f | wc -l | tr -d ' ')
    
    echo "📊 Command counts:"
    echo "   • docs/commands: $docs_count files"
    echo "   • .claude/commands: $claude_count files"
    
    if [ "$docs_count" -eq "$claude_count" ]; then
        echo -e "${GREEN}✅ Command counts synchronized${NC}"
        return 0
    else
        variance=$((claude_count - docs_count))
        echo -e "${YELLOW}⚠️  Variance detected: $variance files${NC}"
        return 1
    fi
}

# Function to run unidirectional mirroring
run_sync() {
    echo -e "${PURPLE}🔄 Running unidirectional command mirroring (docs → .claude)...${NC}"
    echo -e "${BLUE}📍 Source of Truth: docs/commands/ → Mirror: .claude/commands/${NC}"
    
    if [ -f "$SYNC_SCRIPT" ]; then
        if node "$SYNC_SCRIPT"; then
            echo -e "${GREEN}✅ Mirroring completed successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Mirroring failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Sync script not found: $SYNC_SCRIPT${NC}"
        return 1
    fi
}

# Function to run validation
run_validation() {
    echo -e "${CYAN}📋 Running command validation...${NC}"
    
    if [ -f "$VALIDATION_SCRIPT" ]; then
        if bash "$VALIDATION_SCRIPT"; then
            echo -e "${GREEN}✅ Validation completed${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Validation completed with warnings${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Validation script not found: $VALIDATION_SCRIPT${NC}"
        return 1
    fi
}

# Function to create backup
create_backup() {
    echo -e "${BLUE}💾 Creating backup before maintenance...${NC}"
    
    timestamp=$(date +%Y%m%d-%H%M%S)
    backup_dir="$BASE_DIR/scripts/backups/maintenance-backup-$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Backup command directories
    cp -r "$DOCS_COMMANDS_DIR" "$backup_dir/docs-commands"
    cp -r "$CLAUDE_COMMANDS_DIR" "$backup_dir/claude-commands"
    
    echo "💾 Backup created: $backup_dir"
    echo "$backup_dir" > "$RESULTS_DIR/last-backup.txt"
    
    return 0
}

# Function to run full maintenance cycle
run_full_maintenance() {
    echo -e "${BOLD}🎯 Starting full command maintenance cycle...${NC}"
    echo ""
    
    local errors=0
    
    # Step 1: Backup
    if ! create_backup; then
        echo -e "${RED}❌ Backup failed${NC}"
        ((errors++))
    fi
    
    echo ""
    
    # Step 2: Check current status
    check_sync_status
    local sync_needed=$?
    
    echo ""
    
    # Step 3: Sync if needed
    if [ $sync_needed -ne 0 ]; then
        if ! run_sync; then
            echo -e "${RED}❌ Sync failed${NC}"
            ((errors++))
        fi
    else
        echo -e "${GREEN}ℹ️  Sync not needed - commands already synchronized${NC}"
    fi
    
    echo ""
    
    # Step 4: Validation
    if ! run_validation; then
        echo -e "${YELLOW}⚠️  Validation warnings detected${NC}"
        # Don't count as error - warnings are acceptable
    fi
    
    echo ""
    
    # Summary
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 Full maintenance cycle completed successfully!${NC}"
        
        # Update maintenance log
        echo "$(date): Full maintenance cycle completed successfully" >> "$RESULTS_DIR/maintenance.log"
        return 0
    else
        echo -e "${RED}💥 Maintenance cycle completed with $errors errors${NC}"
        echo "$(date): Maintenance cycle completed with $errors errors" >> "$RESULTS_DIR/maintenance.log"
        return 1
    fi
}

# Function to monitor for changes
monitor_changes() {
    echo -e "${PURPLE}👁️  Starting command change monitoring...${NC}"
    echo "Monitoring: $DOCS_COMMANDS_DIR"
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Check if fswatch is available
    if command -v fswatch >/dev/null 2>&1; then
        fswatch -o "$DOCS_COMMANDS_DIR" | while read f; do
            echo "📝 Changes detected in commands directory"
            echo "🔄 Running automatic sync..."
            
            if run_sync; then
                echo -e "${GREEN}✅ Auto-sync completed${NC}"
            else
                echo -e "${RED}❌ Auto-sync failed${NC}"
            fi
            echo ""
        done
    else
        echo -e "${YELLOW}⚠️  fswatch not available. Install with: brew install fswatch${NC}"
        echo "Falling back to periodic checks..."
        
        while true; do
            sleep 30
            if ! check_sync_status >/dev/null 2>&1; then
                echo "📝 Changes detected - running sync..."
                run_sync
            fi
        done
    fi
}

# Function to run as pre-commit hook
run_pre_commit_hook() {
    echo -e "${BLUE}🪝 Running pre-commit source of truth validation...${NC}"
    echo -e "${BLUE}📍 Validating docs/commands/ → .claude/commands/ mirror integrity${NC}"
    
    # Quick validation check
    if check_sync_status >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Source of truth mirror synchronized - commit allowed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Mirror variance detected - auto-correcting...${NC}"
        
        if run_sync >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Auto-mirror completed - commit allowed${NC}"
            return 0
        else
            echo -e "${RED}❌ Auto-mirror failed - manual intervention required${NC}"
            echo "Please run: $0 full"
            return 1
        fi
    fi
}

# Function to run post-modification maintenance
run_post_modify() {
    echo -e "${CYAN}📝 Running post-modification maintenance...${NC}"
    
    # Quick sync and validate
    run_sync
    local sync_result=$?
    
    if [ $sync_result -eq 0 ]; then
        echo -e "${GREEN}✅ Post-modification sync completed${NC}"
        echo "$(date): Post-modification sync completed" >> "$RESULTS_DIR/maintenance.log"
    else
        echo -e "${RED}❌ Post-modification sync failed${NC}"
        echo "$(date): Post-modification sync failed" >> "$RESULTS_DIR/maintenance.log"
    fi
    
    return $sync_result
}

# Main command processing
case "${1:-help}" in
    "check")
        check_sync_status
        ;;
    "sync")
        run_sync
        ;;
    "validate")
        run_validation
        ;;
    "full")
        run_full_maintenance
        ;;
    "monitor")
        monitor_changes
        ;;
    "backup")
        create_backup
        ;;
    "pre-commit")
        run_pre_commit_hook
        ;;
    "post-modify")
        run_post_modify
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac