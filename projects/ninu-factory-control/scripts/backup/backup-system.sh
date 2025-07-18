#!/bin/bash

# Comprehensive Backup and Disaster Recovery System for Ninu Factory Control
# Enterprise-grade backup with encryption, compression, and cloud storage

set -euo pipefail

# ================================
# Configuration
# ================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_BASE_DIR="/var/backups/ninu-factory"
LOG_FILE="/var/log/ninu-factory/backup.log"
RETENTION_DAYS=30
RETENTION_WEEKS=12
RETENTION_MONTHS=12

# Database configuration
DB_HOST="${DB_HOST:-ninu-database}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ninu_factory}"
DB_USER="${DB_USER:-ninu_user}"
PGPASSWORD="${POSTGRES_PASSWORD}"

# Encryption configuration
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-/etc/ninu-factory/backup.key}"
GPG_RECIPIENT="${GPG_RECIPIENT:-backup@ninu-factory.com}"

# Cloud storage configuration
S3_BUCKET="${S3_BUCKET:-ninu-factory-backups}"
S3_REGION="${S3_REGION:-us-east-1}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

# Notification configuration
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
EMAIL_ALERTS="${EMAIL_ALERTS:-admin@ninu-factory.com}"

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
log_success() { log "SUCCESS" "$@"; }

# ================================
# Utility Functions
# ================================
ensure_directory() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    fi
}

generate_timestamp() {
    date '+%Y%m%d_%H%M%S'
}

calculate_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        du -h "$file" | cut -f1
    else
        echo "0B"
    fi
}

send_notification() {
    local title="$1"
    local message="$2"
    local status="${3:-info}"
    
    # Slack notification
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        local color="good"
        [[ "$status" == "error" ]] && color="danger"
        [[ "$status" == "warning" ]] && color="warning"
        
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data @- <<EOF >/dev/null 2>&1 || true
{
    "attachments": [
        {
            "color": "$color",
            "title": "🏭 $title",
            "text": "$message",
            "footer": "Ninu Factory Backup System",
            "ts": $(date +%s)
        }
    ]
}
EOF
    fi
    
    # Email notification
    if command -v mail >/dev/null 2>&1 && [[ -n "$EMAIL_ALERTS" ]]; then
        echo "$message" | mail -s "$title" "$EMAIL_ALERTS" >/dev/null 2>&1 || true
    fi
}

# ================================
# Database Backup Functions
# ================================
backup_database() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting database backup"
    
    local db_backup_file="$backup_dir/database_${timestamp}.sql"
    local db_compressed_file="$db_backup_file.gz"
    local db_encrypted_file="$db_compressed_file.gpg"
    
    # Check database connectivity
    if ! docker exec ninu-database pg_isready -h localhost -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        log_error "Database is not accessible"
        return 1
    fi
    
    # Create database dump
    log_info "Creating database dump"
    if docker exec ninu-database pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --no-owner --no-privileges > "$db_backup_file" 2>>"$LOG_FILE"; then
        log_success "Database dump created: $(calculate_size "$db_backup_file")"
    else
        log_error "Failed to create database dump"
        return 1
    fi
    
    # Compress the dump
    log_info "Compressing database dump"
    if gzip "$db_backup_file"; then
        log_success "Database dump compressed: $(calculate_size "$db_compressed_file")"
    else
        log_error "Failed to compress database dump"
        return 1
    fi
    
    # Encrypt the compressed dump
    if [[ -f "$ENCRYPTION_KEY_FILE" ]] || command -v gpg >/dev/null 2>&1; then
        log_info "Encrypting database dump"
        if gpg --trust-model always --encrypt -r "$GPG_RECIPIENT" \
            --output "$db_encrypted_file" "$db_compressed_file" 2>>"$LOG_FILE"; then
            log_success "Database dump encrypted: $(calculate_size "$db_encrypted_file")"
            rm -f "$db_compressed_file"  # Remove unencrypted version
        else
            log_warn "Failed to encrypt database dump, keeping compressed version"
        fi
    fi
    
    echo "$db_encrypted_file"
}

# ================================
# Application Data Backup Functions
# ================================
backup_application_data() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting application data backup"
    
    local app_backup_file="$backup_dir/application_data_${timestamp}.tar.gz"
    local app_encrypted_file="$app_backup_file.gpg"
    
    # Directories to backup
    local backup_paths=(
        "$SCRIPT_DIR/../../uploads"
        "$SCRIPT_DIR/../../logs"
        "$SCRIPT_DIR/../../data"
        "$SCRIPT_DIR/../../config"
    )
    
    # Create tar archive of application data
    log_info "Creating application data archive"
    local tar_paths=""
    for path in "${backup_paths[@]}"; do
        if [[ -d "$path" ]]; then
            tar_paths="$tar_paths $path"
        fi
    done
    
    if [[ -n "$tar_paths" ]]; then
        if tar -czf "$app_backup_file" $tar_paths 2>>"$LOG_FILE"; then
            log_success "Application data archived: $(calculate_size "$app_backup_file")"
        else
            log_error "Failed to create application data archive"
            return 1
        fi
    else
        log_warn "No application data directories found to backup"
        touch "$app_backup_file"
    fi
    
    # Encrypt the archive
    if command -v gpg >/dev/null 2>&1; then
        log_info "Encrypting application data archive"
        if gpg --trust-model always --encrypt -r "$GPG_RECIPIENT" \
            --output "$app_encrypted_file" "$app_backup_file" 2>>"$LOG_FILE"; then
            log_success "Application data encrypted: $(calculate_size "$app_encrypted_file")"
            rm -f "$app_backup_file"
        else
            log_warn "Failed to encrypt application data"
        fi
    fi
    
    echo "$app_encrypted_file"
}

