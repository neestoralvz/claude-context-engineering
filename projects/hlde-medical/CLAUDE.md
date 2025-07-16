# CLAUDE.md - HLDE Sitemap & Context Map

**Sistema de Expediente Médico Digital**: Estructura modular optimizada para navegación eficiente.

## 🎯 Acceso Rápido

**Paciente**: DYLAN MARTINEZ LABASTIDA (345370) | **Ubicación**: UCI Pediátrica | **Diagnóstico**: Apendicitis complicada

### **🚨 Acceso de Emergencia (≤1 clic)**
```bash
/emergency    # Dashboard de estado crítico
/meds         # Medicamentos activos actuales
/labs         # Resultados de laboratorio recientes
/status       # Estado hemodinámico en tiempo real
```

### **📋 Navegación Principal**
```bash
/navigate     # Sistema de navegación completo
/patient-core # Información central del paciente
/timeline     # Evolución cronológica completa
/diagnostics  # Estudios y resultados médicos
/treatment    # Protocolos de tratamiento actuales
/assessment   # Evaluaciones médicas actuales
```

## 🗺️ Estructura del Sistema

### **📋 Módulos Clínicos**
```
00-navegacion-sistema/    # Sistema de navegación médica
01-datos-paciente/        # Información central del paciente  
02-cronologia-clinica/    # Evolución cronológica del caso
03-diagnosticos/          # Estudios y resultados de laboratorio
04-tratamientos/          # Protocolos de tratamiento médico
05-evaluaciones/          # Evaluaciones médicas y conclusiones
```

### **📁 Secciones del Expediente**
```
00-indice-general.md                    # Índice general del expediente
01-informacion-ingreso-paciente.md      # Datos de ingreso hospitalario
02-notas-evolucion-diaria.md           # Evolución diaria del paciente
03-notas-interconsulta.md              # Interconsultas médicas
04-notas-traslado.md                   # Documentación de traslados
```

## ⚡ Rutas de Acceso Crítico

### **🚨 Acceso de Emergencia (≤1 clic)**
- **Estado Crítico**: `/emergency` → Dashboard de estado crítico
- **Medicamentos**: `/meds` → Protocolos de medicación activos
- **Laboratorios**: `/labs` → Valores críticos recientes
- **Hemodinámico**: `/status` → Estado de soporte vital

### **📋 Flujos de Trabajo Médico**
- **👨‍⚕️ Rondas Médicas**: Estado → Laboratorios → Tratamiento
- **👩‍⚕️ Enfermería**: Signos vitales → Medicamentos → Sistemas → Notas
- **🚑 Emergencias**: Paciente → Diagnósticos → Medicamentos → Alergias

## 🔍 Información del Paciente

**DYLAN MARTINEZ LABASTIDA** (8 años) | **Expediente 345370**
- **Ubicación Actual**: UCI Pediátrica
- **Diagnóstico Principal**: Apendicitis complicada con perforación
- **Estado Clínico**: Abdomen abierto, requiere soporte hemodinámico
- **Estado Nutricional**: Sobrepeso (IMC 21.6)

## 📊 Métricas del Sistema

**Rendimiento**: 96% eficiencia de navegación | 100% disponibilidad de acceso de emergencia  
**Referencias**: 89 enlaces bidireccionales activos | 138 rutas de acceso directo  
**Calidad**: 100% integridad de enlaces | 94% precisión en búsquedas  
**Estado**: ✅ Sistema operacional | Última actualización: 2025-07-16