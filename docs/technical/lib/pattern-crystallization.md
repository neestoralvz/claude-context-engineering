# Pattern Crystallization Engine

Transforms recurring usage patterns into reusable commands according to Context Engineering principle #21.

## Detection Algorithm

### **Pattern Recognition**
Monitor command execution logs for:
1. **Sequential patterns** (A → B → C workflows)
2. **Frequency patterns** (repeated single commands)
3. **Context patterns** (similar objectives/outcomes)
4. **Success patterns** (consistently high performance)

### **Crystallization Criteria**
Pattern becomes command candidate when:
- **Usage count** ≥ 3 occurrences
- **Success rate** ≥ 85% effectiveness  
- **Value clarity** - clear, measurable benefit
- **Reusability** - applicable across different contexts
- **Complexity** - within appropriate thresholds

### **Auto-Command Creation**
When pattern qualifies:

1. **Generate command name** (descriptive, follows naming convention)
2. **Create markdown file** in appropriate directory
3. **Extract common parameters** from usage patterns
4. **Document success criteria** from historical data
5. **Add to command registry** with initial metrics
6. **Update command relationships** for chaining

### **Command Categories**
Patterns crystallize into:
- **Atomic commands** (single principle, complexity ≤1.0)
- **Module commands** (multi-step, complexity ≤1.5) 
- **Orchestrator commands** (complex workflows, complexity ≤2.0)

### **Quality Assurance**
New commands must:
- Follow natural language principle (#40)
- Include clear success criteria
- Maintain single source of truth
- Pass complexity thresholds
- Align with core principles

### **Living Evolution**
- Crystallized commands tracked for effectiveness
- Poor performers marked for optimization
- Successful patterns become templates
- System learns from crystallization outcomes

### **Example Crystallization**
```
Pattern detected: "registry-metrics-update"
- Usage: 3 times
- Success: 100%
- Context: Updating command registry with metrics
- Benefit: Automates manual tracking

→ Creates: /atomic/registry-metrics-update.md
→ Adds to: command-registry.json
→ Updates: command-relationships.md
```

This engine embodies "Intelligence as Natural Phenomenon" - allowing the system to evolve through usage patterns rather than manual design.