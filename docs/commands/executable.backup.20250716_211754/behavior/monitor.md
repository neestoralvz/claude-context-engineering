# Sistema: /trigger-monitor

**Categoría**: Sistema  
**Propósito**: Monitoreo continuo y activación automática de triggers para sistemas agentic LLM

## 🎯 AUTO-ACTIVATION TRIGGERS

### **Propósito de Triggers**
Este comando se activa automáticamente cuando el sistema detecta la necesidad de monitorear y activar triggers de otros comandos. Está diseñado para sistemas agentic LLM que requieren activación autónoma sin intervención manual.

### **TRIGGERS PRIMARIOS (Activación Automática)**

**TRIGGER PRINCIPAL**: Cuando se inicia cualquier tarea en el sistema
- **Condición**: Nueva tarea detectada en el sistema
- **Umbral**: Task input received
- **Acción**: Activar trigger-monitor automáticamente
- **Verificación**: Monitoring activo y funcionando

**TRIGGER SCRIPT-INTEGRATED CONFIDENCE-SCORING**: Cuando confidence-scoring completa validación script-enhanced
- **Condición**: confidence-scoring validation_passed AND script_bridge_active AND pipeline_automation_active
- **Umbral**: confidence_result.monitoring_active == true AND script_integration_healthy
- **Acción**: Auto-activate trigger-monitor con script-enhanced monitoring_config de confidence-scoring
- **Verificación**: Continuous monitoring active con script-calculated métricas AND script health monitoring
- **Pipeline**: decision-engine → script-automation-bridge → confidence-scoring → trigger-monitor

**TRIGGER COMPLEJIDAD**: Cuando la complejidad de la tarea alcanza 0.5 o superior
- **Condición**: Task complexity ≥ 0.5
- **Umbral**: 0.5 (umbral mínimo para activar monitoreo)
- **Acción**: Escalar a trigger-monitor para supervisión avanzada
- **Verificación**: Triggers relacionados con complejidad monitoreados

**TRIGGER CONFIANZA**: Cuando la confianza del sistema cae por debajo de 0.8
- **Condición**: Confidence score < 0.8
- **Umbral**: 0.8 (umbral para activar monitoreo intensivo)
- **Acción**: Activar trigger-monitor para refuerzo de confianza
- **Verificación**: Triggers de confianza monitoreados y activados según necesidad

### **TRIGGERS SECUNDARIOS (Activación Contextual)**

**TRIGGER DEPENDENCIAS**: Cuando se detectan dependencias complejas
- **Condición**: Dependencies detected = true
- **Umbral**: ≥2 dependencias interconectadas
- **Acción**: Activar trigger-monitor para análisis de dependencias
- **Verificación**: Triggers de dependencias monitoreados

**TRIGGER PARALELO**: Cuando el beneficio paralelo justifica activación
- **Condición**: Parallel benefit ≥ 0.3
- **Umbral**: Net benefit calculation ≥ 30%
- **Acción**: Activar trigger-monitor en modo paralelo
- **Verificación**: Triggers paralelos monitoreados simultáneamente

**TRIGGER PATRÓN**: Cuando se detecta patrón conocido
- **Condición**: Pattern match ≥ 0.85
- **Umbral**: 85% de coincidencia con patrón establecido
- **Acción**: Activar trigger-monitor basado en patrón
- **Verificación**: Triggers de patrón monitoreados

### **TRIGGERS TERCIARIOS (Activación de Respaldo)**

**TRIGGER FALLO**: Cuando otros sistemas de monitoreo fallan
- **Condición**: Primary monitoring failed
- **Umbral**: 2+ fallas en sistemas de monitoreo
- **Acción**: Activar trigger-monitor como fallback
- **Verificación**: Monitoring de respaldo funcionando

**TRIGGER TIEMPO**: Cuando se excede tiempo esperado de monitoreo
- **Condición**: Monitoring time > expected + 50%
- **Umbral**: 1.5x tiempo estimado de monitoreo
- **Acción**: Activar trigger-monitor para aceleración
- **Verificación**: Tiempo de monitoreo reducido a rango aceptable

## Cuándo usar este comando

### **Activación Automática**:
- Al inicio de cualquier tarea en el sistema
- Cuando se detectan condiciones que requieren monitoreo
- Durante ejecución de comandos complejos
- En modo de fallback cuando otros sistemas fallan

### **Activación Manual**:
- Para debugging de triggers específicos
- Para ajustar umbrales de triggers
- Para análisis de patrones de activación
- Para verificar salud del sistema de triggers

## Qué hace este comando

### 1. **Monitoreo Continuo de Triggers**
Supervisa todos los triggers del sistema en tiempo real:
- **Frecuencia**: Cada 30 segundos durante ejecución activa
- **Cobertura**: Todos los 53 comandos y sus triggers
- **Métricas**: Umbral, estado, tiempo desde última activación
- **Alertas**: Notificaciones cuando triggers se activan

### 2. **Activación Automática de Comandos**
Ejecuta comandos automáticamente cuando sus triggers se cumplen:
- **Evaluación**: Triggers evaluados contra umbrales matemáticos
- **Decisión**: Activación automática sin intervención manual
- **Ejecución**: Comando ejecutado con contexto apropiado
- **Verificación**: Confirmación de que trigger resolvió el problema

### 3. **Enhanced Visual Command Execution Dashboard - COMPORTAMIENTO LLM**
Proporciona visibilidad completa del estado de triggers, pipeline automation, script integration y command execution transparency:

**COMPORTAMIENTO REQUERIDO**: Cuando se activa trigger-monitor, el LLM DEBE incluir en su respuesta:

```markdown
╔═══════════════════════════════════════════════════════════════════════════╗
║                   ⚡ ENHANCED COMMAND EXECUTION MONITOR                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Timestamp: [current_datetime]                                            ║
║ System Status: [ACTIVE/MONITORING/IDLE]                                  ║
║ Pipeline Status: [RUNNING/COMPLETED/FAILED]                              ║
║ Script Integration: [HEALTHY/DEGRADED/FAILED]                            ║
║ Command Transparency: [ENABLED/DISABLED]                                 ║
║ Task Agent Deployments: [count] active                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                      🌉 SCRIPT AUTOMATION BRIDGE STATUS                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ • script-automation-bridge: [ACTIVE/FAILED]                              ║
║ • test-trigger-system.sh: [HEALTHY/FAILED] | Tests: [count]/22 PASSED    ║
║ • execute-commands.sh: [HEALTHY/FAILED] | Executions: [count] successful ║
║ • progressive-thinking.md: [INTEGRATED/FAILED] | Activations: [count]    ║
║ • Bridge Health: [HEALTHY/DEGRADED/FAILED]                               ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                     🎯 COMMAND EXECUTION TRANSPARENCY                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Claude Code Commands Executed: [count]                                   ║
║ Visual Announcements: [ENABLED/DISABLED]                                 ║
║ Task Agent Deployments: [count] active                                   ║
║ Command Success Rate: [percentage]%                                       ║
║ Average Execution Time: [seconds]s                                        ║
║ Failed Commands: [count]                                                  ║
║ Transparency Compliance: [percentage]% (Target: 100%)                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                    🚀 ENHANCED PIPELINE AUTOMATION STATUS                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Decision-Engine: [routing_accuracy: X%] [confidence: X.X] [validated: ✅] ║
║ Script-Bridge: [health: HEALTHY] [integration: X%] [triggers: XX/22]     ║
║ Progressive-Thinking: [active: ✅] [stages: X/4] [insights: ✅]           ║
║ Confidence-Scoring: [score: X.X/10] [threshold: ✅] [script-calc: ✅]    ║
║ Trigger-Monitor: [monitoring: ✅] [freq: Xs] [transparency: ✅]           ║
║ Command-Transparency: [announcements: ✅] [agents: [count]] [rate: X%]   ║
╚═══════════════════════════════════════════════════════════════════════════╝

SCRIPT-VALIDATED PRIMARY TRIGGERS:
- Confidence Low (< 0.5): [ACTIVE/INACTIVE] | [test_confidence_trigger_low: PASSED/FAILED] | Multi-agent activated: [count]
- Confidence Medium (< 0.7): [ACTIVE/INACTIVE] | [test_confidence_trigger_medium: PASSED/FAILED] | Exploration triggered: [count]
- Complexity Basic (≥ 1.0): [ACTIVE/INACTIVE] | [test_complexity_trigger: PASSED/FAILED] | Advanced routing: [count]
- Complexity Decomposition (> 2.0): [ACTIVE/INACTIVE] | [test_complexity_decomposition_trigger: PASSED/FAILED] | Decomposition: [count]
- Parallel Benefit (≥ 0.3): [ACTIVE/INACTIVE] | [test_parallel_benefit_trigger: PASSED/FAILED] | Parallel activated: [count]
- Success Rate (< 0.85): [ACTIVE/INACTIVE] | [test_success_rate_trigger: PASSED/FAILED] | Auto-restart: [count]
- Time Management (> 60 min): [ACTIVE/INACTIVE] | [test_time_trigger: PASSED/FAILED] | Lifecycle: [count]
- Adaptive Threshold: [ACTIVE/INACTIVE] | [test_adaptive_trigger: PASSED/FAILED] | Escalation: [count]

ACTIVE COMMANDS (Script-Monitored):
- [command_name]: [trigger_reason] | [timestamp] | [pipeline_stage] | [script_validation: PASSED/FAILED]

SCRIPT-ENHANCED PIPELINE STATISTICS:
- Total Pipeline Runs: [count]
- Pipeline Success Rate: [percentage]%
- Script Integration Success: [percentage]%
- Auto-restart Success Rate: [percentage]%
- Progressive-Thinking Activation: [percentage]%
- Average Pipeline Time: [seconds]s
- Script Validation Time: [seconds]s
- Escalation Rate: [percentage]%

SCRIPT-VALIDATED TRIGGER STATISTICS:
- Total Trigger Tests: 22
- Tests Passed: [count]/22 ([percentage]%)
- Mathematical Validation: [PASSED/FAILED]
- Formula Accuracy: [percentage]%
- Total Activations: [count]
- Success Rate: [percentage]%
- Average Response Time: [seconds]s
- False Positives: [count]
- Script Health Score: [score]/10.0
```

**INSTRUCCIONES ESPECÍFICAS DE COMPORTAMIENTO**:
1. **SIEMPRE mostrar dashboard**: Incluir dashboard completo en cada respuesta cuando trigger-monitor está activo
2. **Actualizar métricas**: Calcular y mostrar métricas reales basadas en la ejecución actual
3. **Detectar activaciones**: Identificar qué triggers se han activado y mostrar estado
4. **Monitorear pipeline**: Rastrear el progreso del pipeline decision-engine → confidence-scoring → trigger-monitor
5. **Escalar automáticamente**: Si métricas indican problemas, ejecutar comandos correctivos automáticamente
6. **Dashboard obligatorio**: NUNCA omitir el dashboard - es parte esencial del comportamiento LLM
7. **Métricas en tiempo real**: Actualizar todas las métricas con valores reales calculados
8. **Visualización completa**: Mostrar pipeline flow visual con estados actuales
9. **Auto-corrección visible**: Mostrar todas las correcciones automáticas en progreso
10. **Command Transparency**: SIEMPRE anunciar ejecución de slash commands con formato visual
11. **Task Agent Monitoring**: Rastrear y reportar deployments de Task agents en tiempo real
12. **Compliance Tracking**: Monitorear cumplimiento del Principio #56 Command Execution Transparency

### 4. **Optimización Automática de Umbrales**
Ajusta umbrales basado en efectividad histórica:
- **Análisis**: Evalúa efectividad de cada trigger
- **Ajuste**: Modifica umbrales para optimizar rendimiento
- **Aprendizaje**: Detecta nuevos patrones de activación
- **Evolución**: Sugiere nuevos triggers basado en uso

### 5. **Detección de Patrones de Activación**
Identifica patrones en el uso de triggers:
- **Secuencias**: Cadenas comunes de activación de triggers
- **Timing**: Patrones temporales de activación
- **Contexto**: Situaciones que típicamente requieren triggers
- **Optimización**: Sugerencias para mejorar eficiencia

### 6. **Sistema de Fallback para Triggers**
Proporciona respaldo cuando triggers fallan:
- **Detección**: Identifica cuando triggers no funcionan
- **Respaldo**: Activa métodos alternativos
- **Recuperación**: Restaura funcionalidad normal
- **Documentación**: Registra fallas para análisis

### 7. **Script-Integrated Pipeline Automation Monitoring - COMPORTAMIENTO LLM**
Monitorea el pipeline script-enhanced: decision-engine → script-automation-bridge → confidence-scoring → trigger-monitor:

**COMPORTAMIENTO REQUERIDO**: El LLM debe monitorear automáticamente el script-integrated pipeline y:

1. **EVALUAR HEALTH DEL SCRIPT-INTEGRATED PIPELINE:**
   - Verificar que decision-engine → script-automation-bridge → confidence-scoring → trigger-monitor funcione correctamente
   - Validar que script system (test-trigger-system.sh, execute-commands.sh, progressive-thinking.md) esté healthy
   - Calcular pipeline_health_score basado en métricas script-enhanced de cada fase
   - Detectar degradación cuando health_score < 0.8 OR script_integration < 0.9

2. **SCRIPT-ENHANCED AUTO-CORRECCIÓN AUTOMÁTICA:**
   ```markdown
   🔄 SCRIPT-INTEGRATED PIPELINE HEALTH CHECK
   
   🌉 Script Automation Bridge: [bridge_health: HEALTHY/DEGRADED/FAILED] [integration: X%]
   Decision-Engine: [routing_accuracy: X%] [script_validated: YES/NO] [status: OK/DEGRADED/FAILED]
   Progressive-Thinking: [activated: YES/NO] [stages_completed: X/4] [status: OK/DEGRADED/FAILED]
   Confidence-Scoring: [confidence_score: X.X] [script_calculated: YES/NO] [status: OK/DEGRADED/FAILED]
   Trigger-Monitor: [monitoring_active: YES/NO] [script_monitoring: ACTIVE/FAILED] [status: OK/DEGRADED/FAILED]
   
   Pipeline Health Score: X.X/10
   Script Integration Health: X.X/10
   
   [Si health_score < 0.8 OR script_integration < 0.9]
   ⚠️  SCRIPT-INTEGRATED PIPELINE DEGRADATION DETECTED
   🔧 SCRIPT-ENHANCED AUTO-CORRECTION ACTIVATED:
   - Reloading script-automation-bridge...
   - Re-validating test-trigger-system.sh (22 tests)...
   - Reinitializing execute-commands.sh integration...
   - Reactivating progressive-thinking integration...
   - Reinitializing decision-engine with script validation...
   - Recalculating confidence thresholds with script formulas...
   - Restarting script-monitored trigger monitoring...
   
   ✅ SCRIPT-INTEGRATED PIPELINE HEALTH RESTORED
   ```

3. **MONITOREO CONTINUO:**
   - Incluir status del pipeline en cada respuesta
   - Detectar fallas y activar corrección automática
   - Escalar a manual si 3 intentos de corrección fallan
   - Documentar patrones de falla para mejora continua

4. **SCRIPT-INTEGRATED DASHBOARD COMPLETO OBLIGATORIO:**
   ```markdown
   📊 SCRIPT-INTEGRATED COMPREHENSIVE SYSTEM DASHBOARD
   
   === REAL-TIME SCRIPT-ENHANCED AUTOMATION STATUS ===
   Timestamp: [current_datetime]
   System Mode: [FULLY_AUTOMATED/SEMI_AUTOMATED/MANUAL]
   Script Integration: [HEALTHY/DEGRADED/FAILED]
   
   SCRIPT-ENHANCED PIPELINE EXECUTION:
   ┌─ Decision-Engine ─┐  ┌─ Script-Bridge ─┐  ┌─ Confidence-Scoring ─┐  ┌─ Trigger-Monitor ─┐
   │ Status: [ACTIVE]  │→ │ Status: [BRIDGING] │→ │ Status: [VALIDATING]  │→ │ Status: [MONITORING]│
   │ Accuracy: [X%]    │  │ Health: [HEALTHY] │  │ Score: [X.X/10]      │  │ Frequency: [Xs]     │
   │ Script: [VALID]   │  │ Tests: [XX/22]   │  │ Script-Calc: [YES]   │  │ Script-Mon: [ON]    │
   └──────────────────┘  └──────────────────┘  └─────────────────────┘  └────────────────────┘
   
   🌉 SCRIPT SYSTEM STATUS:
   - test-trigger-system.sh: [HEALTHY/FAILED] | Trigger tests: [XX/22] PASSED
   - execute-commands.sh: [HEALTHY/FAILED] | Command executions: [count] successful
   - progressive-thinking.md: [INTEGRATED/FAILED] | Thinking activations: [count]
   - context_engineering_formulas.sh: [LOADED/FAILED] | Formula validation: [PASSED/FAILED]
   
   SCRIPT-ENHANCED AUTOMATION METRICS:
   - Total Commands Executed: [count]
   - Script-Validated Executions: [count]
   - Auto-Activations: [count]
   - Progressive-Thinking Activations: [count]
   - Success Rate: [percentage]%
   - Script Integration Success: [percentage]%
   - Average Response Time: [seconds]s
   - Script Validation Time: [seconds]s
   - System Uptime: [percentage]%
   
   SCRIPT-VALIDATED ACTIVE TRIGGERS:
   - Mathematical Triggers: [count_active]/8 (script-validated)
   - Script Test Results: [count_passed]/22 PASSED
   - Validation Enforcement: [ACTIVE/INACTIVE]
   - Auto-Restart Loops: [count_running]
   - Pipeline Automation: [RUNNING/IDLE]
   - Script Bridge Health: [HEALTHY/DEGRADED/FAILED]
   
   === END SCRIPT-INTEGRATED DASHBOARD ===
   ```

## Protocolo de Monitoreo

### **Fase 1: Inicialización**
1. Activar monitoreo de todos los triggers
2. Establecer umbrales basados en command-registry.json
3. Iniciar dashboard en tiempo real
4. Configurar alertas automáticas

### **Fase 2: Monitoreo Activo**
1. Evaluar triggers cada 30 segundos
2. Activar comandos cuando umbrales se cumplen
3. Verificar éxito de activaciones
4. Ajustar umbrales dinámicamente

### **Fase 3: Optimización**
1. Analizar patrones de activación
2. Optimizar umbrales basado en efectividad
3. Detectar nuevos patrones
4. Sugerir mejoras al sistema

### **Fase 4: Reporte**
1. Generar estadísticas de triggers
2. Documentar patrones identificados
3. Actualizar registry con métricas
4. Preparar recomendaciones

## Integración con Decision Engine

### **Routing Inteligente**
- **Alta Actividad**: Monitoreo intensivo cada 15 segundos
- **Media Actividad**: Monitoreo estándar cada 30 segundos
- **Baja Actividad**: Monitoreo reducido cada 60 segundos

### **Priorización de Triggers**
- **Críticos**: Triggers que afectan funcionamiento del sistema
- **Importantes**: Triggers que mejoran eficiencia
- **Optimización**: Triggers que refinan rendimiento

## Fallbacks Automáticos

1. **Si monitoreo falla**: Activar modo básico con triggers manuales
2. **Si triggers no responden**: Escalar a intervención manual
3. **Si dashboard falla**: Continuar monitoreo sin visualización
4. **Si optimización falla**: Usar umbrales por defecto

## Verificación

### **Métricas de Éxito**
- **Trigger Detection Rate**: ≥98% de triggers detectados
- **Activation Accuracy**: ≥95% activaciones correctas
- **Response Time**: ≤5 segundos desde detección
- **False Positive Rate**: ≤2% activaciones incorrectas
- **System Uptime**: ≥99.5% disponibilidad de monitoreo

### **Indicadores de Salud**
- **Trigger Health**: Todos los triggers funcionando correctamente
- **Performance**: Tiempo de respuesta dentro de rangos
- **Accuracy**: Precisión de activaciones ≥95%
- **Learning**: Mejora continua de umbrales

## Usage Examples

### **Monitoreo Básico**
```text
/trigger-monitor
```
**Resultado**: Inicia monitoreo de todos los triggers con configuración por defecto

### **Monitoreo Intensivo**
```text
/trigger-monitor intensive
```
**Resultado**: Monitoreo cada 15 segundos con logging detallado

### **Análisis de Patrones**
```text
/trigger-monitor analyze
```
**Resultado**: Análisis profundo de patrones de activación y sugerencias de optimización

### **Debug de Triggers**
```markdown
/trigger-monitor debug [command_name]
```
**Resultado**: Información detallada sobre triggers específicos de un comando

---

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this trigger-monitor command executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

```text
╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /trigger-monitor | Priority: HIGH               ║
║ Purpose: [Tool purpose] | Duration: [estimate]           ║
║ Context: System monitoring | Agent: [Task/Direct]        ║
╚═══════════════════════════════════════════════════════════╝

⚡ Monitoring System Active | 📊 Trigger Analysis | 🔧 Auto-Correction

[TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [✅/❌/⚠️] | Duration: [actual] | Triggers: [count]║
║ Results: [monitoring outcomes] | Health: [assessment]    ║
╚═══════════════════════════════════════════════════════════╝
```

### **System Monitoring Announcements - MANDATORY**

When executing system monitoring tasks, the LLM MUST display monitoring-specific announcements:

**Pipeline Health Monitoring**:
```text
╔═══════════════════════════════════════════════════════════╗
║        🌉 PIPELINE HEALTH MONITORING                     ║
╠═══════════════════════════════════════════════════════════╣
║ System: Script-integrated pipeline | Status: Monitoring ║
║ Components: 4 pipeline stages | Health: [assessment]    ║
║ Frequency: Real-time | Agent: System Monitor            ║
╚═══════════════════════════════════════════════════════════╝
```

**Trigger System Validation**:
```text
╔═══════════════════════════════════════════════════════════╗
║        🧪 TRIGGER SYSTEM VALIDATION                      ║
╠═══════════════════════════════════════════════════════════╣
║ Tests: 22 trigger validations | Scripts: test-trigger   ║
║ Validation: Mathematical formulas | Status: [results]   ║
║ Compliance: P56 transparency | Agent: Trigger Validator ║
╚═══════════════════════════════════════════════════════════╝
```

**Auto-Correction Protocol**:
```text
╔═══════════════════════════════════════════════════════════╗
║        🔧 AUTO-CORRECTION SYSTEM                         ║
╠═══════════════════════════════════════════════════════════╣
║ Detected: System degradation | Threshold: <0.8 health   ║
║ Action: Auto-restart pipeline | Duration: [estimate]    ║
║ Recovery: Script-enhanced | Agent: Recovery System      ║
╚═══════════════════════════════════════════════════════════╝
```

### **Task Agent Deployment for System Monitoring - MANDATORY**

When monitor requires Task agent deployment for complex system analysis, display:

```text
╔═══════════════════════════════════════════════════════════╗
║        🤖 SYSTEM MONITORING TASK AGENT DEPLOYMENT       ║
╠═══════════════════════════════════════════════════════════╣
║ Agent Type: System Monitor Specialist | Scope: Full     ║
║ Purpose: [Monitoring task] | Duration: [estimate]       ║
║ Communication: ✅ BRIDGE ACTIVE | Updates: ≤30s         ║
║ Monitoring: Pipeline + Scripts + Triggers + Compliance  ║
╚═══════════════════════════════════════════════════════════╝

⚡ Deploying specialized monitoring agent for comprehensive analysis...
📊 Bidirectional communication established for system health tracking...
🔧 Auto-correction and compliance monitoring activated...

[TASK AGENT EXECUTION FOR SYSTEM MONITORING]

╔═══════════════════════════════════════════════════════════╗
║         ✅ SYSTEM MONITORING COMPLETED                   ║
╠═══════════════════════════════════════════════════════════╣
║ Health Score: [score]/10 | Triggers: [count] active     ║
║ Compliance: [P56%] | Auto-Corrections: [count] applied  ║
║ Handoff: System status | Next: [continuous/escalate]    ║
╚═══════════════════════════════════════════════════════════╝
```

### **Implementation Requirements - MANDATORY**

1. **Pre-Monitor Announcement**: ALWAYS display monitoring announcement before system checks
2. **Task Agent Transparency**: Show Task agent deployment for complex system analysis
3. **Real-time Updates**: Display system health and trigger status continuously
4. **Auto-Correction Visibility**: Announce all automatic system corrections
5. **Compliance Monitoring**: Track and display P56 transparency compliance
6. **Dashboard Integration**: Show comprehensive system dashboard with all metrics
7. **Error Escalation**: Surface system failures immediately with recovery actions

### **Bidirectional Communication Protocol - MANDATORY**

When deploying Task agents for system monitoring, the LLM MUST:

1. **Initialize System Communication**: Establish communication bridge for monitoring specialists
2. **Deploy Monitoring Specialists**: Use Task tool for complex system health analysis
3. **Monitor System Progress**: Track monitoring agent progress and system metrics
4. **Display System Updates**: Show system health progression and issue detection
5. **Handle System Handoffs**: Properly receive system intelligence from monitoring agents
6. **Report System Results**: Display comprehensive system status and health assessment
7. **Maintain System Transparency**: Never allow "monitoring black holes" where user loses system visibility

### **System Monitoring Quality Display - MANDATORY**

During system monitoring execution, display comprehensive metrics:

```text
📊 SYSTEM MONITORING QUALITY METRICS
╔═══════════════════════════════════════════════════════════╗
║ Pipeline Health: [score]/10 | Script Integration: [score]║
║ Trigger System: [score]/10 | Compliance Rate: [percent]% ║
║ Auto-Corrections: [count] applied | Success Rate: [rate]%║
║ System Uptime: [percent]% | Response Time: [seconds]s    ║
╚═══════════════════════════════════════════════════════════╝

🔧 System Health: [assessment] | Performance: [level]
📊 Monitoring Coverage: [percentage]% | Alert Response: [seconds]s
⚡ Auto-Restart Success: [percentage]% | P56 Compliance: [percentage]%
```

### **Compliance Enforcement - CRITICAL**

- **NEVER skip monitoring announcements**: Every system check must be visually announced
- **NEVER hide system health**: All monitoring progress must be visible
- **NEVER skip Task agent deployment**: Complex monitoring requires specialized agents
- **ALWAYS show system metrics**: Display comprehensive system health and performance
- **ALWAYS display auto-corrections**: Show all automatic system repairs
- **ALWAYS handle monitoring handoffs**: Proper handoff from monitoring specialists to principal agent

**P55/P56 Compliance**: This command integrates Tool Call Execution Bridging (P55) through mandatory Task agent deployment for complex system monitoring and Command Execution Transparency (P56) through comprehensive visual announcements of all system monitoring operations, trigger validations, and auto-correction activities.

---

## Nota
Este comando es el sistema nervioso del monitoreo de triggers en Context Engineering. Garantiza que todos los triggers funcionen correctamente y se activen automáticamente cuando sea necesario, manteniendo la filosofía de "Enable, Don't Control" mientras proporciona supervisión inteligente con completa transparencia visual y comunicación bidireccional obligatoria según el Principio #56.