# ================================
# Docker Configuration Backup
# ================================
backup_docker_config() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting Docker configuration backup"
    
    local docker_backup_file="$backup_dir/docker_config_${timestamp}.tar.gz"
    
    # Backup Docker compose files and configurations
    local docker_paths=(
        "$SCRIPT_DIR/../../docker-compose.yml"
        "$SCRIPT_DIR/../../docker-compose.prod.yml"
        "$SCRIPT_DIR/../../Dockerfile"
        "$SCRIPT_DIR/../../nginx"
        "$SCRIPT_DIR/../../monitoring"
        "$SCRIPT_DIR/../../haproxy"
        "$SCRIPT_DIR/../../database/init"
    )
    
    local existing_paths=""
    for path in "${docker_paths[@]}"; do
        if [[ -e "$path" ]]; then
            existing_paths="$existing_paths $path"
        fi
    done
    
    if [[ -n "$existing_paths" ]]; then
        if tar -czf "$docker_backup_file" $existing_paths 2>>"$LOG_FILE"; then
            log_success "Docker configuration backed up: $(calculate_size "$docker_backup_file")"
        else
            log_error "Failed to backup Docker configuration"
            return 1
        fi
    else
        log_warn "No Docker configuration files found"
        return 1
    fi
    
    echo "$docker_backup_file"
}

# ================================
# Cloud Upload Functions
# ================================
upload_to_s3() {
    local file="$1"
    local s3_key="$2"
    
    if [[ -z "$AWS_ACCESS_KEY_ID" ]] || [[ -z "$AWS_SECRET_ACCESS_KEY" ]]; then
        log_warn "AWS credentials not configured, skipping S3 upload"
        return 0
    fi
    
    if ! command -v aws >/dev/null 2>&1; then
        log_warn "AWS CLI not installed, skipping S3 upload"
        return 0
    fi
    
    log_info "Uploading to S3: s3://$S3_BUCKET/$s3_key"
    
    if aws s3 cp "$file" "s3://$S3_BUCKET/$s3_key" \
        --region "$S3_REGION" \
        --storage-class STANDARD_IA \
        --metadata "backup-date=$(date -Iseconds),source=ninu-factory" \
        2>>"$LOG_FILE"; then
        log_success "Successfully uploaded to S3"
        return 0
    else
        log_error "Failed to upload to S3"
        return 1
    fi
}

# ================================
# Cleanup Functions
# ================================
cleanup_old_backups() {
    local backup_type="$1"
    local base_dir="$BACKUP_BASE_DIR/$backup_type"
    
    if [[ ! -d "$base_dir" ]]; then
        return 0
    fi
    
    log_info "Cleaning up old $backup_type backups"
    
    # Daily backups - keep for RETENTION_DAYS
    find "$base_dir/daily" -name "*.gz*" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Weekly backups - keep for RETENTION_WEEKS weeks
    find "$base_dir/weekly" -name "*.gz*" -mtime +$((RETENTION_WEEKS * 7)) -delete 2>/dev/null || true
    
    # Monthly backups - keep for RETENTION_MONTHS months
    find "$base_dir/monthly" -name "*.gz*" -mtime +$((RETENTION_MONTHS * 30)) -delete 2>/dev/null || true
    
    log_info "Cleanup completed for $backup_type backups"
}

