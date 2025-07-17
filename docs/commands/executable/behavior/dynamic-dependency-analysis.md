# Comando: /dynamic-dependency-analysis

**Categoría**: Sistema  
**Propósito**: REQUIRED análisis y gestión continua de dependencias para optimización de ejecución paralela y secuencial

## ⚡ Auto-Activation Triggers

### **MANDATORY Activation Conditions**
**Complexity Threshold**: ≥0.9000 (90% complexity floor)
**Confidence Threshold**: <0.7000 (70% confidence ceiling)
**Dependency Complexity Threshold**: ≥3.0000 concurrent tasks requiring analysis
**Parallelization Efficiency Threshold**: <0.8500 (85% efficiency floor)
**Time Threshold**: 120 seconds for sustained dependency analysis conditions

### **CRITICAL Trigger Validation**
- **Mathematical Assessment**: Quantifiable dependency mapping evaluation with statistical precision
- **Threshold Enforcement**: REQUIRED activation when multi-task dependency conditions met
- **P56 Announcement**: Visual confirmation of auto-activation with dependency analysis indicators
- **Evidence Collection**: Measurable trigger condition documentation with parallelization metrics

## Cuándo usar este comando
- Para mapear dependencias entre múltiples comandos o tareas
- Al planificar ejecución paralela de workflows complejos
- Cuando necesitas optimizar el orden de ejecución de tareas
- Para identificar oportunidades de paralelización en tiempo real
- Al gestionar recursos y conflictos entre comandos concurrentes
- Durante la re-evaluación continua de estrategias de ejecución

## Qué hace este comando

### MANDATORY Proceso Integral de Gestión de Dependencias

**1. CRITICAL Mapeo Inicial de Dependencias**
Utiliza `/command-relationships` para crear un mapa completo de dependencias:
- **Dependencias duras**: Comandos que DEBEN ejecutarse antes (bloquean ejecución)
- **Dependencias blandas**: Comandos que PREFERIBLEMENTE se ejecuten antes (optimizan resultado)
- **Conflictos de recursos**: Mapea comandos que no pueden ejecutarse simultáneamente
- **Documentación de rationale**: Registra el razonamiento de cada dependencia para referencia futura

**2. Ejecución Basada en Análisis**
Inicia ejecución siguiendo orden optimizado por dependencias:
- Comienza con comandos sin dependencias (nodos raíz)
- Ejecuta comandos dependientes a medida que se completan prerequisitos
- Monitorea uso de recursos para prevenir conflictos
- Mantiene cola de ejecución dinámica basada en disponibilidad

**3. MANDATORY Re-análisis Después de Completaciones**
Actualiza continuamente el análisis de dependencias:
- Actualiza mapa de dependencias conforme comandos se completan
- Identifica nuevas oportunidades paralelas emergentes de completaciones
- Ajusta orden de ejecución restante basado en nueva información
- Considera cambios de contexto generados por comandos completados

**4. Adaptación de Estrategia de Paralelización**
Optimiza dinámicamente la ejecución paralela:
- Incrementa paralelización conforme dependencias se resuelven
- Ajusta asignación de agentes basado en carga de trabajo actual
- Balancea uso de recursos entre ejecuciones paralelas
- Detecta y resuelve cuellos de botella emergentes

**5. Optimización Continua del Orden de Ejecución**
Optimización en tiempo real de la ejecución:
- Re-prioriza comandos restantes basado en estado actual
- Considera datos de rendimiento de comandos completados
- Ajusta estrategia basado en patrones emergentes
- Mantiene flexibilidad para cambios de prioridad

**6. REQUIRED Integración de Economía de Contexto**
Aplica optimización de contexto durante todo el análisis:
- Carga contexto de dependencias solo al analizar relaciones específicas
- Usa contexto resumido para mapeo de dependencias de alto nivel
- Aplica contexto completo solo para resolución detallada de dependencias
- Minimiza sobrecarga de contexto mientras mantiene precisión

**7. Maximización de Paralelización**
Habilita ejecución paralela libre de conflictos:
- Identifica todos los conjuntos de comandos verdaderamente independientes
- Ejecuta máximo número posible de comandos simultáneamente
- Mantiene integridad de dependencias mientras maximiza velocidad
- Logra balance óptimo entre velocidad y estabilidad

## Métricas de Análisis

