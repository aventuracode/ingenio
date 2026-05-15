# Correcciones Basadas en Schema Real

## ✅ Cambios Aplicados

He actualizado todos los archivos para que coincidan exactamente con tu schema de Supabase.

### **Diferencias Principales del Schema:**

| Campo Original (Asumido) | Campo Real (Tu DB) | Tabla |
|--------------------------|-------------------|-------|
| `name` | `title` | `evaluation_cycles` |
| `reviewer_id` | `reviewer_employee_id` | `evaluation_reviewers` |
| `relationship` | `reviewer_type` | `evaluation_reviewers` |
| `status` (reviewer) | `completed` (boolean) | `evaluation_reviewers` |
| `type` | ❌ No existe | `evaluations` |
| `average_score` | ❌ No existe | `evaluations` |
| `start_date` | ❌ No existe | `evaluations` |
| `end_date` | ❌ No existe | `evaluations` |

### **Campos que SÍ existen en tu DB:**

**`evaluations`:**
- `id` (uuid)
- `cycle_id` (uuid)
- `employee_id` (uuid)
- `status` (text)
- `created_at` (timestamp)

**`evaluation_cycles`:**
- `id` (uuid)
- `title` (text) ← **No `name`**
- `description` (text)
- `start_date` (date)
- `end_date` (date)
- `status` (text)
- `created_by` (uuid)
- `created_at` (timestamp)

**`evaluation_reviewers`:**
- `id` (uuid)
- `evaluation_id` (uuid)
- `reviewer_employee_id` (uuid) ← **No `reviewer_id`**
- `reviewer_type` (text) ← **No `relationship`**
- `completed` (boolean) ← **No `status`**
- `created_at` (timestamp)

**`evaluation_answers`:**
- `id` (uuid)
- `evaluation_id` (uuid)
- `reviewer_employee_id` (uuid)
- `question_id` (uuid)
- `score` (int4)
- `comment` (text)
- `created_at` (timestamp)

---

## 📝 Archivos Actualizados

### 1. `types/evaluation.ts`

**Cambios:**
- ✅ Tipos coinciden con schema real
- ✅ `EvaluationCycle.title` (no `name`)
- ✅ `EvaluationReviewer.reviewer_employee_id` (no `reviewer_id`)
- ✅ `EvaluationReviewer.reviewer_type` (no `relationship`)
- ✅ `EvaluationReviewer.completed` boolean (no `status`)
- ✅ Eliminado `EvaluationType` (no existe en DB)
- ✅ Eliminados campos que no existen en `evaluations`

### 2. `lib/services/evaluations.service.ts`

**Cambios:**
- ✅ Query usa `title` en lugar de `name`
- ✅ Query usa `reviewer_employee_id` en lugar de `reviewer_id`
- ✅ Query usa foreign key correcta: `evaluation_reviewers_reviewer_employee_id_fkey`
- ✅ Filtra por `completed === true` en lugar de `status === 'completed'`
- ✅ Manejo de errores retorna array vacío

### 3. `app/dashboard/evaluaciones/page.tsx`

**Cambios:**
- ✅ Columna "Tipo" reemplazada por "Ciclo"
- ✅ Muestra `evaluation.ciclo.nombre` (que viene de `cycle.title`)
- ✅ Progreso basado en `completed` boolean
- ✅ Diseño visual mantenido exactamente igual

---

## 🔧 Cómo Funciona Ahora

### Query de Supabase

```typescript
const { data } = await supabase
  .from('evaluations')
  .select(`
    *,
    employee:employees!evaluations_employee_id_fkey (
      id, nombre, apellido, email, puesto, avatar_url
    ),
    cycle:evaluation_cycles!evaluations_cycle_id_fkey (
      id, title, description, start_date, end_date, status
    ),
    reviewers:evaluation_reviewers (
      id,
      evaluation_id,
      reviewer_employee_id,
      reviewer_type,
      completed,
      created_at,
      reviewer:employees!evaluation_reviewers_reviewer_employee_id_fkey (
        id, nombre, apellido, email, puesto, avatar_url
      )
    )
  `)
  .order('created_at', { ascending: false })
```

### Transformación de Datos

```typescript
{
  id: evaluation.id,
  empleado: {
    nombre: evaluation.employee.nombre,
    apellido: evaluation.employee.apellido,
    puesto: evaluation.employee.puesto || 'Sin puesto',
    avatar: evaluation.employee.avatar_url || null
  },
  ciclo: {
    id: evaluation.cycle?.id || '',
    nombre: evaluation.cycle?.title || 'Sin ciclo' // ← title, no name
  },
  progreso: {
    completados: reviewers.filter(r => r.completed === true).length, // ← completed, no status
    total: reviewers.length,
    porcentaje: calculateProgress(...)
  },
  estado: getEvaluationStatusLabel(evaluation.status || 'pending'),
  puntaje: null, // Calcular desde evaluation_answers
  fecha: evaluation.created_at
}
```

---

## 🎯 Tabla de Evaluaciones

### Columnas Actuales:

| Columna | Muestra | Fuente |
|---------|---------|--------|
| **Empleado** | Avatar + Nombre + Puesto | `employees` (JOIN) |
| **Progreso** | 3/5 + Barra + 60% | `evaluation_reviewers.completed` |
| **Ciclo** | Nombre del ciclo | `evaluation_cycles.title` |
| **Estado** | Badge (Pendiente/En progreso/Finalizada) | `evaluations.status` |
| **Puntaje** | ⭐ 4.5/5 o "Sin calificar" | Calculado desde `evaluation_answers` |
| **Fecha** | 15 may 2024 | `evaluations.created_at` |

---

## 📊 Cálculo de Puntaje

**Nota:** El puntaje promedio debe calcularse desde `evaluation_answers`:

```typescript
// Para obtener el puntaje promedio de una evaluación:
const { data: answers } = await supabase
  .from('evaluation_answers')
  .select('score')
  .eq('evaluation_id', evaluationId)

const averageScore = answers.length > 0
  ? answers.reduce((sum, a) => sum + a.score, 0) / answers.length
  : null
```

**Actualmente:** El puntaje muestra `null` (Sin calificar) porque no estamos haciendo este cálculo aún.

**Próximo paso:** Agregar este cálculo en el servicio o crear una vista materializada en Supabase.

---

## ✅ Estado Actual

### ✅ Funcionando:
- Listado de evaluaciones
- Stats dinámicos (activas, pendientes, finalizadas)
- Progreso de reviewers (completados/total)
- Estados con badges
- Navegación clickeable
- Avatares con fallback
- Empty state

### ⚠️ Pendiente:
- Cálculo de puntaje promedio desde `evaluation_answers`
- Página de detalles (`/dashboard/evaluaciones/[id]`)
- Página de creación (`/dashboard/evaluaciones/new`)
- Formulario de respuesta para reviewers

---

## 🚀 Próximos Pasos

### 1. Agregar Cálculo de Puntaje

Opción A: En el servicio (más queries)
```typescript
// Para cada evaluación, obtener answers y calcular promedio
```

Opción B: Vista materializada en Supabase (mejor performance)
```sql
CREATE VIEW evaluation_scores AS
SELECT 
  evaluation_id,
  AVG(score) as average_score,
  COUNT(*) as total_answers
FROM evaluation_answers
GROUP BY evaluation_id;
```

### 2. Página de Detalles

```
/dashboard/evaluaciones/[id]
- Información del empleado
- Información del ciclo
- Lista de reviewers con progreso
- Puntajes por categoría
- Comentarios
```

### 3. Página de Creación

```
/dashboard/evaluaciones/new
- Seleccionar empleado
- Seleccionar ciclo
- Asignar reviewers
- Configurar preguntas
```

### 4. Formulario de Respuesta

```
/dashboard/evaluaciones/[id]/review
- Lista de preguntas
- Calificación 1-5
- Comentarios
- Guardar respuestas
```

---

## 📋 Checklist de Verificación

### Schema
- [x] Tipos TypeScript coinciden con DB
- [x] Nombres de columnas correctos
- [x] Foreign keys correctas
- [x] Tipos de datos correctos

### Servicio
- [x] Query usa nombres correctos
- [x] JOINs funcionan correctamente
- [x] Manejo de errores robusto
- [x] Transformación de datos correcta

### UI
- [x] Tabla muestra datos correctos
- [x] Progreso calculado correctamente
- [x] Estados con estilos correctos
- [x] Diseño visual mantenido

### Funcionalidad
- [x] Listado funciona
- [x] Stats se calculan
- [x] Navegación funciona
- [ ] Puntaje promedio (pendiente)
- [ ] Detalles (pendiente)
- [ ] Creación (pendiente)
- [ ] Respuesta (pendiente)

---

**Estado:** ✅ Integración base completada y corregida según schema real
**Listo para:** Implementar cálculo de puntajes y páginas adicionales
