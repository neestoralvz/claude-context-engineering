# `/explore` - Exploration First Pattern
*Aliases: `/exploration-first`*

**Principle**: Mandatory exploration before execution (Principle #8)

## P55/P56 Compliance Visual Announcement

```
╔═══════════════════════════════════════════════════════════╗
║                🎯 TOOL CALL EXECUTION ACTIVE              ║
╠═══════════════════════════════════════════════════════════╣
║ Mode: [DIRECT EXECUTION]     │  Status: [EXECUTING...]    ║
║ Tool Calls: [MANDATORY]      │  Real Actions: [✅ ACTIVE] ║
║ P55 Compliance: [ENFORCED]   │  P56 Transparency: [ON]    ║
╚═══════════════════════════════════════════════════════════╝
```

## MANDATORY Script Execution Section

**⚠️ BASH TOOL EXECUTION REQUIRED ⚠️**

This command MANDATES real tool execution. No simulation allowed.

### Mathematical Foundation Integration

```bash
# Load Context Engineering Mathematical Formulas
source ../../../scripts/formulas/context_engineering_formulas.sh

# Calculate exploration confidence
exploration_confidence=$(calculate_confidence 0.8 0.9 0.7)
exploration_complexity=$(calculate_complexity 3 1.2 1.1)

echo "🧮 Mathematical Validation:"
echo "  Confidence Score: $exploration_confidence"
echo "  Complexity Score: $exploration_complexity"
```

### Script Integration Points

1. **Trigger Validation**: Executes `../../../scripts/validation/validate-system-integrity.sh`
2. **Progressive Analysis**: Calls `../../../scripts/core/calculate-real-metrics.sh`
3. **Formula Integration**: Sources `../../../scripts/formulas/context_engineering_formulas.sh`
4. **Quality Assessment**: Runs `../../../scripts/validation/analyze-content-quality.sh`
5. **Compliance Verification**: Executes `../../../scripts/compliance/generate-p55-compliance-report.sh`
6. **Workflow Optimization**: Calls `../../../scripts/automation/workflow-triggers.js`

## Core Exploration Protocol

### Phase 1: Domain Discovery
Execute systematic domain exploration with mathematical validation:

```bash
# MANDATORY TOOL EXECUTION - Calculate exploration metrics
domain_familiarity=0.8
requirement_clarity=0.9
resource_availability=0.7

confidence_score=$(calculate_confidence $domain_familiarity $requirement_clarity $resource_availability)
threshold_compliance=$(calculate_threshold_compliance $confidence_score 0.7 "gte")

if [ "$threshold_compliance" = "1" ]; then
    echo "✅ Exploration confidence threshold met: $confidence_score"
else
    echo "❌ Exploration confidence below threshold: $confidence_score < 0.7"
    exit 1
fi
```

**Required Actions**:
1. **Systematic Pattern Recognition**: Identify existing patterns, structures, and relationships
2. **Knowledge Boundary Mapping**: Define what is known vs unknown
3. **Constraint Identification**: Document technical, resource, and contextual limitations
4. **Opportunity Assessment**: Evaluate potential approaches and solutions

### Phase 2: Progressive Investigation

**Exploration Depth Calculation**:
```bash
objective_count=3
dependency_factor=1.2
integration_complexity=1.1

complexity_score=$(calculate_complexity $objective_count $dependency_factor $integration_complexity)
adaptive_threshold=$(calculate_adaptive_threshold "medium")

echo "🎯 Exploration Complexity: $complexity_score"
echo "📊 Adaptive Threshold: $adaptive_threshold"
```

**Investigation Protocol**:
1. **Surface-Level Scan**: Quick overview of all relevant domains
2. **Deep-Dive Analysis**: Focused investigation of critical areas
3. **Cross-Domain Integration**: Connection discovery between different areas
4. **Validation Loops**: Continuous verification of discoveries

### Phase 3: Decision Point Analysis

**P56 Transparency Requirement**: All exploration results must be visually documented

```bash
# MANDATORY EXECUTION - Generate exploration report
exploration_report="/tmp/exploration_$(date +%s).md"
cat > "$exploration_report" << EOF
# Exploration Results - $(date)

## Domain Analysis
- Patterns Identified: [REAL_COUNT]
- Knowledge Gaps: [DOCUMENTED_GAPS]
- Constraints: [VALIDATED_CONSTRAINTS]

## Mathematical Validation
- Confidence Score: $confidence_score
- Complexity Score: $complexity_score
- Threshold Compliance: $threshold_compliance

## Next Actions
[SPECIFIC_RECOMMENDATIONS]
EOF

echo "📋 Exploration report generated: $exploration_report"
```

## Enhanced Execution Triggers

### Auto-Activation Conditions
- **Confidence < 0.7**: Mandatory exploration before proceeding
- **Complexity > 1.5**: Deep exploration with progressive analysis
- **Unknown Domain**: Full exploration protocol with mathematical validation

### Tool Call Requirements
1. **File System Exploration**: Real directory scanning and file analysis
2. **Pattern Recognition**: Actual code/structure analysis via tools
3. **Mathematical Validation**: Live calculation execution via bash
4. **Documentation Generation**: Real file creation with timestamped results
5. **Script Execution**: Mandatory execution of validation and quality scripts
6. **Formula Integration**: Real-time mathematical calculations using context engineering formulas
7. **Compliance Verification**: Active P55/P56 compliance checking and reporting

## Integration Hooks

### Progressive Thinking Integration
When exploration reveals complexity ≥ 0.9 or confidence < 0.7:
```bash
if (( $(echo "$complexity_score >= 0.9" | bc -l) )) || (( $(echo "$confidence_score < 0.7" | bc -l) )); then
    echo "🧠 Auto-triggering Progressive Thinking mode..."
    # Execute progressive-thinking.md pattern
fi
```

### Decision Engine Bridge
```bash
# Calculate decision confidence based on exploration results
decision_confidence=$(calculate_confidence $domain_familiarity $requirement_clarity $resource_availability)
decision_complexity=$(calculate_complexity $objective_count $dependency_factor $integration_complexity)

echo "🎯 Decision Metrics: Confidence=$decision_confidence, Complexity=$decision_complexity"
```

## Success Criteria

### Mathematical Validation Requirements
- **Confidence Score**: ≥ 0.7 for basic exploration, ≥ 0.8 for complex domains
- **Threshold Compliance**: Must pass adaptive threshold calculation
- **Formula Integration**: All calculations must use context_engineering_formulas.sh

### Tool Execution Requirements  
- **Zero Simulation**: All exploration activities must use real tools
- **Documented Results**: Every exploration action must generate actual outputs
- **Mathematical Backing**: All decisions must be mathematically validated

### P55/P56 Compliance
- **Visual Announcements**: Every execution visually announced
- **Tool Call Transparency**: All tool calls explicitly documented
- **Real Action Verification**: No simulated or theoretical actions allowed

## Command Completion

**Success Pattern**:
```bash
exploration_functional_score=$(calculate_functional_score 0.9 0.85 0.8)
echo "🎉 Exploration completed successfully!"
echo "📊 Functional Score: $exploration_functional_score"
echo "✅ P55/P56 Compliance: Verified"
echo "🔧 Tool Calls Executed: [ACTUAL_COUNT]"
```

*This command enforces Principle #8: Exploration First through mandatory tool execution, mathematical validation, and P55/P56 compliance.*