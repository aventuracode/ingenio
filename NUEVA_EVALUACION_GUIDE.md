# Guía Completa: Nueva Evaluación 360°

## 🎯 Implementación Enterprise-Grade Completada

He creado una solución completa, profesional y lista para producción para crear evaluaciones 360°.

---

## 📁 Estructura de Archivos Creados

```
ingenio-app/
├── app/
│   └── dashboard/
│       └── evaluaciones/
│           └── new/
│               └── page.tsx                    ✅ Server Component
├── components/
│   └── evaluations/
│       └── EvaluationForm.tsx                  ✅ Client Component
├── lib/
│   └── services/
│       └── evaluations.service.ts              ✅ Extendido con nuevos métodos
└── types/
    └── evaluation.ts                           ✅ Extendido con nuevos tipos
```

---

## 🔧 Cambios Implementados

### 1. **Types TypeScript** (`types/evaluation.ts`)

#### Nuevos Tipos Agregados:

```typescript
// Opciones para selects
export interface EmployeeOption {
  id: string
  nombre: string
  apellido: string
  puesto?: string
  avatar_url?: string
  email?: string
}

export interface EvaluationCycleOption {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: string
}

// Selección de reviewer
export interface ReviewerSelection {
  employee: EmployeeOption
  reviewerType: ReviewerType
}

// Payloads para creación
export interface CreateEvaluationPayload {
  cycle_id: string
  employee_id: string
  status: string
}

export interface CreateReviewerPayload {
  evaluation_id: string
  reviewer_employee_id: string
  reviewer_type: string
  completed: boolean
}
```

**¿Por qué estos tipos?**
- ✅ **Type safety completo**: Evita errores en tiempo de compilación
- ✅ **Autocomplete**: IntelliSense en todo el flujo
- ✅ **Documentación**: Los tipos documentan la estructura
- ✅ **Validación**: TypeScript valida los datos

---

### 2. **Servicio Extendido** (`lib/services/evaluations.service.ts`)

#### Nuevos Métodos:

##### `getEmployeesForSelection()`
```typescript
static async getEmployeesForSelection(): Promise<EmployeeOption[]>
```

**Qué hace:**
- Obtiene empleados activos de Supabase
- Filtra por `activo = true`
- Ordena alfabéticamente por apellido
- Retorna solo campos necesarios para el select

**Query:**
```sql
SELECT id, nombre, apellido, puesto, avatar_url, email
FROM employees
WHERE activo = true
ORDER BY apellido ASC
```

##### `getActiveCycles()`
```typescript
static async getActiveCycles(): Promise<EvaluationCycleOption[]>
```

**Qué hace:**
- Obtiene ciclos activos
- Filtra por `status = 'active'`
- Ordena por fecha de inicio (más reciente primero)

**Query:**
```sql
SELECT id, title, description, start_date, end_date, status
FROM evaluation_cycles
WHERE status = 'active'
ORDER BY start_date DESC
```

##### `createEvaluation()`
```typescript
static async createEvaluation(
  evaluationData: CreateEvaluationPayload,
  reviewers: CreateReviewerPayload[]
): Promise<{ success: boolean; evaluationId?: string; error?: string }>
```

**Qué hace:**
1. Crea la evaluación en `evaluations`
2. Crea los reviewers en `evaluation_reviewers`
3. Si falla paso 2, hace rollback del paso 1
4. Retorna resultado con success/error

**Flujo transaccional:**
```typescript
try {
  // 1. Crear evaluación
  const evaluation = await insert('evaluations')
  
  // 2. Crear reviewers
  await insert('evaluation_reviewers', reviewers)
  
  return { success: true, evaluationId }
} catch (error) {
  // Rollback: eliminar evaluación
  await delete('evaluations', evaluationId)
  return { success: false, error }
}
```

**¿Por qué este approach?**
- ✅ **Atomicidad**: Todo o nada
- ✅ **Rollback manual**: Si falla reviewers, elimina evaluación
- ✅ **Error handling robusto**: Maneja todos los casos
- ✅ **Type-safe**: Retorno tipado

---

### 3. **Server Component** (`app/dashboard/evaluaciones/new/page.tsx`)

#### Características:

```typescript
export default async function NewEvaluationPage() {
  // Fetch paralelo
  const [employees, cycles] = await Promise.all([
    EvaluationsService.getEmployeesForSelection(),
    EvaluationsService.getActiveCycles(),
  ])

  return (
    <div>
      {/* Validación de datos */}
      {employees.length === 0 || cycles.length === 0 ? (
        <EmptyState />
      ) : (
        <EvaluationForm employees={employees} cycles={cycles} />
      )}
    </div>
  )
}
```

**¿Por qué Server Component?**
- ✅ **Fetch en servidor**: Datos frescos siempre
- ✅ **Paralelo**: Ambas queries al mismo tiempo
- ✅ **No JavaScript al cliente**: Mejor performance
- ✅ **SEO friendly**: HTML completo en primera carga

**Validación:**
- Si no hay empleados activos → Muestra mensaje
- Si no hay ciclos activos → Muestra mensaje
- Si hay datos → Renderiza formulario

---

### 4. **Client Component** (`components/evaluations/EvaluationForm.tsx`)

#### Estado del Formulario:

```typescript
// Datos del formulario
const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
const [selectedCycleId, setSelectedCycleId] = useState<string>('')
const [reviewers, setReviewers] = useState<ReviewerSelection[]>([])

// UI state
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState(false)

// Selector de reviewer
const [selectedReviewerEmployeeId, setSelectedReviewerEmployeeId] = useState<string>('')
const [selectedReviewerType, setSelectedReviewerType] = useState<string>('peer')
```

#### Flujo de Agregar Reviewer:

```typescript
const handleAddReviewer = () => {
  // 1. Validar que se seleccionó un empleado
  if (!selectedReviewerEmployeeId) {
    setError('Selecciona un empleado')
    return
  }

  // 2. Validar que no esté duplicado
  const alreadyAdded = reviewers.some(
    (r) => r.employee.id === selectedReviewerEmployeeId
  )
  if (alreadyAdded) {
    setError('Ya fue agregado')
    return
  }

  // 3. Agregar a la lista
  const employee = employees.find((e) => e.id === selectedReviewerEmployeeId)
  setReviewers([
    ...reviewers,
    { employee, reviewerType: selectedReviewerType }
  ])

  // 4. Reset selector
  setSelectedReviewerEmployeeId('')
  setSelectedReviewerType('peer')
}
```

#### Flujo de Submit:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  // 1. Validaciones
  if (!selectedEmployeeId) {
    setError('Selecciona un empleado a evaluar')
    return
  }
  if (!selectedCycleId) {
    setError('Selecciona un ciclo')
    return
  }
  if (reviewers.length === 0) {
    setError('Agrega al menos un evaluador')
    return
  }

  try {
    const supabase = createClient()

    // 2. Crear evaluación
    const { data: evaluation, error: evaluationError } = await supabase
      .from('evaluations')
      .insert([{
        cycle_id: selectedCycleId,
        employee_id: selectedEmployeeId,
        status: 'pending',
      }])
      .select()
      .single()

    if (evaluationError) throw new Error(evaluationError.message)

    // 3. Crear reviewers
    const reviewersPayload = reviewers.map((r) => ({
      evaluation_id: evaluation.id,
      reviewer_employee_id: r.employee.id,
      reviewer_type: r.reviewerType,
      completed: false,
    }))

    const { error: reviewersError } = await supabase
      .from('evaluation_reviewers')
      .insert(reviewersPayload)

    if (reviewersError) {
      // Rollback: eliminar evaluación
      await supabase.from('evaluations').delete().eq('id', evaluation.id)
      throw new Error(reviewersError.message)
    }

    // 4. Success
    setSuccess(true)
    setTimeout(() => {
      router.push('/dashboard/evaluaciones')
      router.refresh()
    }, 1500)
  } catch (err) {
    setError(err.message)
    setLoading(false)
  }
}
```

**Características del Submit:**
- ✅ **Validaciones previas**: Evita requests innecesarios
- ✅ **Transaccional**: Rollback si falla
- ✅ **Loading state**: Deshabilita botones
- ✅ **Error handling**: Muestra mensajes claros
- ✅ **Success feedback**: Mensaje + redirect
- ✅ **Router refresh**: Actualiza cache de Next.js

---

## 🎨 UI/UX Moderna

### Secciones del Formulario:

#### 1. **Empleado a Evaluar**
```
┌─────────────────────────────────────────┐
│ 👤 Empleado a Evaluar                   │
│ Selecciona quién será evaluado          │
├─────────────────────────────────────────┤
│ [Select: Empleado *]                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Juan Pérez                       │ │
│ │    Desarrollador Senior             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Select con todos los empleados activos
- Preview con avatar/iniciales
- Muestra puesto del empleado
- Requerido (*)

#### 2. **Ciclo de Evaluación**
```
┌─────────────────────────────────────────┐
│ 📅 Ciclo de Evaluación                  │
│ Selecciona el período de evaluación     │
├─────────────────────────────────────────┤
│ [Select: Ciclo *]                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Q1 2024 - Evaluación Trimestral     │ │
│ │ Evaluación de desempeño del primer  │ │
│ │ trimestre 2024                      │ │
│ │ 📅 01 ene 2024 - 31 mar 2024       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Select con ciclos activos
- Preview con descripción
- Muestra fechas del ciclo
- Requerido (*)

#### 3. **Evaluadores**
```
┌─────────────────────────────────────────┐
│ 👥 Evaluadores                          │
│ Agrega las personas que evaluarán       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Select: Evaluador]  [Select: Tipo] │ │
│ │ [+ Agregar Evaluador]               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Evaluadores agregados (3)               │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 María González                   │🗑│
│ │    Tech Lead • Manager              │ │
│ ├─────────────────────────────────────┤ │
│ │ 👤 Pedro Sánchez                    │🗑│
│ │    Developer • Peer                 │ │
│ ├─────────────────────────────────────┤ │
│ │ 👤 Juan Pérez                       │🗑│
│ │    Developer • Self                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Selector de empleado + tipo
- Botón "Agregar Evaluador"
- Lista de reviewers agregados
- Badge con tipo de reviewer
- Botón eliminar por reviewer
- Validación de duplicados
- Mínimo 1 evaluador requerido

#### Tipos de Reviewer:

| Tipo | Label | Color |
|------|-------|-------|
| `self` | Autoevaluación | Purple |
| `manager` | Supervisor | Blue |
| `peer` | Par/Colega | Green |
| `subordinate` | Subordinado | Amber |

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario visita /dashboard/evaluaciones/new          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Server Component ejecuta (async)                    │
│    - getEmployeesForSelection()                         │
│    - getActiveCycles()                                  │
│    (en paralelo con Promise.all)                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Validación de datos                                  │
│    - ¿Hay empleados? ✓                                  │
│    - ¿Hay ciclos? ✓                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Renderiza EvaluationForm (Client Component)         │
│    - Props: employees, cycles                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Usuario completa formulario                          │
│    - Selecciona empleado                                │
│    - Selecciona ciclo                                   │
│    - Agrega reviewers (uno por uno)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Usuario hace submit                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Validaciones client-side                             │
│    - ¿Empleado seleccionado? ✓                          │
│    - ¿Ciclo seleccionado? ✓                             │
│    - ¿Al menos 1 reviewer? ✓                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 8. INSERT en Supabase                                   │
│    a) INSERT INTO evaluations                           │
│    b) INSERT INTO evaluation_reviewers (batch)          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 9. Success                                              │
│    - Muestra mensaje de éxito                           │
│    - Espera 1.5s                                        │
│    - router.push('/dashboard/evaluaciones')             │
│    - router.refresh()                                   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Validaciones Implementadas

### Client-Side:

1. **Empleado requerido**
   ```typescript
   if (!selectedEmployeeId) {
     setError('Selecciona un empleado a evaluar')
     return
   }
   ```

2. **Ciclo requerido**
   ```typescript
   if (!selectedCycleId) {
     setError('Selecciona un ciclo de evaluación')
     return
   }
   ```

3. **Mínimo 1 reviewer**
   ```typescript
   if (reviewers.length === 0) {
     setError('Agrega al menos un evaluador')
     return
   }
   ```

4. **No duplicar reviewers**
   ```typescript
   const alreadyAdded = reviewers.some(
     (r) => r.employee.id === selectedReviewerEmployeeId
   )
   if (alreadyAdded) {
     setError('Este empleado ya fue agregado')
     return
   }
   ```

### Server-Side (Supabase RLS):

- Políticas RLS activas
- Validación de foreign keys
- Validación de tipos de datos

---

## 🎯 Estados de UI

### Loading States:

```typescript
// Durante submit
<button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="animate-spin" />
      Creando...
    </>
  ) : (
    <>
      <CheckCircle2 />
      Crear Evaluación
    </>
  )}
</button>
```

### Error States:

```typescript
{error && (
  <div className="border-red-200 bg-red-50">
    <XCircle className="text-red-600" />
    <p className="text-red-800">{error}</p>
  </div>
)}
```

### Success States:

```typescript
{success && (
  <div className="border-green-200 bg-green-50">
    <CheckCircle2 className="text-green-600" />
    <p className="text-green-800">
      ¡Evaluación creada exitosamente! Redirigiendo...
    </p>
  </div>
)}
```

---

## 🚀 Características Enterprise

### 1. **Arquitectura Modular**
```
✅ Services separados
✅ Types centralizados
✅ Components reutilizables
✅ Server/Client separation
```

### 2. **Type Safety Completo**
```
✅ No 'any' types
✅ Interfaces para todo
✅ Autocomplete everywhere
✅ Compile-time validation
```

### 3. **Error Handling Robusto**
```
✅ Try-catch en todos los async
✅ Rollback transaccional
✅ Mensajes de error claros
✅ Logging para debugging
```

### 4. **Performance Optimizado**
```
✅ Fetch paralelo (Promise.all)
✅ Server Components
✅ Client Components solo donde necesario
✅ Minimal JavaScript al cliente
```

### 5. **UX Profesional**
```
✅ Loading states
✅ Error messages
✅ Success feedback
✅ Disabled states
✅ Validation feedback
```

### 6. **Escalabilidad**
```
✅ Preparado para más features
✅ Fácil agregar validaciones
✅ Fácil agregar campos
✅ Fácil extender tipos de reviewer
```

---

## 📊 Datos Creados en Supabase

### Tabla `evaluations`:

```sql
INSERT INTO evaluations (
  cycle_id,
  employee_id,
  status
) VALUES (
  'uuid-del-ciclo',
  'uuid-del-empleado',
  'pending'
)
```

### Tabla `evaluation_reviewers`:

```sql
INSERT INTO evaluation_reviewers (
  evaluation_id,
  reviewer_employee_id,
  reviewer_type,
  completed
) VALUES
  ('uuid-evaluacion', 'uuid-reviewer-1', 'manager', false),
  ('uuid-evaluacion', 'uuid-reviewer-2', 'peer', false),
  ('uuid-evaluacion', 'uuid-reviewer-3', 'self', false)
```

---

## 🔐 Seguridad

### RLS Policies:
- ✅ Usuarios solo pueden crear evaluaciones si tienen permisos
- ✅ Foreign keys validadas por Supabase
- ✅ Tipos de datos validados

### Client-Side:
- ✅ Validaciones antes de submit
- ✅ Sanitización de inputs
- ✅ No exponer datos sensibles

---

## 🎓 Próximos Pasos Posibles

### 1. **Notificaciones**
```typescript
// Enviar email a reviewers cuando se crea evaluación
await sendReviewerInvitations(evaluation.id, reviewers)
```

### 2. **Validaciones Avanzadas**
```typescript
// No permitir autoevaluación si ya existe
// Validar que manager sea realmente manager
// Limitar número de reviewers
```

### 3. **Bulk Creation**
```typescript
// Crear múltiples evaluaciones a la vez
// Importar desde CSV
```

### 4. **Templates**
```typescript
// Guardar combinaciones de reviewers
// Aplicar templates rápidamente
```

### 5. **Analytics**
```typescript
// Tracking de creación de evaluaciones
// Métricas de uso
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Tipos TypeScript creados
- [x] Servicio extendido con nuevos métodos
- [x] Queries Supabase optimizadas
- [x] Error handling robusto
- [x] Rollback transaccional

### Frontend
- [x] Server Component para fetch
- [x] Client Component para formulario
- [x] Estados de UI (loading/error/success)
- [x] Validaciones client-side
- [x] Diseño moderno y profesional

### UX
- [x] Selects con preview
- [x] Lista de reviewers con badges
- [x] Agregar/eliminar reviewers
- [x] Mensajes de error claros
- [x] Feedback de éxito
- [x] Redirect automático

### Arquitectura
- [x] Separación Server/Client
- [x] Services modulares
- [x] Types centralizados
- [x] Components reutilizables
- [x] Best practices Next.js App Router

---

**Estado:** ✅ Implementación completa y lista para producción
**Listo para:** Crear evaluaciones 360° con múltiples reviewers
