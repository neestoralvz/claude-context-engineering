#!/bin/bash

# Enforce Commit Requirements Compliance Script
# Validates and enforces Principle #84: Mandatory Commit Operations
# Part of Context Engineering compliance monitoring system
# Enhanced with conventional commits support and optimized patterns

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compliance thresholds
MIN_COMMIT_COVERAGE=0.90  # 90% minimum coverage
MIN_TRACEABILITY_RATIO=2.5  # 2.5 commits per substantial operation
SUBSTANTIAL_OP_FILE_THRESHOLD=2  # >2 files = substantial operation

# Logging
LOG_FILE="scripts/results/compliance/commit-compliance-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR: $1"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO: $1"
}

# Validate git repository
validate_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not a git repository. Commit compliance requires git."
        exit 1
    fi
    success "Git repository validated"
}

# Calculate operational commit coverage
calculate_commit_coverage() {
    local time_period=${1:-"1 day ago"}
    
    # Count operational commits by type
    local pre_ops=$(git log --oneline --since="$time_period" --grep="🚀 PRE-OP" | wc -l)
    local progress_commits=$(git log --oneline --since="$time_period" --grep="⚡ PROGRESS" | wc -l)
    local complete_commits=$(git log --oneline --since="$time_period" --grep="✅ COMPLETE" | wc -l)
    
    local total_operational_commits=$((pre_ops + progress_commits + complete_commits))
    local substantial_operations=$pre_ops  # Pre-ops indicate substantial operation starts
    
    # Calculate coverage ratio
    local expected_commits=$((substantial_operations * 3))  # Triple commit pattern
    local coverage_ratio=0
    
    if [ $expected_commits -gt 0 ]; then
        coverage_ratio=$(echo "scale=3; $total_operational_commits / $expected_commits" | bc -l)
    fi
    
    echo "$coverage_ratio"
}

# Calculate operational traceability
calculate_traceability() {
    local time_period=${1:-"1 day ago"}
    
    local git_log_entries=$(git log --oneline --since="$time_period" | wc -l)
    local substantial_operations=$(git log --oneline --since="$time_period" --grep="🚀 PRE-OP" | wc -l)
    
    local traceability_ratio=0
    if [ $substantial_operations -gt 0 ]; then
        traceability_ratio=$(echo "scale=2; $git_log_entries / $substantial_operations" | bc -l)
    fi
    
    echo "$traceability_ratio"
}

# Validate commit message format
validate_commit_format() {
    local commit_hash=$1
    local commit_message=$(git log --format=%B -n 1 "$commit_hash")
    
    # Check for operational commit patterns (Principle #84)
    if echo "$commit_message" | grep -qE "^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE):"; then
        # Validate operational commit structure
        if echo "$commit_message" | grep -q "🤖 Generated with \[Claude Code\]"; then
            return 0  # Valid operational commit
        else
            return 1  # Missing Claude Code attribution
        fi
    # Check for conventional commits format (optimized)
    elif echo "$commit_message" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+"; then
        return 0  # Valid conventional commit
    # Check for legacy emoji-prefixed commits (backward compatibility)
    elif echo "$commit_message" | grep -qE "^(🚀 feat|🔧 fix|📚 docs|✨ enhance|♻️ refactor|✅ test|🛠️ build|⚙️ ci|🏗️ chore):"; then
        return 0  # Valid legacy commit
    else
        return 2  # Invalid commit format
    fi
}

