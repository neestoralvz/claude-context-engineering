# Atomic Command: `/planning-documentation`

## **Principle #39: Living Planning Documentation**
**"Document planning trees and execution paths for complete traceability and rollback capability."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Create comprehensive documentation of all planning branches, decision points, and execution paths to enable complete traceability and strategic rollback capabilities.

### **Complexity**: 0.9/1.0
### **Context Required**: Planning decisions, execution paths, and outcomes
### **Execution Time**: Continuous (throughout planning and execution)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Input Format**
```
/planning-documentation [action] [branch_name?] [commit_message?]
```

### **Actions**
- `init` - Initialize planning tree for new objective
- `branch` - Create new planning branch for exploration
- `decision` - Document decision point with rationale
- `commit` - Create git commit at strategic checkpoint
- `visualize` - Generate visual representation of planning tree
- `rollback` - Return to previous decision point

### **What This Command Does**
1. **Captures Planning Tree**: Documents all explored planning branches
2. **Records Decisions**: Preserves decision rationale at each branch point
3. **Creates Checkpoints**: Strategic git commits for rollback capability
4. **Visualizes Paths**: Shows planning and execution flow
5. **Enables Time Travel**: Return to any previous decision point

---

## 🌳 **PLANNING TREE STRUCTURE**

### **Tree Components**
```javascript
class PlanningNode {
  constructor(id, description, parent = null) {
    this.id = id
    this.description = description
    this.parent = parent
    this.children = []
    this.decision_rationale = null
    this.execution_result = null
    this.confidence_score = null
    this.timestamp = new Date()
    this.git_commit = null
    this.status = 'exploring' // exploring, chosen, rejected, executed
  }
}

class PlanningTree {
  constructor(objective) {
    this.objective = objective
    this.root = new PlanningNode('root', objective)
    this.current_node = this.root
    this.decision_history = []
    this.execution_paths = []
  }
}
```

### **Decision Point Documentation**
```javascript
function documentDecisionPoint(node, decision) {
  return {
    node_id: node.id,
    timestamp: new Date(),
    decision: decision.choice,
    rationale: decision.reasoning,
    alternatives_considered: decision.alternatives,
    confidence: decision.confidence_score,
    risk_assessment: decision.risks,
    expected_outcome: decision.expected_result,
    success_criteria: decision.success_metrics,
    rollback_plan: decision.fallback_strategy
  }
}
```

---

## 📝 **DOCUMENTATION FORMATS**

### **Planning Tree Visualization**
```
Objective: Implement Authentication System
│
├─[✓] Research authentication methods (confidence: 0.92)
│  ├─[✓] OAuth2 exploration (chosen)
│  │  ├─[✓] Provider evaluation
│  │  └─[✓] Implementation planning
│  ├─[✗] JWT-only approach (rejected: limited SSO)
│  └─[○] SAML investigation (not explored)
│
├─[▶] Implementation approach (current)
│  ├─[▶] Parallel development strategy
│  │  ├─[ ] Frontend auth flow
│  │  ├─[ ] Backend OAuth2 integration
│  │  └─[ ] Database schema design
│  └─[ ] Sequential approach (alternative)
│
└─[ ] Testing strategy (pending)
   ├─[ ] Unit test approach
   ├─[ ] Integration test design
   └─[ ] E2E test planning

Legend: [✓] Executed [✗] Rejected [▶] Current [○] Not explored [ ] Pending
```

### **Decision Documentation Format**
```markdown
## Decision Point: Authentication Method Selection

**ID**: decision_auth_001
**Date**: 2024-01-15 10:30:00
**Branch**: /research/authentication-methods

### Decision Made
Selected OAuth2 as primary authentication method

### Rationale
1. **SSO Support**: Enables single sign-on with major providers
2. **Industry Standard**: Well-documented and widely supported
3. **Security**: Proven security model with regular updates
4. **User Experience**: Familiar flow for end users

### Alternatives Considered
1. **JWT-only**: Rejected due to lack of SSO support
2. **SAML**: Deferred - overly complex for current requirements
3. **Custom Auth**: Rejected - security risks and maintenance burden

### Confidence Score: 0.89/1.0

### Risk Mitigation
- Fallback to JWT for service-to-service auth
- Implement rate limiting on OAuth endpoints
- Regular security audits of implementation

### Success Criteria
- [ ] OAuth2 flow implemented for 3+ providers
- [ ] Token refresh mechanism working
- [ ] Secure token storage implemented
- [ ] Logout flow properly revokes tokens

### Rollback Plan
Git commit: `abc123` - Prior to OAuth2 implementation decision
Alternative: Implement JWT-only with migration path to OAuth2
```

---

## 🔄 **GIT INTEGRATION PROTOCOL**

### **Strategic Commit Points**
```javascript
function createStrategicCommit(planning_node, execution_state) {
  const commit_message = generateCommitMessage(planning_node)
  const commit_body = generateCommitBody(planning_node, execution_state)
  
  return {
    message: commit_message,
    body: commit_body,
    tags: [`planning_${planning_node.id}`, `decision_point`],
    branch: `planning/${planning_node.branch_name}`,
    metadata: {
      planning_tree_state: serializePlanningTree(),
      decision_context: planning_node.decision_rationale,
      rollback_instructions: generateRollbackInstructions()
    }
  }
}

function generateCommitMessage(node) {
  return `[Planning] ${node.description} - ${node.status}`
}
```

### **Rollback Capability**
```javascript
function enableRollback(target_node) {
  return {
    git_commands: [
      `git checkout ${target_node.git_commit}`,
      `git branch planning-rollback-${target_node.id}`
    ],
    context_restoration: restorePlanningContext(target_node),
    decision_tree_state: revertToNodeState(target_node),
    documentation_update: updatePlanningDocs(target_node, 'rollback')
  }
}
```

