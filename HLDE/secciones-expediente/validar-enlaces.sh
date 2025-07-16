#!/bin/bash

# Script de Validación de Enlaces del Sistema de Cross-References
# Expediente Médico: Dylan Antonio Martínez Labastida (345370)
# Fecha: 2025-07-16

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
enlaces_totales=0
enlaces_validos=0
enlaces_rotos=0
archivos_procesados=0

echo -e "${BLUE}🔍 VALIDADOR DE ENLACES - EXPEDIENTE MÉDICO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo "Expediente: Dylan Antonio Martínez Labastida (345370)"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Función para validar existencia de ancla en archivo
validar_ancla() {
    local archivo="$1"
    local ancla="$2"
    
    if [ ! -f "$archivo" ]; then
        echo -e "${RED}❌ Archivo no encontrado: $archivo${NC}"
        return 1
    fi
    
    # Buscar ancla en formato {#ancla} o #{ancla}
    if grep -q "{#$ancla}" "$archivo" || grep -q "^#.*{#$ancla}" "$archivo"; then
        return 0
    else
        return 1
    fi
}

# Función para extraer enlaces de un archivo
extraer_enlaces() {
    local archivo="$1"
    echo -e "${YELLOW}📄 Procesando: $archivo${NC}"
    
    # Extraer enlaces internos del tipo [texto](#ancla)
    enlaces_internos=$(grep -o '\[.*\](#[^)]*)' "$archivo" | sed 's/\[.*\](#\([^)]*\))/\1/')
    
    # Extraer enlaces externos del tipo [texto](./archivo.md#ancla)
    enlaces_externos=$(grep -o '\[.*\](\.\/[^)]*\.md#[^)]*) ' "$archivo" | sed 's/\[.*\](\.\/\([^)]*\)\.md#\([^)]*\)).*/\1.md \2/')
    
    echo "  Enlaces internos encontrados: $(echo "$enlaces_internos" | wc -l)"
    echo "  Enlaces externos encontrados: $(echo "$enlaces_externos" | wc -l)"
    
    # Validar enlaces internos
    if [ -n "$enlaces_internos" ]; then
        echo -e "  ${BLUE}Validando enlaces internos...${NC}"
        while IFS= read -r ancla; do
            if [ -n "$ancla" ]; then
                enlaces_totales=$((enlaces_totales + 1))
                if validar_ancla "$archivo" "$ancla"; then
                    echo -e "    ${GREEN}✓${NC} $ancla"
                    enlaces_validos=$((enlaces_validos + 1))
                else
                    echo -e "    ${RED}❌${NC} $ancla (no encontrada)"
                    enlaces_rotos=$((enlaces_rotos + 1))
                fi
            fi
        done <<< "$enlaces_internos"
    fi
    
    # Validar enlaces externos
    if [ -n "$enlaces_externos" ]; then
        echo -e "  ${BLUE}Validando enlaces externos...${NC}"
        while IFS= read -r enlace; do
            if [ -n "$enlace" ]; then
                archivo_destino=$(echo "$enlace" | cut -d' ' -f1)
                ancla_destino=$(echo "$enlace" | cut -d' ' -f2)
                
                enlaces_totales=$((enlaces_totales + 1))
                if validar_ancla "$archivo_destino" "$ancla_destino"; then
                    echo -e "    ${GREEN}✓${NC} $archivo_destino#$ancla_destino"
                    enlaces_validos=$((enlaces_validos + 1))
                else
                    echo -e "    ${RED}❌${NC} $archivo_destino#$ancla_destino (no encontrada)"
                    enlaces_rotos=$((enlaces_rotos + 1))
                fi
            fi
        done <<< "$enlaces_externos"
    fi
    
    echo ""
    archivos_procesados=$((archivos_procesados + 1))
}

# Directorio de trabajo
cd "$(dirname "$0")"

# Archivos a procesar
archivos=(
    "00-indice-general.md"
    "01-informacion-ingreso-paciente.md"
    "02-notas-evolucion-diaria.md"
    "03-notas-interconsulta.md"
    "04-notas-traslado.md"
    "indice-terminos-medicos.md"
)

echo -e "${BLUE}🔍 INICIANDO VALIDACIÓN DE ENLACES${NC}"
echo ""

# Procesar cada archivo
for archivo in "${archivos[@]}"; do
    if [ -f "$archivo" ]; then
        extraer_enlaces "$archivo"
    else
        echo -e "${RED}❌ Archivo no encontrado: $archivo${NC}"
        echo ""
    fi
done

# Reporte final
echo -e "${BLUE}📊 REPORTE DE VALIDACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════${NC}"
echo "Archivos procesados: $archivos_procesados"
echo "Enlaces totales: $enlaces_totales"
echo -e "Enlaces válidos: ${GREEN}$enlaces_validos${NC}"
echo -e "Enlaces rotos: ${RED}$enlaces_rotos${NC}"

# Cálculo de porcentaje
if [ $enlaces_totales -gt 0 ]; then
    porcentaje_validos=$((enlaces_validos * 100 / enlaces_totales))
    echo "Porcentaje de enlaces válidos: $porcentaje_validos%"
fi

echo ""

# Estado del sistema
if [ $enlaces_rotos -eq 0 ]; then
    echo -e "${GREEN}✅ SISTEMA DE ENLACES: ÍNTEGRO${NC}"
    echo "Todos los enlaces funcionan correctamente."
else
    echo -e "${RED}⚠️  SISTEMA DE ENLACES: REQUIERE ATENCIÓN${NC}"
    echo "Se encontraron $enlaces_rotos enlaces rotos que necesitan corrección."
fi

echo ""
echo -e "${BLUE}🔧 RECOMENDACIONES${NC}"
echo "- Ejecutar este script regularmente para mantener la integridad"
echo "- Verificar enlaces rotos y corregir referencias"
echo "- Actualizar anclas cuando se modifique contenido"
echo "- Documentar nuevos términos en el índice médico"

echo ""
echo -e "${BLUE}📝 LOG DE VALIDACIÓN${NC}"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Expediente: Dylan Antonio Martínez Labastida (345370)"
echo "Sistema: Cross-References Medical Record"
echo "Resultado: $enlaces_validos/$enlaces_totales enlaces válidos ($porcentaje_validos%)"

# Generar reporte en archivo
reporte_archivo="reporte-validacion-$(date '+%Y%m%d-%H%M%S').txt"
{
    echo "REPORTE DE VALIDACIÓN DE ENLACES"
    echo "================================"
    echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Expediente: Dylan Antonio Martínez Labastida (345370)"
    echo ""
    echo "ESTADÍSTICAS:"
    echo "- Archivos procesados: $archivos_procesados"
    echo "- Enlaces totales: $enlaces_totales"
    echo "- Enlaces válidos: $enlaces_validos"
    echo "- Enlaces rotos: $enlaces_rotos"
    echo "- Porcentaje de éxito: $porcentaje_validos%"
    echo ""
    echo "ESTADO DEL SISTEMA:"
    if [ $enlaces_rotos -eq 0 ]; then
        echo "✅ ÍNTEGRO - Todos los enlaces funcionan correctamente"
    else
        echo "⚠️  REQUIERE ATENCIÓN - $enlaces_rotos enlaces rotos"
    fi
} > "$reporte_archivo"

echo -e "${GREEN}📄 Reporte guardado en: $reporte_archivo${NC}"

# Código de salida
if [ $enlaces_rotos -eq 0 ]; then
    exit 0
else
    exit 1
fi