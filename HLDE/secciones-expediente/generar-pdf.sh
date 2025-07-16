#!/bin/bash

# Script de Generación de PDF con Cross-References
# Expediente Médico: Dylan Antonio Martínez Labastida (345370)
# Fecha: 2025-07-16

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📄 GENERADOR DE PDF CON CROSS-REFERENCES${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo "Expediente: Dylan Antonio Martínez Labastida (345370)"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Verificar dependencias
echo -e "${YELLOW}🔍 Verificando dependencias...${NC}"

# Verificar Pandoc
if ! command -v pandoc &> /dev/null; then
    echo -e "${RED}❌ Pandoc no está instalado. Por favor instálalo:${NC}"
    echo "  macOS: brew install pandoc"
    echo "  Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  Windows: Descargar desde https://pandoc.org/installing.html"
    exit 1
else
    echo -e "${GREEN}✅ Pandoc encontrado: $(pandoc --version | head -1)${NC}"
fi

# Verificar LaTeX (para PDFs de mejor calidad)
if command -v pdflatex &> /dev/null; then
    echo -e "${GREEN}✅ LaTeX encontrado: usar motor LaTeX${NC}"
    latex_engine="--pdf-engine=pdflatex"
else
    echo -e "${YELLOW}⚠️  LaTeX no encontrado: usar motor básico${NC}"
    latex_engine=""
fi

# Directorio de trabajo
cd "$(dirname "$0")"

# Archivos fuente en orden
archivos=(
    "00-indice-general.md"
    "01-informacion-ingreso-paciente.md"
    "02-notas-evolucion-diaria.md"
    "03-notas-interconsulta.md"
    "04-notas-traslado.md"
    "indice-terminos-medicos.md"
)

# Verificar existencia de archivos
echo -e "${YELLOW}📋 Verificando archivos fuente...${NC}"
archivos_faltantes=()
for archivo in "${archivos[@]}"; do
    if [ -f "$archivo" ]; then
        echo -e "${GREEN}✅${NC} $archivo"
    else
        echo -e "${RED}❌${NC} $archivo (no encontrado)"
        archivos_faltantes+=("$archivo")
    fi
done

if [ ${#archivos_faltantes[@]} -gt 0 ]; then
    echo -e "${RED}❌ Archivos faltantes. No se puede generar PDF.${NC}"
    exit 1
fi

# Crear metadatos
echo -e "${YELLOW}📝 Generando metadatos...${NC}"
fecha_actual=$(date '+%Y-%m-%d')
cat > metadata.yaml << EOF
---
title: "Expediente Médico - Dylan Antonio Martínez Labastida"
subtitle: "Sistema de Cross-References Médico"
author: "Hospital del Niño Poblano"
date: "$fecha_actual"
subject: "Expediente Médico No. 345370"
keywords: ["expediente médico", "cross-references", "navegación", "UCI pediátrica"]
description: "Expediente médico con sistema de navegación cruzada para Dylan Antonio Martínez Labastida"
lang: "es"
geometry: "margin=2cm"
fontsize: "11pt"
linestretch: 1.2
toc: true
toc-depth: 3
number-sections: true
links-as-notes: false
header-includes:
  - \usepackage{fancyhdr}
  - \pagestyle{fancy}
  - \fancyhead[L]{Expediente 345370 - Dylan Antonio Martínez Labastida}
  - \fancyhead[R]{$(date '+%Y-%m-%d')}
  - \fancyfoot[C]{\thepage}
  - \renewcommand{\headrulewidth}{0.4pt}
  - \renewcommand{\footrulewidth}{0.4pt}
...
EOF

# Generar PDF básico
echo -e "${YELLOW}🔄 Generando PDF básico...${NC}"
nombre_pdf="expediente-medico-dylan-martinez-$(date '+%Y%m%d-%H%M%S').pdf"

pandoc metadata.yaml "${archivos[@]}" \
    -o "$nombre_pdf" \
    $latex_engine \
    --template=eisvogel \
    --highlight-style=tango \
    --variable=colorlinks \
    --variable=linkcolor:blue \
    --variable=urlcolor:blue \
    --variable=toccolor:black \
    --filter pandoc-crossref \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PDF básico generado: $nombre_pdf${NC}"
else
    echo -e "${RED}❌ Error generando PDF básico${NC}"
    # Intentar sin template
    echo -e "${YELLOW}🔄 Intentando sin template avanzado...${NC}"
    pandoc metadata.yaml "${archivos[@]}" \
        -o "$nombre_pdf" \
        $latex_engine \
        --toc \
        --number-sections \
        --variable=colorlinks \
        --variable=linkcolor:blue
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PDF simple generado: $nombre_pdf${NC}"
    else
        echo -e "${RED}❌ Error generando PDF${NC}"
        exit 1
    fi
fi

# Generar PDF con referencias optimizadas
echo -e "${YELLOW}🔄 Generando PDF con referencias optimizadas...${NC}"
nombre_pdf_opt="expediente-medico-dylan-martinez-optimizado-$(date '+%Y%m%d-%H%M%S').pdf"

# Crear versión optimizada con mejor manejo de enlaces
cat > config-optimizado.yaml << EOF
---
title: "Expediente Médico - Dylan Antonio Martínez Labastida"
subtitle: "Sistema de Cross-References Médico (Optimizado)"
author: "Hospital del Niño Poblano - Sistema de Context Engineering"
date: "$fecha_actual"
subject: "Expediente Médico No. 345370"
keywords: ["expediente médico", "cross-references", "navegación", "UCI pediátrica", "sistema optimizado"]
description: "Expediente médico con sistema de navegación cruzada optimizado para Dylan Antonio Martínez Labastida"
lang: "es"
geometry: "margin=2.5cm"
fontsize: "12pt"
linestretch: 1.3
toc: true
toc-depth: 4
number-sections: true
links-as-notes: false
link-citations: true
colorlinks: true
linkcolor: blue
urlcolor: blue
toccolor: black
header-includes:
  - \usepackage{fancyhdr}
  - \usepackage{lastpage}
  - \pagestyle{fancy}
  - \fancyhead[L]{Expediente 345370}
  - \fancyhead[C]{Dylan Antonio Martínez Labastida}
  - \fancyhead[R]{$(date '+%Y-%m-%d')}
  - \fancyfoot[L]{Hospital del Niño Poblano}
  - \fancyfoot[C]{\thepage\ de \pageref{LastPage}}
  - \fancyfoot[R]{Sistema Cross-References}
  - \renewcommand{\headrulewidth}{0.4pt}
  - \renewcommand{\footrulewidth}{0.4pt}
...
EOF

pandoc config-optimizado.yaml "${archivos[@]}" \
    -o "$nombre_pdf_opt" \
    $latex_engine \
    --toc \
    --number-sections \
    --variable=colorlinks \
    --variable=linkcolor:blue \
    --variable=urlcolor:blue \
    --variable=toccolor:black \
    --filter pandoc-crossref \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PDF optimizado generado: $nombre_pdf_opt${NC}"
else
    echo -e "${YELLOW}⚠️  PDF optimizado falló, usando versión básica${NC}"
fi

# Generar PDF solo con índice y navegación
echo -e "${YELLOW}🔄 Generando PDF de índice y navegación...${NC}"
nombre_pdf_indice="indice-navegacion-dylan-martinez-$(date '+%Y%m%d-%H%M%S').pdf"

pandoc metadata.yaml \
    "00-indice-general.md" \
    "indice-terminos-medicos.md" \
    "cross-references-config.md" \
    "documentacion-sistema-navegacion.md" \
    -o "$nombre_pdf_indice" \
    $latex_engine \
    --toc \
    --number-sections \
    --variable=colorlinks \
    --variable=linkcolor:blue

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PDF de índice generado: $nombre_pdf_indice${NC}"
else
    echo -e "${RED}❌ Error generando PDF de índice${NC}"
fi

# Validar PDFs generados
echo -e "${YELLOW}📊 Validando PDFs generados...${NC}"
for pdf in *.pdf; do
    if [ -f "$pdf" ]; then
        tamano=$(du -h "$pdf" | cut -f1)
        echo -e "${GREEN}✅${NC} $pdf (${tamano})"
    fi
done

# Limpiar archivos temporales
echo -e "${YELLOW}🧹 Limpiando archivos temporales...${NC}"
rm -f metadata.yaml config-optimizado.yaml

# Reporte final
echo ""
echo -e "${BLUE}📊 REPORTE DE GENERACIÓN${NC}"
echo -e "${BLUE}═════════════════════════${NC}"
echo "Archivos procesados: ${#archivos[@]}"
echo "PDFs generados: $(ls -1 *.pdf 2>/dev/null | wc -l)"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo -e "${GREEN}🎉 GENERACIÓN COMPLETADA${NC}"
echo "Los PDFs han sido generados con el sistema de cross-references implementado."
echo "Los enlaces internos funcionan como bookmarks en lectores PDF compatibles."
echo ""

echo -e "${BLUE}📖 INSTRUCCIONES DE USO${NC}"
echo "1. Abrir PDF en lector compatible (Adobe Reader, Preview, etc.)"
echo "2. Usar bookmarks del panel lateral para navegación"
echo "3. Los enlaces internos funcionan como hipervínculos"
echo "4. El índice de contenidos es completamente navegable"
echo ""

echo -e "${BLUE}🔧 MANTENIMIENTO${NC}"
echo "- Ejecutar este script después de actualizar contenido"
echo "- Validar enlaces antes de generar PDF"
echo "- Actualizar metadatos según sea necesario"
echo "- Mantener archivos fuente sincronizados"

echo ""
echo -e "${GREEN}✅ Sistema de PDF con Cross-References implementado exitosamente${NC}"