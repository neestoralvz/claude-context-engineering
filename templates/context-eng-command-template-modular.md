# [Command Name] Universal Command Template (Modular LLM Edition)

## Command: `/[command-name]` (aliases: `/[alias1]`, `/[alias2]`)

**Meta-Principle**: "[Core philosophical principle that guides the command]"

**Modularization Strategy**: This command implements **LLM-to-LLM delegation** to preserve full functionality while optimizing execution through specialist coordination rather than internal complexity.

[Brief description of command purpose with emphasis on how it delegates complex operations to specialist LLMs for optimal performance]

**Enhanced with [Key Feature]**: [Description of capabilities achieved through modular specialist coordination]

---

## 🎯 AUTO-ACTIVATION TRIGGERS

### **Auto-Activation Purpose**
[Clear explanation of when and why the command auto-activates, emphasizing delegation triggers]

### **PRIMARY TRIGGERS (Automatic Activation)**

**[PRIMARY TRIGGER NAME]**: [Specific trigger description]
- **Condition**: [Specific condition]
- **Threshold**: [Numerical threshold when applicable]
- **Action**: Activate [command-name] with [delegation strategy]
- **Verification**: [Verification method]

**[COMPLEXITY TRIGGER NAME]**: [Complexity-based trigger]
- **Condition**: Task complexity ≥ [threshold]
- **Threshold**: [Value specific to command]
- **Action**: Auto-activate [command-name] with [specialist delegation]
- **Verification**: [Success criteria]

**[CONFIDENCE TRIGGER NAME]**: [Confidence-based trigger]
- **Condition**: Confidence < [threshold]
- **Threshold**: [Value specific to command]
- **Action**: Auto-activate [command-name] with [specialist coordination]
- **Verification**: [Quality gates]

---

## 🚀 MODULAR ACTIVATION PROTOCOL

Command invocation activates **intelligent specialist coordination** that preserves full complexity through **LLM-to-LLM delegation** rather than internal processing.

### **🔗 LLM Delegation Strategy**

**Intelligent Modularization** reduces internal complexity by [X]% while maintaining 100% functionality:

```yaml
llm_delegation_architecture:
  simple_tasks_complexity_≤_[threshold]:
    delegation_approach: "Direct specialist execution"
    specialists_required: [1-2]
    coordination_overhead: "minimal"
    optimization: "[X]% faster through specialist focus"
    
  medium_tasks_complexity_[range]:
    delegation_approach: "Coordinated specialist sequence"
    specialists_required: [2-4]
    coordination_overhead: "moderate"
    optimization: "[X]% faster through specialist expertise"
    
  complex_tasks_complexity_≥_[threshold]:
    delegation_approach: "Multi-specialist orchestration"
    specialists_required: [3-8]
    coordination_overhead: "comprehensive"
    optimization: "100% functionality with distributed intelligence"

delegation_triggers:
  complexity_escalation:
    condition: "discovered_complexity > initial_estimate + [threshold]"
    action: "auto-escalate to next specialist tier"
    
  specialist_optimization:
    condition: "specialist_results_exceed_expectations"
    action: "capture pattern for future optimization"
```

### **🧠 Specialist Identification and Delegation**

**Module Extraction Strategy** identifies complex operations for specialist delegation:

```javascript
function identifyDelegationOpportunities(command_logic) {
  const complexity_modules = analyzeInternalComplexity(command_logic)
  const existing_specialists = scanSpecialistRegistry()
  
  // Decision Engine Complex Detection
  if (complexity_modules.decision_analysis > 50) {
    return {
      module: "decision_engine_complex",
      delegate_to: "/decision",
      benefit: "Use proven decision specialist vs internal logic",
      complexity_reduction: "60-80%"
    }
  }
  
  // Multi-Agent Orchestration Detection
  if (complexity_modules.agent_coordination > 30) {
    return {
      module: "multi_agent_orchestration",
      delegate_to: "/orchestrate",
      benefit: "Use proven communication mesh vs manual coordination",
      complexity_reduction: "70-90%"
    }
  }
  
  // Registry Integration Detection
  if (complexity_modules.registry_analysis > 40) {
    return {
      module: "registry_integration",
      delegate_to: ["/registry-metrics-update", "/sync-docs"],
      benefit: "Use registry specialists vs complex internal analysis",
      complexity_reduction: "50-70%"
    }
  }
  
  return standard_execution_path()
}
```

