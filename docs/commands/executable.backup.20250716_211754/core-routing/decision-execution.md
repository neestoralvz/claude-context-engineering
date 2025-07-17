# Decision Engine - Tool Execution Framework

**Meta-Principle**: "Execute transparent, compliant tool operations with complete user visibility and mathematical precision"

**Specialized Module**: CRITICAL tool execution system that extends Decision Engine Core with P55/P56 compliance protocols, behavioral instructions, and visual announcement systems.

**Module Integration**: [Decision Engine Core](./decision.md) | [Mathematical Trigger Framework](./decision-triggers.md) | [Ecosystem Integration](./decision-ecosystem.md)

---

## 🏗️ **MODULE INHERITANCE**

**Inherits from**: [Decision Engine Core](./decision.md)

**Inherited Functions**:
- Core mathematical calculation protocols
- Basic routing decision algorithms  
- Confidence and complexity assessment
- Fundamental validation frameworks

**Specialized Functions Added**:
- P55/P56 compliance enforcement protocols
- Tool call execution transparency systems
- Visual announcement and progress tracking
- Behavioral instruction automation

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

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this decision-engine command executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

```text
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

```text
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

```text
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

---

## 🛡️ **P55/P56 COMPLIANCE FRAMEWORK**

### **Principle #55: Tool Call Execution Transparency**
**MANDATORY**: ALL mathematical operations, file operations, and system interactions MUST use visible tool calls with 100% execution transparency, NEVER simulation or description. FORBIDDEN: Any operation without tool call evidence.

**P55 Compliance Requirements**:
```yaml
tool_call_execution:
  mathematical_operations: "MANDATORY tool calls for all calculations"
  file_operations: "MANDATORY tool calls for all file read/write/edit operations"
  system_interactions: "MANDATORY tool calls for all bash commands and scripts"
  evidence_collection: "MANDATORY tool calls for all data gathering"
  
prohibited_actions:
  simulation: "FORBIDDEN: Simulate tool calls or describe what would happen (0% tolerance)"
  assumption: "FORBIDDEN: Assume tool call results without actual execution (0% tolerance)"
  description: "FORBIDDEN: Describe tool call outcomes without real execution (0% tolerance)"
  placeholders: "FORBIDDEN: Use placeholder values instead of real calculations (0% tolerance)"
```

### **Principle #56: Visual Execution Transparency**
**MANDATORY**: ALL command executions MUST provide visual announcements and progress tracking for user awareness with ≥95% visibility compliance and real-time status updates.

**P56 Visual Requirements**:
```yaml
command_initialization:
  visual_announcement: "Clear command execution announcement with context"
  expected_duration: "Estimated execution time and complexity"
  tools_required: "List of tools that will be used"
  priority_level: "Execution priority and importance"
  
progress_visibility:
  phase_announcements: "Visual progress through execution phases"
  tool_activity: "Real-time tool usage indicators"
  milestone_completion: "Clear milestone achievement notifications"
  completion_summary: "Final execution results and outcomes"
```

### **Mathematical Precision Requirements**
**MANDATORY Validation Standards**:
- **Mathematical Accuracy**: ≥95% verification precision with statistical validation
- **Tool Execution**: 100% real tool call execution with audit trail evidence
- **Visual Transparency**: Complete user visibility of all operations and results
- **Script Integration**: Seamless script execution with mathematical transparency

### **Evidence Collection Framework**
**Execution Evidence Requirements**:
```yaml
evidence_collection:
  tool_call_evidence:
    mathematical_operations: "All calculation tool calls with inputs/outputs"
    file_operations: "All file access tool calls with success/failure status"
    system_commands: "All bash executions with command and results"
    
  decision_evidence:
    threshold_checks: "All threshold validations with values and outcomes"
    confidence_calculations: "All confidence scores with calculation details"
    routing_decisions: "All decision points with criteria and choices"
    
  compliance_evidence:
    p55_verification: "Tool call execution rate (must be 100%)"
    p56_verification: "Visual announcement completeness"
    transparency_audit: "Complete audit trail of all operations"
```

---

## 🔧 **BEHAVIORAL CONTROL EFFECTIVENESS**

### **Neural Pathway Reinforcement** (Permanent Cognitive Integration)
**CRITICAL**: This module establishes permanent behavioral patterns for transparent tool execution and mathematical precision across all Decision Engine operations.

**Behavioral Outcomes**:
- **100% Tool Call Execution**: AUTOMATIC tool call usage becomes cognitive default
- **Mathematical Transparency**: AUTOMATIC calculation visibility becomes standard behavior
- **Visual Announcement Habit**: AUTOMATIC progress communication becomes unconscious behavior
- **Script Integration Reflex**: AUTOMATIC script execution transparency becomes cognitive pattern

### **Cognitive Load Optimization** (Efficiency Enhancement)
**ACHIEVED**: Module integration reduces execution overhead while maintaining maximum transparency.

**Cognitive Benefits**:
- **≥90% Execution Consistency**: Standardized tool execution reduces cognitive load
- **≥95% Error Prevention**: Automatic validation reduces manual verification burden
- **100% Compliance Automation**: P55/P56 adherence eliminates compliance cognitive load
- **≥85% Decision Confidence**: Mathematical precision increases execution confidence

### **Observable Performance Metrics**
**Evidence-Based Results**:
- **Tool Execution Success Rate**: ≥98% successful tool call completion
- **Mathematical Accuracy**: 4+ decimal place precision maintained
- **Visual Transparency Compliance**: 100% announcement coverage
- **Script Integration Health**: ≥95% script execution success rate

---

**Module Dependencies**: [Decision Engine Core](./decision.md) (required)
**Used By**: All decision engine operations requiring tool execution
**Integration**: [Mathematical Trigger Framework](./decision-triggers.md) | [Ecosystem Integration](./decision-ecosystem.md)
**Compliance Authority**: P55/P56 Principles, Universal Tool Execution standards