# Orchestrator Command: `/system-health`

## **Optimización: Mantenimiento Inteligente Automático**
**"Verificación y optimización automática del sistema con triggers programados."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Orquestrador especializado para mantenimiento automático, verificación de integridad y optimización del sistema Context Engineering. Diseñado para ejecutarse de forma automática o manual para mantener el ecosistema en óptimas condiciones.

### **Complexity**: 1.1/1.0
### **Context Required**: Sistema Context Engineering completo
### **Execution Time**: 2-4 minutos (optimizado para eficiencia)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Usage Format**
```markdown
/system-health [scope?]
/sh [scope?]                    # shortcut
/sh auto                        # modo automático programado
```

### **Auto-Trigger Capabilities**
- **🔄 Scheduled execution**: Auto-trigger semanal
- **⚡ Health monitoring**: Trigger cuando health score < 85%
- **🎯 Maintenance detection**: Trigger cuando registry desactualizado
- **📊 Performance optimization**: Trigger cuando efficiency < threshold

---

## 🔗 **ORCHESTRATED COMMAND CHAIN**

### **Secuencia de Mantenimiento (4 comandos core)**
```yaml
chain_execution:
  sequential_optimized: # Orden específico requerido
    1. validate-sys: "Verificación de integridad del sistema"
    2. sync-docs: "Sincronización de documentación y registry"
    3. registry-metrics-update: "Actualización de métricas y estadísticas"
    4. reorganize-system: "Reorganización si threshold alcanzado"
  
  execution_strategy:
    parallel_not_beneficial: "comandos tienen dependencies secuenciales"
    optimization_focus: "speed + thoroughness + minimal_disruption"
    fallback_strategy: "individual command recovery"
```

### **Health Check Matrix**
```yaml
health_assessment:
  system_integrity:
    command_availability: "63/63 comandos activos"
    registry_sync_status: "último sync < 7 días"
    documentation_currency: "docs actualizados"
    
  performance_metrics:
    overall_success_rate: "target: ≥85%"
    command_efficiency: "execution time dentro de range"
    context_optimization: "memory usage ≤ threshold"
    
  ecosystem_health:
    pattern_crystallization: "patterns ready for crystallization"
    unused_commands: "comandos con usage < 3"
    optimization_opportunities: "efficiency improvements available"
```

---

## 📊 **MATHEMATICAL VALIDATION**

### **System Health Score Calculation**
```javascript
function calculateSystemHealthScore() {
  const command_availability = getActiveCommands() / getTotalCommands() // 0.0-1.0
  const success_rate = getOverallSuccessRate() // 0.0-1.0
  const documentation_currency = getDocumentationFreshness() // 0.0-1.0
  const performance_efficiency = getAverageExecutionEfficiency() // 0.0-1.0
  
  const health_score = (
    command_availability * 0.3 +
    success_rate * 0.3 +
    documentation_currency * 0.2 +
    performance_efficiency * 0.2
  ) * 100
  
  return {
    score: health_score, // 0-100
    status: health_score >= 85 ? "healthy" : health_score >= 70 ? "warning" : "critical",
    recommendations: generateHealthRecommendations(health_score)
  }
}
```

### **Maintenance Triggers**
```yaml
auto_trigger_conditions:
  scheduled_maintenance:
    frequency: "weekly (every 7 days)"
    day: "domingo 02:00 AM"
    duration: "2-4 minutes"
    
  health_based_triggers:
    health_score_below_85: "immediate trigger"
    success_rate_below_80: "immediate trigger + investigation"
    registry_outdated_7_days: "documentation sync trigger"
    
  performance_triggers:
    average_execution_time_increase_20: "performance optimization trigger"
    memory_usage_above_threshold: "context optimization trigger"
    error_rate_increase: "system validation trigger"
```

---

## ⚡ **EXECUTION WORKFLOW**

### **Phase 1: System Integrity Validation (30-45 sec)**
```yaml
validate_sys_execution:
  task: "Verificación completa de integridad del sistema"
  checks:
    - command_availability: "todos los 63 comandos accesibles"
    - file_integrity: "archivos de comandos válidos y completos"
    - registry_consistency: "registry.json sincronizado con filesystem"
    - dependency_validation: "dependencies entre comandos válidas"
    - principle_compliance: "comandos cumplen con principios"
  
  output:
    integrity_score: "0-100%"
    issues_found: "lista de problemas detectados"
    remediation_actions: "acciones correctivas automáticas"
    critical_failures: "problemas que requieren atención manual"
```

### **Phase 2: Documentation Synchronization (45-60 sec)**
```yaml
sync_docs_execution:
  task: "Sincronización inteligente de documentación"
  operations:
    - claude_md_update: "actualizar CLAUDE.md con métricas actuales"
    - registry_sync: "sincronizar registry con filesystem"
    - pattern_detection: "detectar nuevos patterns para crystallization"
    - metric_refresh: "actualizar all command metrics"
    - cross_reference_validation: "validar links y referencias"
  
  optimizations:
    lazy_loading_update: "actualizar sistema de lazy loading"
    context_efficiency_recalculation: "recalcular context reduction achieved"
    navigation_optimization: "optimizar cognitive navigation paths"
```

### **Phase 3: Metrics & Analytics Update (30-45 sec)**
```yaml
registry_metrics_update:
  task: "Actualización completa de métricas y analytics"
  calculations:
    - success_rates: "recalcular success rates por comando"
    - usage_patterns: "identificar patrones de uso emergentes"
    - performance_metrics: "analizar execution times y efficiency"
    - crystallization_candidates: "identificar patterns ready for crystallization"
    - optimization_opportunities: "detectar mejoras posibles"
  
  analytics:
    trend_analysis: "comparar con métricas anteriores"
    predictive_insights: "predecir necesidades futuras"
    recommendation_engine: "sugerir optimizaciones específicas"
```

### **Phase 4: System Reorganization (Conditional, 30-60 sec)**
```yaml
reorganize_system_conditional:
  trigger_conditions:
    - health_score_below_75: "reorganization needed"
    - efficiency_decrease_15: "structure optimization required"
    - new_patterns_detected_≥3: "reorganization beneficial"
    - user_feedback_indicates_confusion: "navigation improvement needed"
  
  reorganization_scope:
    command_categorization: "reorganizar categorías si necesario"
    documentation_structure: "optimizar estructura de docs"
    navigation_paths: "mejorar cognitive navigation"
    principle_organization: "reorganizar principles por usage"
  
  safety_measures:
    backup_current_state: "antes de reorganization"
    rollback_capability: "si reorganization falla"
    validation_post_reorganization: "verificar que todo funciona"
```

---

## 🔍 **INTELLIGENT HEALTH ASSESSMENT**

### **Health Scoring Matrix**
```yaml
health_dimensions:
  command_ecosystem: # 30% weight
    all_commands_active: 25_points
    success_rate_≥85: 20_points
    no_critical_failures: 5_points
    
  documentation_quality: # 20% weight  
    sync_status_current: 10_points
    cross_references_valid: 5_points
    patterns_documented: 5_points
    
  performance_efficiency: # 20% weight
    execution_times_optimal: 10_points
    context_optimization_active: 5_points
    memory_usage_efficient: 5_points
    
  ecosystem_evolution: # 30% weight
    pattern_crystallization_active: 10_points
    learning_metrics_improving: 10_points
    optimization_opportunities_identified: 5_points
    user_experience_metrics: 5_points

total_possible_score: 100_points
health_thresholds:
  excellent: 90-100
  good: 85-89
  warning: 70-84
  critical: <70
```

### **Automated Remediation**
```javascript
function executeAutomatedRemediation(health_assessment) {
  const issues = health_assessment.issues_found
  const remediation_actions = []
  
  // Auto-fix common issues
  if (issues.includes("registry_out_of_sync")) {
    remediation_actions.push(executeRegistrySync())
  }
  
  if (issues.includes("documentation_outdated")) {
    remediation_actions.push(executeDocumentationUpdate())
  }
  
  if (issues.includes("performance_degradation")) {
    remediation_actions.push(executePerformanceOptimization())
  }
  
  // Report issues requiring manual intervention
  const manual_intervention = issues.filter(issue => 
    !isAutomaticallyRemediable(issue)
  )
  
  return {
    auto_remediated: remediation_actions,
    manual_required: manual_intervention,
    health_improvement: calculateHealthImprovement()
  }
}
```

---

## 📊 **AUTOMATED SCHEDULING & MONITORING**

### **Scheduled Maintenance**
```yaml
automatic_scheduling:
  weekly_maintenance:
    schedule: "every Sunday 02:00 AM"
    scope: "full system health check"
    duration: "2-4 minutes"
    notification: "completion summary"
    
  daily_health_check:
    schedule: "every day 06:00 AM"
    scope: "quick health assessment"
    duration: "30 seconds"
    trigger_full_if: "health_score < 80"
    
  real_time_monitoring:
    health_score_tracking: "continuous"
    performance_degradation_detection: "real-time"
    critical_failure_alerts: "immediate"
```

### **Proactive Maintenance**
```yaml
proactive_triggers:
  pattern_crystallization_ready:
    condition: "≥3 patterns with ≥85% success rate"
    action: "auto-suggest crystallization"
    
  performance_optimization_opportunity:
    condition: "execution time increase ≥15%"
    action: "trigger performance analysis + optimization"
    
  documentation_drift_detected:
    condition: "registry metrics vs filesystem mismatch"
    action: "auto-trigger sync + validation"
    
  usage_pattern_shift:
    condition: "comando usage patterns change significantly"
    action: "trigger reorganization analysis"
```