---

## 🔗 **MANDATORY LLM DELEGATION PROTOCOL**

### **Phase-Based Specialist Coordination**

Command execution follows **modular specialist delegation** pattern:

```yaml
modular_execution_phases:
  phase_0_foundation:
    action: "MANDATORY SCRIPT INTEGRATION: Execute foundational script validation"
    tool_call_requirement: "LLM MUST execute Bash tool for script foundation"
    evidence_required: "User sees actual script execution results"
    
  phase_1_specialist_analysis:
    action: "SPECIALIST DELEGATION: Delegate complex analysis to appropriate specialist"
    delegation_protocol:
      condition_assessment: "Analyze objective complexity and specialist requirements"
      specialist_selection: "SELECT optimal specialist FROM existing_commands WHERE capability MATCHES requirement"
      specialist_request: "SPECIALIST_REQUEST: [specialist_name] with structured parameters"
      
  phase_2_specialist_coordination:
    action: "SPECIALIST ORCHESTRATION: Coordinate multiple specialists when beneficial"
    coordination_protocol:
      parallel_opportunity: "Assess specialist parallelization benefits"
      communication_bridge: "Establish bidirectional specialist communication"
      progress_aggregation: "Aggregate specialist progress for user visibility"
      
  phase_3_results_synthesis:
    action: "RESULTS INTEGRATION: Synthesize specialist outputs into unified results"
    synthesis_protocol:
      specialist_handoff: "Receive structured results from specialists"
      quality_validation: "Validate specialist results meet quality standards"
      unified_output: "Present synthesized results to user"
```

### **🎯 Specialist Selection Matrix**

**Dynamic Specialist Assignment** based on complexity analysis:

```yaml
specialist_assignment_matrix:
  decision_analysis_required:
    complexity_threshold: "> 50 lines internal logic"
    specialist: "/decision"
    delegation_pattern: "SPECIALIST_REQUEST: decision-engine analysis"
    expected_output: "complexity_score, confidence_level, routing_strategy"
    
  multi_agent_coordination_required:
    complexity_threshold: "> 3 concurrent processes"
    specialist: "/orchestrate"
    delegation_pattern: "SPECIALIST_REQUEST: multi-agent orchestration"
    expected_output: "coordinated_execution, communication_mesh, progress_synthesis"
    
  registry_integration_required:
    complexity_threshold: "> 20 command registry operations"
    specialist: ["/registry-metrics-update", "/sync-docs"]
    delegation_pattern: "SPECIALIST_REQUEST: registry operations"
    expected_output: "registry_state, performance_metrics, synchronization_status"
    
  verification_coordination_required:
    complexity_threshold: "> 4 verification dimensions"
    specialist: "/verification-engine"
    delegation_pattern: "SPECIALIST_REQUEST: comprehensive verification"
    expected_output: "verification_results, confidence_scores, compliance_status"
```

---

## 🔧 **SPECIALIST COMMUNICATION PROTOCOL**

### **LLM-to-LLM Handoff Standards**

**Structured Communication** ensures seamless specialist coordination:

```yaml
specialist_communication_protocol:
  template_to_specialist:
    format: |
      ╔═══════════════════════════════════════════════════════════╗
      ║              🤖 SPECIALIST DELEGATION                     ║
      ╠═══════════════════════════════════════════════════════════╣
      ║ Specialist: [specialist_name] | Priority: [level]        ║
      ║ Purpose: [delegation_purpose] | Duration: [estimate]     ║
      ║ Context: [user_objective] | Complexity: [score]          ║
      ║ Real Delegation: ✅ | Simulation: ❌                    ║
      ╚═══════════════════════════════════════════════════════════╝
      
      SPECIALIST_REQUEST: [specialist_name]
      CONTEXT: [user_objective + phase_context + relevant_data]
      INPUTS: [structured_parameters_object]
      EXPECTED_OUTPUT: [result_format_specification]
      COMMUNICATION_BRIDGE: bidirectional_enabled
      QUALITY_REQUIREMENTS: [success_criteria]
      
  specialist_to_template:
    format: |
      ╔═══════════════════════════════════════════════════════════╗
      ║              ✅ SPECIALIST COMPLETED                      ║
      ╠═══════════════════════════════════════════════════════════╣
      ║ Specialist: [specialist_name] | Status: [SUCCESS/FAILED] ║
      ║ Duration: [actual_time] | Confidence: [score]            ║
      ║ Evidence: [proof_of_execution] | Quality: [metrics]      ║
      ╚═══════════════════════════════════════════════════════════╝
      
      SPECIALIST_RESPONSE: [specialist_name]
      RESULTS: [structured_results_object]
      CONFIDENCE: [0.0-1.0_numerical_score]
      EVIDENCE: [supporting_data_and_execution_proof]
      RECOMMENDATIONS: [optional_next_steps]
      HANDOFF_STATUS: control_transfer_ready
```

