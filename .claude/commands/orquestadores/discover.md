# Orchestrator Command: `/discovery-workflow`

## **Workflow Orchestrator: Knowledge Discovery Phase**
**Combines Principles #4, #5, #6: Knowledge Discovery Hierarchy + Exploration-First + Pattern Recognition**

---

## 🎯 **ORCHESTRATOR DEFINITION**

### **Purpose**
Coordinate the complete knowledge discovery process that forms the foundation of all Context Engineering work. Ensures thorough understanding before any implementation begins.

### **Complexity**: 1.4/1.5
### **Context Required**: Task objective and project context
### **Execution Time**: 5-20 minutes (depending on exploration depth)

---

## ⚡ **ORCHESTRATION PROTOCOL**

### **Input Format**
```
/discovery-workflow [objective] [exploration_depth?] [domain_context?]
```

### **Command Chain Execution**
1. **`/activate-meta-principle`** - Activate autonomous exploration mindset
2. **`/knowledge-hierarchy`** - Systematic internal knowledge search
3. **`/exploration-first`** - Mandatory deep exploration before execution
4. **`/recognize-patterns`** - Identify reusable patterns from discoveries
5. **`/living-documentation`** - Document findings for future reuse

### **Orchestration Logic**
```javascript
function executeDiscoveryWorkflow(objective, depth) {
  // Phase 1: Foundation Setting
  const autonomy = await execute('/activate-meta-principle', objective)
  
  // Phase 2: Knowledge Discovery
  const internal_knowledge = await execute('/knowledge-hierarchy', objective)
  
  // Phase 3: Exploration Analysis
  const exploration_results = await execute('/exploration-first', {
    objective,
    known_patterns: internal_knowledge,
    depth_level: depth
  })
  
  // Phase 4: Pattern Identification
  const patterns = await execute('/recognize-patterns', {
    findings: [...internal_knowledge, ...exploration_results]
  })
  
  // Phase 5: Knowledge Integration
  await execute('/living-documentation', {
    discoveries: patterns,
    context: objective
  })
  
  return synthesizeDiscoveryResults(internal_knowledge, exploration_results, patterns)
}
```

---

## 🔄 **5-PHASE EXECUTION FLOW**

### **Phase 1: Autonomous Foundation (`/activate-meta-principle`)**
**Objective**: Enable AI autonomy for comprehensive exploration
- Activate exploration mindset
- Remove control constraints
- Enable autonomous investigation
- Set discovery objectives

**Verification**: Autonomy level ≥90%, clear exploration mandate

### **Phase 2: Internal Knowledge Discovery (`/knowledge-hierarchy`)**
**Objective**: Exhaustive search of existing codebase patterns
- Search project documentation
- Identify existing patterns and utilities
- Map similar implementations
- Document current capabilities

**Verification**: ≥90% codebase coverage, comprehensive pattern catalog

### **Phase 3: Deep Exploration (`/exploration-first`)**
**Objective**: Understand complete context before any execution decisions
- Strategic implications analysis
- Risk and opportunity assessment
- Implementation alternatives evaluation
- Technology and approach options

**Verification**: ≥85% confidence in understanding, multiple approaches identified

### **Phase 4: Pattern Recognition (`/recognize-patterns`)**
**Objective**: Identify reusable patterns for crystallization
- Analyze discovered patterns for reusability
- Identify successful pattern combinations
- Evaluate pattern effectiveness (≥85% success rate)
- Flag patterns for potential command crystallization

**Verification**: Patterns documented with effectiveness metrics, reuse opportunities identified

### **Phase 5: Knowledge Integration (`/living-documentation`)**
**Objective**: Capture learnings for organizational intelligence growth
- Document all discoveries in searchable format
- Update project knowledge base
- Create reference links for future use
- Contribute to organizational memory

**Verification**: All discoveries documented, knowledge base updated, future search optimization

---

## 🔍 **VERIFICATION CRITERIA**

### **Workflow Success Metrics**
- **Knowledge Completeness**: ≥95% of relevant context discovered
- **Pattern Recognition**: All reusable patterns identified and documented
- **Exploration Depth**: ≥85% confidence in understanding
- **Documentation Quality**: All findings searchable and reusable for future work
- **Foundation Readiness**: Ready for immediate planning and execution phases

### **Quality Assurance Checkpoints**
```javascript
function validateDiscoveryWorkflow(results) {
  const knowledge_score = assessKnowledgeCompleteness(results.internal_knowledge)
  const exploration_score = assessExplorationDepth(results.exploration_results)
  const pattern_score = assessPatternRecognition(results.patterns)
  const documentation_score = assessDocumentationQuality(results.documentation)
  
  const overall_score = (
    knowledge_score * 0.3 +
    exploration_score * 0.3 +
    pattern_score * 0.2 +
    documentation_score * 0.2
  )
  
  return overall_score >= 0.85 // Required threshold
}
```

---

## 🔗 **INTELLIGENT COMMAND COORDINATION**

### **Dynamic Chain Adjustment**
- If `/knowledge-hierarchy` finds comprehensive patterns → Reduce `/exploration-first` depth
- If `/knowledge-hierarchy` finds gaps → Increase `/exploration-first` scope
- If patterns already well-documented → Skip `/recognize-patterns`
- If new domain → Increase all phases depth

### **Parallel Optimization Opportunities**
```javascript
function optimizeDiscoveryExecution(objective, context) {
  const parallel_analysis = assessParallelOpportunities({
    knowledge_search: canParallelizeKnowledgeSearch(objective),
    exploration_domains: identifyExplorationDomains(objective),
    pattern_analysis: canParallelizePatternRecognition(context)
  })
  
  if (parallel_analysis.net_benefit >= 0.3) {
    return deployParallelDiscovery(parallel_analysis)
  } else {
    return executeSequentialDiscovery()
  }
}
```

---

## 🎯 **USAGE PATTERNS**

### **New Feature Development**
```
/discovery-workflow "Implement real-time chat system with WebSocket support"
```
**Result**: Complete understanding of existing WebSocket patterns, real-time libraries, chat UI components, testing approaches

### **Architecture Refactoring**
```
/discovery-workflow "Migrate from REST to GraphQL architecture"
```  
**Result**: Analysis of current REST patterns, GraphQL integration options, migration strategies, existing schema patterns

### **Performance Optimization**
```
/discovery-workflow "Optimize application performance for mobile devices"
```
**Result**: Discovery of existing performance patterns, mobile-specific optimizations, profiling tools, testing methodologies

### **Technology Integration**
```
/discovery-workflow "Add AI/ML capabilities to recommendation engine"
```
**Result**: Analysis of current recommendation logic, AI/ML library options, data pipeline patterns, model integration approaches

---

## 🔗 **NATURAL ORCHESTRATOR CONNECTIONS**

### **Automatically Chains To**
- `/planning-workflow` - Foundation for strategic planning
- `/execution-workflow` - Discovery results inform execution strategy
- `/verification-workflow` - Discovered patterns inform verification approach

### **Compatible With**
- `/parallel-over-sequential` - Parallel discovery execution when beneficial
- `/context-economy` - Optimize context loading during discovery
- `/multi-agent-orchestration` - Deploy specialized discovery agents

### **Feeds Into**
- All subsequent workflows (discovery is foundation)
- Decision engine routing (discovery results influence execution strategy)
- Pattern crystallization (successful discovery patterns become reusable)

---

## 🛡️ **FALLBACK PROTOCOL**

### **If Discovery Workflow Fails**
1. **Insufficient Internal Knowledge**: Expand search scope, include historical analysis
2. **Exploration Gaps**: Deploy specialized exploration agents for complex domains
3. **Pattern Recognition Failure**: Manual pattern analysis with lower thresholds
4. **Documentation Issues**: Simplified documentation with future improvement plan

### **Recovery Strategy**
- Document what discovery was attempted (avoid future redundancy)
- Identify specific failure points for process improvement
- Create minimal viable discovery baseline for immediate progress
- Schedule follow-up discovery phases for missed areas

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **Confidence-Based Routing**
- **High Discovery Confidence (≥90%)**: Direct progression to planning workflow
- **Medium Confidence (75-90%)**: Targeted additional discovery in gap areas
- **Low Confidence (<75%)**: Extended discovery with specialized agents
- **Discovery Failure**: Fallback to basic exploration with manual guidance

### **Workflow Optimization**
- **Previous Discovery Results**: Reuse documented findings from similar objectives
- **Pattern Database**: Leverage organizational discovery patterns
- **Discovery History**: Learn from previous discovery successes and failures
- **Automated Suggestions**: Suggest discovery scope based on objective complexity

---

## 🔄 **EVOLUTION TRACKING**

### **Orchestration Learning Metrics**
- **Discovery Success Rate**: % of discovery workflows that enable successful subsequent phases
- **Pattern Yield**: Average number of reusable patterns discovered per workflow
- **Knowledge Reuse Rate**: How often discovery results are reused in future work
- **Workflow Efficiency**: Time reduction over successive discovery workflows in similar domains