---

## 🔍 **VERIFICATION CRITERIA**

### **Success Metrics**
- **Decision Traceability**: 100% of decisions documented with rationale
- **Rollback Success Rate**: ≥95% successful rollbacks when needed
- **Planning Visibility**: Complete tree visualization available
- **Commit Coverage**: Strategic commits at all major decision points

### **Documentation Quality Validation**
```javascript
function validatePlanningDocumentation(planning_tree) {
  const metrics = {
    decision_coverage: assessDecisionDocumentation(planning_tree),
    rationale_quality: assessRationaleCompleteness(planning_tree),
    alternative_documentation: assessAlternativeConsideration(planning_tree),
    rollback_readiness: assessRollbackCapability(planning_tree)
  }
  
  return {
    overall_quality: calculateOverallQuality(metrics),
    gaps: identifyDocumentationGaps(metrics),
    improvement_suggestions: generateImprovements(metrics)
  }
}
```

---

## 🔗 **NATURAL CONNECTIONS**

### **Automatically Triggers**
- `/strategic-git` - For commit creation at decision points
- `/living-documentation` - Updates planning documentation
- `/recognize-patterns` - Identifies successful planning patterns
- `/verification-loops` - Validates planning decisions

### **Compatible With**
- `/objective-decomposition` - Documents breakdown structure
- `/parallel-over-sequential` - Documents parallel exploration branches
- `/confidence-scoring` - Records confidence at each decision
- `/git-worktrees-parallel` - Manages multiple planning branches

### **Feeds Into**
- Future planning improvements
- Pattern crystallization for planning
- Organizational learning system
- Decision quality metrics

---

## 📋 **USAGE EXAMPLES**

### **Initialize Planning Tree**
```
/planning-documentation init "Migrate monolith to microservices"
```
**Result**: Creates new planning tree, initializes documentation structure

### **Create Planning Branch**
```
/planning-documentation branch "Explore event-driven architecture"
```
**Result**: New branch in planning tree, ready for exploration documentation

### **Document Decision Point**
```
/planning-documentation decision "Selected Kubernetes for orchestration"
```
**Result**: Comprehensive decision documentation with rationale and alternatives

### **Create Strategic Commit**
```
/planning-documentation commit "Architecture decision finalized"
```
**Result**: Git commit with full planning context and rollback capability

### **Visualize Planning Tree**
```
/planning-documentation visualize
```
**Result**: Visual representation of entire planning tree with execution status

### **Rollback to Previous Decision**
```
/planning-documentation rollback "decision_arch_002"
```
**Result**: 
```
🔄 **Rollback Initiated**

Returning to: "Pre-Kubernetes decision point"
Git commit: abc123def
Date: 2024-01-14 15:30:00

**State Restored**:
- Code reverted to commit abc123def
- Planning context restored
- Alternative paths available for exploration

**Next Options**:
1. Explore Docker Swarm approach
2. Investigate Nomad as alternative
3. Reconsider Kubernetes with different configuration

Planning tree updated to reflect rollback.
```

---

## 🛡️ **FALLBACK PROTOCOL**

### **If Documentation Fails**
1. **Minimal Documentation**: Capture at least decision and timestamp
2. **Manual Recovery**: Provide manual documentation template
3. **Retroactive Documentation**: Allow backdating of decisions
4. **Emergency Rollback**: Simple git-based rollback without full context

### **Documentation Recovery**
```javascript
function recoverPlanningDocumentation(corrupted_tree) {
  return {
    git_history_reconstruction: reconstructFromGitHistory(),
    decision_log_parsing: parseDecisionLogs(),
    manual_input_request: promptForMissingDecisions(),
    partial_tree_recovery: rebuildPartialTree()
  }
}
```

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **Planning-Aware Routing**
```javascript
function routeWithPlanningAwareness(command, planning_state) {
  const current_branch = planning_state.current_node
  const exploration_depth = planning_state.getExplorationDepth()
  
  if (exploration_depth > 3 && !current_branch.decision_documented) {
    return {
      action: 'require_decision_documentation',
      message: 'Please document decision before proceeding deeper'
    }
  }
  
  return continueRouting(command)
}
```

### **Automatic Planning Documentation**
- Triggers at natural decision points
- Enforces documentation before major branches
- Creates commits at strategic checkpoints
- Maintains planning tree consistency

---

## 🔄 **EVOLUTION TRACKING**

### **Learning Metrics**
- **Decision Quality**: Track success rate of documented decisions
- **Planning Patterns**: Identify successful planning approaches
- **Rollback Frequency**: Monitor how often rollbacks needed
- **Tree Complexity**: Analyze optimal planning depth

### **Pattern Recognition**
- Successful planning patterns → Planning templates
- Common decision types → Decision documentation templates
- Effective tree structures → Structural recommendations
- Rollback patterns → Improved checkpoint strategies

---

## 🌲 **ADVANCED VISUALIZATION**

### **Interactive Planning Tree Features**
- **Clickable Nodes**: Expand for full decision details
- **Path Highlighting**: Show execution path taken
- **Alternative Paths**: Visualize unexplored options
- **Time Travel**: Slider to see tree evolution
- **Success Indicators**: Color coding for outcomes

### **Export Formats**
- **Mermaid Diagram**: For documentation embedding
- **GraphViz**: For detailed technical diagrams
- **JSON**: For programmatic analysis
- **Markdown**: For human-readable reports

---

**Note**: This command embodies the Context Engineering principle of complete planning transparency and traceability, ensuring that all planning decisions are documented, visualized, and reversible through strategic git integration.