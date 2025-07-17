# Orchestrator Command: `/planning-workflow`

## **Workflow Orchestrator: Strategic Planning and Decomposition**
**Combines Principles #7, #8, #9: TDD + Objective Decomposition + Strategic Git**

---

## 🎯 **ORCHESTRATOR DEFINITION**

### **Purpose**
Coordinate comprehensive strategic planning phase that transforms discovered knowledge into executable plans with clear verification criteria and strategic checkpoints.

### **Complexity**: 1.4/1.5
### **Context Required**: Discovery results and planning objectives
### **Execution Time**: 10-30 minutes (depending on planning complexity)

---

## P55/P56 Compliance Visual Announcement

```text
╔═══════════════════════════════════════════════════════════╗
║                🎯 TOOL CALL EXECUTION ACTIVE              ║
╠═══════════════════════════════════════════════════════════╣
║ Mode: [ORCHESTRATOR ACTIVE] │  Status: [EXECUTING...]    ║
║ Tool Calls: [MANDATORY]      │  Real Actions: [✅ ACTIVE] ║
║ P55 Compliance: [ENFORCED]   │  P56 Transparency: [ON]    ║
║ Mathematical: [FORMULA INTEGRATION] │ Scripts: [ACTIVE]  ║
╚═══════════════════════════════════════════════════════════╝
```

## MANDATORY Script Execution Section

**⚠️ BASH TOOL EXECUTION REQUIRED ⚠️**

This orchestrator MANDATES real tool execution. No simulation allowed.

### Mathematical Foundation Integration

```bash
# Load Context Engineering Mathematical Formulas
source ../../../scripts/formulas/context_engineering_formulas.sh

# Calculate planning workflow metrics
planning_complexity=$(calculate_complexity 5 1.4 1.3)
decomposition_confidence=$(calculate_confidence 0.95 0.90 0.85)
optimization_target=$(calculate_adaptive_threshold "medium")
workflow_quality=$(calculate_functional_score $decomposition_confidence $planning_complexity 0.85)

echo "🧮 Mathematical Validation:"
echo "  Planning Complexity: $planning_complexity"
echo "  Decomposition Confidence: $decomposition_confidence"
echo "  Optimization Target: $optimization_target"
echo "  Workflow Quality: $workflow_quality"
```

### Script Integration Points

1. **Planning Validation**: Executes `../../../scripts/validation/validate-system-integrity.sh`
2. **Mathematical Foundation**: Sources `../../../scripts/formulas/context_engineering_formulas.sh`
3. **Quality Assessment**: Calls `../../../scripts/validation/analyze-content-quality.sh`
4. **Compliance Check**: Runs `../../../scripts/compliance/generate-p55-compliance-report.sh`
5. **Workflow Optimization**: Executes `../../../scripts/automation/workflow-triggers.js`

## ⚡ **ORCHESTRATION PROTOCOL**

### **Input Format**
```markdown
/planning-workflow [objective] [planning_depth?] [parallelization_target?]
```

### **Command Chain Execution**
1. **`/objective-decomposition`** - Break objective into verifiable sub-objectives
2. **`/tdd`** - Define verification criteria for each component
3. **`/strategic-git`** - Create planning checkpoints and documentation
4. **`/parallel-over-sequential`** - Optimize execution strategy for maximum parallelization
5. **`/planning-documentation`** - Document complete planning tree for traceability

