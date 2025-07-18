# Arquitectura del Sistema - Ninu.mx Factory Control

## 🏗️ Visión General de la Arquitectura

El **Sistema de Control de Producción Ninu.mx** sigue una arquitectura **modular, escalable y orientada a componentes**, diseñada para manejar las operaciones complejas de una fábrica de productos de limpieza en tiempo real.

## 📐 Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Reactors  │  │  Stations   │  │  Dashboard  │       │
│  │  Component  │  │ Component   │  │ Component   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (REST + WebSocket)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Reactor   │  │  Station    │  │  Metrics    │       │
│  │  Service    │  │  Service    │  │  Service    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Production  │  │   Quality   │  │ Inventory   │       │
│  │ Database    │  │  Database   │  │ Database    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Principios Arquitectónicos

### 1. **Separation of Concerns (Separación de Responsabilidades)**
Cada módulo tiene una responsabilidad específica y bien definida:

```typescript
// Ejemplo: Separación clara de responsabilidades
interface ReactorService {
  getReactorStatus(id: string): Promise<Reactor>
  updateReactorParameters(id: string, params: ReactorParams): Promise<void>
  startBatch(id: string, batch: Batch): Promise<void>
}

interface QualityService {
  validateBatch(batchId: string): Promise<QualityResult>
  recordQualityMetric(metric: QualityMetric): Promise<void>
}
```

### 2. **Single Source of Truth (Fuente Única de Verdad)**
Los datos críticos tienen una única fuente autorizada:

```typescript
// Estado centralizado para reactores
interface ReactorState {
  reactors: Record<string, Reactor>
  lastUpdated: Date
  connectionStatus: 'connected' | 'disconnected' | 'error'
}
```

### 3. **Fail-Safe Design (Diseño a Prueba de Fallos)**
El sistema continúa operando aunque fallen componentes individuales:

```typescript
// Error boundaries para componentes críticos
<ErrorBoundary fallback={<ReactorOfflineCard />}>
  <ReactorCard reactor={reactor} />
</ErrorBoundary>
```

## 🏭 Arquitectura de la Fábrica

### Mapeo de Infraestructura Física

```
NINU.MX FACTORY LAYOUT
┌─────────────────────────────────────────────────────────────┐
│                    ÁREA DE REACTORES                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Reactor A  │  │  Reactor B  │  │  Reactor C  │        │
│  │   (5000L)   │  │   (3000L)   │  │   (2000L)   │        │
│  │  Líquidos   │  │Desinfectante│  │Especialidades│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                 LÍNEA DE PRODUCCIÓN                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Etiquetado│ │ Llenado  │ │Etiquetado│ │  Polvos  │      │
│  │Principal │ │          │ │Secundario│ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                           │
│  ┌──────────┐                                             │
│  │ Jabones  │                                             │
│  │y Pequeños│                                             │
│  └──────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos en Tiempo Real

```
Sensores Físicos → Controllers → API Gateway → WebSocket → Frontend
     ↓                ↓             ↓           ↓          ↓
  Temperatura    Validación    Agregación   Broadcasting  Rendering
  Presión        Filtrado      Caching      Rate Limiting  Updates
  Velocidad      Alertas       Logging      Compression    UI State
```

## 🧩 Arquitectura de Componentes

### Jerarquía de Componentes Frontend

```
App Layout
├── Header (Navigation + Branding)
├── Main Dashboard
│   ├── MetricsOverview
│   │   ├── ProductionMetrics
│   │   ├── QualityMetrics
│   │   └── AlertSummary
│   ├── ReactorGrid
│   │   └── ReactorCard (x3)
│   │       ├── StatusBadge
│   │       ├── ParameterDisplay
│   │       ├── BatchInfo
│   │       └── ProgressBar
│   └── StationGrid
│       └── StationCard (x5)
│           ├── StatusBadge
│           ├── EfficiencyMeter
│           ├── ProductInfo
│           └── QueueStatus
└── Footer
```

### Patrón de Composición

```typescript
// Ejemplo: Composición flexible de componentes
interface ReactorCardProps {
  reactor: Reactor
  variant?: 'compact' | 'detailed' | 'minimal'
  showControls?: boolean
  onStatusChange?: (status: ReactorStatus) => void
}

// El componente se adapta según el contexto
<ReactorCard 
  reactor={reactor} 
  variant="compact"      // Vista general del dashboard
  showControls={false}   // Solo lectura en vista general
