# Guía Completa: Navegación Dinámica por Roles

## 🎯 Implementación Enterprise-Grade Completada

He refactorizado el Sidebar para implementar navegación dinámica basada en roles de usuario.

---

## 📁 Estructura de Archivos Creados/Modificados

```
ingenio-app/
├── types/
│   └── navigation.ts                         ✅ Types
├── lib/
│   └── config/
│       └── navigation.ts                     ✅ Config por role
├── hooks/
│   └── useCurrentRole.ts                     ✅ Hook para obtener role
└── components/
    └── dashboard/
        └── Sidebar.tsx                       ✅ Refactorizado
```

---

## 🔧 Componentes Implementados

### 1. **Types** (`types/navigation.ts`)

```typescript
export type UserRole = 'admin' | 'rrhh' | 'manager' | 'employee'

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface NavigationConfig {
  admin: NavigationItem[]
  rrhh: NavigationItem[]
  manager: NavigationItem[]
  employee: NavigationItem[]
}
```

**Características:**
- ✅ Type-safe roles
- ✅ Estructura clara
- ✅ Reutilizable
- ✅ Escalable

---

### 2. **Configuración de Navegación** (`lib/config/navigation.ts`)

#### Navegación por Role:

```typescript
export const navigationByRole: NavigationConfig = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Empleados', href: '/dashboard/empleados', icon: Users },
    { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: ClipboardCheck },
    { name: 'Mis Evaluaciones', href: '/dashboard/mis-evaluaciones', icon: FileCheck },
    { name: 'Ciclos', href: '/dashboard/evaluaciones/ciclos', icon: Calendar },
    { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCircle },
  ],
  
  rrhh: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Empleados', href: '/dashboard/empleados', icon: Users },
    { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: ClipboardCheck },
    { name: 'Mis Evaluaciones', href: '/dashboard/mis-evaluaciones', icon: FileCheck },
    { name: 'Ciclos', href: '/dashboard/evaluaciones/ciclos', icon: Calendar },
  ],
  
  manager: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: ClipboardCheck },
    { name: 'Mis Evaluaciones', href: '/dashboard/mis-evaluaciones', icon: FileCheck },
  ],
  
  employee: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Evaluaciones', href: '/dashboard/mis-evaluaciones', icon: FileCheck },
  ],
}
```

#### Helper Function:

```typescript
export function getNavigationForRole(role: UserRole | null): NavigationItem[] {
  if (!role || !(role in navigationByRole)) {
    // Fallback seguro: solo Dashboard
    return [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ]
  }

  return navigationByRole[role]
}
```

**Características:**
- ✅ Configuración centralizada
- ✅ Fácil de mantener
- ✅ Fallback seguro
- ✅ Type-safe

---

### 3. **Hook useCurrentRole** (`hooks/useCurrentRole.ts`)

```typescript
export function useCurrentRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      const supabase = createClient()

      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      // Obtener profile con role
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          role:roles!profiles_role_id_fkey (
            name
          )
        `)
        .eq('id', user.id)
        .single()

      // Extraer y validar role
      const roleName = profile?.role?.name
      const validRoles: UserRole[] = ['admin', 'rrhh', 'manager', 'employee']
      const userRole = validRoles.includes(roleName) ? roleName : null

      setRole(userRole)
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  return { role, loading }
}
```

**Qué hace:**
1. Obtiene el usuario autenticado de Supabase Auth
2. Hace JOIN con `profiles` → `roles`
3. Extrae el `role.name`
4. Valida que sea un role válido
5. Retorna `{ role, loading }`

**Query SQL:**
```sql
SELECT 
  p.id,
  r.name as role_name
FROM profiles p
INNER JOIN roles r ON p.role_id = r.id
WHERE p.id = auth.uid()
```

**Características:**
- ✅ Type-safe
- ✅ Loading state
- ✅ Error handling
- ✅ Validación de roles
- ✅ Reutilizable

---

### 4. **Sidebar Refactorizado** (`components/dashboard/Sidebar.tsx`)

#### Cambios Principales:

**Antes:**
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Empleados', href: '/dashboard/empleados', icon: Users },
  // ... todos los items hardcodeados
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside>
      {navigation.map((item) => (
        <Link href={item.href}>{item.name}</Link>
      ))}
    </aside>
  )
}
```

