# Orchestrator Command: `/rapid-prototype`

## **Optimización: Prototipado Ágil Inteligente**
**"Implementación y validación rápida de conceptos con paralelización automática."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Orquestrador optimizado para prototipado ágil, implementación rápida y validación de conceptos. Diseñado para casos donde necesitas probar ideas, implementar features o validar conceptos rápidamente con alta calidad.

### **Complexity**: 1.3/1.0
### **Context Required**: Concepto/feature específico a implementar
### **Execution Time**: 5-8 minutos (50% más rápido que meta-comando)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Usage Format**
```
/rapid-prototype [concepto_específico]
/rp [concepto_específico]          # shortcut
```

### **Optimización Inteligente**
- **🚀 Paralelización nativa**: Benefit ≥ 0.6 aprovechado automáticamente
- **⚡ TDD integrado**: Test-first approach para calidad garantizada
- **🎯 Implementación enfocada**: Solo comandos necesarios para prototipado
- **📊 Verificación continua**: Loops de verificación integrados

---

## 🔗 **ORCHESTRATED COMMAND CHAIN**

### **Secuencia Paralela Optimizada (4 comandos core)**
```yaml
chain_execution:
  parallel_phase_1: # Ejecutar simultáneamente
    1. decompose: "Descomposición de objetivos específicos"
    2. tdd: "Framework de tests y criterios de verificación"
  
  parallel_phase_2: # Después de phase 1
    3. parallel: "Implementación paralela de componentes"
    4. verify-loops: "Verificación continua durante implementación"
  
  execution_strategy:
    phase_1_parallel_benefit: 0.7 # decompose + tdd independientes
    phase_2_parallel_benefit: 0.6 # implementación + verificación paralela
    total_time_saving: "50% vs ejecución secuencial"
```

### **Context Distribution (Economy Active)**
```yaml
context_per_phase:
  phase_1_parallel:
    decompose: 
      context: "concepto + requirements + constraints"
      size: "~25% del contexto total"
    tdd:
      context: "concepto + testing_strategy + quality_criteria" 
      size: "~25% del contexto total"
      
  phase_2_parallel:
    parallel:
      context: "objetivos_decomposed + test_framework"
      size: "~30% del contexto total"
    verify-loops:
      context: "implementation_progress + verification_criteria"
      size: "~20% del contexto total"
    
total_context_economy: "70% vs meta-comando completo"
efficient_coordination: "context sharing entre parallel agents"
```

---

## 📊 **MATHEMATICAL VALIDATION**

### **Parallel Efficiency Calculation**
```javascript
function calculateRapidPrototypeEfficiency() {
  const phase_1_parallel_benefit = 0.7 // decompose + tdd
  const phase_2_parallel_benefit = 0.6 // implementation + verification
  const context_economy = 0.7 // 70% reducción
  const tdd_quality_factor = 0.95 // 95% quality maintained
  const time_acceleration = 0.5 // 50% más rápido
  
  return {
    overall_efficiency: (phase_1_parallel_benefit + phase_2_parallel_benefit) / 2,
    quality_maintained: tdd_quality_factor,
    time_savings: time_acceleration,
    recommended_for: "conceptos_implementables_específicos"
  }
}
```

### **Success Thresholds**
- **Implementation Speed**: ≥50% reducción vs approach secuencial
- **Quality Assurance**: ≥90% con TDD integrado
- **Parallel Coordination**: ≥85% efficiency en coordinación
- **Test Coverage**: ≥80% criterios de verificación cumplidos

---

## 🔍 **INTELLIGENT ROUTING CRITERIA**

### **Ideal Use Cases (Auto-detect)**
```yaml
perfect_fit:
  - "implementar feature específica"
  - "probar concepto/idea rápidamente"
  - "crear prototipo funcional"
  - "validar approach técnico"
  - "desarrollar MVP/PoC"
  - "refactoring con tests"

avoid_for:
  - exploración_sin_implementación (usar /quick-explore)
  - planning_estratégico_complejo (usar /planning-workflow)
  - análisis_arquitectural (usar /context-eng)
  - mantenimiento_sistema (usar /system-health)
```

### **Readiness Assessment**
```javascript
function assessPrototypingReadiness(concept, context) {
  const implementation_clarity = assessImplementationScope(concept) // 0.0-1.0
  const requirements_defined = detectRequirements(concept) // boolean
  const testability_score = assessTestability(concept) // 0.0-1.0
  const complexity_manageable = estimateComplexity(concept) <= 2.0 // boolean
  
  if (implementation_clarity >= 0.6 && 
      requirements_defined && 
      testability_score >= 0.7 &&
      complexity_manageable) {
    return { ready: true, confidence: 0.9, estimated_time: "5-8 min" }
  }
  
  return { 
    ready: false, 
    missing: identifyMissingElements(concept),
    alternative: "/quick-explore → /rapid-prototype"
  }
}
```

