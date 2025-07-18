#!/bin/bash

# Production deployment script for Ninu.mx Factory Control System
# This script handles complete production deployment with health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Ensure directories exist
mkdir -p "$PROJECT_DIR/logs" "$PROJECT_DIR/data/postgres" "$PROJECT_DIR/data/redis" "$PROJECT_DIR/data/prometheus" "$PROJECT_DIR/data/grafana" "$BACKUP_DIR"

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be healthy
wait_for_service() {
    local service=$1
    local timeout=${2:-60}
    local interval=${3:-5}
    local elapsed=0
    
    log_info "Waiting for $service to be healthy..."
    
    while [ $elapsed -lt $timeout ]; do
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "healthy"; then
            log "✅ $service is healthy"
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
        log_info "Waiting for $service... ($elapsed/$timeout seconds)"
    done
    
    log_error "❌ $service failed to become healthy within $timeout seconds"
    return 1
}

# Function to check system requirements
check_requirements() {
    log "🔍 Checking system requirements..."
    
    # Check Docker
    if ! command_exists docker; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check available disk space (at least 10GB)
    available_space=$(df "$PROJECT_DIR" | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 10485760 ]; then
        log_error "Insufficient disk space. At least 10GB required."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    log "✅ System requirements check passed"
}

# Function to create backup
create_backup() {
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log "📦 Creating backup: $backup_name"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Backup database if it exists
    if docker-compose -f "$COMPOSE_FILE" ps ninu-database | grep -q "Up"; then
        log_info "Backing up database..."
        docker-compose -f "$COMPOSE_FILE" exec -T ninu-database pg_dump -U ninu_user -d ninu_factory_control > "$backup_path/database.sql"
        
        if [ $? -eq 0 ]; then
            log "✅ Database backup created"
        else
            log_warning "⚠️ Database backup failed"
        fi
    fi
    
    # Backup environment file
    cp "$ENV_FILE" "$backup_path/environment.env"
    
    # Backup Docker Compose file
    cp "$COMPOSE_FILE" "$backup_path/docker-compose.yml"
    
    # Compress backup
    tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "$backup_name"
    rm -rf "$backup_path"
    
    log "✅ Backup created: $backup_path.tar.gz"
    
    # Clean old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete
}

# Function to pull latest images
pull_images() {
    log "📥 Pulling latest Docker images..."
    
    if docker-compose -f "$COMPOSE_FILE" pull; then
        log "✅ Images pulled successfully"
    else
        log_error "❌ Failed to pull images"
        exit 1
    fi
}

# Function to build application
build_application() {
    log "🏗️ Building application..."
    
    if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
        log "✅ Application built successfully"
    else
        log_error "❌ Failed to build application"
        exit 1
    fi
}

# Function to deploy services
deploy_services() {
    log "🚀 Deploying services..."
    
    # Start services in order
    log_info "Starting database services..."
    docker-compose -f "$COMPOSE_FILE" up -d ninu-database ninu-redis
    
    # Wait for database to be ready
    wait_for_service ninu-database 120
    wait_for_service ninu-redis 60
    
    log_info "Starting application services..."
    docker-compose -f "$COMPOSE_FILE" up -d ninu-frontend ninu-websocket
    
    # Wait for application services
    wait_for_service ninu-frontend 180
    wait_for_service ninu-websocket 120
    
    log_info "Starting load balancer..."
    docker-compose -f "$COMPOSE_FILE" up -d ninu-haproxy
    
    # Wait for load balancer
    wait_for_service ninu-haproxy 60
    
    log_info "Starting monitoring services..."
    docker-compose -f "$COMPOSE_FILE" up -d ninu-prometheus ninu-grafana ninu-node-exporter ninu-postgres-exporter ninu-redis-exporter
    
    # Wait for monitoring services
    wait_for_service ninu-prometheus 60
    wait_for_service ninu-grafana 120
    
    log_info "Starting backup service..."
    docker-compose -f "$COMPOSE_FILE" up -d ninu-backup
    
    log "✅ All services deployed successfully"
}

# Function to run health checks
run_health_checks() {
    log "🏥 Running health checks..."
    
    # Check main application
    if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        log "✅ Main application is healthy"
    else
        log_error "❌ Main application health check failed"
        return 1
    fi
    
    # Check WebSocket server
    if curl -f -s "http://localhost:3001/health" > /dev/null; then
        log "✅ WebSocket server is healthy"
    else
        log_error "❌ WebSocket server health check failed"
        return 1
    fi
    
    # Check load balancer
    if curl -f -s "http://localhost:8080/stats" > /dev/null; then
        log "✅ Load balancer is healthy"
    else
        log_error "❌ Load balancer health check failed"
        return 1
    fi
    
    # Check Prometheus
    if curl -f -s "http://localhost:9090/-/healthy" > /dev/null; then
        log "✅ Prometheus is healthy"
    else
        log_warning "⚠️ Prometheus health check failed"
    fi
    
    # Check Grafana
    if curl -f -s "http://localhost:3030/api/health" > /dev/null; then
        log "✅ Grafana is healthy"
    else
        log_warning "⚠️ Grafana health check failed"
    fi
    
    return 0
}

# Function to show deployment summary
show_summary() {
    log "📊 Deployment Summary"
    echo "=================================="
    echo "🌐 Application: http://localhost:3000"
    echo "📡 WebSocket: ws://localhost:3001"
    echo "📈 Monitoring: http://localhost:3030 (Grafana)"
    echo "📊 Metrics: http://localhost:9090 (Prometheus)"
    echo "⚖️ Load Balancer: http://localhost:8080/stats"
    echo "=================================="
    echo ""
    echo "🔐 Default Credentials:"
    echo "Grafana: admin / ninu_admin_2024"
    echo "HAProxy Stats: admin / ninu_admin_2024"
    echo "=================================="
    echo ""
    echo "📋 Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Function to rollback deployment
rollback() {
    log_error "🔄 Rolling back deployment..."
    
    # Stop all services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore from latest backup if available
    latest_backup=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        log_info "Restoring from backup: $latest_backup"
        # Add restore logic here if needed
    fi
    
    log_error "❌ Deployment rolled back"
    exit 1
}

# Main deployment function
main() {
    log "🚀 Starting Ninu.mx Factory Control System deployment..."
    
    # Trap errors and rollback
    trap rollback ERR
    
    # Check requirements
    check_requirements
    
    # Create backup
    create_backup
    
    # Pull images
    pull_images
    
    # Build application
    build_application
    
    # Deploy services
    deploy_services
    
    # Run health checks
    if run_health_checks; then
        log "✅ All health checks passed"
    else
        log_error "❌ Some health checks failed"
        exit 1
    fi
    
    # Show summary
    show_summary
    
    log "🎉 Deployment completed successfully!"
    log "📝 Deployment log saved to: $LOG_FILE"
}

# Command line options
case "${1:-}" in
    "backup")
        create_backup
        ;;
    "health")
        run_health_checks
        ;;
    "status")
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "stop")
        log "🛑 Stopping all services..."
        docker-compose -f "$COMPOSE_FILE" down
        log "✅ All services stopped"
        ;;
    "restart")
        log "🔄 Restarting all services..."
        docker-compose -f "$COMPOSE_FILE" restart
        log "✅ All services restarted"
        ;;
    "clean")
        log "🧹 Cleaning up..."
        docker-compose -f "$COMPOSE_FILE" down -v
        docker system prune -f
        log "✅ Cleanup completed"
        ;;
    *)
        main
        ;;
esac