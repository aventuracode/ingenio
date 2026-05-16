# Guía: Estado Derivado de Evaluaciones 360

## 🎯 Problema Resuelto

**Antes:**
- El estado venía directamente de `evaluations.status`
- Causaba inconsistencias: progreso 100% + estado "Pendiente"
- No reflejaba la realidad del progreso de reviewers

**Ahora:**
- El estado se **deriva dinámicamente** del progreso real
- Consistencia garantizada: progreso = estado
- Fuente única de verdad: `evaluation_reviewers.completed`

---

## 📊 Lógica de Estado Derivado

### **Regla Simple:**

```typescript
if (porcentaje === 0) {
  estado = 'pending'      // Pendiente
} else if (porcentaje === 100) {
  estado = 'completed'    // Finalizada
} else {
  estado = 'in_progress'  // En progreso
}
```

### **Ejemplos:**

| Completados | Total | Porcentaje | Estado       |
|-------------|-------|------------|--------------|
| 0           | 3     | 0%         | pending      |
| 1           | 3     | 33%        | in_progress  |
| 2           | 3     | 67%        | in_progress  |
| 3           | 3     | 100%       | completed    |

---

## 🔧 Implementación

### **1. Función deriveEvaluationStatus**

```typescript
// types/evaluation.ts

export function deriveEvaluationStatus(
  completedReviewers: number,
  totalReviewers: number
): EvaluationStatus {
  if (totalReviewers === 0) {
    return 'pending'
  }

  const percentage = (completedReviewers / totalReviewers) * 100

  if (percentage === 0) {
    return 'pending'
  } else if (percentage === 100) {
    return 'completed'
  } else {
    return 'in_progress'
  }
}
```

**Características:**
- ✅ Type-safe
- ✅ Lógica clara
- ✅ Edge cases manejados
- ✅ Reutilizable

---

### **2. transformEvaluationForUI Actualizado**

```typescript
// types/evaluation.ts

export function transformEvaluationForUI(
  evaluation: EvaluationWithRelations
): EvaluationListItem {
  const completedReviewers = evaluation.reviewers.filter(
    (r) => r.completed === true
  ).length
  const totalReviewers = evaluation.reviewers.length

  // CALCULAR ESTADO DERIVADO (NO usar evaluation.status directamente)
  const derivedStatus = deriveEvaluationStatus(completedReviewers, totalReviewers)

  return {
    id: evaluation.id,
    empleado: { /* ... */ },
    ciclo: { /* ... */ },
    estado: getEvaluationStatusLabel(derivedStatus),
    estadoRaw: derivedStatus, // ← Usar estado derivado
    progreso: {
      completados: completedReviewers,
      total: totalReviewers,
      porcentaje: calculateProgress(completedReviewers, totalReviewers),
    },
    puntaje: averageScore,
    fecha: evaluation.created_at || new Date().toISOString(),
  }
}
```

**Cambios clave:**
- ❌ NO usar `evaluation.status`
- ✅ Usar `deriveEvaluationStatus()`
- ✅ `estadoRaw` ahora es derivado

---

### **3. getEvaluationStats Actualizado**

```typescript
// lib/services/evaluations.service.ts

static async getEvaluationStats(): Promise<EvaluationStats> {
  const supabase = await createClient()

  // Obtener todas las evaluaciones con sus reviewers
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(`
      id,
      reviewers:evaluation_reviewers (
        completed
      )
    `)

  // Calcular estadísticas usando estado derivado
  let activas = 0
  let pendientes = 0
  let finalizadas = 0

  evaluations.forEach((evaluation) => {
    const reviewers = evaluation.reviewers || []
    const completedCount = reviewers.filter(r => r.completed === true).length
    const totalCount = reviewers.length

    // Derivar estado basado en progreso
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    if (percentage === 0) {
      pendientes++
    } else if (percentage === 100) {
      finalizadas++
    } else {
      activas++
    }
  })

  return {
    activas,
    pendientes,
    finalizadas,
    promedioGeneral: 0,
  }
}
```

**Cambios clave:**
- ❌ NO usar `evaluations.status`
- ✅ JOIN con `evaluation_reviewers`
- ✅ Calcular porcentaje por evaluación
- ✅ Derivar estado dinámicamente

---

## 🔄 Flujo Completo

### **Flujo: Obtener Evaluaciones**

```
1. getEvaluations() ejecuta query
2. Supabase retorna evaluations con reviewers
3. Para cada evaluation:
   ├─ Contar reviewers completados
   ├─ Contar total reviewers
   ├─ Calcular porcentaje
   ├─ deriveEvaluationStatus(completed, total)
   └─ Retornar estado derivado
4. transformEvaluationForUI() mapea a UI
5. Frontend renderiza con estado correcto
```

### **Flujo: Calcular Stats**

```
1. getEvaluationStats() ejecuta query
2. Supabase retorna evaluations con reviewers
3. Para cada evaluation:
   ├─ Contar reviewers completados
   ├─ Contar total reviewers
   ├─ Calcular porcentaje
   └─ Incrementar contador según estado derivado
4. Retornar { activas, pendientes, finalizadas }
5. Frontend muestra stats correctas
```

---

## 📊 Consistencia Garantizada

### **Antes (Inconsistente):**

```
Evaluación A:
- Reviewers: 3/3 completados (100%)
- evaluations.status: 'pending'
- Frontend muestra: Progreso 100% + Estado "Pendiente" ❌
```

### **Ahora (Consistente):**

```
Evaluación A:
- Reviewers: 3/3 completados (100%)
- Estado derivado: 'completed'
- Frontend muestra: Progreso 100% + Estado "Finalizada" ✅
```

---

## 🎨 Frontend Sin Cambios

