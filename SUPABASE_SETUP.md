# Configuración de Supabase

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Obtener las credenciales

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Configurar Authentication

1. En Supabase Dashboard, ve a **Authentication** → **Providers**
2. Habilita **Email** provider
3. Configura las opciones según tus necesidades:
   - **Enable email confirmations**: Si quieres que los usuarios confirmen su email
   - **Secure email change**: Recomendado para producción

## Estructura de Autenticación

El proyecto ya incluye:

- ✅ Cliente de Supabase para navegador (`lib/supabase/client.ts`)
- ✅ Cliente de Supabase para servidor (`lib/supabase/server.ts`)
- ✅ Middleware para manejo de sesiones (`lib/supabase/middleware.ts`)
- ✅ Hook personalizado `useAuth` (`hooks/useAuth.ts`)
- ✅ Páginas de Login y Registro
- ✅ Protección de rutas automática
- ✅ Persistencia de sesión

## Rutas

- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/dashboard` - Dashboard protegido (requiere autenticación)

## Flujo de Autenticación

1. Usuario se registra en `/register`
2. Supabase envía email de confirmación (si está habilitado)
3. Usuario inicia sesión en `/login`
4. Middleware verifica la sesión y redirige a `/dashboard`
5. Usuario puede cerrar sesión desde el sidebar
