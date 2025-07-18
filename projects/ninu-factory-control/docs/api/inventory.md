# Inventory API - Control de Inventarios

## Descripción

API para el control integral de inventarios en la planta Ninu.mx, incluyendo gestión de stock en tiempo real, ubicaciones de almacén, movimientos, transferencias y reportes de inventario.

## Endpoints

### 📦 Gestión de Inventario

#### `GET /api/v1/inventory/stock`
Obtener inventario actual

**Query Parameters:**
```typescript
interface InventoryQuery {
  location_id?: string;
  category?: string;
  status?: 'available' | 'reserved' | 'quarantine' | 'expired' | 'damaged';
  low_stock?: boolean;             // Solo items con stock bajo
  expiring_soon?: number;          // Días para expiración
  search?: string;                 // Búsqueda por nombre/código
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface InventoryItem {
  id: string;
  material_id: string;
  material_name: string;
  material_code: string;
  category: string;
  
  // Cantidades
  available_quantity: number;
  reserved_quantity: number;
  quarantine_quantity: number;
  total_quantity: number;
  
  // Ubicaciones
  locations: StockLocation[];
  
  // Costos y valorización
  unit_cost: number;
  total_value: number;
  valuation_method: 'FIFO' | 'LIFO' | 'AVERAGE';
  
  // Control de stock
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  
  // Estado y alertas
  status: 'normal' | 'low_stock' | 'overstock' | 'expired_items' | 'no_movement';
  alerts: InventoryAlert[];
  
  // Últimos movimientos
  last_movement_date: string;
  last_receipt_date?: string;
  last_consumption_date?: string;
  
  // Métricas de rotación
  turnover_rate: number;           // Rotaciones por año
  days_of_supply: number;          // Días de suministro restantes
  
  updated_at: string;
}

interface StockLocation {
  location_id: string;
  location_name: string;
  warehouse: string;
  zone: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  quantity: number;
  status: 'available' | 'reserved' | 'quarantine';
  batches: LocationBatch[];
}

interface LocationBatch {
  batch_id: string;
  batch_number: string;
  quantity: number;
  expiration_date?: string;
  quality_status: 'approved' | 'pending' | 'rejected';
  received_date: string;
}
```

#### `GET /api/v1/inventory/stock/:materialId`
Obtener inventario detallado de un material específico

#### `PUT /api/v1/inventory/stock/:materialId/adjust`
Ajustar inventario

**Request Body:**
```typescript
interface InventoryAdjustment {
  adjustment_type: 'increase' | 'decrease' | 'recount';
  quantity: number;
  location_id: string;
  batch_id?: string;
  reason: 'cycle_count' | 'damage' | 'theft' | 'expiration' | 'found' | 'error_correction' | 'other';
  reason_details: string;
  authorization_code?: string;     // Requerido para ajustes grandes
  photos?: string[];               // URLs de fotos como evidencia
  witnessed_by?: string;           // ID de supervisor testigo
}
```

### 🏢 Gestión de Ubicaciones

#### `GET /api/v1/inventory/locations`
Obtener ubicaciones de almacén

**Response:**
```typescript
interface WarehouseLocation {
  id: string;
  code: string;                    // WH-A-01-A-003
  name: string;
  warehouse: string;               // Almacén A, B, C
  zone: string;                    // Materias Primas, Producto Terminado, etc.
  aisle?: string;
  shelf?: string;
  bin?: string;
  
  // Características físicas
  capacity: number;                // Capacidad máxima en litros/kg
  current_utilization: number;     // % ocupación actual
  temperature_controlled: boolean;
  humidity_controlled: boolean;
  hazmat_approved: boolean;        // Para materiales peligrosos
  
  // Restricciones
  material_types_allowed: string[]; // Tipos de materiales permitidos
  access_level: 'public' | 'restricted' | 'controlled';
  
  // Estado actual
  status: 'active' | 'maintenance' | 'blocked' | 'full';
  current_materials: MaterialInLocation[];
  
  created_at: string;
  updated_at: string;
}

interface MaterialInLocation {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  last_movement: string;
}
```

#### `POST /api/v1/inventory/locations`
Crear nueva ubicación

#### `PUT /api/v1/inventory/locations/:locationId/status`
Actualizar estado de ubicación

### 📋 Movimientos de Inventario

#### `GET /api/v1/inventory/movements`
Obtener historial de movimientos

