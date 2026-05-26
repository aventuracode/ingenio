import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { isValidRole } from '@/lib/auth/roles'
import { isRouteAllowedForRole } from '@/lib/config/navigation'

// ============================================
// MIDDLEWARE: AUTH + ROLE-BASED PROTECTION
// ============================================

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/set-password']

/**
 * Rutas protegidas que requieren roles específicos
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/dashboard/usuarios': ['admin'],
  '/dashboard/empleados/new': ['admin', 'rrhh'],
  '/dashboard/empleados': ['admin', 'rrhh', 'manager'],
  '/dashboard/evaluaciones/new': ['admin', 'rrhh', 'manager'],
  '/dashboard/evaluaciones/ciclos': ['admin', 'rrhh'],
  '/dashboard/analytics': ['admin', 'rrhh'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Actualizar sesión de Supabase
  const response = await updateSession(request)

  // 2. Verificar si es ruta pública
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return response
  }

  // 3. Verificar autenticación para rutas protegidas
  if (pathname.startsWith('/dashboard')) {
    // Crear cliente de Supabase para el middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Obtener usuario
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Si no hay usuario, redirigir a login
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Obtener role del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role:roles!profiles_role_id_fkey(name)')
      .eq('id', user.id)
      .single()

    const roleName = (profile?.role as any)?.name as string | undefined
    const userRole = roleName && isValidRole(roleName) ? roleName : null

    // Si no tiene role válido, redirigir a error
    if (!userRole) {
      return NextResponse.redirect(new URL('/error?code=no_role', request.url))
    }

    // 4. Verificar permisos para rutas específicas
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirigir a dashboard con mensaje de error
          const redirectUrl = new URL('/dashboard', request.url)
          redirectUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // 5. Verificar que la ruta esté en la navegación del role
    // (esto previene acceso a rutas que no están en el sidebar)
    if (!isRouteAllowedForRole(userRole, pathname)) {
      // Permitir subrutas de rutas permitidas
      const isSubroute = isRouteAllowedForRole(
        userRole,
        pathname.split('/').slice(0, -1).join('/')
      )

      if (!isSubroute) {
        const redirectUrl = new URL('/dashboard', request.url)
        redirectUrl.searchParams.set('error', 'forbidden')
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
