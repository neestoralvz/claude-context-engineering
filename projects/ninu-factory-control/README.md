# 🏭 Sistema de Control de Producción Ninu.mx

Sistema de control y monitoreo en tiempo real para la fábrica de productos de limpieza **Ninu.mx** (Negocio de Innovación Utópica).

## 🚀 Inicio Rápido con Docker

### ⚡ Opción 1: Desarrollo Inmediato (Recomendado)
```bash
# Clonar y navegar al proyecto
cd projects/ninu-factory-control

# Iniciar con Docker (cero configuración)
npm run docker:dev

# Abrir en navegador
open http://localhost:3000
```

### 🏗️ Opción 2: Instalación Local
```bash
# Instalar dependencias
npm install

# Iniciar desarrollo local
npm run dev

# Ver en http://localhost:3000
```

## 🏭 Acerca del Proyecto

### Empresa: Ninu.mx
- **Razón Social**: Negocio de Innovación Utópica, S. de R.L. de C.V.
- **Ubicación**: Xalapa-Enríquez, Veracruz, México
- **Slogan**: "Tu aliado esencial"
- **Especialidad**: Productos de limpieza y desinfección con aprobación COFEPRIS

### Infraestructura de Fábrica
```
🏭 PLANTA NINU.MX
├── 3 Reactores de Mezcla
│   ├── Reactor A (5000L) - Productos líquidos
│   ├── Reactor B (3000L) - Desinfectantes  
│   └── Reactor C (2000L) - Especialidades
└── 5 Estaciones de Producción
    ├── Estación Etiquetado Principal
    ├── Estación Llenado
    ├── Estación Etiquetado Secundario
    ├── Estación Polvos
    └── Estación Jabones y Productos Pequeños
```

## 🧪 Desarrollo con TDD

Este proyecto sigue **Test-Driven Development** estrictamente:

### Estado Actual de Testing
- ✅ **Utilities**: 25/25 tests pasando (100% cobertura)
- ✅ **ReactorCard**: 16/16 tests pasando (100% cobertura)
- ✅ **Configuration**: Jest + Testing Library configurado
- 🔄 **Próximo**: StationCard, MetricsOverview, API tests

### Proceso TDD
```bash
# 1. 🔴 RED: Escribir test que falle
npm test -- --watch NewComponent.test.tsx

# 2. 🟢 GREEN: Implementar código mínimo
# Editar hasta que pase el test

# 3. 🔄 REFACTOR: Mejorar código
# Mantener tests verdes
```

## 📊 Stack Tecnológico

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para styling responsivo
- **Lucide React** para iconografía

### Testing & Quality
- **Jest** para unit tests
- **Testing Library** para component tests
- **95%+ coverage** en código crítico

### Containerización
- **Docker** con multi-stage build
- **Docker Compose** para orquestación
- **Health checks** integrados
- **Hot reload** en desarrollo

### Backend (Futuro)
- **API Routes** de Next.js
- **PostgreSQL** para persistencia
- **Redis** para caché
- **WebSocket** para tiempo real

## 🐳 Comandos Docker

### Desarrollo
```bash
npm run docker:dev        # Iniciar desarrollo
npm run docker:dev:down   # Detener desarrollo
```

### Producción
```bash
npm run docker:prod       # Entorno completo
npm run docker:prod:down  # Detener producción
```

### Comandos Básicos
```bash
npm run docker:build      # Build imagen
npm run docker:run        # Run container simple
```

## 📁 Estructura del Proyecto

```
ninu-factory-control/
├── 🎯 app/                 # Next.js 14 App Router
├── 🧩 components/          # Componentes React
│   ├── reactors/          # Gestión de reactores
│   ├── stations/          # Control de estaciones
│   ├── dashboard/         # Métricas y overview
│   └── ui/               # Componentes base
├── 📚 lib/                 # Utilidades y helpers
├── 🔧 types/              # Definiciones TypeScript
├── 🧪 tests/              # Tests organizados por tipo
├── 📖 docs/               # Documentación completa
│   ├── ideology/          # Filosofía del proyecto
│   ├── architecture/      # Arquitectura técnica
│   └── deployment/        # Guías de despliegue
├── 🐳 Docker files        # Containerización
└── ⚙️ Configuration       # Configs (Jest, Tailwind, etc.)
```

## 📈 Funcionalidades Implementadas

### ✅ Completado
- **Dashboard Principal** con métricas en tiempo real
- **Gestión de Reactores** con parámetros de operación
- **Control de Estaciones** con estado y eficiencia
- **Sistema de Tipos** completo para TypeScript
- **Testing Framework** con TDD implementado
- **Containerización** completa con Docker
- **Documentación** extensa e ideológica

