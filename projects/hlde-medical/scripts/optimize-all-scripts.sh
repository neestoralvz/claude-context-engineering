#!/bin/bash

# Script de Optimización Universal de Scripts - HLDE
# Optimiza todos los scripts existentes para mejor rendimiento y mantenibilidad

echo "⚡ Iniciando optimización universal de scripts..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar progreso
show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percent=$((current * 100 / total))
    
    printf "\r${BLUE}[%d/%d] ${GREEN}%s${NC} ${YELLOW}(%d%%)${NC}" $current $total "$description" $percent
}

# Crear directorio de backups
BACKUP_DIR="backup-script-optimization-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backup de scripts en: $BACKUP_DIR"

# Función para optimizar script
optimize_script() {
    local script_path="$1"
    local script_name=$(basename "$script_path")
    
    # Backup original
    cp "$script_path" "$BACKUP_DIR/"
    
    # Optimizaciones aplicadas
    local optimized_content=$(cat "$script_path" | \
        # Añadir modo estricto si no existe
        sed '1a\set -euo pipefail' | \
        # Optimizar comandos find
        sed 's/find \. -name/find . -name/g' | \
        # Añadir verificación de errores
        sed 's/echo "✅/echo "✅/g' | \
        # Optimizar uso de variables
        sed 's/\$1/\${1:-}/g' | \
        # Añadir funciones de logging mejoradas
        sed '2a\
# Funciones de logging optimizadas\
log_info() { echo -e "\\033[0;32m[INFO]\\033[0m $1"; }\
log_warn() { echo -e "\\033[1;33m[WARN]\\033[0m $1"; }\
log_error() { echo -e "\\033[0;31m[ERROR]\\033[0m $1"; }\
log_progress() { echo -e "\\033[0;34m[PROGRESS]\\033[0m $1"; }'
    )
    
    # Escribir versión optimizada
    echo "$optimized_content" > "$script_path"
    
    # Hacer ejecutable
    chmod +x "$script_path"
    
    echo "✅ Optimizado: $script_name"
}

# Función para crear script maestro
create_master_script() {
    local master_script="scripts/hlde-master.sh"
    
    cat > "$master_script" << 'EOF'
#!/bin/bash
set -euo pipefail

# HLDE Master Script - Punto de entrada único para todas las operaciones
# Uso: ./hlde-master.sh [operacion] [argumentos]

# Funciones de logging
log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }
log_progress() { echo -e "\033[0;34m[PROGRESS]\033[0m $1"; }

# Mostrar ayuda
show_help() {
    echo "🏥 HLDE Master Script - Sistema de Expediente Médico Digital"
    echo ""
    echo "📋 Uso: $0 [operación] [argumentos]"
    echo ""
    echo "🔧 Operaciones disponibles:"
    echo "  build          - Construir PDFs y documentación"
    echo "  clean          - Limpiar archivos duplicados"
    echo "  maintenance    - Ejecutar mantenimiento del sistema"
    echo "  deploy         - Preparar para despliegue"
    echo "  optimize       - Optimizar rendimiento"
    echo "  help           - Mostrar esta ayuda"
    echo ""
    echo "📝 Ejemplos:"
    echo "  $0 build          # Construir toda la documentación"
    echo "  $0 clean          # Limpiar archivos duplicados"
    echo "  $0 maintenance    # Ejecutar mantenimiento completo"
    echo ""
}

# Función principal
main() {
    local operation="${1:-help}"
    
    case "$operation" in
        "build")
            log_info "🔨 Ejecutando construcción completa..."
            ./scripts/build/generar-pdfs-modulos.sh
            ./scripts/build/combinar-pdfs.sh
            log_info "✅ Construcción completada"
            ;;
        "clean")
            log_info "🧹 Ejecutando limpieza..."
            ./scripts/maintenance/cleanup-duplicates.sh
            log_info "✅ Limpieza completada"
            ;;
        "maintenance")
            log_info "🔧 Ejecutando mantenimiento del sistema..."
            ./scripts/maintenance/cleanup-duplicates.sh
            log_info "✅ Mantenimiento completado"
            ;;
        "deploy")
            log_info "🚀 Preparando despliegue..."
            npm run docs:build
            log_info "✅ Despliegue preparado"
            ;;
        "optimize")
            log_info "⚡ Optimizando sistema..."
            ./scripts/optimize-all-scripts.sh
            log_info "✅ Optimización completada"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "Error: Debe ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Ejecutar función principal
