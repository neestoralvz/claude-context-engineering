#!/bin/bash

# Script de Migración Automática de Comandos Claude
# Migra comandos de docs/commands/ a ~/.claude/commands/ y elimina comandos locales

set -euo pipefail

# Configuración
SCRIPT_NAME="migrate-commands-to-global.sh"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/docs/commands"
LOCAL_CLAUDE_DIR="$PROJECT_ROOT/.claude"
GLOBAL_CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude/backups/migration-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/scripts/results/migration/migration-$(date +%Y%m%d-%H%M%S).log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Función de verificación de prerrequisitos
verify_prerequisites() {
    info "🔍 Verificando prerrequisitos..."
    
    # Crear directorio de logs si no existe
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Verificar que existe el directorio fuente
    if [[ ! -d "$SOURCE_DIR" ]]; then
        error "❌ Directorio fuente no encontrado: $SOURCE_DIR"
        exit 1
    fi
    
    # Verificar que existe el directorio global de Claude
    if [[ ! -d "$GLOBAL_CLAUDE_DIR" ]]; then
        error "❌ Directorio global de Claude no encontrado: $GLOBAL_CLAUDE_DIR"
        error "   Instale Claude Code primero"
        exit 1
    fi
    
    # Contar comandos fuente
    local source_count=$(find "$SOURCE_DIR" -name "*.md" -type f | wc -l)
    info "📊 Comandos encontrados en $SOURCE_DIR: $source_count"
    
    # Verificar comandos locales
    if [[ -d "$LOCAL_CLAUDE_DIR/commands" ]]; then
        local local_count=$(find "$LOCAL_CLAUDE_DIR/commands" -name "*.md" -type f | wc -l)
        info "📊 Comandos locales encontrados: $local_count"
    else
        info "📊 No hay comandos locales (.claude/commands no existe)"
    fi
    
    success "✅ Prerrequisitos verificados"
}

# Función de backup
create_backup() {
    info "💾 Creando backup en $BACKUP_DIR..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup de ~/.claude/commands si existe
    if [[ -d "$GLOBAL_CLAUDE_DIR/commands" ]]; then
        cp -r "$GLOBAL_CLAUDE_DIR/commands" "$BACKUP_DIR/global-commands-backup"
        info "✅ Backup de comandos globales creado"
    fi
    
    # Backup de ~/.claude/config si existe
    if [[ -d "$GLOBAL_CLAUDE_DIR/config" ]]; then
        cp -r "$GLOBAL_CLAUDE_DIR/config" "$BACKUP_DIR/global-config-backup"
        info "✅ Backup de configuración global creada"
    fi
    
    # Backup de comandos locales si existen
    if [[ -d "$LOCAL_CLAUDE_DIR/commands" ]]; then
        cp -r "$LOCAL_CLAUDE_DIR/commands" "$BACKUP_DIR/local-commands-backup"
        info "✅ Backup de comandos locales creado"
    fi
    
    # Backup de configuración local si existe
    if [[ -d "$LOCAL_CLAUDE_DIR/config" ]]; then
        cp -r "$LOCAL_CLAUDE_DIR/config" "$BACKUP_DIR/local-config-backup"
        info "✅ Backup de configuración local creada"
    fi
    
    # Crear archivo de información del backup
    cat > "$BACKUP_DIR/backup-info.txt" <<EOF
Backup de Migración de Comandos Claude
=====================================
Fecha: $(date)
Script: $SCRIPT_NAME
Proyecto: $PROJECT_ROOT

Directorios respaldados:
- Global commands: $(ls -d "$BACKUP_DIR/global-commands-backup" 2>/dev/null || echo "No existe")
- Global config: $(ls -d "$BACKUP_DIR/global-config-backup" 2>/dev/null || echo "No existe")
- Local commands: $(ls -d "$BACKUP_DIR/local-commands-backup" 2>/dev/null || echo "No existe")
- Local config: $(ls -d "$BACKUP_DIR/local-config-backup" 2>/dev/null || echo "No existe")

Para restaurar:
cp -r "$BACKUP_DIR/global-commands-backup" "$GLOBAL_CLAUDE_DIR/commands"
cp -r "$BACKUP_DIR/global-config-backup" "$GLOBAL_CLAUDE_DIR/config"
EOF
    
    success "✅ Backup completo creado en: $BACKUP_DIR"
}

# Función de migración de comandos
migrate_commands() {
    info "🚀 Iniciando migración de comandos..."
    
    # Crear directorio de comandos globales si no existe
    mkdir -p "$GLOBAL_CLAUDE_DIR/commands"
    
    # Copiar todos los comandos de docs/commands a ~/.claude/commands
    info "📂 Copiando comandos de $SOURCE_DIR a $GLOBAL_CLAUDE_DIR/commands..."
    
    # Usar rsync para preservar estructura y timestamps
    if command -v rsync &> /dev/null; then
        rsync -av --progress "$SOURCE_DIR/" "$GLOBAL_CLAUDE_DIR/commands/"
    else
        cp -r "$SOURCE_DIR/"* "$GLOBAL_CLAUDE_DIR/commands/"
    fi
    
    # Verificar la copia
    local copied_count=$(find "$GLOBAL_CLAUDE_DIR/commands" -name "*.md" -type f | wc -l)
    success "✅ Migración de comandos completada: $copied_count archivos copiados"
}

