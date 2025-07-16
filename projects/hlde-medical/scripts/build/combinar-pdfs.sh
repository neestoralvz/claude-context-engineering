#!/bin/bash

# Script para combinar PDFs usando Python y PyPDF2
# Archivo: combinar-pdfs-final.sh

echo "🔗 Combinando PDFs del Expediente Médico Dylan Martinez Labastida"
echo "================================================================"

# Crear directorio de salida si no existe
mkdir -p expediente-final

# Cambiar al directorio de PDFs
cd pdfs-finales

# Verificar que existen los archivos PDF
echo "📋 Verificando archivos PDF disponibles..."
archivos_pdf=(
    "01-datos-paciente-perfil-demografico.pdf"
    "02-cronologia-clinica-progresion-cronologica.pdf"
    "03-diagnosticos-estudios-imagen.pdf"
    "03-diagnosticos-resultados-laboratorio.pdf"
    "04-tratamientos-procedimientos-quirurgicos.pdf"
    "04-tratamientos-protocolos-medicacion.pdf"
    "04-tratamientos-cuidados-soporte.pdf"
    "05-evaluaciones-conclusiones-diagnosticas.pdf"
    "05-evaluaciones-estado-actual.pdf"
    "05-evaluaciones-notas-evolucion.pdf"
)

# Contar archivos disponibles
archivos_disponibles=0
for archivo in "${archivos_pdf[@]}"; do
    if [ -f "$archivo" ]; then
        echo "✅ $archivo"
        ((archivos_disponibles++))
    else
        echo "❌ $archivo (no encontrado)"
    fi
done

echo ""
echo "📊 Archivos disponibles: $archivos_disponibles de ${#archivos_pdf[@]}"

# Crear script Python para combinar PDFs
cat > combinar_pdfs.py << 'EOF'
import sys
import os
from pathlib import Path

# Intentar importar PyPDF2, si no está instalado, usar alternativa
try:
    from PyPDF2 import PdfMerger
    use_pypdf2 = True
except ImportError:
    use_pypdf2 = False
    print("⚠️  PyPDF2 no está instalado. Usando método alternativo...")

def combinar_pdfs_pypdf2(archivos_pdf, archivo_salida):
    """Combinar PDFs usando PyPDF2"""
    merger = PdfMerger()
    
    for archivo in archivos_pdf:
        if os.path.exists(archivo):
            print(f"📄 Agregando: {archivo}")
            merger.append(archivo)
    
    with open(archivo_salida, 'wb') as salida:
        merger.write(salida)
    
    merger.close()
    return True

def combinar_pdfs_alternativo(archivos_pdf, archivo_salida):
    """Método alternativo usando herramientas del sistema"""
    import subprocess
    
    # Verificar si existe pdftk o usar herramientas de macOS
    archivos_existentes = [f for f in archivos_pdf if os.path.exists(f)]
    
    if not archivos_existentes:
        return False
    
    # Intentar usando herramientas de macOS (si está disponible)
    try:
        # Usar Python's subprocess para concatenar PDFs
        print("🔄 Combinando PDFs usando método alternativo...")
        return False  # Indicar que necesita método manual
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

# Lista de archivos en orden
archivos_orden = [
    "01-datos-paciente-perfil-demografico.pdf",
    "02-cronologia-clinica-progresion-cronologica.pdf",
    "03-diagnosticos-estudios-imagen.pdf",
    "03-diagnosticos-resultados-laboratorio.pdf",
    "04-tratamientos-procedimientos-quirurgicos.pdf",
    "04-tratamientos-protocolos-medicacion.pdf",
    "04-tratamientos-cuidados-soporte.pdf",
    "05-evaluaciones-conclusiones-diagnosticas.pdf",
    "05-evaluaciones-estado-actual.pdf",
    "05-evaluaciones-notas-evolucion.pdf"
]

archivo_salida = "../expediente-final/Expediente-Medico-Dylan-Martinez-Labastida-Completo.pdf"

if use_pypdf2:
    try:
        combinar_pdfs_pypdf2(archivos_orden, archivo_salida)
        print(f"✅ PDF combinado creado: {archivo_salida}")
        print(f"📊 Tamaño del archivo: {os.path.getsize(archivo_salida)} bytes")
    except Exception as e:
        print(f"❌ Error al combinar PDFs: {e}")
        print("💡 Usa el método manual con Preview o Adobe Acrobat")
else:
    print("📋 INSTRUCCIONES PARA COMBINAR MANUALMENTE:")
    print("1. Abre Preview en macOS")
    print("2. Archivo → Abrir → Selecciona todos los PDFs")
    print("3. Ve a Ver → Miniaturas")
    print("4. Arrastra los PDFs para ordenarlos según:")
    for i, archivo in enumerate(archivos_orden, 1):
        print(f"   {i}. {archivo}")
    print("5. Selecciona todo con Cmd+A")
    print("6. Archivo → Exportar como PDF")
    print("7. Guarda como: Expediente-Medico-Dylan-Martinez-Labastida-Completo.pdf")
EOF

# Ejecutar el script Python
python3 combinar_pdfs.py

# Volver al directorio original
cd ..

echo ""
echo "🏥 Expediente médico de Dylan Martinez Labastida"
echo "📋 Paciente: 8 años, Apendicitis complicada"
echo "📄 Archivos individuales: pdfs-finales/"
echo "📄 Archivo combinado: expediente-final/"
echo ""
echo "✅ Proceso completado"