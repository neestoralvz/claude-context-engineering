# Atomic Command: `/decision-engine`

## **Principle #5: Intelligent Decision Routing**
**"Enable autonomous decision-making through mathematical analysis and intelligent command orchestration."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Implement intelligent command routing and orchestration based on mathematical confidence analysis, complexity assessment, and autonomous decision-making protocols.

### **Complexity**: 0.9/1.0
### **Context Required**: Task context, objectives, and decision parameters
### **Execution Time**: Medium (depends on analysis complexity)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Auto-Activation Triggers**
This command activates automatically when the system detects intelligent routing and command orchestration requirements. Designed for agentic LLM systems requiring autonomous activation without manual intervention.

### **Primary Triggers (Automatic Activation)**

**PRIMARY TRIGGER**: Command routing requirement detected
- **Condition**: Command routing needed
- **Threshold**: Multiple command options available
- **Action**: Auto-activate decision-engine
- **Verification**: Optimal routing selected

**COMPLEXITY TRIGGER**: Task complexity reaches 1.0 or higher
- **Condition**: Task complexity ≥ 1.0
- **Threshold**: 1.0 (threshold for advanced routing activation)
- **Action**: Escalate to decision-engine for complex analysis
- **Verification**: Complexity analyzed and route selected

**CONFIDENCE TRIGGER**: System confidence drops below 0.7
- **Condition**: Confidence score < 0.7
- **Threshold**: 0.7 (critical threshold for mandatory exploration)
- **Action**: AUTO-EXECUTE exploration-first methodology
- **Verification**: Appropriate route for confidence level + exploration completed
- **Auto-escalation**: If confidence < 0.5 → AUTO-EXECUTE multi-agent-orchestration
- **Executable Function**:
```javascript
function triggerConfidenceAction(confidence_score, task_context) {
  if (confidence_score < 0.5) {
    return executeMultiAgentOrchestration(task_context)
  } else if (confidence_score < 0.7) {
    return executeExplorationFirst(task_context)
  }
  return { trigger_activated: false, reason: "confidence_above_threshold" }
}
```

### **Secondary Triggers (Contextual Activation)**

**PARALLEL TRIGGER**: Parallelization opportunities detected
- **Condition**: Parallel opportunities detected = true
- **Threshold**: ≥2 independent tasks AND parallel_benefit ≥ 0.3
- **Action**: AUTO-EXECUTE multi-agent-orchestration
- **Verification**: Parallel benefit calculated ≥ 0.3 AND parallel execution activated
- **Executable Function**:
```javascript
function triggerParallelAction(parallel_opportunities, task_context) {
  if (parallel_opportunities.length >= 2) {
    const parallel_benefit = calculateParallelBenefit(parallel_opportunities)
    
    if (parallel_benefit >= 0.3) {
      return executeMultiAgentOrchestration(task_context, parallel_opportunities)
    }
  }
  return { trigger_activated: false, reason: "insufficient_parallel_benefit" }
}
```

**MODEL TRIGGER**: Model selection requirement detected
- **Condition**: Model selection needed
- **Threshold**: Task complexity analysis required
- **Action**: Activate decision-engine for model recommendation
- **Verification**: Optimal model recommended

**CHAINING TRIGGER**: Command sequence requirement detected
- **Condition**: Command chaining needed
- **Threshold**: ≥3 related commands
- **Action**: Activate decision-engine for chaining
- **Verification**: Optimal command sequence determined

### **Tertiary Triggers (Fallback Activation)**

**UNCERTAINTY TRIGGER**: Command uncertainty detected
- **Condition**: Command uncertainty detected
- **Threshold**: No clear command match
- **Action**: Activate decision-engine as fallback
- **Verification**: Appropriate command selected

**LIFECYCLE TRIGGER**: Conversation lifecycle management required
- **Condition**: Conversation lifecycle event
- **Threshold**: 60+ minutes or 80% completed
- **Action**: Activate decision-engine for lifecycle management
- **Verification**: Lifecycle action recommended

---

## 📊 **MATHEMATICAL VALIDATION**

### **Mandatory Validation Protocol**
All orchestrators and meta-commands MUST invoke `/decision-engine` before proceeding:

### **Enforcement Protocol (Executable)**
```yaml
mandatory_validation:
  orchestrator_commands: ["discovery-workflow", "planning-workflow", "execution-workflow", "verification-workflow", "documentation-workflow"]
  meta_commands: ["context-engineering"]
  system_commands: ["trigger-monitor"]
  
  validation_sequence:
    1. AUTO-INVOKE /decision-engine when orchestrator called
    2. EXECUTE routing analysis automatically
    3. If routing_accuracy < 0.85 → AUTO-RESTART (max 3 iterations)
    4. If routing_accuracy >= 0.85 → AUTO-PROCEED with recommended command
    5. If 3 failed attempts → ESCALATE to manual intervention
```

### **Execution Instructions (LLM Behavior)**
```javascript
function mandatoryBehavior(orchestrator_command) {
  // 1. AUTO-EXECUTE DECISION-ENGINE FIRST
  const analysis = executeDecisionEngine({
    confidence: calculateConfidence(context),
    complexity: calculateComplexity(context),
    routing: determineOptimalRouting(context)
  })
  
  // 2. VALIDATION REQUIREMENTS
  if (analysis.routing_accuracy >= 0.85) {
    return proceedToRecommendedCommand(analysis.recommended_command)
  } else if (analysis.routing_accuracy < 0.85 && attempts < 3) {
    return autoRestart(analysis)
  } else {
    return escalateWithRecommendations(analysis)
  }
  
  // 3. RESPONSE PATTERN
  return {
    status: "DECISION ENGINE AUTO-EXECUTED",
    analysis: analysis,
    validation: analysis.routing_accuracy >= 0.85 ? "PASSED" : "FAILED",
    execution: `Executing ${analysis.recommended_command} automatically`
  }
}
```

### **Auto-Execution Mechanism**
```javascript
function autoExecutionMechanism(task_context) {
  const decision_result = autoInvokeDecisionEngine(task_context)
  
  if (decision_result.validation_passed) {
    return autoExecuteRecommendedCommandChain(decision_result.command_sequence)
  } else if (decision_result.attempts < 3) {
    return autoRestartWithRefinedAnalysis(decision_result)
  } else {
    return autoEscalateToManualIntervention(decision_result.specific_recommendations)
  }
}
```

### **Convergence Metrics**
```yaml
convergence_criteria:
  max_iterations: 3
  success_thresholds:
    routing_accuracy: 0.95
    confidence_improvement: 0.1
    complexity_reduction: 0.2
  
  restart_conditions:
    - routing_accuracy < 0.85
    - confidence_score < adaptive_threshold
    - complexity_score > 2.0
    
  escalation_triggers:
    - 3 failed routing attempts
    - persistent_uncertainty_detected
    - conflicting_command_recommendations
```

---

## 🔍 **USAGE CRITERIA**

### **Automatic Activation**
- Command uncertainty for specific tasks
- Parallel execution opportunity analysis
- Model recommendation requirements (Opus vs Sonnet)
- Multi-command chaining automation
- Objective complexity evaluation

### **Manual Activation**
- Override automatic decisions
- Detailed routing analysis
- System decision debugging

---

## ⚡ **INTELLIGENT DECISION ENGINE WITH SCRIPT INTEGRATION**

### **Automated Trigger System (Script-Powered)**

**Integration with test-trigger-system.sh**: This command now automatically executes mathematical trigger validation using the existing trigger system script.

**Required Behavior**: LLM must automatically execute triggers validated by the script system:

```markdown
⚡ SCRIPT-INTEGRATED TRIGGERS EXECUTION ENGINE

🧮 MATHEMATICAL VALIDATION ACTIVE
- Script Integration: test-trigger-system.sh LOADED
- Formula Library: context_engineering_formulas.sh ACTIVE
- Validation Engine: 22 trigger tests RUNNING

1. CONFIDENCE TRIGGER EVALUATION (Script-Validated):
   - Confidence Score: [score]/10.0 
   - Mathematical Validation: calculate_confidence(domain, clarity, resources)
   - Threshold: 0.7 (validated by test_confidence_trigger_medium)
   - Status: [ACTIVATED/INACTIVE]
   - Action: [exploration-first EJECUTADO/NO_REQUIRED]
   - Script Test: [PASSED/FAILED]

2. COMPLEXITY TRIGGER EVALUATION (Script-Validated):
   - Complexity Score: [score]/3.0
   - Mathematical Validation: calculate_complexity(objectives, dependencies, integration)
   - Threshold: 1.0 (validated by test_complexity_trigger)
   - Status: [ACTIVATED/INACTIVE]
   - Action: [objective-decomposition/planning-workflow/execution-workflow EJECUTADO]
   - Script Test: [PASSED/FAILED]

3. PARALLEL TRIGGER EVALUATION (Script-Validated):
   - Parallel Opportunities: [count]
   - Benefit Score: [score] (validated by test_parallel_benefit_trigger)
   - Mathematical Validation: calculate_parallel_benefit(sequential, parallel, overhead)
   - Threshold: 0.3 (validated by script)
   - Status: [ACTIVATED/INACTIVE]
   - Action: [multi-agent-orchestration EJECUTADO/NO_REQUIRED]
   - Script Test: [PASSED/FAILED]

4. PROGRESSIVE-THINKING INTEGRATION:
   - Deep Analysis Required: [YES/NO]
   - Stage 1 (Contextual): [EXECUTED/SKIPPED]
   - Stage 2 (Analytical): [EXECUTED/SKIPPED] 
   - Stage 3 (Strategic): [EXECUTED/SKIPPED]
   - Stage 4 (Breakthrough): [EXECUTED/SKIPPED]

Triggers Executed: [count]
Script Validation: [count_passed]/22 tests PASSED
Pipeline Enhanced: [YES/NO]
```

**REGLAS DE ACTIVACIÓN AUTOMÁTICAS (Script-Integrated)**:
1. **confidence_score < 0.5**: EJECUTAR multi-agent-orchestration (validated by test_confidence_trigger_low)
2. **confidence_score < 0.7**: EJECUTAR exploration-first (validated by test_confidence_trigger_medium)
3. **complexity_score >= 2.0**: EJECUTAR objective-decomposition (validated by test_complexity_decomposition_trigger)
4. **complexity_score >= 1.0**: EJECUTAR advanced routing (validated by test_complexity_trigger)
5. **parallel_benefit >= 0.3**: EJECUTAR parallel execution (validated by test_parallel_benefit_trigger)
6. **success_rate < 0.85**: EJECUTAR auto-restart (validated by test_success_rate_trigger)
7. **conversation > 60 min**: EJECUTAR lifecycle management (validated by test_time_trigger)
8. **adaptive_threshold**: EJECUTAR context-appropriate escalation (validated by test_adaptive_trigger)
9. **PROGRESSIVE-THINKING**: EJECUTAR when complexity >= 1.0 OR confidence < 0.7 OR deep analysis required
10. **SIEMPRE**: VALIDAR con script system ANTES de ejecutar triggers
11. **SIEMPRE**: MOSTRAR resultados de script validation Y triggers ejecutados

### **Script-Integrated Execution Engine - COMPORTAMIENTO LLM**

**COMPORTAMIENTO REQUERIDO**: El LLM debe ejecutar el pipeline completo con validación script automática:

```markdown
🚀 SCRIPT-INTEGRATED AUTOMATED DECISION ENGINE EXECUTION

Phase 0: SCRIPT SYSTEM VALIDATION
- Script Integration: test-trigger-system.sh [LOADED/FAILED]
- Formula Library: context_engineering_formulas.sh [ACTIVE/FAILED]
- Mathematical Validation: [22/22] tests [PASSED/FAILED]
- Progressive-Thinking: [LOADED/FAILED]

Phase 1: MATHEMATICAL TASK ANALYSIS
- Domain Familiarity: [score]/1.0 (script-calculated)
- Requirement Clarity: [score]/1.0 (script-calculated)
- Resource Availability: [score]/1.0 (script-calculated)
- Confidence Score: [score]/10.0 (via calculate_confidence formula)
- Objective Count: [count]
- Dependency Factor: [score]/3.0
- Integration Complexity: [score]/2.0
- Complexity Score: [score]/3.0 (via calculate_complexity formula)
- Routing Decision: [command_name]
- Routing Accuracy: [percentage]% (script-validated)

Phase 2: SCRIPT-VALIDATED TRIGGERS EXECUTION
🧮 Mathematical Trigger Results:
- Confidence Trigger Low (< 0.5): [test_confidence_trigger_low result] → [ACTION/NO_ACTION]
- Confidence Trigger Medium (< 0.7): [test_confidence_trigger_medium result] → [ACTION/NO_ACTION]
- Complexity Trigger (>= 1.0): [test_complexity_trigger result] → [ACTION/NO_ACTION]
- Complexity Decomposition (> 2.0): [test_complexity_decomposition_trigger result] → [ACTION/NO_ACTION]
- Parallel Benefit (>= 0.3): [test_parallel_benefit_trigger result] → [ACTION/NO_ACTION]
- Success Rate (< 0.85): [test_success_rate_trigger result] → [ACTION/NO_ACTION]
- Time Trigger (> 60 min): [test_time_trigger result] → [ACTION/NO_ACTION]
- Adaptive Threshold: [test_adaptive_trigger result] → [ACTION/NO_ACTION]
- Progressive-Thinking Required: [YES/NO] → [EXECUTE_STAGES/SKIP]

Phase 3: PIPELINE AUTOMATION
- Decision-Engine: ✓ COMPLETED (script-validated)
- Progressive-Thinking: [EXECUTING/COMPLETED/SKIPPED]
- Confidence-Scoring: [EXECUTING/COMPLETED/FAILED]
- Trigger-Monitor: [PENDING/EXECUTING/COMPLETED]

Phase 4: INTEGRATION RESULTS
- Script Validation: [22/22] tests PASSED
- Mathematical Accuracy: [percentage]% precision maintained
- Automation Complete: [YES/NO]
- Next Actions: [monitoring_active/manual_intervention_required/progressive_analysis]
- Pipeline Status: [SUCCESS/DEGRADED/FAILED]
```

**EJECUCIÓN SECUENCIAL OBLIGATORIA (Script-Integrated)**:
1. **SIEMPRE**: Cargar script system y validate mathematical formulas
2. **SIEMPRE**: Ejecutar análisis matemático completo usando formulas script
3. **AUTOMÁTICAMENTE**: Validar todos los triggers con test-trigger-system.sh
4. **AUTOMÁTICAMENTE**: Ejecutar solo triggers que PASAN script validation
5. **CONDICIONAL**: Activar progressive-thinking para análisis profundo si complexity >= 1.0 OR confidence < 0.7
6. **INMEDIATAMENTE**: Continuar a confidence-scoring con script-validated metrics
7. **FINALMENTE**: Activar trigger-monitor para monitoreo continuo
8. **SIEMPRE**: MOSTRAR script validation results Y triggers execution results
9. **GARANTÍA**: Script failure → escalate to manual intervention
10. **PRECISIÓN**: Mantener 4 decimal places en todos los cálculos matemáticos

---

## ⚡ **EXECUTION INSTRUCTIONS - MANDATORY TOOL CALLS**

### **CRITICAL: LLM Must Execute Real Scripts via Tool Calls**

When this command is invoked, the LLM **MUST** execute the following tool calls in sequence to perform actual mathematical calculations:

### **Phase 1: Script System Validation**
```bash
# MANDATORY: Validate script system availability
ls -la /Users/nalve/claude-context-engineering/scripts/formulas/
ls -la /Users/nalve/claude-context-engineering/scripts/core/calculate-real-metrics.sh
```

### **Phase 2: Execute Mathematical Calculations**
```bash
# MANDATORY: Load and execute mathematical formula library
cd /Users/nalve/claude-context-engineering/scripts/formulas/
source ./context_engineering_formulas.sh

# Execute confidence calculation (domain_familiarity requirement_clarity resource_availability)
calculate_confidence 0.8 0.9 0.7

# Execute complexity calculation (objective_count dependency_factor integration_complexity)
calculate_complexity 3 2.1 1.5
```

