# Configuración del Sistema de Cross-References
## Expediente Medical - Dylan Antonio Martínez Labastida

### Información del Sistema
- **Implementado:** 2025-07-16
- **Tipo:** Sistema de navegación cruzada Pandoc/Markdown
- **Propósito:** Facilitar navegación fluida entre secciones del expediente médico
- **Compatibilidad:** Pandoc PDF, lectores Markdown, navegadores web

---

## 📋 Estructura de Archivos y Referencias

### Archivos del Expediente
1. **00-indice-general.md** - Índice principal con navegación completa
2. **01-informacion-ingreso-paciente.md** - Datos del paciente, estudios iniciales
3. **02-notas-evolucion-diaria.md** - Evolución en UCI (07.07.25-14.07.25)
4. **03-notas-interconsulta.md** - Valoraciones especialidades
5. **04-notas-traslado.md** - Documentación traslado a UCI

### Sistema de Anclas Semánticas

#### Tipos de Anclas Implementadas:
- **Diagnósticos**: `#diagnostico-[nombre]`
- **Procedimientos**: `#procedimiento-[nombre]`
- **Fechas**: `#fecha-[dd-mm-aa]`
- **Médicos**: `#dr-[apellido]` / `#dra-[apellido]`
- **Medicamentos**: `#medicamento-[nombre]`
- **Estudios**: `#estudio-[tipo]-[fecha]`
- **Sistemas**: `#sistema-[nombre]`
- **Equipos**: `#equipo-[especialidad]`

---

## 🔗 Mapa de Referencias Cruzadas

### Referencias Cronológicas
```
23.06.25 (Inicio síntomas)
   ↓
26.06.25 (Agudización) 
   ↓
27.06.25 (Apendicectomía - Santa María)
   ↓
04.07.25 (Traslado HG Huauchinango)
   ↓
06.07.25 (Ingreso HNP - Carro Rojo)
   ↓
07.07.25 (Traslado UCI)
   ↓
07.07.25-14.07.25 (Evolución UCI)
```

### Referencias por Diagnóstico Principal

#### 1. Perforación Intestinal
- **Origen**: `03-notas-interconsulta.md#perforacion-intestinal`
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-gastrometabolico`
- **Evolución**: `02-notas-evolucion-diaria.md#abdomen-abierto`

#### 2. Abdomen Abierto
- **Diagnóstico**: `00-indice-general.md#diagnostico-abdomen-abierto`
- **Manejo UCI**: `02-notas-evolucion-diaria.md#abdomen-abierto-manejo`
- **Sistema aspiración**: `02-notas-evolucion-diaria.md#aspiracion-artesanal`

#### 3. Sepsis Abdominal
- **Ingreso**: `01-informacion-ingreso-paciente.md#sepsis-abdominal-diagnostico`
- **Tratamiento**: `02-notas-evolucion-diaria.md#tratamiento-sepsis`
- **Antibióticos**: `02-notas-evolucion-diaria.md#esquema-antibiotico`

#### 4. Fístula Enterocutánea
- **Diagnóstico**: `01-informacion-ingreso-paciente.md#fistula-enterocutanea`
- **Interconsulta**: `03-notas-interconsulta.md#fistula-enteroatmosferica`
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-fistula`

### Referencias por Procedimiento

#### Apendicectomía (27.06.25)
- **Fecha**: `00-indice-general.md#fecha-apendicectomia`
- **Procedimiento**: `03-notas-interconsulta.md#procedimiento-apendicectomia`
- **Hallazgos**: `04-notas-traslado.md#hallazgos-quirurgicos`
- **Antecedente**: `01-informacion-ingreso-paciente.md#antecedente-apendicectomia`

#### Laparotomía Exploradora (06.07.25)
- **Fecha**: `00-indice-general.md#fecha-laparotomia`
- **Valoración**: `03-notas-interconsulta.md#laparotomia-exploradora`
- **Evolución**: `02-notas-evolucion-diaria.md#po-lape`

---

## 👥 Referencias por Especialidad Médica

### Cirugía Pediátrica
- **Equipo**: `00-indice-general.md#equipo-cirugia-pediatrica`
- **Interconsulta**: `03-notas-interconsulta.md#cirugia-pediatrica`
- **Valoración**: `03-notas-interconsulta.md#valoracion-cirugia`

### UCI Pediátrica
- **Equipo**: `00-indice-general.md#equipo-uci-pediatrica`
- **Ingreso**: `02-notas-evolucion-diaria.md#ingreso-uci`
- **Evolución**: `02-notas-evolucion-diaria.md#evolucion-uci`

### Área de Traslado
- **Equipo**: `00-indice-general.md#equipo-traslado`
- **Proceso**: `04-notas-traslado.md#traslado-uci`

---

## 🧬 Referencias por Sistema Corporal

### Sistema Gastrointestinal
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-gastrometabolico`
- **Abdomen abierto**: `02-notas-evolucion-diaria.md#abdomen-abierto-manejo`
- **Nutrición**: `02-notas-evolucion-diaria.md#nutricion-parenteral`

### Sistema Respiratorio
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-ventilatorio`
- **Parámetros**: `02-notas-evolucion-diaria.md#parametros-ventilacion`
- **Ventilación**: `02-notas-evolucion-diaria.md#ventilacion-mecanica`

### Sistema Cardiovascular
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-hemodinamico`
- **Apoyo**: `02-notas-evolucion-diaria.md#apoyo-aminergico`
- **Perfusión**: `02-notas-evolucion-diaria.md#evaluacion-perfusion`

### Sistema Neurológico
- **Manejo**: `02-notas-evolucion-diaria.md#manejo-neurologico`
- **Sedación**: `02-notas-evolucion-diaria.md#sedacion-midazolam`
- **Evaluación**: `02-notas-evolucion-diaria.md#evaluacion-sedacion`

---

## 📊 Referencias por Estudios de Laboratorio

### Laboratorios de Seguimiento
- **07.07.25**: `01-informacion-ingreso-paciente.md#laboratorio-ingreso`
- **09.07.25**: `01-informacion-ingreso-paciente.md#laboratorio-dia-3`
- **12.07.25**: `01-informacion-ingreso-paciente.md#laboratorio-dia-6`
- **14.07.25**: `01-informacion-ingreso-paciente.md#laboratorio-reciente`

### Hallazgos Relevantes
- **Leucocitosis**: `01-informacion-ingreso-paciente.md#leucocitosis-ingreso`
- **Anemia**: `01-informacion-ingreso-paciente.md#anemia-evolutiva`
- **Trombocitosis**: `01-informacion-ingreso-paciente.md#trombocitosis`

---

## 🔍 Términos Médicos Principales

### Términos Clave con Referencias
- **Abdomen Abierto**: `02-notas-evolucion-diaria.md#abdomen-abierto`
- **LAPE**: `03-notas-interconsulta.md#procedimiento-lape`
- **Sepsis**: `02-notas-evolucion-diaria.md#manejo-sepsis`
- **Ventilación Invasiva**: `02-notas-evolucion-diaria.md#ventilacion-mecanica`
- **Sedoanalgesia**: `02-notas-evolucion-diaria.md#sedoanalgesia-ingreso`
- **Apoyo Aminérgico**: `02-notas-evolucion-diaria.md#apoyo-aminergico`

---

## 🛠️ Sintaxis de Enlaces

### Formato de Enlaces Internos
```markdown
[Texto del enlace](#ancla-destino)
[Texto del enlace](./archivo.md#ancla-destino)
```

### Ejemplos de Uso
```markdown
# Enlaces dentro del mismo archivo
[Ver diagnóstico](#diagnostico-sepsis)

# Enlaces entre archivos
[Ver evolución](./02-notas-evolucion-diaria.md#evolucion-uci)

# Enlaces múltiples
→ [Ver antecedente](./01-informacion-ingreso-paciente.md#antecedente-apendicectomia) | [Ver cronología](./04-notas-traslado.md#cronologia-apendicitis)
```

---

## ✅ Validación del Sistema

### Verificación de Enlaces
1. **Integridad de anclas**: Todas las anclas referenciadas existen en los archivos destino
2. **Coherencia semántica**: Los nombres de anclas reflejan el contenido
3. **Navegación circular**: Posibilidad de regresar al índice desde cualquier sección
4. **Referencias bidireccionales**: Enlaces de ida y vuelta entre secciones relacionadas

### Herramientas de Validación
- **Pandoc**: Verificación de sintaxis Markdown
- **Validador de enlaces**: Verificación de integridad de referencias
- **Pruebas de navegación**: Verificación de flujo de usuario

---

## 📚 Mantenimiento del Sistema

### Actualización de Referencias
1. **Nuevos diagnósticos**: Agregar anclas semánticas y referencias cruzadas
2. **Nuevos procedimientos**: Actualizar mapa de referencias
3. **Nuevos médicos**: Agregar a sección de equipos médicos
4. **Nuevos estudios**: Actualizar referencias cronológicas

### Convenciones de Nomenclatura
- **Anclas**: kebab-case (minúsculas con guiones)
- **Referencias**: Descriptivas y semánticamente significativas
- **Fechas**: formato dd-mm-aa para consistencia

---

## 🚀 Conversión a PDF

### Comando Pandoc
```bash
pandoc 00-indice-general.md 01-informacion-ingreso-paciente.md 02-notas-evolucion-diaria.md 03-notas-interconsulta.md 04-notas-traslado.md -o expediente-completo.pdf --toc --number-sections
```

### Características PDF
- **Índice automático**: Generado desde las anclas
- **Enlaces navegables**: Funcionan en lectores PDF
- **Numeración de secciones**: Automática
- **Referencias cruzadas**: Mantienen funcionalidad

---

## 📝 Notas de Implementación

### Estado Actual
- ✅ Sistema de anclas semánticas implementado
- ✅ Referencias cruzadas básicas configuradas
- ✅ Navegación cronológica establecida
- ✅ Referencias por especialidad médica
- ✅ Mapa de términos médicos

### Próximos Pasos
- [ ] Validación automática de enlaces
- [ ] Índice de medicamentos
- [ ] Cronología visual
- [ ] Métricas de navegación

---

**Sistema implementado el 16 de julio de 2025**
**Expediente:** Dylan Antonio Martínez Labastida (345370)
**Responsable técnico:** Sistema de Context Engineering