/>

<ReactorCard 
  reactor={reactor} 
  variant="detailed"     // Vista detallada individual
  showControls={true}    // Controles para operadores
  onStatusChange={handleStatusChange}
/>
```

## 📊 Gestión de Estado

### Estado Global vs Local

```typescript
// Estado Global (Compartido entre componentes)
interface GlobalState {
  factory: {
    reactors: ReactorState
    stations: StationState
    metrics: MetricsState
    alerts: AlertState
  }
  user: {
    profile: UserProfile
    permissions: Permission[]
    preferences: UserPreferences
  }
  system: {
    connectionStatus: ConnectionStatus
    lastSync: Date
    config: SystemConfig
  }
}

// Estado Local (Específico del componente)
interface ReactorCardState {
  isExpanded: boolean
  showDetails: boolean
  localParameters: Partial<ReactorParameters>
}
```

### Flujo de Datos Unidireccional

```
User Action → Event Handler → State Update → Component Re-render → UI Update
     ↓              ↓              ↓              ↓              ↓
Click Button   onClick()    setState()     React Cycle    Visual Change
```

## 🔄 Comunicación en Tiempo Real

### Arquitectura WebSocket

```typescript
// Cliente WebSocket
class FactoryWebSocketClient {
  private ws: WebSocket
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  connect() {
    this.ws = new WebSocket('ws://localhost:8080/factory-data')
    
    this.ws.onmessage = (event) => {
      const update: RealtimeUpdate = JSON.parse(event.data)
      this.handleUpdate(update)
    }
    
    this.ws.onclose = () => {
      this.attemptReconnect()
    }
  }

  private handleUpdate(update: RealtimeUpdate) {
    switch (update.type) {
      case 'reactor_status':
        updateReactorState(update.payload)
        break
      case 'station_status':
        updateStationState(update.payload)
        break
      case 'alert':
        showAlert(update.payload)
        break
    }
  }
}
```

### Estrategia de Caching

```typescript
// Cache inteligente para datos críticos
interface CacheStrategy {
  // Datos críticos: Cache corto, actualización frecuente
  reactorStatus: { ttl: 5000, updateInterval: 2000 }
  
  // Datos estables: Cache largo, actualización bajo demanda
  productCatalog: { ttl: 3600000, updateInterval: null }
  
  // Métricas: Cache medio, actualización programada
  productionMetrics: { ttl: 30000, updateInterval: 15000 }
}
```

## 🔒 Arquitectura de Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security (HTTPS, WSS, Firewall)          │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Authentication (JWT, OAuth, MFA)                  │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Authorization (RBAC, Permissions)                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Data Validation (Input sanitization, Types)      │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Audit Logging (Action tracking, Change logs)     │
└─────────────────────────────────────────────────────────────┘
```

### Modelo de Permisos

```typescript
// Sistema de roles basado en responsabilidades
enum UserRole {
  OPERATOR = 'operator',
  SUPERVISOR = 'supervisor', 
  QUALITY_MANAGER = 'quality_manager',
  PRODUCTION_MANAGER = 'production_manager',
  ADMIN = 'admin'
}

interface Permission {
  resource: 'reactors' | 'stations' | 'quality' | 'reports'
  actions: ('read' | 'write' | 'control' | 'approve')[]
}

// Ejemplo: Permisos de un operador
const operatorPermissions: Permission[] = [
  { resource: 'reactors', actions: ['read', 'control'] },
  { resource: 'stations', actions: ['read', 'control'] },
  { resource: 'quality', actions: ['read'] },
  { resource: 'reports', actions: ['read'] }
]
```

## 📈 Escalabilidad

### Arquitectura Horizontal

```typescript
// Microservicios escalables independientemente
interface ServiceArchitecture {
  services: {
    reactorService: { instances: 2, maxLoad: 1000 }
    stationService: { instances: 3, maxLoad: 1500 }
    metricsService: { instances: 1, maxLoad: 500 }
    alertService: { instances: 2, maxLoad: 2000 }
  }
  
  loadBalancer: {
    algorithm: 'round-robin'
    healthCheck: { interval: 30000, timeout: 5000 }
  }
}
```

### Optimización de Performance

