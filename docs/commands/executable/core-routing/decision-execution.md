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

**MANDATORY Script System Validation Process**:
- **Path Helper Initialization**: Source path-helper.sh script and set PROJECT_ROOT variable
- **Formula Directory Validation**: List contents of scripts/formulas/ directory to verify availability
- **Metrics Script Validation**: List calculate-real-metrics.sh script to verify availability
- **P56 Transparency**: All validation steps MUST be executed via bash tool calls with visible results

### **Phase 2: Execute Mathematical Calculations**

**MANDATORY Mathematical Calculation Process**:
- **Formula Library Loading**: Source path-helper.sh, set PROJECT_ROOT, and navigate to scripts/formulas/
- **Formula Library Initialization**: Source context_engineering_formulas.sh to load mathematical functions
- **Confidence Calculation**: Execute calculate_confidence function with domain_familiarity, requirement_clarity, and resource_availability parameters (example: 0.8, 0.9, 0.7)
- **Complexity Calculation**: Execute calculate_complexity function with objective_count, dependency_factor, and integration_complexity parameters (example: 3, 2.1, 1.5)
- **P56 Transparency**: All mathematical calculations MUST be executed via bash tool calls with visible computation results

### **Phase 3: Execute Real Metrics Calculation**

**MANDATORY Real Metrics Calculation Process**:
- **Directory Navigation**: Navigate to parent directory level for script access
- **Script Execution**: Source path-helper.sh and execute calculate-real-metrics.sh via execute_script function
- **P56 Transparency**: All metrics calculations MUST be executed via bash tool calls with visible comprehensive results

### **Phase 4: Validate Mathematical Formulas**

**MANDATORY Mathematical Formula Validation Process**:
- **Validation Script Execution**: Execute verify-mathematical-formulas.sh script to ensure mathematical accuracy
- **P56 Transparency**: All validation processes MUST be executed via bash tool calls with visible accuracy verification results

### **Phase 5: Execute Trigger System Validation**

**MANDATORY Trigger System Validation Process**:
- **Trigger System Execution**: Execute test-trigger-system.sh script for decision routing validation
- **P56 Transparency**: All trigger system validation MUST be executed via bash tool calls with visible validation results

### **LLM BEHAVIOR REQUIREMENTS**

1. **ALWAYS** execute the bash tool calls above when `/decision-engine` is invoked
2. **CAPTURE** the actual numerical results from script execution
3. **USE** the real calculated values (not simulated ones) for decision routing
4. **DISPLAY** the script execution results to demonstrate real calculation
5. **PROCEED** with routing decisions based on actual mathematical outputs

### **Expected Tool Call Pattern**

**MANDATORY Tool Call Pattern Display**:
- **Execution Header**: Display "EXECUTING REAL MATHEMATICAL CALCULATIONS..."
- **Bash Tool Results**: Show actual bash tool execution results with real numbers
- **Script Results Display**: Show confidence score (actual_calculated_value/10.0), complexity score (actual_calculated_value/3.0), trigger validation (actual_test_results/22 passed), and routing decision based on real calculations
- **P56 Transparency**: All tool call patterns MUST display actual calculated values, never simulated or estimated values

**CRITICAL**: The LLM must use the **Bash** tool to execute these scripts and capture real numerical results, not simulate or estimate the values.

---

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this decision-engine command executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

**MANDATORY Tool Call Execution Display**:
- **Command Header**: Show "COMMAND EXECUTION" with decision command identification and HIGH priority
- **Command Details**: Display /decision command, tool purpose, duration estimate
- **Context Information**: Show mathematical routing context and agent type (Task/Direct)
- **Status Indicators**: Display mathematical tool execution, script integration, and real calculations status

**REQUIRED Tool Execution Process**: Execute tool call after announcement display

**MANDATORY Execution Completion Display**:
- **Completion Header**: Show "EXECUTION COMPLETED" confirmation
- **Status Results**: Display status (success/failure/warning), actual duration, and scripts used
- **Outcome Summary**: Show mathematical outcomes and accuracy metrics

**P56 Transparency**: All tool executions MUST be announced with visual indicators and completion confirmations

### **Script Execution Announcement Protocol - MANDATORY**

When executing mathematical calculation scripts, the LLM MUST display:

**MANDATORY Mathematical Script Execution Display**:
- **Script Header**: Show "MATHEMATICAL SCRIPT EXECUTION" with calculation indicator
- **Script Details**: Display script name, calculation phase, mathematical validation purpose, and formula library type
- **Integration Status**: Show duration estimate and script bridge integration confirmation
- **Execution Status**: Display executing calculate_confidence, calculate_complexity, test-trigger-system
- **Progress Indicators**: Show real mathematical calculations in progress and script validation active