---

## ⚡ **EXECUTION WORKFLOW**

### **Phase 1: Parallel Planning & Testing Setup (2-3 min)**
```yaml
parallel_execution_phase_1:
  agent_1_decompose:
    task: "Descomponer concepto en objetivos verificables"
    focus: "implementation_chunks + dependencies + priorities"
    context: "concepto + constraints + target_outcome"
    output: "structured_objectives + implementation_roadmap"
    
  agent_2_tdd:
    task: "Establecer framework de tests y criterios"
    focus: "verification_criteria + test_strategy + quality_gates"
    context: "concepto + quality_requirements + acceptance_criteria"
    output: "test_framework + verification_loops_config"
    
coordination:
  simultaneous_launch: true
  shared_context: "concepto_core + requirements"
  cross_agent_validation: "objectives ↔ test_criteria alignment"
```

### **Phase 2: Parallel Implementation & Verification (3-5 min)**
```yaml
parallel_execution_phase_2:
  agent_3_parallel_implementation:
    task: "Implementación paralela de componentes"
    input: "structured_objectives from agent_1"
    strategy: "parallel_over_sequential para componentes independientes"
    context: "implementation_roadmap + test_framework"
    output: "working_prototype + component_implementations"
    
  agent_4_verify_loops:
    task: "Verificación continua durante implementación"
    input: "test_framework from agent_2 + implementation_progress"
    strategy: "continuous_verification_loops"
    context: "verification_criteria + quality_gates"
    output: "verification_results + quality_metrics"
    
coordination:
  real_time_feedback: "verification → implementation adjustments"
  early_problem_detection: true
  quality_gate_enforcement: "auto-stop si quality < threshold"
```

### **Result Synthesis & Output**
```yaml
rapid_prototype_output:
  working_prototype:
    status: "functional/partially_functional/concept_validated"
    components: "list of implemented components"
    test_coverage: "percentage + critical paths covered"
    
  implementation_insights:
    approach_validation: "concept feasibility confirmed/challenged"
    technical_decisions: "key implementation choices made"
    challenges_discovered: "obstacles found + solutions applied"
    
  next_steps:
    if_prototype_successful: "production implementation roadmap"
    if_challenges_found: "specific solutions needed"
    if_concept_invalid: "alternative approaches recommended"
    
  quality_metrics:
    test_success_rate: "percentage tests passing"
    implementation_completeness: "percentage objectives achieved"
    code_quality_score: "if applicable"
    execution_time: "actual vs estimated"
```

---

## 🔀 **INTELLIGENT CHAINING & ESCALATION**

### **Auto-Chain Opportunities**
```yaml
natural_follow_ups:
  if_prototype_successful:
    suggest: "/execution-workflow [production_implementation]"
    confidence: 0.9
    context_transfer: "prototype_insights + implementation_roadmap"
    
  if_more_features_needed:
    suggest: "/rapid-prototype [next_feature]"
    confidence: 0.85
    context_transfer: "existing_prototype + new_requirements"
    
  if_architecture_questions:
    suggest: "/context-eng [architectural_analysis]"
    confidence: 0.8
    
  if_patterns_emerged:
    suggest: "/crystallize-patterns"
    confidence: 0.75
```

### **Escalation Protocol**
```yaml
escalation_triggers:
  complexity_exceeds_scope:
    condition: "implementation_complexity > 2.0 discovered during execution"
    action: "auto-suggest /planning-workflow for comprehensive approach"
    
  requirements_unclear:
    condition: "requirements_clarity < 0.6 during decomposition"
    action: "auto-suggest /quick-explore to clarify requirements first"
    
  quality_gates_failing:
    condition: "verification_success_rate < 70%"
    action: "auto-pause + suggest /verify-flow for enhanced verification"
    
  implementation_blocked:
    condition: "critical_dependency_missing OR technical_blocker"
    action: "auto-escalate to /context-eng with problem_context"
```

---

## 📋 **USAGE EXAMPLES**

### **Example 1: Feature Implementation**
```bash
/rp "implementar autenticación OAuth2 con Google para la aplicación"
```
**Parallel Execution**: 
- Agent 1: Descompose → OAuth flow + UI + backend + storage
- Agent 2: TDD → Auth tests + security tests + integration tests
- Agent 3: Implement → Parallel OAuth components
- Agent 4: Verify → Continuous security & functionality verification

### **Example 2: Concept Validation**
```bash
/rp "probar usar WebAssembly para mejorar performance de algoritmo de procesamiento"
```
**Result**:
- Working WASM prototype + performance benchmarks
- JavaScript fallback implementation  
- Performance comparison metrics
- Production readiness assessment

