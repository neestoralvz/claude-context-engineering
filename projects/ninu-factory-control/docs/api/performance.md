# Performance API - Evaluación de Desempeño

## Descripción

API para análisis de desempeño y KPIs de la planta Ninu.mx, incluyendo métricas de eficiencia, productividad, calidad y análisis de rendimiento por turno, operador y línea de producción.

## Endpoints

### 📊 Métricas Generales

#### `GET /api/v1/performance/dashboard`
Obtener métricas principales del dashboard

**Query Parameters:**
```typescript
interface DashboardQuery {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  date_from?: string;
  date_to?: string;
  include_projections?: boolean;
}
```

**Response:**
```typescript
interface PerformanceDashboard {
  overview: {
    total_production: number;        // Litros producidos
    efficiency: number;              // % eficiencia general
    quality_rate: number;            // % productos que pasan calidad
    downtime: number;                // % tiempo inactivo
    oee: number;                     // Overall Equipment Effectiveness
    active_orders: number;
    completed_orders: number;
    pending_orders: number;
    alerts_count: number;
    cofepris_compliance_rate: number; // % compliance COFEPRIS
  };
  production_by_category: CategoryProduction[];
  efficiency_trends: EfficiencyTrend[];
  quality_trends: QualityTrend[];
  alerts_summary: AlertsSummary;
  timestamp: string;
}

interface CategoryProduction {
  category: string;                  // desinfeccion, limpieza, etc.
  category_name: string;
  units_produced: number;
  percentage_of_total: number;
  revenue_generated: number;
  avg_efficiency: number;
}
```

#### `GET /api/v1/performance/kpis`
Obtener KPIs detallados

**Response:**
```typescript
interface ProductionKPIs {
  production_kpis: {
    total_output: number;            // Litros/día
    target_output: number;
    output_variance: number;         // % vs objetivo
    production_rate: number;         // Litros/hora
    setup_time: number;              // Minutos promedio
    changeover_time: number;         // Minutos entre productos
    first_pass_yield: number;        // % productos correctos primera vez
  };
  
  quality_kpis: {
    defect_rate: number;             // % defectos
    rework_rate: number;             // % retrabajos
    customer_complaints: number;
    cofepris_rejections: number;
    lab_test_pass_rate: number;      // % pruebas de laboratorio exitosas
    average_batch_cycle_time: number; // Minutos
  };
  
  efficiency_kpis: {
    overall_equipment_effectiveness: number; // OEE %
    availability: number;            // % tiempo disponible
    performance: number;             // % velocidad ideal
    quality_oee: number;             // % calidad OEE
    planned_vs_actual: number;       // % plan vs real
    utilization_rate: number;        // % utilización equipos
  };
  
  cost_kpis: {
    cost_per_liter: number;          // Costo por litro
    material_cost_ratio: number;     // % costo materiales
    labor_cost_ratio: number;        // % costo mano de obra
    energy_cost_per_batch: number;   // Costo energía por batch
    waste_percentage: number;        // % desperdicio
    cost_variance: number;           // % vs presupuesto
  };
}
```

### 👥 Análisis por Operador

#### `GET /api/v1/performance/operators`
Métricas de desempeño por operador

**Query Parameters:**
```typescript
interface OperatorPerformanceQuery {
  operator_id?: string;
  shift?: 'morning' | 'afternoon' | 'night';
  date_from?: string;
  date_to?: string;
  include_certifications?: boolean;
}
```

**Response:**
```typescript
interface OperatorPerformance {
  operator_id: string;
  operator_name: string;
  shift: string;
  department: string;
  metrics: {
    batches_completed: number;
    average_batch_time: number;       // Minutos
    quality_score: number;            // 1-100
    efficiency_score: number;         // 1-100
    safety_incidents: number;
    certifications_current: number;
    certifications_expired: number;
    training_hours_ytd: number;       // Year to date
    performance_rating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  };
  recent_batches: BatchSummary[];
  improvement_areas: string[];
  strengths: string[];
}
```

#### `GET /api/v1/performance/operators/:operatorId/detailed`
Análisis detallado de operador específico

### 🕐 Análisis por Turno

#### `GET /api/v1/performance/shifts`
Comparativo de desempeño por turno

