#!/bin/bash

# Health Monitor and Auto-Recovery Script for Ninu Factory Control System
# Enterprise-grade monitoring with automatic healing capabilities

set -euo pipefail

# ================================
# Configuration
# ================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/ninu-factory/health-monitor.log"
METRICS_FILE="/var/log/ninu-factory/health-metrics.json"
RECOVERY_ATTEMPTS_FILE="/tmp/ninu-recovery-attempts"
MAX_RECOVERY_ATTEMPTS=3
HEALTH_CHECK_INTERVAL=30
ESCALATION_THRESHOLD=3

# Services to monitor
SERVICES=(
    "ninu-frontend-1:3000:/api/health"
    "ninu-frontend-2:3000:/api/health"
    "ninu-database:5432"
    "ninu-redis:6379"
    "ninu-loadbalancer:8404/stats"
)

# Alert endpoints
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
EMAIL_ALERTS="${EMAIL_ALERTS:-admin@ninu-factory.com}"
PAGERDUTY_KEY="${PAGERDUTY_INTEGRATION_KEY:-}"

# ================================
# Logging Functions
# ================================
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_critical() { log "CRITICAL" "$@"; }

# ================================
# Metrics Collection
# ================================
collect_metrics() {
    local service="$1"
    local response_time="$2"
    local status="$3"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create metrics JSON
    local metric_entry=$(cat <<EOF
{
    "timestamp": "$timestamp",
    "service": "$service",
    "response_time_ms": $response_time,
    "status": "$status",
    "healthy": $([ "$status" = "healthy" ] && echo "true" || echo "false")
}
EOF
    )
    
    echo "$metric_entry" >> "$METRICS_FILE"
    
    # Keep only last 1000 entries
    tail -n 1000 "$METRICS_FILE" > "${METRICS_FILE}.tmp" && mv "${METRICS_FILE}.tmp" "$METRICS_FILE"
}

# ================================
# Health Check Functions
# ================================
check_http_service() {
    local service_url="$1"
    local timeout=10
    
    local start_time=$(date +%s%3N)
    local http_code
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$service_url" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
            echo "healthy:$response_time"
        else
            echo "unhealthy:$response_time:HTTP_$http_code"
        fi
    else
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        echo "unhealthy:$response_time:CONNECTION_FAILED"
    fi
}

check_database_service() {
    local db_host="$1"
    local db_port="$2"
    
    local start_time=$(date +%s%3N)
    
    if timeout 5 bash -c "</dev/tcp/$db_host/$db_port" 2>/dev/null; then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        echo "healthy:$response_time"
    else
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        echo "unhealthy:$response_time:CONNECTION_REFUSED"
    fi
}

check_redis_service() {
    local redis_host="$1"
    local redis_port="$2"
    
    local start_time=$(date +%s%3N)
    
    if echo "PING" | nc -w 2 "$redis_host" "$redis_port" | grep -q "PONG"; then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        echo "healthy:$response_time"
    else
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        echo "unhealthy:$response_time:REDIS_ERROR"
    fi
}

# ================================
# Recovery Functions
# ================================
get_recovery_attempts() {
    local service="$1"
    if [[ -f "$RECOVERY_ATTEMPTS_FILE" ]]; then
        grep "^$service:" "$RECOVERY_ATTEMPTS_FILE" 2>/dev/null | cut -d: -f2 || echo "0"
    else
        echo "0"
    fi
}

increment_recovery_attempts() {
    local service="$1"
    local attempts=$(get_recovery_attempts "$service")
    local new_attempts=$((attempts + 1))
    
    # Update or add entry
    if [[ -f "$RECOVERY_ATTEMPTS_FILE" ]]; then
        grep -v "^$service:" "$RECOVERY_ATTEMPTS_FILE" > "${RECOVERY_ATTEMPTS_FILE}.tmp" 2>/dev/null || true
        mv "${RECOVERY_ATTEMPTS_FILE}.tmp" "$RECOVERY_ATTEMPTS_FILE"
    fi
    echo "$service:$new_attempts" >> "$RECOVERY_ATTEMPTS_FILE"
    
    echo "$new_attempts"
}

