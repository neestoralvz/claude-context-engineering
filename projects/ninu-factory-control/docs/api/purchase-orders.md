# Purchase Orders API - Órdenes de Compra

## Descripción

API para la gestión integral de órdenes de compra en la planta Ninu.mx, incluyendo creación de solicitudes, flujos de aprobación, seguimiento de entregas e integración con proveedores.

## Endpoints

### 🛒 Gestión de Órdenes de Compra

#### `GET /api/v1/purchase-orders`
Obtener lista de órdenes de compra

**Query Parameters:**
```typescript
interface PurchaseOrdersQuery {
  status?: 'draft' | 'pending_approval' | 'approved' | 'sent_to_supplier' | 'confirmed' | 'partial_received' | 'completed' | 'cancelled';
  supplier_id?: string;
  requester_id?: string;
  approver_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  date_from?: string;
  date_to?: string;
  department?: string;
  material_category?: string;
  amount_min?: number;
  amount_max?: number;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface PurchaseOrder {
  id: string;
  po_number: string;               // PO-2025-0001
  title: string;
  description?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_supplier' | 'confirmed' | 'partial_received' | 'completed' | 'cancelled';
  
  // Información del proveedor
  supplier: {
    id: string;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    payment_terms: number;         // Días de crédito
    delivery_time: number;         // Días estimados de entrega
  };
  
  // Información financiera
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;                // MXN, USD
  
  // Fechas importantes
  created_date: string;
  required_date: string;           // Fecha requerida de entrega
  approved_date?: string;
  sent_date?: string;
  estimated_delivery: string;
  actual_delivery?: string;
  
  // Workflow de aprobación
  requester: {
    id: string;
    name: string;
    department: string;
    email: string;
  };
  
  approval_workflow: ApprovalStep[];
  current_approval_step?: number;
  
  // Items de la orden
  items: PurchaseOrderItem[];
  
  // Control de recepción
  reception_status: 'pending' | 'partial' | 'complete';
  received_items: ReceivedItem[];
  
  // Archivos adjuntos
  attachments: Attachment[];
  
  // Notas y comentarios
  notes?: string;
  internal_notes?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}

interface PurchaseOrderItem {
  id: string;
  material_id: string;
  material_name: string;
  material_code: string;
  description: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  unit_of_measure: string;
  unit_price: number;
  total_price: number;
  
  // Especificaciones técnicas
  specifications?: string;
  quality_requirements?: string;
  
  // Fechas específicas del item
  required_date: string;
  delivery_date?: string;
  
  // Estado del item
  status: 'pending' | 'partial_received' | 'completed' | 'cancelled';
}

interface ApprovalStep {
  step_number: number;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approval_date?: string;
  comments?: string;
  spending_limit?: number;         // Límite de gasto para auto-aprobación
}
```

#### `POST /api/v1/purchase-orders`
Crear nueva orden de compra

**Request Body:**
```typescript
interface CreatePurchaseOrder {
  title: string;
  description?: string;
  supplier_id: string;
  required_date: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  items: CreatePurchaseOrderItem[];
  notes?: string;
  attachments?: string[];          // IDs de archivos subidos
}

interface CreatePurchaseOrderItem {
  material_id: string;
  quantity: number;
  unit_price?: number;             // Si no se proporciona, se usa precio del catálogo
  required_date?: string;          // Si no se proporciona, usa la fecha general
  specifications?: string;
  quality_requirements?: string;
}
```

#### `PUT /api/v1/purchase-orders/:poId`
Actualizar orden de compra (solo en estado draft)

#### `DELETE /api/v1/purchase-orders/:poId`
Cancelar orden de compra

### ✅ Flujo de Aprobaciones

#### `POST /api/v1/purchase-orders/:poId/submit-for-approval`
Enviar orden para aprobación

**Request Body:**
```typescript
interface SubmitForApproval {
  comments?: string;
  urgent_justification?: string;   // Requerido si priority = 'urgent'
}
```

#### `POST /api/v1/purchase-orders/:poId/approve`
Aprobar orden de compra

**Request Body:**
```typescript
interface ApprovePurchaseOrder {
  comments?: string;
  conditional_approval?: boolean;
  conditions?: string[];
  delegate_to?: string;            // ID de usuario para delegar
}
```

