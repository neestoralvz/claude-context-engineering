# Command: /model-selection

**Category**: Behavioral Selection Control  
**Purpose**: CRITICAL intelligent model recommendation and request system based on task complexity analysis with ≥90% optimization accuracy for performance and resource utilization

**P55/P56 Compliance**: MANDATORY tool execution evidence with observable model selection outcomes and quantifiable performance optimization metrics

**Behavioral Reinforcement**: PERMANENT neural pathway establishment for automatic optimal model selection with ≥95% behavioral control effectiveness

**Mathematical Precision**: ≥90% model selection accuracy with evidence-based complexity assessment

**Complexity Optimization**: 0.6/1.0 (medium-complexity selection with mathematical verification)  
**Context Requirements**: Task objective and complexity assessment (≥95% assessment accuracy)  
**Execution Time**: Immediate (analysis and recommendation with quantifiable justification)

---

## 🛡️ P55/P56 Compliance Integration

### **P55 Tool Execution Bridging**
**MANDATORY**: Real tool execution vs simulation prohibition
- **Task Agent Deployment**: REQUIRED for complexity ≥0.9
- **Success Rate Target**: ≥98% completion guarantee
- **Execution Evidence**: Actual tool results with quantitative validation

### **P56 Transparency Protocol**
**CRITICAL**: Visual execution confirmation system
- **P56 Announcement**: Model Selection execution initiated
- **Tool Evidence**: Observable outcomes with specific metrics
- **Completion Verification**: Quantifiable success criteria

## MANDATORY Activation Protocol

**Input Format**:
```bash
/model-selection [task] [complexity_override]
```

**CRITICAL Command Operations** (Sequential Protocol with Time Constraints):
1. **ANALYZE Task Complexity**: EVALUATE computational and thinking requirements (≤15 seconds, ≥90% accuracy)
2. **RECOMMEND Model**: SUGGEST Opus or Sonnet based on analysis (≤10 seconds, mathematical justification)
3. **REQUEST User Action**: PROMPT user to switch models if beneficial (clear guidance)
4. **TRACK Model Usage**: MONITOR model selection patterns for optimization (continuous learning)
5. **Optimizes Resources**: Balances capability needs with efficiency

### **Model Selection Logic**
```javascript
function selectOptimalModel(task, context) {
  const complexity = assessTaskComplexity(task, context)
  const thinking_depth = assessThinkingRequirements(task)
  const task_type = classifyTaskType(task)
  
  if (complexity > 1.5 || thinking_depth === 'deep' || task_type === 'analysis') {
    return {
      model: 'opus',
      reason: 'Complex analysis requiring deep thinking',
      action: 'Please switch to Opus using /model opus'
    }
  } else {
    return {
      model: 'sonnet',
      reason: 'Implementation task suitable for efficient execution',
      action: 'Please switch to Sonnet using /model sonnet'
    }
  }
}
```

---

## 📊 **TASK CLASSIFICATION SYSTEM**

### **Opus-Recommended Tasks**
- **Strategic Planning**: Architecture design, system design, roadmap planning
- **Deep Analysis**: Complex problem solving, root cause analysis, optimization strategies
- **Research Tasks**: Technology evaluation, approach comparison, feasibility studies
- **Creative Work**: Novel solution design, innovative approaches, pattern discovery
- **Complex Debugging**: Multi-system issues, performance bottlenecks, architectural problems

### **Sonnet-Recommended Tasks**
- **Implementation**: Writing code, creating configurations, building features
- **Simple Tasks**: File operations, basic CRUD, straightforward fixes
- **Repetitive Work**: Refactoring, formatting, standard patterns
- **Documentation**: README updates, comment additions, basic docs
- **Testing**: Writing unit tests, integration tests, test execution

### **Complexity Assessment Factors**
```javascript
function assessTaskComplexity(task) {
  return {
    cognitive_load: assessCognitiveRequirements(task),      // Weight: 0.3
    solution_novelty: assessNoveltyRequirements(task),      // Weight: 0.25
    system_complexity: assessSystemInteractions(task),       // Weight: 0.2
    uncertainty_level: assessUncertainty(task),             // Weight: 0.15
    creative_requirements: assessCreativity(task)           // Weight: 0.1
  }
}
```

---

## 🔍 **VERIFICATION CRITERIA**

### **Success Metrics**
- **Model Selection Accuracy**: ≥90% of recommendations improve performance
- **User Acceptance Rate**: ≥85% of suggestions followed
- **Task Completion Efficiency**: Measurable improvement with correct model
- **Resource Optimization**: Balance between capability and efficiency achieved