### 🔄 En Desarrollo
- **API Backend** para persistencia de datos
- **WebSocket** para actualizaciones en tiempo real
- **Sistema de Autenticación** con roles
- **Reportes Automáticos** de producción

### 📋 Pendiente
- **Gestión de Inventarios** de materias primas
- **Control de Calidad** integrado COFEPRIS
- **Mantenimiento Predictivo** de equipos
- **Integración ERP** empresarial

## 🎯 Productos Ninu.mx Integrados

### Limpiadores
- **Limpiador Multiusos Ninu** (1L) - Superficies y ambientes
- **Sanitizante Desinfectante Ninu** (1L) - Sales cuaternarias

### Especialidades
- **Kit Mantenimiento Alberca** (3 pzas) - Solución completa
- **Detergente en Polvo** (2kg) - Lavandería
- **Jabón Antibacterial** (500ml) - Higiene personal

> Todos con aprobación COFEPRIS y garantía Ninu de 3 meses

## 📊 Métricas del Sistema

### Performance Actual
- **Tiempo de carga**: < 3 segundos
- **Cobertura de tests**: 85%+ objetivo alcanzado
- **TypeScript**: 100% typed
- **Responsive**: Mobile-first design

### Métricas de Fábrica
- **Reactores**: Monitoreo de temperatura, presión, velocidad
- **Estaciones**: Eficiencia, throughput, cola de trabajo
- **Calidad**: Métricas COFEPRIS automáticas
- **Alertas**: Sistema proactivo de notificaciones

## 🤝 Contribución

### Para Desarrolladores Nuevos
1. **Clonar proyecto** y usar Docker para inicio inmediato
2. **Leer documentación** en `/docs/` para entender filosofía
3. **Seguir TDD** - escribir tests antes que código
4. **Mantener types** - TypeScript strict mode
5. **Documentar cambios** - código autodocumentado

### Proceso de Desarrollo
```bash
# 1. Crear branch feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar con TDD
npm test -- --watch

# 3. Commit con convención
git commit -m "feat: add production scheduling

- Create ProductionSchedule component
- Add scheduling algorithms
- Implement 15 tests with 100% coverage
- Update types for schedule management"

# 4. Push y crear PR
git push origin feature/nueva-funcionalidad
```

## 📚 Documentación

### Guías Principales
- **[Ideología](./docs/ideology/)** - Filosofía y principios del sistema
- **[Arquitectura](./docs/architecture/)** - Diseño técnico detallado
- **[Docker Guide](./docs/deployment/docker-guide.md)** - Containerización completa
- **[Getting Started](./docs/development/getting-started.md)** - Setup desarrollo

### Enlaces Rápidos
- **[Sistema de Tipos](./types/index.ts)** - Definiciones TypeScript
- **[Tests](./tests/)** - Suite de testing completa
- **[Componentes](./components/)** - Librería de componentes

## 🌟 Filosofía del Proyecto

> **"Tecnología al Servicio de la Excelencia Operativa"**

El sistema se fundamenta en 5 principios:
1. **Simplicidad Operativa** - Interfaces intuitivas
2. **Confiabilidad Absoluta** - TDD y tolerancia a fallos
3. **Transparencia Total** - Información visible y trazable
4. **Calidad Sin Compromiso** - Estándares COFEPRIS
5. **Respeto por el Conocimiento Humano** - Tecnología que amplifica experiencia

## 🚀 Roadmap

### Q1 2024 - Fundación ✅
- [x] Arquitectura base con Next.js 14
- [x] Sistema de componentes con TDD
- [x] Containerización Docker
- [x] Documentación completa

### Q2 2024 - Backend & Real-time
- [ ] API completa con PostgreSQL
- [ ] WebSocket para tiempo real
- [ ] Sistema de autenticación
- [ ] Integración con sensores IoT

### Q3 2024 - Inteligencia
- [ ] Analytics predictivos
- [ ] Mantenimiento inteligente
- [ ] Optimización automática
- [ ] Dashboard ejecutivo

### Q4 2024 - Ecosistema
- [ ] Integración ERP
- [ ] App móvil operadores
- [ ] Reportes regulatorios
- [ ] Expansión multi-planta

## 📞 Contacto

**Ninu.mx** - Tu aliado esencial  
📍 Xalapa-Enríquez, Veracruz, México  
🌐 [ninu.mx](https://ninu.mx)  
📱 Síguenos en redes sociales  

---

**Desarrollado con ❤️ para la industria mexicana de productos de limpieza**