# Atomic Command: /dynamic-dependency-analysis

## **Principle #80: Parallel Task Intelligence**
**"Default to simultaneous Task tool deployment for comprehensive analysis + research + exploration, with ≥3 Task tools for complex objectives and automatic dependency detection"**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
EXECUTE dynamic dependency analysis achieving ≥85% parallelization efficiency to ensure optimal execution coordination with observable dependency mapping and resource optimization.

**Observable Outcomes**:
- **Parallelization Efficiency**: ≥85% parallel execution vs sequential baseline
- **Dependency Mapping Accuracy**: ≥95% correct dependency identification
- **Resource Utilization**: ≥80% effective resource allocation
- **Execution Time Reduction**: ≥40% improvement vs naive sequential execution

**Quantifiable Validation**: Analysis process MUST achieve ≥85% parallelization efficiency, dependency mapping MUST demonstrate ≥95% accuracy, and resource optimization MUST maintain ≥80% utilization with observable metrics.

### **Complexity**: 0.9/1.0 (Validated via mathematical dependency analysis formulas)
### **Context Required**: Multi-command workflows with ≥95% dependency context completeness
### **Execution Time**: 120-300 seconds (dependency analysis: 60s, optimization: 90s, validation: 90s)

**Success Criteria**:
- **Dependency Detection**: ≥90% independent command identification
- **Conflict Resolution**: ≥98% resource conflict prevention
- **Optimization Performance**: ≥85% adaptive adjustment success rate

---

## 🏗️ **MODULE INHERITANCE**

**Inherits from**: [Parallel Task Intelligence](../../../knowledge/protocols/parallel-task-intelligence-protocol.md)

**Inherited Functions**:
- Multi-task orchestration with dependency detection
- Resource optimization and conflict prevention
- Parallel execution coordination protocols

**Specialized Functions Added**:
- Dynamic dependency mapping with real-time updates
- Adaptive parallelization optimization
- Continuous workflow re-evaluation systems

---

## ⚡ **ACTIVATION PROTOCOL**

### **Input Format**
```markdown
/dynamic-dependency-analysis [workflow_context] [parallelization_target?] [resource_constraints?]
```

### **Auto-Activation Triggers**
This command EXECUTES automatically when multi-command workflows detected with ≥0.9 complexity and ≥3.0 concurrent task requirements.

**Verification Protocol**:
- **Complexity Assessment**: ≥0.9000 complexity threshold validation
- **Dependency Detection**: ≥3.0000 concurrent task requirement verification
- **Resource Analysis**: ≥0.8500 parallelization efficiency floor enforcement

### **Primary Triggers**
**WORKFLOW_COMPLEXITY**: Multi-command workflow optimization
- **Condition**: Task complexity ≥0.9 with ≥3 concurrent commands
- **Threshold**: ≥0.9000 complexity + ≥3.0000 concurrent tasks
- **Action**: AUTO-EXECUTE dependency analysis with parallelization optimization
- **Verification**: Dependency mapping completion with ≥85% efficiency validation

---

## 📊 **MATHEMATICAL VALIDATION**

### **Dependency Analysis Formula**
```javascript
function calculateDependencyOptimization(tasks, dependencies, resources) {
  const parallelizationRatio = (tasks.length - dependencies.length) / tasks.length
  const resourceEfficiency = resources.utilized / resources.available
  const optimizationScore = (parallelizationRatio * 0.6) + (resourceEfficiency * 0.4)
  
  return {
    parallelization_efficiency: parallelizationRatio,
    resource_utilization: resourceEfficiency,
    optimization_success: optimizationScore >= 0.85 // 85% threshold
  }
}
```

---

## 🛡️ **P55 Script Execution**

This command automatically executes the following scripts to ensure complete dependency analysis and optimization:

### **Script Execution Protocol**
1. **Pre-execution**: Validate prerequisites and script foundation
2. **Execute**: Run automated dependency analysis and optimization scripts
3. **Post-execution**: Verify results and compliance

