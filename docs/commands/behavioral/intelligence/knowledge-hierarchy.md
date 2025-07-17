# Atomic Command: `/knowledge-hierarchy`

## **Principle #4: Knowledge Discovery Hierarchy**
**"Systematic knowledge search from local to external, documenting everything for future reuse."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Execute systematic knowledge discovery protocol that prioritizes existing codebase patterns before external research, documenting all findings for organizational intelligence growth.

### **Complexity**: 0.7/1.0
### **Context Required**: Project context and search objectives
### **Execution Time**: 2-10 minutes (depending on codebase size)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Input Format**
```
/knowledge-hierarchy [search_topic] [scope?] [depth?]
```

### **What This Command Does**
1. **Codebase-First Search**: Exhaustive search of existing patterns, solutions, and documentation
2. **Pattern Documentation**: Immediate capture of discovered patterns
3. **Gap Identification**: Determine what knowledge is missing
4. **External Research**: Only if internal search yields insufficient results
5. **Knowledge Integration**: Add findings to organizational memory

### **Mandatory Search Protocol**
1. **Local Documentation**: README, CLAUDE.md, inline docs
2. **Code Patterns**: Similar implementations, utilities, frameworks
3. **Configuration Files**: Build tools, dependencies, environment setup
4. **Test Patterns**: Existing test approaches and utilities
5. **External Research**: Only if steps 1-4 insufficient

---

## 🔍 **SYSTEMATIC SEARCH ALGORITHM**

### **Phase 1: Internal Knowledge Discovery**
```javascript
function searchCodebase(topic, scope) {
  const findings = {
    documentation: searchDocumentation(topic),
    code_patterns: searchCodePatterns(topic),
    similar_implementations: findSimilarImplementations(topic),
    utilities: identifyRelevantUtilities(topic),
    tests: findTestPatterns(topic),
    configuration: searchConfiguration(topic)
  }
  
  return consolidateFindings(findings)
}
```

### **Phase 2: Gap Analysis**
```javascript
function analyzeKnowledgeGaps(internal_findings, search_objective) {
  const coverage = calculateCoverage(internal_findings, search_objective)
  const gaps = identifyGaps(internal_findings, search_objective)
  const priority = prioritizeGaps(gaps)
  
  return {
    coverage_percentage: coverage,
    critical_gaps: gaps.filter(gap => gap.priority === 'high'),
    research_needed: coverage < 0.75
  }
}
```

### **Phase 3: External Research (If Needed)**
- Only triggered if internal coverage < 75%
- Focused search based on identified gaps
- Immediate documentation of external findings
- Integration with existing patterns

---

## 📋 **SEARCH METHODOLOGY**

### **Codebase Search Patterns**
1. **Exact Match Search**: Direct search for topic keywords
2. **Semantic Search**: Related concepts and synonyms
3. **Pattern Recognition**: Similar implementation patterns
4. **Dependency Analysis**: Related libraries and frameworks
5. **Historical Analysis**: Git history for evolution patterns

### **Documentation Hierarchy**
1. **Project Documentation**: README, docs/, CLAUDE.md
2. **Inline Documentation**: Comments, docstrings, type annotations
3. **Configuration Documentation**: Package.json, requirements.txt, etc.
4. **External Documentation**: Only after exhausting internal sources

---

## 🔍 **VERIFICATION CRITERIA**

### **Success Metrics**
- **Codebase Coverage**: ≥90% of relevant internal patterns discovered
- **Documentation Quality**: All findings documented with context
- **Search Efficiency**: ≥85% of useful patterns found in internal search
- **Knowledge Reuse**: New learnings integrated into existing knowledge base

### **Search Completeness Validation**
```javascript
function validateSearchCompleteness(findings, topic) {
  const completeness_score = (
    findings.documentation_coverage * 0.2 +
    findings.code_pattern_coverage * 0.3 +
    findings.utility_coverage * 0.2 +
    findings.test_coverage * 0.2 +
    findings.configuration_coverage * 0.1
  )
  
  return completeness_score >= 0.85
}
```

---

## 📚 **KNOWLEDGE DOCUMENTATION PROTOCOL**

### **Immediate Documentation Format**
```markdown
## Knowledge Discovery: [Topic]
**Search Date**: [timestamp]
**Scope**: [search scope]

### Internal Findings
- **Existing Patterns**: [list with file references]
- **Utilities Available**: [list with usage examples]
- **Similar Implementations**: [references with differences noted]
- **Test Patterns**: [existing test approaches]
- **Configuration**: [relevant config patterns]

### Gaps Identified
- **Missing Patterns**: [what wasn't found internally]
- **External Research Needed**: [specific research requirements]

### Recommendations
- **Reuse Opportunities**: [how to leverage existing patterns]
- **Extension Needs**: [how existing patterns need modification]
- **New Development**: [what needs to be built from scratch]
```

### **Living Documentation Integration**
- Add findings to project knowledge base
- Update CLAUDE.md with new patterns discovered
- Create reference links for future searches
- Contribute to organizational intelligence growth

---

## 🔗 **NATURAL CONNECTIONS**

### **Automatically Triggers**
- `/recognize-patterns` - Identify reusable patterns from findings
- `/living-documentation` - Document discoveries for future reuse
- `/single-source-truth` - Ensure no duplication of existing patterns

### **Compatible With**
- `/exploration-first` - Provides knowledge foundation for exploration
- `/context-over-commands` - Enriches context with discovered patterns
- `/objective-decomposition` - Informs breakdown based on existing capabilities

### **Feeds Into**
- `/tdd` - Existing test patterns inform testing approach
- `/parallel-over-sequential` - Discovered utilities enable parallel development
- `/crystallize-patterns` - Successful patterns become reusable commands

---

## 📋 **USAGE EXAMPLES**

### **Feature Implementation Search**
```
/knowledge-hierarchy "user authentication" "backend" "comprehensive"
```
**Result**: Discovers existing auth utilities, session management patterns, user models, test approaches

### **Technology Integration Search**
```
/knowledge-hierarchy "database optimization" "performance" "deep"
```
**Result**: Finds existing ORM patterns, query optimization utilities, performance test setups

### **Pattern Discovery Search**
```
/knowledge-hierarchy "error handling" "frontend" "patterns"
```
**Result**: Discovers error boundary patterns, API error handling, user notification systems

---

## 🛡️ **FALLBACK PROTOCOL**

### **If Internal Search Insufficient**
1. **Expand Search Scope**: Include related concepts and broader patterns
2. **Historical Analysis**: Examine git history for pattern evolution
3. **Dependency Research**: Research external libraries for patterns
4. **External Research**: Focused research based on specific gaps identified

### **Search Failure Recovery**
- Document what was searched (avoid future redundant searches)
- Identify why patterns weren't found (naming, organization, etc.)
- Suggest improvements to code organization
- Create pattern documentation for future implementations

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **Confidence Routing**
- **High Internal Coverage (>90%)**: Direct implementation using existing patterns
- **Medium Coverage (75-90%)**: Hybrid approach combining existing and new patterns
- **Low Coverage (<75%)**: Trigger external research before implementation
- **No Relevant Patterns**: Full exploration and documentation required

### **Search Optimization**
- **Previous Search Results**: Reuse documented findings from similar searches
- **Pattern Database**: Maintain searchable database of discovered patterns
- **Search History**: Learn from previous searches to improve efficiency
- **Automated Suggestions**: Suggest related searches based on current findings

---

## 🔄 **EVOLUTION TRACKING**

### **Learning Metrics**
- **Search Success Rate**: % of searches that find usable internal patterns
- **Reuse Rate**: How often discovered patterns are actually used
- **Documentation Quality**: Usefulness of documented findings for future searches
- **Knowledge Base Growth**: Rate of new pattern addition to organizational memory

### **Pattern Recognition**
- Frequently searched topics → Candidates for better documentation
- Common gaps → Areas needing pattern development
- Reusable search strategies → Crystallization into search templates
- Successful pattern reuse → Validation of documentation quality

---

## 🎯 **ORGANIZATIONAL INTELLIGENCE**

### **Knowledge Base Building**
- Every search contributes to organizational knowledge
- Pattern documentation becomes searchable for future use
- Knowledge gaps inform development priorities
- Search patterns improve for similar future searches

### **Efficiency Compound Growth**
- First search in area: Full exploration required
- Second search: Leverage previous documentation
- Third+ search: Rapidly find and reuse established patterns
- Organizational learning accelerates over time

---

**Note**: This command embodies the Context Engineering principle of building on existing knowledge before creating new solutions, enabling exponential organizational intelligence growth through systematic knowledge discovery and documentation.