**Response:**
```typescript
interface ShiftPerformance {
  shift: 'morning' | 'afternoon' | 'night';
  shift_start: string;
  shift_end: string;
  metrics: {
    production_volume: number;        // Litros
    efficiency: number;               // %
    quality_rate: number;             // %
    downtime_minutes: number;
    incidents_count: number;
    energy_consumption: number;       // kWh
    operator_count: number;
    batches_completed: number;
    average_cycle_time: number;       // Minutos
  };
  top_products: ProductShiftSummary[];
  issues: ShiftIssue[];
  supervisor: string;
}

interface ShiftIssue {
  id: string;
  type: 'quality' | 'equipment' | 'material' | 'safety' | 'process';
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  resolution_time: number;           // Minutos
  resolved: boolean;
  cost_impact?: number;
}
```

### 🏭 Análisis por Línea de Producción

#### `GET /api/v1/performance/production-lines`
Desempeño por línea de producción

**Response:**
```typescript
interface ProductionLinePerformance {
  line_id: string;
  line_name: string;                 // "Línea Líquidos A"
  line_type: 'liquids' | 'powders' | 'gels' | 'mixed';
  current_status: 'running' | 'idle' | 'maintenance' | 'changeover';
  
  performance_metrics: {
    oee_current: number;             // % OEE tiempo real
    oee_target: number;              // % OEE objetivo
    availability: number;            // % disponibilidad
    performance_rate: number;        // % rendimiento
    quality_rate: number;            // % calidad
    
    production_volume_today: number; // Litros hoy
    production_target_today: number; // Objetivo hoy
    production_variance: number;     // % diferencia
    
    average_cycle_time: number;      // Minutos por batch
    target_cycle_time: number;       // Objetivo minutos
    
    changeover_frequency: number;    // Cambios por día
    average_changeover_time: number; // Minutos promedio
  };
  
  equipment_health: {
    overall_condition: 'excellent' | 'good' | 'fair' | 'poor';
    maintenance_score: number;       // 1-100
    reliability_score: number;       // 1-100
    next_maintenance: string;
    critical_components: ComponentHealth[];
  };
  
  current_bottlenecks: Bottleneck[];
  improvement_opportunities: ImprovementOpportunity[];
}
```

### 📈 Análisis de Tendencias

#### `GET /api/v1/performance/trends`
Análisis de tendencias históricas

**Query Parameters:**
```typescript
interface TrendsQuery {
  metric: 'efficiency' | 'quality' | 'production' | 'cost' | 'oee';
  granularity: 'hour' | 'day' | 'week' | 'month';
  period_days: number;              // Días hacia atrás
  compare_period?: boolean;         // Comparar con período anterior
}
```

**Response:**
```typescript
interface TrendAnalysis {
  metric_name: string;
  unit: string;
  data_points: TrendDataPoint[];
  trend_direction: 'up' | 'down' | 'stable';
  trend_strength: number;           // 0-1
  
  statistical_analysis: {
    average: number;
    median: number;
    std_deviation: number;
    min_value: number;
    max_value: number;
    trend_slope: number;            // Pendiente de la tendencia
    r_squared: number;              // Coeficiente determinación
  };
  
  comparison_period?: {
    average_change: number;         // % cambio vs período anterior
    significance_level: number;     // Significancia estadística
    improvement: boolean;
  };
  
  forecasts: TrendForecast[];       // Proyecciones
  anomalies: TrendAnomaly[];        // Puntos anómalos
}

interface TrendDataPoint {
  timestamp: string;
  value: number;
  target?: number;
  notes?: string;
}
```

### 📋 Reportes Automáticos

#### `GET /api/v1/performance/reports`
Obtener reportes generados automáticamente

**Query Parameters:**
```typescript
interface ReportsQuery {
  report_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  department?: string;
  date_from?: string;
  date_to?: string;
  format?: 'json' | 'pdf' | 'excel';
}
```

**Response:**
```typescript
interface PerformanceReport {
  id: string;
  report_type: string;
  title: string;
  period_start: string;
  period_end: string;
  
  executive_summary: {
    key_achievements: string[];
    main_challenges: string[];
    recommendations: string[];
    next_period_focus: string[];
  };
  
  detailed_metrics: ReportSection[];
  charts_data: ChartData[];
  
  generated_at: string;
  generated_by: string;
  approved_by?: string;
  status: 'draft' | 'pending_review' | 'approved' | 'published';
}
```