**Query Parameters:**
```typescript
interface MovementsQuery {
  material_id?: string;
  location_id?: string;
  movement_type?: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'production_consumption' | 'return';
  date_from?: string;
  date_to?: string;
  user_id?: string;
  reference_type?: 'production_order' | 'purchase_order' | 'transfer_order' | 'adjustment' | 'manual';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface InventoryMovement {
  id: string;
  movement_number: string;         // MOV-2025-00001
  movement_type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'production_consumption' | 'return';
  
  // Material y cantidades
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  
  // Ubicaciones
  location_from?: string;
  location_to?: string;
  location_from_name?: string;
  location_to_name?: string;
  
  // Referencias
  reference_id?: string;           // ID de orden, transferencia, etc.
  reference_type?: string;
  reference_number?: string;
  
  // Información del lote
  batch_id?: string;
  batch_number?: string;
  expiration_date?: string;
  
  // Costos
  unit_cost?: number;
  total_cost?: number;
  
  // Auditoría
  created_by: string;
  created_by_name: string;
  approved_by?: string;
  approved_by_name?: string;
  movement_date: string;
  
  // Notas y documentos
  notes?: string;
  documents?: string[];
  
  // Estado
  status: 'pending' | 'confirmed' | 'cancelled';
  
  created_at: string;
  updated_at: string;
}
```

#### `POST /api/v1/inventory/movements`
Registrar nuevo movimiento

**Request Body:**
```typescript
interface CreateMovement {
  movement_type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'production_consumption' | 'return';
  material_id: string;
  quantity: number;
  location_from?: string;
  location_to?: string;
  batch_id?: string;
  unit_cost?: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  require_approval?: boolean;
}
```

### 🔄 Transferencias

#### `GET /api/v1/inventory/transfers`
Obtener órdenes de transferencia

**Response:**
```typescript
interface TransferOrder {
  id: string;
  transfer_number: string;         // TR-2025-0001
  status: 'draft' | 'pending_approval' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  
  // Ubicaciones
  warehouse_from: string;
  warehouse_to: string;
  
  // Información general
  requested_by: string;
  requested_date: string;
  required_date: string;
  approved_by?: string;
  approved_date?: string;
  
  // Items a transferir
  items: TransferItem[];
  
  // Logística
  transport_method?: 'internal' | 'external_carrier';
  carrier?: string;
  tracking_number?: string;
  
  // Fechas de ejecución
  shipped_date?: string;
  received_date?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TransferItem {
  id: string;
  material_id: string;
  material_name: string;
  quantity_requested: number;
  quantity_shipped?: number;
  quantity_received?: number;
  unit: string;
  
  batch_id?: string;
  batch_number?: string;
  
  location_from: string;
  location_to: string;
  
  status: 'pending' | 'shipped' | 'received' | 'discrepancy';
  discrepancy_reason?: string;
}
```

#### `POST /api/v1/inventory/transfers`
Crear nueva transferencia

#### `PUT /api/v1/inventory/transfers/:transferId/ship`
Registrar envío de transferencia

#### `PUT /api/v1/inventory/transfers/:transferId/receive`
Registrar recepción de transferencia

### 📊 Reportes y Análisis

#### `GET /api/v1/inventory/reports/abc-analysis`
Análisis ABC de inventarios

**Response:**
```typescript
interface ABCAnalysis {
  analysis_date: string;
  total_materials: number;
  total_value: number;
  
  categories: {
    category_a: {
      item_count: number;
      percentage_items: number;
      total_value: number;
      percentage_value: number;
      materials: ABCMaterial[];
    };
    category_b: {
      item_count: number;
      percentage_items: number;
      total_value: number;
      percentage_value: number;
      materials: ABCMaterial[];
    };
    category_c: {
      item_count: number;
      percentage_items: number;
      total_value: number;
      percentage_value: number;
      materials: ABCMaterial[];
    };
  };
}

interface ABCMaterial {
  material_id: string;
  material_name: string;
  annual_consumption: number;
  unit_cost: number;
  annual_value: number;
  turnover_rate: number;
  recommendation: string;
}
```

#### `GET /api/v1/inventory/reports/aging`
Análisis de envejecimiento de inventario

**Response:**
```typescript
interface InventoryAging {
  aging_buckets: {
    '0-30_days': AgingBucket;
    '31-60_days': AgingBucket;
    '61-90_days': AgingBucket;
    '91-180_days': AgingBucket;
    '181-365_days': AgingBucket;
    'over_365_days': AgingBucket;
  };
  
  slow_moving_items: SlowMovingItem[];
  dead_stock_items: DeadStockItem[];
  
  recommendations: {
    items_to_liquidate: string[];
    items_to_promote: string[];
    reorder_adjustments: ReorderAdjustment[];
  };
}

interface AgingBucket {
  item_count: number;
  total_quantity: number;
  total_value: number;
  percentage_of_total: number;
}
```

#### `GET /api/v1/inventory/reports/turnover`
Análisis de rotación de inventario

#### `GET /api/v1/inventory/reports/valuation`
Valorización de inventario

