#!/bin/bash
# Enhanced Dashboard Startup with Browser Integration
# Automatically opens browser after successful startup

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
STARTUP_SCRIPT="$PROJECT_DIR/start-dashboard.sh"
BROWSER_OPEN_DELAY=3
MAX_STARTUP_WAIT=60

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_highlight() {
    echo -e "${PURPLE}[HIGHLIGHT]${NC} $1"
}

# Detect the operating system and preferred browser
detect_browser() {
    local os_type
    os_type=$(uname -s)
    
    case "$os_type" in
        "Darwin")  # macOS
            if command -v open &> /dev/null; then
                echo "open"
                return 0
            fi
            ;;
        "Linux")
            # Try common browsers in order of preference
            for browser in google-chrome chromium-browser firefox firefox-esr; do
                if command -v "$browser" &> /dev/null; then
                    echo "$browser"
                    return 0
                fi
            done
            # Fallback to xdg-open
            if command -v xdg-open &> /dev/null; then
                echo "xdg-open"
                return 0
            fi
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS"*)  # Windows
            if command -v start &> /dev/null; then
                echo "start"
                return 0
            fi
            ;;
    esac
    
    return 1
}

# Open URL in browser
open_browser() {
    local url="$1"
    local browser_cmd
    
    if browser_cmd=$(detect_browser); then
        print_status "Opening dashboard in browser..."
        
        case "$browser_cmd" in
            "open")  # macOS
                open "$url" 2>/dev/null &
                ;;
            "start")  # Windows
                start "$url" 2>/dev/null &
                ;;
            "xdg-open")  # Linux fallback
                xdg-open "$url" 2>/dev/null &
                ;;
            *)  # Specific browser command
                "$browser_cmd" "$url" 2>/dev/null &
                ;;
        esac
        
        print_success "Browser opened successfully"
        return 0
    else
        print_warning "Could not detect browser - please open manually"
        return 1
    fi
}

# Wait for dashboard to be ready
wait_for_dashboard() {
    local dashboard_port="$1"
    local url="http://localhost:$dashboard_port"
    local health_url="$url/api/health"
    local attempt=1
    
    print_status "Waiting for dashboard to be ready..."
    
    while [[ $attempt -le $((MAX_STARTUP_WAIT / 2)) ]]; do
        if curl -f -s "$health_url" &> /dev/null; then
            print_success "Dashboard is ready and healthy!"
            return 0
        fi
        
        if [[ $((attempt % 5)) -eq 0 ]]; then
            print_status "Still waiting... (attempt $attempt/$((MAX_STARTUP_WAIT / 2)))"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    print_warning "Dashboard startup timeout - but it may still be starting"
    return 1
}

# Extract port from environment file
get_dashboard_port() {
    local env_file="$PROJECT_DIR/.env"
    
    if [[ -f "$env_file" ]]; then
        local port
        port=$(grep "^DASHBOARD_PORT=" "$env_file" 2>/dev/null | cut -d'=' -f2 | tr -d ' "')
        if [[ -n "$port" && "$port" =~ ^[0-9]+$ ]]; then
            echo "$port"
            return 0
        fi
    fi
    
    # Fallback to default
    echo "8080"
    return 1
}

# Main startup sequence
main() {
    echo "🚀 Enhanced Dashboard Startup with Browser Integration"
    echo "====================================================="
    echo ""
    
    # Parse command line arguments
    local open_browser_flag=true
    local startup_args=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-browser)
                open_browser_flag=false
                shift
                ;;
            --browser-delay)
                BROWSER_OPEN_DELAY="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS] [STARTUP_ARGS...]"
                echo ""
                echo "Enhanced startup script with browser integration"
                echo ""
                echo "Options:"
                echo "  --no-browser           Don't open browser automatically"
                echo "  --browser-delay SECS   Delay before opening browser (default: 3)"
                echo "  --help                 Show this help message"
                echo ""
                echo "All other arguments are passed to start-dashboard.sh"
                echo ""
                echo "Examples:"
                echo "  $0                           # Start with auto browser opening"
                echo "  $0 --no-browser              # Start without browser"
                echo "  $0 --port 3000               # Start on specific port"
                echo "  $0 --browser-delay 5         # Wait 5 seconds before browser"
                exit 0
                ;;
            *)
                startup_args+=("$1")
                shift
                ;;
        esac
    done
    
    # Check if startup script exists
    if [[ ! -f "$STARTUP_SCRIPT" ]]; then
        print_error "Startup script not found: $STARTUP_SCRIPT"
        exit 1
    fi
    
    # Check if startup script is executable
    if [[ ! -x "$STARTUP_SCRIPT" ]]; then
        print_status "Making startup script executable..."
        chmod +x "$STARTUP_SCRIPT"
    fi
    
    # Start the dashboard
    print_status "Starting dashboard with smart port allocation..."
    if ! "$STARTUP_SCRIPT" "${startup_args[@]}"; then
        print_error "Dashboard startup failed"
        exit 1
    fi
    
    # Get the allocated port
    local dashboard_port
    dashboard_port=$(get_dashboard_port)
    local dashboard_url="http://localhost:$dashboard_port"
    
    print_highlight "Dashboard URL: $dashboard_url"
    
    # Wait for dashboard to be ready if browser opening is enabled
    if [[ "$open_browser_flag" == true ]]; then
        if wait_for_dashboard "$dashboard_port"; then
            # Brief delay for final startup
            if [[ "$BROWSER_OPEN_DELAY" -gt 0 ]]; then
                print_status "Waiting $BROWSER_OPEN_DELAY seconds before opening browser..."
                sleep "$BROWSER_OPEN_DELAY"
            fi
            
            # Open browser
            if open_browser "$dashboard_url"; then
                print_success "Dashboard is ready and browser opened!"
            else
                print_warning "Dashboard is ready - please open: $dashboard_url"
            fi
        else
            print_warning "Dashboard may still be starting up"
            print_warning "Please check manually: $dashboard_url"
        fi
    else
        print_success "Dashboard started successfully!"
        print_highlight "Access at: $dashboard_url"
    fi
    
    echo ""
    echo "🎉 Startup complete!"
    echo ""
    echo "Next steps:"
    echo "  • View dashboard: $dashboard_url"
    echo "  • Check logs: docker-compose logs -f dashboard"
    echo "  • Stop services: docker-compose down"
    echo ""
}

# Run main function with all arguments
main "$@"