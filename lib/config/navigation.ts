import {
  LayoutDashboard,
  Users,
  UserCircle,
  ClipboardCheck,
  Calendar,
  FileCheck,
} from 'lucide-react'
import type { NavigationConfig, UserRole, NavigationItem } from '@/types/navigation'

// ============================================
// NAVIGATION CONFIG BY ROLE
// ============================================

export const navigationByRole: NavigationConfig = {
  // ADMIN: Acceso completo
  admin: [
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
      name: 'Usuarios',
      href: '/dashboard/usuarios',
      icon: UserCircle,
    },
  ],

  // RRHH: Sin usuarios
  rrhh: [
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
  ],

  // MANAGER: Dashboard + Evaluaciones
  manager: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
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
  ],

  // EMPLOYEE: Dashboard + Mis Evaluaciones
  employee: [
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
  ],
}

/**
 * Obtiene la navegación para un role específico
 * Retorna navegación mínima si el role no existe
 */
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