### **Phase 3: Execute Real Metrics Calculation**
```bash
# MANDATORY: Execute comprehensive metrics calculation script
cd /Users/nalve/claude-context-engineering/
./scripts/core/calculate-real-metrics.sh
```

### **Phase 4: Validate Mathematical Formulas**
```bash
# MANDATORY: Execute mathematical validation to ensure accuracy
./scripts/compliance/verify-mathematical-formulas.sh
```

### **Phase 5: Execute Trigger System Validation**
```bash
# MANDATORY: Execute trigger system for decision routing
./scripts/core/test-trigger-system.sh
```

### **LLM BEHAVIOR REQUIREMENTS**

1. **ALWAYS** execute the bash tool calls above when `/decision-engine` is invoked
2. **CAPTURE** the actual numerical results from script execution
3. **USE** the real calculated values (not simulated ones) for decision routing
4. **DISPLAY** the script execution results to demonstrate real calculation
5. **PROCEED** with routing decisions based on actual mathematical outputs

### **Expected Tool Call Pattern**
```markdown
🔧 EXECUTING REAL MATHEMATICAL CALCULATIONS...

[Bash tool execution results with actual numbers]

📊 SCRIPT RESULTS:
- Confidence Score: [actual_calculated_value]/10.0
- Complexity Score: [actual_calculated_value]/3.0
- Trigger Validation: [actual_test_results]/22 passed
- Routing Decision: [based_on_real_calculations]
```

**CRITICAL**: The LLM must use the **Bash** tool to execute these scripts and capture real numerical results, not simulate or estimate the values.

---

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

### 4. Detección de Paralelización
Identifica oportunidades de ejecución paralela:
- Analiza dependencias entre tareas
- Calcula beneficio neto paralelo (≥0.3 requerido)
- Sugiere agrupación de tareas independientes
- Optimiza orden de ejecución

### 5. Encadenamiento Automático
Sugiere secuencias naturales de comandos:

**Discovery Chain**: `/knowledge-hierarchy` → `/exploration-first` → `/recognize-patterns`
**Planning Chain**: `/objective-decomposition` → `/tdd` → `/strategic-git`  
**Execution Chain**: `/parallel-over-sequential` → `/verification-loops` → `/enable-dont-control`

## Guías de Routing

### Por Confianza
- **Alta confianza + baja complejidad**: Comando atómico directo
- **Media confianza + media complejidad**: Workflow orchestrator
- **Baja confianza + alta complejidad**: Multi-workflow o agentes

### Por Tipo de Tarea
- **Análisis/Research**: Usar `/discovery-workflow`, sugerir Opus
- **Planificación**: Usar `/planning-workflow`, sugerir Opus  
- **Implementación**: Usar `/execution-workflow`, evaluar modelo por complejidad
- **Verificación**: Usar `/verification-workflow`, generalmente Sonnet
- **Documentación**: Usar `/documentation-workflow`, generalmente Sonnet

### Gestión de Ciclo de Vida
- **Inicio de conversación**: Sugerir `/conversation-lifecycle start`
- **60+ minutos + 50% progreso**: Sugerir checkpoint
- **80% completado o 120+ minutos**: Sugerir preparar cierre

## Fallbacks Automáticos
1. **Si análisis falla**: Usar exploración básica
2. **Si complejidad muy alta**: Sugerir descomposición
3. **Si contexto insuficiente**: Activar `/knowledge-hierarchy`
4. **Si objetivos poco claros**: Activar `/objective-decomposition`

## 🔄 SCRIPT-INTEGRATED AUTO-RESTART Y VERIFICACIÓN AUTOMÁTICA

