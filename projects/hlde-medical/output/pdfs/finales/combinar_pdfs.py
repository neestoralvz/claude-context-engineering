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
