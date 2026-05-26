// ============================================
// ROLES CENTRALIZADOS
// ============================================

/**
 * Roles del sistema
 * Usar estas constantes en lugar de strings mágicos
 */
export const ROLES = {
  ADMIN: 'admin',
  RRHH: 'rrhh',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const

/**
 * Tipo Role derivado de las constantes
 * Garantiza type-safety en toda la aplicación
 */
export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Array de todos los roles disponibles
 * Útil para validaciones y selects
 */
export const ALL_ROLES: Role[] = Object.values(ROLES)

/**
 * Labels legibles para cada role
 */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RRHH]: 'Recursos Humanos',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.EMPLOYEE]: 'Empleado',
}

/**
 * Descripciones de cada role
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Acceso completo al sistema',
  [ROLES.RRHH]: 'Gestión de empleados y evaluaciones',
  [ROLES.MANAGER]: 'Gestión de equipo y evaluaciones',
  [ROLES.EMPLOYEE]: 'Acceso básico y evaluaciones personales',
}

/**
 * Jerarquía de roles (mayor a menor privilegio)
 */
export const ROLE_HIERARCHY: Role[] = [
  ROLES.ADMIN,
  ROLES.RRHH,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
]

/**
 * Verifica si un role es válido
 */
export function isValidRole(role: string): role is Role {
  return ALL_ROLES.includes(role as Role)
}

/**
 * Obtiene el label de un role
 */
export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] || role
}

/**
 * Obtiene la descripción de un role
 */
export function getRoleDescription(role: Role): string {
  return ROLE_DESCRIPTIONS[role] || ''
}

/**
 * Verifica si un role tiene mayor o igual privilegio que otro
 */
export function hasHigherOrEqualPrivilege(role: Role, targetRole: Role): boolean {
  const roleIndex = ROLE_HIERARCHY.indexOf(role)
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole)
  
  if (roleIndex === -1 || targetIndex === -1) {
    return false
  }
  
  return roleIndex <= targetIndex
}