reset_recovery_attempts() {
    local service="$1"
    if [[ -f "$RECOVERY_ATTEMPTS_FILE" ]]; then
        grep -v "^$service:" "$RECOVERY_ATTEMPTS_FILE" > "${RECOVERY_ATTEMPTS_FILE}.tmp" 2>/dev/null || true
        mv "${RECOVERY_ATTEMPTS_FILE}.tmp" "$RECOVERY_ATTEMPTS_FILE"
    fi
}

# ================================
# Container Recovery Functions
# ================================
recover_container() {
    local container_name="$1"
    local service_description="$2"
    
    log_warn "Attempting to recover container: $container_name"
    
    # Try graceful restart first
    if docker restart "$container_name" >/dev/null 2>&1; then
        log_info "Successfully restarted container: $container_name"
        sleep 30  # Wait for service to stabilize
        return 0
    fi
    
    # If restart fails, try stop and start
    log_warn "Restart failed, trying stop/start for: $container_name"
    if docker stop "$container_name" >/dev/null 2>&1 && docker start "$container_name" >/dev/null 2>&1; then
        log_info "Successfully stopped/started container: $container_name"
        sleep 30
        return 0
    fi
    
    # If that fails, recreate from docker-compose
    log_warn "Stop/start failed, recreating from compose: $container_name"
    if cd "$SCRIPT_DIR/.." && docker-compose up -d "$container_name" >/dev/null 2>&1; then
        log_info "Successfully recreated container: $container_name"
        sleep 45
        return 0
    fi
    
    log_error "All recovery attempts failed for: $container_name"
    return 1
}

recover_database() {
    log_warn "Attempting database recovery"
    
    # Check if container is running
    if ! docker ps | grep -q ninu-database; then
        log_warn "Database container is down, attempting restart"
        recover_container "ninu-database" "PostgreSQL Database"
        return $?
    fi
    
    # Check database connectivity
    if docker exec ninu-database pg_isready -U ninu_user >/dev/null 2>&1; then
        log_info "Database is responding, issue may be transient"
        return 0
    fi
    
    # Try database restart within container
    log_warn "Database not responding, restarting PostgreSQL service"
    if docker exec ninu-database service postgresql restart >/dev/null 2>&1; then
        log_info "PostgreSQL service restarted successfully"
        sleep 20
        return 0
    fi
    
    # Last resort: container restart
    recover_container "ninu-database" "PostgreSQL Database"
}

recover_redis() {
    log_warn "Attempting Redis recovery"
    
    # Check if container is running
    if ! docker ps | grep -q ninu-redis; then
        log_warn "Redis container is down, attempting restart"
        recover_container "ninu-redis" "Redis Cache"
        return $?
    fi
    
    # Try Redis restart within container
    if docker exec ninu-redis redis-cli shutdown >/dev/null 2>&1; then
        sleep 5
        if docker start ninu-redis >/dev/null 2>&1; then
            log_info "Redis restarted successfully"
            return 0
        fi
    fi
    
    # Container restart
    recover_container "ninu-redis" "Redis Cache"
}

# ================================
# Notification Functions
# ================================
send_slack_alert() {
    local message="$1"
    local severity="$2"
    local color="danger"
    
    [[ "$severity" == "warning" ]] && color="warning"
    [[ "$severity" == "info" ]] && color="good"
    
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data @- <<EOF >/dev/null 2>&1 || true
{
    "attachments": [
        {
            "color": "$color",
            "title": "🏭 Ninu Factory Health Alert",
            "text": "$message",
            "footer": "Ninu Factory Health Monitor",
            "ts": $(date +%s)
        }
    ]
}
EOF
    fi
}

send_email_alert() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1 && [[ -n "$EMAIL_ALERTS" ]]; then
        echo "$message" | mail -s "$subject" "$EMAIL_ALERTS" >/dev/null 2>&1 || true
    fi
}

