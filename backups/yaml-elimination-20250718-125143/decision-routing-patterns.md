# Decision Routing Patterns Module

## 🎯 **COMMAND FUNCTIONALITY**

### **Script-Integrated Mathematical Analysis**
Evaluates task understanding using validated mathematical formulas from execute-commands.sh:

### **Confidence Calculation Formula (Script-Implemented)**
```bash
# From execute-commands.sh - ALREADY IMPLEMENTED
calculate_confidence() {
    local domain_familiarity=$1      # 0.0-1.0
    local requirement_clarity=$2     # 0.0-1.0 
    local resource_availability=$3   # 0.0-1.0
    
    # Confidence = domain_familiarity * 0.4 + requirement_clarity * 0.4 + resource_availability * 0.2
    echo "scale=4; ($domain_familiarity * 0.4) + ($requirement_clarity * 0.4) + ($resource_availability * 0.2)" | bc
}

# JavaScript equivalent for documentation
function calculateConfidence(task_context) {
  const domain_familiarity = assessDomainFamiliarity(task_context.domain) // 0.0-1.0
  const requirement_clarity = assessRequirementClarity(task_context.requirements) // 0.0-1.0
  const resource_availability = assessResourceAvailability(task_context.resources) // 0.0-1.0
  
  const confidence_score = (
    domain_familiarity * 0.4 +
    requirement_clarity * 0.4 +
    resource_availability * 0.2
  )
  
  return confidence_score
}
```

### **Confidence-Based Routing**
- **≥0.9**: Direct atomic command + high confidence execution
- **0.7-0.9**: Workflow orchestrator + standard validation  
- **0.5-0.7**: Multi-workflow coordination + enhanced exploration
- **<0.5**: Specialized agent deployment + mandatory exploration

### **Script-Integrated Mathematical Complexity Evaluation**
Measures complexity using validated objective metrics from execute-commands.sh:

### **Complexity Calculation Formula (Script-Implemented)**
```bash
# From execute-commands.sh - ALREADY IMPLEMENTED
calculate_complexity() {
    local objective_count=$1         # raw count
    local dependency_factor=$2       # 1.0-3.0
    local integration_complexity=$3  # 1.0-2.0
    
    # Complexity = Math.log(objective_count + 1) * 0.4 + dependency_factor * 0.4 + integration_complexity * 0.2
    local log_objectives=$(echo "scale=4; l($objective_count + 1)" | bc -l)
    local complexity=$(echo "scale=4; ($log_objectives * 0.4) + ($dependency_factor * 0.4) + ($integration_complexity * 0.2)" | bc)
    
    # Cap at 3.0
    echo "scale=4; if ($complexity > 3.0) 3.0 else $complexity" | bc
}

# JavaScript equivalent for documentation
function calculateComplexity(task_context) {
  const objective_count = task_context.objectives.length // raw count
  const dependency_factor = calculateDependencyFactor(task_context.dependencies) // 1.0-3.0
  const integration_complexity = assessIntegrationComplexity(task_context.integrations) // 1.0-2.0
  
  const complexity_score = (
    Math.log(objective_count + 1) * 0.4 +
    dependency_factor * 0.4 +
    integration_complexity * 0.2
  )
  
  return Math.min(complexity_score, 3.0) // cap at 3.0
}
```

### **Complexity-Based Routing**
- **≤1.0**: Atomic command (single responsibility) + direct execution
- **≤1.5**: Orchestrator (multiple atomic commands) + coordination required
- **≤2.0**: Meta-command (complete process) + full orchestration
- **>2.0**: Decomposition required + objective-decomposition mandatory

### **Model Recommendation System**
Recommends appropriate model based on task characteristics:

**Opus Recommendations:**
- Deep analysis and strategic thinking
- Complex problem resolution
- Architecture design
- Exploration and research
- Complex workflow planning

**Sonnet Recommendations:**
- Implementation and coding
- Simple and routine tasks
- Documentation updates
- Refactoring work
- Testing and verification

### **Detección de Paralelización**
Identifica oportunidades de ejecución paralela:
- Analiza dependencias entre tareas
- Calcula beneficio neto paralelo (≥0.3 requerido)
- Sugiere agrupación de tareas independientes
- Optimiza orden de ejecución

### **Encadenamiento Automático**
Sugiere secuencias naturales de comandos:

**Discovery Chain**: `/knowledge-hierarchy` → `/exploration-first` → `/recognize-patterns`
**Planning Chain**: `/objective-decomposition` → `/tdd` → `/strategic-git`  
**Execution Chain**: `/parallel-over-sequential` → `/verification-loops` → `/enable-dont-control`

## **Guías de Routing**

### **Por Confianza**
- **Alta confianza + baja complejidad**: Comando atómico directo
- **Media confianza + media complejidad**: Workflow orchestrator
- **Baja confianza + alta complejidad**: Multi-workflow o agentes