### **P55/P56 Compliance for Specialist Delegation**

**Tool Call Execution Requirements** for specialist coordination:

```yaml
p55_p56_specialist_compliance:
  mandatory_tool_call_execution:
    - "CRITICAL: Every specialist delegation REQUIRES actual tool call execution"
    - "EXPLICIT: NEVER simulate specialist interaction - ALWAYS execute real delegation"
    - "MANDATORY: Display P56 announcements for EACH specialist delegation"
    - "REQUIRED: Show specialist progress updates and actual results"
    
  specialist_transparency:
    - "Visual announcement before EVERY specialist delegation"
    - "Real-time progress reporting from specialist execution"
    - "Actual specialist results displayed to user"
    - "Bidirectional communication status maintained"
    
  delegation_verification:
    - "Each specialist delegation requires actual tool call"
    - "Specialist results must include evidence of real execution"
    - "NO EXCEPTIONS: Simulation prohibited for all specialist interactions"
    - "Quality validation based on actual specialist outputs"
```

---

## 📊 **MODULAR SUCCESS METRICS**

### **Specialist Coordination Performance**

**Delegation Effectiveness Metrics**:
```yaml
modular_performance_metrics:
  complexity_reduction:
    internal_logic_reduction: "[X]% less internal complexity"
    specialist_efficiency: "[Y]% faster through specialist expertise"
    maintenance_improvement: "[Z]% easier maintenance through modularization"
    
  functionality_preservation:
    capability_retention: "100% functionality maintained through delegation"
    quality_enhancement: "[X]% improved quality through specialist expertise"
    reliability_improvement: "[Y]% more reliable through proven specialists"
    
  coordination_efficiency:
    delegation_overhead: "[X]ms average delegation time"
    communication_latency: "[Y]ms specialist communication response"
    synthesis_time: "[Z]ms results aggregation and presentation"
```

### **Mathematical Validation with Specialist Integration**

**Validation Requirements**:
- Dynamic thresholds via **DELEGATED** `/decision-engine` analysis
- Parallel benefit calculation via **DELEGATED** `/parallel-over-sequential` (≥0.3 threshold)
- Confidence scoring via **DELEGATED** `/confidence-scoring` with specialist-enhanced accuracy
- Mathematical precision via **DELEGATED** `/verification-engine` comprehensive validation

---

## 🎯 **INTELLIGENT USAGE PATTERNS (Modular)**

### **Specialist-Enhanced Invocation**
```
/[command-name] "[objective]" [complexity_hint?] [specialist_preference?]
```

### **Dynamic Specialist Examples**:
```bash
# Example 1: Automatic Decision Specialist Delegation
/[command-name] "Complex analysis requiring decision expertise"
// Complexity Analysis: Internal logic > 50 lines detected
// Auto-delegates: /decision for complexity/confidence analysis
// Specialist Evidence: User sees actual decision specialist results
// Integration: Main command uses specialist analysis for execution

# Example 2: Multi-Specialist Coordination
/[command-name] "Multi-dimensional task requiring orchestration"
// Complexity Analysis: Multiple specialist domains detected
// Auto-delegates: /decision + /orchestrate + /verification-engine
// Coordination: Bidirectional communication between specialists
// Synthesis: Unified results from specialist collaboration

# Example 3: Registry-Enhanced Execution with Specialists
/[command-name] "Registry-intensive operation"
// Registry Analysis: High registry interaction detected
// Auto-delegates: /registry-metrics-update + /sync-docs
// Performance: Registry specialists optimize command selection
// Result: Enhanced execution through specialist registry expertise
```