### **Example 3: Refactoring with Safety**
```bash
/rp "refactorizar sistema de cache para usar Redis en lugar de memoria"
```
**Parallel Approach**:
- Decomposition: Cache abstraction + Redis integration + migration strategy
- TDD: Cache behavior tests + performance tests + failure scenarios
- Implementation: Redis adapter + cache abstraction + migration tools
- Verification: Performance tests + data integrity + rollback capability

---

## 🛡️ **QUALITY ASSURANCE & FALLBACKS**

### **Quality Gates (Auto-enforced)**
```yaml
mandatory_quality_gates:
  decomposition_quality:
    minimum_objectives: 2
    clarity_score: ≥0.7
    testability_score: ≥0.7
    
  tdd_framework_quality:
    test_coverage_plan: ≥80%
    verification_criteria: ≥3
    quality_metrics_defined: true
    
  implementation_quality:
    working_prototype: true
    test_success_rate: ≥70%
    basic_functionality: verified
    
  time_management:
    execution_time_limit: 10_minutes_max
    auto_checkpoint: "every 3 minutes"
    escalation_trigger: "if_no_progress_in_4_minutes"
```

### **Fallback Strategies**
```yaml
fallback_protocols:
  if_parallel_coordination_fails:
    action: "fallback to optimized sequential execution"
    maintain: "TDD framework + verification loops"
    
  if_implementation_complexity_exceeds:
    action: "scope reduction + core functionality focus"
    escalate: "/planning-workflow for comprehensive approach"
    
  if_quality_gates_not_met:
    action: "extend verification phase + quality improvement"
    option: "suggest manual review + expert consultation"
    
  if_concept_not_feasible:
    action: "document findings + suggest alternative approaches"
    value: "negative results también son valiosos"
```

---

## 🎯 **INTEGRATION WITH DECISION ENGINE**

### **Decision Engine Bypass (Optimized Path)**
```yaml
bypass_conditions:
  when: "clear_implementation_objective + requirements_available"
  criteria:
    - implementation_scope_defined
    - testability_confirmed
    - complexity_estimate ≤ 2.0
    - no_architectural_analysis_needed
  
  direct_execution: true
  skip_phases: ["discovery", "strategic_planning"]
  maintain: ["verification", "quality_assurance"]
```

### **Smart Integration Points**
```javascript
function integrateWithEcosystem(prototype_results) {
  // Auto-suggest next logical steps based on results
  if (prototype_results.success_rate >= 0.8) {
    return suggestProductionPath(prototype_results)
  }
  
  if (prototype_results.patterns_discovered >= 2) {
    return suggestPatternCrystallization(prototype_results.patterns)
  }
  
  if (prototype_results.architectural_insights) {
    return suggestArchitecturalAnalysis(prototype_results.insights)
  }
  
  return suggestIterativeImprovement(prototype_results.gaps)
}
```

---

## 📊 **SUCCESS METRICS & LEARNING**

### **Performance Tracking**
```yaml
key_metrics:
  execution_efficiency:
    target_time: "5-8 minutes"
    parallel_benefit_achieved: "≥60%"
    context_economy: "≥70%"
    
  quality_metrics:
    prototype_success_rate: "≥80%"
    test_coverage_achieved: "≥80%"
    implementation_completeness: "≥70%"
    
  user_experience:
    concept_validation_accuracy: "≥85%"
    next_steps_clarity: "≥90%"
    escalation_appropriateness: "≤20%"
```

### **Continuous Learning**
```yaml
learning_patterns:
  successful_decomposition_strategies: "improve decompose effectiveness"
  effective_test_frameworks: "enhance TDD integration"
  optimal_parallel_groupings: "refine parallelization strategy"
  common_escalation_triggers: "improve scope detection"
  
pattern_crystallization:
  if_success_rate_≥_90%: "crystallize as reusable rapid-prototype pattern"
  if_specific_domain_patterns: "create domain-specific variants"
```

---

## 🔗 **NATURAL CONNECTIONS**

### **Feeds Into**
- `/execution-workflow` - For production implementation
- `/verify-flow` - For enhanced verification
- `/crystallize-patterns` - When patterns emerge
- `/planning-workflow` - When scope grows

### **Feeds From**
- `/quick-explore` - After concept exploration
- `/smart-workflow` - As recommended implementation approach
- Direct user invocation for specific prototyping needs
- `/decision-engine` - When implementation readiness detected

---

**Note**: Este orquestrador optimiza el ciclo prototipado → validación → iteración mediante paralelización inteligente y TDD integrado. Mantiene alta calidad mientras acelera significativamente el time-to-prototype para conceptos específicos.