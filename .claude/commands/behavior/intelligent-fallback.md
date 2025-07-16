# Comando: /intelligent-fallback

**Categoría**: Sistema  
**Propósito**: Protocolos inteligentes de recuperación automática y gestión de fallbacks basados en análisis de contexto de fallo

## Cuándo usar este comando
- Cuando un comando o workflow ha fallado
- Para implementar recuperación automática ante fallos
- Al necesitar análisis de contexto de fallo para estrategia de recuperación
- Para gestionar fallbacks en procesos de alta criticidad
- Al detectar desviaciones significativas en ejecución
- Para mantener continuidad en conversaciones complejas

## Qué hace este comando

### 1. Análisis de Contexto de Fallo
Evalúa qué falló y por qué para determinar la estrategia de recuperación óptima:
- **Análisis de Tipo de Fallo**: Comando individual, workflow completo, o sistema general
- **Contexto del Fallo**: Recursos disponibles, dependencias afectadas, estado del sistema
- **Impacto del Fallo**: Alcance de las consecuencias y urgencia de recuperación
- **Recursos Disponibles**: Comandos alternativos, capacidad de procesamiento, tiempo disponible

### 2. Selección de Estrategia de Fallback
Determina el enfoque de recuperación basado en el análisis de fallo:

**Por Tipo de Fallo**:
- **Fallo de Comando Atómico**: Usar comando alternativo o escalación a orchestrator
- **Fallo de Orchestrator**: Descomposición en comandos atómicos o escalación a meta-comando
- **Fallo de Meta-Comando**: Deployment de agentes especializados o fallback manual
- **Fallo de Sistema**: Activación de protocolos de emergencia y recuperación total

**Por Nivel de Confianza**:
- **Confianza Alta (≥85%)**: Fallback directo con comando alternativo
- **Confianza Media (70-85%)**: Análisis adicional + workflow de recuperación
- **Confianza Baja (50-70%)**: Deployment de múltiples agentes especializados
- **Confianza Muy Baja (<50%)**: Escalación a exploración comprensiva

### 3. Selección de Enfoque de Recuperación
Elige el método de recuperación más apropiado:

**Fallback Atómico**:
- Identificar comandos alternativos en el registro
- Verificar compatibilidad con objetivos originales
- Ejecutar comando alternativo con contexto adaptado
- Validar que el resultado cumple criterios originales

**Escalación a Orchestrator**:
- Activar workflow orchestrator para coordinar recuperación
- Descomponer objetivo fallido en sub-objetivos manejables
- Ejecutar recovery workflow con verificación continua
- Integrar resultados en flujo principal

**Deployment de Agentes**:
- Desplegar hasta 10 agentes especializados para recuperación
- Asignar especializaciones basadas en tipo de fallo
- Ejecutar análisis paralelo del problema desde múltiples perspectivas
- Sintetizar soluciones de agentes en estrategia unificada

### 4. Ejecución de Recuperación Automática
Implementa la estrategia de recuperación seleccionada:

**Protocolo de Recuperación Dinámica**:
```
1. ANALIZAR: Contexto de fallo y recursos disponibles
2. SELECCIONAR: Estrategia óptima basada en análisis
3. EJECUTAR: Implementación de recovery approach
4. VERIFICAR: Validación de recuperación exitosa
5. DOCUMENTAR: Patrón de fallback para optimización futura
```

**Criterios de Validación de Recuperación**:
- Objetivo original alcanzado con confianza ≥85%
- No degradación de calidad respecto a enfoque original
- Tiempo de recuperación dentro de límites aceptables
- Aprendizaje documentado para prevención futura

### 5. Integración con Routing Basado en Comandos
Coordina con el sistema de decisiones para routing inteligente:

