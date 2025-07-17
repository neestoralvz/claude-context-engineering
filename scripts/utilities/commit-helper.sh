#!/bin/bash

# Interactive Commit Message Helper Script
# Part of Context Engineering git optimization system
# Helps users create optimized conventional commit messages

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Display commit type options
show_commit_types() {
    echo -e "${CYAN}📋 Available Commit Types:${NC}"
    echo ""
    echo "  1) feat      - New features or capabilities"
    echo "  2) fix       - Bug fixes or issue resolution"
    echo "  3) docs      - Documentation changes"
    echo "  4) style     - Code style/formatting changes"
    echo "  5) refactor  - Code refactoring without feature changes"
    echo "  6) test      - Adding or updating tests"
    echo "  7) chore     - Maintenance, build, or auxiliary tasks"
    echo "  8) perf      - Performance improvements"
    echo "  9) ci        - CI/CD pipeline changes"
    echo ""
    echo "  🚀) pre-op   - Operation initiation (Principle #84)"
    echo "  ⚡) progress - Operation progress milestone"
    echo "  ✅) complete - Operation completion"
    echo ""
}

# Display common scopes
show_scopes() {
    echo -e "${CYAN}📂 Common Scopes:${NC}"
    echo ""
    echo "  automation, commands, compliance, core, docs"
    echo "  knowledge, principles, scripts, validation, workflows"
    echo ""
    echo "  Or use your own specific scope..."
    echo ""
}

# Get commit type from user
get_commit_type() {
    show_commit_types
    echo -e "${YELLOW}Select commit type (1-9 or 🚀/⚡/✅):${NC} "
    read -r type_choice
    
    case "$type_choice" in
        1) echo "feat" ;;
        2) echo "fix" ;;
        3) echo "docs" ;;
        4) echo "style" ;;
        5) echo "refactor" ;;
        6) echo "test" ;;
        7) echo "chore" ;;
        8) echo "perf" ;;
        9) echo "ci" ;;
        "🚀"|"pre-op") echo "🚀 PRE-OP" ;;
        "⚡"|"progress") echo "⚡ PROGRESS" ;;
        "✅"|"complete") echo "✅ COMPLETE" ;;
        *) 
            error "Invalid choice. Please try again."
            get_commit_type
            ;;
    esac
}

# Get scope from user
get_scope() {
    show_scopes
    echo -e "${YELLOW}Enter scope (optional, press enter to skip):${NC} "
    read -r scope
    echo "$scope"
}

