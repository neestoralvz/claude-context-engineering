# System Command: `/registry-metrics-update`

## **Crystallized Pattern**: Registry Metrics Update
**"Automatically update command registry with current usage metrics and success rates."**

---

## 🎯 **PURPOSE**

Update command registry with latest usage statistics, success rates, and performance metrics to maintain CRITICAL accurate system state.

**Complexity**: 0.8/1.0  
**Context**: Command registry and execution history  
**Time**: Fast (automated updates)

---

## ⚡ **ACTIVATION**

### **Auto-Activation Triggers**

**MANDATORY Activation Conditions**:
- **Complexity Threshold**: ≥0.9000 (90% complexity floor)
- **Confidence Threshold**: <0.7000 (70% confidence ceiling)
- **Registry Staleness Threshold**: >48.0000 hours since last metrics update
- **Data Accuracy Threshold**: <0.9900 (99% registry accuracy floor)
- **Time Threshold**: 24 hours for sustained registry currency conditions

**CRITICAL Trigger Validation**:
- **Mathematical Assessment**: Quantifiable registry metrics evaluation with data consistency analysis
- **Threshold Enforcement**: REQUIRED activation when registry currency conditions met
- **P56 Announcement**: Visual confirmation of auto-activation with metrics update indicators
- **Evidence Collection**: Measurable trigger condition documentation with success rate validation metrics

```markdown
/registry-metrics-update [command_name?] [metric_type?] [force_update?]
```

**What it does**:
1. **Scan Usage**: REQUIRED analyze recent command execution data
2. **Calculate Metrics**: REQUIRED update success rates, usage counts, execution times
3. **Validate Data**: CRITICAL ensure metric accuracy and consistency
4. **Update Registry**: CRITICAL write updated metrics to command-registry.json
5. **Sync Documentation**: MANDATORY trigger automatic documentation updates

---

## 📊 **MATHEMATICAL CRITERIA**

**Metric Validation**:
- **Success Rate**: 0.0 ≤ rate ≤ 1.0
- **Usage Count**: ≥ 0 (incremental only)
- **Execution Time**: ≥ 0 (milliseconds)
- **Confidence Score**: 0.0 ≤ score ≤ 10.0

**Update Algorithm**:
```markdown
new_success_rate = successful_executions / total_executions
new_usage_count = previous_count + new_executions
new_avg_time = (previous_time * previous_count + new_time * new_count) / total_count
```

---

## 🔧 **UPDATE PROCESS**

### **Data Collection**
- Load current registry state
- Scan recent execution history (last 30 days)
- Identify commands with new usage data
- Calculate updated metrics

### **Metric Updates**
- **Success Rate**: Based on recent executions
- **Usage Count**: Incremental additions
- **Last Used**: Most recent execution timestamp
- **Execution Time**: Weighted average calculation
- **Confidence Score**: Multi-dimensional assessment

### **Registry Integration**
- CRITICAL atomic updates to prevent corruption
- CRITICAL validation before writing changes
- MANDATORY backup creation for recovery
- MANDATORY automatic sync with documentation

---

## 🔗 **ECOSYSTEM INTEGRATION**

**Triggers Automatically**:
- `/sync-claude-md` - Updates CLAUDE.md with new metrics
- `/living-documentation` - Updates documentation with metrics

**Works With**:
- `/system-integrity` - Validates system health with updated metrics
- `/confidence-scoring` - Uses updated metrics for confidence calculations
- `/recognize-patterns` - Analyzes updated patterns for crystallization

**Feeds Into**:
- Command registry accuracy
- System health monitoring
- Performance optimization
- Decision engine routing

---

## 📋 **USAGE EXAMPLES**

**Full Registry Update**:

**Command**: Execute registry metrics update for all commands

**Result**: Updates all command metrics with latest usage data

**Specific Command Update**:

**Command**: Execute registry metrics update for specific command "meta-principle"

**Result**: Updates only meta-principle command metrics

**Force Update**:

**Command**: Execute registry metrics update with force_update=true parameter

**Result**: Forces complete registry recalculation

---

## 🛡️ **INTELLIGENT FALLBACKS**

**If Update Fails**:
- Restore from backup
- Partial update with successful metrics
- Log failure for debugging
- Retry with reduced scope

**If Data Corruption**:
- Validate registry integrity
- Rebuild from execution history
- Maintain service continuity
- Document recovery process

---

## 🔄 **VERIFICATION**

**Success Metrics**:
- **Update Accuracy**: CRITICAL ≥99% metric calculation accuracy
- **Data Consistency**: MANDATORY 100% registry data consistency
- **Performance**: REQUIRED updates complete within 2 seconds
- **Reliability**: CRITICAL ≥99.5% successful update rate

**Quality Monitoring**:
- Track update success rate
- Monitor data integrity
- Measure update performance
- Assess system health impact

---

## 🎯 **NATURAL WORKFLOW**

This crystallized command maintains system accuracy through:

**Usage Detection** → **Metric Calculation** → **Registry Update** → **Documentation Sync** → **System Health**

By keeping metrics current, we enable accurate decision-making and system optimization.

---

## 🛡️ **P55/P56 COMPLIANCE INTEGRATION**

### **P55 Tool Execution Bridging**
**MANDATORY**: Real tool execution vs simulation prohibition
- **Task Agent Deployment**: REQUIRED for complexity ≥0.9, registry metrics complexity automatically triggers specialized data analysis agents
- **Success Rate Target**: ≥98% completion guarantee for data collection, metric calculation, and registry update operations
- **Execution Evidence**: Actual tool results with quantitative validation showing metric accuracy ≥99%, data consistency 100%, and update performance validation

### **P56 Transparency Protocol**
**CRITICAL**: Visual execution confirmation system
- **P56 Announcement**: Registry Metrics Update execution initiated with data collection, calculation, and update phase indicators
- **Tool Evidence**: Observable outcomes with specific metrics including usage counts, success rates, execution times, and registry consistency scores
- **Completion Verification**: Quantifiable success criteria with documented metric accuracy, update performance ≤2 seconds, and system health impact assessment

### **Registry Metrics Compliance Requirements**
**MANDATORY Implementation Standards**:
- **Real Metrics Execution**: 100% actual data operations via Task agents for usage analysis, metric calculation, and registry updates
- **Metrics Monitoring**: Continuous tracking with update accuracy ≥99%, data consistency 100%, and performance ≤2 seconds completion time
- **Update Transparency**: Complete visibility into data collection, calculation processes, and registry modifications with real-time progress reporting
- **Mathematical Validation**: Quantifiable metrics for calculation accuracy, data integrity, and system reliability with statistical precision

---

**Note**: This command was crystallized from the `registry-metrics-update` pattern (3 uses, 100% success rate) and maintains all 43 core principles while providing essential system maintenance capability.