**REQUIRED Bash Tool Execution**: Execute mathematical scripts through bash tool

**MANDATORY Mathematical Validation Completion Display**:
- **Completion Header**: Show "MATHEMATICAL VALIDATION COMPLETED" with success indicator
- **Calculation Results**: Display confidence score (real_score/10.0), complexity score (real_score/3.0)
- **Script Summary**: Show count of scripts executed and validation results (count/22 PASSED)
- **Routing Results**: Display selected command and accuracy percentage

**P56 Transparency**: All mathematical script executions MUST be announced with visual indicators and real calculation results

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

**MANDATORY Progressive Thinking Activation Display**:
- **Activation Header**: Show "PROGRESSIVE THINKING ACTIVATION" with thinking indicator
- **Trigger Details**: Display trigger condition (complexity ≥1.0 / confidence <0.7 / deep analysis)
- **Process Details**: Show 4-stage deep analysis with duration 3-8 minutes
- **Integration Status**: Display decision engine integration confirmation and strategic agent

**REQUIRED Progressive Thinking Stages Display**:
- **Stage 1**: Contextual Analysis
- **Stage 2**: Analytical Insights  
- **Stage 3**: Strategic Planning
- **Stage 4**: Breakthrough Innovation

**MANDATORY Progressive Thinking Execution**: Execute progressive thinking analysis through system

**CRITICAL Progressive Analysis Completion Display**:
- **Completion Header**: Show "PROGRESSIVE ANALYSIS COMPLETED" with success indicator
- **Analysis Results**: Display breakthrough count and quality assessment
- **Integration Results**: Show enhanced routing and optimized strategy
- **Outcome Summary**: Display strategic outcomes and next routing decision

**P56 Transparency**: All progressive thinking activations MUST be announced with visual stage indicators and strategic results

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

**MANDATORY Tool Call Execution Standards**:
- **Mathematical Operations**: MANDATORY tool calls for all calculations
- **File Operations**: MANDATORY tool calls for all file read/write/edit operations
- **System Interactions**: MANDATORY tool calls for all bash commands and scripts
- **Evidence Collection**: MANDATORY tool calls for all data gathering

**FORBIDDEN Prohibited Actions**:
- **Simulation**: FORBIDDEN to simulate tool calls or describe what would happen (0% tolerance)
- **Assumption**: FORBIDDEN to assume tool call results without actual execution (0% tolerance)
- **Description**: FORBIDDEN to describe tool call outcomes without real execution (0% tolerance)
- **Placeholders**: FORBIDDEN to use placeholder values instead of real calculations (0% tolerance)

**P56 Transparency**: All P55 compliance requirements MUST be enforced with zero tolerance for prohibited actions

### **Principle #56: Visual Execution Transparency**
**MANDATORY**: ALL command executions MUST provide visual announcements and progress tracking for user awareness with ≥95% visibility compliance and real-time status updates.

**P56 Visual Requirements**:

**MANDATORY Command Initialization Display**:
- **Visual Announcement**: Clear command execution announcement with context
- **Expected Duration**: Estimated execution time and complexity
- **Tools Required**: List of tools that will be used
- **Priority Level**: Execution priority and importance

**REQUIRED Progress Visibility Standards**:
- **Phase Announcements**: Visual progress through execution phases
- **Tool Activity**: Real-time tool usage indicators
- **Milestone Completion**: Clear milestone achievement notifications
- **Completion Summary**: Final execution results and outcomes

**P56 Transparency**: All visual requirements MUST be implemented with clear announcements and real-time progress tracking

### **Mathematical Precision Requirements**
**MANDATORY Validation Standards**:
- **Mathematical Accuracy**: ≥95% verification precision with statistical validation
- **Tool Execution**: 100% real tool call execution with audit trail evidence
- **Visual Transparency**: Complete user visibility of all operations and results
- **Script Integration**: Seamless script execution with mathematical transparency

### **Evidence Collection Framework**
**Execution Evidence Requirements**:

**MANDATORY Tool Call Evidence Collection**:
- **Mathematical Operations**: All calculation tool calls with inputs/outputs
- **File Operations**: All file access tool calls with success/failure status
- **System Commands**: All bash executions with command and results

**REQUIRED Decision Evidence Collection**:
- **Threshold Checks**: All threshold validations with values and outcomes
- **Confidence Calculations**: All confidence scores with calculation details
- **Routing Decisions**: All decision points with criteria and choices

**CRITICAL Compliance Evidence Collection**:
- **P55 Verification**: Tool call execution rate (must be 100%)
- **P56 Verification**: Visual announcement completeness
- **Transparency Audit**: Complete audit trail of all operations

**P56 Transparency**: All evidence collection MUST be comprehensive with complete audit trails and verification protocols

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