# Analyze recent commits
analyze_recent_commits() {
    local time_period=${1:-"1 day ago"}
    
    header "COMMIT ANALYSIS (since $time_period)"
    
    # Get recent commits
    local recent_commits=$(git log --oneline --since="$time_period" --pretty=format:"%h")
    local total_commits=$(echo "$recent_commits" | wc -l)
    
    if [ $total_commits -eq 0 ]; then
        warning "No commits found in the specified time period"
        return 0
    fi
    
    info "Analyzing $total_commits recent commits..."
    
    local valid_operational=0
    local valid_conventional=0
    local valid_legacy=0
    local invalid_format=0
    local missing_attribution=0
    
    while IFS= read -r commit_hash; do
        if [ -n "$commit_hash" ]; then
            local commit_message=$(git log --format=%B -n 1 "$commit_hash")
            
            # Check operational commits first
            if echo "$commit_message" | grep -qE "^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE):"; then
                if echo "$commit_message" | grep -q "🤖 Generated with \[Claude Code\]"; then
                    ((valid_operational++))
                else
                    ((missing_attribution++))
                fi
            # Check conventional commits (optimized format)
            elif echo "$commit_message" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+"; then
                ((valid_conventional++))
            # Check legacy emoji format (backward compatibility)
            elif echo "$commit_message" | grep -qE "^(🚀 feat|🔧 fix|📚 docs|✨ enhance|♻️ refactor|✅ test|🛠️ build|⚙️ ci|🏗️ chore):"; then
                ((valid_legacy++))
            else
                ((invalid_format++))
            fi
        fi
    done <<< "$recent_commits"
    
    # Calculate compliance percentages
    local total_valid=$((valid_operational + valid_conventional + valid_legacy))
    local format_compliance=$(echo "scale=1; $total_valid * 100 / $total_commits" | bc -l)
    local conventional_usage=$(echo "scale=1; $valid_conventional * 100 / $total_commits" | bc -l)
    local legacy_usage=$(echo "scale=1; $valid_legacy * 100 / $total_commits" | bc -l)
    local attribution_compliance=$(echo "scale=1; $valid_operational * 100 / ($valid_operational + $missing_attribution)" | bc -l 2>/dev/null || echo "0")
    
    # Report results
    echo "📊 Commit Format Analysis:"
    echo "   ✅ Valid operational commits: $valid_operational"
    echo "   🎯 Valid conventional commits: $valid_conventional (OPTIMIZED FORMAT)"
    echo "   🔄 Valid legacy commits: $valid_legacy (deprecated format)"
    echo "   ❌ Invalid format: $invalid_format"
    echo "   ⚠️  Missing attribution: $missing_attribution"
    echo ""
    echo "📈 Compliance Metrics:"
    echo "   Overall format compliance: ${format_compliance}%"
    echo "   Conventional format usage: ${conventional_usage}% (TARGET: ≥80%)"
    echo "   Legacy format usage: ${legacy_usage}% (DEPRECATED)"
    echo "   Attribution compliance: ${attribution_compliance}%"
    
    # Compliance validation
    if (( $(echo "$format_compliance >= 80" | bc -l) )); then
        success "Commit format compliance: ${format_compliance}% (target: ≥80%)"
    else
        error "Commit format compliance below threshold: ${format_compliance}% (target: ≥80%)"
    fi
    
    # Legacy format warnings
    if (( $(echo "$legacy_usage > 0" | bc -l) )); then
        warning "Legacy emoji format detected (${legacy_usage}% of commits)"
        echo ""
        echo -e "${YELLOW}📌 RECOMMENDATION: Migrate to optimized conventional commits format${NC}"
        echo "   Legacy: 🚀 feat(scope): description"
        echo "   Optimized: feat(scope): description"
        echo "   Use: scripts/utilities/commit-helper.sh --optimize 'message'"
    fi
    
    # Conventional format promotion
    if (( $(echo "$conventional_usage >= 80" | bc -l) )); then
        success "Excellent conventional format adoption: ${conventional_usage}%"
    elif (( $(echo "$conventional_usage >= 50" | bc -l) )); then
        warning "Good conventional format adoption: ${conventional_usage}% (target: ≥80%)"
    else
        error "Low conventional format adoption: ${conventional_usage}% (target: ≥80%)"
    fi
}

# Check operational commit patterns
check_operational_patterns() {
    local time_period=${1:-"1 day ago"}
    
    header "OPERATIONAL COMMIT PATTERN VALIDATION"
    
    # Count commit types
    local pre_ops=$(git log --oneline --since="$time_period" --grep="🚀 PRE-OP" | wc -l)
    local progress_commits=$(git log --oneline --since="$time_period" --grep="⚡ PROGRESS" | wc -l)
    local complete_commits=$(git log --oneline --since="$time_period" --grep="✅ COMPLETE" | wc -l)
    
    echo "📈 Operational Commit Distribution:"
    echo "   Pre-operation commits: $pre_ops"
    echo "   Progress commits: $progress_commits"
    echo "   Completion commits: $complete_commits"
    
    # Pattern validation
    if [ $pre_ops -eq $complete_commits ]; then
        success "Balanced pre-operation and completion commits"
    elif [ $pre_ops -gt $complete_commits ]; then
        warning "More pre-operations than completions (ongoing operations: $((pre_ops - complete_commits)))"
    else
        error "More completions than pre-operations (pattern violation)"
    fi
    
    # Progress commit adequacy
    local min_progress=$pre_ops  # At least 1 progress commit per operation
    if [ $progress_commits -ge $min_progress ]; then
        success "Adequate progress documentation: $progress_commits commits"
    else
        warning "Insufficient progress documentation: $progress_commits (minimum: $min_progress)"
    fi
}

# Generate compliance report
generate_compliance_report() {
    local time_period=${1:-"1 day ago"}
    
    header "COMMIT COMPLIANCE REPORT"
    
    # Calculate key metrics
    local coverage=$(calculate_commit_coverage "$time_period")
    local traceability=$(calculate_traceability "$time_period")
    
    echo "📊 Compliance Metrics (since $time_period):"
    echo "   Commit Coverage: $coverage (target: ≥$MIN_COMMIT_COVERAGE)"
    echo "   Traceability Ratio: $traceability (target: ≥$MIN_TRACEABILITY_RATIO)"
    
    # Coverage validation
    if (( $(echo "$coverage >= $MIN_COMMIT_COVERAGE" | bc -l) )); then
        success "Commit coverage compliant: $coverage"
    else
        error "Commit coverage below threshold: $coverage (target: ≥$MIN_COMMIT_COVERAGE)"
    fi
    
    # Traceability validation
    if (( $(echo "$traceability >= $MIN_TRACEABILITY_RATIO" | bc -l) )); then
        success "Traceability compliant: $traceability"
    else
        error "Traceability below threshold: $traceability (target: ≥$MIN_TRACEABILITY_RATIO)"
    fi
    
    # Overall compliance score
    local coverage_score=$(echo "scale=0; $coverage * 50" | bc -l)  # 50% weight
    local traceability_score=$(echo "scale=0; ($traceability / $MIN_TRACEABILITY_RATIO) * 50" | bc -l)  # 50% weight
    local total_score=$((coverage_score + traceability_score))
    
    echo ""
    echo "🎯 Overall Compliance Score: $total_score/100"
    
    if [ $total_score -ge 90 ]; then
        success "EXCELLENT compliance ($total_score/100)"
    elif [ $total_score -ge 75 ]; then
        success "GOOD compliance ($total_score/100)"
    elif [ $total_score -ge 60 ]; then
        warning "MODERATE compliance ($total_score/100) - improvement needed"
    else
        error "POOR compliance ($total_score/100) - immediate action required"
    fi
}

# Suggest improvements
suggest_improvements() {
    echo ""
    header "IMPROVEMENT RECOMMENDATIONS"
    
    # Recent operational commits
    local recent_pre_ops=$(git log --oneline --since="1 day ago" --grep="🚀 PRE-OP" | wc -l)
    local recent_progress=$(git log --oneline --since="1 day ago" --grep="⚡ PROGRESS" | wc -l)
    local recent_complete=$(git log --oneline --since="1 day ago" --grep="✅ COMPLETE" | wc -l)
    
    if [ $recent_pre_ops -gt $recent_complete ]; then
        warning "Incomplete operations detected. Consider completing pending operations with ✅ COMPLETE commits."
    fi
    
    if [ $recent_progress -lt $recent_pre_ops ]; then
        warning "Insufficient progress documentation. Add ⚡ PROGRESS commits during long operations."
    fi
    
    # Check for uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        warning "Uncommitted changes detected. Consider committing current work progress."
    fi
    
    # Recommend commit templates
    echo ""
    echo "💡 Commit Template Reminders:"
    echo "   Pre-operation: 🚀 PRE-OP: [operation] - Starting [objective]"
    echo "   Progress: ⚡ PROGRESS: [milestone] - [achievement] ([percentage]% complete)"
    echo "   Completion: ✅ COMPLETE: [operation] - [outcome]"
    echo ""
    echo "📖 For detailed guidance, see:"
    echo "   - Principle #84: docs/knowledge/principles/technical-standards.md#84-mandatory-commit-operations"
    echo "   - Git Strategy: docs/knowledge/strategies/git-strategy-protocols.md#mandatory-operational-commit-protocol"
}

