import type { LucideIcon } from 'lucide-react'

// ============================================
// TYPES: NAVIGATION
// ============================================

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