# Función de migración de configuración
migrate_configuration() {
    info "⚙️ Migrando configuración..."
    
    # Crear directorio de configuración global si no existe
    mkdir -p "$GLOBAL_CLAUDE_DIR/config"
    
    # Migrar command-registry.json si existe
    if [[ -f "$LOCAL_CLAUDE_DIR/config/command-registry.json" ]]; then
        info "📋 Migrando command-registry.json..."
        cp "$LOCAL_CLAUDE_DIR/config/command-registry.json" "$GLOBAL_CLAUDE_DIR/config/"
        success "✅ Registry de comandos migrado"
    else
        warn "⚠️ No se encontró command-registry.json local"
    fi
    
    # Migrar otros archivos de configuración
    if [[ -d "$LOCAL_CLAUDE_DIR/config" ]]; then
        for config_file in "$LOCAL_CLAUDE_DIR/config"/*; do
            if [[ -f "$config_file" && ! "$config_file" =~ command-registry\.json$ ]]; then
                local basename=$(basename "$config_file")
                info "📄 Migrando $basename..."
                cp "$config_file" "$GLOBAL_CLAUDE_DIR/config/"
            fi
        done
    fi
    
    success "✅ Configuración migrada"
}

# Función de limpieza de archivos locales
cleanup_local_files() {
    info "🧹 Limpiando archivos locales..."
    
    # Eliminar directorio de comandos locales
    if [[ -d "$LOCAL_CLAUDE_DIR/commands" ]]; then
        info "🗑️ Eliminando $LOCAL_CLAUDE_DIR/commands..."
        rm -rf "$LOCAL_CLAUDE_DIR/commands"
        success "✅ Comandos locales eliminados"
    fi
    
    # Eliminar directorio de configuración local
    if [[ -d "$LOCAL_CLAUDE_DIR/config" ]]; then
        info "🗑️ Eliminando $LOCAL_CLAUDE_DIR/config..."
        rm -rf "$LOCAL_CLAUDE_DIR/config"
        success "✅ Configuración local eliminada"
    fi
    
    # Eliminar directorio .claude si está vacío
    if [[ -d "$LOCAL_CLAUDE_DIR" && -z "$(ls -A "$LOCAL_CLAUDE_DIR")" ]]; then
        info "🗑️ Eliminando directorio .claude vacío..."
        rmdir "$LOCAL_CLAUDE_DIR"
        success "✅ Directorio .claude eliminado"
    elif [[ -d "$LOCAL_CLAUDE_DIR" ]]; then
        info "📁 Directorio .claude conservado (contiene otros archivos)"
        ls -la "$LOCAL_CLAUDE_DIR"
    fi
}

# Función de verificación post-migración
verify_migration() {
    info "🔍 Verificando migración..."
    
    # Verificar que existen los comandos globales
    if [[ ! -d "$GLOBAL_CLAUDE_DIR/commands" ]]; then
        error "❌ Error: Directorio de comandos globales no existe"
        return 1
    fi
    
    local global_count=$(find "$GLOBAL_CLAUDE_DIR/commands" -name "*.md" -type f | wc -l)
    info "📊 Comandos globales después de migración: $global_count"
    
    # Verificar que no existen comandos locales
    if [[ -d "$LOCAL_CLAUDE_DIR/commands" ]]; then
        warn "⚠️ Advertencia: Aún existen comandos locales"
        return 1
    else
        success "✅ Comandos locales eliminados correctamente"
    fi
    
    # Verificar configuración global
    if [[ -f "$GLOBAL_CLAUDE_DIR/config/command-registry.json" ]]; then
        success "✅ Registry de comandos disponible globalmente"
    else
        warn "⚠️ Registry de comandos no encontrado en ubicación global"
    fi
    
    # Verificar algunos comandos específicos
    local sample_commands=("ce.md" "thinking.md" "decision.md")
    for cmd in "${sample_commands[@]}"; do
        if find "$GLOBAL_CLAUDE_DIR/commands" -name "$cmd" -type f | grep -q .; then
            success "✅ Comando de muestra encontrado: $cmd"
        else
            warn "⚠️ Comando de muestra no encontrado: $cmd"
        fi
    done
    
    success "✅ Verificación completada"
}

# Función de rollback
rollback() {
    error "🔄 Iniciando rollback..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        error "❌ Error: Directorio de backup no encontrado: $BACKUP_DIR"
        exit 1
    fi
    
    # Restaurar comandos globales
    if [[ -d "$BACKUP_DIR/global-commands-backup" ]]; then
        rm -rf "$GLOBAL_CLAUDE_DIR/commands"
        cp -r "$BACKUP_DIR/global-commands-backup" "$GLOBAL_CLAUDE_DIR/commands"
        info "✅ Comandos globales restaurados"
    fi
    
    # Restaurar configuración global
    if [[ -d "$BACKUP_DIR/global-config-backup" ]]; then
        rm -rf "$GLOBAL_CLAUDE_DIR/config"
        cp -r "$BACKUP_DIR/global-config-backup" "$GLOBAL_CLAUDE_DIR/config"
        info "✅ Configuración global restaurada"
    fi
    
    # Restaurar comandos locales
    if [[ -d "$BACKUP_DIR/local-commands-backup" ]]; then
        mkdir -p "$LOCAL_CLAUDE_DIR"
        cp -r "$BACKUP_DIR/local-commands-backup" "$LOCAL_CLAUDE_DIR/commands"
        info "✅ Comandos locales restaurados"
    fi
    
    # Restaurar configuración local
    if [[ -d "$BACKUP_DIR/local-config-backup" ]]; then
        mkdir -p "$LOCAL_CLAUDE_DIR"
        cp -r "$BACKUP_DIR/local-config-backup" "$LOCAL_CLAUDE_DIR/config"
        info "✅ Configuración local restaurada"
    fi
    
    success "✅ Rollback completado"
}

# Función de reporte final
generate_report() {
    local status="$1"
    local report_file="$PROJECT_ROOT/scripts/results/migration/migration-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p "$(dirname "$report_file")"
    
    cat > "$report_file" <<EOF
# Reporte de Migración de Comandos Claude

**Estado**: $status  
**Fecha**: $(date)  
**Script**: $SCRIPT_NAME  
**Proyecto**: $PROJECT_ROOT  

## Resumen de Operaciones

### Directorios Procesados
- **Fuente**: $SOURCE_DIR
- **Destino Global**: $GLOBAL_CLAUDE_DIR/commands
- **Backup**: $BACKUP_DIR

### Estadísticas
- **Comandos Migrados**: $(find "$GLOBAL_CLAUDE_DIR/commands" -name "*.md" -type f 2>/dev/null | wc -l)
- **Comandos Locales Restantes**: $(find "$LOCAL_CLAUDE_DIR/commands" -name "*.md" -type f 2>/dev/null | wc -l || echo "0")

### Archivos de Log
- **Log Principal**: $LOG_FILE
- **Backup Info**: $BACKUP_DIR/backup-info.txt

### Verificación Post-Migración
$(if [[ "$status" == "ÉXITO" ]]; then
echo "✅ Comandos accesibles globalmente"
echo "✅ Comandos locales eliminados"
echo "✅ Configuración migrada"
else
echo "❌ Migración falló - ver logs para detalles"
fi)

## Uso de Comandos Post-Migración

Los comandos ahora están disponibles globalmente desde cualquier proyecto.
Para verificar disponibilidad, use:

\`\`\`bash
ls ~/.claude/commands/
\`\`\`

Para usar un comando específico:
\`\`\`bash
/ce [objetivo]
/thinking
/decision
\`\`\`

## Restauración (Si es Necesaria)

Para restaurar el estado anterior:
\`\`\`bash
$0 --rollback
\`\`\`

EOF

    info "📄 Reporte generado: $report_file"
}

# Función principal
main() {
    local start_time=$(date +%s)
    
    info "🚀 Iniciando migración de comandos Claude a ubicación global"
    info "📁 Proyecto: $PROJECT_ROOT"
    info "📁 Fuente: $SOURCE_DIR"
    info "📁 Destino: $GLOBAL_CLAUDE_DIR/commands"
    
    # Manejar parámetros de línea de comandos
    if [[ "${1:-}" == "--rollback" ]]; then
        rollback
        exit 0
    fi
    
    # Trap para manejar errores
    trap 'error "❌ Error durante la migración. Ejecute $0 --rollback para revertir"; exit 1' ERR
    
    # Ejecutar pasos de migración
    verify_prerequisites
    create_backup
    migrate_commands
    migrate_configuration
    cleanup_local_files
    verify_migration
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "🎉 Migración completada exitosamente en ${duration}s"
    generate_report "ÉXITO"
    
    info "📋 Próximos pasos:"
    info "   1. Verifique que los comandos funcionan: /ce --help"
    info "   2. Pruebe comandos desde cualquier proyecto"
    info "   3. El backup está disponible en: $BACKUP_DIR"
}

# Verificar que no se ejecute como root
if [[ $EUID -eq 0 ]]; then
    error "❌ No ejecute este script como root"
    exit 1
fi

# Ejecutar función principal con todos los argumentos
main "$@"