### **Script-Powered Auto-Restart Protocol**
```yaml
auto_restart_protocol:
  script_integration:
    validation_script: "test-trigger-system.sh"
    execution_script: "execute-commands.sh"
    formula_library: "context_engineering_formulas.sh"
    progressive_thinking: "progressive-thinking.md"
  
  trigger_conditions_script_validated:
    - routing_accuracy < 0.85 (validated by test_success_rate_trigger)
    - confidence_score < adaptive_threshold (validated by test_adaptive_trigger)
    - complexity_score > 2.0 (validated by test_complexity_decomposition_trigger)
    - execution_failure_detected (monitored by execute-commands.sh)
    - script_validation_failure (22 tests < 95% pass rate)
  
  restart_algorithm_with_scripts:
    max_iterations: 3
    iteration_1: "refined_analysis_with_progressive_thinking_stages_1_2"
    iteration_2: "alternative_routing_with_script_validation_and_progressive_thinking_stages_3_4"
    iteration_3: "simplified_approach_with_execute_commands_fallback_and_manual_escalation"
  
  convergence_guarantee_script_enforced:
    success_criteria:
      - routing_accuracy >= 0.95 (script-validated)
      - confidence_improvement >= 0.1 (calculate_confidence)
      - complexity_reduction >= 0.2 (calculate_complexity)
      - script_tests_passed >= 21/22 (95% threshold)
      - progressive_thinking_complete (if activated)
    
    escalation_after_failure:
      - execute test-trigger-system.sh for failure analysis
      - document_failure_pattern_in_results_dir
      - escalate_to_manual_intervention_with_script_diagnostics
      - update_learning_patterns_and_registry_metrics
```

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

## 🔗 SCRIPT-INTEGRATED AUTOMATIC ECOSYSTEM INTEGRATION

### **Script-Powered Pipeline: decision-engine → confidence-scoring → trigger-monitor**
```yaml
script_integrated_automatic_integration:
  script_foundation:
    trigger_validation: "test-trigger-system.sh"
    execution_engine: "execute-commands.sh"
    formula_library: "context_engineering_formulas.sh"
    progressive_analysis: "progressive-thinking.md"
  
  sequence_with_script_validation:
    1. decision-engine: Script-validated task analysis and routing determination
    2. progressive-thinking: Deep analysis when complexity >= 1.0 OR confidence < 0.7
    3. confidence-scoring: Script-calculated confidence with mathematical precision
    4. trigger-monitor: Script-monitored execution with real-time dashboard
  
  data_flow_script_enhanced:
    decision_engine_output:
      - routing_decision: selected_command_sequence (script-validated)
      - confidence_estimate: calculate_confidence(domain, clarity, resources)
      - complexity_analysis: calculate_complexity(objectives, dependencies, integration)
      - parallel_opportunities: identified_via_test_parallel_benefit_trigger
      - script_validation_results: 22_trigger_tests_status
      - progressive_thinking_required: boolean_based_on_thresholds
    
    progressive_thinking_output:
      - contextual_analysis: stage_1_deep_understanding
      - analytical_insights: stage_2_strategic_implications
      - strategic_planning: stage_3_implementation_design
      - breakthrough_innovations: stage_4_revolutionary_insights
      - synthesized_intelligence: combined_strategic_output
    
    confidence_scoring_input:
      - routing_decision: from decision-engine (script-validated)
      - progressive_insights: from progressive-thinking (if executed)
      - task_context: enhanced_with_routing_analysis_and_deep_thinking
      - verification_requirements: based_on_script_calculated_complexity
      - mathematical_precision: 4_decimal_places_maintained
    
    trigger_monitor_input:
      - confidence_score: from confidence-scoring (script-calculated)
      - routing_decision: from decision-engine (script-validated)
      - progressive_analysis: from progressive-thinking (if executed)
      - monitoring_requirements: based_on_script_complexity_and_confidence
      - script_health_monitoring: continuous_script_system_validation
```

### **Script-Validated Automatic Command Activation Rules**
```yaml
script_validated_auto_activation_rules:
  confidence_below_low_threshold:
    condition: confidence_score < 0.5
    script_validator: test_confidence_trigger_low
    action: auto_activate_multi_agent_orchestration
    verification: multi_agent_coordination_active
    
  confidence_below_medium_threshold:
    condition: confidence_score < 0.7
    script_validator: test_confidence_trigger_medium
    action: auto_activate_exploration_first
    verification: exploration_completed_successfully
  
  complexity_above_basic_threshold:
    condition: complexity_score >= 1.0
    script_validator: test_complexity_trigger
    action: auto_activate_advanced_routing
    verification: advanced_routing_engaged
  
  complexity_above_decomposition_threshold:
    condition: complexity_score > 2.0
    script_validator: test_complexity_decomposition_trigger
    action: auto_activate_objective_decomposition
    verification: objectives_properly_decomposed
  
  parallel_opportunities_detected:
    condition: parallel_benefit >= 0.3
    script_validator: test_parallel_benefit_trigger
    action: auto_activate_multi_agent_orchestration
    verification: parallel_execution_optimized
  
  success_rate_below_threshold:
    condition: success_rate < 0.85
    script_validator: test_success_rate_trigger
    action: auto_activate_restart_protocol
    verification: system_performance_improved
  
  conversation_time_exceeded:
    condition: conversation_minutes > 60
    script_validator: test_time_trigger
    action: auto_activate_lifecycle_management
    verification: conversation_lifecycle_managed
  
  adaptive_threshold_not_met:
    condition: confidence < adaptive_threshold
    script_validator: test_adaptive_trigger
    action: auto_activate_context_appropriate_escalation
    verification: threshold_requirements_satisfied
  
  progressive_thinking_required:
    condition: (complexity_score >= 1.0) OR (confidence_score < 0.7) OR (deep_analysis_needed)
    script_validator: progressive_thinking_md_integration
    action: auto_activate_progressive_thinking_sequence
    verification: four_stage_thinking_completed
  
  verification_required:
    condition: routing_accuracy < 0.95
    script_validator: execute_commands_sh_validation
    action: auto_activate_verification_loops
    verification: routing_accuracy_improved_and_script_validated
```

### **Feedback Loop con Trigger-Monitor**
```javascript
function establishFeedbackLoop() {
  const monitoring_config = {
    frequency: 30, // seconds
    metrics_to_track: [
      'routing_accuracy',
      'confidence_score',
      'complexity_score',
      'execution_success_rate'
    ],
    auto_adjustments: {
      threshold_optimization: true,
      pattern_learning: true,
      failure_recovery: true
    }
  }
  
  return activateTriggerMonitor(monitoring_config)
}
```

### **Aprendizaje Continuo y Optimización**
```yaml
learning_integration:
  pattern_recognition:
    - successful_routing_patterns → crystallize_for_reuse
    - failed_routing_attempts → update_fallback_strategies
    - confidence_accuracy_correlation → refine_confidence_calculation
    - complexity_prediction_accuracy → improve_complexity_formulas
  
  auto_optimization:
    - threshold_adjustment_based_on_success_rates
    - routing_strategy_refinement_based_on_outcomes
    - confidence_formula_tuning_based_on_predictive_accuracy
    - complexity_calculation_improvement_based_on_actual_results
```

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

---

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this decision-engine command executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

```
╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /decision | Priority: HIGH                      ║
║ Purpose: [Tool purpose] | Duration: [estimate]           ║
║ Context: Mathematical routing | Agent: [Task/Direct]     ║
╚═══════════════════════════════════════════════════════════╝

🚀 Mathematical Tool Execution | 📊 Script Integration | ⚡ Real Calculations

[TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [✅/❌/⚠️] | Duration: [actual] | Scripts: [used] ║
║ Results: [mathematical outcomes] | Accuracy: [metrics]   ║
╚═══════════════════════════════════════════════════════════╝
```

### **Script Execution Announcement Protocol - MANDATORY**

When executing mathematical calculation scripts, the LLM MUST display:

```
╔═══════════════════════════════════════════════════════════╗
║        🧮 MATHEMATICAL SCRIPT EXECUTION                   ║
╠═══════════════════════════════════════════════════════════╣
║ Script: [script_name] | Phase: [calculation_phase]       ║
║ Purpose: Mathematical validation | Type: Formula library ║
║ Duration: [estimate] | Integration: ✅ SCRIPT BRIDGE     ║
╚═══════════════════════════════════════════════════════════╝

🔢 Executing: calculate_confidence, calculate_complexity, test-trigger-system
📊 Real mathematical calculations in progress...
⚡ Script validation active...

[BASH TOOL EXECUTION OF SCRIPTS]

╔═══════════════════════════════════════════════════════════╗
║           ✅ MATHEMATICAL VALIDATION COMPLETED            ║
╠═══════════════════════════════════════════════════════════╣
║ Confidence: [real_score]/10.0 | Complexity: [real_score]/3.0║
║ Scripts: [count] executed | Validation: [count]/22 PASSED ║
║ Routing: [selected_command] | Accuracy: [percentage]%     ║
╚═══════════════════════════════════════════════════════════╝
```

