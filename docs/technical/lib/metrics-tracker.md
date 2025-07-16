# Command Usage Metrics Tracker

This system tracks command usage patterns according to Context Engineering principles for pattern crystallization and success rate calculation.

## Usage Tracking Protocol

### **Automatic Tracking**
Every command execution should update:
1. **Usage count** - Increment by 1
2. **Success rate** - Calculate from outcomes  
3. **Execution time** - Track performance
4. **Confidence score** - Rate effectiveness
5. **Last used timestamp** - For currency tracking

### **Pattern Detection** 
Monitor for:
- **Sequential patterns** (command A → command B)
- **Frequency thresholds** (≥3 uses)
- **Success rate thresholds** (≥85%)
- **Crystallization candidates** (ready for command creation)

### **Success Rate Calculation**
```
Success Rate = (Successful Executions / Total Executions)

Success Criteria:
- Objective achieved ≥95% confidence
- No critical errors
- Expected outcomes delivered
- User satisfaction confirmed
```

### **Pattern Crystallization**
When pattern meets criteria:
1. **≥3 usage occurrences**
2. **≥85% success rate**
3. **Clear value proposition**
4. **Reusable across contexts**

→ Auto-create new command in appropriate category

### **Real-time Updates**
- Command registry updates on every execution
- CLAUDE.md statistics refresh automatically  
- Living documentation evolution tracking
- Completion dashboard real-time metrics

### **Metrics Schema**
```json
{
  "commandName": {
    "successRate": 0.95,
    "usageCount": 15,
    "lastUsed": "2025-07-15T11:45:00Z",
    "averageExecutionTime": 120,
    "confidenceScore": 9.2
  }
}
```

### **Integration Points**
- Decision engine uses metrics for routing
- Command relationships track chain efficiency  
- Living documentation reflects usage patterns
- Auto-loading rules optimize based on metrics

This tracking system enables the "Enable, don't control" principle by providing data-driven insights for system evolution.