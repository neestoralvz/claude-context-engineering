# Production API - Control de Producción

## Descripción

API para el control integral de procesos de producción en la planta Ninu.mx, incluyendo monitoreo de reactores químicos, gestión de batches, formulaciones y control de calidad en línea.

## Endpoints

### ⚙️ Gestión de Reactores

#### `GET /api/v1/production/reactors`
Obtener estado de todos los reactores

**Response:**
```typescript
interface Reactor {
  id: string;
  name: string;                    // "Reactor A - Líquidos"
  status: 'idle' | 'mixing' | 'heating' | 'cooling' | 'transferring' | 'cleaning' | 'maintenance';
  capacity: number;                // Litros
  current_batch?: Batch;
  temperature: number;             // °C
  pressure: number;                // Bar
  mixing_speed: number;            // RPM
  ph_level?: number;               // pH (para formulaciones químicas)
  last_maintenance: string;
  next_maintenance: string;
  maintenance_hours: number;       // Horas acumuladas
  created_at: string;
  updated_at: string;
}

interface Batch {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;                // Litros producidos
  target_quantity: number;         // Litros objetivo
  status: 'planned' | 'in_progress' | 'quality_check' | 'completed' | 'failed';
  start_time: string;
  estimated_completion: string;
  actual_completion?: string;
  recipe: Recipe;
  quality_metrics: QualityMetric[];
  production_order_id: string;
  batch_number: string;            // Número de lote único
  operator_id: string;
  supervisor_id?: string;
  created_at: string;
  updated_at: string;
}
```

#### `GET /api/v1/production/reactors/:reactorId`
Obtener estado detallado de un reactor específico

#### `POST /api/v1/production/reactors/:reactorId/start-batch`
Iniciar nuevo batch en reactor

**Request Body:**
```typescript
interface StartBatch {
  product_id: string;
  target_quantity: number;
  recipe_id: string;
  production_order_id: string;
  operator_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}
```

#### `PUT /api/v1/production/reactors/:reactorId/status`
Actualizar estado del reactor

**Request Body:**
```typescript
interface UpdateReactorStatus {
  status: 'idle' | 'mixing' | 'heating' | 'cooling' | 'transferring' | 'cleaning' | 'maintenance';
  temperature?: number;
  pressure?: number;
  mixing_speed?: number;
  ph_level?: number;
  notes?: string;
}
```

### 📋 Gestión de Batches

#### `GET /api/v1/production/batches`
Obtener lista de batches

**Query Parameters:**
```typescript
interface BatchesQuery {
  status?: 'planned' | 'in_progress' | 'quality_check' | 'completed' | 'failed';
  product_id?: string;
  reactor_id?: string;
  date_from?: string;
  date_to?: string;
  operator_id?: string;
  page?: number;
  limit?: number;
}
```

#### `GET /api/v1/production/batches/:batchId`
Obtener detalles de un batch específico

#### `PUT /api/v1/production/batches/:batchId/quality-check`
Registrar control de calidad

**Request Body:**
```typescript
interface QualityCheck {
  ph_level?: number;
  density?: number;
  viscosity?: number;
  color_match: boolean;
  fragrance_intensity: number;     // 1-10
  microbiological_test: 'pending' | 'passed' | 'failed';
  cofepris_compliance: boolean;
  notes?: string;
  tested_by: string;
  test_date: string;
  approved: boolean;
  rejection_reason?: string;
}
```

### 🧪 Gestión de Recetas

#### `GET /api/v1/production/recipes`
Obtener recetas disponibles

**Response:**
```typescript
interface Recipe {
  id: string;
  name: string;
  product_id: string;
  version: string;                 // "1.0", "1.1", etc.
  description: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  quality_parameters: QualityParameter[];
  estimated_duration: number;      // Minutos
  batch_size: number;              // Litros estándar
  temperature_profile: TemperaturePoint[];
  mixing_profile: MixingPoint[];
  cofepris_approved: boolean;
  approval_date?: string;
  created_by: string;
  approved_by?: string;
  status: 'draft' | 'testing' | 'approved' | 'deprecated';
  created_at: string;
  updated_at: string;
}

interface RecipeIngredient {
  material_id: string;
  material_name: string;
  quantity: number;                // Cantidad por litro
  unit: string;                    // ml, g, mg, etc.
  addition_order: number;          // Orden de adición
  addition_time?: number;          // Minutos desde inicio
  temperature_requirement?: number; // °C requerida
  mixing_speed_requirement?: number; // RPM requerida
  critical: boolean;               // Si es crítico para calidad
}

interface RecipeStep {
  step_number: number;
  description: string;
  duration: number;                // Minutos
  temperature?: number;            // °C objetivo
  mixing_speed?: number;           // RPM objetivo
  pressure?: number;               // Bar objetivo
  critical_control_point: boolean; // HACCP/COFEPRIS
  verification_required: boolean;
  notes?: string;
}
```

#### `POST /api/v1/production/recipes`
Crear nueva receta

#### `PUT /api/v1/production/recipes/:recipeId/approve`
Aprobar receta para producción

**Request Body:**
```typescript
interface ApproveRecipe {
  approved_by: string;
  cofepris_compliance_verified: boolean;
  test_batch_results?: string;
  notes?: string;
}
```

### 🏭 Estaciones de Producción

