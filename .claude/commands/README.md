# Context Engineering Commands - Nueva Taxonomía

## Descripción
Sistema de comandos reorganizado según naturaleza funcional y nivel de abstracción. Cada categoría representa un nivel diferente de operación en el ecosistema Context Engineering.

## Estructura Taxonomica

### 📁 **[operacionales/](operacionales/)** (47 comandos)
**Comandos atómicos con responsabilidad única**
- **Función**: Acciones específicas (Qué)
- **Características**: Single responsibility, alta reutilización, building blocks
- **Complejidad**: 0.6-0.9 (mayoría)
- **Ejemplos**: `meta-core`, `explore`, `tdd`, `strategic-git`, `confidence`

### 📁 **[orquestadores/](orquestadores/)** (10 comandos)
**Coordinan múltiples operaciones en workflows estructurados**
- **Función**: Workflows coordinados (Cómo)
- **Características**: Chain múltiples comandos, workflows estructurados, coordinación de procesos
- **Complejidad**: 1.1-1.5
- **Ejemplos**: `discover`, `plan-flow`, `execute`, `verify-flow`, `doc-flow`

### 📁 **[comportamiento/](comportamiento/)** (11 comandos)
**Modifican comportamiento del sistema con inteligencia adaptativa**
- **Función**: Inteligencia adaptativa (Cuándo/Por qué)
- **Características**: Modificación de comportamiento, decisiones automáticas, triggers inteligentes
- **Complejidad**: 0.8-1.2
- **Ejemplos**: `decision`, `intelligent-fallback`, `dynamic-dependency-analysis`, `sync-docs`

### 📁 **[meta/](meta/)** (1 comando)
**Activación universal del ecosistema completo**
- **Función**: Orquestación universal (Todo)
- **Características**: Activación del ecosistema, orquestación universal, coordinación completa
- **Complejidad**: 2.0
- **Ejemplo**: `context-eng`

## Patrón de Composición

```
OPERACIONAL → ORQUESTADOR → COMPORTAMIENTO → META
   (Qué)   →    (Cómo)    →  (Cuándo/Por qué) → (Todo)
```

### Flujo de Activación
1. **META** → Activa todo el ecosistema
2. **COMPORTAMIENTO** → Determina qué hacer basado en condiciones
3. **ORQUESTADORES** → Coordinan workflows específicos
4. **OPERACIONALES** → Ejecutan acciones atómicas

## Niveles de Abstracción

### Nivel 1: Operacional
- **47 comandos** - Acciones específicas
- Building blocks fundamentales
- Funcionalidad atómica y reutilizable

### Nivel 2: Orquestación
- **10 comandos** - Workflows coordinados
- Estructuran múltiples operaciones
- Procesos organizados y predecibles

### Nivel 3: Comportamiento
- **11 comandos** - Inteligencia adaptativa
- Modifican comportamiento del sistema
- Decisiones automáticas basadas en contexto

### Nivel 4: Meta
- **1 comando** - Activación universal
- Orquesta todo el ecosistema
- Coordinación completa de 5 fases

## Ventajas de la Nueva Taxonomía

### 🎯 **Claridad Conceptual**
- Cada categoría tiene un propósito claro
- Separación de responsabilidades
- Fácil navegación y comprensión

### ⚡ **Eficiencia de Desarrollo**
- Comandos organizados por función
- Reutilización optimizada
- Composición inteligente

### 🔧 **Mantenibilidad**
- Estructura escalable
- Modificaciones localizadas
- Evolución controlada

### 🧠 **Comprensión Cognitiva**
- Mapa mental natural
- Jerarquía intuitiva
- Aprendizaje progresivo

## Navegación Rápida

| Categoría | Comandos | Función Principal |
|-----------|----------|------------------|
| **[operacionales](operacionales/)** | 47 | Acciones específicas |
| **[orquestadores](orquestadores/)** | 10 | Workflows coordinados |
| **[comportamiento](comportamiento/)** | 11 | Inteligencia adaptativa |
| **[meta](meta/)** | 1 | Orquestación universal |

## Migración desde Estructura Anterior

### Estructura Anterior (Temática)
- `01-core-intelligence/` → Distribuido según función
- `02-mathematical-verification/` → Principalmente operacionales
- `03-discovery-exploration/` → Mezclado operacionales/orquestadores
- `04-orchestration-flow/` → Distribuido según complejidad
- `05-context-optimization/` → Principalmente operacionales
- `06-system-architecture/` → Distribuido según función
- `07-development-methodology/` → Distribuido según función
- `08-automation-tools/` → Principalmente comportamiento

### Estructura Nueva (Funcional)
- Organización por naturaleza funcional
- Separación clara de responsabilidades
- Jerarquía de abstracción natural

## Archivo de Registro
La nueva taxonomía se refleja en el archivo de configuración:
- **Archivo**: `.claude/config/command-registry.json`
- **Versión**: 2.1.0
- **Categorías**: `operacionales`, `orquestadores`, `comportamiento`, `meta`

---

## 📂 Estructura Anterior (Referencia)

### **01-core-intelligence/** (7 comandos)
**Distribuidos**: operacionales (6) + meta (1)

### **02-mathematical-verification/** (13 comandos)
**Distribuidos**: operacionales (12) + orquestadores (1)

### **03-discovery-exploration/** (6 comandos)
**Distribuidos**: operacionales (4) + orquestadores (2)

### **04-orchestration-flow/** (10 comandos)
**Distribuidos**: operacionales (6) + orquestadores (2) + comportamiento (2)

### **05-context-optimization/** (5 comandos)
**Distribuidos**: operacionales (5)

### **06-system-architecture/** (12 comandos)
**Distribuidos**: operacionales (8) + orquestadores (2) + comportamiento (2)

### **07-development-methodology/** (7 comandos)
**Distribuidos**: operacionales (5) + orquestadores (2)

### **08-automation-tools/** (8 comandos)
**Distribuidos**: operacionales (2) + comportamiento (6)

---

**Nota**: Esta reorganización mejora la comprensión conceptual y facilita el desarrollo, mantenimiento y evolución del sistema Context Engineering mediante una estructura basada en naturaleza funcional en lugar de agrupación temática.