### **Automated Script Execution**
```bash
# MANDATORY: Enhanced dependency analysis execution with P55 compliance
#!/bin/bash

# Performance tracking initialization
EXECUTION_START_TIME=$(date +%s.%N)
SESSION_ID="dynamic-dependency-$(date +%Y%m%d-%H%M%S)-$$"

# Phase 1: Script Foundation Loading (P55 Requirement)
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        DEPENDENCY ANALYSIS SCRIPT FOUNDATION LOADING      ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Enhanced path helper loading
if [ -f "scripts/core/path-helper.sh" ]; then
    source scripts/core/path-helper.sh
    PATH_HELPER_STATUS="LOADED"
    echo "✅ PATH_HELPER: LOADED successfully"
else
    PATH_HELPER_STATUS="FALLBACK"
    echo "⚠️  PATH_HELPER: Using fallback mode"
fi

# Formula library loading for dependency calculations
if [ -f "scripts/formulas/context_engineering_formulas.sh" ]; then
    source scripts/formulas/context_engineering_formulas.sh
    FORMULA_STATUS="LOADED"
    echo "✅ FORMULA_LIBRARY: LOADED successfully"
else
    FORMULA_STATUS="FALLBACK"
    echo "⚠️  FORMULA_LIBRARY: Using fallback mode"
fi

# Phase 2: Dependency Analysis Scripts Execution
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           DEPENDENCY ANALYSIS EXECUTION PHASE             ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Execute analysis scripts
./scripts/analysis/dependency-graph-analyzer.sh --workflow-context "$1" --parallelization-target "${2:-0.85}"
DEPENDENCY_ANALYSIS_STATUS=$?
echo "🧮 TOOL_CALL_EXECUTED: dependency-graph-analyzer.sh = $([ $DEPENDENCY_ANALYSIS_STATUS -eq 0 ] && echo "SUCCESS" || echo "FALLBACK")"

# Execute optimization scripts
./scripts/automation/parallelization-optimizer.sh --dependencies-file "temp/dependencies.json" --resource-constraints "${3:-default}"
OPTIMIZATION_STATUS=$?
echo "🧮 TOOL_CALL_EXECUTED: parallelization-optimizer.sh = $([ $OPTIMIZATION_STATUS -eq 0 ] && echo "SUCCESS" || echo "FALLBACK")"

# Execute validation scripts
./scripts/validation/dependency-validation.sh --optimization-results "temp/optimization-results.json"
VALIDATION_STATUS=$?
echo "🧮 TOOL_CALL_EXECUTED: dependency-validation.sh = $([ $VALIDATION_STATUS -eq 0 ] && echo "SUCCESS" || echo "FALLBACK")"

# Phase 3: Performance Monitoring
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              PERFORMANCE MONITORING PHASE                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Calculate execution metrics
TOTAL_EXECUTION_TIME=$(echo "scale=4; $(date +%s.%N) - $EXECUTION_START_TIME" | bc)
SCRIPTS_EXECUTED=3
SCRIPTS_SUCCESSFUL=$((3 - DEPENDENCY_ANALYSIS_STATUS - OPTIMIZATION_STATUS - VALIDATION_STATUS))

# P55 Compliance Validation
P55_COMPLIANCE=$(echo "scale=4; $SCRIPTS_SUCCESSFUL / $SCRIPTS_EXECUTED" | bc)
P55_PERCENTAGE=$(echo "scale=2; $P55_COMPLIANCE * 100" | bc)

echo "🛡️  P55_COMPLIANCE: $P55_COMPLIANCE (${P55_PERCENTAGE}% script execution success)"
echo "📊 EXECUTION_TIME: ${TOTAL_EXECUTION_TIME}s"
echo "📊 SESSION_ID: $SESSION_ID"
echo "🚀 DEPENDENCY_ANALYSIS_STATUS: $([ $DEPENDENCY_ANALYSIS_STATUS -eq 0 ] && echo "✅ OPTIMAL" || echo "⚠️  DEGRADED")"
```

