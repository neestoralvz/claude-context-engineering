# Template: Explicit Trigger Activation System

## Para usar este template:
1. Copia la sección "AUTO-ACTIVATION TRIGGERS" completa 
2. Reemplaza [COMMAND_NAME] con el nombre del comando
3. Actualiza las condiciones de triggers según el comando específico
4. Mantén el formato de lenguaje natural

---

## 🎯 AUTO-ACTIVATION TRIGGERS

### **Propósito de Triggers**
Este comando se activa automáticamente cuando el sistema detecta las condiciones matemáticas específicas definidas por el Principio #5 (Mathematical Auto-Activation). Los triggers están diseñados para sistemas agentic LLM que requieren activación autónoma sin intervención manual.

### **TRIGGERS PRIMARIOS (Activación Automática)**

**TRIGGER PRINCIPAL**: [Definir condición principal específica para este comando]
- **Condición**: [Descripción en lenguaje natural]
- **Umbral**: [Valor numérico específico]
- **Acción**: Activar [COMMAND_NAME] automáticamente
- **Verificación**: [Criterio de éxito específico]

**TRIGGER COMPLEJIDAD**: Cuando la complejidad de la tarea alcanza [X] o superior
- **Condición**: Task complexity ≥ [valor]
- **Umbral**: [0.3/0.7/1.0/1.5] según el comando
- **Acción**: Escalar a [COMMAND_NAME] para procesamiento avanzado
- **Verificación**: Complejidad manejada efectivamente

**TRIGGER CONFIANZA**: Cuando la confianza del sistema cae por debajo de [X]
- **Condición**: Confidence score < [valor]
- **Umbral**: [0.3/0.5/0.7/0.9] según el comando
- **Acción**: Activar [COMMAND_NAME] para refuerzo
- **Verificación**: Confianza restaurada ≥ umbral target

### **TRIGGERS SECUNDARIOS (Activación Contextual)**

**TRIGGER DEPENDENCIAS**: Cuando se detectan dependencias complejas
- **Condición**: Dependencies detected = true
- **Umbral**: ≥2 dependencias interconectadas
- **Acción**: Activar [COMMAND_NAME] para análisis de dependencias
- **Verificación**: Dependencias resueltas exitosamente

**TRIGGER PARALELO**: Cuando el beneficio paralelo justifica activación
- **Condición**: Parallel benefit ≥ 0.3
- **Umbral**: Net benefit calculation ≥ 30%
- **Acción**: Activar [COMMAND_NAME] en modo paralelo
- **Verificación**: Beneficio paralelo alcanzado

**TRIGGER PATRÓN**: Cuando se detecta patrón conocido
- **Condición**: Pattern match ≥ 0.85
- **Umbral**: 85% de coincidencia con patrón establecido
- **Acción**: Activar [COMMAND_NAME] basado en patrón
- **Verificación**: Patrón aplicado exitosamente

### **TRIGGERS TERCIARIOS (Activación de Respaldo)**

**TRIGGER FALLO**: Cuando otros enfoques fallan
- **Condición**: Primary approach failed
- **Umbral**: 2+ intentos fallidos
- **Acción**: Activar [COMMAND_NAME] como fallback
- **Verificación**: Recuperación exitosa

**TRIGGER TIEMPO**: Cuando se excede tiempo esperado
- **Condición**: Execution time > expected + 50%
- **Umbral**: 1.5x tiempo estimado
- **Acción**: Activar [COMMAND_NAME] para aceleración
- **Verificación**: Tiempo reducido a rango aceptable

**TRIGGER CONTEXTO**: Cuando se requiere contexto específico
- **Condición**: Context specificity required
- **Umbral**: Domain-specific context needed
- **Acción**: Activar [COMMAND_NAME] con contexto especializado
- **Verificación**: Contexto aplicado efectivamente

### **SYSTEM TRIGGERS (Activación del Sistema)**

**TRIGGER MATEMÁTICO**: Basado en cálculos automáticos
- **Condición**: Mathematical threshold crossed
- **Umbral**: [Fórmula específica del comando]
- **Acción**: Activación automática inmediata
- **Verificación**: Criterios matemáticos satisfechos

**TRIGGER CALIDAD**: Cuando se requiere mejora de calidad
- **Condición**: Quality metrics < target
- **Umbral**: [Métricas específicas del comando]
- **Acción**: Activar [COMMAND_NAME] para mejora
- **Verificación**: Calidad mejorada ≥ target

---

## 🔄 MONITORING TRIGGERS (Activación Continua)

### **Evaluación en Tiempo Real**
- **Frecuencia**: Cada 30 segundos durante ejecución
- **Métricas**: [Específicas del comando]
- **Re-evaluación**: Triggers recalculados dinámicamente
- **Adaptación**: Umbrales ajustados según contexto

### **Trigger Cascade (Activación en Cascada)**
- **Primario → Secundario**: Si primario falla, activar secundario
- **Secundario → Terciario**: Si secundario falla, activar terciario
- **Terciario → Manual**: Si terciario falla, escalar a intervención manual

### **Trigger Learning (Aprendizaje de Triggers)**
- **Efectividad**: Tracking de success rate de cada trigger
- **Optimización**: Ajuste automático de umbrales
- **Evolución**: Nuevos triggers detectados automáticamente

---

## 📊 TRIGGER VERIFICATION (Verificación de Triggers)

### **Métricas de Activación**
- **Trigger Accuracy**: ≥95% precisión en detección
- **Activation Speed**: ≤5 segundos desde detección
- **False Positive Rate**: ≤2% activaciones incorrectas
- **Success Rate**: ≥90% resolución exitosa post-activación

### **Trigger Monitoring Dashboard**
**[Command Name] Trigger Status**:
- Primary Triggers: [ACTIVE/INACTIVE]
- Secondary Triggers: [ACTIVE/INACTIVE]
- Tertiary Triggers: [ACTIVE/INACTIVE]
- Last Activation: [timestamp]
- Success Rate: [percentage]
- Average Response Time: [seconds]

### **Trigger Debugging**
- **Trigger Log**: Registro completo de activaciones
- **Threshold History**: Histórico de cambios en umbrales
- **Pattern Analysis**: Análisis de patrones de activación
- **Optimization Suggestions**: Sugerencias de mejora automática

---

## 🔗 TRIGGER INTEGRATION (Integración con Otros Comandos)

### **Trigger Chains (Cadenas de Triggers)**
- **Upstream Triggers**: Comandos que pueden activar este comando
- **Downstream Triggers**: Comandos que este comando puede activar
- **Parallel Triggers**: Comandos que se activan simultáneamente
- **Fallback Triggers**: Comandos de respaldo si este falla

### **Trigger Orchestration (Orquestación de Triggers)**
- **Decision Engine Integration**: Integración con motor de decisiones
- **Confidence Scoring Integration**: Integración con sistema de confianza
- **Verification Integration**: Integración con verificación automática
- **Pattern Recognition Integration**: Integración con reconocimiento de patrones

---

## 💡 USAGE INSTRUCTIONS FOR AGENTIC SYSTEMS

### **Para Sistemas Agentic LLM**:

1. **Monitoreo Continuo**: Evaluar triggers cada 30 segundos
2. **Activación Automática**: Ejecutar comando cuando triggers se cumplen
3. **Verificación Post-Activación**: Confirmar que triggers resolvieron el problema
4. **Aprendizaje**: Ajustar umbrales basado en efectividad histórica

### **Ejemplo de Activación**:
- **Trigger Detected**: Complexity ≥ 1.0
**Activating**:
- COMMAND_NAME
**Context**:
- contexto específico
**Expected Outcome**:
- resultado esperado
**Verification**:
- criterio de éxito

### **Ejemplo de Respuesta del Sistema**:
- **Trigger Acknowledged**: [COMMAND_NAME] activado automáticamente
- **Reason**: [razón específica del trigger]
- **Action Taken**: [acción específica ejecutada]
- **Result**: [resultado obtenido]
- **Success**: [TRUE/FALSE]

---

**Nota**: Este template debe ser adaptado para cada comando específico, manteniendo siempre el formato de lenguaje natural y la filosofía de "Enable, Don't Control" del Context Engineering.