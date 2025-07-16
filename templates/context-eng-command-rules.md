# Reglas y Principios del Context-Eng Command

## 🎯 REGLAS UNIVERSALES PARA TODOS LOS COMANDOS

### **Meta-Principio Base**
"Enable models through structured context, not control."

Todos los comandos deben habilitar la inteligencia del modelo a través de contexto estructurado, no intentar controlarlo mediante instrucciones restrictivas.

### **🎯 ESTRATEGIA DE TERMINOLOGÍA: LLM vs HUMANO**

**Principio Fundamental**: La terminología debe adaptarse a la audiencia objetivo para máxima efectividad.

#### **Terminología Fuerte para LLMs (PRESERVAR SIEMPRE)**

**Palabras Clave Estratégicas**:
- `MANDATORY` - Para requerimientos absolutos e inflexibles
- `CRITICAL` - Para elementos esenciales del sistema
- `MUST` / `REQUIRED` - Para obligaciones imperativas
- `FORBIDDEN` / `NEVER` - Para prohibiciones categóricas
- `ALWAYS` / `EVERY` - Para consistencia obligatoria

**Justificación Estratégica**:
Estas palabras funcionan como **estrategias de control y refuerzo de comportamiento** para LLMs, asegurando que instrucciones importantes sean seguidas consistentemente. Son especialmente efectivas para:
- Protocolos de ejecución de herramientas
- Requerimientos de cumplimiento
- Prohibiciones de simulación
- Estándares de transparencia

#### **Lenguaje Natural para Humanos (SIMPLIFICAR SIEMPRE)**

**Principios de Escritura Humana**:
- Títulos claros, concisos y descriptivos
- Explicaciones en lenguaje natural fácil de entender
- Tono neutro, profesional y técnico apropiado
- Eliminación de jerga innecesaria

**Aplicación por Contexto**:
```yaml
# ✅ CORRECTO - Secciones de Instrucciones LLM
llm_instruction_sections:
  titles: "MANDATORY EXECUTION REQUIREMENTS", "CRITICAL TOOL CALL PROTOCOL"
  content: "MUST execute", "FORBIDDEN to simulate", "ALWAYS display"
  purpose: "Reforzar comportamientos específicos del LLM"

# ✅ CORRECTO - Secciones Descriptivas para Humanos  
human_documentation_sections:
  titles: "Sistema de Activación Inteligente", "Protocolo de Ejecución"
  content: "Este sistema adapta...", "Proporciona contexto..."
  purpose: "Facilitar comprensión humana y navegación"
```

---

## 🧠 ESTRUCTURA FUNDAMENTAL OBLIGATORIA

### **1. AUTO-ACTIVATION TRIGGERS (Obligatorio para todos los comandos)**

Cada comando DEBE definir disparadores automáticos claros:

```yaml
auto_activation_triggers:
  primary_trigger:
    condition: "[Condición específica del comando]"
    threshold: "[Umbral numérico cuando aplique]"
    action: "[Acción de auto-activación]"
    verification: "[Método de verificación]"
    
  complexity_trigger:
    condition: "Task complexity ≥ [threshold]"
    threshold: "[Valor específico del comando]"
    action: "Auto-activate [command-name] for [purpose]"
    verification: "[Método de validación]"
    
  confidence_trigger:
    condition: "Confidence < [threshold]"
    threshold: "[Valor específico del comando]" 
    action: "Auto-activate [command-name] for [purpose]"
    verification: "[Criterio de éxito]"
```

### **2. ADAPTIVE INTELLIGENT ACTIVATION PROTOCOL (Obligatorio)**

Todos los comandos deben implementar activación inteligente que escale según complejidad:

```yaml
adaptive_activation:
  simple_tasks:
    complexity_threshold: "≤ 1.0"
    confidence_threshold: "≥ 0.8"
    execution_mode: "direct_execution"
    optimization: "minimal_overhead"
    
  medium_tasks:
    complexity_threshold: "1.0 - 1.5"
    confidence_threshold: "0.6 - 0.8"
    execution_mode: "strategic_execution"
    optimization: "balanced_approach"
    
  complex_tasks:
    complexity_threshold: "≥ 1.5"
    confidence_threshold: "< 0.6"
    execution_mode: "comprehensive_orchestration"
    optimization: "maximum_quality"
```

### **3. PROTOCOLO UNIVERSAL DE INTEGRACIÓN DE SCRIPTS (Obligatorio)**

Todos los comandos DEBEN implementar el fundamento matemático de 5 fases:

```yaml
universal_script_integration:
  phase_0_script_system_validation:
    purpose: "Validar disponibilidad de scripts y fundamento matemático"
    requirement: "100% disponibilidad de scripts antes de ejecución"
    scripts: ["formulas/", "core/calculate-real-metrics.sh", "compliance/"]
    
  phase_1_formula_library_loading:
    purpose: "Cargar funciones de cálculo matemático"
    script: "formulas/context_engineering_formulas.sh"
    precision: "4 lugares decimales (tolerancia ±0.0001)"
    
  phase_2_real_time_metrics:
    purpose: "Ejecutar cálculo integral de métricas"
    script: "core/calculate-real-metrics.sh"
    integration: "Actualizaciones de registro con datos reales"
    
  phase_3_mathematical_validation:
    purpose: "Validar precisión matemática y cumplimiento"
    script: "compliance/verify-mathematical-formulas.sh"
    requirement: "≥21/22 pruebas pasan (umbral 95%)"
    
  phase_4_trigger_system_validation:
    purpose: "Validar condiciones de disparador automático"
    script: "core/test-trigger-system.sh"
    tests: "22 pruebas de validación de disparadores"
```

### **4. PROTOCOLO UNIVERSAL DE EJECUCIÓN DE LLAMADAS DE HERRAMIENTAS (Obligatorio)**

Todos los comandos DEBEN cumplir con P55/P56:

```yaml
universal_tool_call_protocol:
  core_principle:
    no_simulation: "NO SE PERMITE SIMULACIÓN - Ejecutar llamadas reales"
    complete_transparency: "Anuncios visuales P56 para CADA ejecución"
    evidence_requirement: "Usuarios deben ver salidas reales"
    
  tool_selection_matrix:
    bash_tool:
      usage: "Ejecución de scripts, cálculos matemáticos"
      announcement: "Anuncio P56 obligatorio antes de ejecución"
      evidence: "Salidas reales con resultados numéricos"
      
    read_tool:
      usage: "Carga de comandos, acceso a documentación"
      announcement: "Anuncio P56 de carga de contenido"
      evidence: "Contenidos reales mostrados al usuario"
      
    task_tool:
      usage: "Flujos complejos, orquestación multi-paso"
      announcement: "Anuncio P56 de despliegue de agente"
      evidence: "Progreso real de agente y resultados"
```

---

## ⚡ REGLAS DE ESTRUCTURA DE COMANDO

### **5. SECCIÓN DE ENCABEZADO (Obligatorio)**

```markdown
# [Nombre del Comando]

## Command: `/[command-name]` (aliases: `/[alias1]`, `/[alias2]`)

**Meta-Principle**: "[Principio filosófico que guía el comando]"

[Descripción concisa del propósito y capacidades del comando]

**Enhanced with [Mejora Clave]**: [Descripción de capacidades especiales]
```

### **6. SECCIÓN DE DISPARADORES (Obligatorio)**

```markdown
## 🎯 AUTO-ACTIVATION TRIGGERS

### **Auto-Activation Purpose**
[Explicación clara de cuándo y por qué se auto-activa el comando]

### **PRIMARY TRIGGERS (Automatic Activation)**
[Definición específica de todos los disparadores automáticos]
```

### **7. PROTOCOLO DE EJECUCIÓN (Obligatorio)**

```markdown
## 🚀 [NOMBRE] ACTIVATION PROTOCOL

[Descripción del protocolo de activación específico del comando]

### **Enhanced Execution Protocol with [Característica]**
[Detalles del protocolo mejorado con comunicación/scripts/etc.]
```

### **8. INTEGRACIÓN DE HERRAMIENTAS (Obligatorio)**

```markdown
## 🔧 TOOL CALL EXECUTION PROTOCOL

### **[Nombre] Tool Integration**
[Especificación de las herramientas que usa el comando]

### **P56 Compliance Integration**
[Detalles de cumplimiento con transparencia visual]
```

### **9. MÉTRICAS Y VALIDACIÓN (Obligatorio)**

```markdown
## 📊 SUCCESS METRICS & VALIDATION

### **Performance Metrics**
[Métricas específicas de rendimiento del comando]

### **Mathematical Validation**
[Requisitos de validación matemática]

### **Quality Gates**
[Umbrales de calidad que debe cumplir]
```

---

## 🛡️ REGLAS DE CUMPLIMIENTO

### **10. PRINCIPIO #55 - TOOL CALL EXECUTION BRIDGING (Obligatorio)**

Todos los comandos DEBEN:

- **MANDATORY TOOL CALL EXECUTION**: Usar herramientas reales, nunca simular
- **EXPLICIT REQUIREMENT**: Ejecución real vs simulación en todas las operaciones
- **TOOL CALL DEPLOYMENT**: Despliegue de agentes Task cuando sea necesario
- **TOOL CALL TRACKING**: Seguimiento de rendimiento de ejecuciones reales

### **11. PRINCIPIO #56 - COMMAND EXECUTION TRANSPARENCY (Obligatorio)**

Todos los comandos DEBEN:

- **Enhanced Visual Announcement**: Anuncio visual antes de cada ejecución
- **Real-time Progress Reporting**: Reportes de progreso en tiempo real
- **Completion Handoff Notification**: Notificación de transferencia de control
- **Error Communication**: Transparencia en errores y acciones de recuperación

### **12. ANUNCIO VISUAL P56 (Obligatorio)**

Formato estándar para todos los comandos:

```
╔═══════════════════════════════════════════════════════════╗
║              🎯 [COMMAND NAME] EXECUTION                  ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /[command-name] | Priority: [LEVEL]             ║
║ Purpose: [purpose] | Duration: [estimate]                ║
║ Context: [context] | Agent: [agent_type]                 ║
║ Real Actions: ✅ | Simulation: ❌                        ║
╚═══════════════════════════════════════════════════════════╝

🚀 [Action Description] | 📊 [Progress Tracking] | ⚡ [Real Execution]

[ACTUAL TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [SUCCESS/FAILED] | Results: [actual_outputs]     ║
║ Duration: [execution_time] | Evidence: [user_proof]      ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🔄 REGLAS DE INTEGRACIÓN

### **13. DYNAMIC COMMAND REGISTRY INTEGRATION (Obligatorio)**

Todos los comandos deben integrarse con el registro dinámico:

```yaml
registry_integration:
  real_time_discovery:
    registry_analysis: "Análisis en vivo del command-registry.json"
    performance_metrics: "Métricas de éxito y tiempos de ejecución"
    adaptive_selection: "Selección dinámica basada en estado del registro"
    
  command_performance_tracking:
    success_rate_monitoring: "Seguimiento continuo de tasas de éxito"
    execution_time_optimization: "Selección basada en métricas de rendimiento"
    user_preference_learning: "Adaptación basada en patrones de usuario"
```

### **14. INTELLIGENT COMMAND ORCHESTRATION (Obligatorio)**

```yaml
command_orchestration:
  modular_architecture: "Funcionalidad descompuesta en comandos enfocados"
  context_economy: "80% reducción con 100% funcionalidad vía /context-economy"
  dynamic_orchestration: "Encadenamiento inteligente vía /command-orchestration-workflow"
  complexity_enforcement: "Bloqueo automático vía /complexity-enforcement"
```

### **15. ENHANCED COMMUNICATION PROTOCOL (Obligatorio)**

```yaml
communication_protocol:
  bidirectional_communication: "Comunicación bidireccional con agentes Task"
  progress_monitoring: "Monitoreo de progreso cada ≤30 segundos"
  status_updates: "Actualizaciones de estado en tiempo real"
  handoff_management: "Manejo adecuado de transferencias de control"
```

---

## 📈 REGLAS DE OPTIMIZACIÓN

### **16. INTELLIGENT PARALLEL EXECUTION (Opcional pero Recomendado)**

```yaml
parallel_execution:
  parallel_analysis: "/parallel-over-sequential evalúa beneficios (≥0.3 threshold)"
  multi_agent_coordination: "Hasta 10 agentes Task con comunicación bidireccional"
  context_economy: "80% reducción vía /context-economy"
  dependency_management: "Optimización continua vía /dynamic-dependency-analysis"
```

### **17. ADAPTIVE LEARNING ENGINE (Opcional)**

```yaml
adaptive_learning:
  pattern_recognition: "Identificación de patrones de uso exitosos"
  success_correlation: "Correlación entre patrones y tasas de éxito"
  automatic_optimization: "Optimización automática basada en aprendizaje"
  user_preference_adaptation: "Adaptación a estilos de trabajo del usuario"
```

### **18. PATTERN CRYSTALLIZATION (Obligatorio para meta-comandos)**

```yaml
pattern_crystallization:
  pattern_detection: "Detección automática vía /recognize-patterns"
  success_threshold: "≥85% tasa de éxito para cristalización"
  command_generation: "Generación automática de comandos reutilizables"
  registry_integration: "Integración automática con registro de comandos"
```

---

## 🎯 REGLAS DE VALIDACIÓN

### **19. MULTI-DIMENSIONAL VERIFICATION (Obligatorio)**

```yaml
verification_requirements:
  workflow_verification: "Verificación de flujo de trabajo completo"
  confidence_assessment: "Evaluación multi-dimensional de confianza"
  mathematical_precision: "Precisión matemática recursiva"
  compliance_validation: "Validación P55/P56 continua"
```

### **20. DYNAMIC CONFIDENCE SCORING (Obligatorio)**

```yaml
confidence_scoring:
  multi_dimensional_assessment: "Evaluación funcional, visual, rendimiento, comportamental"
  adaptive_thresholds: "Umbrales ajustados según contexto de tarea"
  mathematical_loops: "Bucles recursivos para precisión"
  compliance_integration: "Validación continua de cumplimiento"
```

---

## 🔐 REGLAS DE ENFORCEMENT

### **21. MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Crítico)**

```yaml
llm_behavior_requirements:
  tool_call_execution:
    - "CRITICAL: Display P56 announcement BEFORE executing ANY tool"
    - "EXPLICIT: Every 'Deploy', 'Execute', 'Activate' REQUIRES real tool calls"
    - "MANDATORY: NEVER simulate - ALWAYS execute actual tool calls"
    - "REQUIRED: Show Task agent status updates as they occur"
    
  verification_protocol:
    - "Each 'action:' in protocols REQUIRES tool call execution"
    - "Every 'task_agents:' deployment REQUIRES Task tool call"
    - "All 'command:' references REQUIRE actual command execution"
    - "NO EXCEPTIONS: Simulation prohibited, only real execution"
```

### **22. COMPLIANCE ENFORCEMENT (Crítico)**

```yaml
compliance_enforcement:
  never_skip_announcements: "Todo llamado de herramienta debe tener anuncio visual"
  never_allow_communication_gaps: "Agentes Task deben reportar estado"
  never_hide_task_deployment: "Siempre anunciar cuando se despliegan agentes"
  never_simulate: "Todas las llamadas deben ser ejecución real"
  always_display_progress: "Usuarios deben ver estado de agentes Task"
  always_handle_handoffs: "Transferencia adecuada de control"