# Get description from user
get_description() {
    local commit_type="$1"
    local max_length=50
    
    echo -e "${YELLOW}Enter commit description:${NC}"
    echo -e "${CYAN}💡 Tips: Use imperative mood ('add', 'fix', 'update')${NC}"
    echo -e "${CYAN}💡 Keep it ≤${max_length} characters for optimal readability${NC}"
    echo ""
    
    read -r description
    
    # Check length
    if [ ${#description} -gt $max_length ]; then
        warning "Description is ${#description} characters (recommended: ≤${max_length})"
        echo -e "${YELLOW}Would you like to shorten it? (y/N):${NC} "
        read -r shorten
        if [[ "$shorten" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Enter shorter description:${NC} "
            read -r description
        fi
    fi
    
    echo "$description"
}

# Check if operational commit needs attribution
needs_attribution() {
    local commit_type="$1"
    if [[ "$commit_type" =~ ^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE)$ ]]; then
        return 0
    else
        return 1
    fi
}

# Generate commit message
generate_commit_message() {
    local commit_type="$1"
    local scope="$2"
    local description="$3"
    local message=""
    
    # Build subject line
    if [[ "$commit_type" =~ ^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE)$ ]]; then
        # Operational commits format
        message="$commit_type: $description"
    else
        # Conventional commits format
        if [ -n "$scope" ]; then
            message="$commit_type($scope): $description"
        else
            message="$commit_type: $description"
        fi
    fi
    
    # Add attribution for operational commits
    if needs_attribution "$commit_type"; then
        message="$message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    fi
    
    echo "$message"
}

# Preview and confirm commit
preview_commit() {
    local commit_message="$1"
    
    echo ""
    header "COMMIT MESSAGE PREVIEW"
    echo -e "${GREEN}$commit_message${NC}"
    echo ""
    
    # Character count analysis
    local subject_line=$(echo "$commit_message" | head -n1)
    local char_count=${#subject_line}
    
    if [ $char_count -le 50 ]; then
        success "Subject line length: $char_count characters ✅ (≤50 recommended)"
    else
        warning "Subject line length: $char_count characters (>50 may be truncated in some views)"
    fi
    
    echo ""
    echo -e "${YELLOW}Proceed with this commit? (Y/n):${NC} "
    read -r confirm
    
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        return 1
    else
        return 0
    fi
}

# Create the commit
create_commit() {
    local commit_message="$1"
    
    # Check if there are staged changes
    if ! git diff --cached --quiet; then
        info "Creating commit with staged changes..."
        if git commit -m "$commit_message"; then
            success "Commit created successfully!"
            echo ""
            info "Recent commit:"
            git log -1 --oneline
        else
            error "Failed to create commit"
            return 1
        fi
    else
        warning "No staged changes found."
        echo ""
        echo -e "${YELLOW}Would you like to stage all changes and commit? (y/N):${NC} "
        read -r stage_all
        
        if [[ "$stage_all" =~ ^[Yy]$ ]]; then
            git add .
            if git commit -m "$commit_message"; then
                success "Commit created successfully!"
                echo ""
                info "Recent commit:"
                git log -1 --oneline
            else
                error "Failed to create commit"
                return 1
            fi
        else
            info "Use 'git add <files>' to stage changes before committing"
            return 1
        fi
    fi
}

# Optimize existing commit message
optimize_message() {
    local original="$1"
    
    echo -e "${CYAN}🔧 Message Optimization Analysis:${NC}"
    echo ""
    
    # Check for legacy emoji prefix and suggest conversion
    if echo "$original" | grep -qE "^(🚀 feat|🔧 fix|📚 docs|✨ enhance|♻️ refactor|✅ test|🛠️ build|⚙️ ci|🏗️ chore):"; then
        # Convert legacy emoji format to optimized conventional format
        local optimized=$(echo "$original" | sed -E 's/^🚀 feat/feat/' | sed -E 's/^🔧 fix/fix/' | sed -E 's/^📚 docs/docs/' | sed -E 's/^✨ enhance/refactor/' | sed -E 's/^♻️ refactor/refactor/' | sed -E 's/^✅ test/test/' | sed -E 's/^🛠️ build/chore/' | sed -E 's/^⚙️ ci/ci/' | sed -E 's/^🏗️ chore/chore/')
        
        echo "Original (legacy):  $original"
        echo "Optimized:          $optimized"
        echo ""
        local reduction=$(( ${#original} - ${#optimized} ))
        success "Character reduction: $reduction characters (-$(( reduction * 100 / ${#original} ))%)"
        warning "Legacy emoji format detected. Consider using optimized conventional format."
    elif echo "$original" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+"; then
        # Already in conventional format - check for optimizations
        local char_count=${#original}
        if [ $char_count -le 50 ]; then
            success "Message is already optimized conventional format ($char_count characters)"
        else
            warning "Message is conventional but exceeds 50 characters ($char_count). Consider shortening."
        fi
    elif echo "$original" | grep -qE "^(🚀 PRE-OP|⚡ PROGRESS|✅ COMPLETE):"; then
        success "Operational commit format - correctly formatted for Context Engineering"
    else
        warning "Message doesn't match conventional commits or operational format."
        echo ""
        echo -e "${CYAN}Suggested formats:${NC}"
        echo "  feat(scope): description    # New feature"
        echo "  fix(scope): description     # Bug fix"
        echo "  docs(scope): description    # Documentation"
        echo "  🚀 PRE-OP: description     # Operation start"
    fi
}

# Main interactive flow
main() {
    header "📝 COMMIT MESSAGE HELPER"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not a git repository. Please run this script from within a git repository."
        exit 1
    fi
    
    echo -e "${CYAN}Choose an option:${NC}"
    echo "  1) Create new commit message"
    echo "  2) Optimize existing commit message"
    echo "  3) Show commit examples"
    echo ""
    echo -e "${YELLOW}Your choice (1-3):${NC} "
    read -r choice
    
    case "$choice" in
        1)
            # Interactive commit creation
            commit_type=$(get_commit_type)
            scope=$(get_scope)
            description=$(get_description "$commit_type")
            
            commit_message=$(generate_commit_message "$commit_type" "$scope" "$description")
            
            if preview_commit "$commit_message"; then
                create_commit "$commit_message"
            else
                info "Commit cancelled. Run script again to retry."
            fi
            ;;
        2)
            # Message optimization
            echo -e "${YELLOW}Enter your commit message to optimize:${NC} "
            read -r original_message
            optimize_message "$original_message"
            ;;
        3)
            # Show examples
            header "📚 COMMIT MESSAGE EXAMPLES"
            echo -e "${GREEN}✅ Good Examples:${NC}"
            echo "  feat(commands): parallel execution orchestration"
            echo "  fix(validation): cross-reference accuracy"
            echo "  docs(knowledge): principle categorization"
            echo "  🚀 PRE-OP: YAML elimination comprehensive conversion"
            echo ""
            echo -e "${RED}❌ Avoid:${NC}"
            echo "  Added new feature for parallel execution"
            echo "  Fixed some validation issues"
            echo "  Updated documentation files"
            ;;
        *)
            error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Script usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --help, -h            Show this help message"
    echo "  --optimize MESSAGE    Optimize a specific commit message"
    echo ""
    echo "Interactive mode will guide you through creating optimized commit messages"
    echo "following Context Engineering standards and conventional commits format."
}

# Handle command line arguments
case "$1" in
    --help|-h)
        usage
        exit 0
        ;;
    --optimize)
        if [ -n "$2" ]; then
            optimize_message "$2"
        else
            error "Please provide a commit message to optimize"
            echo "Example: $0 --optimize 'feat(commands): add new feature'"
        fi
        exit 0
        ;;
    "")
        # No arguments - run interactive mode
        main
        ;;
    *)
        error "Unknown option: $1"
        usage
        exit 1
        ;;
esac