**Proceso de Routing Inteligente**:
1. **Calcular Parámetros de Routing**: Usar `/decision-engine` para evaluar opciones
2. **Seleccionar Estrategia de Ejecución** basada en confianza:
   - **Confianza Alta (≥90%)**: Ejecución directa de comando atómico
   - **Confianza Media (70-90%)**: Workflow orchestrado con fallbacks preparados
   - **Confianza Baja (50-70%)**: Coordinación de múltiples workflows con recovery automático
   - **Confianza Muy Baja (<50%)**: Deployment de hasta 10 agentes especializados
3. **Ejecutar Estrategia Seleccionada**: Implementar con monitoring continuo
4. **Monitorear Ejecución**: Detectar problemas temprano para recovery proactivo
5. **Aprender del Routing**: Documentar decisiones para optimización futura

### 6. Protocolo de Recuperación en Bucles de Verificación
Maneja fallos en verificación matemática continua:

**Gestión de Desviaciones**:
- **Detección de Desviaciones**: Alerta cuando desviación excede umbral del 5%
- **Análisis de Causa Raíz**: Identificar fuente de desviación para corrección dirigida
- **Protocolos de Auto-Corrección**: Ajuste automático cuando está fuera de objetivo
- **Garantía de Convergencia**: Criterios matemáticos de salida aseguran finalización
- **Escalación de Fallback**: Protocolo de escalación si convergencia no se logra

**Fallback para Bucles de Verificación**:
```
SI: Desviación > 5% Y Intentos_Auto_Corrección > 3
ENTONCES: Ejecutar protocolo de fallback específico
- Analizar patrones de fallo en bucle
- Ajustar criterios de convergencia dinámicamente
- Implementar estrategia de recovery alternativa
- Documentar patrón para prevención futura
```

## Guías de Recovery

### Por Contexto de Fallo
- **Fallo Técnico**: Comando alternativo → Orchestrator → Agentes especializados
- **Fallo de Recursos**: Optimización de contexto → Simplificación → Parallelización
- **Fallo de Comprensión**: Exploración adicional → Análisis multi-agente → Escalación humana
- **Fallo de Tiempo**: Priorización → Paralelización → Checkpoint y continuación

### Por Criticidad
- **Crítico**: Recovery automático inmediato con máximos recursos
- **Alto**: Análisis rápido + recovery coordinado
- **Medio**: Recovery estándar con documentación
- **Bajo**: Recovery diferido con aprendizaje

### Documentación de Patrones
- **Capturar Uso de Fallback**: Registrar patrones de fallo para optimización
- **Analizar Efectividad**: Medir éxito de diferentes estrategias de recovery
- **Optimizar Estrategias**: Refinar protocolos basado en datos históricos
- **Prevenir Fallos Futuros**: Identificar patrones para prevención proactiva

## Fallbacks Automáticos del Sistema
1. **Si análisis de fallo falla**: Usar recovery conservador con máxima seguridad
2. **Si strategy selection falla**: Escalar a deployment de agentes múltiples
3. **Si recovery execution falla**: Activar protocolo de emergencia manual
4. **Si documentation falla**: Continuar operación + documentar posteriormente

## Verificación de Recovery
- **Recovery success rate**: ≥95% de recuperaciones exitosas
- **Recovery time**: ≤20% tiempo adicional vs ejecución original
- **Quality preservation**: ≥95% calidad mantenida post-recovery
- **Learning efficiency**: 100% patrones documentados para mejora

## Integración con Ecosistema
- **Decision Engine**: Para análisis de contexto y strategy selection
- **Command Registry**: Para identificar comandos alternativos disponibles
- **Verification Workflow**: Para validar recuperación exitosa
- **Pattern Recognition**: Para aprender de patrones de fallo y recovery
- **Conversation Lifecycle**: Para mantener continuidad durante recovery

## Nota
Este comando implementa el sistema nervioso de recuperación del ecosistema Context Engineering. Garantiza continuidad operacional a través de protocolos inteligentes de fallback que mantienen la filosofía de simplicidad mientras proporcionan robustez enterprise-grade.