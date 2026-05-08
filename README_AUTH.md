# Sistema de Autenticación con Supabase

## 🎯 Características Implementadas

### ✅ Autenticación Completa
- **Login** con email y password
- **Registro** de nuevos usuarios
- **Logout** funcional
- **Persistencia de sesión** automática
- **Protección de rutas** mediante middleware

### ✅ Componentes y Páginas

#### Páginas de Autenticación
- `app/login/page.tsx` - Página de inicio de sesión
- `app/register/page.tsx` - Página de registro con validación

#### Dashboard
- `app/dashboard/layout.tsx` - Layout principal del dashboard
- `app/dashboard/page.tsx` - Página principal con KPIs
- `app/dashboard/empleados/page.tsx` - Gestión de empleados
- `app/dashboard/usuarios/page.tsx` - Gestión de usuarios

#### Componentes Reutilizables
- `components/dashboard/Sidebar.tsx` - Sidebar con navegación y logout
- `components/dashboard/Header.tsx` - Header con info del usuario

### ✅ Infraestructura de Supabase

#### Clientes
- `lib/supabase/client.ts` - Cliente para componentes del navegador
- `lib/supabase/server.ts` - Cliente para Server Components
- `lib/supabase/middleware.ts` - Manejo de sesiones en middleware

#### Hooks
- `hooks/useAuth.ts` - Hook personalizado con:
  - `user` - Usuario actual
  - `loading` - Estado de carga
  - `login(email, password)` - Función de login
  - `register(email, password)` - Función de registro
  - `logout()` - Función de logout

### ✅ Protección de Rutas

El middleware (`middleware.ts`) protege automáticamente:
- Rutas `/dashboard/*` requieren autenticación
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

## 📁 Estructura de Archivos

```
ingenio-app/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout del dashboard
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── empleados/page.tsx
│   │   └── usuarios/page.tsx
│   ├── login/page.tsx          # Página de login
│   ├── register/page.tsx       # Página de registro
│   └── page.tsx                # Redirección automática
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx         # Sidebar con logout
│       └── Header.tsx          # Header con usuario
├── hooks/
│   └── useAuth.ts              # Hook de autenticación
├── lib/
│   └── supabase/
│       ├── client.ts           # Cliente browser
│       ├── server.ts           # Cliente server
│       └── middleware.ts       # Middleware helper
└── middleware.ts               # Protección de rutas
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
