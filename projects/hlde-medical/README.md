# HLDE - Sistema de Expediente Médico Digital

Sistema completo de expediente médico digital desarrollado usando la metodología Context Engineering.

## 🎯 Propósito

HLDE (Sistema de Expediente Médico Digital) es una implementación especializada que utiliza Context Engineering para proporcionar:

- **Navegación Médica Optimizada**: Acceso rápido a información crítica
- **Módulos Clínicos Organizados**: Estructura modular para datos médicos
- **Interfaz de Emergencia**: Acceso ≤1 clic para situaciones críticas
- **Documentación Completa**: Expediente médico integral y navegable

## 🏥 Información del Paciente

**Paciente**: DYLAN MARTINEZ LABASTIDA (8 años)
**Expediente**: 345370
**Ubicación**: UCI Pediátrica
**Diagnóstico**: Apendicitis complicada con perforación

## 🏗️ Arquitectura

### Estructura del Proyecto
```
projects/hlde-medical/
├── docs/                   # Documentación VitePress
│   ├── .vitepress/         # Configuración VitePress
│   ├── modulos-clinicos/   # Módulos médicos organizados
│   ├── guides/            # Guías de implementación
│   └── outputs/           # Análisis y reportes
├── medical-docs/          # Documentación médica específica
├── config/               # Configuraciones del sistema
├── package.json          # Dependencias específicas
└── README.md             # Documentación del proyecto
```

### Módulos Clínicos

#### 00 - Sistema de Navegación
- **Panel de Acceso Rápido**: Información crítica ≤1 clic
- **Índice Maestro**: Navegación completa del expediente
- **Guía de Búsqueda**: Sistema de búsqueda optimizado
- **Referencias Cruzadas**: Enlaces bidireccionales

#### 01 - Datos del Paciente
- **Perfil Demográfico**: Información básica del paciente
- **Datos de Ingreso**: Información hospitalaria

#### 02 - Cronología Clínica
- **Progresión Cronológica**: Evolución temporal del caso
- **Línea de Tiempo**: Eventos médicos ordenados

#### 03 - Diagnósticos
- **Estudios de Imagen**: Resultados radiológicos
- **Resultados de Laboratorio**: Análisis clínicos

#### 04 - Tratamientos
- **Protocolos de Medicación**: Tratamientos farmacológicos
- **Procedimientos Quirúrgicos**: Intervenciones realizadas
- **Cuidados de Soporte**: Atención especializada

#### 05 - Evaluaciones
- **Estado Actual**: Condición médica presente
- **Notas de Evolución**: Progreso del paciente
- **Conclusiones Diagnósticas**: Evaluaciones finales

## 🚀 Desarrollo

### Instalación
```bash
# Desde la raíz del proyecto
npm install

# O específicamente para hlde-medical
npm install --workspace=projects/hlde-medical
```

### Comandos Disponibles
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview

# Deploy
npm run deploy

# Servidor local
npm run serve
```

## 📊 Características

### Navegación Optimizada
- **Acceso de Emergencia**: Información crítica en ≤1 clic
- **Flujos de Trabajo Médicos**: Optimizado para rondas, enfermería, emergencias
- **Búsqueda Inteligente**: Sistema de búsqueda con referencias cruzadas

### Integración con Context Engineering
El sistema utiliza los principios de Context Engineering:

- **Navegación Eficiente**: ≤3 pasos a cualquier destino
- **Carga Lazy**: Información cargada bajo demanda
- **Contexto Optimizado**: Reducción del 80% en carga cognitiva
- **Documentación Viva**: Actualización automática basada en uso

## 🔄 Auto-contenido

Este proyecto es completamente auto-contenido:
- ✅ Dependencias específicas en `package.json`
- ✅ Configuración VitePress independiente
- ✅ Sistema de build independiente
- ✅ Deploy independiente
- ✅ Contenido médico específico

## 🚀 Deploy

### GitHub Pages
```bash
npm run deploy
```

### Netlify
```bash
npm run build
# Deploy desde docs/.vitepress/dist
```

### Vercel
```bash
vercel --cwd projects/hlde-medical
```

## 🏥 Flujos de Trabajo Médicos

### Rondas Médicas
1. **Estado Actual** → **Laboratorios** → **Tratamiento**
2. Navegación optimizada para evaluación rápida

### Enfermería
1. **Signos Vitales** → **Medicamentos** → **Sistemas** → **Notas**
2. Acceso directo a información de cuidado

### Emergencias
1. **Paciente** → **Diagnósticos** → **Medicamentos** → **Alergias**
2. Información crítica en ≤1 clik

## 📝 Contribución

Para contribuir a este proyecto:

1. Mantener la independencia del proyecto
2. Seguir convenciones médicas establecidas
3. Actualizar módulos clínicos cuando sea necesario
4. Asegurar navegación ≤3 pasos

## 📄 Licencia

Este proyecto forma parte del ecosistema Context Engineering y sigue las mismas políticas de licencia.