# ================================
# Main Backup Function
# ================================
perform_backup() {
    local backup_type="${1:-daily}"  # daily, weekly, monthly
    local timestamp=$(generate_timestamp)
    
    log_info "Starting $backup_type backup at $timestamp"
    
    # Create backup directories
    local backup_dir="$BACKUP_BASE_DIR/$backup_type/$(date '+%Y/%m')"
    ensure_directory "$backup_dir"
    
    # Initialize backup summary
    local backup_summary=""
    local backup_files=()
    local total_size=0
    local start_time=$(date +%s)
    local backup_success=true
    
    # Database backup
    if db_file=$(backup_database "$backup_dir" "$timestamp"); then
        backup_files+=("$db_file")
        backup_summary="$backup_summary\n✅ Database: $(calculate_size "$db_file")"
        
        # Upload to cloud
        upload_to_s3 "$db_file" "$backup_type/$(date '+%Y/%m')/database_${timestamp}.sql.gz.gpg"
    else
        backup_summary="$backup_summary\n❌ Database: FAILED"
        backup_success=false
    fi
    
    # Application data backup
    if app_file=$(backup_application_data "$backup_dir" "$timestamp"); then
        backup_files+=("$app_file")
        backup_summary="$backup_summary\n✅ Application Data: $(calculate_size "$app_file")"
        
        # Upload to cloud
        upload_to_s3 "$app_file" "$backup_type/$(date '+%Y/%m')/application_data_${timestamp}.tar.gz.gpg"
    else
        backup_summary="$backup_summary\n❌ Application Data: FAILED"
        backup_success=false
    fi
    
    # Docker configuration backup
    if docker_file=$(backup_docker_config "$backup_dir" "$timestamp"); then
        backup_files+=("$docker_file")
        backup_summary="$backup_summary\n✅ Docker Config: $(calculate_size "$docker_file")"
        
        # Upload to cloud
        upload_to_s3 "$docker_file" "$backup_type/$(date '+%Y/%m')/docker_config_${timestamp}.tar.gz"
    else
        backup_summary="$backup_summary\n❌ Docker Config: FAILED"
    fi
    
    # Create backup manifest
    local manifest_file="$backup_dir/backup_manifest_${timestamp}.json"
    cat > "$manifest_file" <<EOF
{
    "backup_type": "$backup_type",
    "timestamp": "$timestamp",
    "date": "$(date -Iseconds)",
    "files": [
$(for file in "${backup_files[@]}"; do
    echo "        {\"path\": \"$file\", \"size\": \"$(calculate_size "$file")\"},"
done | sed '$ s/,$//')
    ],
    "success": $backup_success
}
EOF
    
    # Calculate total backup time and size
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    for file in "${backup_files[@]}"; do
        if [[ -f "$file" ]]; then
            local size_bytes=$(stat -c%s "$file" 2>/dev/null || echo "0")
            total_size=$((total_size + size_bytes))
        fi
    done
    
    local total_size_human=$(numfmt --to=iec "$total_size" 2>/dev/null || echo "${total_size}B")
    
    # Log completion
    if $backup_success; then
        log_success "$backup_type backup completed in ${duration}s, total size: $total_size_human"
        send_notification "Backup Completed" "✅ $backup_type backup successful\nDuration: ${duration}s\nTotal size: $total_size_human$backup_summary" "success"
    else
        log_error "$backup_type backup completed with errors in ${duration}s"
        send_notification "Backup Failed" "❌ $backup_type backup completed with errors\nDuration: ${duration}s$backup_summary" "error"
    fi
    
    # Cleanup old backups
    cleanup_old_backups "database"
    cleanup_old_backups "application"
    cleanup_old_backups "docker"
    
    return $([[ "$backup_success" == "true" ]] && echo 0 || echo 1)
}

# ================================
# Restore Functions
# ================================
restore_database() {
    local backup_file="$1"
    
    log_info "Starting database restore from: $backup_file"
    
    # Decrypt if needed
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gpg ]]; then
        local decrypted_file="${backup_file%.gpg}"
        log_info "Decrypting backup file"
        if gpg --decrypt --output "$decrypted_file" "$backup_file" 2>>"$LOG_FILE"; then
            restore_file="$decrypted_file"
        else
            log_error "Failed to decrypt backup file"
            return 1
        fi
    fi
    
    # Decompress if needed
    if [[ "$restore_file" == *.gz ]]; then
        log_info "Decompressing backup file"
        if gunzip "$restore_file"; then
            restore_file="${restore_file%.gz}"
        else
            log_error "Failed to decompress backup file"
            return 1
        fi
    fi
    
    # Perform restore
    log_info "Restoring database"
    if docker exec -i ninu-database psql -U "$DB_USER" -d "$DB_NAME" < "$restore_file" 2>>"$LOG_FILE"; then
        log_success "Database restore completed successfully"
        return 0
    else
        log_error "Database restore failed"
        return 1
    fi
}

# ================================
# Main Function
# ================================
main() {
    local command="${1:-backup}"
    
    # Create necessary directories
    ensure_directory "$(dirname "$LOG_FILE")"
    ensure_directory "$BACKUP_BASE_DIR"
    
    case "$command" in
        backup)
            local backup_type="${2:-daily}"
            perform_backup "$backup_type"
            ;;
        restore)
            local backup_file="$2"
            if [[ -z "$backup_file" ]]; then
                log_error "Backup file path required for restore"
                exit 1
            fi
            restore_database "$backup_file"
            ;;
        cleanup)
            cleanup_old_backups "database"
            cleanup_old_backups "application"
            cleanup_old_backups "docker"
            ;;
        *)
            echo "Usage: $0 {backup|restore|cleanup} [backup_type|backup_file]"
            echo "  backup_type: daily (default), weekly, monthly"
            exit 1
            ;;
    esac
}

# Export PGPASSWORD for database operations
export PGPASSWORD

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi