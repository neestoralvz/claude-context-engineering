#!/bin/bash

# Enforce Commit Requirements Compliance Script
# Validates and enforces Principle #84: Mandatory Commit Operations
# Part of Context Engineering compliance monitoring system

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
    
    # Check for operational commit patterns
    if echo "$commit_message" | grep -qE "^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE):"; then
        # Validate operational commit structure
        if echo "$commit_message" | grep -q "🤖 Generated with \[Claude Code\]"; then
            return 0  # Valid operational commit
        else
            return 1  # Missing Claude Code attribution
        fi
    else
        # Check for standard commit types
        if echo "$commit_message" | grep -qE "^(🚀 feat|🔧 fix|📚 docs|✨ enhance|♻️ refactor|✅ test|🛠️ build|⚙️ ci|🏗️ chore):"; then
            return 0  # Valid standard commit
        else
            return 2  # Invalid commit format
        fi
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
    local valid_standard=0
    local invalid_format=0
    local missing_attribution=0
    
    while IFS= read -r commit_hash; do
        if [ -n "$commit_hash" ]; then
            validate_commit_format "$commit_hash"
            case $? in
                0) ((valid_operational++)) ;;
                1) ((missing_attribution++)) ;;
                2) ((invalid_format++)) ;;
            esac
        fi
    done <<< "$recent_commits"
    
    # Calculate compliance percentages
    local format_compliance=$(echo "scale=1; ($valid_operational + $valid_standard) * 100 / $total_commits" | bc -l)
    local attribution_compliance=$(echo "scale=1; $valid_operational * 100 / ($valid_operational + $missing_attribution)" | bc -l 2>/dev/null || echo "0")
    
    # Report results
    echo "📊 Commit Format Analysis:"
    echo "   Valid operational commits: $valid_operational"
    echo "   Valid standard commits: $valid_standard"
    echo "   Invalid format: $invalid_format"
    echo "   Missing attribution: $missing_attribution"
    echo "   Format compliance: ${format_compliance}%"
    echo "   Attribution compliance: ${attribution_compliance}%"
    
    # Compliance validation
    if (( $(echo "$format_compliance >= 80" | bc -l) )); then
        success "Commit format compliance: ${format_compliance}% (target: ≥80%)"
    else
        error "Commit format compliance below threshold: ${format_compliance}% (target: ≥80%)"
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

# Script usage
usage() {
    echo "Usage: $0 [time_period]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Check last 24 hours (default)"
    echo "  $0 '3 days ago'       # Check last 3 days"
    echo "  $0 '1 week ago'       # Check last week"
    echo "  $0 '2024-01-01'       # Check since specific date"
    echo ""
    echo "This script validates compliance with Principle #84: Mandatory Commit Operations"
}

# Handle command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
    exit 0
fi

# Execute main function
main "$1"