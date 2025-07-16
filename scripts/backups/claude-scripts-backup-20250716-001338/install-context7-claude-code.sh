#!/bin/bash

# =============================================================================
# Context7 MCP Installer for Claude Code on macOS
# =============================================================================
# 
# Este script instala Context7 MCP Server para Claude Code en macOS
# Basado en la documentación oficial de 2025
#
# Uso: ./install-context7-claude-code.sh
# =============================================================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Variables globales
CONTEXT7_PACKAGE="@upstash/context7-mcp@latest"
CLAUDE_CONFIG_USER="$HOME/.claude.json"
CLAUDE_CONFIG_PROJECT="./.mcp.json"
BACKUP_DIR="$HOME/.context7-backup-$(date +%Y%m%d-%H%M%S)"

# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}${BOLD}===============================================${NC}"
    echo -e "${BLUE}${BOLD}  Context7 MCP Installer para Claude Code${NC}"
    echo -e "${BLUE}${BOLD}  macOS - $(date '+%Y-%m-%d')${NC}"
    echo -e "${BLUE}${BOLD}===============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo ""
    echo -e "${BOLD}🔄 $1${NC}"
}

# =============================================================================
# VERIFICACIONES DE PREREQUISITOS
# =============================================================================

check_macos() {
    print_step "Verificando sistema operativo..."
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "Este script está diseñado para macOS"
        exit 1
    fi
    print_success "Ejecutándose en macOS"
}

check_claude_code() {
    print_step "Verificando instalación de Claude Code..."
    
    if ! command -v claude &> /dev/null; then
        print_error "Claude Code CLI no está instalado o no está en PATH"
        echo ""
        echo "Para instalar Claude Code:"
        echo "1. Descarga desde: https://claude.ai/code"
        echo "2. Instala la aplicación"
        echo "3. Ejecuta 'claude --version' para verificar"
        exit 1
    fi
    
    local claude_version=$(claude --version 2>/dev/null | head -n 1)
    print_success "Claude Code detectado: $claude_version"
}

check_nodejs() {
    print_step "Verificando Node.js..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        echo ""
        echo "Para instalar Node.js:"
        echo "1. Homebrew: brew install node"
        echo "2. Oficial: https://nodejs.org/en/download/"
        echo "3. NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        exit 1
    fi
    
    local node_version=$(node --version)
    local major_version=$(echo "$node_version" | cut -d'.' -f1 | sed 's/v//')
    
    if [ "$major_version" -lt 18 ]; then
        print_error "Node.js version $node_version detectada. Se requiere v18+"
        echo ""
        echo "Para actualizar Node.js:"
        echo "1. Homebrew: brew upgrade node"
        echo "2. NVM: nvm install --lts && nvm use --lts"
        exit 1
    fi
    
    print_success "Node.js $node_version (compatible)"
    
    # Verificar npm/npx
    if ! command -v npx &> /dev/null; then
        print_error "npx no está disponible"
        echo "Reinstala Node.js o ejecuta: npm install -g npx"
        exit 1
    fi
    
    print_success "npx disponible"
}

check_network() {
    print_step "Verificando conectividad de red..."
    
    if ! ping -c 1 registry.npmjs.org &> /dev/null; then
        print_warning "No se puede conectar a registry.npmjs.org"
        echo "Verifica tu conexión a internet"
        return 1
    fi
    
    print_success "Conectividad a NPM registry OK"
    return 0
}

# =============================================================================
# BACKUP Y CONFIGURACIÓN
# =============================================================================

backup_existing_config() {
    print_step "Creando backup de configuraciones existentes..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$CLAUDE_CONFIG_USER" ]; then
        cp "$CLAUDE_CONFIG_USER" "$BACKUP_DIR/claude.json.backup"
        print_success "Backup creado: $BACKUP_DIR/claude.json.backup"
    fi
    
    if [ -f "$CLAUDE_CONFIG_PROJECT" ]; then
        cp "$CLAUDE_CONFIG_PROJECT" "$BACKUP_DIR/mcp.json.backup"
        print_success "Backup creado: $BACKUP_DIR/mcp.json.backup"
    fi
}

# =============================================================================
# INSTALACIÓN PRINCIPAL
# =============================================================================

install_via_claude_cli() {
    print_step "Instalando Context7 via Claude Code CLI..."
    
    # Intentar instalación con claude mcp add
    if claude mcp add context7 -- npx -y "$CONTEXT7_PACKAGE" 2>/dev/null; then
        print_success "Context7 instalado exitosamente via Claude CLI"
        return 0
    else
        print_warning "Instalación via Claude CLI falló, intentando método manual..."
        return 1
    fi
}

