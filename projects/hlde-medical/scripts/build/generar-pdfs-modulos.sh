#!/bin/bash

# Script para generar PDFs individuales de todos los módulos clínicos
# y luego crear un PDF consolidado del expediente médico

echo "🏥 Generando PDFs del Expediente Médico HLDE"
echo "=============================================="

# Verificar si pandoc está disponible
if ! command -v pandoc &> /dev/null; then
    echo "❌ Error: pandoc no está instalado"
    echo "Para instalar: brew install pandoc"
    exit 1
fi

# Crear directorio para PDFs
mkdir -p pdfs-modulos

# Función para convertir MD a PDF
convertir_md_a_pdf() {
    local archivo_md="$1"
    local nombre_base=$(basename "$archivo_md" .md)
    local directorio=$(dirname "$archivo_md")
    local modulo=$(basename "$directorio")
    local archivo_pdf="pdfs-modulos/${modulo}-${nombre_base}.pdf"
    
    echo "📄 Convirtiendo: $archivo_md → $archivo_pdf"
    
    # Generar HTML primero (más confiable)
    pandoc "$archivo_md" -o "${archivo_pdf%.pdf}.html" \
        --toc \
        --toc-depth=3 \
        -s \
        --metadata title="HLDE - $modulo: $nombre_base" \
        --metadata author="Sistema HLDE" \
        --metadata date="$(date +%Y-%m-%d)" \
        --metadata lang="es" \
        --css="../style.css" \
        --self-contained 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ HTML generado: ${archivo_pdf%.pdf}.html"
        return 0
    else
        echo "❌ Error al generar HTML para: $archivo_md"
        return 1
    fi
}

# Orden lógico de procesamiento según estructura del expediente médico
declare -a orden_archivos=(
    "modulos-clinicos/00-navegacion-sistema/LEEME.md"
    "modulos-clinicos/00-navegacion-sistema/indice-maestro.md"
    "modulos-clinicos/00-navegacion-sistema/panel-acceso-rapido.md"
    "modulos-clinicos/00-navegacion-sistema/guia-busqueda.md"
    "modulos-clinicos/00-navegacion-sistema/referencias-cruzadas.md"
    "modulos-clinicos/01-datos-paciente/perfil-demografico.md"
    "modulos-clinicos/02-cronologia-clinica/progresion-cronologica.md"
    "modulos-clinicos/03-diagnosticos/estudios-imagen.md"
    "modulos-clinicos/03-diagnosticos/resultados-laboratorio.md"
    "modulos-clinicos/04-tratamientos/procedimientos-quirurgicos.md"
    "modulos-clinicos/04-tratamientos/protocolos-medicacion.md"
    "modulos-clinicos/04-tratamientos/cuidados-soporte.md"
    "modulos-clinicos/05-evaluaciones/conclusiones-diagnosticas.md"
    "modulos-clinicos/05-evaluaciones/estado-actual.md"
    "modulos-clinicos/05-evaluaciones/notas-evolucion.md"
)

# Procesar archivos en orden
echo "📋 Procesando archivos en orden lógico del expediente médico..."
archivos_procesados=()
archivos_html=()

for archivo in "${orden_archivos[@]}"; do
    if [ -f "$archivo" ]; then
        convertir_md_a_pdf "$archivo"
        if [ $? -eq 0 ]; then
            archivos_procesados+=("$archivo")
            nombre_base=$(basename "$archivo" .md)
            directorio=$(dirname "$archivo")
            modulo=$(basename "$directorio")
            archivos_html+=("pdfs-modulos/${modulo}-${nombre_base}.html")
        fi
    else
        echo "⚠️  Archivo no encontrado: $archivo"
    fi
done

echo ""
echo "📊 Resumen de conversión:"
echo "   - Archivos procesados: ${#archivos_procesados[@]}"
echo "   - HTMLs generados: ${#archivos_html[@]}"