```typescript
// Lazy loading para componentes pesados
const ReactorDetailModal = lazy(() => import('./ReactorDetailModal'))
const ReportsView = lazy(() => import('./ReportsView'))

// Memoización para evitar re-renders innecesarios
const ReactorCard = memo(({ reactor }: ReactorCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.reactor.status === nextProps.reactor.status &&
         prevProps.reactor.temperature === nextProps.reactor.temperature
})
```

## 🧪 Arquitectura de Testing

### Pirámide de Testing

```
                    ▲
                   / \
                  /   \
                 / E2E \     ← 10% (Integration tests)
                /       \
               /_________\
              /           \
             /             \
            / Integration   \   ← 20% (Component tests)
           /                 \
          /___________________\
         /                     \
        /                       \
       /        Unit Tests       \  ← 70% (Function tests)
      /_________________________\
```

### Estrategia de Testing

```typescript
// Unit Tests (70%): Funciones puras y lógica de negocio
describe('calculateEfficiency', () => {
  it('should calculate correct efficiency percentage', () => {
    expect(calculateEfficiency(80, 100)).toBe(80)
  })
})

// Component Tests (20%): Comportamiento de componentes
describe('ReactorCard', () => {
  it('should render reactor status correctly', () => {
    render(<ReactorCard reactor={mockReactor} />)
    expect(screen.getByText('Operando')).toBeInTheDocument()
  })
})

// Integration Tests (10%): Flujos completos
describe('Production Flow', () => {
  it('should complete full production cycle', async () => {
    // Test complete workflow from raw materials to finished product
  })
})
```

## 🔍 Observabilidad

### Métricas de Sistema

```typescript
interface SystemMetrics {
  performance: {
    responseTime: number        // < 200ms promedio
    throughput: number         // requests/second
    errorRate: number          // < 1%
    availability: number       // > 99.9%
  }
  
  business: {
    activeReactors: number
    productionRate: number
    qualityScore: number
    alertCount: number
  }
  
  infrastructure: {
    cpuUsage: number          // < 70%
    memoryUsage: number       // < 80%
    diskSpace: number         // < 85%
    networkLatency: number    // < 50ms
  }
}
```

### Logging Strategy

```typescript
// Structured logging para análisis automático
interface LogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  service: string
  action: string
  userId?: string
  reactorId?: string
  metadata: Record<string, any>
}

// Ejemplo de log estructurado
log.info('reactor_status_changed', {
  reactorId: 'reactor-001',
  previousStatus: 'mixing',
  newStatus: 'completed',
  batchId: 'batch-12345',
  operatorId: 'user-789',
  duration: 7200000 // 2 hours in milliseconds
})
```

## 🎯 Patrones de Diseño Aplicados

### 1. **Observer Pattern** - Para actualizaciones en tiempo real
```typescript
class ReactorStatusObserver {
  private subscribers: Array<(status: ReactorStatus) => void> = []
  
  subscribe(callback: (status: ReactorStatus) => void) {
    this.subscribers.push(callback)
  }
  
  notify(status: ReactorStatus) {
    this.subscribers.forEach(callback => callback(status))
  }
}
```

### 2. **Factory Pattern** - Para creación de componentes
```typescript
class ComponentFactory {
  static createCard(type: 'reactor' | 'station', data: any) {
    switch (type) {
      case 'reactor': return <ReactorCard reactor={data} />
      case 'station': return <StationCard station={data} />
    }
  }
}
```

### 3. **Strategy Pattern** - Para diferentes algoritmos de optimización
```typescript
interface OptimizationStrategy {
  optimize(parameters: ProductionParameters): OptimizationResult
}

class EfficiencyOptimizer implements OptimizationStrategy {
  optimize(parameters: ProductionParameters): OptimizationResult {
    // Optimization logic for efficiency
  }
}
```

---

## 🏁 Conclusión Arquitectónica

La arquitectura del **Sistema de Control de Producción Ninu.mx** está diseñada para ser:

- **🔒 Segura**: Múltiples capas de seguridad protegen datos críticos
- **📈 Escalable**: Crecimiento horizontal sin degradación de performance  
- **🔧 Mantenible**: Código modular y bien documentado
- **🚀 Performante**: Optimizada para respuesta en tiempo real
- **🧪 Testeable**: Cobertura completa con tests automatizados
- **👥 Usable**: Interfaz intuitiva para operadores de fábrica

Esta arquitectura sólida proporciona la base técnica para que Ninu.mx alcance sus objetivos de excelencia operativa y crecimiento sostenible.