**Response:**
```typescript
interface InventoryValuation {
  valuation_date: string;
  total_inventory_value: number;
  
  by_category: CategoryValuation[];
  by_location: LocationValuation[];
  by_supplier: SupplierValuation[];
  
  cost_methods: {
    fifo_value: number;
    lifo_value: number;
    average_cost_value: number;
  };
  
  variance_analysis: {
    book_value: number;
    physical_value: number;
    variance_amount: number;
    variance_percentage: number;
  };
}
```

### 🚨 Alertas y Notificaciones

#### `GET /api/v1/inventory/alerts`
Obtener alertas de inventario

**Response:**
```typescript
interface InventoryAlert {
  id: string;
  alert_type: 'low_stock' | 'overstock' | 'expired' | 'expiring_soon' | 'no_movement' | 'location_full' | 'discrepancy';
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  
  material_id?: string;
  material_name?: string;
  location_id?: string;
  location_name?: string;
  
  current_value: number;
  threshold_value: number;
  
  message: string;
  details: any;
  
  recommended_actions: string[];
  
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  
  created_at: string;
  expires_at?: string;
}
```

#### `PUT /api/v1/inventory/alerts/:alertId/acknowledge`
Marcar alerta como reconocida

### 🔍 Auditorías y Conteo Cíclico

#### `GET /api/v1/inventory/cycle-counts`
Obtener programación de conteo cíclico

**Response:**
```typescript
interface CycleCount {
  id: string;
  count_number: string;            // CC-2025-001
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  cycle_type: 'abc_based' | 'location_based' | 'random' | 'exception_based';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  scheduled_date: string;
  started_date?: string;
  completed_date?: string;
  
  assigned_to: string[];
  
  items: CycleCountItem[];
  
  summary: {
    items_counted: number;
    items_pending: number;
    discrepancies_found: number;
    adjustments_required: number;
    accuracy_percentage: number;
  };
  
  created_at: string;
  updated_at: string;
}

interface CycleCountItem {
  material_id: string;
  material_name: string;
  location_id: string;
  
  book_quantity: number;
  counted_quantity?: number;
  variance?: number;
  variance_percentage?: number;
  
  count_status: 'pending' | 'counted' | 'recounted' | 'adjusted';
  counted_by?: string;
  count_date?: string;
  
  discrepancy_reason?: string;
  requires_investigation: boolean;
}
```

#### `POST /api/v1/inventory/cycle-counts`
Crear nuevo conteo cíclico

#### `PUT /api/v1/inventory/cycle-counts/:countId/record-count`
Registrar conteo físico

## WebSocket Events

### Eventos en Tiempo Real

#### `inventory:stock-change`
```typescript
interface StockChangeEvent {
  material_id: string;
  material_name: string;
  location_id: string;
  location_name: string;
  old_quantity: number;
  new_quantity: number;
  movement_type: string;
  movement_id: string;
  timestamp: string;
}
```

#### `inventory:alert-triggered`
```typescript
interface InventoryAlertEvent {
  alert: InventoryAlert;
  affected_materials: string[];
  requires_immediate_action: boolean;
  timestamp: string;
}
```

#### `inventory:location-full`
```typescript
interface LocationFullEvent {
  location_id: string;
  location_name: string;
  utilization_percentage: number;
  materials_affected: string[];
  alternative_locations: string[];
  timestamp: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `INV001` | Material no encontrado en inventario |
| `INV002` | Ubicación no válida |
| `INV003` | Stock insuficiente |
| `INV004` | Lote no encontrado |
| `INV005` | Ubicación llena |
| `INV006` | Material en cuarentena |
| `INV007` | Movimiento no autorizado |
| `INV008` | Ajuste requiere autorización |
| `INV009` | Transferencia en proceso |
| `INV010` | Conteo cíclico pendiente |
| `INV011` | Material expirado |
| `INV012` | Ubicación restringida |

## Reglas de Negocio

### Control de Stock
- Stock no puede ser negativo
- Reservas automáticas para órdenes de producción
- Liberación automática de reservas expiradas
- Alertas automáticas para stock mínimo

### Gestión de Lotes
- FIFO obligatorio para productos con expiración
- Trazabilidad completa de lotes
- Bloqueo automático de lotes expirados
- Segregación de lotes rechazados por calidad

### Autorizaciones
- Ajustes > $1000: Requiere autorización de supervisor
- Ajustes > $5000: Requiere autorización de gerente
- Transferencias entre almacenes: Requiere aprobación
- Movimientos de materiales controlados: Requiere doble autorización

### Conteo Cíclico
- Materiales categoría A: Conteo mensual
- Materiales categoría B: Conteo trimestral
- Materiales categoría C: Conteo semestral
- Discrepancias > 5%: Requieren investigación obligatoria