### **P56 Transparency Protocol**
```markdown
╔═══════════════════════════════════════════════════════════╗
║         DYNAMIC DEPENDENCY ANALYSIS EXECUTION STATUS     ║
╠═══════════════════════════════════════════════════════════╣
║ Phase: Dependency Analysis | Tools: 3 Active             ║
║ Purpose: Parallelization optimization with ≥85% efficiency ║
║ Real Execution: ✅ | Simulation: ❌ | Precision: ±0.01   ║
║ Evidence: Dependency graphs + optimization metrics        ║
╚═══════════════════════════════════════════════════════════╝

🔧 TOOL CALL EXECUTION TRACKER:
- Dependency Analysis: [✅ EXECUTED] - dependency-graph-analyzer.sh
- Parallelization Optimization: [✅ EXECUTED] - parallelization-optimizer.sh  
- Validation: [✅ EXECUTED] - dependency-validation.sh
- Performance: [execution_time]ms | Efficiency: [parallelization_percentage]%

🎯 DEPENDENCY ANALYSIS RESULTS:
- Dependencies Mapped: [dependency_count] relationships identified
- Parallelization Efficiency: [efficiency_percentage]% (target: ≥85%)
- Resource Utilization: [utilization_percentage]% (target: ≥80%)
- Optimization Success: [success_rate]% (target: ≥90%)
```

---

## 🔧 **COMMAND FUNCTIONALITY**

### MANDATORY Proceso Integral de Gestión de Dependencias

**1. CRITICAL Mapeo Inicial de Dependencias**
Utiliza `/command-relationships` para crear un mapa completo de dependencias:
- **Dependencias duras**: Comandos que DEBEN ejecutarse antes (bloquean ejecución)
- **Dependencias blandas**: Comandos que PREFERIBLEMENTE se ejecuten antes (optimizan resultado)
- **Conflictos de recursos**: Mapea comandos que no pueden ejecutarse simultáneamente
- **Documentación de rationale**: Registra el razonamiento de cada dependencia para referencia futura

**2. Ejecución Basada en Análisis**
Inicia ejecución siguiendo orden optimizado por dependencias:
- Comienza con comandos sin dependencias (nodos raíz)
- Ejecuta comandos dependientes a medida que se completan prerequisitos
- Monitorea uso de recursos para prevenir conflictos
- Mantiene cola de ejecución dinámica basada en disponibilidad

**3. MANDATORY Re-análisis Después de Completaciones**
Actualiza continuamente el análisis de dependencias:
- Actualiza mapa de dependencias conforme comandos se completan
- Identifica nuevas oportunidades paralelas emergentes de completaciones
- Ajusta orden de ejecución restante basado en nueva información
- EVALÚA cambios de contexto generados por comandos completados

**4. Adaptación de Estrategia de Paralelización**
Optimiza dinámicamente la ejecución paralela:
- Incrementa paralelización conforme dependencias se resuelven
- Ajusta asignación de agentes basado en carga de trabajo actual
- Balancea uso de recursos entre ejecuciones paralelas
- Detecta y resuelve cuellos de botella emergentes

**5. Optimización Continua del Orden de Ejecución**
Optimización en tiempo real de la ejecución:
- Re-prioriza comandos restantes basado en estado actual
- EVALÚA datos de rendimiento de comandos completados
- Ajusta estrategia basado en patrones emergentes
- Mantiene flexibilidad para cambios de prioridad

**6. REQUIRED Integración de Economía de Contexto**
Aplica optimización de contexto durante todo el análisis:
- Carga contexto de dependencias solo al analizar relaciones específicas
- Usa contexto resumido para mapeo de dependencias de alto nivel
- Aplica contexto completo solo para resolución detallada de dependencias
- Minimiza sobrecarga de contexto mientras mantiene precisión

