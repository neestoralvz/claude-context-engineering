# [Command Name] Universal Command Template

## Command: `/[command-name]`

**Meta-Principle**: "[Core philosophical principle that guides the command]"

[Brief description of what the command does and its purpose in the Context Engineering ecosystem. Include key features like adaptive learning, dynamic discovery, etc.]

## 🚀 ADAPTIVE INTELLIGENT ACTIVATION PROTOCOL

This system adapts execution based on task complexity and context, automatically selecting optimal approaches for different scenarios.

### **🎯 Strategy Selection**

**Intelligent Scaling** reduces overhead by [X]% for simple tasks:

```yaml
adaptive_[strategy]_selection:
  simple_tasks_complexity_≤_[threshold]:
    [strategy]: ["[Step 1]", "[Step 2]"] 
    duration: "[time] ([X]% faster)"
    criteria: 
      - [criterion_1]
      - [criterion_2]
      - [criterion_3]
    optimization: "[optimization description]"
    
  medium_tasks_complexity_[range]:
    [strategy]: ["[Step 1]", "[Step 2]", "[Step 3]"]
    duration: "[time] ([X]% faster)" 
    criteria:
      - [criterion_1]
      - [criterion_2]
      - [criterion_3]
    optimization: "[optimization description]"
    
  complex_tasks_complexity_≥_[threshold]:
    [strategy]: ["[All Steps]"]
    duration: "[time] (full power)"
    criteria:
      - [criterion_1]
      - [criterion_2]
      - [criterion_3]
    optimization: "[optimization description]"

adaptive_triggers:
  [trigger_name]:
    condition: "[escalation condition]"
    action: "[escalation action]"
    
  [optimization_name]:
    condition: "[optimization condition]"
    action: "[optimization action]"
```

### **🔍 Analysis Detection**

**Pre-execution analysis** determines optimal configuration:

```javascript
function determineConfiguration(objective, context) {
  const complexity_estimate = estimateTaskComplexity(objective)
  const confidence_score = assessObjectiveClarity(objective)
  const scope_analysis = analyzeScopeIndicators(objective)
  
  // Simple Task Pattern
  if (complexity_estimate <= [threshold] && 
      confidence_score >= [threshold] && 
      scope_analysis.[condition]) {
    return {
      configuration: "simple_[type]",
      [strategy]: ["[steps]"],
      estimated_time: "[time]",
      optimization: "[optimization description]"
    }
  }
  
  // Medium Task Pattern  
  if (complexity_estimate <= [threshold] && 
      confidence_score >= [threshold]) {
    return {
      configuration: "medium_[type]", 
      [strategy]: ["[steps]"],
      estimated_time: "[time]",
      optimization: "[optimization description]"
    }
  }
  
  // Complex Task Pattern
  return {
    configuration: "complex_[type]",
    [strategy]: ["[all steps]"],
    estimated_time: "[time]", 
    optimization: "[optimization description]"
  }
}
```

## 🧠 **Learning Engine (Optional)**

**Optional Enhancement**: [Description of adaptive learning capabilities]

### **🎯 Auto-Selection**

When invoked with learning mode enabled, the system can automatically select optimal workflows based on learned patterns:

```yaml
learned_routing_targets:
  [pattern_1]:
    command: "/[target-command]" 
    triggers: ["[trigger1]", "[trigger2]", "[trigger3]"]
    confidence_threshold: [threshold]
    success_rate: "tracked automatically"
    
  [pattern_2]:
    command: "/[target-command]"
    triggers: ["[trigger1]", "[trigger2]", "[trigger3]"]
    confidence_threshold: [threshold]
    success_rate: "tracked automatically"
    
  [pattern_3]:
    command: "/[target-command]"
    triggers: ["[trigger1]", "[trigger2]", "[trigger3]"]
    confidence_threshold: [threshold]
    success_rate: "tracked automatically"
    
  full_orchestration:
    command: "standard /[command-name] execution"
    triggers: ["[complex triggers]"]
    confidence_threshold: [threshold]
    success_rate: "tracked automatically"
```

---

## 🔄 **Command Registry Integration**

### **Command Discovery and Selection**

This command features intelligent command discovery that analyzes the current registry state:

```yaml
dynamic_ecosystem_detection:
  auto_discovery:
    registry_scan: "Real-time scan of command-registry.json to detect relevant commands"
    command_counting: "SELECT COUNT(*) FROM relevant_categories for dynamic sizing"
    adaptive_scaling: "Automatically adjust thresholds based on detected ecosystem size"
    
  ecosystem_categories:
    [category_1]: "SELECT COUNT(*) FROM [category_1]"
    [category_2]: "SELECT COUNT(*) FROM [category_2]"
    [category_3]: "SELECT COUNT(*) FROM [category_3]"
    total_ecosystem_size: "SUM(relevant_categories) = DYNAMIC_TOTAL"
    
  adaptive_thresholds:
    [threshold_1]: "MIN([value], [percentage]% of total_ecosystem_size)"
    [threshold_2]: "[value] * scaling_factor based on ecosystem_size"
    [threshold_3]: "AUTO-ADJUST based on available command diversity"
```

---

## 🔄 **Configuration Options**

### **⚡ Simple Tasks**
**Optimal for**: [Description of simple task criteria]

```yaml
simple_[x]_[strategy]_execution:
  [step_1]: 
    duration: "[time]"
    actions: ["[action1]", "[action2]"]
    optimization: "[optimization description]"
    
  [step_2]:
    duration: "[time]" 
    actions: ["[action1]", "[action2]"]
    optimization: "[optimization description]"
    
  total_time_savings: "[X]% faster than full orchestration"
  success_rate_maintained: "≥[X]% (quality preserved)"
  use_cases: ["[use case 1]", "[use case 2]", "[use case 3]"]
```

### **🎯 Medium Tasks** 
**Optimal for**: [Description of medium task criteria]

```yaml
medium_[x]_[strategy]_execution:
  [step_1]:
    duration: "[time]"
    actions: ["[action1]", "[action2]"]
    
  [step_2]:
    duration: "[time]"
    actions: ["[action1]", "[action2]", "[action3]"]
    optimization: "[optimization description]"
    
  [step_3]:
    duration: "[time]"
    actions: ["[action1]", "[action2]", "[action3]"]
    optimization: "[optimization description]"
    
  total_time_savings: "[X]% faster than full orchestration"
  success_rate_maintained: "≥[X]% (enhanced by [enhancement])"
  use_cases: ["[use case 1]", "[use case 2]", "[use case 3]"]
```

### **🌟 Complex Tasks**
**Optimal for**: [Description of complex task criteria]

```yaml
complex_[x]_[strategy]_execution:
  all_[strategies]_active: ["[Step 1]", "[Step 2]", "[Step 3]", "[Step 4]", "[Step 5]"]
  duration: "[time] (original timing)"
  optimization: "complete orchestration for comprehensive results"
  success_rate: "≥[X]% (maximum quality and thoroughness)"
  use_cases: ["[use case 1]", "[use case 2]", "[use case 3]"]
```

---

### Step 1: Process Orchestration
**Purpose**: [Description of what this step accomplishes]

**Execution Protocol**:

```yaml
step_1_protocol:
  initialization:
    communication: "Send [STEP]_1_INITIALIZATION to Principal agent"
    input_dependencies: ["[dependency 1]", "[dependency 2]", "[dependency 3]"]
    milestones: ["[milestone 1]", "[milestone 2]", "[milestone 3]"]
    estimated_duration: "[time] depending on [factors]"
    
  step_1_[action]:
    action: "[Action description]: [Detailed action steps]"
    input: "[Input description]"
    [source]: "[Source of input/guidance]"
    communication: "[Communication protocol/message]"
    [requirement]: "[Any special requirements]"
    
  step_2_[action]:
    action: "[Action type] EXECUTION REQUIRED: [Tool/action description]"
    tool_call_requirement: "[Tool call requirements]"
    [strategy]_based_deployment:
      [condition_1]:
        approach: "[Approach description]"
        [tools_required]: "[Tool requirements]"
        command_selection_algorithm: "[Selection algorithm]"
        dynamic_commands: ["[command1]", "[command2]", "[command3]"]
        [integration]: "[Integration description]"
        execution_pattern: "[Execution pattern description]"
        communication: "[Communication protocol]"
        
      [condition_2]:
        approach: "[Approach description]"
        [tools_required]: "[Tool requirements]"
        command_selection_algorithm: "[Selection algorithm]"
        dynamic_commands: ["[command1]", "[command2]", "[command3]"]
        [integration]: "[Integration description]"
        execution_pattern: "[Execution pattern description]"
        communication: "[Communication protocol]"
        
  step_3_[action]:
    action: "[Action description]"
    [requirement]: "[Execution requirements]"
    communication: "[Communication protocol]"
    [monitoring]: "[Monitoring description]"
    [coordination]: "[Coordination details]"
    evidence_required: "[Evidence requirements]"
    
  step_4_[action]:
    action: "[Action description]"
    communication: "[Communication protocol]"
    [coordination]: "[Coordination details]"
    input: "[Input description]"
    
  phase_completion:
    communication: "[COMPLETION MESSAGE]"
    handoff_data: "[Data to transfer to next phase]"
```

**Communication Features**:
- **[Feature 1]**: [Description of communication feature]
- **[Feature 2]**: [Description of communication feature]
- **[Feature 3]**: [Description of communication feature]
- **[Feature 4]**: [Description of communication feature]

**Verification**: [Verification method and thresholds]

---

## 🔍 Quality Verification System

### Dynamic Quality Metrics
- **[Metric 1]**: `/[command]` for [description] with [communication feature]
- **[Metric 2]**: `/[command]` adjusts [description] with [communication feature]
- **[Metric 3]**: `/[command]` for [description] with [communication feature]
- **[Integration]**: [Integration description]

### Intelligent Engine
- **[Feature 1]**: `/[command]` [description] with [communication feature]
- **[Feature 2]**: `/[command]` [description] with [communication feature]
- **[Feature 3]**: `/[command]` [description] with [communication feature]
- **[Feature 4]**: `/[command]` [description] with [communication feature]
- **[Feature 5]**: `/[command]` [description] with [communication feature]
- **[Compliance]**: [Compliance description]

---

## 🔄 Process Orchestration

### Dynamic Protocol
- **[Protocol 1]**: `/[command]` for [description]
- **[Protocol 2]**: [Description of protocol]
- **[Protocol 3]**: [Description of protocol]

### Command-Based Routing
- **[Strategy 1]**: `/[command]` for [description] with [communication feature]
- **[Strategy 2]**: [Description with multiple commands/features]
- **[Strategy 3]**: `/[command]` [description] with [coordination]
- **[Strategy 4]**: `/[command]` throughout [process] with [coordination]
- **[Strategy 5]**: [Description of continuous process]

---

## 📊 Execution Management

### Execution Protocol
- **[Analysis]**: `/[command]` evaluates [criteria] with [communication feature]
- **[Coordination]**: `/[command]` with [feature] for [purpose]
- **[Economy]**: `/[command]` for [percentage] reduction, [percentage] functionality with [coordination]
- **[Management]**: `/[command]` for [purpose] with [communication feature]
- **[Analysis]**: `/[command]` for [purpose] with [communication feature]

---

## 🎯 Usage Patterns

### Basic Usage
```
/[command-name] [objective] [parameter1?] [parameter2?] [parameter3?]
```

### Command Examples:
```bash
# Example 1: [Scenario Description]
/[command] "[objective description]"
// Dynamic Analysis: Complexity=[value], Confidence=[value], Category=[category]
// Registry Query: [Query description]
// Auto-executes: [command sequence]
// Registry Optimization: [optimization description]

# Example 2: [Scenario Description]
/[command] "[objective description]" [parameter]=[value]
// Dynamic Analysis: [analysis description]
// Registry Query: [query description]
// Auto-executes: [command sequence]
// Registry Optimization: [optimization description]

# Example 3: [Scenario Description]
/[command] "[objective description]" [parameter]=[value]
// Dynamic Analysis: [analysis description]
// Registry Query: [query description]
// Auto-executes: [command sequence]
// Registry Optimization: [optimization description]
```

### Learning Mode Examples (Optional):
```
/[command] auto "[objective in target language]"
// Learning-enhanced: [description]
// Learns from success to [learning outcome]

/[command] "[objective description]"
// Smart routing: [routing description]
// Captures [learning aspect]

// Fallback behavior: [fallback description]
/[command] auto "[complex objective]"
// Complex pattern → [fallback behavior]
```

### Automatic Execution Steps:
1. **[Step 1]**: `/[command]` + [integration] determines [outcome] + [optimization]
2. **[Step 2]**: Execute [description] based on [criteria] + [optimization]
3. **[Step 3]**: [Description] selected dynamically from [source] based on [criteria] + [optimization]
4. **[Step 4]**: [Description] based on [analysis] + [integration] + [optimization]
5. **[Step 5]**: `/[command]` when [condition] + [optimization]
6. **[Step 6]**: `/[command]` for [purpose] + [selection] + [optimization]
7. **[Step 7]**: [Description] coordinated automatically + [execution] + [optimization]
8. **[Step 8]**: `/[command]` applied throughout for [purpose] + [integration]
9. **[Step 9]**: `/[command]` + [correlation] for [purpose] + [optimization]
10. **[Step 10]**: `/[command]` for [purpose] + [selection]
11. **[Step 11]**: [Description] through `/[command]` + [detection] + [optimization]
12. **[Step 12]**: [Description] + [monitoring] + [optimization]

---

## 🏗️ System Integration

