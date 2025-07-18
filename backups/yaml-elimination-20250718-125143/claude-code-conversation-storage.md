# Claude Code Conversation Storage & Data Persistence

**CRITICAL**: Understanding how Claude Code handles conversation data, local storage, and data retention policies.

## ⚠️ Documentation Status

**IMPORTANT**: La documentación oficial de Claude Code **NO documenta explícitamente** el almacenamiento de conversaciones. Esta información proviene de:
- ✅ Herramientas verificables de la comunidad
- ✅ Issues confirmados en el repositorio oficial de GitHub
- ✅ Políticas generales de retención de datos de Anthropic
- ✅ Comportamiento observado y documentado por desarrolladores

## 📁 Almacenamiento Local

### **Ubicación de Conversaciones**
```bash
~/.claude/projects/
```
- **Formato**: Archivos JSONL (JSON Lines)
- **Persistencia**: Indefinida hasta eliminación manual
- **Estructura**: Un archivo por proyecto/conversación
- **Acceso**: Archivos de texto plano legibles

### **Herramientas de Extracción**
**CRÍTICO**: Claude Code **NO tiene función de exportación integrada**

**Herramientas de terceros verificadas**:
1. **`claude-conversation-extractor`**: Extrae logs limpios del almacenamiento interno
2. **`ccusage`**: Análisis de uso desde archivos JSONL locales  
3. **Claude Code History MCP Server**: Servidor MCP para análisis de historial
4. **Herramientas personalizadas**: Los archivos JSONL son parseables programáticamente

## 🔄 Arquitectura de Procesamiento

### **División Crítica: Local vs. Nube**

**Local** (`~/.claude/projects/`):
- ✅ Almacenamiento completo de conversaciones
- ✅ Persistencia indefinida
- ✅ Control total del usuario
- ✅ Sin limitaciones de retención

**Nube** (Servidores de Anthropic):
- ⚡ **TODO el procesamiento de IA** ocurre en la nube
- ⚡ **NO hay modelos locales** - Claude Code es un cliente
- ⚡ Transmisión selectiva de archivos leídos explícitamente
- ⚡ Sujeto a políticas de retención de datos

## 📋 Políticas de Retención de Datos

### **Servidores de Anthropic** (Datos en la nube)

**Conversaciones Estándar**:
- ⏱️ **30 días máximo** - Eliminación automática del backend
- 🗑️ **Eliminación inmediata** del historial de conversación visible

**Conversaciones con Violaciones de Políticas**:
- ⚠️ **Hasta 2 años** - Retención por violaciones de uso
- 📊 **Hasta 7 años** - Puntuaciones de confianza y seguridad

**Retroalimentación y Reportes de Bugs**:
- 📝 **10 años** - Datos retenidos cuando proporcionas feedback

**Zero Data Retention (ZDR)**:
- 🏢 **Clientes enterprise** pueden tener acuerdos especiales
- ⚖️ **Excepción**: Retención para cumplimiento de seguridad

### **Almacenamiento Local**
- 🔄 **Persistencia indefinida** hasta eliminación manual
- 💾 **Control completo** del usuario sobre archivos locales
- 📂 **Acceso directo** a archivos JSONL en `~/.claude/projects/`

## 🔒 Consideraciones de Privacidad y Seguridad

### **Flujo de Datos**
1. **Input del usuario** → Transmitido a servidores de Anthropic
2. **Procesamiento de IA** → Ocurre en la nube (NO localmente)
3. **Respuesta generada** → Enviada de vuelta al cliente
4. **Almacenamiento local** → Conversación completa guardada en JSONL

### **Transmisión Selectiva**
- ✅ **Solo archivos leídos explícitamente** se envían a servidores
- ✅ **Límites de directorio** - Solo acceso a carpeta actual y subcarpetas
- ⚠️ **Todo el contexto de conversación** se procesa en la nube

### **Seguridad Local**
- 🔐 Archivos JSONL almacenados con permisos de usuario estándar
- 📁 Ubicación predecible: `~/.claude/projects/`
- ⚠️ **Texto plano** - No encriptados localmente

## 🛠️ Gestión de Memoria vs. Conversaciones

### **Sistemas de Memoria** (Configuración)
```bash
# Memoria del proyecto (compartida en equipo)
./CLAUDE.md

# Memoria del usuario (preferencias personales)
~/.claude/CLAUDE.md

# Configuración local del proyecto
.claude/settings.local.json
```

### **Conversaciones** (Historial)
```bash
# Conversaciones completas (JSONL)
~/.claude/projects/[project-id]/conversation.jsonl
```

**CRÍTICO**: Los sistemas de memoria son para **configuración**, las conversaciones son **historial completo**.

## 📊 Análisis y Uso

### **Análisis de Uso Local**
```bash
# Herramientas disponibles
ccusage                    # Análisis de tokens y costos
claude-conversation-extractor  # Extracción de conversaciones
```

### **Integración MCP**
- **Claude Code History MCP**: Lectura de archivos de historial (.jsonl)
- **Servidores de memoria personalizados**: Memoria persistente entre conversaciones
- **Análisis programático**: Parseo directo de archivos JSONL

## ⚖️ Consideraciones Legales y Compliance

### **Responsabilidades del Usuario**
- 🔒 **Gestión local**: Control total sobre archivos en `~/.claude/projects/`
- 🗑️ **Eliminación**: Responsabilidad del usuario para cleanup local
- 📋 **Compliance**: Considerar políticas internas sobre retención de datos

### **Políticas de Anthropic**
- 📜 **Términos de servicio**: Aplican a procesamiento en la nube
- 🛡️ **Políticas de privacidad**: Rigen datos en servidores de Anthropic
- ⚖️ **Retención de datos**: Políticas específicas por tipo de uso

## 🚨 Recomendaciones Críticas

### **Para Usuarios Individuales**
1. ⚠️ **Consciencia**: Conversaciones se almacenan indefinidamente localmente
2. 🧹 **Limpieza periódica**: Considerar eliminación manual de archivos antiguos
3. 🔐 **Seguridad local**: Proteger acceso a `~/.claude/projects/`

### **Para Equipos y Empresas**
1. 📋 **Políticas de retención**: Establecer protocolos para archivos locales
2. 🔒 **Acceso controlado**: Gestionar permisos a directorios de Claude Code
3. 📊 **Auditoría**: Usar herramientas como `ccusage` para monitoreo de uso
4. ⚖️ **Compliance**: Revisar políticas internas vs. retención automática

## 🔗 Referencias y Fuentes

### **Herramientas de la Comunidad**
- [claude-conversation-extractor](https://github.com/ZeroSumQuant/claude-conversation-extractor)
- [ccusage](https://github.com/ryoppippi/ccusage)
- [Claude Code History MCP](https://lobehub.com/mcp/yudppp-claude-code-history-mcp)

### **Issues Oficiales**
- [GitHub Issue #1449](https://github.com/anthropics/claude-code/issues/1449) - Almacenamiento automático de historial

### **Documentación Relacionada**
- [Claude Code Memory Management](../claude-code-2025-features.md#memory-system)
- [Privacy and Security](../claude-code-permissions-system.md)
- [Data Handling Policies](https://www.anthropic.com/privacy)

---

**Última actualización**: Julio 2025  
**Estado**: Información verificada por fuentes de la comunidad (documentación oficial pendiente)