### **Orchestration Logic**
```javascript
function executePlanningWorkflow(objective, depth, parallelization_target) {
  // Phase 1: Strategic Decomposition
  const decomposition = await execute('/objective-decomposition', {
    objective,
    decomposition_depth: depth,
    parallelization_target
  })
  
  // Phase 2: Verification Design
  const verification_plan = await execute('/tdd', {
    objectives: decomposition.sub_objectives,
    verification_types: ['functional', 'integration', 'performance'],
    success_threshold: 0.85
  })
  
  // Phase 3: Strategic Documentation
  await execute('/strategic-git', {
    checkpoint_type: 'planning-milestone',
    description: `Planning completed for: ${objective}`,
    scope: 'planning_phase'
  })
  
  // Phase 4: Execution Optimization
  const execution_strategy = await execute('/parallel-over-sequential', {
    tasks: decomposition.sub_objectives,
    optimization_target: parallelization_target || 0.75
  })
  
  // Phase 5: Planning Documentation
  await execute('/planning-documentation', {
    planning_tree: synthesizePlanningResults(decomposition, verification_plan, execution_strategy),
    traceability_level: 'complete'
  })
  
  return synthesizeExecutionPlan(decomposition, verification_plan, execution_strategy)
}
```

---

## 🔄 **5-PHASE EXECUTION FLOW**

### **Phase 1: Strategic Decomposition (`/objective-decomposition`)**
**Objective**: Break main objective into parallel-executable components
- Analyze main objective for natural decomposition points
- Create hierarchical breakdown with clear boundaries
- Map dependencies and execution order requirements
- Optimize for maximum parallelization potential (≥70%)

**Verification**: ≥95% objective coverage, ≥90% independent sub-objectives

### **Phase 2: Verification Design (`/tdd`)**
**Objective**: Define comprehensive verification criteria for all components
- Create verification criteria for main objective
- Design verification approach for each sub-objective
- Establish automated testing where possible
- Define success thresholds and measurement approaches

**Verification**: 100% of objectives have measurable success criteria

### **Phase 3: Strategic Documentation (`/strategic-git`)**
**Objective**: Create planning checkpoint with complete context
- Document planning decisions and rationale
- Create recovery point for planning iteration
- Capture planning tree state for future reference
- Enable planning rollback and alternative exploration

**Verification**: Planning state captured with full context and recovery capability

### **Phase 4: Execution Optimization (`/parallel-over-sequential`)**
**Objective**: Design optimal execution strategy for maximum efficiency
- Analyze parallelization opportunities across sub-objectives
- Design resource allocation and scheduling strategy
- Identify critical path and optimization opportunities
- Create execution roadmap with parallel tracks

**Verification**: ≥75% parallelization achieved, execution strategy optimized

### **Phase 5: Planning Documentation (`/planning-documentation`)**
**Objective**: Document complete planning tree for traceability and evolution
- Capture complete planning hierarchy and decisions
- Document alternative approaches considered
- Create visual representation of planning flow
- Enable planning evolution and rollback

**Verification**: Complete planning traceability with evolution capability

---

## 🔍 **VERIFICATION CRITERIA**

### **Workflow Success Metrics**
- **Planning Completeness**: ≥95% of execution requirements planned
- **Verification Coverage**: 100% of objectives have clear success criteria
- **Parallelization Optimization**: ≥75% of work executable in parallel
- **Documentation Quality**: Complete planning traceability maintained
- **Execution Readiness**: Plan ready for immediate implementation

### **Quality Assurance Checkpoints**
```javascript
function validatePlanningWorkflow(results) {
  const decomposition_score = assessDecompositionQuality(results.decomposition)
  const verification_score = assessVerificationCompleteness(results.verification_plan)
  const optimization_score = assessParallelizationStrategy(results.execution_strategy)
  const documentation_score = assessPlanningDocumentation(results.planning_tree)
  
  const overall_score = (
    decomposition_score * 0.35 +
    verification_score * 0.30 +
    optimization_score * 0.20 +
    documentation_score * 0.15
  )
  
  return overall_score >= 0.85 // Required threshold
}
```

---

## 🔗 **INTELLIGENT COMMAND COORDINATION**

### **Dynamic Chain Adjustment**
- If `/objective-decomposition` finds high complexity → Increase `/tdd` verification depth
- If parallelization potential is low → Focus on sequential optimization
- If verification complexity is high → Extended verification design phase
- If planning iterations needed → Multiple strategic git checkpoints