### **Specialist Coordination Flow**:
1. **Command Analysis**: Detect complexity requiring specialist delegation
2. **Specialist Selection**: Choose optimal specialists via registry analysis
3. **Delegation Execution**: Execute real specialist tool calls with P56 compliance
4. **Progress Monitoring**: Show specialist progress and bidirectional communication
5. **Results Synthesis**: Aggregate specialist outputs into unified results
6. **Quality Validation**: Verify specialist coordination meets quality standards

---

## 🏗️ **MODULAR ECOSYSTEM INTEGRATION**

### **Specialist Registry Integration**
- **Dynamic Discovery**: Auto-detect available specialists from command registry
- **Performance-Based Selection**: Choose specialists based on success rates and execution times
- **Adaptive Optimization**: Improve specialist selection based on delegation results
- **Pattern Crystallization**: Capture successful delegation patterns for reuse

### **Evolution-Ready Modular Architecture**
- **Specialist Addition**: New specialists automatically available for delegation
- **Delegation Learning**: System learns optimal specialist combinations
- **Communication Enhancement**: Bidirectional protocols continuously improved
- **Coordination Optimization**: Specialist coordination patterns optimized over time

---

## 💡 **MODULAR COMMAND PHILOSOPHY**

**"Intelligence emerges through specialist collaboration, not monolithic complexity."**

### **Modular Excellence Implementation**

**Enhanced User Experience Through Specialists**:
1. **Seamless Delegation**: Users see enhanced results without coordination complexity
2. **Specialist Transparency**: Complete visibility into specialist coordination
3. **Quality Enhancement**: Better results through specialist expertise
4. **Efficiency Gains**: Faster execution through proven specialist logic

**Modular Architecture Benefits**:
1. **Preserved Complexity**: Full capability through specialist delegation
2. **Distributed Intelligence**: Each specialist optimized for their domain
3. **Maintenance Simplification**: Specialists maintained independently
4. **Evolutionary Growth**: New specialists enhance all delegating commands

### **Delegation Success Formula**
Command achieves enhanced productivity through:
- **Intelligent Delegation**: Complex operations handled by domain specialists
- **Seamless Coordination**: Bidirectional communication maintains user visibility
- **Quality Enhancement**: Specialist expertise improves results quality
- **Efficiency Optimization**: Proven specialist logic faster than internal complexity
- **Future Adaptability**: Automatic integration of new specialists as they're added

---

## 🛡️ **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Specialist Focus)**

### **Specialist Delegation Requirements - CRITICAL**

**Tool Call Execution Protocol for Specialists**:

```yaml
specialist_tool_call_requirements:
  delegation_announcement:
    requirement: "MANDATORY: Display P56 announcement before EVERY specialist delegation"
    format: "Enhanced visual announcement showing specialist being delegated to"
    evidence: "User must see which specialist is being activated and why"
    
  specialist_execution:
    requirement: "CRITICAL: EVERY specialist delegation REQUIRES actual tool call execution"
    prohibition: "FORBIDDEN: NEVER simulate specialist interaction"
    transparency: "ALWAYS show specialist progress and actual results"
    
  communication_bridge:
    requirement: "MANDATORY: Establish bidirectional communication with specialists"
    monitoring: "Display specialist status updates as they occur"
    handoff: "Properly receive and present specialist results"
    
  quality_validation:
    requirement: "REQUIRED: Validate specialist results meet command quality standards"
    evidence: "Show evidence of specialist execution quality"
    integration: "Synthesize specialist outputs into unified command results"
```

**Compliance Enforcement - NO EXCEPTIONS**:
- **NEVER simulate specialist delegation**: All specialist interactions must be real tool calls
- **ALWAYS announce specialist activation**: P56 visual announcements mandatory
- **ALWAYS show specialist progress**: Users must see specialist work in progress
- **ALWAYS validate specialist handoffs**: Proper control transfer protocols required

---

**Note**: This modular template embodies the Context Engineering principle of **intelligent specialist coordination**, achieving enhanced functionality through **LLM-to-LLM delegation** rather than internal complexity, while maintaining complete transparency and user control through structured specialist communication protocols.

**Modular Status**: Template implements **100% functionality preservation** through **specialist delegation**, **seamless LLM-to-LLM communication**, and **enhanced user experience** via **distributed intelligence coordination** with **complete P55/P56 compliance** for all specialist interactions.