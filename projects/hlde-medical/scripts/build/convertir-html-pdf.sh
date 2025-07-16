#!/bin/bash

# Script para convertir archivos HTML a PDF usando Google Chrome headless
# Archivo: convertir-html-a-pdf.sh

echo "📄 Convirtiendo archivos HTML a PDF del Expediente Médico"
echo "========================================================="

# Crear directorio para PDFs finales
mkdir -p pdfs-finales

# Cambiar al directorio de archivos HTML
cd pdfs-modulos

# Contador para estadísticas
total_archivos=0
archivos_convertidos=0

# Función para convertir HTML a PDF usando Chrome
convertir_html_a_pdf() {
    local archivo_html="$1"
    local archivo_pdf="../pdfs-finales/${archivo_html%.html}.pdf"
    
    echo "🔄 Convirtiendo: $archivo_html → ${archivo_html%.html}.pdf"
    
    # Usar Chrome headless para generar PDF
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --disable-extensions \
        --disable-plugins \
        --run-all-compositor-stages-before-draw \
        --disable-background-timer-throttling \
        --disable-renderer-backgrounding \
        --disable-features=TranslateUI \
        --disable-ipc-flooding-protection \
        --print-to-pdf="$archivo_pdf" \
        --virtual-time-budget=5000 \
        --print-to-pdf-no-header \
        "file://$(pwd)/$archivo_html"
    
    if [ $? -eq 0 ] && [ -f "$archivo_pdf" ]; then
        echo "✅ PDF generado: ${archivo_html%.html}.pdf"
        ((archivos_convertidos++))
        return 0
    else
        echo "❌ Error al generar PDF para: $archivo_html"
        return 1
    fi
}

# Orden correcto de archivos para el expediente médico
archivos_orden=(
    "01-datos-paciente-perfil-demografico.html"
    "02-cronologia-clinica-progresion-cronologica.html"
    "03-diagnosticos-estudios-imagen.html"
    "03-diagnosticos-resultados-laboratorio.html"
    "04-tratamientos-procedimientos-quirurgicos.html"
    "04-tratamientos-protocolos-medicacion.html"
    "04-tratamientos-cuidados-soporte.html"
    "05-evaluaciones-conclusiones-diagnosticas.html"
    "05-evaluaciones-estado-actual.html"
    "05-evaluaciones-notas-evolucion.html"
)

# Procesar archivos en orden
for archivo in "${archivos_orden[@]}"; do
    if [ -f "$archivo" ]; then
        ((total_archivos++))
        convertir_html_a_pdf "$archivo"
    else
        echo "⚠️  Archivo no encontrado: $archivo"
    fi
done

# Volver al directorio original
cd ..

echo ""
echo "📊 Resumen de conversión:"
echo "   - Archivos HTML procesados: $total_archivos"
echo "   - PDFs generados exitosamente: $archivos_convertidos"
echo "   - Directorio de salida: pdfs-finales/"

# Mostrar archivos generados
echo ""
echo "📁 Archivos PDF generados:"
ls -la pdfs-finales/*.pdf 2>/dev/null | while read -r line; do
    echo "   📄 $line"
done

echo ""
echo "🎯 Siguiente paso: Combinar PDFs usando merge-pdfs.sh"
echo "   Ejecuta: ./merge-pdfs.sh"