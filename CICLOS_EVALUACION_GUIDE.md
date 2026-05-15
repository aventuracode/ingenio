# Guía Completa: CRUD Ciclos de Evaluación

## 🎯 Implementación Enterprise-Grade Completada

He creado un módulo ABM (Alta, Baja, Modificación) completo y profesional para gestionar Ciclos de Evaluación.

---

## 📁 Estructura de Archivos Creados

```
ingenio-app/
├── app/
│   └── dashboard/
│       └── evaluaciones/
│           └── ciclos/
│               ├── page.tsx                         ✅ Listado
│               ├── new/
│               │   └── page.tsx                     ✅ Crear
│               └── [id]/
│                   └── edit/
│                       ├── page.tsx                 ✅ Editar
│                       └── not-found.tsx            ✅ 404
├── components/
│   └── evaluations/
│       ├── CycleForm.tsx                            ✅ Formulario reutilizable
│       ├── CycleTable.tsx                           ✅ Tabla con acciones
│       └── CycleStatusBadge.tsx                     ✅ Badge de estado
├── lib/
│   ├── services/
│   │   └── evaluation-cycles.service.ts             ✅ Service completo
│   └── constants/
│       └── evaluation-cycle-status.ts               ✅ Constants y helpers
└── types/
    └── evaluation-cycle.ts                          ✅ Types TypeScript
```

---

## 🔧 Componentes Implementados

### 1. **Types TypeScript** (`types/evaluation-cycle.ts`)

#### Tipos Base:
```typescript
export type EvaluationCycleStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface EvaluationCycle {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: EvaluationCycleStatus
  created_by?: string
  created_at?: string
}
```

#### Tipos con Estadísticas:
```typescript
export interface EvaluationCycleWithStats extends EvaluationCycle {
  evaluations_count: number
  completed_evaluations: number
  pending_evaluations: number
}
```

#### Payloads:
```typescript
export interface CreateEvaluationCyclePayload {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status: EvaluationCycleStatus
}

export interface UpdateEvaluationCyclePayload {
  title?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: EvaluationCycleStatus
}
```

#### UI Types:
```typescript
export interface EvaluationCycleListItem {
  id: string
  title: string
  description: string
  startDate: string | null
  endDate: string | null
  status: EvaluationCycleStatus
  statusLabel: string
  evaluationsCount: number
  completedCount: number
  pendingCount: number
  createdAt: string
  isActive: boolean
  canEdit: boolean
  canDelete: boolean
}
```

---

### 2. **Constants** (`lib/constants/evaluation-cycle-status.ts`)

#### Labels:
```typescript
export const CYCLE_STATUS_LABELS: Record<EvaluationCycleStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  archived: 'Archivado',
}
```

#### Colores:
```typescript
export const CYCLE_STATUS_COLORS = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  },
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  // ... más estados
}
```

#### Helpers:
```typescript
export function canEditCycle(status: EvaluationCycleStatus): boolean {
  return status === 'draft' || status === 'active'
}

export function canDeleteCycle(
  status: EvaluationCycleStatus,
  evaluationsCount: number
): boolean {
  return status === 'draft' && evaluationsCount === 0
}
```

---

### 3. **Service** (`lib/services/evaluation-cycles.service.ts`)

#### Métodos Principales:

##### `getCycles()`
```typescript
static async getCycles(): Promise<EvaluationCycleListItem[]>
```

**Qué hace:**
- Obtiene todos los ciclos de Supabase
- Obtiene conteo de evaluaciones por ciclo
- Calcula estadísticas (completadas, pendientes)
- Determina permisos (canEdit, canDelete)
- Transforma datos para UI

**Query:**
```sql
SELECT * FROM evaluation_cycles
ORDER BY created_at DESC

SELECT cycle_id, status FROM evaluations
```

##### `getCycleById()`
```typescript
static async getCycleById(id: string): Promise<EvaluationCycle | null>
```

**Qué hace:**
- Obtiene un ciclo específico por ID
- Retorna null si no existe

##### `createCycle()`
```typescript
static async createCycle(
  payload: CreateEvaluationCyclePayload
): Promise<{ success: boolean; cycleId?: string; error?: string }>
```

**Qué hace:**
1. Valida que no haya múltiples ciclos activos
2. Valida que fecha_fin > fecha_inicio
3. Crea el ciclo en Supabase
4. Retorna resultado

**Validaciones:**
- ✅ Solo un ciclo activo a la vez
- ✅ Fechas coherentes
- ✅ Título requerido

##### `updateCycle()`
```typescript
static async updateCycle(
  id: string,
  payload: UpdateEvaluationCyclePayload
): Promise<{ success: boolean; error?: string }>
```

**Qué hace:**
1. Valida ciclos activos (si se está activando)
2. Valida fechas
3. Actualiza el ciclo
4. Retorna resultado

##### `deleteCycle()`
```typescript
static async deleteCycle(id: string): Promise<{ success: boolean; error?: string }>
```

**Qué hace:**
1. Verifica que no tenga evaluaciones asociadas
2. Elimina el ciclo
3. Retorna resultado

**Validación:**
- ❌ No se puede eliminar si tiene evaluaciones

##### `activateCycle()`
```typescript
static async activateCycle(id: string): Promise<{ success: boolean; error?: string }>
```

**Qué hace:**
1. Desactiva todos los ciclos activos
2. Activa el ciclo seleccionado
3. Retorna resultado

**Lógica:**
- Solo un ciclo activo a la vez
- Desactiva automáticamente otros ciclos

##### `getCycleStats()`
```typescript
static async getCycleStats(): Promise<{
  total: number
  active: number
  draft: number
  completed: number
  archived: number
}>
```

**Qué hace:**
- Cuenta ciclos por estado
- Retorna estadísticas para cards

---

### 4. **Componente Badge** (`components/evaluations/CycleStatusBadge.tsx`)

```typescript
<CycleStatusBadge status="active" showDot={true} size="md" />
```

**Props:**
- `status`: Estado del ciclo
- `showDot`: Mostrar punto de color (opcional)
- `size`: Tamaño del badge ('sm' | 'md' | 'lg')

**Renderiza:**
```html
<span class="bg-green-100 text-green-700 border-green-200">
  <span class="bg-green-500 h-2 w-2 rounded-full"></span>
  Activo
</span>
```

---

### 5. **Componente Tabla** (`components/evaluations/CycleTable.tsx`)

**Features:**
- ✅ Tabla responsive
- ✅ Status badges
- ✅ Fechas formateadas
- ✅ Conteo de evaluaciones
- ✅ Dropdown de acciones
- ✅ Empty state
- ✅ Loading states
- ✅ Error handling
- ✅ Confirmación de eliminación

**Acciones Disponibles:**

| Acción | Disponible cuando | Qué hace |
|--------|-------------------|----------|
| **Editar** | `canEdit = true` | Navega a `/ciclos/[id]/edit` |
| **Activar** | `status = 'draft'` | Cambia estado a `active` |
| **Completar** | `status = 'active'` | Cambia estado a `completed` |
| **Archivar** | `status = 'completed'` | Cambia estado a `archived` |
| **Eliminar** | `canDelete = true` | Elimina el ciclo (con confirmación) |

**Columnas:**
1. **Ciclo**: Título + descripción
2. **Estado**: Badge con color
3. **Período**: Fecha inicio - Fecha fin
4. **Evaluaciones**: Total + completadas + pendientes
5. **Acciones**: Dropdown menu

---

### 6. **Componente Formulario** (`components/evaluations/CycleForm.tsx`)

**Props:**
```typescript
interface CycleFormProps {
  cycle?: EvaluationCycle  // Para modo edición
  mode: 'create' | 'edit'
}
```

**Campos:**
1. **Título** (requerido)
2. **Descripción** (opcional)
3. **Estado** (requerido)
4. **Fecha de Inicio** (opcional)
5. **Fecha de Fin** (opcional)

**Validaciones Client-Side:**
- ✅ Título no vacío
- ✅ Fecha fin > Fecha inicio
- ✅ Solo un ciclo activo

**Estados:**
- Loading: Deshabilita campos y botones
- Error: Muestra mensaje de error
- Success: Muestra mensaje + redirect

**Flujo:**
```
1. Usuario completa formulario
2. Click "Crear/Guardar"
3. Validaciones client-side
4. Validar ciclos activos (si aplica)
5. INSERT/UPDATE en Supabase
6. Success → Redirect a listado
7. Error → Muestra mensaje
```

---

### 7. **Páginas**

#### Listado (`app/dashboard/evaluaciones/ciclos/page.tsx`)

**Server Component:**
```typescript
export default async function CyclesPage() {
  const [cycles, stats] = await Promise.all([
    EvaluationCyclesService.getCycles(),
    EvaluationCyclesService.getCycleStats(),
  ])

  return (
    <div>
      <StatsCards stats={stats} />
      <CycleTable cycles={cycles} />
    </div>
  )
}
```

**Features:**
- ✅ Fetch paralelo
- ✅ 4 Stats cards
- ✅ Tabla con datos
- ✅ Botón "Nuevo Ciclo"

**Stats Cards:**
1. Total de Ciclos
2. Ciclos Activos
3. Borradores
4. Completados

#### Crear (`app/dashboard/evaluaciones/ciclos/new/page.tsx`)

**Server Component:**
```typescript
export default function NewCyclePage() {
  return (
    <div>
      <Header />
      <CycleForm mode="create" />
    </div>
  )
}
```

**Features:**
- ✅ Breadcrumb con botón volver
- ✅ Formulario en modo creación
- ✅ Metadata para SEO

#### Editar (`app/dashboard/evaluaciones/ciclos/[id]/edit/page.tsx`)

**Server Component:**
```typescript
export default async function EditCyclePage({ params }: Props) {
  const cycle = await EvaluationCyclesService.getCycleById(params.id)

  if (!cycle) {
    notFound()
  }

  return (
    <div>
      <Header title={cycle.title} />
      <CycleForm cycle={cycle} mode="edit" />
    </div>
  )
}
```

**Features:**
- ✅ Fetch del ciclo
- ✅ Not found si no existe
- ✅ Formulario pre-poblado
- ✅ Modo edición

#### Not Found (`app/dashboard/evaluaciones/ciclos/[id]/edit/not-found.tsx`)

**Página 404 personalizada:**
- Icono de alerta
- Mensaje claro
- Botón volver al listado

---

## 🎨 UI/UX Moderna

### Estados de Ciclo:

| Estado | Color | Descripción |
|--------|-------|-------------|
| **draft** | Gris | Borrador, en preparación |
| **active** | Verde | Activo, evaluaciones pueden crearse |
| **completed** | Azul | Completado, evaluaciones finalizadas |
| **archived** | Ámbar | Archivado, solo lectura |

### Badges:

```
┌─────────────────┐
│ ● Activo        │  Verde
└─────────────────┘

┌─────────────────┐
│ ● Borrador      │  Gris
└─────────────────┘

┌─────────────────┐
│ ● Completado    │  Azul
└─────────────────┘

┌─────────────────┐
│ ● Archivado     │  Ámbar
└─────────────────┘
```

### Tabla:

```
┌──────────────────────────────────────────────────────────────┐
│ Ciclo              │ Estado    │ Período      │ Evaluaciones │
├──────────────────────────────────────────────────────────────┤
│ Q2 2024            │ ● Activo  │ 01 abr -     │ 12 total     │
│ Evaluación Sem...  │           │ 30 jun 2024  │ ✓ 5  ⏱ 7    │
├──────────────────────────────────────────────────────────────┤
│ Q1 2024            │ ● Compl.  │ 01 ene -     │ 8 total      │
│ Evaluación Tri...  │           │ 31 mar 2024  │ ✓ 8  ⏱ 0    │
└──────────────────────────────────────────────────────────────┘
```

### Dropdown de Acciones:

```
┌─────────────────┐
│ ✏️  Editar      │
│ ▶️  Activar     │
│ ✓  Completar   │
│ 📦 Archivar     │
├─────────────────┤
│ 🗑️  Eliminar    │
└─────────────────┘
```

---

## 🔄 Flujos Completos

### Flujo: Crear Ciclo

```
1. Usuario click "Nuevo Ciclo"
2. Navega a /ciclos/new
3. Server Component renderiza formulario vacío
4. Usuario completa datos:
   - Título: "Q3 2024"
   - Descripción: "Evaluación trimestral"
   - Estado: "draft"
   - Fechas: 01/07/2024 - 30/09/2024
5. Click "Crear Ciclo"
6. Validaciones client-side ✓
7. INSERT en evaluation_cycles
8. Success → Redirect a /ciclos
9. Router.refresh() actualiza datos
```

### Flujo: Activar Ciclo

```
1. Usuario abre dropdown de acciones
2. Click "Activar"
3. Service desactiva otros ciclos activos:
   UPDATE evaluation_cycles 
   SET status = 'draft' 
   WHERE status = 'active' AND id != current_id
4. Service activa ciclo seleccionado:
   UPDATE evaluation_cycles 
   SET status = 'active' 
   WHERE id = current_id
5. Router.refresh() actualiza tabla
6. Badge cambia a verde "Activo"
```

### Flujo: Eliminar Ciclo

```
1. Usuario abre dropdown
2. Click "Eliminar"
3. Confirmación: "¿Estás seguro?"
4. Usuario confirma
5. Service verifica evaluaciones:
   SELECT id FROM evaluations WHERE cycle_id = current_id
6. Si tiene evaluaciones → Error
7. Si no tiene → DELETE FROM evaluation_cycles
8. Router.refresh() actualiza tabla
9. Ciclo desaparece de la lista
```

---

## ✅ Validaciones Implementadas

### Server-Side:

1. **Solo un ciclo activo**
   ```typescript
   const { data: activeCycles } = await supabase
     .from('evaluation_cycles')
     .select('id')
     .eq('status', 'active')
   
   if (activeCycles.length > 0) {
     return { error: 'Ya existe un ciclo activo' }
   }
   ```

2. **Fechas coherentes**
   ```typescript
   if (endDate <= startDate) {
     return { error: 'Fecha fin debe ser posterior a inicio' }
   }
   ```

3. **No eliminar con evaluaciones**
   ```typescript
   const { data: evaluations } = await supabase
     .from('evaluations')
     .select('id')
     .eq('cycle_id', id)
   
   if (evaluations.length > 0) {
     return { error: 'Tiene evaluaciones asociadas' }
   }
   ```

### Client-Side:

1. **Título requerido**
   ```typescript
   if (!formData.title.trim()) {
     setError('El título es requerido')
     return false
   }
   ```

2. **Validación de fechas**
   ```typescript
   if (formData.start_date && formData.end_date) {
     const startDate = new Date(formData.start_date)
     const endDate = new Date(formData.end_date)
     
     if (endDate <= startDate) {
       setError('Fecha fin debe ser posterior')
       return false
     }
   }
   ```

---

## 🚀 Características Enterprise

### 1. **Arquitectura Modular**
```
✅ Services separados
✅ Types centralizados
✅ Constants reutilizables
✅ Components desacoplados
✅ Server/Client separation
```

### 2. **Type Safety Completo**
```
✅ No 'any' types
✅ Interfaces para todo
✅ Enums para estados
✅ Autocomplete everywhere
```

### 3. **Error Handling Robusto**
```
✅ Try-catch en async
✅ Mensajes de error claros
✅ Validaciones múltiples niveles
✅ Logging para debugging
```

### 4. **Performance Optimizado**
```
✅ Fetch paralelo (Promise.all)
✅ Server Components
✅ Client Components solo donde necesario
✅ Minimal JavaScript
```

### 5. **UX Profesional**
```
✅ Loading states
✅ Error messages
✅ Success feedback
✅ Confirmaciones
✅ Disabled states
✅ Transitions
```

### 6. **Escalabilidad**
```
✅ Fácil agregar estados
✅ Fácil agregar validaciones
✅ Fácil agregar campos
✅ Preparado para analytics
```

---

## 📊 Datos en Supabase

### Tabla `evaluation_cycles`:

```sql
CREATE TABLE evaluation_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);
```

### Ejemplo de Datos:

```sql
INSERT INTO evaluation_cycles (title, description, start_date, end_date, status)
VALUES (
  'Q2 2024 - Evaluación Semestral',
  'Evaluación de desempeño del segundo trimestre 2024',
  '2024-04-01',
  '2024-06-30',
  'active'
);
```

---

## 🎓 Próximos Pasos Posibles

### 1. **Analytics**
```typescript
// Dashboard de ciclos
- Tendencias históricas
- Comparación entre ciclos
- Métricas de participación
```

### 2. **Notificaciones**
```typescript
// Cuando se activa un ciclo
await sendNotifications(cycle.id, 'cycle_activated')
```

### 3. **Templates**
```typescript
// Duplicar ciclos
await duplicateCycle(cycleId)
```

### 4. **Bulk Actions**
```typescript
// Archivar múltiples ciclos
await archiveCycles([id1, id2, id3])
```

### 5. **Exportar**
```typescript
// Exportar a Excel/PDF
await exportCycleReport(cycleId)
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Types TypeScript creados
- [x] Constants definidas
- [x] Service completo con todos los métodos
- [x] Validaciones server-side
- [x] Error handling robusto

### Frontend
- [x] Componente Badge
- [x] Componente Tabla con acciones
- [x] Componente Formulario reutilizable
- [x] Página Listado
- [x] Página Crear
- [x] Página Editar
- [x] Página Not Found

### UX
- [x] Loading states
- [x] Error messages
- [x] Success feedback
- [x] Confirmaciones
- [x] Empty states
- [x] Dropdown menus
- [x] Badges de estado

### Navegación
- [x] Sidebar actualizado
- [x] Breadcrumbs
- [x] Redirects
- [x] Router refresh

### Arquitectura
- [x] Server/Client separation
- [x] Services modulares
- [x] Types centralizados
- [x] Constants reutilizables
- [x] Best practices Next.js

---

**Estado:** ✅ CRUD completo y listo para producción
**Listo para:** Gestionar ciclos de evaluación con todas las operaciones ABM