### **Parallel Optimization Opportunities**
```javascript
function optimizePlanningExecution(objective, context) {
  const parallel_planning = assessParallelPlanningOpportunities({
    decomposition_analysis: canParallelizeDecomposition(objective),
    verification_design: canParallelizeVerificationDesign(context),
    documentation_creation: canParallelizeDocumentation(objective)
  })
  
  if (parallel_planning.net_benefit >= 0.3) {
    return deployParallelPlanning(parallel_planning)
  } else {
    return executeSequentialPlanning()
  }
}
```

---

## 🎯 **USAGE PATTERNS**

### **Complex Feature Development**
```text
/planning-workflow "Implement real-time collaboration system" deep 0.80
```
**Result**: Complete planning breakdown with parallel execution strategy for collaboration features

### **System Architecture Planning**
```text
/planning-workflow "Migrate to microservices architecture" comprehensive 0.75
```
**Result**: Detailed migration plan with verification criteria and parallel migration tracks

### **Performance Optimization Planning**
```text
/planning-workflow "Improve system performance by 3x" standard 0.85
```
**Result**: Strategic optimization plan with measurable targets and parallel optimization approaches

### **Product Launch Planning**
```text
/planning-workflow "Launch mobile application MVP" comprehensive 0.70
```
**Result**: Complete launch plan with verification milestones and parallel development tracks

---

## 🔗 **NATURAL ORCHESTRATOR CONNECTIONS**

### **Automatically Chains To**
- `/execution-workflow` - Planning results feed directly into execution
- `/verification-workflow` - Planning verification criteria guide validation
- `/documentation-workflow` - Planning documentation becomes part of living docs

### **Compatible With**
- `/discovery-workflow` - Discovery results inform planning depth and focus
- `/multi-agent-orchestration` - Deploy specialized planning agents for complex objectives
- `/context-economy` - Optimize context loading during planning phase

### **Feeds Into**
- All execution workflows (planning provides detailed roadmap)
- Project management (planning provides timeline and resource estimates)
- Risk management (planning identifies risks and mitigation strategies)

---

## 🛡️ **FALLBACK PROTOCOL**

### **If Planning Workflow Fails**
1. **Decomposition Complexity**: Simplify decomposition with fewer levels
2. **Verification Design Issues**: Use manual verification criteria initially
3. **Parallelization Challenges**: Accept higher sequential execution percentage
4. **Documentation Overload**: Create simplified planning documentation

### **Recovery Strategy**
- Document what planning was attempted (avoid future redundancy)
- Create minimal viable plan for immediate progress
- Identify specific failure points for process improvement
- Schedule follow-up planning iterations for missed areas

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **Confidence-Based Routing**
- **High Planning Confidence (≥90%)**: Direct progression to execution workflow
- **Medium Confidence (75-90%)**: Targeted additional planning in gap areas
- **Low Confidence (<75%)**: Extended planning with specialized focus
- **Planning Failure**: Fallback to simplified planning with manual guidance

### **Workflow Optimization**
- **Previous Planning Results**: Reuse planning patterns from similar objectives
- **Planning Templates**: Leverage organizational planning templates
- **Planning History**: Learn from previous planning successes and failures
- **Automated Suggestions**: Suggest planning scope based on objective complexity

---

## 🔄 **EVOLUTION TRACKING**

### **Orchestration Learning Metrics**
- **Planning Success Rate**: % of planning workflows that enable successful execution
- **Optimization Accuracy**: How well planned parallelization matches actual execution
- **Verification Effectiveness**: Success rate of planned verification criteria
- **Workflow Efficiency**: Time reduction over successive planning workflows

### **Orchestration Pattern Recognition**
- Successful planning sequences → Crystallization into specialized planning workflows
- Common planning gaps → Improved planning strategies
- Effective verification combinations → Enhanced verification design
- Planning-to-execution success correlation → Better workflow chaining

