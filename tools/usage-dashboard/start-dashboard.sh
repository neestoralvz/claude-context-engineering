#!/bin/bash
# Personal Usage Dashboard - Smart Startup Script
# Automatically resolves port conflicts and starts dashboard

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PORT=8080
DEFAULT_HOST="127.0.0.1"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"

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

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Scan for available ports
scan_ports() {
    print_status "Scanning for available ports..."
    
    local port_scan_result
    if port_scan_result=$(python3 "$SCRIPT_DIR/scripts/port-scanner.py" --port "$DEFAULT_PORT" --json); then
        local available_port
        available_port=$(echo "$port_scan_result" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('available_port', ''))")
        
        if [[ -n "$available_port" ]]; then
            export DASHBOARD_PORT="$available_port"
            export DASHBOARD_INTERNAL_PORT="$available_port"
            
            # Save to .env file
            cat > "$ENV_FILE" << EOF
# Personal Dashboard Environment Configuration
# Generated on $(date)

DASHBOARD_PORT=$available_port
DASHBOARD_INTERNAL_PORT=$available_port
DASHBOARD_HOST=$DEFAULT_HOST
REDIS_PORT=6380
FLASK_ENV=development
EOF
            
            print_success "Port $available_port is available"
            return 0
        else
            print_error "No available ports found"
            return 1
        fi
    else
        print_error "Port scanning failed"
        return 1
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting dashboard services..."
    
    # Load environment variables
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
    
    # Check if we should use docker-compose or docker compose
    local compose_cmd
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    else
        compose_cmd="docker-compose"
    fi
    
    # Build and start services
    if $compose_cmd -f "$COMPOSE_FILE" up --build -d; then
        print_success "Dashboard services started successfully"
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 5
        
        # Check service health
        local dashboard_port="${DASHBOARD_PORT:-$DEFAULT_PORT}"
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -f -s "http://localhost:$dashboard_port/api/health" &> /dev/null; then
                print_success "Dashboard is ready!"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                print_warning "Dashboard may be starting up slowly. Check logs with: $compose_cmd logs dashboard"
            fi
            
            sleep 2
            ((attempt++))
        done
        
        # Show access information
        echo ""
        echo "🎉 Personal Usage Dashboard is now running!"
        echo ""
        echo "📊 Dashboard:  http://localhost:$dashboard_port"
        echo "📈 Health:     http://localhost:$dashboard_port/api/health"
        echo "🔧 Redis:      localhost:${REDIS_PORT:-6380}"
        echo ""
        echo "Commands:"
        echo "  View logs:   $compose_cmd logs -f dashboard"
        echo "  Stop:        $compose_cmd down"
        echo "  Rebuild:     $compose_cmd up --build -d"
        echo ""
        
    else
        print_error "Failed to start dashboard services"
        return 1
    fi
}

# Main execution
main() {
    echo "🚀 Personal Usage Dashboard Startup"
    echo "===================================="
    echo ""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                DEFAULT_PORT="$2"
                shift 2
                ;;
            --host)
                DEFAULT_HOST="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [--port PORT] [--host HOST]"
                echo ""
                echo "Options:"
                echo "  --port PORT    Preferred port (default: 8080)"
                echo "  --host HOST    Host to bind to (default: 127.0.0.1)"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Pre-flight checks
    check_docker
    check_docker_compose
    
    # Port scanning and configuration
    if ! scan_ports; then
        print_error "Port configuration failed"
        exit 1
    fi
    
    # Start services
    if ! start_services; then
        print_error "Service startup failed"
        exit 1
    fi
    
    print_success "Dashboard startup completed successfully!"
}

# Run main function
main "$@"