install_via_manual_config() {
    print_step "Configurando Context7 manualmente..."
    
    # Preguntar al usuario qué scope prefiere
    echo ""
    echo "Selecciona el scope de configuración:"
    echo "1) Usuario (disponible en todos los proyectos)"
    echo "2) Proyecto (solo en el directorio actual)"
    echo ""
    read -p "Selecciona una opción (1 o 2): " scope_choice
    
    case $scope_choice in
        1)
            config_file="$CLAUDE_CONFIG_USER"
            print_info "Configurando para scope de usuario: $config_file"
            ;;
        2)
            config_file="$CLAUDE_CONFIG_PROJECT"
            print_info "Configurando para scope de proyecto: $config_file"
            ;;
        *)
            print_warning "Opción inválida, usando scope de usuario por defecto"
            config_file="$CLAUDE_CONFIG_USER"
            ;;
    esac
    
    # Crear directorio si no existe
    mkdir -p "$(dirname "$config_file")"
    
    # Crear configuración JSON
    local config_json='{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "'$CONTEXT7_PACKAGE'"],
      "env": {}
    }
  }
}'
    
    # Si el archivo existe, fusionar configuraciones
    if [ -f "$config_file" ]; then
        print_info "Archivo de configuración existente detectado, fusionando..."
        
        # Crear temp file con nueva configuración
        local temp_file=$(mktemp)
        
        # Usar jq si está disponible, sino crear archivo nuevo
        if command -v jq &> /dev/null; then
            jq --argjson new_server '{"context7": {"type": "stdio", "command": "npx", "args": ["-y", "'$CONTEXT7_PACKAGE'"], "env": {}}}' \
               '.mcpServers += $new_server' "$config_file" > "$temp_file"
            mv "$temp_file" "$config_file"
        else
            print_warning "jq no disponible, sobrescribiendo configuración"
            echo "$config_json" > "$config_file"
        fi
    else
        echo "$config_json" > "$config_file"
    fi
    
    print_success "Configuración creada en: $config_file"
}

# =============================================================================
# VALIDACIÓN POST-INSTALACIÓN
# =============================================================================

validate_installation() {
    print_step "Validando instalación..."
    
    # Verificar que Context7 aparece en la lista de servidores MCP
    if claude mcp list 2>/dev/null | grep -q "context7"; then
        print_success "Context7 detectado en lista de servidores MCP"
        return 0
    else
        print_warning "Context7 no aparece en 'claude mcp list'"
        return 1
    fi
}

test_context7_functionality() {
    print_step "Probando funcionalidad de Context7..."
    
    echo ""
    echo "Para probar Context7, ejecuta Claude Code y usa este prompt de ejemplo:"
    echo ""
    echo -e "${YELLOW}\"Explica cómo usar useState en React 18. use context7\"${NC}"
    echo ""
    echo "Context7 debería inyectar documentación actualizada de React 18."
}

# =============================================================================
# TROUBLESHOOTING
# =============================================================================

show_troubleshooting() {
    print_step "Guía de Troubleshooting..."
    
    echo ""
    echo -e "${BOLD}Problemas comunes y soluciones:${NC}"
    echo ""
    echo "1. 'claude: command not found'"
    echo "   → Reinstala Claude Code y verifica PATH"
    echo ""
    echo "2. 'ERR_MODULE_NOT_FOUND'"
    echo "   → Prueba: claude mcp add context7 -- bunx -y $CONTEXT7_PACKAGE"
    echo ""
    echo "3. 'Context7 no responde'"
    echo "   → Reinicia Claude Code"
    echo "   → Verifica: claude mcp list"
    echo ""
    echo "4. 'Node.js version incompatible'"
    echo "   → Actualiza Node.js a v18+"
    echo "   → Usa NVM: nvm install --lts"
    echo ""
    echo "5. 'Permisos denegados'"
    echo "   → Verifica permisos en ~/.claude.json"
    echo "   → Ejecuta: chmod 644 ~/.claude.json"
    echo ""
    echo -e "${BOLD}Archivos de configuración:${NC}"
    echo "• Usuario: $CLAUDE_CONFIG_USER"
    echo "• Proyecto: $CLAUDE_CONFIG_PROJECT"
    echo "• Logs: ~/Library/Logs/Claude/"
    echo ""
    echo -e "${BOLD}Comandos útiles:${NC}"
    echo "• Listar servidores: claude mcp list"
    echo "• Obtener detalles: claude mcp get context7"
    echo "• Remover servidor: claude mcp remove context7"
    echo ""
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    print_header
    
    # Verificaciones de prerequisitos
    check_macos
    check_claude_code
    check_nodejs
    check_network || print_warning "Conectividad limitada, continuando..."
    
    # Backup de configuraciones existentes
    backup_existing_config
    
    # Intentar instalación via Claude CLI primero
    if ! install_via_claude_cli; then
        # Si falla, usar configuración manual
        install_via_manual_config
    fi
    
    # Validar instalación
    if validate_installation; then
        print_success "¡Instalación de Context7 completada exitosamente!"
        
        # Mostrar instrucciones de uso
        echo ""
        echo -e "${BOLD}${GREEN}¿Cómo usar Context7?${NC}"
        echo ""
        echo "1. Abre Claude Code"
        echo "2. En cualquier prompt, añade: \"use context7\""
        echo "3. Context7 inyectará documentación actualizada automáticamente"
        echo ""
        echo -e "${BOLD}Ejemplo:${NC}"
        echo -e "${YELLOW}\"Crea una API REST con FastAPI y autenticación JWT. use context7\"${NC}"
        echo ""
        
        test_context7_functionality
        
    else
        print_error "La validación falló"
        show_troubleshooting
        exit 1
    fi
    
    # Mostrar información de troubleshooting
    echo ""
    read -p "¿Quieres ver la guía de troubleshooting? (y/n): " show_guide
    if [[ $show_guide =~ ^[Yy]$ ]]; then
        show_troubleshooting
    fi
    
    echo ""
    print_success "¡Instalación completada! Context7 está listo para usar."
}

# =============================================================================
# EJECUCIÓN
# =============================================================================

# Verificar si el script se está ejecutando directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi