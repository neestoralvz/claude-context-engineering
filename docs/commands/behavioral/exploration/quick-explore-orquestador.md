# Orchestrator Command: `/quick-explore`

## **Optimización: Exploración Rápida Inteligente**
**"Exploración eficiente sin overhead para casos de uso comunes."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Orquestrador optimizado para exploración rápida y eficiente sin el overhead del meta-comando completo. Diseñado para casos de uso frecuentes donde necesitas entender rápidamente código, problemas o sistemas.

### **Complexity**: 1.2/1.0  
### **Context Required**: Objetivo de exploración específico
### **Execution Time**: 3-5 minutos (60% más rápido que meta-comando)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Usage Format**
```
/quick-explore [objetivo_específico]
/qe [objetivo_específico]          # shortcut
```

### **Optimización Inteligente**
- **🚀 Bypass análisis de decisión**: Va directo a exploración
- **⚡ Paralelización automática**: Benefit ≥ 0.4 detectado automáticamente  
- **🎯 Enfoque específico**: Solo comandos necesarios para exploración
- **📊 Context economy**: 70% reducción de contexto vs meta-comando

---

## 🔗 **ORCHESTRATED COMMAND CHAIN**

### **Secuencia Optimizada (3 comandos core)**
**Chain Execution Protocol**

**Primary Sequence**:
1. **knowledge-hierarchy**: Búsqueda jerárquica local → external
2. **explore**: Exploración obligatoria con patrones
3. **patterns**: Reconocimiento y cristalización

**Parallel Opportunities**:
- knowledge-hierarchy + explore (independientes)
- patterns (depende de resultados de ambos)

**Execution Strategy**:
- If parallel benefit ≥ 0.4: Ejecutar 1+2 en paralelo, luego 3
- If parallel benefit < 0.4: Ejecución secuencial optimizada

### **Context Distribution (Economy Active)**
**Context Distribution (Economy Active)**

**Context per Command**:
- **knowledge-hierarchy**: 
  - Context: objetivo + dominio_específico
  - Size: ~20% del contexto total
- **explore**:
  - Context: objetivo + hallazgos_knowledge
  - Size: ~25% del contexto total
- **patterns**:
  - Context: objetivo + exploration_results
  - Size: ~30% del contexto total

**Total Context Economy**: 75% vs meta-comando completo

---

## 📊 **MATHEMATICAL VALIDATION**

### **Efficiency Metrics**
```javascript
function calculateQuickExploreEfficiency() {
  const time_saving = 0.6 // 60% más rápido que meta-comando
  const context_reduction = 0.75 // 75% menos contexto
  const parallel_benefit = 0.4 // benefit automático detectado
  const accuracy_maintained = 0.92 // mantenemos 92% de precisión
  
  return {
    overall_efficiency: (time_saving + context_reduction + parallel_benefit) / 3,
    precision_quality: accuracy_maintained,
    recommended_for: "objetivos_específicos_exploración"
  }
}
```

### **Success Thresholds**
- **Time Efficiency**: ≥50% reducción vs meta-comando
- **Context Economy**: ≥70% reducción de contexto  
- **Parallel Benefit**: ≥40% cuando aplicable
- **Exploration Quality**: ≥90% de resultados del meta-comando

---

## 🔍 **INTELLIGENT ROUTING CRITERIA**

### **Ideal Use Cases (Auto-detect)**
**Perfect Fit Scenarios**:
- Entender este código/archivo/función
- Investigar problema específico
- Buscar patrones en codebase
- Analizar estructura de proyecto
- Explorar dependencias
- Mapear flujo de datos

**Avoid For**:
- Objetivos múltiples complejos (usar /context-eng)
- Implementación code (usar /rapid-prototype)
- Verificación sistema (usar /system-health)
- Planning estratégico (usar /planning-workflow)

### **Confidence-Based Routing**
```javascript
function shouldUseQuickExplore(objective, context) {
  const specificity_score = assessObjectiveSpecificity(objective) // 0.0-1.0
  const exploration_focus = detectExplorationKeywords(objective) // boolean
  const complexity_estimate = estimateComplexity(objective) // 0.0-3.0
  
  if (specificity_score >= 0.7 && 
      exploration_focus && 
      complexity_estimate <= 1.5) {
    return { recommended: true, confidence: 0.9 }
  }
  
  return { recommended: false, alternative: "/context-eng" }
}
```

---

## ⚡ **EXECUTION WORKFLOW**

### **Phase 1: Parallel Knowledge Discovery (2-3 min)**
**Parallel Execution Strategy**:

**Agent 1 (Knowledge Hierarchy)**:
- Task: Búsqueda sistemática local → external
- Context: objetivo + dominio
- Output: knowledge_map

**Agent 2 (Explore)**:
- Task: Exploración obligatoria con patrones
- Context: objetivo + exploration_strategy
- Output: exploration_findings

**Coordination Protocol**:
- Simultaneous launch: true
- Progress monitoring: true
- Early termination: si uno encuentra solución completa

### **Phase 2: Pattern Synthesis (1-2 min)**
**Pattern Synthesis Process**:
- **Input**: knowledge_map + exploration_findings
- **Process**: consolidar + identificar_patrones + cristalizar
- **Output**: structured_insights + reusable_patterns
- **Documentation**: auto-update living docs si patterns ≥ threshold

