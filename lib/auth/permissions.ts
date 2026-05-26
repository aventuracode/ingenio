import { ROLES, type Role } from './roles'

// ============================================
// PERMISOS DEL SISTEMA
// ============================================

/**
 * Permisos disponibles en el sistema
 * Desacoplados de los roles para mayor flexibilidad
 */
export const PERMISSIONS = {
  // Usuarios del sistema
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Roles
  MANAGE_ROLES: 'manage_roles',
  VIEW_ROLES: 'view_roles',
  
  // Empleados
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_EMPLOYEES: 'view_employees',
  CREATE_EMPLOYEES: 'create_employees',
  EDIT_EMPLOYEES: 'edit_employees',
  DELETE_EMPLOYEES: 'delete_employees',
  
  // Evaluaciones
  MANAGE_EVALUATIONS: 'manage_evaluations',
  VIEW_ALL_EVALUATIONS: 'view_all_evaluations',
  CREATE_EVALUATIONS: 'create_evaluations',
  EDIT_EVALUATIONS: 'edit_evaluations',
  DELETE_EVALUATIONS: 'delete_evaluations',
  VIEW_OWN_EVALUATIONS: 'view_own_evaluations',
  RESPOND_EVALUATIONS: 'respond_evaluations',
  
  // Ciclos de evaluación
  MANAGE_CYCLES: 'manage_cycles',
  VIEW_CYCLES: 'view_cycles',
  CREATE_CYCLES: 'create_cycles',
  EDIT_CYCLES: 'edit_cycles',
  DELETE_CYCLES: 'delete_cycles',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_COMPANY_ANALYTICS: 'view_company_analytics',
  VIEW_TEAM_ANALYTICS: 'view_team_analytics',
  VIEW_OWN_ANALYTICS: 'view_own_analytics',
  
  // Configuración
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  
  // Auditoría
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  
  // Perfil
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Permisos asignados a cada role
 * Permite gestión granular de accesos
 */
export const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Admin tiene TODOS los permisos
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.CREATE_EMPLOYEES,
    PERMISSIONS.EDIT_EMPLOYEES,
    PERMISSIONS.DELETE_EMPLOYEES,
    PERMISSIONS.MANAGE_EVALUATIONS,
    PERMISSIONS.VIEW_ALL_EVALUATIONS,
    PERMISSIONS.CREATE_EVALUATIONS,
    PERMISSIONS.EDIT_EVALUATIONS,
    PERMISSIONS.DELETE_EVALUATIONS,
    PERMISSIONS.VIEW_OWN_EVALUATIONS,
    PERMISSIONS.RESPOND_EVALUATIONS,
    PERMISSIONS.MANAGE_CYCLES,
    PERMISSIONS.VIEW_CYCLES,
    PERMISSIONS.CREATE_CYCLES,
    PERMISSIONS.EDIT_CYCLES,
    PERMISSIONS.DELETE_CYCLES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_COMPANY_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.VIEW_OWN_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],

  [ROLES.RRHH]: [
    // RRHH: Gestión completa de HR sin usuarios del sistema
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.CREATE_EMPLOYEES,
    PERMISSIONS.EDIT_EMPLOYEES,
    PERMISSIONS.DELETE_EMPLOYEES,
    PERMISSIONS.VIEW_ALL_EVALUATIONS,
    PERMISSIONS.MANAGE_EVALUATIONS,
    PERMISSIONS.CREATE_EVALUATIONS,
    PERMISSIONS.EDIT_EVALUATIONS,
    PERMISSIONS.DELETE_EVALUATIONS,
    PERMISSIONS.VIEW_OWN_EVALUATIONS,
    PERMISSIONS.RESPOND_EVALUATIONS,
    PERMISSIONS.VIEW_CYCLES,
    PERMISSIONS.MANAGE_CYCLES,
    PERMISSIONS.CREATE_CYCLES,
    PERMISSIONS.EDIT_CYCLES,
    PERMISSIONS.DELETE_CYCLES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_COMPANY_ANALYTICS,
    PERMISSIONS.VIEW_OWN_ANALYTICS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],

  [ROLES.MANAGER]: [
    // Manager: Gestión de equipo y evaluaciones
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ALL_EVALUATIONS,
    PERMISSIONS.CREATE_EVALUATIONS,
    PERMISSIONS.VIEW_OWN_EVALUATIONS,
    PERMISSIONS.RESPOND_EVALUATIONS,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.VIEW_OWN_ANALYTICS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],

  [ROLES.EMPLOYEE]: [
    // Employee: Solo acceso personal
    PERMISSIONS.VIEW_OWN_EVALUATIONS,
    PERMISSIONS.RESPOND_EVALUATIONS,
    PERMISSIONS.VIEW_OWN_ANALYTICS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
}

/**
 * Verifica si un role tiene un permiso específico
 * 
 * @example
 * can(ROLES.ADMIN, PERMISSIONS.MANAGE_USERS) // true
 * can(ROLES.EMPLOYEE, PERMISSIONS.MANAGE_USERS) // false
 */
export function can(role: Role | null, permission: Permission): boolean {
  if (!role) return false
  
  const rolePermissions = PERMISSIONS_BY_ROLE[role]
  if (!rolePermissions) return false
  
  return rolePermissions.includes(permission)
}

/**
 * Verifica si un role tiene TODOS los permisos especificados
 */
export function canAll(role: Role | null, permissions: Permission[]): boolean {
  if (!role) return false
  
  return permissions.every((permission) => can(role, permission))
}

/**
 * Verifica si un role tiene AL MENOS UNO de los permisos especificados
 */
export function canAny(role: Role | null, permissions: Permission[]): boolean {
  if (!role) return false
  
  return permissions.some((permission) => can(role, permission))
}

/**
 * Obtiene todos los permisos de un role
 */
export function getPermissions(role: Role): Permission[] {
  return PERMISSIONS_BY_ROLE[role] || []
}

/**
 * Verifica si un role puede gestionar empleados
 */
export function canManageEmployees(role: Role | null): boolean {
  return can(role, PERMISSIONS.MANAGE_EMPLOYEES)
}

/**
 * Verifica si un role puede gestionar evaluaciones
 */
export function canManageEvaluations(role: Role | null): boolean {
  return can(role, PERMISSIONS.MANAGE_EVALUATIONS)
}

/**
 * Verifica si un role puede ver analytics de la empresa
 */
export function canViewCompanyAnalytics(role: Role | null): boolean {
  return can(role, PERMISSIONS.VIEW_COMPANY_ANALYTICS)
}

/**
 * Verifica si un role puede gestionar usuarios del sistema
 */
export function canManageUsers(role: Role | null): boolean {
  return can(role, PERMISSIONS.MANAGE_USERS)
}
