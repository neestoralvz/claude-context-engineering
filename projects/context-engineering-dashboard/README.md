# Context Engineering Dashboard

Dashboard interactivo que consume la metodología Context Engineering para proporcionar una interfaz de usuario moderna, funcional y analítica.

## 🎯 Propósito

Este dashboard sirve como centro de control y herramienta analítica para la metodología Context Engineering, proporcionando:

- **Interfaz Interactiva**: Exploración visual de comandos y principios
- **Simulador de Comandos**: Prueba de comandos en tiempo real
- **Dashboard de Métricas**: Visualización de rendimiento del sistema
- **Guía de Navegación**: Mapas interactivos del ecosistema

## 🏗️ Arquitectura

### Estructura del Proyecto
```
projects/context-engineering-dashboard/
├── app/                    # App Router (Next.js 14)
├── src/                    # Componentes React
│   ├── components/         # Componentes reutilizables
│   ├── lib/               # Utilidades y tipos
│   └── logging/           # Sistema de logging
├── public/                # Assets estáticos
├── package.json           # Dependencias específicas
└── README.md              # Documentación del proyecto
```

### Tecnologías Utilizadas
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos
- **Lucide React**: Sistema de iconos
- **Class Variance Authority**: Gestión de variantes de componentes

## 🚀 Desarrollo

### Instalación
```bash
# Desde la raíz del proyecto
npm install

# O específicamente para context-engineering-dashboard
npm install --workspace=projects/context-engineering-dashboard
```

### Comandos Disponibles
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start

# Linting
npm run lint
```

## 📊 Características

### Componentes Principales
- **PhilosophicalCore**: Visualización de principios fundamentales
- **CommandSimulator**: Simulador interactivo de comandos
- **LiveMetricsDashboard**: Métricas en tiempo real
- **DecisionEngineVisualization**: Visualización del motor de decisiones
- **ProgressiveThinkingDemo**: Demostración de pensamiento progresivo

### Integración con Context Engineering
El dashboard consume directamente la metodología Context Engineering desde la raíz del proyecto:

- **Comandos**: Lee de `.claude/commands/`
- **Principios**: Lee de `docs/principles/`
- **Métricas**: Integra con `scripts/core/`
- **Documentación**: Sincroniza con `CLAUDE.md`

## 🔄 Auto-contenido

Este proyecto es completamente auto-contenido:
- ✅ Dependencias específicas en `package.json`
- ✅ Configuración Next.js independiente
- ✅ Sistema de build independiente
- ✅ Deploy independiente
- ✅ Ciclo de vida independiente

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Configurar para deploy desde subdirectorio
vercel --cwd projects/context-engineering-dashboard
```

### Otras Plataformas
El proyecto puede desplegarse en cualquier plataforma que soporte Next.js.

## 📝 Contribución

Para contribuir a este proyecto:

1. Mantener la independencia del proyecto
2. Seguir las convenciones de la metodología Context Engineering
3. Actualizar documentación cuando sea necesario
4. Asegurar que los cambios no afecten otros projects

## 📄 Licencia

Este proyecto forma parte del ecosistema Context Engineering y sigue las mismas políticas de licencia.