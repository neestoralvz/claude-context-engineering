# Compact Notification Standards

**Sistema de notificaciones densas y de alta calidad** - Máximo valor informativo en mínimos caracteres.

## 🎯 Principios Core

**DENSIDAD**: Cada carácter debe aportar valor informativo esencial  
**CLARIDAD**: Comprensión inmediata con colores y símbolos universales  
**CONSISTENCIA**: Patrones uniformes que reduce carga cognitiva  
**VELOCIDAD**: Escaneo visual ultra-rápido para información crítica

## ⚡ Biblioteca Compacta

```bash
# Cargar sistema de notificaciones compactas
source "$BASE_DIR/scripts/core/compact-notifications.sh"
```

## 🔧 Funciones Principales

### Status de Operaciones
```bash
# [✓] Action → Result (time)
cn_status "ok" "validate" "76 commands found" "1.2s"
# Output: [✓] validate → 76 commands found (1.2s)

cn_status "error" "build" "type error on line 42"
# Output: [✗] build → type error on line 42
```

### Progress Denso
```bash
# Phase 1/3 ██████░░░░ 60% Action
cn_progress 1 3 60 "analyzing commands"
# Output: Phase 1/3 ██████░░░░ 60% analyzing commands
```

### Métricas Compactas
```bash
# 76cmd 12auth 16mod [2.1s]
cn_metrics "cmd=76" "auth=12" "mod=16" "time=2.1s"
# Output: 76cmd 12auth 16mod 2.1s
```

### Resumen de Resultados
```bash
# ✓12 ⚠3 ✗1 [4.2s] 85% efficiency  
cn_summary 12 3 1 "4.2s" 85
# Output: ✓12 ⚠3 ✗1 [4.2s] 85% efficiency
```

### Operaciones de Archivos
```bash
# ✓ file.md (1.2K→0.8K) -33%
cn_file_op "ok" "docs/command.md" "1200" "800"
# Output: ✓ command.md (1.2K→0.8K) -33%
```

### Errores con Contexto
```bash
# ✗ script.sh:42 TypeError → retry 3/5
cn_error "validate.sh" "42" "TypeError" "retry" "3" "5"
# Output: ✗ validate.sh:42 TypeError → retry 3/5
```

### Validación Multi-Sistema
```bash
# ✓ P55/P56 ✓ Math ⚠ Links [2.1s]
cn_validation "P55/P56=ok" "Math=ok" "Links=warn" "time=2.1s"
# Output: ✓ P55/P56 ✓ Math ⚠ Links [2.1s]
```

### Ejecución de Comandos
```bash
# ⟳ /context-eng → ✓ 76cmd loaded [1.8s]
cn_command "/context-eng" "76cmd loaded" "1.8s"
# Output: ⟳ /context-eng → ✓ 76cmd loaded [1.8s]
```

### Health del Sistema
```bash
# CPU 45% MEM 2.1G DISK 67% NET ok
cn_health "45%" "2.1G" "67%" "ok"
# Output: CPU 45% MEM 2.1G DISK 67% NET ok
```

## 🎨 Sistema de Colores

**4 colores esenciales** únicamente:

- **🔴 Rojo** (`R`): Errores críticos, fallos del sistema
- **🟢 Verde** (`G`): Éxito, operaciones completadas
- **🟡 Amarillo** (`Y`): Advertencias, procesos en curso  
- **🔵 Azul** (`B`): Información, estado neutral

## 🔣 Símbolos Universales

**Símbolos core** (reconocimiento inmediato):

- `✓` **Éxito** - Operación completada correctamente
- `✗` **Error** - Fallo crítico o error
- `⚠` **Advertencia** - Atención requerida  
- `ℹ` **Info** - Información neutral
- `⟳` **Procesando** - Operación en curso
- `◉` **Activo** - Estado activo/running

## 📊 Patrones de Reemplazo

### ANTES (Verboso - 147 caracteres)
```bash
echo "============================================================"
echo "🎯 Context Engineering - Command Counting System Demo"
echo "============================================================"
echo ""
echo "Step 1: Help and Usage Information"
echo "Command: ./scripts/validation/automated-command-counter-v2.sh --help"
```

### DESPUÉS (Compacto - 52 caracteres)
```bash
cn_status "info" "Command Demo" "Step 1: Help" 
cn_command "./automated-command-counter-v2.sh --help"
```

**Reducción: 65% menos caracteres, información equivalente**

### ANTES (Progress verboso - 89 caracteres)
```bash
echo -e "${BOLD}${PURPLE}━━━ PHASE 1/6: MATHEMATICAL FORMULAS ━━━${NC}"
echo "Validating mathematical formulas..."
```

### DESPUÉS (Progress compacto - 45 caracteres)
```bash
cn_progress 1 6 17 "Math formulas validation"
```

**Reducción: 49% menos caracteres, mayor información**

### ANTES (Validation verboso - 156 caracteres)
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "P56 Transparency Validation - System Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### DESPUÉS (Validation compacto - 28 caracteres)  
```bash
cn_validation "P56=ok" "Health=ok"
```

**Reducción: 82% menos caracteres, claridad superior**

## ⚡ Utilidades de Conversión

### Tamaños Legibles
```bash
cn_human_size 1234567    # Output: 1.2M
cn_human_size 2048       # Output: 2.0K
```

### Tiempo Formateado
```bash
cn_format_time 125       # Output: 2m5s
cn_format_time 3661      # Output: 1h1m
```

## 📋 Estándares de Implementación

### OBLIGATORIO en Scripts Nuevos
```bash
#!/bin/bash
source "$(dirname "$0")/../core/compact-notifications.sh"

# Usar funciones cn_* en lugar de echo verboso
cn_status "info" "script started" "$(basename "$0")"
```

### MIGRACIÓN de Scripts Existentes
1. **Identificar** patrones verbosos (echo con decoraciones)
2. **Reemplazar** con función cn_* equivalente  
3. **Validar** que información crítica se preserva
4. **Medir** reducción de caracteres (objetivo: 50%+)

### PROHIBIDO (Anti-Patterns)
- ❌ Líneas decorativas largas (`━━━━━━━`, `======`)
- ❌ Headers multi-línea con espacios en blanco
- ❌ Emojis redundantes o decorativos sin función
- ❌ Repetición de información en múltiples líneas
- ❌ Progress bars ASCII complejos para operaciones simples

### REQUERIDO (Pro-Patterns)
- ✅ Una línea = una operación/estado
- ✅ Símbolos únicos con significado universal
- ✅ Información contextual en formato compacto
- ✅ Métricas numéricas cuando aportan valor
- ✅ Tiempo de ejecución para operaciones >1s

## 🔍 Métricas de Calidad

**Objetivos cuantificables**:
- **≥50% reducción** en caracteres por notificación
- **≤1 segundo** para comprender el estado visual
- **≤3 colores** por línea de notificación  
- **100% información crítica** preservada
- **0 ruido visual** innecesario

**Validación automática**:
```bash
# Contar caracteres en notificaciones del script
char_count=$(grep -o "cn_[a-z_]*" script.sh | wc -l)
verbose_count=$(grep -o "echo.*[=-]{5,}" script.sh | wc -l)

# Objetivo: char_count > verbose_count * 2
```

## 🚀 Próximos Pasos

1. **Implementar** en todos los scripts core (`/scripts/core/`)
2. **Migrar** scripts de validación (`/scripts/validation/`)  
3. **Integrar** con sistema de logs automático
4. **Extender** a notificaciones de conversación Claude Code
5. **Medir** mejoras cuantificables en experiencia de usuario

---

**Referencia**: [Compact Notifications Library](../../scripts/core/compact-notifications.sh) | **Implementación**: Todos los scripts new/modified