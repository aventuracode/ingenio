# Arquitectura - Ingenio HR Platform

Sistema de Recursos Humanos con Evaluaciones 360°, gestión de roles y permisos basado en Next.js 14, Supabase y TypeScript.

---

## 🎯 Visión General

**Ingenio** es una plataforma enterprise de RRHH que permite:
- Gestión de empleados y estructura organizacional
- Evaluaciones 360° con feedback anónimo
- Sistema de roles y permisos granular
- Dashboards dinámicos por rol
- Seguridad basada en Row Level Security (RLS)

---

## 🏗️ Tech Stack

### **Frontend:**
- **Next.js 14** (App Router, Server Components)
- **React 18** (TypeScript)
- **TailwindCSS** (Styling)
- **Lucide React** (Icons)

### **Backend:**
- **Supabase** (PostgreSQL + Auth + RLS)
- **Server Actions** (Next.js)
- **TypeScript** (Type safety)

### **Autenticación:**
- **Supabase Auth** (Email/Password)
- **Row Level Security** (RLS Policies)
- **Middleware** (Route protection)

---

## 📁 Estructura del Proyecto

```
ingenio-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   └── login/
│   ├── dashboard/                # Rutas protegidas
│   │   ├── page.tsx             # Dashboard dinámico por rol
│   │   ├── empleados/           # Gestión de empleados
│   │   ├── evaluaciones/        # Gestión de evaluaciones
│   │   ├── mis-evaluaciones/    # Evaluaciones asignadas
│   │   ├── mi-feedback/         # Feedback anónimo
│   │   └── analytics/           # Analytics y reportes
│   └── layout.tsx
│
├── components/                   # Componentes React
│   ├── dashboard/
│   │   ├── Sidebar.tsx          # Navegación dinámica
│   │   ├── DashboardRRHH.tsx    # Dashboard RRHH/Admin
│   │   └── DashboardEmployee.tsx # Dashboard Employee
│   ├── evaluations/
│   │   ├── EvaluationAnswerForm.tsx
│   │   └── QuestionCard.tsx
│   └── ui/
│       └── ConfirmModal.tsx     # Modal reutilizable
│
├── lib/                          # Lógica de negocio
│   ├── auth/
│   │   ├── roles.ts             # Definición de roles
│   │   └── permissions.ts       # Sistema de permisos
│   ├── config/
│   │   └── navigation.ts        # Navegación por rol
│   ├── services/
│   │   ├── evaluations.service.ts
│   │   ├── feedback.service.ts
│   │   └── reviewer-evaluations.service.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── types/                        # TypeScript types
│   ├── evaluation.ts
│   ├── evaluation-dtos.ts       # DTOs seguros
│   └── reviewer-evaluation.ts
│
├── hooks/                        # React hooks
│   └── useCurrentRole.ts        # Hook de rol actual
│
├── middleware.ts                 # Protección de rutas
│
└── supabase/                     # Configuración Supabase
    ├── migrations/
    └── policy/                   # RLS policies
        ├── evaluation_cycles.policy.sql
        ├── evaluation_reviewers.policy.sql
        ├── evaluation_answers.policy.sql
        └── apply_all_policies.sql
```

---

## 👥 Sistema de Roles y Permisos

### **Roles Definidos:**

```typescript
// lib/auth/roles.ts
export const ROLES = {
  ADMIN: 'admin',      // Acceso total + gestión de usuarios
  RRHH: 'rrhh',        // Gestión completa de RRHH
  MANAGER: 'manager',  // Gestión de equipo
  EMPLOYEE: 'employee' // Acceso personal
} as const
```

### **Jerarquía de Roles:**

```
admin > rrhh > manager > employee
```

### **Permisos por Rol:**

#### **Admin:**
- ✅ Todas las capacidades de RRHH
- ✅ Gestión de usuarios del sistema
- ✅ Gestión de roles
- ✅ Eliminación de evaluaciones
- ✅ Auditoría completa

#### **RRHH:**
- ✅ Gestión de empleados (CRUD)
- ✅ Gestión de evaluaciones (CRUD)
- ✅ Gestión de ciclos (CRUD)
- ✅ Asignación de reviewers
- ✅ Ver todas las evaluaciones
- ✅ Analytics generales

#### **Manager:**
- ✅ Ver evaluaciones de su equipo
- ✅ Responder evaluaciones asignadas
- ✅ Ver feedback de su equipo
- ❌ No puede crear/editar evaluaciones

#### **Employee:**
- ✅ Ver sus propias evaluaciones
- ✅ Responder evaluaciones asignadas
- ✅ Ver su feedback anónimo
- ❌ No puede ver evaluaciones de otros

---

## 🔐 Navegación por Rol

```typescript
// lib/config/navigation.ts

navigationByRole = {
  admin: [
    'Dashboard',
    'Empleados',
    'Evaluaciones',
    'Ciclos',
    'Analytics',
    'Usuarios'
  ],
  
  rrhh: [
    'Dashboard',
    'Empleados',
    'Evaluaciones',
    'Ciclos',
    'Analytics'
  ],
  
  manager: [
    'Dashboard',
    'Mis Evaluaciones',
    'Mi Feedback',
    'Mi Perfil'
  ],
  
  employee: [
    'Dashboard',
    'Mis Evaluaciones',
    'Mi Feedback',
    'Mi Perfil'
  ]
}
```

---

## 🎯 Evaluaciones 360°

### **Arquitectura del Módulo:**

```
Evaluación 360°
├── Ciclo de Evaluación
├── Empleado Evaluado
├── Reviewers Asignados
│   ├── Self (autoevaluación)
│   ├── Manager (supervisor)
│   ├── Peer (compañeros)
│   └── Subordinate (reportes directos)
├── Preguntas por Categoría
├── Respuestas Anónimas
└── Feedback Agregado
```

### **Tablas Principales:**

#### **1. evaluation_cycles**
```sql
CREATE TABLE evaluation_cycles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'closed'))
);
```

#### **2. evaluations**
```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  cycle_id UUID REFERENCES evaluation_cycles(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed'))
);
```

#### **3. evaluation_reviewers**
```sql
CREATE TABLE evaluation_reviewers (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id),
  reviewer_employee_id UUID REFERENCES employees(id),
  reviewer_type TEXT CHECK (reviewer_type IN ('self', 'manager', 'peer', 'subordinate')),
  completed BOOLEAN DEFAULT false
);
```

#### **4. evaluation_questions**
```sql
CREATE TABLE evaluation_questions (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);
```

#### **5. evaluation_answers**
```sql
CREATE TABLE evaluation_answers (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id),
  reviewer_employee_id UUID REFERENCES employees(id),
  question_id UUID REFERENCES evaluation_questions(id),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT
);
```

---

## 🔒 Row Level Security (RLS)

### **Políticas por Tabla:**

#### **evaluation_cycles:**
```sql
-- SELECT: Todos pueden ver ciclos activos
CREATE POLICY "Anyone can view active cycles"
ON evaluation_cycles FOR SELECT
USING (status = 'active' OR auth_role() IN ('admin', 'rrhh'));

-- INSERT/UPDATE/DELETE: Solo admin y rrhh
CREATE POLICY "Only admin/rrhh can manage cycles"
ON evaluation_cycles FOR ALL
USING (auth_role() IN ('admin', 'rrhh'));
```

#### **evaluations:**
```sql
-- SELECT: Ver propias evaluaciones o si eres reviewer
CREATE POLICY "View own evaluations or assigned"
ON evaluations FOR SELECT
USING (
  employee_id = auth_employee_id()
  OR id IN (
    SELECT evaluation_id FROM evaluation_reviewers
    WHERE reviewer_employee_id = auth_employee_id()
  )
  OR auth_role() IN ('admin', 'rrhh')
);

-- INSERT/UPDATE/DELETE: Solo admin y rrhh
CREATE POLICY "Only admin/rrhh can manage evaluations"
ON evaluations FOR ALL
USING (auth_role() IN ('admin', 'rrhh'));
```

#### **evaluation_reviewers:**
```sql
-- SELECT: Ver si eres el evaluado, reviewer, o admin/rrhh
CREATE POLICY "View if involved or admin"
ON evaluation_reviewers FOR SELECT
USING (
  reviewer_employee_id = auth_employee_id()
  OR evaluation_id IN (
    SELECT id FROM evaluations WHERE employee_id = auth_employee_id()
  )
  OR auth_role() IN ('admin', 'rrhh')
);

-- UPDATE: Solo el reviewer puede marcar como completado
CREATE POLICY "Reviewer can mark as completed"
ON evaluation_reviewers FOR UPDATE
USING (reviewer_employee_id = auth_employee_id())
WITH CHECK (reviewer_employee_id = auth_employee_id());
```

