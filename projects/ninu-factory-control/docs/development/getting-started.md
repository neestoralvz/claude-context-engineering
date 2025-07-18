# Guía de Inicio - Desarrollo del Sistema Ninu.mx

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

```bash
# Node.js 18+ y npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Git para control de versiones
git --version

# Editor recomendado: VS Code con extensiones
code --version
```

### Extensiones Recomendadas para VS Code

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "orta.vscode-jest",
    "ms-vscode.vscode-json"
  ]
}
```

## 📥 Instalación del Proyecto

### 1. Clonar y Configurar

```bash
# Navegar al directorio del proyecto
cd /Users/nalve/claude-context-engineering/projects/ninu-factory-control

# Instalar dependencias
npm install

# Verificar que no hay errores de instalación
npm audit
```

### 2. Configuración de Variables de Entorno

```bash
# Crear archivo de configuración local
cp .env.example .env.local

# Editar variables de entorno
nano .env.local
```

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/ninu_factory
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Configuración de Base de Datos (Pendiente)

```bash
# Una vez implementada la BD
npm run db:setup
npm run db:migrate
npm run db:seed
```

## 🛠️ Comandos de Desarrollo

### Comandos Principales

```bash
# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000

# Ejecutar tests en modo watch
npm run test:watch

# Verificar cobertura de tests
npm run test:coverage

# Linting y formateo
npm run lint
npm run lint:fix

# Build para producción
npm run build
npm start
```

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- ReactorCard
npm test -- tests/utils/

# Tests con verbose output
npm test -- --verbose

# Tests con cobertura detallada
npm run test:coverage -- --verbose
```

## 🧪 Flujo de Desarrollo TDD

### Ciclo Red-Green-Refactor

```bash
# 1. 🔴 RED: Escribir test que falla
npm test -- --watch NewComponent.test.tsx

# 2. 🟢 GREEN: Implementar código mínimo
# Editar componente hasta que el test pase

# 3. 🔄 REFACTOR: Mejorar código
# Mantener tests verdes mientras mejoras
```

### Ejemplo Práctico TDD

```typescript
// 1. RED: Escribir test primero
describe('ProductionOrderCard', () => {
  it('should render order status correctly', () => {
    const order = createMockOrder({ status: 'pending' })
    render(<ProductionOrderCard order={order} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })
})

// 2. GREEN: Implementar componente básico
export function ProductionOrderCard({ order }: { order: ProductionOrder }) {
  return <div>{order.status === 'pending' ? 'Pendiente' : 'Otro'}</div>
}

// 3. REFACTOR: Mejorar implementación
export function ProductionOrderCard({ order }: ProductionOrderCardProps) {
  const statusText = getStatusText(order.status)
  const statusColor = getStatusColor(order.status)
  
  return (
    <Card className="production-order-card">
      <Badge variant="status" className={statusColor}>
        {statusText}
      </Badge>
      {/* Más elementos del diseño */}
    </Card>
  )
}
```

## 📁 Estructura del Proyecto

### Organización de Archivos

```
ninu-factory-control/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página home
│   └── api/               # API routes (pendiente)
├── components/            # Componentes React
│   ├── reactors/         # Componentes de reactores
│   ├── stations/         # Componentes de estaciones
│   ├── dashboard/        # Dashboard principal
│   └── ui/               # Componentes UI base
├── lib/                  # Utilidades y configuración
│   ├── utils.ts          # Funciones utilitarias
│   └── mock-data.ts      # Datos de prueba
├── types/                # Definiciones TypeScript
│   └── index.ts          # Tipos principales
├── tests/                # Tests organizados
│   ├── utils/            # Tests de utilidades
│   └── components/       # Tests de componentes
├── docs/                 # Documentación
│   ├── ideology/         # Filosofía del proyecto
│   ├── architecture/     # Arquitectura técnica
│   └── development/      # Guías de desarrollo
└── public/               # Assets estáticos
```

### Convenciones de Nomenclatura

```typescript
// Archivos y directorios: kebab-case
reactor-card.tsx
production-metrics.ts

// Componentes: PascalCase
ReactorCard
ProductionMetrics

// Variables y funciones: camelCase
const currentStatus = reactor.status
function calculateEfficiency() {}

// Constantes: SCREAMING_SNAKE_CASE
const MAX_REACTOR_TEMPERATURE = 100
const API_ENDPOINTS = {...}

// Tipos e interfaces: PascalCase
interface ReactorStatus {}
type ProductionMetrics = {}
```

## 🔧 Estándares de Código

### TypeScript

```typescript
// ✅ Buenas prácticas
interface ReactorCardProps {
  reactor: Reactor
  variant?: 'compact' | 'detailed'
  onStatusChange?: (status: ReactorStatus) => void
}

// Usar tipos específicos, no 'any'
function updateReactor(id: string, updates: Partial<Reactor>): Promise<Reactor> {
  // Implementation
}

// ❌ Evitar
function updateReactor(id: any, updates: any): any {
  // Avoid any types
}
```

### React Components