#### `POST /api/v1/purchase-orders/:poId/reject`
Rechazar orden de compra

**Request Body:**
```typescript
interface RejectPurchaseOrder {
  rejection_reason: string;
  suggestions?: string;
  return_to_requester: boolean;
}
```

#### `GET /api/v1/purchase-orders/pending-approval`
Obtener órdenes pendientes de aprobación para el usuario actual

### 📦 Gestión de Recepciones

#### `GET /api/v1/purchase-orders/:poId/receptions`
Obtener recepciones de una orden

**Response:**
```typescript
interface Reception {
  id: string;
  po_id: string;
  reception_number: string;        // REC-2025-0001
  reception_date: string;
  received_by: string;
  supplier_delivery_note?: string;
  
  items: ReceivedItem[];
  
  quality_inspection: {
    inspector_id: string;
    inspection_date: string;
    overall_status: 'pending' | 'approved' | 'rejected' | 'conditional';
    notes?: string;
    issues: QualityIssue[];
  };
  
  documents: {
    delivery_note?: string;
    invoice?: string;
    quality_certificates?: string[];
    photos?: string[];
  };
  
  status: 'draft' | 'confirmed' | 'quality_pending' | 'completed';
  created_at: string;
  updated_at: string;
}

interface ReceivedItem {
  po_item_id: string;
  material_id: string;
  material_name: string;
  quantity_received: number;
  unit_of_measure: string;
  
  // Control de calidad
  batch_number?: string;
  expiration_date?: string;
  quality_status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  quality_notes?: string;
  
  // Ubicación en almacén
  storage_location?: string;
  warehouse_section?: string;
  
  // Discrepancias
  discrepancy?: {
    type: 'quantity' | 'quality' | 'specification' | 'damage';
    description: string;
    photos?: string[];
    action_taken: string;
  };
}
```

#### `POST /api/v1/purchase-orders/:poId/receptions`
Registrar nueva recepción

**Request Body:**
```typescript
interface CreateReception {
  reception_date: string;
  supplier_delivery_note?: string;
  items: CreateReceivedItem[];
  notes?: string;
}

interface CreateReceivedItem {
  po_item_id: string;
  quantity_received: number;
  batch_number?: string;
  expiration_date?: string;
  storage_location?: string;
  condition: 'good' | 'damaged' | 'partial_damage';
  quality_issues?: string[];
  photos?: string[];
}
```

#### `PUT /api/v1/purchase-orders/receptions/:receptionId/quality-approval`
Aprobar/rechazar calidad de recepción

### 📊 Reportes y Análisis

#### `GET /api/v1/purchase-orders/analytics`
Obtener análisis de órdenes de compra

**Query Parameters:**
```typescript
interface PurchaseOrderAnalyticsQuery {
  period?: 'week' | 'month' | 'quarter' | 'year';
  date_from?: string;
  date_to?: string;
  supplier_id?: string;
  department?: string;
}
```

**Response:**
```typescript
interface PurchaseOrderAnalytics {
  summary: {
    total_orders: number;
    total_amount: number;
    average_order_value: number;
    
    orders_by_status: {
      [status: string]: number;
    };
    
    top_suppliers: SupplierSummary[];
    top_categories: CategorySummary[];
    
    delivery_performance: {
      on_time_deliveries: number;
      late_deliveries: number;
      average_delay_days: number;
      delivery_accuracy: number;      // %
    };
    
    approval_metrics: {
      average_approval_time: number;  // Horas
      auto_approved: number;
      manual_approved: number;
      rejected: number;
    };
  };
  
  trends: {
    monthly_spending: MonthlySpending[];
    category_trends: CategoryTrend[];
    supplier_performance: SupplierPerformance[];
  };
  
  cost_analysis: {
    spend_by_category: CategorySpend[];
    spend_by_supplier: SupplierSpend[];
    budget_vs_actual: BudgetComparison[];
  };
}
```

#### `GET /api/v1/purchase-orders/supplier-performance`
Análisis de desempeño de proveedores

