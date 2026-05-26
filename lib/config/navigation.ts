import {
  LayoutDashboard,
  Users,
  UserCircle,
  ClipboardCheck,
  Calendar,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
  FileText,
  User,
} from 'lucide-react'
import { ROLES, type Role } from '@/lib/auth/roles'
import type { LucideIcon } from 'lucide-react'

// ============================================
// NAVIGATION TYPES
// ============================================

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  description?: string
}

export type NavigationConfig = Record<Role, NavigationItem[]>

// ============================================
// NAVIGATION CONFIG BY ROLE
// ============================================

export const navigationByRole: NavigationConfig = {
  // ADMIN: Acceso completo al sistema
  [ROLES.ADMIN]: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Empleados',
      href: '/dashboard/empleados',
      icon: Users,
    },
    {
      name: 'Evaluaciones',
      href: '/dashboard/evaluaciones',
      icon: ClipboardCheck,
    },
    {
      name: 'Mis Evaluaciones',
      href: '/dashboard/mis-evaluaciones',
      icon: FileCheck,
    },
    {
      name: 'Ciclos',
      href: '/dashboard/evaluaciones/ciclos',
      icon: Calendar,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      name: 'Usuarios',
      href: '/dashboard/usuarios',
      icon: UserCircle,
    },
  ],

  // RRHH: Gestión completa de HR sin usuarios del sistema
  [ROLES.RRHH]: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Empleados',
      href: '/dashboard/empleados',
      icon: Users,
    },
    {
      name: 'Evaluaciones',
      href: '/dashboard/evaluaciones',
      icon: ClipboardCheck,
    },
    {
      name: 'Mis Evaluaciones',
      href: '/dashboard/mis-evaluaciones',
      icon: FileCheck,
    },
    {
      name: 'Ciclos',
      href: '/dashboard/evaluaciones/ciclos',
      icon: Calendar,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
  ],

  // MANAGER: Gestión de equipo y evaluaciones
  [ROLES.MANAGER]: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Mis Evaluaciones',
      href: '/dashboard/mis-evaluaciones',
      icon: FileCheck,
    },
    {
      name: 'Mi Feedback',
      href: '/dashboard/mi-feedback',
      icon: BarChart3,
    },
    {
      name: 'Mi Perfil',
      href: '/dashboard/perfil',
      icon: User,
    },
  ],

  // EMPLOYEE: Acceso personal
  [ROLES.EMPLOYEE]: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Mis Evaluaciones',
      href: '/dashboard/mis-evaluaciones',
      icon: FileCheck,
    },
    {
      name: 'Mi Feedback',
      href: '/dashboard/mi-feedback',
      icon: BarChart3,
    },
    {
      name: 'Mi Perfil',
      href: '/dashboard/perfil',
      icon: User,
    },
  ],
}

// ============================================
// NAVIGATION HELPERS
// ============================================

/**
 * Obtiene la navegación para un role específico
 * Retorna navegación mínima si el role no existe
 */
export function getNavigationForRole(role: Role | null): NavigationItem[] {
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

/**
 * Verifica si una ruta está en la navegación del role
 */
export function isRouteAllowedForRole(role: Role | null, path: string): boolean {
  if (!role) return false
  
  const navigation = getNavigationForRole(role)
  return navigation.some((item) => path.startsWith(item.href))
}

/**
 * Obtiene el item de navegación activo basado en el pathname
 */
export function getActiveNavigationItem(
  role: Role | null,
  pathname: string
): NavigationItem | null {
  if (!role) return null
  
  const navigation = getNavigationForRole(role)
  
  // Buscar coincidencia exacta primero
  const exactMatch = navigation.find((item) => item.href === pathname)
  if (exactMatch) return exactMatch
  
  // Buscar coincidencia por prefijo (más específico primero)
  const sortedNav = [...navigation].sort((a, b) => b.href.length - a.href.length)
  return sortedNav.find((item) => pathname.startsWith(item.href)) || null
}