# Main execution
main() {
    local time_period=${1:-"1 day ago"}
    
    echo -e "${BLUE}🔍 Enforce Commit Requirements Compliance${NC}"
    echo -e "${BLUE}Principle #84: Mandatory Commit Operations${NC}"
    echo -e "${BLUE}Time Period: $time_period${NC}\n"
    
    # Initialize log
    log "Starting commit compliance enforcement check"
    log "Time period: $time_period"
    
    # Run validation checks
    validate_git_repo
    analyze_recent_commits "$time_period"
    check_operational_patterns "$time_period"
    generate_compliance_report "$time_period"
    suggest_improvements
    
    # Final summary
    echo ""
    header "COMPLIANCE CHECK COMPLETE"
    success "Commit compliance validation completed"
    info "Detailed log saved to: $LOG_FILE"
    
    log "Commit compliance check completed successfully"
}

# Install commit-msg hook for real-time validation
install_commit_hook() {
    local hook_path=".git/hooks/commit-msg"
    
    info "Installing commit-msg hook for real-time validation..."
    
    cat > "$hook_path" << 'EOF'
#!/bin/bash
# Commit Message Validation Hook
# Validates commit messages against Context Engineering standards

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Skip if commit message is empty or contains only comments
if [ -z "$(echo "$commit_msg" | grep -v '^#')" ]; then
    exit 0
fi

# Check for operational commit patterns (Principle #84)
if echo "$commit_msg" | grep -qE "^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE):"; then
    # Operational commits require Claude Code attribution
    if ! echo "$commit_msg" | grep -q "🤖 Generated with \[Claude Code\]"; then
        echo "❌ Error: Operational commits require Claude Code attribution"
        echo "Add the following to your commit message:"
        echo ""
        echo "🤖 Generated with [Claude Code](https://claude.ai/code)"
        echo ""
        echo "Co-Authored-By: Claude <noreply@anthropic.com>"
        exit 1
    fi
    exit 0
fi

# Check for conventional commits format
if echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+"; then
    # Check subject line length
    subject_line=$(echo "$commit_msg" | head -n1)
    if [ ${#subject_line} -gt 50 ]; then
        echo "⚠️  Warning: Subject line is ${#subject_line} characters (recommended: ≤50)"
        echo "Consider shortening: $subject_line"
    fi
    exit 0
fi

# Check for legacy emoji-prefixed commits (backward compatibility)
if echo "$commit_msg" | grep -qE "^(🚀 feat|🔧 fix|📚 docs|✨ enhance|♻️ refactor|✅ test|🛠️ build|⚙️ ci|🏗️ chore):"; then
    exit 0
fi

# Invalid format
echo "❌ Error: Invalid commit message format"
echo ""
echo "Use one of these formats:"
echo "  feat(scope): description          # New feature"
echo "  fix(scope): description           # Bug fix"
echo "  docs(scope): description          # Documentation"
echo "  🚀 PRE-OP: description           # Operation start"
echo "  ⚡ PROGRESS: description          # Operation progress"
echo "  ✅ COMPLETE: description          # Operation complete"
echo ""
echo "Your message: $commit_msg"
exit 1
EOF

    chmod +x "$hook_path"
    success "Commit-msg hook installed at $hook_path"
}

# Uninstall commit-msg hook
uninstall_commit_hook() {
    local hook_path=".git/hooks/commit-msg"
    
    if [ -f "$hook_path" ]; then
        rm "$hook_path"
        success "Commit-msg hook removed"
    else
        warning "No commit-msg hook found to remove"
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [OPTION] [time_period]"
    echo ""
    echo "Options:"
    echo "  --install-hook        Install commit-msg hook for real-time validation"
    echo "  --uninstall-hook      Remove commit-msg hook"
    echo "  --help, -h            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Check last 24 hours (default)"
    echo "  $0 '3 days ago'       # Check last 3 days"
    echo "  $0 '1 week ago'       # Check last week"
    echo "  $0 '2024-01-01'       # Check since specific date"
    echo "  $0 --install-hook     # Install real-time validation hook"
    echo ""
    echo "This script validates compliance with Principle #84: Mandatory Commit Operations"
}

# Handle command line arguments
case "$1" in
    --help|-h)
        usage
        exit 0
        ;;
    --install-hook)
        validate_git_repo
        install_commit_hook
        exit 0
        ;;
    --uninstall-hook)
        validate_git_repo
        uninstall_commit_hook
        exit 0
        ;;
    *)
        # Execute main function with time period
        main "$1"
        ;;
esac