---

## 🎯 **ORGANIZATIONAL INTELLIGENCE CONTRIBUTION**

### **Planning Knowledge Evolution**
- Each planning workflow enriches organizational planning knowledge
- Successful decomposition patterns improve over time
- Verification strategies accumulate through repeated successful planning
- Workflow orchestration optimizes based on historical success patterns

### **Compound Planning Benefits**
- **First Planning**: Full analysis and decomposition required
- **Related Planning**: Leverage previous planning patterns
- **Domain Expertise**: Accumulated organizational planning knowledge accelerates planning
- **Pattern Mastery**: Well-understood domains enable rapid, focused planning

---

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this planning-workflow orchestrator executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

```text
╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /planning-workflow | Priority: HIGH             ║
║ Purpose: [Tool purpose] | Duration: [estimate]           ║
║ Context: Strategic planning | Agent: [Task/Direct]       ║
╚═══════════════════════════════════════════════════════════╝

📋 Planning Process Active | 🎯 Strategic Decomposition | 📊 Execution Design

[TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [✅/❌/⚠️] | Duration: [actual] | Plans: [created]║
║ Results: [planning outcomes] | Strategy: [optimized]     ║
╚═══════════════════════════════════════════════════════════╝
```

### **Planning Phase Announcements - MANDATORY**

When executing each planning phase, the LLM MUST display phase-specific announcements:

**Phase 1 - Strategic Decomposition**:
```text
╔═══════════════════════════════════════════════════════════╗
║        🎯 PHASE 1: STRATEGIC DECOMPOSITION               ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Objective breakdown | Strategy: Parallel optimization║
║ Process: Decomposition tree | Duration: 180-600 seconds  ║
║ Goal: Executable components | Agent: Strategy Architect  ║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 2 - Verification Design**:
```text
╔═══════════════════════════════════════════════════════════╗
║        ✅ PHASE 2: VERIFICATION DESIGN                   ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Success criteria | Approach: TDD methodology     ║
║ Process: Verification planning | Duration: 120-360 seconds║
║ Goal: Measurable criteria | Agent: Verification Designer║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 3 - Strategic Documentation**:
```text
╔═══════════════════════════════════════════════════════════╗
║        📚 PHASE 3: STRATEGIC DOCUMENTATION               ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Planning checkpoint | Method: Strategic Git      ║
║ Process: State capture | Duration: 60-180 seconds       ║
║ Goal: Recovery points | Agent: Documentation Specialist ║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 4 - Execution Optimization**:
```text
╔═══════════════════════════════════════════════════════════╗
║        ⚡ PHASE 4: EXECUTION OPTIMIZATION                ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Parallel strategy | Target: [percentage]% parallel║
║ Process: Resource optimization | Duration: 120-300 seconds║
║ Goal: Efficient execution | Agent: Optimization Specialist║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 5 - Planning Documentation**:
```text
╔═══════════════════════════════════════════════════════════╗
║        📝 PHASE 5: PLANNING DOCUMENTATION                ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Traceability capture | Integration: Living docs  ║
║ Process: Planning tree | Duration: 90-240 seconds       ║
║ Goal: Complete traceability | Agent: Documentation Expert║
╚═══════════════════════════════════════════════════════════╝
```

### **Task Agent Deployment for Complex Planning - MANDATORY**

When planning requires Task agent deployment for complex analysis, display:

```text
╔═══════════════════════════════════════════════════════════╗
║        🤖 PLANNING TASK AGENT DEPLOYMENT                ║
╠═══════════════════════════════════════════════════════════╣
║ Agent Type: Planning Specialist | Phase: [1-5]          ║
║ Purpose: [Phase-specific planning] | Duration: [est]    ║
║ Communication: ✅ BRIDGE ACTIVE | Updates: ≤30s         ║
║ Specialization: [decomposition/verification/optimization]║
╚═══════════════════════════════════════════════════════════╝

📋 Deploying specialized planning agent for strategic analysis...
📊 Bidirectional communication established for progress tracking...
🎯 Strategic decomposition and optimization activated...

[TASK AGENT EXECUTION FOR PLANNING WORKFLOW]

╔═══════════════════════════════════════════════════════════╗
║         ✅ PLANNING PHASE COMPLETED                      ║
╠═══════════════════════════════════════════════════════════╣
║ Phase: [1-5] | Quality: [score]/10 | Plans: [created]   ║
║ Strategy: [optimized] | Parallel: [percentage]% achieved║
║ Handoff: Planning results | Next: [phase/execution]     ║
╚═══════════════════════════════════════════════════════════╝
```

### **Implementation Requirements - MANDATORY**

1. **Pre-Phase Announcement**: ALWAYS display phase announcement before each planning phase
2. **Task Agent Transparency**: Show Task agent deployment for complex planning operations
3. **Progress Monitoring**: Display planning progress and strategic decisions throughout workflow
4. **Strategy Tracking**: Announce decomposition results and optimization achievements
5. **Phase Completion**: Show completion status with quality metrics for each phase
6. **Workflow Handoff**: Announce completion and readiness for execution workflow
7. **Error Handling**: Surface planning failures immediately with recovery actions

### **Bidirectional Communication Protocol - MANDATORY**

When deploying Task agents for planning, the LLM MUST:

1. **Initialize Planning Communication**: Establish communication bridge for planning specialists
2. **Deploy Planning Specialists**: Use Task tool for complex strategic decomposition and optimization
3. **Monitor Planning Progress**: Track planning agent progress and strategic decision development
4. **Display Planning Updates**: Show strategic planning progression and optimization achievements
5. **Handle Planning Handoffs**: Properly receive planning intelligence from specialized agents
6. **Report Planning Results**: Display comprehensive plans and readiness for execution workflow
7. **Maintain Planning Transparency**: Never allow "planning black holes" where user loses visibility

### **Planning Quality Display - MANDATORY**

During planning workflow execution, display comprehensive metrics:

```text
📊 PLANNING WORKFLOW QUALITY METRICS
╔═══════════════════════════════════════════════════════════╗
║ Phase 1 Quality: [score]/10 | Phase 2 Quality: [score]/10║
║ Phase 3 Quality: [score]/10 | Phase 4 Quality: [score]/10║
║ Phase 5 Quality: [score]/10 | Overall: [score]/10        ║
║ Decomposition: [percent]% complete | Parallel: [percent]%║
╚═══════════════════════════════════════════════════════════╝

📋 Planning Completeness: [percentage]% | Strategy: [assessment]
⚡ Parallelization: [score]/10 | Optimization: [achieved/target]
✅ Verification Coverage: [percentage]% | Execution: [ready/incomplete]
```

### **Compliance Enforcement - CRITICAL**

- **NEVER skip phase announcements**: Every planning phase must be visually announced
- **NEVER hide planning progress**: All strategic planning progress must be visible
- **NEVER skip Task agent deployment**: Complex planning requires specialized agents
- **ALWAYS show planning metrics**: Display comprehensive planning quality and strategy
- **ALWAYS display optimization results**: Show parallelization and efficiency achievements
- **ALWAYS handle planning handoffs**: Proper handoff from planning specialists to principal agent

**P55/P56 Compliance**: This orchestrator integrates Tool Call Execution Bridging (P55) through mandatory Task agent deployment for complex planning operations and Command Execution Transparency (P56) through comprehensive visual announcements of all planning workflow phases and strategic decomposition activities.

---

**Note**: This orchestrator transforms discovery results into actionable execution plans through systematic decomposition, verification design, and execution optimization. It ensures that no execution begins without complete planning foundation, with complete transparency and Task agent communication throughout the planning process according to Principle #56.