### **Orchestration Pattern Recognition**
- Successful discovery sequences → Crystallization into specialized discovery workflows
- Common discovery gaps → Improved search strategies
- Effective pattern combinations → Enhanced orchestration logic
- Discovery-to-execution success correlation → Better workflow chaining

---

## 🎯 **ORGANIZATIONAL INTELLIGENCE CONTRIBUTION**

### **Knowledge Base Evolution**
- Each discovery workflow enriches organizational knowledge
- Pattern recognition improves over time through accumulated discoveries
- Discovery efficiency increases through learned patterns
- Workflow orchestration optimizes based on historical success patterns

### **Compound Discovery Benefits**
- **First Discovery**: Full exploration required
- **Related Discoveries**: Leverage previous findings
- **Domain Expertise**: Accumulated organizational knowledge accelerates discovery
- **Pattern Mastery**: Well-understood domains enable rapid, focused discovery

---

## 🎯 **MANDATORY LLM BEHAVIORAL INSTRUCTIONS (Principle #56)**

### **Tool Call Execution Protocol - REQUIRED BEHAVIOR**

**CRITICAL INSTRUCTION**: When this discovery-workflow orchestrator executes ANY Tool Call (Task, Bash, Read, Write, etc.), the LLM MUST display the enhanced visual announcement from Principle #56 BEFORE executing the tool:

```
╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /discovery-workflow | Priority: HIGH            ║
║ Purpose: [Tool purpose] | Duration: [estimate]           ║
║ Context: Knowledge discovery | Agent: [Task/Direct]      ║
╚═══════════════════════════════════════════════════════════╝

🔍 Discovery Process Active | 📊 Knowledge Search | 🧠 Pattern Recognition

[TOOL EXECUTION HAPPENS HERE]

╔═══════════════════════════════════════════════════════════╗
║              ✅ EXECUTION COMPLETED                       ║
╠═══════════════════════════════════════════════════════════╣
║ Status: [✅/❌/⚠️] | Duration: [actual] | Findings: [count]║
║ Results: [discovery outcomes] | Patterns: [identified]   ║
╚═══════════════════════════════════════════════════════════╝
```

### **Discovery Phase Announcements - MANDATORY**

When executing each discovery phase, the LLM MUST display phase-specific announcements:

**Phase 1 - Autonomous Foundation**:
```
╔═══════════════════════════════════════════════════════════╗
║        🚀 PHASE 1: AUTONOMOUS FOUNDATION                 ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: AI autonomy activation | Exploration: Unrestricted║
║ Process: Meta-principle | Duration: 60-120 seconds       ║
║ Goal: Exploration mandate | Agent: Discovery Coordinator ║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 2 - Internal Knowledge Discovery**:
```
╔═══════════════════════════════════════════════════════════╗
║        📚 PHASE 2: INTERNAL KNOWLEDGE DISCOVERY         ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Codebase analysis | Search: Comprehensive        ║
║ Process: Knowledge hierarchy | Duration: 120-300 seconds║
║ Goal: Pattern catalog | Agent: Knowledge Specialist     ║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 3 - Deep Exploration**:
```
╔═══════════════════════════════════════════════════════════╗
║        🔍 PHASE 3: DEEP EXPLORATION                      ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Context understanding | Analysis: Strategic      ║
║ Process: Exploration-first | Duration: 180-600 seconds  ║
║ Goal: Complete comprehension | Agent: Exploration Expert║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 4 - Pattern Recognition**:
```
╔═══════════════════════════════════════════════════════════╗
║        🧩 PHASE 4: PATTERN RECOGNITION                   ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Pattern identification | Analysis: Reusability   ║
║ Process: Pattern crystallization | Duration: 120-240s   ║
║ Goal: Reusable patterns | Agent: Pattern Analyst        ║
╚═══════════════════════════════════════════════════════════╝
```

**Phase 5 - Knowledge Integration**:
```
╔═══════════════════════════════════════════════════════════╗
║        📝 PHASE 5: KNOWLEDGE INTEGRATION                 ║
╠═══════════════════════════════════════════════════════════╣
║ Focus: Documentation capture | Integration: Living docs ║
║ Process: Knowledge synthesis | Duration: 60-180 seconds ║
║ Goal: Organizational memory | Agent: Documentation Expert║
╚═══════════════════════════════════════════════════════════╝
```

### **Task Agent Deployment for Complex Discovery - MANDATORY**

When discovery requires Task agent deployment for complex analysis, display:

```
╔═══════════════════════════════════════════════════════════╗
║        🤖 DISCOVERY TASK AGENT DEPLOYMENT               ║
╠═══════════════════════════════════════════════════════════╣
║ Agent Type: Discovery Specialist | Phase: [1-5]         ║
║ Purpose: [Phase-specific discovery] | Duration: [est]   ║
║ Communication: ✅ BRIDGE ACTIVE | Updates: ≤30s         ║
║ Specialization: [knowledge/exploration/pattern/docs]    ║
╚═══════════════════════════════════════════════════════════╝