**Ahora:**
```typescript
export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { role, loading } = useCurrentRole()

  // Obtener navegación basada en el role del usuario
  const navigation = getNavigationForRole(role)

  return (
    <aside>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        navigation.map((item) => (
          <Link href={item.href}>{item.name}</Link>
        ))
      )}
    </aside>
  )
}
```

#### Loading State:

```typescript
{loading ? (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-12 animate-pulse rounded-xl bg-white/5"
      />
    ))}
  </div>
) : (
  <div className="space-y-1">
    {navigation.map((item) => (
      // ... render items
    ))}
  </div>
)}
```

**Características:**
- ✅ Navegación dinámica
- ✅ Loading skeleton
- ✅ Mantiene diseño visual
- ✅ Mantiene active state
- ✅ Mantiene animaciones

---

## 🔄 Flujos Completos

### Flujo: Renderizado del Sidebar

```
1. Sidebar se monta
2. useCurrentRole() se ejecuta
3. Hook obtiene user de Supabase Auth
4. Hook hace JOIN profiles → roles
5. Hook extrae role.name
6. Hook valida role
7. Hook retorna { role, loading }
8. Sidebar llama getNavigationForRole(role)
9. Helper retorna array de NavigationItem[]
10. Sidebar renderiza items filtrados
```

### Flujo: Usuario Admin

```
1. Usuario admin inicia sesión
2. Sidebar obtiene role = 'admin'
3. getNavigationForRole('admin') retorna:
   - Dashboard
   - Empleados
   - Evaluaciones
   - Mis Evaluaciones
   - Ciclos
   - Usuarios
4. Sidebar renderiza 6 items
```

### Flujo: Usuario Employee

```
1. Usuario employee inicia sesión
2. Sidebar obtiene role = 'employee'
3. getNavigationForRole('employee') retorna:
   - Dashboard
   - Mis Evaluaciones
4. Sidebar renderiza 2 items
5. NO ve: Empleados, Evaluaciones, Ciclos, Usuarios
```

### Flujo: Role Inválido

```
1. Usuario con role desconocido
2. Sidebar obtiene role = null
3. getNavigationForRole(null) retorna fallback:
   - Dashboard
4. Sidebar renderiza solo Dashboard
```

---

## 📊 Matriz de Permisos

| Módulo           | admin | rrhh | manager | employee |
|------------------|-------|------|---------|----------|
| Dashboard        | ✅    | ✅   | ✅      | ✅       |
| Empleados        | ✅    | ✅   | ❌      | ❌       |
| Evaluaciones     | ✅    | ✅   | ✅      | ❌       |
| Mis Evaluaciones | ✅    | ✅   | ✅      | ✅       |
| Ciclos           | ✅    | ✅   | ❌      | ❌       |
| Usuarios         | ✅    | ❌   | ❌      | ❌       |

---

## 🎨 UI/UX

### Loading State:

```
┌─────────────────────┐
│ Ingenio ERP         │
│ Human Resources     │
├─────────────────────┤
│ GENERAL             │
│ ░░░░░░░░░░░░░░░░░  │ ← Skeleton
│ ░░░░░░░░░░░░░░░░░  │ ← Skeleton
│ ░░░░░░░░░░░░░░░░░  │ ← Skeleton
└─────────────────────┘
```

### Admin View:

```
┌─────────────────────┐
│ Ingenio ERP         │
│ Human Resources     │
├─────────────────────┤
│ GENERAL             │
│ 📊 Dashboard        │
│ 👥 Empleados        │
│ 📋 Evaluaciones     │
│ ✅ Mis Evaluaciones │
│ 📅 Ciclos           │
│ 👤 Usuarios         │
├─────────────────────┤
│ 🚪 Cerrar sesión    │
└─────────────────────┘
```

### Employee View:

```
┌─────────────────────┐
│ Ingenio ERP         │
│ Human Resources     │
├─────────────────────┤
│ GENERAL             │
│ 📊 Dashboard        │
│ ✅ Mis Evaluaciones │
├─────────────────────┤
│ 🚪 Cerrar sesión    │
└─────────────────────┘
```

---

## ✅ Validaciones Implementadas

### 1. **Validación de Role**
```typescript
const validRoles: UserRole[] = ['admin', 'rrhh', 'manager', 'employee']
const userRole = validRoles.includes(roleName) ? roleName : null
```

### 2. **Fallback Seguro**
```typescript
if (!role || !(role in navigationByRole)) {
  return [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
}
```

