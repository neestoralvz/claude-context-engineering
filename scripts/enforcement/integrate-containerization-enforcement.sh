#!/bin/bash
# Containerization Enforcement Integration Script
# Integrates principle enforcement with containerization commands

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENFORCER_SCRIPT="$SCRIPT_DIR/containerization-principle-enforcer.py"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}🚨 $1${NC}"
}

# Function to run containerization enforcement
run_enforcement() {
    local project_path="${1:-.}"
    
    log_info "Running containerization principle enforcement for: $project_path"
    
    # Ensure the enforcer script exists and is executable
    if [[ ! -f "$ENFORCER_SCRIPT" ]]; then
        log_error "Enforcement script not found: $ENFORCER_SCRIPT"
        return 1
    fi
    
    # Make script executable
    chmod +x "$ENFORCER_SCRIPT"
    
    # Run the enforcement script
    if python3 "$ENFORCER_SCRIPT" "$project_path"; then
        log_success "Containerization principles compliant"
        return 0
    else
        local exit_code=$?
        case $exit_code in
            1)
                log_error "BLOCKING violations detected - execution halted"
                return 1
                ;;
            2)
                log_warning "Compliance score below 90% threshold"
                return 2
                ;;
            *)
                log_error "Enforcement script failed with exit code: $exit_code"
                return $exit_code
                ;;
        esac
    fi
}

# Function to integrate with containerize command
enforce_pre_containerize() {
    local project_path="${1:-.}"
    
    log_info "Pre-containerization validation..."
    
    # Check if project already has containerization
    if [[ -f "$project_path/Dockerfile" ]]; then
        log_info "Existing containerization detected - validating compliance"
        run_enforcement "$project_path"
    else
        log_info "New containerization project - enforcement will validate post-generation"
        return 0
    fi
}

# Function to enforce post-deployment
enforce_post_deploy() {
    local project_path="${1:-.}"
    
    log_info "Post-deployment compliance validation..."
    run_enforcement "$project_path"
}

# Function to create enforcement results directory
setup_enforcement_environment() {
    local results_dir="$PROJECT_ROOT/scripts/results/enforcement"
    mkdir -p "$results_dir"
    log_success "Enforcement environment ready: $results_dir"
}

# Function to install enforcement dependencies
install_dependencies() {
    log_info "Checking Python dependencies for enforcement engine..."
    
    # Check if required Python modules are available
    python3 -c "import yaml, pathlib" 2>/dev/null || {
        log_warning "Installing required Python dependencies..."
        pip3 install pyyaml --user || {
            log_error "Failed to install Python dependencies"
            return 1
        }
    }
    
    log_success "Python dependencies satisfied"
}

# Function to validate enforcement system
validate_enforcement_system() {
    log_info "Validating enforcement system..."
    
    # Check enforcer script syntax
    if python3 -m py_compile "$ENFORCER_SCRIPT"; then
        log_success "Enforcement script syntax valid"
    else
        log_error "Enforcement script has syntax errors"
        return 1
    fi
    
    # Test enforcement on current project
    log_info "Testing enforcement on current project..."
    if run_enforcement "$PROJECT_ROOT"; then
        log_success "Enforcement system validation complete"
    else
        log_warning "Current project has compliance issues (expected in development)"
    fi
}

# Integration with containerization workflow
integrate_with_commands() {
    log_info "Integrating enforcement with containerization commands..."
    
    # Create integration hooks
    cat > "$SCRIPT_DIR/pre-containerize-hook.sh" << 'EOF'
#!/bin/bash
# Pre-containerization enforcement hook
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/integrate-containerization-enforcement.sh"
enforce_pre_containerize "$@"
EOF
    
    cat > "$SCRIPT_DIR/post-deploy-hook.sh" << 'EOF'
#!/bin/bash
# Post-deployment enforcement hook
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/integrate-containerization-enforcement.sh"
enforce_post_deploy "$@"
EOF
    
    # Make hooks executable
    chmod +x "$SCRIPT_DIR/pre-containerize-hook.sh"
    chmod +x "$SCRIPT_DIR/post-deploy-hook.sh"
    
    log_success "Integration hooks created"
}

# Main execution function
main() {
    case "${1:-validate}" in
        "setup")
            log_info "Setting up containerization enforcement system..."
            setup_enforcement_environment
            install_dependencies
            integrate_with_commands
            log_success "Containerization enforcement system setup complete"
            ;;
        "validate")
            log_info "Validating containerization enforcement system..."
            setup_enforcement_environment
            install_dependencies
            validate_enforcement_system
            ;;
        "enforce")
            local project_path="${2:-.}"
            log_info "Running enforcement for project: $project_path"
            setup_enforcement_environment
            run_enforcement "$project_path"
            ;;
        "pre-containerize")
            enforce_pre_containerize "${2:-.}"
            ;;
        "post-deploy")
            enforce_post_deploy "${2:-.}"
            ;;
        *)
            echo "Usage: $0 {setup|validate|enforce|pre-containerize|post-deploy} [project_path]"
            echo ""
            echo "Commands:"
            echo "  setup           - Set up enforcement system and integration hooks"
            echo "  validate        - Validate enforcement system functionality"
            echo "  enforce         - Run enforcement on specified project"
            echo "  pre-containerize - Pre-containerization validation hook"
            echo "  post-deploy     - Post-deployment validation hook"
            exit 1
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi