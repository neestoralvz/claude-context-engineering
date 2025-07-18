#!/bin/bash

# Script de Validación de Autocontención de Comandos
# Detecta violaciones del Principio #102: Command Autocontención Architecture

set -euo pipefail

# Configuración
SCRIPT_NAME="validate-command-autocontention.sh"
COMMANDS_DIR="$HOME/.claude/commands"
RESULTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/results/validation"
REPORT_FILE="$RESULTS_DIR/autocontention-validation-$(date +%Y%m%d-%H%M%S).json"
LOG_FILE="$RESULTS_DIR/autocontention-validation-$(date +%Y%m%d-%H%M%S).log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TOTAL_COMMANDS=0
VIOLATIONS_FOUND=0
COMMANDS_WITH_VIOLATIONS=0

# Arrays para almacenar resultados
declare -a VIOLATION_FILES=()
declare -a VIOLATION_DETAILS=()

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

# Función para verificar prerrequisitos
verify_prerequisites() {
    info "🔍 Verificando prerrequisitos..."
    
    # Crear directorio de resultados si no existe
    mkdir -p "$RESULTS_DIR"
    
    # Verificar que existe el directorio de comandos
    if [[ ! -d "$COMMANDS_DIR" ]]; then
        error "❌ Directorio de comandos no encontrado: $COMMANDS_DIR"
        exit 1
    fi
    
    # Contar comandos totales
    TOTAL_COMMANDS=$(find "$COMMANDS_DIR" -name "*.md" -type f | wc -l)
    info "📊 Total de comandos a validar: $TOTAL_COMMANDS"
    
    success "✅ Prerrequisitos verificados"
}

# Función para detectar referencias directas
detect_direct_references() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local violations=0
    
    # Buscar referencias directas a otros comandos
    while IFS= read -r line_num && IFS= read -r line_content; do
        if [[ -n "$line_content" ]]; then
            violations=$((violations + 1))
            VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
            
            VIOLATION_DETAILS+=("{")
            VIOLATION_DETAILS+=("  \"file\": \"$relative_path\",")
            VIOLATION_DETAILS+=("  \"line\": $line_num,")
            VIOLATION_DETAILS+=("  \"type\": \"direct_reference\",")
            VIOLATION_DETAILS+=("  \"content\": \"$(echo "$line_content" | sed 's/"/\\"/g')\",")
            VIOLATION_DETAILS+=("  \"severity\": \"high\"")
            VIOLATION_DETAILS+=("}")
            
            warn "🔗 Referencia directa en $relative_path:$line_num"
            warn "   $line_content"
        fi
    done < <(grep -n '\[.*\](\.\/.*\.md)' "$file" 2>/dev/null | sed 's/:/ /' | while read -r num content; do echo "$num"; echo "$content"; done)
    
    return $violations
}

# Función para detectar declaraciones de herencia
detect_inheritance() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local violations=0
    
    # Patrones de herencia
    local inheritance_patterns=(
        "Inheritance.*from"
        "inherits.*from"
        "extends.*from"
        "MANDATORY.*Inheritance"
        "Automatic.*Inheritance"
    )
    
    for pattern in "${inheritance_patterns[@]}"; do
        while IFS= read -r line_num && IFS= read -r line_content; do
            if [[ -n "$line_content" ]]; then
                violations=$((violations + 1))
                VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
                
                VIOLATION_DETAILS+=("{")
                VIOLATION_DETAILS+=("  \"file\": \"$relative_path\",")
                VIOLATION_DETAILS+=("  \"line\": $line_num,")
                VIOLATION_DETAILS+=("  \"type\": \"inheritance_declaration\",")
                VIOLATION_DETAILS+=("  \"pattern\": \"$pattern\",")
                VIOLATION_DETAILS+=("  \"content\": \"$(echo "$line_content" | sed 's/"/\\"/g')\",")
                VIOLATION_DETAILS+=("  \"severity\": \"critical\"")
                VIOLATION_DETAILS+=("}")
                
                error "⚠️ Declaración de herencia en $relative_path:$line_num"
                error "   Patrón: $pattern"
                error "   $line_content"
            fi
        done < <(grep -in "$pattern" "$file" 2>/dev/null | sed 's/:/ /' | while read -r num content; do echo "$num"; echo "$content"; done)
    done
    
    return $violations
}

# Función para detectar imports
detect_imports() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local violations=0
    
    # Patrones de imports
    local import_patterns=(
        "@\\./"
        "import.*from"
        "include.*from"
        "require.*from"
    )
    
    for pattern in "${import_patterns[@]}"; do
        while IFS= read -r line_num && IFS= read -r line_content; do
            if [[ -n "$line_content" ]]; then
                violations=$((violations + 1))
                VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
                
                VIOLATION_DETAILS+=("{")
                VIOLATION_DETAILS+=("  \"file\": \"$relative_path\",")
                VIOLATION_DETAILS+=("  \"line\": $line_num,")
                VIOLATION_DETAILS+=("  \"type\": \"import_statement\",")
                VIOLATION_DETAILS+=("  \"pattern\": \"$pattern\",")
                VIOLATION_DETAILS+=("  \"content\": \"$(echo "$line_content" | sed 's/"/\\"/g')\",")
                VIOLATION_DETAILS+=("  \"severity\": \"high\"")
                VIOLATION_DETAILS+=("}")
                
                warn "📥 Import detectado en $relative_path:$line_num"
                warn "   Patrón: $pattern"
                warn "   $line_content"
            fi
        done < <(grep -in "$pattern" "$file" 2>/dev/null | sed 's/:/ /' | while read -r num content; do echo "$num"; echo "$content"; done)
    done
    
    return $violations
}

# Función para detectar dependencias de scripts
detect_script_dependencies() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local violations=0
    
    # Patrones de dependencias de scripts
    local script_patterns=(
        "scripts/"
        "\\.\\./scripts"
        "\\./scripts"
        "bash.*scripts/"
        "sh.*scripts/"
        "\\.sh"
    )
    
    for pattern in "${script_patterns[@]}"; do
        while IFS= read -r line_num && IFS= read -r line_content; do
            if [[ -n "$line_content" ]]; then
                violations=$((violations + 1))
                VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
                
                VIOLATION_DETAILS+=("{")
                VIOLATION_DETAILS+=("  \"file\": \"$relative_path\",")
                VIOLATION_DETAILS+=("  \"line\": $line_num,")
                VIOLATION_DETAILS+=("  \"type\": \"script_dependency\",")
                VIOLATION_DETAILS+=("  \"pattern\": \"$pattern\",")
                VIOLATION_DETAILS+=("  \"content\": \"$(echo "$line_content" | sed 's/"/\\"/g')\",")
                VIOLATION_DETAILS+=("  \"severity\": \"critical\"")
                VIOLATION_DETAILS+=("}")
                
                error "🚫 Dependencia de script en $relative_path:$line_num"
                error "   Patrón: $pattern"
                error "   $line_content"
            fi
        done < <(grep -in "$pattern" "$file" 2>/dev/null | sed 's/:/ /' | while read -r num content; do echo "$num"; echo "$content"; done)
    done
    
    return $violations
}

# Función para detectar herramientas no-globales
detect_non_global_tools() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local violations=0
    
    # Patrones de herramientas no-globales (referencias a binarios específicos de proyecto)
    local non_global_patterns=(
        "\\./bin/"
        "\\./node_modules/"
        "python.*\\./"
        "node.*\\./"
        "\\.venv/"
        "venv/"
    )
    
    for pattern in "${non_global_patterns[@]}"; do
        while IFS= read -r line_num && IFS= read -r line_content; do
            if [[ -n "$line_content" ]]; then
                violations=$((violations + 1))
                VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
                
                VIOLATION_DETAILS+=("{")
                VIOLATION_DETAILS+=("  \"file\": \"$relative_path\",")
                VIOLATION_DETAILS+=("  \"line\": $line_num,")
                VIOLATION_DETAILS+=("  \"type\": \"non_global_tool\",")
                VIOLATION_DETAILS+=("  \"pattern\": \"$pattern\",")
                VIOLATION_DETAILS+=("  \"content\": \"$(echo "$line_content" | sed 's/"/\\"/g')\",")
                VIOLATION_DETAILS+=("  \"severity\": \"medium\"")
                VIOLATION_DETAILS+=("}")
                
                warn "⚠️ Herramienta no-global en $relative_path:$line_num"
                warn "   Patrón: $pattern"
                warn "   $line_content"
            fi
        done < <(grep -in "$pattern" "$file" 2>/dev/null | sed 's/:/ /' | while read -r num content; do echo "$num"; echo "$content"; done)
    done
    
    return $violations
}

# Función para validar un comando individual
validate_command() {
    local file="$1"
    local relative_path="${file#$COMMANDS_DIR/}"
    local total_violations=0
    
    info "🔍 Validando: $relative_path"
    
    # Detectar diferentes tipos de violaciones
    detect_direct_references "$file"
    total_violations=$((total_violations + $?))
    
    detect_inheritance "$file"
    total_violations=$((total_violations + $?))
    
    detect_imports "$file"
    total_violations=$((total_violations + $?))
    
    detect_script_dependencies "$file"
    total_violations=$((total_violations + $?))
    
    detect_non_global_tools "$file"
    total_violations=$((total_violations + $?))
    
    if [[ $total_violations -gt 0 ]]; then
        VIOLATION_FILES+=("$relative_path")
        COMMANDS_WITH_VIOLATIONS=$((COMMANDS_WITH_VIOLATIONS + 1))
        error "❌ $relative_path: $total_violations violaciones encontradas"
    else
        success "✅ $relative_path: Autocontenido correctamente"
    fi
    
    return $total_violations
}

# Función para generar reporte JSON
generate_report() {
    info "📄 Generando reporte en $REPORT_FILE..."
    
    # Calcular métricas
    local compliance_percentage=0
    if [[ $TOTAL_COMMANDS -gt 0 ]]; then
        compliance_percentage=$(echo "scale=2; (($TOTAL_COMMANDS - $COMMANDS_WITH_VIOLATIONS) * 100) / $TOTAL_COMMANDS" | bc -l)
    fi
    
    local autocontained_commands=$((TOTAL_COMMANDS - COMMANDS_WITH_VIOLATIONS))
    
    # Generar JSON
    cat > "$REPORT_FILE" <<EOF
{
  "validation_summary": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "script": "$SCRIPT_NAME",
    "principle": "Principio #102: Command Autocontención Architecture",
    "commands_directory": "$COMMANDS_DIR"
  },
  "metrics": {
    "total_commands": $TOTAL_COMMANDS,
    "autocontained_commands": $autocontained_commands,
    "commands_with_violations": $COMMANDS_WITH_VIOLATIONS,
    "total_violations": $VIOLATIONS_FOUND,
    "compliance_percentage": $compliance_percentage
  },
  "violation_summary": {
    "files_with_violations": $(printf '['; printf '"%s",' "${VIOLATION_FILES[@]}" | sed 's/,$//'; printf ']'),
    "violation_types": {
      "direct_references": $(printf '%s\n' "${VIOLATION_DETAILS[@]}" | grep -c '"type": "direct_reference"' || echo 0),
      "inheritance_declarations": $(printf '%s\n' "${VIOLATION_DETAILS[@]}" | grep -c '"type": "inheritance_declaration"' || echo 0),
      "import_statements": $(printf '%s\n' "${VIOLATION_DETAILS[@]}" | grep -c '"type": "import_statement"' || echo 0),
      "script_dependencies": $(printf '%s\n' "${VIOLATION_DETAILS[@]}" | grep -c '"type": "script_dependency"' || echo 0),
      "non_global_tools": $(printf '%s\n' "${VIOLATION_DETAILS[@]}" | grep -c '"type": "non_global_tool"' || echo 0)
    }
  },
  "detailed_violations": [
$(IFS=$'\n'; echo "${VIOLATION_DETAILS[*]}" | sed 's/^/    /' | sed 's/}$/},/' | sed '$s/,$//')
  ],
  "recommendations": [
    "Eliminar todas las referencias directas [comando](./path.md)",
    "Convertir herencias explícitas a invocaciones via Task tool",
    "Reemplazar imports con invocaciones /comando cuando sea necesario",
    "Eliminar todas las referencias a scripts/ específicos de proyecto",
    "Usar solo herramientas globales del sistema (git, bash, curl, etc.)",
    "Asegurar que cada comando sea completamente autocontenido y portable"
  ]
}
EOF

    success "✅ Reporte generado: $REPORT_FILE"
}

# Función para mostrar resumen
show_summary() {
    echo
    info "📊 RESUMEN DE VALIDACIÓN"
    echo "=========================="
    info "📁 Directorio: $COMMANDS_DIR"
    info "📋 Total comandos: $TOTAL_COMMANDS"
    
    if [[ $VIOLATIONS_FOUND -eq 0 ]]; then
        success "✅ COMPLIANCE PERFECTO: Todos los comandos son autocontenidos"
        success "✅ Principio #102 cumplido al 100%"
    else
        warn "⚠️ Comandos autocontenidos: $((TOTAL_COMMANDS - COMMANDS_WITH_VIOLATIONS))"
        error "❌ Comandos con violaciones: $COMMANDS_WITH_VIOLATIONS"
        error "❌ Total violaciones: $VIOLATIONS_FOUND"
        
        local compliance_percentage=$(echo "scale=1; (($TOTAL_COMMANDS - $COMMANDS_WITH_VIOLATIONS) * 100) / $TOTAL_COMMANDS" | bc -l)
        warn "📈 Compliance: ${compliance_percentage}%"
        
        echo
        error "🚨 ARCHIVOS CON VIOLACIONES:"
        for file in "${VIOLATION_FILES[@]}"; do
            error "   - $file"
        done
    fi
    
    echo
    info "📄 Reporte detallado: $REPORT_FILE"
    info "📄 Log completo: $LOG_FILE"
}

# Función principal
main() {
    local start_time=$(date +%s)
    
    info "🚀 Iniciando validación de autocontención de comandos"
    info "📋 Principio #102: Command Autocontención Architecture"
    
    verify_prerequisites
    
    # Procesar todos los comandos
    info "🔍 Procesando comandos..."
    while IFS= read -r -d '' file; do
        validate_command "$file"
    done < <(find "$COMMANDS_DIR" -name "*.md" -type f -print0)
    
    # Generar reporte y mostrar resumen
    generate_report
    show_summary
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "🎉 Validación completada en ${duration}s"
    
    # Código de salida basado en violaciones
    if [[ $VIOLATIONS_FOUND -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Ejecutar función principal
main "$@"