### **Recommendation Quality Validation**
```javascript
function validateModelRecommendation(task, recommended_model, actual_performance) {
  const expected_benefit = calculateExpectedBenefit(task, recommended_model)
  const actual_benefit = measureActualBenefit(actual_performance)
  
  return {
    accuracy: actual_benefit / expected_benefit,
    recommendation_valid: actual_benefit >= expected_benefit * 0.9,
    learning_feedback: generateLearningFeedback(task, actual_benefit)
  }
}
```

---

## 🔗 **NATURAL CONNECTIONS**

### **Automatically Triggers**
- Before `/exploration-first` - Recommends Opus for deep exploration
- Before `/ultra-think` - Suggests Opus for strategic analysis
- Before `/execution-workflow` - May suggest Sonnet for implementation
- Before `/planning-workflow` - Recommends Opus for complex planning

### **Compatible With**
- `/complexity-assessment` - Uses complexity metrics for model selection
- `/task-classification` - Leverages task type for recommendations
- `/resource-optimization` - Balances performance with efficiency
- `/conversation-lifecycle` - ANALYZES conversation phase in selection

### **Feeds Into**
- Decision Engine routing (model affects command availability)
- Performance tracking (model selection impacts metrics)
- Pattern recognition (successful model choices become patterns)

---

## 📋 **USAGE EXAMPLES**

### **Architecture Planning**
```bash
/model-selection "Design microservices architecture for e-commerce platform"
```
**Result**: 
```text
🧠 Model Recommendation: Opus
📊 Complexity Score: 2.1/3.0
💡 Reason: Complex architectural design requiring deep strategic thinking
🎯 Action Required: Please switch to Opus using `/model opus`
```

### **Simple Implementation**
```bash
/model-selection "Add email validation to signup form"
```
**Result**:
```text
⚡ Model Recommendation: Sonnet
📊 Complexity Score: 0.8/3.0
💡 Reason: Straightforward implementation task
🎯 Action Required: Please switch to Sonnet using `/model sonnet`
```

### **Complex Debugging**
```bash
/model-selection "Debug distributed system race condition affecting payments"
```
**Result**:
```text
🧠 Model Recommendation: Opus
📊 Complexity Score: 2.4/3.0
💡 Reason: Complex multi-system debugging requiring deep analysis
🎯 Action Required: Please switch to Opus using `/model opus`
```

---

## 🛡️ **FALLBACK PROTOCOL**

### **If Model Selection Unclear**
1. **Default to Current Model**: Continue with current model if uncertainty high
2. **Suggest Trial**: Recommend trying with current model, switch if struggling
3. **User Override**: Always respect user's model preference
4. **Learn from Choice**: Track outcome to improve future recommendations

### **Adaptive Learning**
- Track success rates per model per task type
- Adjust complexity thresholds based on outcomes
- Improve classification accuracy through usage patterns
- Refine recommendations based on user feedback

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **Automatic Model Suggestions**
- Decision Engine calls `/model-selection` before complex workflows
- Model recommendations influence command routing
- Complexity thresholds trigger automatic suggestions
- User preferences tracked and learned

### **Model-Aware Command Routing**
```javascript
function routeWithModelAwareness(command, current_model) {
  const optimal_model = selectOptimalModel(command.task)
  
  if (optimal_model.model !== current_model) {
    return {
      action: 'suggest_model_change',
      recommendation: optimal_model,
      routing_paused: true
    }
  }
  
  return continueRouting(command, current_model)
}
```

---

## 🔄 **EVOLUTION TRACKING**

### **Learning Metrics**
- **Model Selection Patterns**: Task types consistently requiring each model
- **Performance Correlation**: Success rates per model per task type
- **User Preferences**: Individual tendencies in model selection
- **Efficiency Gains**: Measured improvements from correct model selection

### **Pattern Recognition**
- Frequently successful model+task combinations → Automatic recommendations
- Edge cases where recommendations fail → Threshold adjustments
- User override patterns → Preference learning
- Performance outliers → Model capability boundary updates

---

## 💡 **USER COMMUNICATION TEMPLATES**

### **Opus Recommendation**
- 🧠 **Deep Thinking Required**
- Your task involves [complexity_reason].
- ****Recommendation****: Switch to Opus for optimal performance
- ****Command****: `/model opus`
**This Will Enable**:
- Deeper strategic analysis
- More comprehensive planning
- Better handling of complexity
- Superior problem-solving capability

### **Sonnet Recommendation**
```text
⚡ **Efficient Execution Mode**

Your task is well-suited for rapid implementation.

**Recommendation**: Switch to Sonnet for efficiency
**Command**: `/model sonnet`

This will provide:
- Faster execution speed
- Efficient resource usage
- Quick implementation
- Streamlined workflow
```

---

**Note**: This command embodies the Context Engineering principle of intelligent resource optimization, ensuring the right tool is used for the right job while maintaining transparency with the user about model selection rationale.