send_critical_alert() {
    local service="$1"
    local error="$2"
    local attempts="$3"
    
    local message="🚨 CRITICAL: Service $service is down after $attempts recovery attempts. Error: $error"
    
    log_critical "$message"
    send_slack_alert "$message" "critical"
    send_email_alert "CRITICAL: Ninu Factory Service Down" "$message"
}

# ================================
# Main Health Check Loop
# ================================
perform_health_checks() {
    local unhealthy_services=()
    
    for service_config in "${SERVICES[@]}"; do
        IFS=':' read -r service_host service_port service_path <<< "$service_config"
        
        local service_name="${service_host}"
        local result
        local status
        local response_time
        local error_detail=""
        
        # Determine check type and perform health check
        if [[ -n "$service_path" ]]; then
            # HTTP health check
            result=$(check_http_service "http://$service_host:$service_port$service_path")
        elif [[ "$service_host" == *"database"* ]]; then
            # Database health check
            result=$(check_database_service "$service_host" "$service_port")
        elif [[ "$service_host" == *"redis"* ]]; then
            # Redis health check
            result=$(check_redis_service "$service_host" "$service_port")
        else
            # Generic TCP check
            result=$(check_database_service "$service_host" "$service_port")
        fi
        
        # Parse result
        IFS=':' read -r status response_time error_detail <<< "$result"
        
        # Collect metrics
        collect_metrics "$service_name" "${response_time:-0}" "$status"
        
        if [[ "$status" != "healthy" ]]; then
            unhealthy_services+=("$service_name:$error_detail")
            log_warn "Service $service_name is unhealthy: $error_detail (${response_time}ms)"
            
            # Attempt recovery
            local attempts=$(increment_recovery_attempts "$service_name")
            
            if [[ $attempts -le $MAX_RECOVERY_ATTEMPTS ]]; then
                log_info "Attempting recovery for $service_name (attempt $attempts/$MAX_RECOVERY_ATTEMPTS)"
                
                # Perform appropriate recovery action
                case "$service_name" in
                    *database*)
                        recover_database
                        ;;
                    *redis*)
                        recover_redis
                        ;;
                    *frontend*)
                        recover_container "$service_name" "Frontend Application"
                        ;;
                    *loadbalancer*)
                        recover_container "ninu-loadbalancer" "Load Balancer"
                        ;;
                    *)
                        log_warn "No specific recovery procedure for $service_name"
                        ;;
                esac
            else
                send_critical_alert "$service_name" "$error_detail" "$attempts"
            fi
        else
            log_info "Service $service_name is healthy (${response_time}ms)"
            reset_recovery_attempts "$service_name"
        fi
    done
    
    # Overall health summary
    if [[ ${#unhealthy_services[@]} -eq 0 ]]; then
        log_info "All services are healthy"
    else
        log_warn "Unhealthy services: ${unhealthy_services[*]}"
    fi
}

# ================================
# System Resource Monitoring
# ================================
check_system_resources() {
    # Check disk space
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 85 ]]; then
        log_warn "High disk usage: ${disk_usage}%"
        send_slack_alert "⚠️ High disk usage: ${disk_usage}%" "warning"
    fi
    
    # Check memory usage
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $mem_usage -gt 90 ]]; then
        log_warn "High memory usage: ${mem_usage}%"
        send_slack_alert "⚠️ High memory usage: ${mem_usage}%" "warning"
    fi
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_percentage=$(echo "$cpu_load $cpu_cores" | awk '{printf "%.0f", ($1/$2)*100}')
    
    if [[ $load_percentage -gt 80 ]]; then
        log_warn "High CPU load: ${load_percentage}% (load: $cpu_load)"
        send_slack_alert "⚠️ High CPU load: ${load_percentage}%" "warning"
    fi
}

# ================================
# Main Execution
# ================================
main() {
    # Create necessary directories
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$METRICS_FILE")"
    
    log_info "Starting Ninu Factory Health Monitor"
    
    # Trap signals for graceful shutdown
    trap 'log_info "Health monitor shutting down"; exit 0' SIGTERM SIGINT
    
    while true; do
        perform_health_checks
        check_system_resources
        
        # Wait for next check
        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi