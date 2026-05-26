// ============================================
// DTOs SEGUROS PARA EVALUACIONES 360°
// ============================================

import type { Role } from '@/lib/auth/roles'

/**
 * DTO para feedback anónimo de employees
 * NO incluye reviewer_employee_id para mantener anonimato
 */
export interface EmployeeFeedbackDTO {
  id: string
  score: number
  comment: string | null
  category: string
  createdAt: string
}

/**
 * DTO para estadísticas de feedback del employee
 */
export interface EmployeeFeedbackStatsDTO {
  averageScore: number
  totalReviews: number
  scoresByCategory: {
    category: string
    averageScore: number
    count: number
  }[]
  recentFeedback: EmployeeFeedbackDTO[]
  strengths: string[]
  improvements: string[]
  trend: 'up' | 'down' | 'stable'
}

/**
 * DTO para reviewer con información completa (RRHH/Admin)
 */
export interface ReviewerDTO {
  id: string
  evaluationId: string
  reviewerEmployeeId: string
  reviewerType: 'manager' | 'peer' | 'subordinate' | 'self'
  completed: boolean
  createdAt: string
  reviewer: {
    id: string
    nombre: string
    apellido: string
    email: string
    puesto: string
    avatarUrl: string | null
  }
}

/**
 * DTO para asignación de reviewer (sin datos sensibles)
 */
export interface ReviewerAssignmentDTO {
  id: string
  evaluationId: string
  reviewerType: 'manager' | 'peer' | 'subordinate' | 'self'
  completed: boolean
  createdAt: string
}

/**
 * DTO para evaluación completa (RRHH/Admin)
 */
export interface EvaluationDetailDTO {
  id: string
  employeeId: string
  cycleId: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    nombre: string
    apellido: string
    email: string
    puesto: string
    avatarUrl: string | null
  }
  cycle: {
    id: string
    title: string
    description: string | null
    startDate: string
    endDate: string
    status: string
  }
  reviewers: ReviewerDTO[]
  progress: {
    total: number
    completed: number
    percentage: number
  }
  averageScore: number | null
}

/**
 * DTO para evaluación del employee (vista limitada)
 */
export interface EmployeeEvaluationDTO {
  id: string
  cycleId: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
  cycle: {
    id: string
    title: string
    description: string | null
    startDate: string
    endDate: string
  }
  progress: {
    total: number
    completed: number
    percentage: number
  }
  averageScore: number | null
  canViewFeedback: boolean
}

/**
 * DTO para respuesta de evaluación (RRHH/Admin)
 */
export interface EvaluationAnswerDTO {
  id: string
  evaluationId: string
  reviewerEmployeeId: string
  questionId: string
  score: number
  comment: string | null
  category: string
  createdAt: string
  reviewer: {
    id: string
    nombre: string
    apellido: string
    puesto: string
  }
}

/**
 * DTO para respuesta de reviewer (vista propia)
 */
export interface ReviewerAnswerDTO {
  id: string
  evaluationId: string
  questionId: string
  score: number
  comment: string | null
  category: string
  createdAt: string
}

/**
 * DTO para estadísticas globales (RRHH/Admin)
 */
export interface GlobalEvaluationStatsDTO {
  totalEvaluations: number
  activeEvaluations: number
  pendingEvaluations: number
  completedEvaluations: number
  averageCompanyScore: number
  totalEmployeesEvaluated: number
  completionRate: number
  topPerformers: {
    employeeId: string
    nombre: string
    apellido: string
    puesto: string
    averageScore: number
  }[]
  lowPerformers: {
    employeeId: string
    nombre: string
    apellido: string
    puesto: string
    averageScore: number
  }[]
}

/**
 * DTO para evaluación asignada a reviewer
 */
export interface AssignedEvaluationDTO {
  id: string
  employeeId: string
  cycleId: string
  reviewerType: 'manager' | 'peer' | 'subordinate' | 'self'
  completed: boolean
  employee: {
    id: string
    nombre: string
    apellido: string
    puesto: string
    avatarUrl: string | null
  }
  cycle: {
    id: string
    title: string
    endDate: string
  }
  myAnswers: ReviewerAnswerDTO[]
}

/**
 * Helper para determinar qué DTO usar según el role
 */
export type EvaluationDTOByRole<T extends Role> = T extends 'admin' | 'rrhh'
  ? EvaluationDetailDTO
  : T extends 'employee'
  ? EmployeeEvaluationDTO
  : AssignedEvaluationDTO

/**
 * Tipo para filtros de evaluaciones
 */
export interface EvaluationFilters {
  status?: 'pending' | 'in_progress' | 'completed'
  cycleId?: string
  employeeId?: string
  startDate?: string
  endDate?: string
}

/**
 * Tipo para paginación
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * Tipo para respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
