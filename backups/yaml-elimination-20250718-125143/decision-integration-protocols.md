# Decision Integration Protocols Module

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
source ../../../../scripts/core/path-helper.sh && PROJECT_ROOT="$(get_project_root)" && ls -la "${PROJECT_ROOT}/scripts/formulas/"
source ../../../../scripts/core/path-helper.sh && PROJECT_ROOT="$(get_project_root)" && ls -la "${PROJECT_ROOT}/scripts/core/calculate-real-metrics.sh"
```

### **Phase 2: Execute Mathematical Calculations**
```bash
# MANDATORY: Load and execute mathematical formula library
source ../../../../scripts/core/path-helper.sh && PROJECT_ROOT="$(get_project_root)" && cd "${PROJECT_ROOT}/scripts/formulas/"
source ./context_engineering_formulas.sh

# Execute confidence calculation (domain_familiarity requirement_clarity resource_availability)
calculate_confidence 0.8 0.9 0.7

# Execute complexity calculation (objective_count dependency_factor integration_complexity)
calculate_complexity 3 2.1 1.5
```

### **Phase 3: Execute Real Metrics Calculation**
```bash
# MANDATORY: Execute comprehensive metrics calculation script
cd ../../../
source ../../../../scripts/core/path-helper.sh && execute_script "scripts/core/calculate-real-metrics.sh"
```

### **Phase 4: Validate Mathematical Formulas**
```bash
# MANDATORY: Execute mathematical validation to ensure accuracy
../../../scripts/compliance/verify-mathematical-formulas.sh
```

### **Phase 5: Execute Trigger System Validation**
```bash
# MANDATORY: Execute trigger system for decision routing
../../../scripts/core/test-trigger-system.sh
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

## 🔗 **SCRIPT-INTEGRATED AUTOMATIC ECOSYSTEM INTEGRATION**

### **Script-Powered Pipeline: decision-engine → confidence-scoring → trigger-monitor**
**Script Integrated Automatic Integration**:
  **Script Foundation**:
    - **Trigger Validation**: test-trigger-system.sh
    - **Execution Engine**: execute-commands.sh
    - **Formula Library**: context_engineering_formulas.sh
    - **Progressive Analysis**: progressive-thinking.md
  **Sequence With Script Validation**:
    - **1. Decision-Engine**: Script-validated task analysis and routing determination
    - **2. Progressive-Thinking**: Deep analysis when complexity >= 1.0 OR confidence < 0.7
    - **3. Confidence-Scoring**: Script-calculated confidence with mathematical precision
    - **4. Trigger-Monitor**: Script-monitored execution with real-time dashboard
  **Data Flow Script Enhanced**:
    **Decision Engine Output**:
    - {'routing_decision': 'selected_command_sequence (script-validated)'}
    - {'confidence_estimate': 'calculate_confidence(domain, clarity, resources)'}
    - {'complexity_analysis': 'calculate_complexity(objectives, dependencies, integration)'}
    - {'parallel_opportunities': 'identified_via_test_parallel_benefit_trigger'}
    - {'script_validation_results': '22_trigger_tests_status'}
    - {'progressive_thinking_required': 'boolean_based_on_thresholds'}
    **Progressive Thinking Output**:
    - {'contextual_analysis': 'stage_1_deep_understanding'}
    - {'analytical_insights': 'stage_2_strategic_implications'}
    - {'strategic_planning': 'stage_3_implementation_design'}
    - {'breakthrough_innovations': 'stage_4_revolutionary_insights'}
    - {'synthesized_intelligence': 'combined_strategic_output'}
    **Confidence Scoring Input**:
    - {'routing_decision': 'from decision-engine (script-validated)'}
    - {'progressive_insights': 'from progressive-thinking (if executed)'}
    - {'task_context': 'enhanced_with_routing_analysis_and_deep_thinking'}
    - {'verification_requirements': 'based_on_script_calculated_complexity'}
    - {'mathematical_precision': '4_decimal_places_maintained'}
    **Trigger Monitor Input**:
    - {'confidence_score': 'from confidence-scoring (script-calculated)'}
    - {'routing_decision': 'from decision-engine (script-validated)'}
    - {'progressive_analysis': 'from progressive-thinking (if executed)'}
    - {'monitoring_requirements': 'based_on_script_complexity_and_confidence'}
    - {'script_health_monitoring': 'continuous_script_system_validation'}

