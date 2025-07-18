# Raw Materials API - Materia Prima

## Descripción

API para la gestión integral de materias primas en la planta Ninu.mx, incluyendo control de inventarios, trazabilidad de lotes, gestión de proveedores y control de calidad de insumos.

## Endpoints

### 📦 Gestión de Materias Primas

#### `GET /api/v1/raw-materials`
Obtener lista de materias primas

**Query Parameters:**
```typescript
interface RawMaterialsQuery {
  page?: number;           // Página (default: 1)
  limit?: number;          // Elementos por página (default: 20)
  category?: string;       // Filtrar por categoría
  supplier?: string;       // Filtrar por proveedor
  status?: 'active' | 'inactive' | 'discontinued';
  search?: string;         // Búsqueda por nombre/código
  low_stock?: boolean;     // Solo materiales con stock bajo
}
```

**Response:**
```typescript
interface RawMaterialsResponse {
  materials: RawMaterial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface RawMaterial {
  id: string;
  code: string;              // Código interno SKU
  name: string;              // Nombre del material
  description?: string;
  category: MaterialCategory;
  unit_of_measure: string;   // kg, L, unidades, etc.
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  supplier_id: string;
  supplier_name: string;
  last_purchase_date?: string;
  expiration_tracking: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

enum MaterialCategory {
  SURFACTANTS = 'surfactants',        // Tensioactivos
  FRAGRANCES = 'fragrances',          // Fragancias
  PRESERVATIVES = 'preservatives',    // Conservadores
  COLORANTS = 'colorants',           // Colorantes
  ACIDS = 'acids',                   // Ácidos
  BASES = 'bases',                   // Bases
  PACKAGING = 'packaging',           // Envases y empaques
  LABELS = 'labels',                 // Etiquetas
  OTHER = 'other'                    // Otros
}
```

#### `POST /api/v1/raw-materials`
Crear nueva materia prima

**Request Body:**
```typescript
interface CreateRawMaterial {
  code: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  unit_of_measure: string;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  supplier_id: string;
  expiration_tracking: boolean;
}
```

**Response:** `RawMaterial`

#### `PUT /api/v1/raw-materials/:id`
Actualizar materia prima

**Request Body:** `Partial<CreateRawMaterial>`

**Response:** `RawMaterial`

#### `DELETE /api/v1/raw-materials/:id`
Eliminar materia prima (soft delete)

**Response:** `{ success: true }`

### 📋 Gestión de Lotes

#### `GET /api/v1/raw-materials/:materialId/batches`
Obtener lotes de una materia prima

**Query Parameters:**
```typescript
interface BatchesQuery {
  status?: 'available' | 'reserved' | 'consumed' | 'expired';
  expired?: boolean;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface MaterialBatch {
  id: string;
  material_id: string;
  batch_number: string;
  supplier_batch_number?: string;
  quantity_received: number;
  quantity_available: number;
  quantity_reserved: number;
  unit_cost: number;
  received_date: string;
  expiration_date?: string;
  quality_status: 'pending' | 'approved' | 'rejected';
  quality_notes?: string;
  supplier_id: string;
  purchase_order_id?: string;
  storage_location: string;
  status: 'available' | 'reserved' | 'consumed' | 'expired';
  created_at: string;
  updated_at: string;
}
```

#### `POST /api/v1/raw-materials/:materialId/batches`
Registrar nuevo lote

**Request Body:**
```typescript
interface CreateBatch {
  batch_number: string;
  supplier_batch_number?: string;
  quantity_received: number;
  unit_cost: number;
  received_date: string;
  expiration_date?: string;
  supplier_id: string;
  purchase_order_id?: string;
  storage_location: string;
}
```

#### `PUT /api/v1/raw-materials/batches/:batchId/quality`
Actualizar estado de calidad del lote

**Request Body:**
```typescript
interface UpdateBatchQuality {
  quality_status: 'approved' | 'rejected';
  quality_notes?: string;
  tested_by: string;
  test_date: string;
}
```

### 📊 Movimientos de Inventario

#### `GET /api/v1/raw-materials/movements`
Obtener historial de movimientos

**Query Parameters:**
```typescript
interface MovementsQuery {
  material_id?: string;
  batch_id?: string;
  movement_type?: 'receipt' | 'consumption' | 'adjustment' | 'transfer';
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface MaterialMovement {
  id: string;
  material_id: string;
  batch_id?: string;
  movement_type: 'receipt' | 'consumption' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  reference_id?: string;     // ID de orden de producción, transferencia, etc.
  reference_type?: string;   // 'production_order', 'transfer', 'adjustment'
  storage_location_from?: string;
  storage_location_to?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}
```

#### `POST /api/v1/raw-materials/movements`
Registrar movimiento de inventario

**Request Body:**
```typescript
interface CreateMovement {
  material_id: string;
  batch_id?: string;
  movement_type: 'receipt' | 'consumption' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  reference_id?: string;
  reference_type?: string;
  storage_location_from?: string;
  storage_location_to?: string;
  notes?: string;
}
```

### 🚨 Alertas y Notificaciones

#### `GET /api/v1/raw-materials/alerts`
Obtener alertas activas

**Response:**
```typescript
interface MaterialAlert {
  id: string;
  material_id: string;
  material_name: string;
  alert_type: 'low_stock' | 'expired_batch' | 'expiring_soon' | 'quality_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}
```

#### `PUT /api/v1/raw-materials/alerts/:alertId/acknowledge`
Marcar alerta como reconocida

**Request Body:**
```typescript
interface AcknowledgeAlert {
  notes?: string;
}
```

### 🏢 Gestión de Proveedores

#### `GET /api/v1/raw-materials/suppliers`
Obtener lista de proveedores

**Response:**
```typescript
interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: number;      // Días de crédito
  lead_time_days: number;     // Tiempo de entrega
  rating: number;             // 1-5 estrellas
  status: 'active' | 'inactive';
  materials_supplied: string[]; // IDs de materiales
  created_at: string;
  updated_at: string;
}
```

## WebSocket Events

### Eventos Emitidos

#### `raw-material:stock-update`
```typescript
interface StockUpdateEvent {
  material_id: string;
  material_name: string;
  old_stock: number;
  new_stock: number;
  movement_type: string;
  timestamp: string;
}
```

#### `raw-material:alert`
```typescript
interface MaterialAlertEvent {
  alert: MaterialAlert;
  timestamp: string;
}
```

#### `raw-material:batch-expired`
```typescript
interface BatchExpiredEvent {
  batch_id: string;
  material_id: string;
  material_name: string;
  batch_number: string;
  quantity_affected: number;
  expiration_date: string;
  timestamp: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `RM001` | Materia prima no encontrada |
| `RM002` | Stock insuficiente |
| `RM003` | Lote no encontrado |
| `RM004` | Lote expirado |
| `RM005` | Lote ya consumido |
| `RM006` | Proveedor no encontrado |
| `RM007` | Código de material duplicado |
| `RM008` | Movimiento inválido |
| `RM009` | Ubicación de almacén no válida |
| `RM010` | Lote en cuarentena de calidad |

## Validaciones

### Reglas de Negocio
- El stock no puede ser negativo
- Los lotes expirados no pueden ser utilizados en producción
- Las materias primas discontinuadas no pueden recibir nuevos lotes
- Los movimientos de consumo requieren referencia a orden de producción
- Los ajustes de inventario requieren autorización de supervisor+

### Validaciones de Entrada
- Códigos de material deben ser únicos
- Cantidades deben ser números positivos
- Fechas de expiración deben ser futuras
- Ubicaciones de almacén deben existir en el sistema