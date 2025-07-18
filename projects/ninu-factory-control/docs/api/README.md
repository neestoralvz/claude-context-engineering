# API Documentation - Ninu Factory Control System

## Visión General

El sistema Ninu Factory Control expone una API REST completa y servicios WebSocket para el control integral de la planta de manufactura de productos de limpieza Ninu.mx.

## 🏗️ Arquitectura API

### Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://factory-api.ninu.mx/api/v1
```

### Autenticación
- **Método**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Roles**: `operator`, `supervisor`, `admin`

### Estructura de Respuesta Estándar
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 📋 Módulos Principales

### 1. 📦 Materia Prima (`/raw-materials`)
Control de inventarios de materias primas, gestión de proveedores y trazabilidad de lotes.

**Funcionalidades clave:**
- Gestión de inventario de materias primas
- Control de calidad de insumos
- Trazabilidad de lotes y proveedores
- Alertas de stock mínimo

### 2. ⚙️ Producción (`/production`) 
Control de procesos de manufactura, monitoreo de reactores y registro de batches.

**Funcionalidades clave:**
- Monitoreo de reactores químicos en tiempo real
- Control de formulaciones y batches
- Seguimiento de procesos de producción
- Control de calidad en línea

### 3. 📊 Evaluación de Desempeño (`/performance`)
KPIs de producción, análisis de eficiencia y reportes de rendimiento.

**Funcionalidades clave:**
- Métricas de eficiencia de producción
- Análisis de rendimiento por turno/operador
- KPIs de calidad y productividad
- Reportes automáticos de desempeño

### 4. 🛒 Órdenes de Compra (`/purchase-orders`)
Gestión de pedidos, flujos de aprobación y seguimiento de entregas.

**Funcionalidades clave:**
- Creación y gestión de órdenes de compra
- Workflow de aprobaciones
- Seguimiento de entregas y recepciones
- Integración con proveedores

### 5. 📋 Inventarios (`/inventory`)
Control de stock en tiempo real, ubicaciones y movimientos de almacén.

**Funcionalidades clave:**
- Control de stock en tiempo real
- Gestión de ubicaciones y almacenes
- Registro de movimientos y transferencias
- Reportes de inventario

## 🔄 WebSocket Events

### Conexión
```javascript
const socket = io('ws://localhost:3001', {
  auth: { token: jwt_token }
});
```

### Eventos Principales
- `reactor:status` - Estado de reactores en tiempo real
- `production:update` - Actualizaciones de producción
- `inventory:change` - Cambios en inventario
- `alert:critical` - Alertas críticas del sistema
- `quality:check` - Resultados de control de calidad

## 📚 Documentación Detallada

- [Raw Materials API](./raw-materials.md) - Gestión de materia prima
- [Production API](./production.md) - Control de producción
- [Performance API](./performance.md) - Evaluación de desempeño
- [Purchase Orders API](./purchase-orders.md) - Órdenes de compra
- [Inventory API](./inventory.md) - Control de inventarios
- [WebSocket Events](./websocket-events.md) - Eventos en tiempo real
- [Authentication](./authentication.md) - Sistema de autenticación
- [Error Handling](./error-handling.md) - Manejo de errores

## 🛡️ Seguridad

### Rate Limiting
- **General**: 100 requests/minuto por IP
- **Authentication**: 5 attempts/minuto por IP
- **WebSocket**: 1000 eventos/minuto por conexión

### Validación
- Validación de esquemas con Joi/Zod
- Sanitización de inputs
- Logging de todas las operaciones críticas

## 🔧 Estado de Implementación

| Módulo | API REST | WebSocket | Tests | Estado |
|--------|----------|-----------|-------|--------|
| Materia Prima | ⚠️ Planeado | ⚠️ Planeado | ❌ Pendiente | 🚧 En desarrollo |
| Producción | ✅ Básico | ✅ Básico | ✅ Parcial | 🚧 En desarrollo |
| Evaluación | ⚠️ Planeado | ⚠️ Planeado | ❌ Pendiente | 📋 Planeado |
| Órdenes Compra | ⚠️ Planeado | ⚠️ Planeado | ❌ Pendiente | 📋 Planeado |
| Inventarios | ⚠️ Planeado | ⚠️ Planeado | ❌ Pendiente | 📋 Planeado |

## 📖 Enlaces Útiles

- [Documentación de Arquitectura](../architecture/README.md)
- [Guía de Desarrollo](../development/getting-started.md)
- [Filosofía del Proyecto](../ideology/README.md)