#### **evaluation_answers:**
```sql
-- SELECT: Ver respuestas de tus evaluaciones (sin reviewer_id para anonimato)
CREATE POLICY "View answers for own evaluations (anonymous)"
ON evaluation_answers FOR SELECT
USING (
  evaluation_id IN (
    SELECT id FROM evaluations WHERE employee_id = auth_employee_id()
  )
  OR reviewer_employee_id = auth_employee_id()
  OR auth_role() IN ('admin', 'rrhh')
);

-- INSERT/UPDATE: Solo el reviewer asignado
CREATE POLICY "Reviewer can answer"
ON evaluation_answers FOR INSERT
WITH CHECK (
  reviewer_employee_id = auth_employee_id()
  AND evaluation_id IN (
    SELECT evaluation_id FROM evaluation_reviewers
    WHERE reviewer_employee_id = auth_employee_id()
    AND completed = false
  )
);
```

---

## 📊 DTOs Seguros

### **EmployeeFeedbackDTO (Anónimo):**
```typescript
export interface EmployeeFeedbackDTO {
  id: string
  score: number
  comment: string | null
  category: string
  createdAt: string
  // ❌ NO incluye reviewer_employee_id (anonimato)
}
```

### **EvaluationDTO:**
```typescript
export interface EvaluationDTO {
  id: string
  employeeId: string
  employeeName: string
  cycleId: string
  cycleName: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: {
    completed: number
    total: number
    percentage: number
  }
  reviewers: ReviewerDTO[]
}
```

---

## 🎨 Dashboards por Rol

### **1. Dashboard RRHH/Admin:**

**Métricas:**
- Evaluaciones Activas
- Pendientes
- Finalizadas
- Promedio Empresa

**Secciones:**
- Evaluaciones Recientes (últimas 5)
- Requieren Atención (pendientes/en progreso)
- Acciones Rápidas (Nueva Evaluación, Nuevo Empleado)

**Código:**
```typescript
// components/dashboard/DashboardRRHH.tsx
export default async function DashboardRRHH() {
  const stats = await EvaluationsService.getEvaluationStats()
  const evaluations = await EvaluationsService.getEvaluations()
  
  return (
    <div>
      <StatsCards stats={stats} />
      <RecentEvaluations evaluations={evaluations.slice(0, 5)} />
      <PendingEvaluations evaluations={pending} />
      <QuickActions />
    </div>
  )
}
```

### **2. Dashboard Employee:**

**Métricas:**
- Mis Evaluaciones (total)
- Pendientes de Evaluar (como reviewer)
- Evaluaciones Completadas
- Mi Feedback (link)

**Secciones:**
- Mis Evaluaciones (donde es evaluado)
- Pendientes de Evaluar (donde es reviewer)
- Acciones Rápidas (Mis Evaluaciones, Mi Feedback)

**Código:**
```typescript
// components/dashboard/DashboardEmployee.tsx
export default async function DashboardEmployee({ employeeId }) {
  // Evaluaciones donde es evaluado
  const myEvaluations = await supabase
    .from('evaluations')
    .select('...')
    .eq('employee_id', employeeId)
  
  // Evaluaciones donde es reviewer
  const reviewerEvaluations = await supabase
    .from('evaluation_reviewers')
    .select('...')
    .eq('reviewer_employee_id', employeeId)
  
  return (
    <div>
      <StatsCards />
      <MyEvaluations />
      <PendingToReview />
      <QuickActions />
    </div>
  )
}
```

### **3. Dashboard Dinámico:**

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  // Obtener rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()
  
  const role = profile?.role?.name
  
  // Renderizar según rol
  if (role === 'admin' || role === 'rrhh') {
    return <DashboardRRHH />
  }
  
  if (role === 'employee' || role === 'manager') {
    return <DashboardEmployee employeeId={employeeId} />
  }
}
```

---

## 🔄 Flujos Principales

### **1. Crear Evaluación (RRHH):**

```
1. RRHH crea ciclo de evaluación
2. RRHH selecciona empleado a evaluar
3. RRHH asigna reviewers (self, manager, peers)
4. Sistema crea evaluación con status='pending'
5. Reviewers reciben notificación
```

### **2. Responder Evaluación (Reviewer):**

```
1. Reviewer ve evaluación en "Mis Evaluaciones"
2. Reviewer responde preguntas (score 1-5 + comentarios)
3. Reviewer guarda borrador (opcional)
4. Reviewer envía evaluación (completed=true)
5. Sistema actualiza progreso de la evaluación
6. Si todos completaron → status='completed'
```

### **3. Ver Feedback (Employee):**

```
1. Employee accede a "Mi Feedback"
2. Sistema obtiene evaluaciones del employee
3. Sistema obtiene respuestas (SIN reviewer_id)
4. Sistema calcula:
   - Promedio general
   - Promedio por categoría
   - Fortalezas (score > 4)
   - Oportunidades (score < 3)
5. Employee ve feedback ANÓNIMO
```

---

## 🛡️ Protección de Rutas

### **Middleware:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verificar autenticación
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect('/login')
  }
  
  // Verificar permisos por ruta
  const requiredPermission = getRequiredPermission(pathname)
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return NextResponse.redirect('/dashboard')
  }
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

## 🎯 Servicios Principales

### **1. EvaluationsService:**
```typescript
class EvaluationsService {
  static async getEvaluations(): Promise<EvaluationDTO[]>
  static async getEvaluationStats(): Promise<StatsDTO>
  static async createEvaluation(data): Promise<void>
  static async updateEvaluation(id, data): Promise<void>
  static async deleteEvaluation(id): Promise<void>
}
```

### **2. FeedbackService:**
```typescript
class FeedbackService {
  static async getEmployeeFeedbackStats(employeeId): Promise<FeedbackStatsDTO>
  static async getEmployeeFeedback(employeeId): Promise<EmployeeFeedbackDTO[]>
}
```

### **3. ReviewerEvaluationsService:**
```typescript
class ReviewerEvaluationsService {
  static async getMyEvaluations(): Promise<MyEvaluationListItem[]>
  static async getEvaluationForReviewer(id): Promise<EvaluationDetailForReviewer>
  static async submitEvaluationAnswers(payload): Promise<Result>
  static async completeReviewerEvaluation(id): Promise<Result>
}
```

---

## 🎨 Componentes UI

### **ConfirmModal:**
Modal reutilizable con variantes (info, warning, danger, success):
- Animaciones suaves
- Cierre con ESC
- Backdrop blur
- Estados de loading

### **QuestionCard:**
Card para responder preguntas de evaluación:
- Rating 1-5 estrellas
- Comentarios opcionales
- Categoría visual
- Estados disabled

---

## 📈 Performance

### **Optimizaciones:**
- ✅ Server Components (reducir JS en cliente)
- ✅ Queries específicas (solo campos necesarios)
- ✅ Joins explícitos (evitar N+1)
- ✅ Parallel fetches con `Promise.all`
- ✅ Caching de navegación
- ✅ RLS en base de datos (seguridad + performance)

---

## 🔧 Configuración

### **Variables de Entorno:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### **Aplicar RLS Policies:**
```bash
# En Supabase SQL Editor
\i supabase/policy/apply_all_policies.sql
```

---

## 📚 Convenciones de Código

### **Naming:**
- Componentes: PascalCase (`DashboardRRHH.tsx`)
- Servicios: PascalCase + `.service.ts`
- Hooks: camelCase + `use` prefix (`useCurrentRole.ts`)
- Types: PascalCase + `.ts`
- DTOs: PascalCase + `DTO` suffix

### **Estructura de Archivos:**
- Server Components: `app/` directory
- Client Components: `'use client'` directive
- Servicios: `lib/services/`
- Tipos: `types/`
- Configuración: `lib/config/`

---

## 🚀 Próximos Pasos

### **Features Pendientes:**
- [ ] DashboardManager específico
- [ ] Notificaciones en tiempo real
- [ ] Exportar reportes PDF
- [ ] Gráficos de tendencias
- [ ] Comparación entre ciclos
- [ ] Metas y objetivos

### **Mejoras Técnicas:**
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Storybook
- [ ] CI/CD pipeline
- [ ] Monitoring y logs