### **Script-Validated Automatic Command Activation Rules**
**Script Validated Auto Activation Rules**:
  **Confidence Below Low Threshold**:
    - **Condition**: confidence_score < 0.5
    - **Script Validator**: test_confidence_trigger_low
    - **Action**: auto_activate_multi_agent_orchestration
    - **Verification**: multi_agent_coordination_active
  **Confidence Below Medium Threshold**:
    - **Condition**: confidence_score < 0.7
    - **Script Validator**: test_confidence_trigger_medium
    - **Action**: auto_activate_exploration_first
    - **Verification**: exploration_completed_successfully
  **Complexity Above Basic Threshold**:
    - **Condition**: complexity_score >= 1.0
    - **Script Validator**: test_complexity_trigger
    - **Action**: auto_activate_advanced_routing
    - **Verification**: advanced_routing_engaged
  **Complexity Above Decomposition Threshold**:
    - **Condition**: complexity_score > 2.0
    - **Script Validator**: test_complexity_decomposition_trigger
    - **Action**: auto_activate_objective_decomposition
    - **Verification**: objectives_properly_decomposed
  **Parallel Opportunities Detected**:
    - **Condition**: parallel_benefit >= 0.3
    - **Script Validator**: test_parallel_benefit_trigger
    - **Action**: auto_activate_multi_agent_orchestration
    - **Verification**: parallel_execution_optimized
  **Success Rate Below Threshold**:
    - **Condition**: success_rate < 0.85
    - **Script Validator**: test_success_rate_trigger
    - **Action**: auto_activate_restart_protocol
    - **Verification**: system_performance_improved
  **Conversation Time Exceeded**:
    - **Condition**: conversation_minutes > 60
    - **Script Validator**: test_time_trigger
    - **Action**: auto_activate_lifecycle_management
    - **Verification**: conversation_lifecycle_managed
  **Adaptive Threshold Not Met**:
    - **Condition**: confidence < adaptive_threshold
    - **Script Validator**: test_adaptive_trigger
    - **Action**: auto_activate_context_appropriate_escalation
    - **Verification**: threshold_requirements_satisfied
  **Progressive Thinking Required**:
    - **Condition**: (complexity_score >= 1.0) OR (confidence_score < 0.7) OR (deep_analysis_needed)
    - **Script Validator**: progressive_thinking_md_integration
    - **Action**: auto_activate_progressive_thinking_sequence
    - **Verification**: four_stage_thinking_completed
  **Verification Required**:
    - **Condition**: routing_accuracy < 0.95
    - **Script Validator**: execute_commands_sh_validation
    - **Action**: auto_activate_verification_loops
    - **Verification**: routing_accuracy_improved_and_script_validated

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
**Learning Integration**:
  **Pattern Recognition**:
  - successful_routing_patterns → crystallize_for_reuse
  - failed_routing_attempts → update_fallback_strategies
  - confidence_accuracy_correlation → refine_confidence_calculation
  - complexity_prediction_accuracy → improve_complexity_formulas
  **Auto Optimization**:
  - threshold_adjustment_based_on_success_rates
  - routing_strategy_refinement_based_on_outcomes
  - confidence_formula_tuning_based_on_predictive_accuracy
  - complexity_calculation_improvement_based_on_actual_results

---

## 📚 **Cross-References**

**CRITICAL Dependencies**:
- [Decision Logic Core](./decision-logic-core.md) - Core triggers and validation protocols
- [Routing Patterns](./decision-routing-patterns.md) - Command functionality implementation
- [Validation Framework](./decision-validation-framework.md) - Compliance and behavioral protocols

**Script Integration**:
- [Mathematical Formulas](../scripts/formulas/context_engineering_formulas.sh) - Core calculation library
- [Trigger System](../scripts/core/test-trigger-system.sh) - Validation engine
- [Real Metrics](../scripts/core/calculate-real-metrics.sh) - Execution metrics

**System Components**:
- [Progressive Thinking](../behavioral/intelligence/thinking.md) - Deep analysis integration
- [Trigger Monitor](../verification/trigger-monitor.md) - Real-time monitoring
- [Confidence Scoring](../verification/confidence-scoring.md) - Mathematical confidence

---

**Module Purpose**: Script integration protocols and tool execution bridges for real mathematical calculations and trigger validation. Enables transparent script-powered decision routing with ≥95% accuracy and complete automation transparency.