### **Por Tipo de Tarea**
- **Análisis/Research**: Usar `/discovery-workflow`, sugerir Opus
- **Planificación**: Usar `/planning-workflow`, sugerir Opus  
- **Implementación**: Usar `/execution-workflow`, evaluar modelo por complejidad
- **Verificación**: Usar `/verification-workflow`, generalmente Sonnet
- **Documentación**: Usar `/documentation-workflow`, generalmente Sonnet

### **Gestión de Ciclo de Vida**
- **Inicio de conversación**: Sugerir `/conversation-lifecycle start`
- **60+ minutos + 50% progreso**: Sugerir checkpoint
- **80% completado o 120+ minutos**: Sugerir preparar cierre

## **Fallbacks Automáticos**
1. **Si análisis falla**: Usar exploración básica
2. **Si complejidad muy alta**: Sugerir descomposición
3. **Si contexto insuficiente**: Activar `/knowledge-hierarchy`
4. **Si objetivos poco claros**: Activar `/objective-decomposition`

## 🔄 **SCRIPT-INTEGRATED AUTO-RESTART Y VERIFICACIÓN AUTOMÁTICA**

### **Script-Powered Auto-Restart Protocol**
**Auto Restart Protocol**:
  **Script Integration**:
    - **Validation Script**: test-trigger-system.sh
    - **Execution Script**: execute-commands.sh
    - **Formula Library**: context_engineering_formulas.sh
    - **Progressive Thinking**: progressive-thinking.md
  **Trigger Conditions Script Validated**:
  - routing_accuracy < 0.85 (validated by test_success_rate_trigger)
  - confidence_score < adaptive_threshold (validated by test_adaptive_trigger)
  - complexity_score > 2.0 (validated by test_complexity_decomposition_trigger)
  - execution_failure_detected (monitored by execute-commands.sh)
  - script_validation_failure (22 tests < 95% pass rate)
  **Restart Algorithm With Scripts**:
    - **Max Iterations**: 3
    - **Iteration 1**: refined_analysis_with_progressive_thinking_stages_1_2
    - **Iteration 2**: alternative_routing_with_script_validation_and_progressive_thinking_stages_3_4
    - **Iteration 3**: simplified_approach_with_execute_commands_fallback_and_manual_escalation
  **Convergence Guarantee Script Enforced**:
    **Success Criteria**:
    - routing_accuracy >= 0.95 (script-validated)
    - confidence_improvement >= 0.1 (calculate_confidence)
    - complexity_reduction >= 0.2 (calculate_complexity)
    - script_tests_passed >= 21/22 (95% threshold)
    - progressive_thinking_complete (if activated)
    **Escalation After Failure**:
    - execute test-trigger-system.sh for failure analysis
    - document_failure_pattern_in_results_dir
    - escalate_to_manual_intervention_with_script_diagnostics
    - update_learning_patterns_and_registry_metrics

### **Verificación Automática Continua**
```javascript
function executeVerificationLoop(routing_decision) {
  let iteration = 0
  const max_iterations = 3
  
  while (iteration < max_iterations) {
    const verification_result = verifyRouting(routing_decision)
    
    if (verification_result.accuracy >= 0.95 && 
        verification_result.confidence >= adaptive_threshold &&
        verification_result.complexity <= 2.0) {
      return { success: true, routing: routing_decision, iterations: iteration }
    }
    
    // Auto-refine routing based on verification feedback
    routing_decision = refineRouting(routing_decision, verification_result)
    iteration++
  }
  
  return { success: false, routing: null, iterations: max_iterations }
}
```

### **SCRIPT-INTEGRATED AUTO-EXECUTION ENGINE - COMPORTAMIENTO LLM**

**COMPORTAMIENTO REQUERIDO**: El LLM debe ejecutar el pipeline completo con script validation y auto-restart:

```markdown
🔄 SCRIPT-INTEGRATED AUTO-EXECUTION PIPELINE

🧮 Phase 0: SCRIPT SYSTEM INITIALIZATION
- test-trigger-system.sh: [LOADED/FAILED]
- execute-commands.sh: [LOADED/FAILED] 
- context_engineering_formulas.sh: [LOADED/FAILED]
- progressive-thinking.md: [LOADED/FAILED]
- Mathematical Validation: [22/22] tests [PASSED/FAILED]
- Script Initialization: [SUCCESS/FAILED]

Phase 1: SCRIPT-VALIDATED DECISION-ENGINE ANALYSIS
- Domain Familiarity: [score]/1.0 (script-calculated)
- Requirement Clarity: [score]/1.0 (script-calculated)
- Resource Availability: [score]/1.0 (script-calculated)
- Confidence Score: [score]/10.0 (calculate_confidence)
- Complexity Score: [score]/3.0 (calculate_complexity)
- Routing Accuracy: [percentage]% (script-validated)
- Script Tests Passed: [count]/22
- Threshold: 85% (test_success_rate_trigger validation)
- Status: [PASSED/FAILED]
- [Si PASSED → continuar a Phase 2]
- [Si FAILED → AUTO-RESTART with progressive-thinking]

Phase 2: CONFIDENCE-SCORING VALIDATION (Script-Enhanced)
- Confidence Score: [score]/10 (script-calculated)
- Adaptive Threshold: [threshold]/10 (test_adaptive_trigger)
- Script Validation: [PASSED/FAILED]
- Progressive-Thinking: [ACTIVATED/SKIPPED]
  - Stage 1 (Contextual): [COMPLETED/SKIPPED]
  - Stage 2 (Analytical): [COMPLETED/SKIPPED]
  - Stage 3 (Strategic): [COMPLETED/SKIPPED] 
  - Stage 4 (Breakthrough): [COMPLETED/SKIPPED]
- Status: [PASSED/FAILED]
- [Si PASSED → continuar a Phase 3]
- [Si FAILED → AUTO-RESTART with enhanced progressive-thinking]

Phase 3: TRIGGER-MONITOR ACTIVATION (Script-Monitored)
- Script Integration: [ACTIVE/FAILED]
- Mathematical Triggers: [count_active]/8 active
- Monitoring Active: [YES/NO]
- Dashboard Active: [YES/NO]
- Real-time Validation: [ENABLED/DISABLED]
- Status: [ACTIVE/FAILED]

Phase 4: RECOMMENDED COMMAND EXECUTION (Script-Powered)
- Command: [command_name]
- Script Pre-validation: [PASSED/FAILED]
- Execution Method: [execute-commands.sh/direct]
- Execution Status: [EXECUTING/COMPLETED/FAILED]
- Mathematical Metrics: Generated via script
- Result: [success_details]
- Post-execution Validation: [PASSED/FAILED]

Pipeline Status: [COMPLETED/RESTARTING/ESCALATED]
Script Integration Health: [HEALTHY/DEGRADED/FAILED]
Overall System Status: [FULLY_AUTOMATED/SEMI_AUTOMATED/MANUAL_REQUIRED]
```

**AUTO-RESTART PROTOCOL**:
1. **Max Iterations**: 3 intentos
2. **Restart Conditions**: routing_accuracy < 0.85 O confidence < threshold
3. **Escalation**: Después de 3 intentos fallidos
4. **Refinement**: Cada iteración mejora el contexto
5. **SIEMPRE mostrar**: Progreso completo del pipeline y restart attempts

### **Métricas de Éxito Objetivas**
- **Routing Accuracy**: ≥95% (target: 98%)
- **Confidence Improvement**: ≥10% por iteration
- **Complexity Reduction**: ≥20% cuando aplicable
- **Parallel Efficiency**: ≥85% (target: 90%)
- **Model Selection Accuracy**: ≥90% (target: 95%)
- **Command Chain Success**: ≥90% (target: 95%)
- **Auto-restart Success Rate**: ≥80% convergence within 3 iterations

---

## 🔄 **EVOLUTION TRACKING**

### **Learning Metrics**
- **Routing Accuracy**: Track decision-making precision over time
- **Confidence Calibration**: Measure accuracy of confidence predictions
- **Complexity Assessment**: Monitor complexity evaluation precision
- **Model Selection Success**: Track optimal model recommendation rates

### **Pattern Recognition**
- Successful routing patterns → Enhanced decision frameworks
- Common failure modes → Improved fallback strategies
- Optimal threshold values → Better calibration models
- Effective command chains → Refined orchestration sequences

---

## 📚 **Cross-References**

**CRITICAL Dependencies**:
- [Decision Logic Core](./decision-logic-core.md) - Core triggers and mathematical validation
- [Integration Protocols](./decision-integration-protocols.md) - Script execution and tool bridges
- [Validation Framework](./decision-validation-framework.md) - Compliance and behavioral protocols

**Routing Targets**:
- [Discovery Workflow](../orchestration/discover.md) - Research and analysis tasks
- [Planning Workflow](../orchestration/plan-flow.md) - Strategic planning and decomposition
- [Execution Workflow](../orchestration/execute.md) - Implementation and coding tasks
- [Verification Workflow](../orchestration/verify-flow.md) - Testing and validation

**Pattern Libraries**:
- [Multi-Agent Orchestration](../selection/multi-agent-orchestration.md) - Parallel execution patterns
- [Progressive Thinking](../behavioral/intelligence/thinking.md) - Deep analysis patterns
- [Objective Decomposition](../behavioral/intelligence/decompose.md) - Complexity breakdown

---

**Module Purpose**: Command routing patterns, mathematical formulas, and execution algorithms for intelligent decision routing. Provides script-integrated calculation methods, confidence/complexity assessment, and auto-restart protocols with ≥95% accuracy standards.