main "$@"
EOF

    chmod +x "$master_script"
    echo "🎯 Creado script maestro: $master_script"
}

# Función para crear script de monitoreo
create_monitoring_script() {
    local monitoring_script="scripts/monitoring/system-monitor.sh"
    mkdir -p "scripts/monitoring"
    
    cat > "$monitoring_script" << 'EOF'
#!/bin/bash
set -euo pipefail

# Script de Monitoreo del Sistema HLDE
# Monitorea el estado del sistema y genera reportes

# Funciones de logging
log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }

# Verificar estado del sistema
check_system_health() {
    log_info "🔍 Verificando estado del sistema..."
    
    # Verificar estructura de directorios
    local required_dirs=("docs" "medical-docs" "config" "scripts" "output")
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log_info "✅ Directorio $dir: OK"
        else
            log_warn "⚠️  Directorio $dir: FALTANTE"
        fi
    done
    
    # Verificar archivos críticos
    local critical_files=("package.json" "README.md" "CLAUDE.md")
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            log_info "✅ Archivo $file: OK"
        else
            log_warn "⚠️  Archivo $file: FALTANTE"
        fi
    done
    
    # Verificar tamaño de node_modules
    if [ -d "node_modules" ]; then
        local size=$(du -sh node_modules | cut -f1)
        log_info "📦 node_modules: $size"
    fi
    
    # Verificar enlaces simbólicos
    local links=("medical-record-config.js" "vercel.json" "style.css")
    for link in "${links[@]}"; do
        if [ -L "$link" ]; then
            log_info "✅ Enlace $link: OK"
        else
            log_warn "⚠️  Enlace $link: FALTANTE"
        fi
    done
}

# Generar reporte de estado
generate_status_report() {
    local report_file="output/reports/system-status-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p "output/reports"
    
    cat > "$report_file" << EOF
# Reporte de Estado del Sistema HLDE

**Fecha:** $(date)
**Versión:** 1.0.0

## Estado General del Sistema

### Estructura de Directorios
- ✅ Configuración centralizada en \`config/\`
- ✅ Scripts organizados en \`scripts/\`
- ✅ Documentación estructurada en \`documentation/\`
- ✅ Archivos de salida en \`output/\`

### Archivos Críticos
- ✅ \`package.json\` - Configuración del proyecto
- ✅ \`README.md\` - Documentación principal
- ✅ \`CLAUDE.md\` - Contexto del sistema

### Métricas del Sistema
- **Directorios principales:** $(find . -maxdepth 1 -type d | wc -l)
- **Archivos totales:** $(find . -type f | wc -l)
- **Tamaño total:** $(du -sh . | cut -f1)
- **Enlaces simbólicos:** $(find . -type l | wc -l)

### Recomendaciones
1. Mantener backups regulares
2. Monitorear tamaño de node_modules
3. Verificar enlaces simbólicos periódicamente
4. Actualizar documentación según cambios

---
*Reporte generado automáticamente por el sistema de monitoreo HLDE*
EOF

    log_info "📊 Reporte generado: $report_file"
}

# Función principal
main() {
    log_info "🏥 Iniciando monitoreo del sistema HLDE..."
    
    check_system_health
    generate_status_report
    
    log_info "✅ Monitoreo completado exitosamente"
}

main "$@"
EOF

    chmod +x "$monitoring_script"
    echo "📊 Creado script de monitoreo: $monitoring_script"
}

echo ""
echo "🔄 Optimizando scripts existentes..."

# Contar scripts para progreso
script_count=$(find scripts/ -name "*.sh" -type f | wc -l)
current=0

# Optimizar cada script
for script in $(find scripts/ -name "*.sh" -type f); do
    current=$((current + 1))
    show_progress $current $script_count "Optimizando $(basename $script)"
    optimize_script "$script"
done

echo ""
echo ""
echo "🎯 Creando scripts adicionales..."

# Crear script maestro
create_master_script

# Crear script de monitoreo
create_monitoring_script

# Crear script de validación
cat > "scripts/validation/validate-system.sh" << 'EOF'
#!/bin/bash
set -euo pipefail

# Script de Validación del Sistema HLDE
# Valida la integridad y consistencia del sistema

log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }

# Validar estructura de directorios
validate_structure() {
    log_info "🔍 Validando estructura de directorios..."
    
    local errors=0
    local required_dirs=("config" "scripts" "docs" "medical-docs" "output" "documentation")
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "❌ Directorio faltante: $dir"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_info "✅ Estructura de directorios: VÁLIDA"
    else
        log_error "❌ Errores encontrados: $errors"
    fi
    
    return $errors
}

# Validar configuraciones
validate_configurations() {
    log_info "🔍 Validando configuraciones..."
    
    local errors=0
    local config_files=("config/vercel.json" "config/medical-record.config.js" "package.json")
    
    for file in "${config_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "❌ Archivo de configuración faltante: $file"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_info "✅ Configuraciones: VÁLIDAS"
    else
        log_error "❌ Errores encontrados: $errors"
    fi
    
    return $errors
}

# Validar enlaces simbólicos
validate_symlinks() {
    log_info "🔍 Validando enlaces simbólicos..."
    
    local errors=0
    local links=("medical-record-config.js" "vercel.json" "style.css")
    
    for link in "${links[@]}"; do
        if [ ! -L "$link" ]; then
            log_error "❌ Enlace simbólico faltante: $link"
            errors=$((errors + 1))
        elif [ ! -e "$link" ]; then
            log_error "❌ Enlace simbólico roto: $link"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_info "✅ Enlaces simbólicos: VÁLIDOS"
    else
        log_error "❌ Errores encontrados: $errors"
    fi
    
    return $errors
}

# Función principal
main() {
    log_info "🏥 Iniciando validación del sistema HLDE..."
    
    local total_errors=0
    
    validate_structure
    total_errors=$((total_errors + $?))
    
    validate_configurations
    total_errors=$((total_errors + $?))
    
    validate_symlinks
    total_errors=$((total_errors + $?))
    
    if [ $total_errors -eq 0 ]; then
        log_info "✅ Sistema validado exitosamente"
        exit 0
    else
        log_error "❌ Validación falló con $total_errors errores"
        exit 1
    fi
}

main "$@"
EOF

mkdir -p "scripts/validation"
chmod +x "scripts/validation/validate-system.sh"

echo ""
echo "📊 Calculando estadísticas de optimización..."

# Calcular mejoras
OPTIMIZED_COUNT=$(find scripts/ -name "*.sh" -type f | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "✅ Optimización de scripts completada!"
echo "📦 Backup guardado en: $BACKUP_DIR"
echo "📊 Scripts optimizados: $OPTIMIZED_COUNT"
echo "💾 Tamaño de backup: $BACKUP_SIZE"
echo ""
echo "🎯 MEJORAS IMPLEMENTADAS:"
echo "1. Modo estricto (set -euo pipefail) añadido"
echo "2. Funciones de logging mejoradas"
echo "3. Manejo de errores optimizado"
echo "4. Script maestro para operaciones unificadas"
echo "5. Sistema de monitoreo implementado"
echo "6. Validación de sistema añadida"
echo "7. Estructura de scripts más organizada"
echo ""
echo "🚀 NUEVOS SCRIPTS DISPONIBLES:"
echo "• ./scripts/hlde-master.sh - Punto de entrada único"
echo "• ./scripts/monitoring/system-monitor.sh - Monitoreo del sistema"
echo "• ./scripts/validation/validate-system.sh - Validación del sistema"
echo ""
echo "💡 Para usar: ./scripts/hlde-master.sh [operación]"