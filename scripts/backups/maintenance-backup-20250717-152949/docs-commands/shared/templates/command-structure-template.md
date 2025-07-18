# Command Structure Template

**Meta-Principle**: "Standardize command structure and content organization across all Context Engineering commands"

**Purpose**: CRITICAL template system that provides standardized command headers, section organization, and content patterns for consistent implementation across the Context Engineering ecosystem.

**Authority**: Reference template for command structure, formatting standards, and organizational patterns.

---

## 🎯 **TEMPLATE OVERVIEW**

### **Standard Command Header Structure**
```markdown
# Atomic Command: `/command-name`

## **Principle #[N]: [Principle Title]**
**"[Principle description in quotes]"**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
[EXECUTE/IMPLEMENT/VALIDATE] [specific action] achieving [quantifiable target] to ensure [compliance/outcome] with [observable outcomes/criteria].

**Observable Outcomes**:
- **[Metric Category 1]**: [≥/≤][value] [unit] [description]
- **[Metric Category 2]**: [≥/≤][value] [unit] [description]
- **[Metric Category 3]**: [≥/≤][value] [unit] [description]

**Quantifiable Validation**: [Description] MUST achieve [≥/≤][value] [metric], [process] MUST demonstrate [requirement], and [monitoring] MUST maintain [standard] with observable outcomes.

### **Complexity**: [0.0-1.0]/1.0 (Validated via [mathematical analysis/formula])
### **Context Required**: [Context requirements] with [≥/≤][value]% [completeness/quality]
### **Execution Time**: [time range] ([breakdown of phases with time estimates])

**Success Criteria**:
- **[Criterion 1]**: [≥/≤][value] [metric] [description]
- **[Criterion 2]**: [≥/≤][value] [metric] [description]
- **[Criterion 3]**: [requirement] with [validation method]
```

### **Standard Section Organization**
```markdown
## 🏗️ **MODULE INHERITANCE** (if applicable)

**Inherits from**: [Parent Module/Framework](./path/to/parent.md)

**Inherited Functions**:
- [Inherited capability 1]
- [Inherited capability 2]
- [Inherited capability 3]

**Specialized Functions Added**:
- [Unique capability 1]
- [Unique capability 2]
- [Unique capability 3]

---

## ⚡ **ACTIVATION PROTOCOL**

### **Input Format**
```markdown
/command-name [required_param] [optional_param?] [optional_param2?]
```

### **Auto-Activation Triggers** (if applicable)
This command EXECUTES automatically when [conditions] with [≥/≤][value] [metric] and [requirements].

**Verification Protocol**:
- **[Verification 1]**: [≥/≤][value] [metric] [description]
- **[Verification 2]**: [requirement] with [validation]
- **[Verification 3]**: [standard] with [compliance method]

### **Primary Triggers** (if applicable)
**[TRIGGER NAME]**: [Description]
- **Condition**: [Specific condition with measurable criteria]
- **Threshold**: [≥/≤][value] [metric] [description]
- **Action**: [AUTO-EXECUTE/ACTIVATE] [specific action]
- **Verification**: [Expected outcome with validation]

---

## 📊 **MATHEMATICAL VALIDATION** (if applicable)

### **[Formula/Calculation Name]**
```javascript
function [functionName]([parameters]) {
  const [variable1] = [calculation/assessment]
  const [variable2] = [calculation/assessment]
  
  const [result] = [formula/calculation]
  
  return {
    [metric1]: [result1],
    [metric2]: [result2],
    [compliance]: [boolean_check] // [threshold] threshold
  }
}
```

---

## 🔧 **COMMAND FUNCTIONALITY**

### **[Function Category 1]**
[Description of core functionality with specific implementation details]

### **[Function Category 2]**
[Description of additional functionality with integration points]

### **[Function Category 3]**
[Description of specialized features with validation requirements]

---

## 🔗 **USAGE CRITERIA**

### **Automatic Activation**
- [Use case 1 with conditions]
- [Use case 2 with triggers]
- [Use case 3 with requirements]

### **Manual Activation**
- [Manual use case 1]
- [Manual use case 2]
- [Manual use case 3]

---

## 🎯 **SUCCESS METRICS**

### **[Metric Category 1]**
- **[Specific Metric]**: [≥/≤][value] [unit] ([target]: [≥/≤][target_value])
- **[Specific Metric]**: [≥/≤][value] [unit] ([target]: [≥/≤][target_value])

### **[Metric Category 2]**
- **[Specific Metric]**: [≥/≤][value] [unit] ([target]: [≥/≤][target_value])
- **[Specific Metric]**: [≥/≤][value] [unit] ([target]: [≥/≤][target_value])

---

**Module Dependencies**: [List of required dependencies]
**Used By**: [List of systems/commands that use this]
**Integration**: [List of related modules/systems]
**Compliance Authority**: [Reference to standards/principles]
```

---

## 📋 **P55/P56 COMPLIANCE INTEGRATION TEMPLATE**

### **Standard Compliance Section**
```markdown
## 🛡️ **P55/P56 COMPLIANCE FRAMEWORK**

**Inherits from**: [Universal P55/P56 Compliance](../shared/compliance/p55-p56-universal-compliance.md)

**Compliance Functions**:
- Tool call execution bridging with zero simulation tolerance
- Visual announcement system with progress tracking  
- Evidence collection framework with complete audit trails
- Universal error handling with transparency protocols

**Command-Specific Implementation**:
[Description of how this command implements P55/P56 requirements]

### **Tool Call Execution Protocol**
**MANDATORY**: When this command executes ANY Tool Call, the LLM MUST display the enhanced visual announcement:

[Include standard announcement template from P55/P56 framework]

### **Behavioral Requirements**
1. **ALWAYS** execute real tool calls (never simulate)
2. **DISPLAY** visual announcements before each tool execution
3. **CAPTURE** actual results from tool execution
4. **PROVIDE** complete transparency of all operations
5. **MAINTAIN** evidence trail for compliance verification

### **MANDATORY Post-Execution Documentation Review**
**CRITICAL Integration**: [Systematic Post-Execution Review Protocol](../../knowledge/protocols/systematic-post-execution-review-protocol.md)

**REQUIRED Questions After ANY Command Execution**:
```
🔍 POST-EXECUTION REVIEW (MANDATORY)
1. "¿Qué documentación viva necesita actualización basada en estas modificaciones?"
2. "¿Qué archivos específicos deben modificarse para reflejar estos cambios?"
3. "¿Qué cross-references requieren ajuste o actualización?"
4. "¿Qué sistemas o componentes relacionados necesitan actualizaciones?"
5. "¿Se completó el ciclo de vida de la documentación operacional?"
6. "¿Hay algún aprendizaje que deba documentarse o archivarse?"
```

**Implementation Requirements**:
- **AUTOMATIC Activation**: Post-execution review MUST activate within ≤60 seconds
- **SYSTEMATIC Analysis**: COMPREHENSIVE impact analysis with ≥95% accuracy
- **COMPLETE Coverage**: ≥95% coverage of all documentation update needs
- **ZERO Tolerance**: NO operations complete without systematic review
```

---

## 🎨 **VISUAL FORMATTING STANDARDS**

### **Section Headers**
- **Main Sections**: `## 🎯 **SECTION NAME**`
- **Subsections**: `### **Subsection Name**`
- **Sub-subsections**: `#### **Sub-subsection Name**`

### **Content Formatting**
- **CRITICAL/REQUIRED/MANDATORY**: Use for essential requirements
- **Optional/Recommended**: Use for suggested but not required elements
- **Quantifiable metrics**: Always include ≥/≤ with specific values
- **Timeframes**: Always provide specific time estimates

### **Code Block Standards**
- **JavaScript/TypeScript**: For algorithms and calculations
- **YAML**: For configuration and structured data
- **Bash**: For script execution examples
- **Markdown**: For template and structural examples

---

## 📊 **CONTENT QUALITY STANDARDS**

### **Writing Requirements**
- **Information Density**: ≥95% executable value per word
- **Clarity Score**: ≥90% comprehension for technical audience
- **Technical Accuracy**: ≥95% precision in all statements
- **Professional Neutrality**: ≥95% objective, factual language
- **Cross-Reference Validity**: ≥90% accurate links and references

### **Structure Requirements**
- **Navigation Efficiency**: ≤3 cognitive steps to any content
- **Section Organization**: Logical flow from definition to implementation
- **Template Compliance**: Consistent structure across all commands
- **Mathematical Precision**: 4+ decimal place accuracy for all metrics

### **Integration Requirements**
- **Module References**: Clear inheritance and dependency documentation
- **Cross-Command Links**: Validated references to related commands
- **Framework Integration**: Proper use of shared components and templates
- **Compliance Standards**: Full P55/P56 integration where applicable

---

## 🔧 **IMPLEMENTATION GUIDELINES**

### **For New Commands**
1. **Copy Template Structure**: Use this template as starting point
2. **Customize Content**: Replace template placeholders with command-specific content
3. **Validate Structure**: Ensure all required sections are present
4. **Test Navigation**: Verify ≤3 cognitive steps to all content
5. **Compliance Check**: Validate P55/P56 integration if applicable

### **For Existing Commands**
1. **Structure Assessment**: Compare current structure to template
2. **Gradual Migration**: Update sections incrementally to match template
3. **Content Preservation**: Maintain all existing functionality during migration
4. **Cross-Reference Update**: Update all links and references during migration
5. **Quality Validation**: Test against content quality standards

### **For Template Updates**
1. **Impact Assessment**: Evaluate effect of changes on existing commands
2. **Backward Compatibility**: Ensure changes don't break existing implementations
3. **Migration Path**: Provide clear guidance for adopting template changes
4. **Documentation**: Update all references to template when changes are made

---

**Template Dependencies**: [Universal P55/P56 Compliance](../compliance/p55-p56-universal-compliance.md)
**Used By**: ALL Context Engineering commands
**Template Authority**: Command structure and formatting standards
**Last Updated**: [Current Date] - Template Version 1.0