El frontend **NO necesita cambios** porque:

```typescript
// app/dashboard/evaluaciones/page.tsx

// Sigue usando evaluation.estadoRaw
const statusStyle = getEvaluationStatusStyle(evaluation.estadoRaw)

// Sigue usando los mismos iconos
const statusIcons = {
  pending: Clock,
  in_progress: User,
  completed: CheckCircle2,
}
```

**Ventajas:**
- ✅ Compatibilidad total
- ✅ Sin refactor de UI
- ✅ Mismo código de frontend
- ✅ Solo cambió la lógica de backend

---

## 🚀 Optimizaciones

### **1. Query Única**

```typescript
// Antes: 2 queries
const evaluations = await supabase.from('evaluations').select('*')
const reviewers = await supabase.from('evaluation_reviewers').select('*')

// Ahora: 1 query con JOIN
const evaluations = await supabase
  .from('evaluations')
  .select(`
    *,
    reviewers:evaluation_reviewers (
      completed
    )
  `)
```

**Beneficios:**
- ✅ Menos round-trips a DB
- ✅ Mejor performance
- ✅ Datos consistentes

### **2. Cálculo en Memoria**

```typescript
// Cálculo eficiente en JavaScript
const completedCount = reviewers.filter(r => r.completed === true).length
const percentage = (completedCount / totalCount) * 100
```

**Beneficios:**
- ✅ No queries adicionales
- ✅ Rápido
- ✅ Escalable

---

## ✅ Validaciones

### **Edge Cases Manejados:**

#### **1. Sin Reviewers**
```typescript
totalReviewers = 0
→ Estado: 'pending'
→ Porcentaje: 0%
```

#### **2. Todos Pendientes**
```typescript
completedReviewers = 0
totalReviewers = 3
→ Estado: 'pending'
→ Porcentaje: 0%
```

#### **3. Parcialmente Completados**
```typescript
completedReviewers = 1
totalReviewers = 3
→ Estado: 'in_progress'
→ Porcentaje: 33%
```

#### **4. Todos Completados**
```typescript
completedReviewers = 3
totalReviewers = 3
→ Estado: 'completed'
→ Porcentaje: 100%
```

---

## 🎓 Cómo Funciona

### **Fuente Única de Verdad:**

```
evaluation_reviewers.completed
         ↓
   Contar completados
         ↓
  Calcular porcentaje
         ↓
   Derivar estado
         ↓
    Mostrar en UI
```

### **NO Confiar en:**

```
❌ evaluations.status (puede estar desactualizado)
✅ evaluation_reviewers.completed (fuente de verdad)
```

---

## 📝 Ejemplos Reales

### **Ejemplo 1: Evaluación Nueva**

```typescript
Evaluación creada
Reviewers asignados: 3
Reviewers completados: 0

Estado derivado: 'pending'
Porcentaje: 0%
Label: "Pendiente"
Icon: Clock
```

### **Ejemplo 2: En Progreso**

```typescript
Reviewer 1 completa evaluación
Reviewers completados: 1/3

Estado derivado: 'in_progress'
Porcentaje: 33%
Label: "En progreso"
Icon: User
```

### **Ejemplo 3: Finalizada**

```typescript
Reviewer 3 completa evaluación
Reviewers completados: 3/3

Estado derivado: 'completed'
Porcentaje: 100%
Label: "Finalizada"
Icon: CheckCircle2
```

---

## 🔒 Ventajas de Estado Derivado

### **1. Consistencia**
```
✅ Progreso = Estado
✅ No más inconsistencias
✅ Fuente única de verdad
```

### **2. Simplicidad**
```
✅ Lógica clara
✅ Fácil de entender
✅ Fácil de mantener
```

### **3. Performance**
```
✅ Query única con JOIN
✅ Cálculo en memoria
✅ Sin queries adicionales
```

### **4. Escalabilidad**
```
✅ Funciona con cualquier número de reviewers
✅ Reutilizable
✅ Type-safe
```

---

## 🎯 Resultado Final

### **Stats Cards:**

```
┌─────────────┬─────────────┬─────────────┐
│ Pendientes  │ Activas     │ Finalizadas │
│     5       │     12      │     8       │
│ (0%)        │ (1-99%)     │ (100%)      │
└─────────────┴─────────────┴─────────────┘
```

### **Tabla de Evaluaciones:**

```
┌──────────────────────────────────────────────┐
│ Empleado    │ Progreso │ Estado            │
├──────────────────────────────────────────────┤
│ Juan Pérez  │ 0%       │ ⏰ Pendiente      │
│ María López │ 33%      │ 👤 En progreso    │
│ Carlos Ruiz │ 67%      │ 👤 En progreso    │
│ Ana García  │ 100%     │ ✅ Finalizada     │
└──────────────────────────────────────────────┘
```

**Consistencia perfecta:**
- ✅ 0% → Pendiente
- ✅ 33% → En progreso
- ✅ 67% → En progreso
- ✅ 100% → Finalizada

---

## ✅ Checklist de Implementación

### Backend
- [x] Función `deriveEvaluationStatus()`
- [x] `transformEvaluationForUI()` actualizado
- [x] `getEvaluationStats()` actualizado
- [x] Query optimizada con JOIN
- [x] Cálculo en memoria

### Types
- [x] `EvaluationStatus` type
- [x] Helper functions
- [x] Type-safe

### Frontend
- [x] Sin cambios necesarios
- [x] Compatibilidad total
- [x] Mismo código

### Testing
- [x] Edge cases manejados
- [x] Validaciones correctas
- [x] Consistencia garantizada

---

**Estado:** ✅ Estado derivado implementado
**Resultado:** Consistencia perfecta entre progreso y estado
**Performance:** Optimizado con query única