### 3. **Error Handling**
```typescript
try {
  // fetch role
} catch (error) {
  console.error('Unexpected error fetching role:', error)
  setRole(null)
  setLoading(false)
}
```

---

## 🚀 Características Enterprise

### 1. **Arquitectura Modular**
```
✅ Config separada
✅ Types centralizados
✅ Hook reutilizable
✅ Helper functions
✅ Sin lógica en UI
```

### 2. **Type Safety**
```
✅ UserRole type
✅ NavigationItem interface
✅ NavigationConfig interface
✅ No 'any' types
```

### 3. **Escalabilidad**
```
✅ Fácil agregar roles
✅ Fácil agregar items
✅ Fácil modificar permisos
✅ Config centralizada
```

### 4. **Performance**
```
✅ Un solo query
✅ JOIN optimizado
✅ Loading state
✅ No re-renders innecesarios
```

### 5. **UX Profesional**
```
✅ Loading skeleton
✅ Mantiene diseño
✅ Mantiene animaciones
✅ Fallback seguro
```

---

## 🎓 Cómo Agregar un Nuevo Role

### Paso 1: Agregar Type
```typescript
// types/navigation.ts
export type UserRole = 'admin' | 'rrhh' | 'manager' | 'employee' | 'supervisor'
```

### Paso 2: Agregar Config
```typescript
// lib/config/navigation.ts
export const navigationByRole: NavigationConfig = {
  // ... otros roles
  supervisor: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: ClipboardCheck },
    { name: 'Mis Evaluaciones', href: '/dashboard/mis-evaluaciones', icon: FileCheck },
  ],
}
```

### Paso 3: Listo!
El hook y el Sidebar ya funcionarán automáticamente.

---

## 🎓 Cómo Agregar un Nuevo Item de Navegación

### Paso 1: Agregar a Config
```typescript
// lib/config/navigation.ts
import { BarChart } from 'lucide-react'

export const navigationByRole: NavigationConfig = {
  admin: [
    // ... items existentes
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  ],
  rrhh: [
    // ... items existentes
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  ],
  // ... otros roles
}
```

### Paso 2: Listo!
El Sidebar renderizará el nuevo item automáticamente.

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE:

**Ocultar menú NO es seguridad.**

Este sistema solo:
- ✅ Mejora UX
- ✅ Evita confusión
- ✅ Guía al usuario

**DEBES implementar:**
- ✅ RLS en Supabase
- ✅ Middleware en Next.js
- ✅ Validación server-side
- ✅ Protección de rutas

### Ejemplo de Protección de Ruta:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles!profiles_role_id_fkey(name)')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.name

  // Proteger /dashboard/usuarios
  if (request.nextUrl.pathname.startsWith('/dashboard/usuarios')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}
```

---

## 📝 Testing

### Test 1: Admin ve todo
```typescript
const role = 'admin'
const navigation = getNavigationForRole(role)
expect(navigation).toHaveLength(6)
expect(navigation.map(n => n.name)).toContain('Usuarios')
```

### Test 2: Employee ve solo Dashboard y Mis Evaluaciones
```typescript
const role = 'employee'
const navigation = getNavigationForRole(role)
expect(navigation).toHaveLength(2)
expect(navigation.map(n => n.name)).not.toContain('Empleados')
```

### Test 3: Fallback para role inválido
```typescript
const role = null
const navigation = getNavigationForRole(role)
expect(navigation).toHaveLength(1)
expect(navigation[0].name).toBe('Dashboard')
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Types creados
- [x] Config por role
- [x] Hook useCurrentRole
- [x] Query a profiles + roles
- [x] Validación de roles
- [x] Fallback seguro

### Frontend
- [x] Sidebar refactorizado
- [x] Navegación dinámica
- [x] Loading state
- [x] Mantiene diseño visual
- [x] Mantiene animaciones
- [x] Active state funciona

### UX
- [x] Loading skeleton
- [x] Transiciones suaves
- [x] Sin cambios visuales
- [x] Responsive

### Arquitectura
- [x] Config separada
- [x] Types centralizados
- [x] Sin lógica en UI
- [x] Escalable
- [x] Mantenible

---

**Estado:** ✅ Navegación dinámica por roles completada
**Listo para:** Renderizar sidebar según permisos del usuario
**Próximo paso:** Implementar middleware para protección de rutas