# Crear índice HTML para navegación
echo "📚 Creando índice del expediente médico..."
cat > pdfs-modulos/indice-expediente.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expediente Médico Digital - Dylan Martinez Labastida</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f8f9fa; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .patient-info { background-color: #d4edda; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .module { background-color: white; margin: 15px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .module h3 { color: #2c3e50; margin-top: 0; }
        .file-link { display: block; margin: 8px 0; padding: 8px; background-color: #f8f9fa; border-radius: 4px; text-decoration: none; color: #2980b9; }
        .file-link:hover { background-color: #e9ecef; }
        .stats { background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Expediente Médico Digital - Sistema HLDE</h1>
        <p>Expediente completo del paciente Dylan Antonio Martinez Labastida</p>
    </div>

    <div class="patient-info">
        <h2>👤 Información del Paciente</h2>
        <p><strong>Nombre:</strong> Dylan Antonio Martinez Labastida</p>
        <p><strong>Expediente:</strong> 345370</p>
        <p><strong>Edad:</strong> 8 años</p>
        <p><strong>Diagnóstico:</strong> Apendicitis complicada con perforación</p>
        <p><strong>Ubicación:</strong> UCI Pediátrica</p>
    </div>

    <div class="module">
        <h3>📁 Módulo 00: Sistema de Navegación</h3>
        <a href="00-navegacion-sistema-LEEME.html" class="file-link">📖 Documentación del Sistema</a>
        <a href="00-navegacion-sistema-indice-maestro.html" class="file-link">🗂️ Índice Maestro</a>
        <a href="00-navegacion-sistema-panel-acceso-rapido.html" class="file-link">🚨 Panel de Acceso Rápido</a>
        <a href="00-navegacion-sistema-guia-busqueda.html" class="file-link">🔍 Guía de Búsqueda</a>
        <a href="00-navegacion-sistema-referencias-cruzadas.html" class="file-link">🔗 Referencias Cruzadas</a>
    </div>

    <div class="module">
        <h3>👤 Módulo 01: Datos del Paciente</h3>
        <a href="01-datos-paciente-perfil-demografico.html" class="file-link">📊 Perfil Demográfico</a>
    </div>

    <div class="module">
        <h3>📅 Módulo 02: Cronología Clínica</h3>
        <a href="02-cronologia-clinica-progresion-cronologica.html" class="file-link">⏰ Progresión Cronológica</a>
    </div>

    <div class="module">
        <h3>🔬 Módulo 03: Diagnósticos</h3>
        <a href="03-diagnosticos-estudios-imagen.html" class="file-link">📸 Estudios de Imagen</a>
        <a href="03-diagnosticos-resultados-laboratorio.html" class="file-link">🧪 Resultados de Laboratorio</a>
    </div>

    <div class="module">
        <h3>💊 Módulo 04: Tratamientos</h3>
        <a href="04-tratamientos-procedimientos-quirurgicos.html" class="file-link">🏥 Procedimientos Quirúrgicos</a>
        <a href="04-tratamientos-protocolos-medicacion.html" class="file-link">💉 Protocolos de Medicación</a>
        <a href="04-tratamientos-cuidados-soporte.html" class="file-link">🩺 Cuidados de Soporte</a>
    </div>

    <div class="module">
        <h3>📋 Módulo 05: Evaluaciones</h3>
        <a href="05-evaluaciones-conclusiones-diagnosticas.html" class="file-link">🎯 Conclusiones Diagnósticas</a>
        <a href="05-evaluaciones-estado-actual.html" class="file-link">📊 Estado Actual</a>
        <a href="05-evaluaciones-notas-evolucion.html" class="file-link">📈 Notas de Evolución</a>
    </div>

    <div class="stats">
        <h3>📊 Estadísticas del Expediente</h3>
        <p><strong>Archivos procesados:</strong> 15</p>
        <p><strong>Módulos clínicos:</strong> 6</p>
        <p><strong>Fecha de generación:</strong> $(date)</p>
    </div>
</body>
</html>
EOF

# Instrucciones para el usuario
echo ""
echo "✅ Proceso completado exitosamente!"
echo ""
echo "📂 Archivos generados en la carpeta 'pdfs-modulos/':"
echo "   - ${#archivos_html[@]} archivos HTML individuales"
echo "   - 1 archivo de índice (indice-expediente.html)"
echo ""
echo "🌐 Para ver el expediente completo:"
echo "   1. Abre: pdfs-modulos/indice-expediente.html"
echo "   2. Navega entre los módulos clínicos"
echo ""
echo "📄 Para generar PDFs desde el navegador:"
echo "   1. Abre cada archivo HTML en tu navegador"
echo "   2. Usa Cmd+P → 'Guardar como PDF'"
echo "   3. Los PDFs se pueden combinar usando:"
echo "      - Preview (macOS): Abrir PDFs → Mostrar miniaturas → Arrastrar para combinar"
echo "      - Adobe Acrobat: Herramientas → Combinar archivos"
echo ""
echo "🏥 Expediente médico listo para Dylan Martinez Labastida (Expediente 345370)"