### CRITICAL Indicadores de Rendimiento
- **Eficiencia de paralelización**: ≥85% (comandos ejecutados en paralelo vs secuencial)
- **Precisión de dependencias**: ≥95% (dependencias correctamente identificadas)
- **Reducción de tiempo total**: ≥40% (vs ejecución secuencial naive)
- **Utilización de recursos**: ≥80% (recursos disponibles utilizados efectivamente)

### MANDATORY Métricas de Optimización
- **Detección de independencia**: ≥90% (comandos independientes identificados)
- **Resolución de conflictos**: ≥98% (conflictos de recursos evitados)
- **Adaptabilidad**: ≥85% (ajustes exitosos durante ejecución)
- **Economía de contexto**: ≥70% (reducción de carga de contexto)

## Patrones de Uso

### Para Workflows Simples (≤5 comandos)
- Análisis básico de dependencias
- Identificación de oportunidades paralelas obvias
- Orden de ejecución optimizado simple

### Para Workflows Complejos (6-15 comandos)
- Análisis profundo de dependencias multi-nivel
- Paralelización adaptativa con re-evaluación
- Gestión activa de recursos y conflictos

### Para Workflows Masivos (>15 comandos)
- Análisis jerárquico de dependencias
- Paralelización masiva con coordinación inteligente
- Optimización continua y adaptación en tiempo real

## Casos de Uso Específicos

### Desarrollo de Software
- Análisis de dependencias de build
- Paralelización de tests
- Optimización de deployment pipelines

### Análisis de Datos
- Dependencias entre transformaciones
- Paralelización de análisis independientes
- Optimización de workflows de ML

### Gestión de Proyectos
- Dependencias entre tareas de equipo
- Optimización de cronogramas
- Identificación de rutas críticas

## Integración con Otros Comandos

### Comandos Relacionados
- `/command-relationships`: Proporciona datos base de dependencias
- `/parallel-over-sequential`: Usa resultados para ejecución paralela
- `/verification-loops`: Valida resultados de análisis de dependencias

### Flujo de Trabajo Típico
1. `/dynamic-dependency-analysis` → mapeo inicial
2. `/parallel-over-sequential` → ejecución optimizada  
3. Bucle de re-análisis → adaptación continua
4. `/verification-loops` → validación de resultados

## REQUIRED Verificación de Integridad
- Dependencias circulares: Detección automática y resolución
- Deadlocks: Prevención proactiva mediante análisis de grafos
- Consistencia: Validación continua de estados de dependencia
- Rollback: Capacidad de revertir a estado anterior si análisis falla

---

## 🛡️ **P55/P56 COMPLIANCE INTEGRATION**

### **P55 Tool Execution Bridging**
**MANDATORY**: Real tool execution vs simulation prohibition
- **Task Agent Deployment**: REQUIRED for complexity ≥0.9, dependency analysis complexity automatically triggers specialized dependency analysis agents
- **Success Rate Target**: ≥98% completion guarantee for dependency mapping and optimization operations
- **Execution Evidence**: Actual tool results with quantitative validation showing dependency graphs, parallelization ratios, and execution optimization metrics

### **P56 Transparency Protocol**
**CRITICAL**: Visual execution confirmation system
- **P56 Announcement**: Dynamic Dependency Analysis execution initiated with analysis phase indicators
- **Tool Evidence**: Observable outcomes with specific metrics including dependency count, parallelization efficiency ≥85%, and optimization success rates
- **Completion Verification**: Quantifiable success criteria with documented dependency maps, execution time improvements, and resource utilization metrics

### **Dependency Analysis Compliance Requirements**
**MANDATORY Implementation Standards**:
- **Real Analysis Execution**: 100% actual dependency analysis via Task agents for command relationship mapping and parallelization optimization
- **Performance Monitoring**: Continuous tracking with parallelization efficiency ≥85%, resource utilization ≥80%, and optimization success rates
- **Analysis Transparency**: Complete visibility into dependency detection, optimization strategies, and execution improvements
- **Mathematical Validation**: Quantifiable metrics for dependency reduction, execution time improvements, and parallelization effectiveness

---

## Nota
Este comando implementa el núcleo de la optimización de ejecución en Context Engineering, permitiendo que workflows complejos se ejecuten con máxima eficiencia mientras mantienen integridad de dependencias y economía de contexto.