#### `GET /api/v1/production/stations`
Obtener estado de estaciones de producción

**Response:**
```typescript
interface ProductionStation {
  id: string;
  name: string;                    // "Estación Etiquetado Principal"
  type: 'filling' | 'labeling' | 'capping' | 'packaging' | 'powder' | 'soap';
  status: 'idle' | 'running' | 'paused' | 'maintenance' | 'error';
  current_product?: Product;
  efficiency: number;              // %
  units_per_hour: number;          // Velocidad actual
  target_units_per_hour: number;   // Velocidad objetivo
  units_produced_today: number;
  last_activity: string;
  queue: ProductionOrder[];
  maintenance_due: string;
  error_count_today: number;
  operator_id?: string;
  created_at: string;
  updated_at: string;
}
```

#### `POST /api/v1/production/stations/:stationId/start-production`
Iniciar producción en estación

**Request Body:**
```typescript
interface StartStationProduction {
  batch_id: string;
  target_units: number;
  operator_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  quality_check_frequency: number; // Cada N unidades
}
```

### 📊 Órdenes de Producción

#### `GET /api/v1/production/orders`
Obtener órdenes de producción

**Query Parameters:**
```typescript
interface ProductionOrdersQuery {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customer_order_id?: string;
  product_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface ProductionOrder {
  id: string;
  order_number: string;            // PO-2025-001
  customer_order_id?: string;      // Referencia del cliente
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_produced: number;
  quantity_remaining: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  due_date: string;
  start_date?: string;
  completion_date?: string;
  batches: string[];               // IDs de batches asignados
  notes?: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
```

#### `POST /api/v1/production/orders`
Crear nueva orden de producción

#### `PUT /api/v1/production/orders/:orderId/assign-batch`
Asignar batch a orden de producción

### 🔬 Control de Calidad

#### `GET /api/v1/production/quality-metrics`
Obtener métricas de calidad

**Query Parameters:**
```typescript
interface QualityMetricsQuery {
  batch_id?: string;
  product_id?: string;
  date_from?: string;
  date_to?: string;
  test_type?: 'ph' | 'density' | 'viscosity' | 'microbiological' | 'visual';
  passed_only?: boolean;
}
```

**Response:**
```typescript
interface QualityMetric {
  id: string;
  batch_id: string;
  test_type: 'ph' | 'density' | 'viscosity' | 'microbiological' | 'visual' | 'cofepris';
  parameter_name: string;
  measured_value: number;
  target_value: number;
  tolerance_min: number;
  tolerance_max: number;
  unit: string;
  passed: boolean;
  critical: boolean;               // Parámetro crítico COFEPRIS
  test_method: string;
  equipment_used?: string;
  tested_by: string;
  test_date: string;
  notes?: string;
  retest_required: boolean;
  created_at: string;
}
```

#### `POST /api/v1/production/quality-metrics`
Registrar nueva métrica de calidad

## WebSocket Events

### Eventos en Tiempo Real

#### `production:reactor-update`
```typescript
interface ReactorUpdateEvent {
  reactor_id: string;
  reactor_name: string;
  status: string;
  temperature: number;
  pressure: number;
  mixing_speed: number;
  batch_id?: string;
  timestamp: string;
}
```

#### `production:batch-status-change`
```typescript
interface BatchStatusChangeEvent {
  batch_id: string;
  old_status: string;
  new_status: string;
  product_name: string;
  reactor_id: string;
  progress_percentage: number;
  timestamp: string;
}
```

#### `production:quality-alert`
```typescript
interface QualityAlertEvent {
  batch_id: string;
  product_name: string;
  test_type: string;
  parameter_name: string;
  measured_value: number;
  target_value: number;
  deviation_percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cofepris_impact: boolean;
  timestamp: string;
}
```

#### `production:station-status`
```typescript
interface StationStatusEvent {
  station_id: string;
  station_name: string;
  old_status: string;
  new_status: string;
  efficiency: number;
  units_per_hour: number;
  timestamp: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `PROD001` | Reactor no encontrado |
| `PROD002` | Reactor ocupado con otro batch |
| `PROD003` | Receta no aprobada para producción |
| `PROD004` | Materias primas insuficientes |
| `PROD005` | Batch no encontrado |
| `PROD006` | Control de calidad fallido |
| `PROD007` | Estación fuera de servicio |
| `PROD008` | Orden de producción cancelada |
| `PROD009` | Temperatura fuera de rango |
| `PROD010` | Presión crítica |
| `PROD011` | COFEPRIS compliance no verificado |
| `PROD012` | Operador no certificado |

## Validaciones y Reglas de Negocio

### Seguridad y Compliance
- Todas las formulaciones deben tener aprobación COFEPRIS vigente
- Operadores deben estar certificados para manejar químicos
- Parámetros críticos de calidad son obligatorios
- Trazabilidad completa de ingredientes por lote

### Operacionales
- Un reactor solo puede procesar un batch a la vez
- Control de calidad obligatorio antes de liberar producto
- Mantenimiento preventivo no puede ser postergado >7 días
- Temperatura y presión dentro de rangos seguros

### Calidad
- pH debe estar dentro de ±0.2 del valor objetivo
- Densidad ±2% del valor objetivo
- Pruebas microbiológicas obligatorias para productos de limpieza
- Inspección visual 100% en productos para salud/bienestar