**7. Maximización de Paralelización**
Habilita ejecución paralela libre de conflictos:
- Identifica todos los conjuntos de comandos verdaderamente independientes
- Ejecuta máximo número posible de comandos simultáneamente
- Mantiene integridad de dependencias mientras maximiza velocidad
- Logra balance óptimo entre velocidad y estabilidad

## Métricas de Análisis

### CRITICAL Indicadores de Rendimiento
- **Eficiencia de paralelización**: ≥85% (comandos ejecutados en paralelo vs secuencial)
- **Precisión de dependencias**: ≥95% (dependencias correctamente identificadas)
- **Reducción de tiempo total**: ≥40% (vs ejecución secuencial naive)
- **Utilización de recursos**: ≥80% (recursos disponibles utilizados efectivamente)

### MANDATORY Métricas de Optimización
- **Detección de independencia**: ≥90% (comandos independientes identificados)
- **Resolución de conflictos**: ≥98% (conflictos de recursos evitados)
- **Adaptabilidad**: ≥85% (ajustes exitosos durante ejecución)
- **Economía de contexto**: ≥70% (reducción de carga de contexto)

## Patrones de Uso

### Para Workflows Simples (≤5 comandos)
- Análisis básico de dependencias
- Identificación de oportunidades paralelas obvias
- Orden de ejecución optimizado simple

### Para Workflows Complejos (6-15 comandos)
- Análisis profundo de dependencias multi-nivel
- Paralelización adaptativa con re-evaluación
- Gestión activa de recursos y conflictos

### Para Workflows Masivos (>15 comandos)
- Análisis jerárquico de dependencias
- Paralelización masiva con coordinación inteligente
- Optimización continua y adaptación en tiempo real

## Casos de Uso Específicos

### Desarrollo de Software
- Análisis de dependencias de build
- Paralelización de tests
- Optimización de deployment pipelines

### Análisis de Datos
- Dependencias entre transformaciones
- Paralelización de análisis independientes
- Optimización de workflows de ML

### Gestión de Proyectos
- Dependencias entre tareas de equipo
- Optimización de cronogramas
- Identificación de rutas críticas

## Integración con Otros Comandos

### Comandos Relacionados
- `/command-relationships`: Proporciona datos base de dependencias
- `/parallel-over-sequential`: Usa resultados para ejecución paralela
- `/verification-loops`: Valida resultados de análisis de dependencias

### Flujo de Trabajo Típico
1. `/dynamic-dependency-analysis` → mapeo inicial
2. `/parallel-over-sequential` → ejecución optimizada  
3. Bucle de re-análisis → adaptación continua
4. `/verification-loops` → validación de resultados

## REQUIRED Verificación de Integridad
- Dependencias circulares: Detección automática y resolución
- Deadlocks: Prevención proactiva mediante análisis de grafos
- Consistencia: Validación continua de estados de dependencia
- Rollback: Capacidad de revertir a estado anterior si análisis falla

---

## 🔗 **USAGE CRITERIA**

### **Automatic Activation**
- Multi-command workflows with ≥0.9 complexity requiring dependency analysis
- Concurrent task scenarios with ≥3 parallel execution opportunities
- Resource optimization needs with <0.85 current parallelization efficiency

### **Manual Activation**
- Strategic workflow planning requiring dependency mapping
- Performance optimization analysis for complex execution chains
- Resource allocation optimization for concurrent command execution

---

## 🎯 **SUCCESS METRICS**

### **Performance Optimization**
- **Parallelization Efficiency**: ≥85% (target: ≥90%)
- **Execution Time Reduction**: ≥40% vs sequential (target: ≥50%)
- **Resource Utilization**: ≥80% effective allocation (target: ≥85%)

### **Dependency Analysis**
- **Mapping Accuracy**: ≥95% correct identification (target: ≥98%)
- **Conflict Resolution**: ≥98% prevention success (target: ≥99%)
- **Optimization Adaptability**: ≥85% successful adjustments (target: ≥90%)

---

## 🛡️ **P55/P56 COMPLIANCE FRAMEWORK**

