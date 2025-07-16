#!/bin/bash

# Script de Reorganización Avanzada de Estructura - HLDE
# Reorganiza la estructura para máxima eficiencia y mantenibilidad

echo "🏗️ Iniciando reorganización avanzada de estructura..."

# Crear backup antes de reorganizar
BACKUP_DIR="backup-reorganization-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creando backup de reorganización en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Función para crear directorio con backup
create_directory() {
    local dir="$1"
    local description="$2"
    
    if [ ! -d "$dir" ]; then
        echo "📁 Creando directorio: $dir ($description)"
        mkdir -p "$dir"
    else
        echo "✅ Directorio existente: $dir"
    fi
}

# Función para mover archivos con backup
move_with_backup() {
    local source="$1"
    local dest="$2"
    local description="$3"
    
    if [ -e "$source" ]; then
        echo "🔄 Moviendo: $source → $dest ($description)"
        cp -r "$source" "$BACKUP_DIR/$(basename "$source")"
        mv "$source" "$dest"
        echo "✅ Movido exitosamente: $source"
    else
        echo "⚠️  No encontrado: $source"
    fi
}

echo ""
echo "📂 FASE 1: Reorganización de archivos de configuración"

# Crear directorio de configuración centralizada
create_directory "config" "Configuración centralizada"

# Mover archivos de configuración
move_with_backup "medical-record-config.js" "config/medical-record.config.js" "Configuración médica"
move_with_backup "vercel.json" "config/vercel.json" "Configuración de despliegue"
move_with_backup "style.css" "config/styles.css" "Estilos globales"

echo ""
echo "📂 FASE 2: Reorganización de scripts"

# Crear directorio de scripts organizado
create_directory "scripts/build" "Scripts de construcción"
create_directory "scripts/deployment" "Scripts de despliegue"
create_directory "scripts/maintenance" "Scripts de mantenimiento"

# Mover scripts por categoría
move_with_backup "combinar-pdfs-final.sh" "scripts/build/combinar-pdfs.sh" "Script de combinación PDF"
move_with_backup "convertir-html-a-pdf.sh" "scripts/build/convertir-html-pdf.sh" "Script de conversión HTML"
move_with_backup "generar-pdfs-modulos.sh" "scripts/build/generar-pdfs-modulos.sh" "Script de generación de PDFs"
move_with_backup "cleanup-duplicates.sh" "scripts/maintenance/cleanup-duplicates.sh" "Script de limpieza"

echo ""
echo "📂 FASE 3: Reorganización de documentación"

# Crear estructura de documentación mejorada
create_directory "documentation/system" "Documentación del sistema"
create_directory "documentation/medical" "Documentación médica"
create_directory "documentation/deployment" "Documentación de despliegue"

# Mover documentación
if [ -d "reportes-sistema" ]; then
    move_with_backup "reportes-sistema" "documentation/system/reportes" "Reportes del sistema"
fi

echo ""
echo "📂 FASE 4: Reorganización de archivos de salida"

# Crear directorio de salida organizado
create_directory "output/pdfs" "PDFs generados"
create_directory "output/html" "HTML generados"
create_directory "output/reports" "Reportes generados"

# Mover archivos de salida
if [ -d "pdfs-finales" ]; then
    move_with_backup "pdfs-finales" "output/pdfs/finales" "PDFs finales"
fi

if [ -d "expediente-final" ]; then
    move_with_backup "expediente-final" "output/pdfs/expediente-completo" "Expediente completo"
fi

echo ""
echo "📂 FASE 5: Optimización de archivos principales"

# Crear enlaces simbólicos para compatibilidad
create_symbolic_links() {
    local original="$1"
    local link="$2"
    
    if [ -e "$original" ] && [ ! -e "$link" ]; then
        echo "🔗 Creando enlace simbólico: $link → $original"
        ln -s "$original" "$link"
    fi
}

# Crear enlaces para mantener compatibilidad
create_symbolic_links "config/medical-record.config.js" "medical-record-config.js"
create_symbolic_links "config/vercel.json" "vercel.json"
create_symbolic_links "config/styles.css" "style.css"

echo ""
echo "📊 Generando estructura final optimizada..."

# Mostrar nueva estructura
echo "🌟 Nueva estructura de directorios:"
echo "📁 HLDE/"
echo "├── 📂 config/                    # Configuración centralizada"
echo "│   ├── medical-record.config.js  # Configuración médica"
echo "│   ├── vercel.json               # Configuración de despliegue"
echo "│   └── styles.css                # Estilos globales"
echo "├── 📂 scripts/                   # Scripts organizados"
echo "│   ├── build/                    # Scripts de construcción"
echo "│   ├── deployment/               # Scripts de despliegue"
echo "│   └── maintenance/              # Scripts de mantenimiento"
echo "├── 📂 documentation/             # Documentación organizada"
echo "│   ├── system/                   # Documentación del sistema"
echo "│   ├── medical/                  # Documentación médica"
echo "│   └── deployment/               # Documentación de despliegue"
echo "├── 📂 output/                    # Archivos de salida"
echo "│   ├── pdfs/                     # PDFs generados"
echo "│   ├── html/                     # HTML generados"
echo "│   └── reports/                  # Reportes generados"
echo "├── 📂 docs/                      # Documentación principal (VitePress)"
echo "├── 📂 medical-docs/              # Documentación médica (VitePress)"
echo "└── 📂 node_modules/              # Dependencias"

echo ""
echo "📊 Calculando mejoras..."

# Calcular mejoras
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    FILES_REORGANIZED=$(find "$BACKUP_DIR" -type f | wc -l)
    echo "📦 Archivos reorganizados: $FILES_REORGANIZED"
    echo "💾 Tamaño de backup: $BACKUP_SIZE"
fi

echo ""
echo "✅ Reorganización completada exitosamente!"
echo "📦 Backup guardado en: $BACKUP_DIR"
echo ""
echo "🎯 BENEFICIOS LOGRADOS:"
echo "1. Configuración centralizada en /config"
echo "2. Scripts organizados por categoría"
echo "3. Documentación estructurada"
echo "4. Archivos de salida separados"
echo "5. Enlaces simbólicos para compatibilidad"
echo "6. Estructura más mantenible y escalable"
echo ""
echo "💡 Para revertir cambios: cp -r $BACKUP_DIR/* ."