```

---

## 💡 FILOSOFÍA DE IMPLEMENTACIÓN

### **23. MODULAR EXCELLENCE PRINCIPLE**

- **Single Responsibility**: Cada comando tiene un propósito enfocado
- **Reusable Components**: Comandos usables independiente o en combinación
- **Testable Units**: Cada comando verificado independientemente
- **Evolutionary Growth**: Nuevos comandos sin romper funcionalidad existente

### **24. ENABLE, DON'T CONTROL PHILOSOPHY**

- **Structured Context**: Proporcionar contexto rico para habilitar inteligencia
- **Autonomous Execution**: Permitir ejecución autónoma dentro de estructura
- **Dynamic Adaptation**: Adaptación inteligente basada en contexto y resultados
- **Natural Language**: Comandos en lenguaje natural, claro y legible

---

## 🚀 TEMPLATE APPLICATION GUIDE

### **25. CÓMO USAR ESTA PLANTILLA**

1. **Copiar estructura base** de `context-eng-command-template.md`
2. **Aplicar reglas obligatorias** de este archivo
3. **Personalizar para propósito específico** del comando
4. **Implementar disparadores automáticos** apropiados
5. **Integrar protocolos de herramientas** necesarios
6. **Definir métricas de validación** específicas
7. **Asegurar cumplimiento P55/P56** completo

### **26. CHECKLIST DE VALIDACIÓN**

Antes de considerar un comando completo, verificar:

- ✅ **Auto-activation triggers** definidos claramente
- ✅ **Adaptive activation protocol** implementado
- ✅ **Script integration** protocolo de 5 fases
- ✅ **Tool call protocol** P55/P56 compliance
- ✅ **Visual announcements** formato estándar
- ✅ **Registry integration** capacidades dinámicas
- ✅ **Communication protocol** bidireccional
- ✅ **Verification system** multi-dimensional
- ✅ **Performance metrics** definidas
- ✅ **Enforcement rules** implementadas

---

## 📋 **REGLAS ESPECÍFICAS DE TERMINOLOGÍA**

### **27. PRESERVACIÓN DE TERMINOLOGÍA FUERTE**

**NUNCA remover o debilitar** en secciones de instrucciones LLM:
- "MANDATORY" → "required" ❌
- "CRITICAL" → "important" ❌  
- "MUST" → "should" ❌
- "FORBIDDEN" → "avoid" ❌
- "ALWAYS" → "typically" ❌

### **28. SIMPLIFICACIÓN PARA DOCUMENTACIÓN HUMANA**

**SIEMPRE usar lenguaje natural** en secciones descriptivas:
- "ADAPTIVE INTELLIGENT ACTIVATION PROTOCOL" → "Sistema de Activación Inteligente" ✅
- "MANDATORY BEHAVIORAL INSTRUCTIONS" → "Requerimientos de Ejecución" ✅
- "CRITICAL VALIDATION PROTOCOL" → "Protocolo de Validación" ✅

### **29. IDENTIFICACIÓN DE SECCIONES POR AUDIENCIA**

```yaml
# Secciones para LLMs (preservar terminología fuerte)
llm_target_sections:
  - "MANDATORY [...]" - Cualquier título con MANDATORY
  - "CRITICAL [...]" - Cualquier título con CRITICAL  
  - Tool Call Requirements - Protocolos de herramientas
  - Behavioral Instructions - Instrucciones de comportamiento
  - Compliance sections - Secciones de cumplimiento

# Secciones para Humanos (usar lenguaje natural)
human_target_sections:
  - Descriptions - Descripciones de funcionalidad
  - System overviews - Resúmenes de sistema
  - Usage examples - Ejemplos de uso
  - Philosophy sections - Secciones de filosofía
  - Navigation guides - Guías de navegación
```

---

**Nota Final**: Estas reglas aseguran que todos los comandos mantengan la excelencia, consistencia y filosofía del sistema Context Engineering, balanceando efectividad en control de LLM con claridad para usuarios humanos through strategic terminology adaptation.