---

## 📋 **USAGE EXAMPLES**

### **Manual Health Check**
```bash
/sh
```
**Execution**:
- Complete health assessment
- Auto-remediation of detected issues
- Comprehensive health report
- Recommendations for optimization

### **Targeted Maintenance**
```bash
/sh docs
```
**Focused on documentation sync and validation**

### **Performance Optimization**
```bash
/sh performance
```
**Focus on execution efficiency and optimization**

### **Scheduled Automatic**
```bash
# Ejecutado automáticamente cada domingo
/sh auto
```
**Full maintenance cycle with minimal disruption**

---

## 🛡️ **SAFETY & RECOVERY PROTOCOLS**

### **Backup & Recovery**
```yaml
safety_measures:
  pre_maintenance_backup:
    scope: "registry.json + critical configuration files"
    retention: "last 7 backups"
    restoration: "automatic if validation fails"
    
  rollback_capability:
    trigger_conditions:
      - health_score_decrease_≥10_points
      - critical_functionality_broken
      - user_reports_system_issues
    
    rollback_scope:
      - registry_state
      - documentation_state
      - command_configurations
    
  validation_checkpoints:
    post_each_phase: "verify phase completion success"
    post_maintenance: "complete system validation"
    continuous_monitoring: "24h post-maintenance monitoring"
```

### **Error Handling**
```yaml
error_protocols:
  individual_command_failure:
    action: "continue with other commands + log failure"
    escalation: "manual investigation after completion"
    
  critical_system_failure:
    action: "immediate stop + rollback + alert"
    recovery: "restore last known good state"
    
  performance_degradation:
    action: "optimize + monitor + alert if not resolved"
    threshold: "execution time increase >25%"
```

---

## 🔄 **INTEGRATION WITH ECOSYSTEM**

### **Integration Points**
```yaml
ecosystem_integration:
  trigger_monitor_integration:
    purpose: "continuous health monitoring"
    frequency: "real-time + scheduled"
    
  decision_engine_integration:
    purpose: "intelligent maintenance routing"
    optimization: "maintenance strategy selection"
    
  registry_integration:
    purpose: "metrics tracking + pattern detection"
    automation: "auto-update + validation"
    
  living_documentation_integration:
    purpose: "documentation evolution tracking"
    sync: "bidirectional synchronization"
```

### **Performance Impact Minimization**
```yaml
minimal_disruption:
  execution_timing:
    preferred: "low usage periods (weekends, early morning)"
    avoid: "peak development hours"
    
  resource_usage:
    memory_footprint: "minimal during maintenance"
    cpu_usage: "lightweight operations"
    
  user_experience:
    transparency: "clear progress reporting"
    interruption: "none during active development"
    notification: "completion summary only"
```

---

## 📈 **SUCCESS METRICS & REPORTING**

### **Key Performance Indicators**
```yaml
maintenance_kpis:
  health_improvement:
    target: "health_score increase ≥5 points"
    measurement: "pre vs post maintenance"
    
  system_efficiency:
    target: "execution time optimization ≥10%"
    measurement: "average command execution time"
    
  reliability_metrics:
    target: "99.5% system availability"
    measurement: "critical failure frequency"
    
  user_experience:
    target: "maintenance_transparency_score ≥90%"
    measurement: "user feedback + disruption metrics"
```

### **Health Report Format**
```yaml
system_health_report:
  executive_summary:
    current_health_score: "numeric + status"
    health_trend: "improving/stable/declining"
    critical_issues: "count + severity"
    
  detailed_metrics:
    command_ecosystem_status: "availability + success rates"
    performance_metrics: "execution times + efficiency"
    documentation_status: "sync status + currency"
    
  automated_actions_taken:
    remediation_performed: "list of auto-fixes applied"
    optimization_improvements: "performance gains achieved"
    
  recommendations:
    immediate_actions: "require manual attention"
    optimization_opportunities: "suggested improvements"
    next_scheduled_maintenance: "timestamp + scope"
```

---

## 🔗 **NATURAL CONNECTIONS**

### **Triggers From**
- **Scheduled**: Weekly/daily automated execution
- **Performance monitoring**: When degradation detected
- **User request**: Manual health check
- **System events**: Critical issues detected

### **Feeds Into**
- `/reorganize-system` - When structural improvements needed
- `/crystallize-patterns` - When new patterns detected
- **User notification**: Health reports and recommendations
- **System optimization**: Continuous improvement loop

---

**Note**: Este orquestrador asegura que tu ecosystem Context Engineering se mantenga en óptimas condiciones mediante mantenimiento proactivo, monitoreo continuo y optimización automática. Minimiza la intervención manual mientras maximiza la salud y performance del sistema.