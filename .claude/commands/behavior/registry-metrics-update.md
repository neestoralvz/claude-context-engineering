# System Command: `/registry-metrics-update`

## **Crystallized Pattern**: Registry Metrics Update
**"Automatically update command registry with current usage metrics and success rates."**

---

## 🎯 **PURPOSE**

Update command registry with latest usage statistics, success rates, and performance metrics to maintain accurate system state.

**Complexity**: 0.8/1.0  
**Context**: Command registry and execution history  
**Time**: Fast (automated updates)

---

## ⚡ **ACTIVATION**

```
/registry-metrics-update [command_name?] [metric_type?] [force_update?]
```

**What it does**:
1. **Scan Usage**: Analyze recent command execution data
2. **Calculate Metrics**: Update success rates, usage counts, execution times
3. **Validate Data**: Ensure metric accuracy and consistency
4. **Update Registry**: Write updated metrics to command-registry.json
5. **Sync Documentation**: Trigger automatic documentation updates

---

## 📊 **MATHEMATICAL CRITERIA**

**Metric Validation**:
- **Success Rate**: 0.0 ≤ rate ≤ 1.0
- **Usage Count**: ≥ 0 (incremental only)
- **Execution Time**: ≥ 0 (milliseconds)
- **Confidence Score**: 0.0 ≤ score ≤ 10.0

**Update Algorithm**:
```
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
- Atomic updates to prevent corruption
- Validation before writing changes
- Backup creation for recovery
- Automatic sync with documentation

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
```
/registry-metrics-update
```
Result: Updates all command metrics with latest usage data

**Specific Command Update**:
```
/registry-metrics-update "meta-principle"
```
Result: Updates only meta-principle command metrics

**Force Update**:
```
/registry-metrics-update force_update=true
```
Result: Forces complete registry recalculation

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
- **Update Accuracy**: ≥99% metric calculation accuracy
- **Data Consistency**: 100% registry data consistency
- **Performance**: Updates complete within 2 seconds
- **Reliability**: ≥99.5% successful update rate

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

**Note**: This command was crystallized from the `registry-metrics-update` pattern (3 uses, 100% success rate) and maintains all 43 core principles while providing essential system maintenance capability.