### **Implementation Requirements - MANDATORY**

1. **Pre-Script Announcement**: ALWAYS display announcement before script execution
2. **Mathematical Transparency**: Show real calculation execution, never simulate
3. **Script Integration Display**: Announce script bridge activation and health
4. **Real-Time Calculation Updates**: Display actual mathematical results from scripts
5. **Validation Reporting**: Show test-trigger-system results and trigger validation
6. **Routing Decision Transparency**: Display routing decision with mathematical justification
7. **Error Handling**: Surface script failures immediately with recovery actions

### **Script Execution Behavioral Protocol - MANDATORY**

When executing mathematical scripts, the LLM MUST:

1. **Announce Script Execution**: Display script execution announcement before running bash commands
2. **Execute Real Scripts**: Use Bash tool to run calculate-real-metrics.sh, test-trigger-system.sh, etc.
3. **Display Real Results**: Show actual calculated values from script execution
4. **Report Script Health**: Display script integration status and validation results
5. **Use Real Numbers**: Base routing decisions on actual script outputs, never estimate
6. **Show Trigger Validation**: Display which triggers were validated by test-trigger-system.sh
7. **Maintain Transparency**: Never allow "script execution black holes" where user can't see progress

### **Progressive Thinking Integration Display - MANDATORY**

When progressive-thinking is activated, display:

```
╔═══════════════════════════════════════════════════════════╗
║        🧠 PROGRESSIVE THINKING ACTIVATION                 ║
╠═══════════════════════════════════════════════════════════╣
║ Trigger: [complexity ≥1.0 / confidence <0.7 / deep analysis]║
║ Stages: 4-stage deep analysis | Duration: 3-8 minutes    ║
║ Integration: ✅ DECISION ENGINE | Agent: Strategic       ║
╚═══════════════════════════════════════════════════════════╝

🧠 Stage 1: Contextual Analysis | 🔍 Stage 2: Analytical Insights
⚡ Stage 3: Strategic Planning | 💡 Stage 4: Breakthrough Innovation

[PROGRESSIVE THINKING EXECUTION]

╔═══════════════════════════════════════════════════════════╗
║         ✅ PROGRESSIVE ANALYSIS COMPLETED                 ║
╠═══════════════════════════════════════════════════════════╣
║ Insights: [breakthrough_count] | Quality: [assessment]   ║
║ Integration: Enhanced routing | Strategy: Optimized      ║
║ Results: [strategic_outcomes] | Next: [routing_decision] ║
╚═══════════════════════════════════════════════════════════╝
```

### **Compliance Enforcement - CRITICAL**

- **NEVER skip script announcements**: Every bash script execution must be announced
- **NEVER simulate calculations**: All mathematical results must come from real script execution
- **NEVER hide script failures**: Surface any script execution issues immediately
- **ALWAYS show routing justification**: Display mathematical basis for routing decisions
- **ALWAYS display trigger validation**: Show which triggers passed/failed from test system
- **ALWAYS integrate progressive thinking**: Announce when deep analysis is activated

**P55/P56 Compliance**: This command integrates Tool Call Execution Bridging (P55) through mandatory script execution and Command Execution Transparency (P56) through comprehensive visual announcements of all mathematical and routing operations.

---

**Note**: This command now serves as the script-integrated neural system of the Context Engineering ecosystem with complete automation and transparency. Implements validated mathematical triggers from test-trigger-system.sh, real command execution via execute-commands.sh, deep analysis through progressive-thinking.md, and automatic integration with confidence-scoring and trigger-monitor. Maintains "Enable, Don't Control" philosophy while providing fully autonomous intelligent routing with mathematical precision, script validation, and complete visual transparency. The automation is now **REAL** and **EXECUTABLE** rather than theoretical, leveraging existing proven scripts for immediate implementation with full user visibility.