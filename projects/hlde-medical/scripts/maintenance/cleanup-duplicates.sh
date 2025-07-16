#!/bin/bash

# Script de Limpieza Automatizada para HLDE
# Elimina archivos duplicados y optimiza la estructura del proyecto

echo "🧹 Iniciando limpieza de archivos duplicados en HLDE..."

# Crear backup antes de eliminar
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creando backup en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Función para hacer backup
backup_and_remove() {
    local target="$1"
    local backup_path="$BACKUP_DIR/$(basename "$target")"
    
    if [ -e "$target" ]; then
        echo "🔄 Respaldando y eliminando: $target"
        cp -r "$target" "$backup_path"
        rm -rf "$target"
        echo "✅ Eliminado: $target"
    else
        echo "⚠️  No encontrado: $target"
    fi
}

# Función para mostrar espacio ahorrado
show_space_saved() {
    local path="$1"
    if [ -e "$BACKUP_DIR/$(basename "$path")" ]; then
        local size=$(du -sh "$BACKUP_DIR/$(basename "$path")" | cut -f1)
        echo "💾 Espacio liberado: $size"
    fi
}

echo ""
echo "🎯 PRIORIDAD ALTA - Eliminando duplicados críticos..."

# 1. Eliminar directorio modulos-clinicos completamente duplicado
echo ""
echo "📁 Eliminando directorio modulos-clinicos/ (duplicado de docs/modulos-clinicos/)"
backup_and_remove "modulos-clinicos"
show_space_saved "modulos-clinicos"

# 2. Eliminar node_modules duplicado en medical-docs
echo ""
echo "📦 Eliminando node_modules duplicado en medical-docs/"
backup_and_remove "medical-docs/node_modules"
show_space_saved "medical-docs/node_modules"

# 3. Eliminar configuración duplicada
echo ""
echo "⚙️ Eliminando configuración duplicada en medical-docs/"
backup_and_remove "medical-docs/package.json"
backup_and_remove "medical-docs/package-lock.json"

echo ""
echo "🎯 PRIORIDAD MEDIA - Limpiando archivos temporales..."

# 4. Eliminar archivos HTML temporales de pdfs-modulos
echo ""
echo "🌐 Eliminando archivos HTML temporales de pdfs-modulos/"
backup_and_remove "pdfs-modulos"
show_space_saved "pdfs-modulos"

# 5. Consolidar scripts de PDF
echo ""
echo "📜 Consolidando scripts de PDF..."
backup_and_remove "merge-pdfs.sh"
backup_and_remove "pdfs-finales/combinar-con-preview.sh"

echo ""
echo "🎯 INFORMACIÓN - Archivos para revisión manual..."

# Mostrar archivos que requieren decisión manual
echo ""
echo "📄 Archivos que requieren revisión manual:"
echo "   - medical-docs/*.html (¿necesarios para el sitio web?)"
echo "   - pdfs-finales/*.pdf (¿redundantes con expediente-final/?)"
echo "   - combinar-pdfs-final.sh vs generar-pdfs-modulos.sh (¿cuál mantener?)"

echo ""
echo "📊 Calculando estadísticas finales..."

# Calcular espacio total ahorrado
if [ -d "$BACKUP_DIR" ]; then
    TOTAL_SAVED=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "💾 Espacio total liberado: $TOTAL_SAVED"
    
    # Contar archivos eliminados
    FILES_REMOVED=$(find "$BACKUP_DIR" -type f | wc -l)
    echo "🗑️  Archivos eliminados: $FILES_REMOVED"
fi

echo ""
echo "✅ Limpieza completada exitosamente!"
echo "📦 Backup guardado en: $BACKUP_DIR"
echo ""
echo "🎯 SIGUIENTE PASOS RECOMENDADOS:"
echo "1. Verificar que la documentación funciona correctamente"
echo "2. Revisar archivos en medical-docs/ para decisiones finales"
echo "3. Considerar eliminar pdfs-finales/ si expediente-final/ es suficiente"
echo "4. Actualizar scripts de build si es necesario"
echo ""
echo "💡 Para revertir cambios: cp -r $BACKUP_DIR/* ."