**Response:**
```typescript
interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  
  metrics: {
    total_orders: number;
    total_amount: number;
    average_order_value: number;
    
    delivery_performance: {
      on_time_rate: number;          // %
      average_delay: number;         // Días
      quality_rejection_rate: number; // %
    };
    
    commercial_terms: {
      average_payment_terms: number; // Días
      discount_rate: number;         // %
      price_stability: number;       // Variación % precios
    };
    
    relationship_score: number;      // 1-100
    recommended: boolean;
  };
  
  recent_issues: SupplierIssue[];
  improvement_areas: string[];
  strengths: string[];
}
```

### 🔄 Integración con Proveedores

#### `GET /api/v1/purchase-orders/supplier-catalog/:supplierId`
Obtener catálogo de productos del proveedor

#### `POST /api/v1/purchase-orders/:poId/send-to-supplier`
Enviar orden al proveedor

**Request Body:**
```typescript
interface SendToSupplier {
  delivery_method: 'email' | 'portal' | 'fax' | 'manual';
  recipient_email?: string;
  custom_message?: string;
  include_attachments: boolean;
  request_confirmation: boolean;
}
```

#### `PUT /api/v1/purchase-orders/:poId/supplier-confirmation`
Registrar confirmación del proveedor

**Request Body:**
```typescript
interface SupplierConfirmation {
  confirmed: boolean;
  estimated_delivery_date?: string;
  supplier_order_number?: string;
  modifications?: ItemModification[];
  supplier_notes?: string;
}

interface ItemModification {
  po_item_id: string;
  proposed_quantity?: number;
  proposed_price?: number;
  proposed_delivery_date?: string;
  reason: string;
}
```

## WebSocket Events

### Eventos en Tiempo Real

#### `purchase-order:status-change`
```typescript
interface POStatusChangeEvent {
  po_id: string;
  po_number: string;
  old_status: string;
  new_status: string;
  updated_by: string;
  timestamp: string;
  requires_action: boolean;
  action_required_by?: string;
}
```

#### `purchase-order:approval-request`
```typescript
interface ApprovalRequestEvent {
  po_id: string;
  po_number: string;
  requester: string;
  approver_id: string;
  amount: number;
  priority: string;
  required_date: string;
  timestamp: string;
}
```

#### `purchase-order:delivery-update`
```typescript
interface DeliveryUpdateEvent {
  po_id: string;
  po_number: string;
  supplier_name: string;
  delivery_status: 'shipped' | 'in_transit' | 'delivered' | 'delayed';
  estimated_delivery?: string;
  tracking_number?: string;
  delay_reason?: string;
  timestamp: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `PO001` | Orden de compra no encontrada |
| `PO002` | Proveedor no válido |
| `PO003` | Material no disponible |
| `PO004` | Límite de gasto excedido |
| `PO005` | Aprobación requerida |
| `PO006` | Estado no permite modificación |
| `PO007` | Usuario no autorizado |
| `PO008` | Fecha de entrega inválida |
| `PO009` | Cantidad insuficiente |
| `PO010` | Proveedor inactivo |
| `PO011` | Presupuesto insuficiente |
| `PO012` | Especificaciones incompletas |

## Reglas de Negocio

### Aprobaciones Automáticas
- **≤ $10,000 MXN**: Aprobación automática del jefe de departamento
- **$10,001 - $50,000**: Requiere aprobación del gerente
- **$50,001 - $200,000**: Requiere aprobación del director
- **> $200,000**: Requiere aprobación del CEO

### Controles de Calidad
- Materias primas críticas requieren inspección al 100%
- Productos químicos requieren certificados de análisis
- Envases requieren inspección de muestras (10%)
- Todos los materiales COFEPRIS requieren certificación

### Flujo de Recepciones
1. Verificación de cantidad contra orden
2. Inspección visual de calidad
3. Pruebas de laboratorio (si aplica)
4. Aprobación de calidad
5. Ingreso a inventario
6. Cierre de orden (total o parcial)

### Escalaciones
- Órdenes urgentes: Notificación inmediata a aprobadores
- Retrasos > 3 días: Escalación automática
- Rechazos de calidad: Notificación a compras y calidad
- Presupuesto excedido: Bloqueo automático hasta aprobación