### **Result Format**
**Quick Explore Output Format**:
- **Executive Summary**: 2-3 líneas clave
- **Knowledge Discovered**: mapa de conocimiento estructurado
- **Patterns Identified**: patrones reutilizables encontrados
- **Next Recommended Actions**: sugerencias específicas
- **Crystallization Opportunities**: si aplica
- **Execution Time**: tiempo real vs estimado

---

## 🔀 **INTELLIGENT CHAINING**

### **Auto-Chain Opportunities**
**Natural Follow-up Suggestions**:

**If Patterns Found**:
- Suggest: /crystallize-patterns
- Confidence: 0.85

**If Implementation Needed**:
- Suggest: /rapid-prototype
- Confidence: 0.9

**If Verification Required**:
- Suggest: /verify-flow
- Confidence: 0.8

**If More Depth Needed**:
- Suggest: /context-eng [specific_area]
- Confidence: 0.7

### **Escalation Protocol**
**Escalation Triggers**:
  - **If Complexity Exceeds 1.5**: auto-suggest /context-eng
  - **If Multiple Objectives Detected**: auto-suggest /smart-workflow
  - **If Implementation Scope Large**: auto-suggest /planning-workflow
  - **If Exploration Insufficient**: auto-trigger second round with /explore

---

## 📋 **USAGE EXAMPLES**

### **Example 1: Codebase Understanding**
```bash
/qe "entender cómo funciona el sistema de autenticación en este proyecto"
```
**Result**: 
- Knowledge map de auth flow
- Patrones de seguridad identificados
- Dependencies y integration points
- Sugerencias de mejora

### **Example 2: Problem Investigation**
```bash  
/qe "investigar por qué la build está fallando en CI/CD"
```
**Result**:
- Mapeo de pipeline y dependencies
- Puntos de fallo identificados
- Patrones de error encontrados
- Next steps específicos

### **Example 3: Architecture Analysis**
```bash
/qe "analizar la arquitectura de datos de esta aplicación"
```
**Result**:
- Data flow mapping
- Storage patterns
- Integration dependencies  
- Optimization opportunities

---

## 🛡️ **FALLBACK PROTOCOLS**

### **If Quick Exploration Insufficient**
1. **Auto-escalate**: Sugerir `/context-eng` con contexto específico
2. **Chain suggestion**: Recomendar `/rapid-prototype` para implementación
3. **Deep dive**: Activar `/exploration-first` para análisis más profundo

### **Quality Assurance**
**Quality Assurance Checks**:
- **Minimum Insights**: 3
- **Pattern Discovery Rate**: ≥60%
- **Actionable Next Steps**: ≥2
- **Execution Time Limit**: 6 minutes max

**Fallback If Failed**:
- Retry with enhanced context: true
- Escalate to meta command: after 2 failed attempts
- Document failure pattern: true

---

## 🎯 **INTEGRATION WITH DECISION ENGINE**

### **Decision Engine Bypass**
**Decision Engine Bypass Protocol**:

**When**: clear_exploration_objective_detected

**Conditions**:
- Objective specificity ≥ 0.7
- Exploration keywords present
- Complexity estimate ≤ 1.5
- No implementation scope detected

**Execution**:
- Direct execution: true
- Skip analysis phases: complexity_analysis, model_selection, planning
- Maintain monitoring: true

### **Smart Re-routing**
```javascript
function smartReroutingLogic(exploration_results) {
  if (exploration_results.complexity_discovered > 1.5) {
    return suggestEscalation("/context-eng", exploration_results.context)
  }
  
  if (exploration_results.implementation_scope_detected) {
    return suggestChaining("/rapid-prototype", exploration_results.insights)
  }
  
  if (exploration_results.patterns_found >= 3) {
    return suggestFollowUp("/crystallize-patterns", exploration_results.patterns)
  }
  
  return { completed: true, satisfied: true }
}
```

---

## 📊 **SUCCESS METRICS & LEARNING**

### **Performance Tracking**
**Metrics to Track**:
- **Execution Time**: target 3-5 min
- **Context Efficiency**: target 75% reduction
- **Parallel Benefit Achieved**: target ≥40%
- **Exploration Quality**: target ≥90% of meta-comando results
- **User Satisfaction**: target ≥85%
- **Escalation Rate**: target ≤15%

### **Learning Loop**
**Continuous Improvement Learning Loop**:

**Pattern Detection**:
- Successful exploration patterns → enhance knowledge hierarchy
- Common follow-up chains → improve auto suggestions
- Escalation triggers → refine complexity detection

**Optimization Opportunities**:
- Reduce execution time further
- Improve parallel coordination
- Enhance pattern synthesis quality

---

## 🔗 **NATURAL CONNECTIONS**

### **Feeds Into**
- `/rapid-prototype` - When implementation is needed
- `/crystallize-patterns` - When patterns are discovered
- `/context-eng` - When complexity exceeds scope
- `/verify-flow` - When validation is required

### **Feeds From**  
- `/smart-workflow` - As recommended exploration approach
- Direct user invocation for specific exploration needs
- Auto-suggestion from other commands when exploration is needed

---

**Note**: Este orquestrador optimiza el caso de uso más común (exploración específica) eliminando overhead innecesario mientras mantiene la calidad de resultados. Implementa Context Economy, paralelización inteligente, y escalación automática cuando la complejidad excede el scope.
