# Sistema de Autenticación y Roles con Supabase

## 🎯 Características Implementadas

### ✅ Autenticación Completa
- **Login** con email y password
- **Registro** de nuevos usuarios
- **Logout** funcional
- **Persistencia de sesión** automática via cookies
- **Protección de rutas** mediante middleware/proxy

### ✅ Sistema de Roles (RBAC)
- **4 roles**: `admin`, `rrhh`, `manager`, `employee`
- **Jerarquía**: `admin > rrhh > manager > employee`
- **Navegación dinámica** según rol (Sidebar adaptativo)
- **Protección de rutas por rol** (ej: solo admin/rrhh pueden acceder a `/dashboard/usuarios`)
- **Cache de rol** a nivel de módulo para evitar re-fetches innecesarios

### ✅ Componentes y Páginas

#### Páginas de Autenticación
- `app/login/page.tsx` - Página de inicio de sesión
- `app/register/page.tsx` - Página de registro

#### Dashboard (dinámico por rol)
- `app/dashboard/layout.tsx` - Layout principal con Sidebar
- `app/dashboard/page.tsx` - Dashboard dinámico (renderiza componente según rol)
- `app/dashboard/empleados/` - Gestión de empleados (admin, rrhh, manager)
- `app/dashboard/evaluaciones/` - Gestión de evaluaciones 360°
- `app/dashboard/evaluaciones/ciclos/` - Gestión de ciclos de evaluación
- `app/dashboard/mis-evaluaciones/` - Evaluaciones asignadas al reviewer
- `app/dashboard/mi-feedback/` - Feedback anónimo recibido
- `app/dashboard/analytics/` - Analytics (admin, rrhh)
- `app/dashboard/usuarios/` - Gestión de usuarios (solo admin)

#### Componentes Reutilizables
- `components/dashboard/Sidebar.tsx` - Navegación dinámica por rol
- `components/dashboard/Header.tsx` - Header con info del usuario
- `components/dashboard/DashboardRRHH.tsx` - Dashboard para admin/rrhh
- `components/dashboard/DashboardEmployee.tsx` - Dashboard para employee/manager

### ✅ Infraestructura de Supabase

#### Clientes
- `lib/supabase/client.ts` - Cliente para componentes del navegador
- `lib/supabase/server.ts` - Cliente para Server Components
- `lib/supabase/middleware.ts` - Helper para manejo de sesiones

#### Hooks
- `hooks/useAuth.ts` - Hook de autenticación (login, register, logout, user)
- `hooks/useCurrentRole.ts` - Hook de rol actual con cache y manejo de eventos auth

### ✅ Protección de Rutas

El middleware (`middleware.ts` / `proxy.ts`) protege:
- Rutas `/dashboard/*` requieren autenticación
- Rutas específicas requieren roles (ej: `/dashboard/usuarios` → solo `admin`)
- Usuarios autenticados son redirigidos de `/login` y `/register` a `/dashboard`
- Usuarios no autenticados son redirigidos a `/login`

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://app.supabase.com)
2. Obtén las credenciales en **Settings** → **API**
3. Habilita **Email Auth** en **Authentication** → **Providers**

### 3. Ejecutar el Proyecto

```bash
npm run dev
```

Visita: `http://localhost:3000`

## 📋 Flujo de Usuario

1. **Primera visita** → Redirige a `/login`
2. **Registro** → `/register` → Confirmar email (opcional) → `/login`
3. **Login** → `/login` → Autenticación → `/dashboard`
4. **Navegación** → Dashboard protegido con sidebar
5. **Logout** → Click en "Cerrar Sesión" → `/login`

## 🎨 Diseño

- **Estilo**: Moderno SaaS (inspirado en Stripe/Notion)
- **Colores**: Gradientes azul-púrpura
- **Componentes**: Tailwind CSS
- **Iconos**: Lucide React
- **Responsive**: Diseño adaptativo

## 🔐 Seguridad

- ✅ Sesiones manejadas por Supabase
- ✅ Cookies HTTP-only
- ✅ Protección CSRF
- ✅ Middleware de autenticación
- ✅ Validación de formularios
- ✅ Manejo de errores

## 📁 Estructura de Archivos (Auth & Roles)

```
ingenio-app/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout con Sidebar + Header
│   │   ├── page.tsx                # Dashboard dinámico por rol
│   │   ├── empleados/              # Gestión de empleados
│   │   ├── evaluaciones/           # Evaluaciones 360°
│   │   ├── mis-evaluaciones/       # Mis evaluaciones como reviewer
│   │   ├── mi-feedback/            # Feedback anónimo
│   │   ├── analytics/              # Reportes
│   │   └── usuarios/               # Solo admin
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Registro
│   └── page.tsx                    # Landing / redirección
│
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx             # Navegación dinámica por rol
│       ├── Header.tsx              # Header con usuario
│       ├── DashboardRRHH.tsx     # Dashboard admin/rrhh
│       └── DashboardEmployee.tsx   # Dashboard employee/manager
│
├── hooks/
│   ├── useAuth.ts                  # Autenticación (login, logout, user)
│   └── useCurrentRole.ts           # Rol actual con cache
│
├── lib/
│   ├── auth/
│   │   └── roles.ts                # Definición y validación de roles
│   ├── config/
│   │   └── navigation.ts         # Config de navegación por rol
│   └── supabase/
│       ├── client.ts               # Cliente browser
│       ├── server.ts               # Cliente server
│       └── middleware.ts           # Helper de sesiones
│
└── middleware.ts                   # Protección de rutas + roles
```

## 🧪 Probar la Autenticación

1. **Registro**: Ve a `/register` y crea una cuenta
2. **Login**: Inicia sesión en `/login`
3. **Dashboard**: Verás el dashboard con tu email
4. **Navegación**: Prueba las diferentes secciones
5. **Logout**: Click en "Cerrar Sesión" en el sidebar

## 📝 Notas

- La sesión persiste automáticamente en cookies
- El middleware protege todas las rutas `/dashboard/*`
- El hook `useAuth` se suscribe a cambios de autenticación
- El nombre de usuario se extrae del email (antes del @)