🔍 Deploying specialized discovery agent for comprehensive analysis...
📊 Bidirectional communication established for progress tracking...
🧠 Knowledge search and pattern recognition activated...

[TASK AGENT EXECUTION FOR DISCOVERY WORKFLOW]

╔═══════════════════════════════════════════════════════════╗
║         ✅ DISCOVERY PHASE COMPLETED                     ║
╠═══════════════════════════════════════════════════════════╣
║ Phase: [1-5] | Quality: [score]/10 | Findings: [count]   ║
║ Patterns: [discovered] | Knowledge: [captured]          ║
║ Handoff: Discovery results | Next: [phase/planning]     ║
╚═══════════════════════════════════════════════════════════╝
```

### **Implementation Requirements - MANDATORY**

1. **Pre-Phase Announcement**: ALWAYS display phase announcement before each discovery phase
2. **Task Agent Transparency**: Show Task agent deployment for complex discovery operations
3. **Progress Monitoring**: Display discovery progress and findings throughout workflow
4. **Pattern Tracking**: Announce pattern discoveries and knowledge capture
5. **Phase Completion**: Show completion status with quality metrics for each phase
6. **Workflow Handoff**: Announce completion and readiness for planning workflow
7. **Error Handling**: Surface discovery failures immediately with recovery actions

### **Bidirectional Communication Protocol - MANDATORY**

When deploying Task agents for discovery, the LLM MUST:

1. **Initialize Discovery Communication**: Establish communication bridge for discovery specialists
2. **Deploy Discovery Specialists**: Use Task tool for complex knowledge search and pattern analysis
3. **Monitor Discovery Progress**: Track discovery agent progress and findings accumulation
4. **Display Discovery Updates**: Show knowledge discovery progression and pattern identification
5. **Handle Discovery Handoffs**: Properly receive discovery intelligence from specialized agents
6. **Report Discovery Results**: Display comprehensive findings and readiness for next workflow
7. **Maintain Discovery Transparency**: Never allow "discovery black holes" where user loses visibility

### **Discovery Quality Display - MANDATORY**

During discovery workflow execution, display comprehensive metrics:

```
📊 DISCOVERY WORKFLOW QUALITY METRICS
╔═══════════════════════════════════════════════════════════╗
║ Phase 1 Quality: [score]/10 | Phase 2 Quality: [score]/10║
║ Phase 3 Quality: [score]/10 | Phase 4 Quality: [score]/10║
║ Phase 5 Quality: [score]/10 | Overall: [score]/10        ║
║ Knowledge Coverage: [percent]% | Patterns Found: [count] ║
╚═══════════════════════════════════════════════════════════╝

🔍 Discovery Completeness: [percentage]% | Depth: [assessment]
🧩 Pattern Recognition: [score]/10 | Reusability: [assessment]
📝 Documentation Quality: [score]/10 | Foundation: [ready/incomplete]
```

### **Compliance Enforcement - CRITICAL**

- **NEVER skip phase announcements**: Every discovery phase must be visually announced
- **NEVER hide discovery progress**: All knowledge search progress must be visible
- **NEVER skip Task agent deployment**: Complex discovery requires specialized agents
- **ALWAYS show discovery metrics**: Display comprehensive discovery quality and findings
- **ALWAYS display pattern discoveries**: Show pattern identification and crystallization
- **ALWAYS handle discovery handoffs**: Proper handoff from discovery specialists to principal agent

**P55/P56 Compliance**: This orchestrator integrates Tool Call Execution Bridging (P55) through mandatory Task agent deployment for complex discovery operations and Command Execution Transparency (P56) through comprehensive visual announcements of all discovery workflow phases and knowledge search activities.

---

**Note**: This orchestrator embodies the Context Engineering principle that thorough discovery is the foundation of all excellent work. It ensures that no implementation begins without complete understanding of existing patterns, opportunities, and constraints, with complete transparency and Task agent communication throughout the discovery process according to Principle #56.