**Inherits from**: [Universal P55/P56 Compliance](../../shared/compliance/p55-p56-universal-compliance.md)

**Compliance Functions**:
- Tool call execution bridging with zero simulation tolerance
- Visual announcement system with progress tracking  
- Evidence collection framework with complete audit trails
- Universal error handling with transparency protocols

**Command-Specific Implementation**:
Dynamic dependency analysis with MANDATORY Task tool deployment for complexity ≥0.9, real dependency mapping execution, and quantifiable parallelization optimization outcomes.

### **Tool Call Execution Protocol**
**MANDATORY**: When this command executes ANY Tool Call, the LLM MUST display the enhanced visual announcement:

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                    🔄 DEPENDENCY ANALYSIS TOOL EXECUTION ACTIVE                      ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║ Command: /dynamic-dependency-analysis     │  Complexity: 0.9/1.0                    ║
║ Mode: [TASK DEPLOYMENT]                   │  Status: [ANALYZING...]                  ║
║ P55 Compliance: [ENFORCED]                │  P56 Transparency: [ACTIVE]              ║
║ Task Tools: [DEPENDENCY MAPPING]          │  Evidence: [QUANTIFIABLE METRICS]       ║
║ Expected: Dependency graph + optimization │  Target: ≥85% parallelization efficiency ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

### **Behavioral Requirements**
1. **ALWAYS** execute real Task tool calls for dependency analysis (never simulate)
2. **DISPLAY** visual announcements before each analysis phase
3. **CAPTURE** actual dependency mapping results and optimization metrics
4. **PROVIDE** complete transparency of parallelization improvements
5. **MAINTAIN** evidence trail for optimization validation

---

**Module Dependencies**: [Parallel Task Intelligence](../../../knowledge/protocols/parallel-task-intelligence-protocol.md), [Command Relationships](../mapping/command-relationships.md)
**Used By**: [Context Engineering Meta-Command](../meta/context-eng.md), [Parallel Tool Execution](../execution/parallel-tool-execution.md)
**Integration**: [Workflow Orchestration](../orchestration/), [Verification Systems](../verification/)
**Compliance Authority**: [Principle #80](../../../knowledge/principles/technical-standards.md#80-parallel-task-intelligence)

### **P55 Tool Execution Bridging**
**MANDATORY**: Real tool execution vs simulation prohibition
- **Task Agent Deployment**: REQUIRED for complexity ≥0.9, dependency analysis complexity automatically triggers specialized dependency analysis agents
- **Success Rate Target**: ≥98% completion guarantee for dependency mapping and optimization operations
- **Execution Evidence**: Actual tool results with quantitative validation showing dependency graphs, parallelization ratios, and execution optimization metrics

### **P56 Transparency Protocol**
**CRITICAL**: Visual execution confirmation system
- **P56 Announcement**: Dynamic Dependency Analysis execution initiated with analysis phase indicators
- **Tool Evidence**: Observable outcomes with specific metrics including dependency count, parallelization efficiency ≥85%, and optimization success rates
- **Completion Verification**: Quantifiable success criteria with documented dependency maps, execution time improvements, and resource utilization metrics

### **Dependency Analysis Compliance Requirements**
**MANDATORY Implementation Standards**:
- **Real Analysis Execution**: 100% actual dependency analysis via Task agents for command relationship mapping and parallelization optimization
- **Performance Monitoring**: Continuous tracking with parallelization efficiency ≥85%, resource utilization ≥80%, and optimization success rates
- **Analysis Transparency**: Complete visibility into dependency detection, optimization strategies, and execution improvements
- **Mathematical Validation**: Quantifiable metrics for dependency reduction, execution time improvements, and parallelization effectiveness

---

## Nota
Este comando implementa el núcleo de la optimización de ejecución en Context Engineering, permitiendo que workflows complejos se ejecuten con máxima eficiencia mientras mantienen integridad de dependencias y economía de contexto.