```typescript
// ✅ Componente bien estructurado
interface ComponentProps {
  // Props tipadas
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks al inicio
  const [state, setState] = useState()
  const memoizedValue = useMemo(() => computation, [deps])
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [deps])
  
  // Early returns para validación
  if (!data) return <LoadingSpinner />
  
  // JSX principal
  return (
    <div className="component">
      {/* Content */}
    </div>
  )
}
```

### CSS/Tailwind

```typescript
// ✅ Clases organizadas y legibles
const cardClasses = cn(
  // Layout
  "flex flex-col p-6",
  // Appearance
  "bg-white rounded-lg shadow-sm border",
  // Interactive
  "hover:shadow-md transition-shadow",
  // Conditional
  isActive && "border-blue-500",
  className
)

// ❌ Evitar clases muy largas en JSX
<div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
```

## 📊 Testing

### Estrategia de Testing

```typescript
// Test de utilidades (70% de tests)
describe('calculateEfficiency', () => {
  it('should return correct percentage', () => {
    expect(calculateEfficiency(80, 100)).toBe(80)
  })
  
  it('should handle edge cases', () => {
    expect(calculateEfficiency(0, 100)).toBe(0)
    expect(calculateEfficiency(120, 100)).toBe(120)
  })
})

// Test de componentes (20% de tests)  
describe('ReactorCard', () => {
  it('should render reactor information', () => {
    const reactor = createMockReactor()
    render(<ReactorCard reactor={reactor} />)
    
    expect(screen.getByText(reactor.name)).toBeInTheDocument()
    expect(screen.getByText(/temperatura/i)).toBeInTheDocument()
  })
})

// Test de integración (10% de tests)
describe('Production Workflow', () => {
  it('should handle complete production cycle', async () => {
    // Test full user workflow
  })
})
```

### Factories de Datos de Prueba

```typescript
// Usar factories para datos consistentes
export const createMockReactor = (overrides = {}) => ({
  id: 'reactor-001',
  name: 'Reactor A',
  status: 'idle' as const,
  capacity: 5000,
  temperature: 25,
  pressure: 1.0,
  mixingSpeed: 0,
  lastMaintenance: new Date('2024-01-01'),
  nextMaintenance: new Date('2024-02-01'),
  ...overrides
})

// Uso en tests
const activeReactor = createMockReactor({ 
  status: 'mixing',
  temperature: 45 
})
```

## 🚀 Deployment

### Build Local

```bash
# Verificar que el build funciona
npm run build

# Probar build localmente
npm start

# Verificar en http://localhost:3000
```

### Verificaciones Pre-Deploy

```bash
# Todos los tests pasan
npm test

# No hay errores de linting
npm run lint

# Build exitoso
npm run build

# No hay vulnerabilidades críticas
npm audit --audit-level=moderate
```

## 🔍 Debugging

### Herramientas de Debug

```bash
# React Developer Tools (Browser extension)
# Permite inspeccionar estado de componentes

# VS Code Debugger
# Configuración en .vscode/launch.json
{
  "type": "node",
  "request": "launch", 
  "name": "Debug Next.js",
  "program": "${workspaceFolder}/node_modules/.bin/next",
  "args": ["dev"],
  "console": "integratedTerminal"
}
```

### Logging Efectivo

```typescript
// Desarrollo: Console logs estructurados
console.group('Reactor Status Update')
console.log('Reactor ID:', reactorId)
console.log('Previous Status:', previousStatus)
console.log('New Status:', newStatus)
console.log('Timestamp:', new Date().toISOString())
console.groupEnd()

// Producción: Structured logging
logger.info('reactor_status_changed', {
  reactorId,
  previousStatus,
  newStatus,
  operatorId,
  timestamp: Date.now()
})
```

## 🤝 Colaboración

### Git Workflow

```bash
# Feature branches desde main
git checkout main
git pull origin main
git checkout -b feature/production-orders

# Commits descriptivos
git add .
git commit -m "feat: add production order management

- Create ProductionOrderCard component
- Add order status tracking
- Implement TDD with 12 passing tests
- Update types for order management"

# Push y crear PR
git push origin feature/production-orders
# Crear PR en GitHub
```

### Code Review Checklist

- [ ] ✅ **Tests**: Todos los tests pasan
- [ ] ✅ **Tipos**: TypeScript sin errores
- [ ] ✅ **Estilo**: Código formateado consistentemente  
- [ ] ✅ **Performance**: No renderizados innecesarios
- [ ] ✅ **Accesibilidad**: Componentes accesibles
- [ ] ✅ **Documentación**: Código autodocumentado

## 🎯 Próximos Pasos

### Para Nuevos Desarrolladores

1. **Configurar entorno** siguiendo esta guía
2. **Ejecutar tests existentes** para familiarizarse
3. **Crear primer componente** usando TDD
4. **Revisar documentación** de arquitectura e ideología
5. **Contribuir** con mejoras incrementales

### Tareas Inmediatas

```bash
# Issues prioritarios en GitHub
- Fix Jest configuration warning
- Complete StationCard tests  
- Implement API layer
- Add error boundaries
- Create WebSocket connection
```

---

¡Bienvenido al equipo de desarrollo del **Sistema de Control de Producción Ninu.mx**! Este proyecto combina excelencia técnica con impacto real en la industria mexicana de productos de limpieza.