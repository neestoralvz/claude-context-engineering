# Decision Engine - Mathematical Trigger Framework

**Meta-Principle**: "Enable autonomous decision-making through mathematical analysis and intelligent trigger validation"

**Specialized Module**: CRITICAL mathematical trigger system that extends Decision Engine Core with validated activation protocols, script integration, and automated trigger management.

**Module Integration**: [Decision Engine Core](./decision.md) | [Tool Execution Framework](./decision-execution.md) | [Ecosystem Integration](./decision-ecosystem.md)

---

## 🏗️ **MODULE INHERITANCE**

**Inherits from**: [Decision Engine Core](./decision.md)

**Inherited Functions**:
- Core confidence calculation algorithms
- Basic complexity assessment protocols  
- Fundamental routing decision logic
- Essential mathematical validation frameworks

**Specialized Functions Added**:
- Mathematical trigger activation protocols
- Script-integrated validation systems
- Automated threshold management
- Multi-level trigger coordination

---

## ⚡ **ACTIVATION PROTOCOL**

### **Auto-Activation Triggers**
This module EXECUTES automatically when the system detects intelligent routing requirements with ≥80% certainty. DESIGNED for agentic LLM systems requiring autonomous activation with zero manual intervention and ≥98% reliability.

**Verification Protocol**: 
- **Detection Accuracy**: ≥80% certainty threshold for auto-activation
- **Autonomous Execution**: Zero manual intervention required
- **Reliability Standard**: ≥98% successful autonomous activation rate
- **Mathematical Validation**: All triggers validated via test-trigger-system.sh

### **Primary Triggers (Automatic Activation)**

**PRIMARY TRIGGER**: Command routing requirement detected with ≥80% certainty
- **Condition**: Command routing needed with quantifiable uncertainty ≥0.3
- **Threshold**: ≥2 command options available with confidence differential ≥0.2
- **Action**: AUTO-EXECUTE decision-engine with mathematical validation
- **Verification**: Optimal routing selected with ≥95% accuracy score
- **Observable Outcome**: Mathematical routing decision documented with confidence metrics

**COMPLEXITY TRIGGER**: Task complexity reaches 1.0 or higher via calculate_complexity formula
- **Condition**: Task complexity ≥ 1.0 (calculated via validated mathematical formula)
- **Threshold**: 1.0 (validated threshold for mandatory advanced routing activation)
- **Action**: AUTO-EXECUTE decision-engine for complex analysis with script validation
- **Verification**: Complexity analyzed with ≥95% accuracy and optimal route selected
- **Mathematical Evidence**: calculate_complexity(objectives, dependencies, integration) ≥ 1.0

**CONFIDENCE TRIGGER**: System confidence drops below 0.7 via calculate_confidence formula
- **Condition**: Confidence score < 0.7 (calculated via validated mathematical formula)
- **Threshold**: 0.7 (CRITICAL threshold for MANDATORY exploration with zero tolerance)
- **Action**: AUTO-EXECUTE exploration-first methodology with ≥95% completion rate
- **Verification**: Appropriate route for confidence level + exploration completed with quantifiable outcomes
- **Auto-escalation**: If confidence < 0.5 → AUTO-EXECUTE multi-agent-orchestration with validated coordination
- **Mathematical Evidence**: calculate_confidence(domain, clarity, resources) < 0.7
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

## ⚡ **INTELLIGENT TRIGGER SYSTEM WITH SCRIPT INTEGRATION**

### **Automated Trigger System (Script-Powered)**

**Integration with test-trigger-system.sh**: This module now automatically executes mathematical trigger validation using the existing trigger system script.

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

## 🔗 **USAGE CRITERIA**

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

**Module Dependencies**: [Decision Engine Core](./decision.md) (required)
**Used By**: All orchestrators, meta-commands, and routing systems
**Integration**: [Tool Execution Framework](./decision-execution.md) | [Ecosystem Integration](./decision-ecosystem.md)
**Script Integration**: test-trigger-system.sh, context_engineering_formulas.sh