#### `POST /api/v1/performance/reports/generate`
Generar reporte personalizado

**Request Body:**
```typescript
interface GenerateReportRequest {
  report_type: 'custom' | 'standard';
  title: string;
  date_from: string;
  date_to: string;
  sections: ReportSection[];
  include_charts: boolean;
  include_recommendations: boolean;
  recipients: string[];             // Email addresses
  format: 'pdf' | 'excel' | 'powerpoint';
}
```

### 🎯 Objetivos y Metas

#### `GET /api/v1/performance/targets`
Obtener objetivos y metas establecidas

**Response:**
```typescript
interface PerformanceTargets {
  department_targets: DepartmentTarget[];
  individual_targets: IndividualTarget[];
  company_targets: CompanyTarget[];
}

interface DepartmentTarget {
  department: string;
  targets: {
    efficiency_target: number;       // %
    quality_target: number;          // %
    production_target: number;       // Litros/mes
    cost_target: number;             // $/litro
    safety_target: number;           // Días sin incidentes
    cofepris_compliance_target: number; // %
  };
  current_performance: {
    efficiency_current: number;
    quality_current: number;
    production_current: number;
    cost_current: number;
    safety_current: number;
    cofepris_compliance_current: number;
  };
  variance: {
    efficiency_variance: number;     // % vs objetivo
    quality_variance: number;
    production_variance: number;
    cost_variance: number;
    safety_variance: number;
    cofepris_variance: number;
  };
}
```

#### `PUT /api/v1/performance/targets`
Actualizar objetivos y metas

## WebSocket Events

### Eventos en Tiempo Real

#### `performance:kpi-update`
```typescript
interface KPIUpdateEvent {
  kpi_name: string;
  current_value: number;
  target_value: number;
  variance: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  alert_triggered: boolean;
}
```

#### `performance:threshold-exceeded`
```typescript
interface ThresholdExceededEvent {
  metric: string;
  threshold_type: 'min' | 'max';
  current_value: number;
  threshold_value: number;
  severity: 'warning' | 'critical';
  department: string;
  recommendations: string[];
  timestamp: string;
}
```

#### `performance:achievement-unlocked`
```typescript
interface AchievementEvent {
  achievement_type: 'efficiency' | 'quality' | 'production' | 'safety';
  title: string;
  description: string;
  operator_id?: string;
  department?: string;
  value_achieved: number;
  previous_record?: number;
  timestamp: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `PERF001` | Métrica no encontrada |
| `PERF002` | Período de datos inválido |
| `PERF003` | Operador no encontrado |
| `PERF004` | Datos insuficientes para análisis |
| `PERF005` | Reporte en generación |
| `PERF006` | Objetivo no válido |
| `PERF007` | Acceso denegado a métricas |
| `PERF008` | Tendencia no calculable |
| `PERF009` | Comparación de períodos inválida |
| `PERF010` | Formato de reporte no soportado |

## Algoritmos de Cálculo

### OEE (Overall Equipment Effectiveness)
```
OEE = Disponibilidad × Rendimiento × Calidad

Disponibilidad = (Tiempo Operativo / Tiempo Planeado) × 100
Rendimiento = (Producción Real / Producción Teórica) × 100  
Calidad = (Productos Buenos / Producción Total) × 100
```

### Eficiencia de Operador
```
Eficiencia = (Tiempo Estándar / Tiempo Real) × 100
Ponderada por complejidad del producto y condiciones
```

### Score de Calidad COFEPRIS
```
Score = Σ(Parámetro_i × Peso_i × Compliance_i) / Σ(Peso_i)
Donde Compliance_i = 1 si cumple, 0 si no cumple
```

## Configuración de Alertas

### Umbrales Críticos
- **Eficiencia < 85%**: Alerta automática a supervisores
- **Calidad < 95%**: Alerta crítica + parada de línea
- **OEE < 75%**: Revisión obligatoria de proceso
- **Incumplimiento COFEPRIS**: Alerta inmediata + escalación