### Command Composition
- **[Architecture 1]**: [Description of architectural principle]
- **[Architecture 2]**: [Description] via `/[command]`
- **[Architecture 3]**: `/[command]` for [purpose]
- **[Architecture 4]**: [Description] via `/[command]`

### Command Structure
- **[Structure 1]**: [Description] with [communication feature]
- **[Structure 2]**: `/[command]` selects [description] with [communication feature]
- **[Structure 3]**: [Description] via `/[command]` with [communication feature]
- **[Structure 4]**: [Description] via `/[command]` using [communication feature]
- **[Integration 1]**: [Communication protocol] framework
- **[Integration 2]**: [Communication bridge] technical implementation
- **[Integration 3]**: [Compliance validator] integration

---

## 📈 Success Metrics

### Performance Tracking
- **[Metric 1]**: [Description] (target: [target] - [status])
- **[Metric 2]**: [Description] from [source]
- **[Metric 3]**: [Description] via `/[command]` applied across [scope]
- **[Metric 4]**: [Description] and `/[command]` across [scope]
- **[Metric 5]**: [Description] based on [criteria]
- **[Metric 6]**: [Description] as [description]

---

## 🔐 System Requirements

### Core Requirements
- **[Requirement 1]**: [Description] through `/[command]`
- **[Requirement 2]**: [Description] via `/[command]`
- **[Requirement 3]**: [Description] via `/[command]`
- **[Requirement 4]**: [Description] via `/[command]`
- **[Requirement 5]**: [Description] via `/[command]`

---

## 💡 Design Philosophy

This command embodies the system philosophy through intelligent orchestration:

**"[Core philosophical quote or principle]"**

### Implementation Approach

**Enhanced User Experience**:
1. **[Experience 1]**: [Description]
2. **[Experience 2]**: [Description]
3. **[Experience 3]**: [Description]
4. **[Experience 4]**: [Description]

**Architecture Benefits**:
1. **[Benefit 1]**: [Description]
2. **[Benefit 2]**: [Description]
3. **[Benefit 3]**: [Description]
4. **[Benefit 4]**: [Description]

Command invocation creates an intelligent system that:
- **Dynamically selects** optimal commands via decision engine
- **Automatically optimizes** context and resources
- **Continuously improves** through adaptive learning
- **Recovers intelligently** from errors and failures
- **Scales effortlessly** with multi-agent coordination
- **Verifies mathematically** all operations and results

---

**Note**: Command achieves high productivity through intelligent orchestration rather than manual execution, embodying "Enable, Don't Control" principles.

---

## 🎯 **MANDATORY EXECUTION REQUIREMENTS (Principle #56)**

### **MANDATORY TOOL CALL PROTOCOL**

**CRITICAL**: When this command executes any tool call, the system MUST display a visual announcement before executing the tool.

**MANDATORY EXECUTION REQUIREMENT**: Every action that mentions deployment, execution, or activation REQUIRES an actual tool call. Simulation is FORBIDDEN - real tool calls are MANDATORY.

```
╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /[command-name] | Priority: [PRIORITY]          ║
║ Purpose: [Tool purpose] | Duration: [estimate]           ║
║ Context: [Why executing] | Agent: [Task/Direct]          ║
╚═══════════════════════════════════════════════════════════╝

🚀 Tool Execution Initiated | 📊 Progress Monitored | ⚡ Real Actions

[TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [✅/❌/⚠️] | Duration: [actual] | Tools: [used]    ║
║ Results: [outcomes] | Performance: [metrics]              ║
╚═══════════════════════════════════════════════════════════╝
```

### **CRITICAL IMPLEMENTATION REQUIREMENTS**

**MANDATORY TOOL CALL REQUIREMENTS**:
1. **MANDATORY Pre-Tool Call Announcement**: MUST display visual announcement before tool execution
2. **CRITICAL Tool Call Execution**: When protocols mention tool execution, the system MUST execute actual tool calls
3. **MANDATORY Real Execution Only**: NEVER simulate - ALWAYS execute actual tool calls
4. **CRITICAL Agent Deployment**: When deploying agents, MUST show deployment announcement
5. **MANDATORY Status Display**: MUST show agent status updates as they occur
6. **CRITICAL Progress Monitoring**: MUST display real-time progress from all deployed agents
7. **MANDATORY Completion Reporting**: MUST show completion announcement with results
8. **CRITICAL Error Transparency**: MUST surface failures immediately with recovery actions
9. **MANDATORY Communication Maintenance**: MUST maintain and display communication channel status

**MANDATORY Compliance Validation**: This command MUST integrate compliance validation throughout execution to ensure transparency and execution requirements are met.

---

**Status**: [Current implementation status and key achievements]