# Guía: Módulo de Evaluaciones (UI)

## 🎯 Página Implementada

Se ha creado una página visual moderna de **Evaluaciones 360°** con diseño tipo SaaS/ERP.

✅ **Ruta**: `/dashboard/evaluaciones`
✅ **Tipo**: Página visual (sin backend aún)
✅ **Datos**: Mock data para demostración
✅ **Diseño**: Moderno, limpio, profesional
✅ **Responsive**: Adaptable a todos los dispositivos

---

## 📁 Archivos Creados/Modificados

### Páginas
- `app/dashboard/evaluaciones/page.tsx` - Página principal de evaluaciones

### Componentes Modificados
- `components/dashboard/Sidebar.tsx` - Agregado link "Evaluaciones" con icono `ClipboardCheck`

---

## 🎨 Componentes de la UI

### 1. Header

```
┌─────────────────────────────────────────────────────┐
│ Evaluaciones 360°              [Nueva Evaluación]   │
│ Gestiona evaluaciones de desempeño y feedback...    │
└─────────────────────────────────────────────────────┘
```

- **Título**: "Evaluaciones 360°"
- **Subtítulo**: Descripción del módulo
- **Botón primario**: "Nueva Evaluación" (azul, con icono +)

### 2. Cards de Estadísticas

Cuatro cards con métricas clave:

| Card | Valor | Icono | Color |
|------|-------|-------|-------|
| **Evaluaciones Activas** | 12 | ClipboardCheck | Azul |
| **Pendientes** | 8 | Clock | Ámbar |
| **Finalizadas** | 45 | CheckCircle2 | Verde |
| **Promedio General** | 4.2/5 | TrendingUp | Púrpura |

**Características**:
- Hover effect con borde inferior de color
- Iconos con fondo de color suave
- Números grandes y legibles
- Diseño card moderno con sombras

### 3. Barra de Búsqueda

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Buscar evaluaciones por empleado, evaluador...   │
└─────────────────────────────────────────────────────┘
```

- Icono de búsqueda a la izquierda
- Placeholder descriptivo
- Estilo moderno con focus states
- **Nota**: Visual solamente, sin funcionalidad

### 4. Tabla de Evaluaciones

Columnas:

1. **Empleado**
   - Avatar circular
   - Nombre (bold)
   - Puesto (gris)

2. **Evaluador**
   - Avatar circular
   - Nombre
   - Puesto

3. **Tipo**
   - Icono ClipboardCheck
   - Tipo de evaluación (360°, Desempeño, Competencias)

4. **Estado**
   - Badge con color según estado:
     - 🟡 **Pendiente** - Ámbar
     - 🔵 **En progreso** - Azul
     - 🟢 **Finalizada** - Verde
   - Icono según estado

5. **Puntaje**
   - Estrella amarilla
   - Número/5
   - "Sin calificar" si no tiene puntaje

6. **Fecha**
   - Icono de calendario
   - Formato: "15 may 2024"

**Características**:
- Hover effect en filas
- Avatares con ring de color
- Badges con bordes
- Responsive

---

## 📊 Datos Mock

### Estadísticas
```typescript
{
  evaluacionesActivas: 12,
  pendientes: 8,
  finalizadas: 45,
  promedioGeneral: 4.2
}
```

### Evaluaciones (5 registros)

1. **Juan Pérez** → María González | 360° | En progreso | 4.5 | 15 may 2024
2. **Carlos Rodríguez** → Ana Martínez | Desempeño | Finalizada | 4.8 | 10 may 2024
3. **Laura Torres** → Diego Sánchez | Competencias | Pendiente | - | 20 may 2024
4. **Sofia López** → Luis Fernández | 360° | En progreso | 4.2 | 12 may 2024
5. **Ana Martínez** → Carlos Rodríguez | Desempeño | Finalizada | 4.6 | 8 may 2024

---

## 🎨 Paleta de Colores

### Estados
- **Pendiente**: Ámbar (`amber-100`, `amber-700`)
- **En progreso**: Azul (`blue-100`, `blue-700`)
- **Finalizada**: Verde (`green-100`, `green-700`)

### Stats Cards
- **Activas**: Azul (`blue-50`, `blue-600`)
- **Pendientes**: Ámbar (`amber-50`, `amber-600`)
- **Finalizadas**: Verde (`green-50`, `green-600`)
- **Promedio**: Púrpura (`purple-50`, `purple-600`)

### Elementos
- **Botón primario**: `bg-blue-600 hover:bg-blue-700`
- **Bordes**: `border-gray-200`
- **Hover**: `hover:bg-gray-50`
- **Sombras**: `shadow-sm hover:shadow-md`

---

## 🔧 Iconos Utilizados

| Icono | Uso |
|-------|-----|
| `Plus` | Botón "Nueva Evaluación" |
| `Search` | Barra de búsqueda |
| `ClipboardCheck` | Stats, tipo de evaluación |
| `Clock` | Pendientes, estado pendiente |
| `CheckCircle2` | Finalizadas, estado finalizada |
| `TrendingUp` | Promedio general |
| `Star` | Puntaje |
| `Calendar` | Fecha |
| `User` | Estado en progreso |

---

## 📱 Responsive Design

### Desktop (lg+)
- Grid de 4 columnas para stats
- Tabla completa visible
- Espaciado amplio

### Tablet (sm-md)
- Grid de 2 columnas para stats
- Tabla con scroll horizontal
- Espaciado medio

### Mobile (xs)
- Grid de 1 columna para stats
- Tabla con scroll horizontal
- Espaciado compacto

---

## 🚀 Próximos Pasos (Backend)

### Base de Datos

Crear tabla `evaluations`:

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID REFERENCES employees(id),
  evaluador_id UUID REFERENCES employees(id),
  tipo VARCHAR(50) NOT NULL, -- '360', 'Desempeño', 'Competencias'
  estado VARCHAR(50) NOT NULL, -- 'Pendiente', 'En progreso', 'Finalizada'
  puntaje DECIMAL(2,1), -- 0.0 a 5.0
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  comentarios TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Funcionalidades a Implementar

1. **Crear Evaluación**
   - Formulario modal o página
   - Seleccionar empleado y evaluador
   - Elegir tipo de evaluación
   - Configurar criterios

2. **Ver Detalles**
   - Click en fila → modal o página de detalles
   - Mostrar criterios evaluados
   - Comentarios y feedback
   - Historial de cambios

3. **Editar Evaluación**
   - Modificar puntajes
   - Agregar comentarios
   - Cambiar estado

4. **Filtros y Búsqueda**
   - Por empleado
   - Por evaluador
   - Por tipo
   - Por estado
   - Por rango de fechas

5. **Exportar**
   - PDF de evaluación individual
   - Excel con todas las evaluaciones
   - Reportes de desempeño

6. **Notificaciones**
   - Email cuando se asigna evaluación
   - Recordatorios de pendientes
   - Notificación al finalizar

---

## 💡 Mejoras Futuras

### UI/UX
- [ ] Gráficos de tendencias (Chart.js o Recharts)
- [ ] Vista de calendario de evaluaciones
- [ ] Drag & drop para asignar evaluadores
- [ ] Modo oscuro
- [ ] Animaciones suaves (Framer Motion)

### Funcionalidad
- [ ] Evaluaciones por competencias específicas
- [ ] Autoevaluación
- [ ] Evaluación de pares (peer review)
- [ ] Planes de mejora
- [ ] Objetivos SMART
- [ ] Comparación histórica
- [ ] Dashboard de analytics

### Integraciones
- [ ] Slack/Teams para notificaciones
- [ ] Google Calendar para recordatorios
- [ ] Firma digital de evaluaciones
- [ ] Integración con sistema de nómina

---

## 🎯 Tipos de Evaluación

### 1. Evaluación 360°
- **Descripción**: Feedback de múltiples fuentes
- **Evaluadores**: Jefe, pares, subordinados, autoevaluación
- **Uso**: Desarrollo integral del empleado

### 2. Evaluación de Desempeño
- **Descripción**: Evaluación tradicional jefe-empleado
- **Evaluadores**: Supervisor directo
- **Uso**: Revisión anual/semestral

### 3. Evaluación por Competencias
- **Descripción**: Medición de habilidades específicas
- **Evaluadores**: Jefe o experto en la competencia
- **Uso**: Identificar gaps de habilidades

---

## 📊 Criterios de Evaluación (Ejemplos)

### Técnicos
- Conocimiento del rol
- Calidad del trabajo
- Productividad
- Innovación
- Resolución de problemas

### Comportamentales
- Trabajo en equipo
- Comunicación
- Liderazgo
- Adaptabilidad
- Iniciativa

### Organizacionales
- Alineación con valores
- Compromiso
- Puntualidad
- Cumplimiento de objetivos

---

## ✅ Checklist de Implementación

### Fase 1: UI (✅ Completada)
- [x] Página visual creada
- [x] Cards de estadísticas
- [x] Tabla de evaluaciones
- [x] Barra de búsqueda
- [x] Botón "Nueva Evaluación"
- [x] Estados visuales con badges
- [x] Responsive design
- [x] Integración con sidebar

### Fase 2: Backend (Pendiente)
- [ ] Crear tabla en Supabase
- [ ] Políticas RLS
- [ ] Tipos TypeScript
- [ ] Server Component para fetch
- [ ] Formulario de creación
- [ ] Página de detalles
- [ ] Edición de evaluaciones

### Fase 3: Funcionalidad Avanzada (Pendiente)
- [ ] Filtros y búsqueda real
- [ ] Exportar a PDF/Excel
- [ ] Notificaciones
- [ ] Gráficos y analytics
- [ ] Historial de cambios

---

## 🎨 Consistencia de Diseño

La página de Evaluaciones sigue el mismo sistema de diseño que el resto del dashboard:

- ✅ Mismo esquema de colores
- ✅ Misma tipografía y espaciado
- ✅ Mismos componentes (cards, badges, buttons)
- ✅ Mismos hover effects
- ✅ Misma estructura de layout
- ✅ Mismos bordes redondeados (rounded-xl)
- ✅ Mismas sombras (shadow-sm)

---

**Estado actual**: Página visual lista para demostración. Preparada para integración con backend.
