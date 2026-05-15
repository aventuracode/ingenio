// ============================================
// TIPOS BASE DE SUPABASE (SCHEMA REAL)
// ============================================

export type EvaluationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type ReviewerType = 'manager' | 'peer' | 'subordinate' | 'self' | 'client'

// ============================================
// TABLAS DE BASE DE DATOS (EXACTAS)
// ============================================

export interface Employee {
  id: string
  nombre: string
  apellido: string
  dni: string
  email?: string
  puesto?: string
  fecha_ingreso: string
  activo?: boolean
  avatar_url?: string
  user_id?: string
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export interface EvaluationCycle {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: string // 'draft' | 'active' | 'closed'
  created_by?: string
  created_at?: string
}

export interface Evaluation {
  id: string
  cycle_id?: string
  employee_id?: string
  status?: string // 'pending' | 'in_progress' | 'completed'
  created_at?: string
}

export interface EvaluationReviewer {
  id: string
  evaluation_id?: string
  reviewer_employee_id?: string
  reviewer_type: string // 'manager' | 'peer' | 'subordinate' | 'self'
  completed?: boolean
  created_at?: string
}

export interface EvaluationAnswer {
  id: string
  evaluation_id?: string
  reviewer_employee_id?: string
  question_id?: string
  score: number
  comment?: string
  created_at?: string
}

export interface EvaluationQuestion {
  id: string
  question: string
  category: string
  active?: boolean
  created_at?: string
}

// ============================================
// TIPOS CON RELACIONES (JOINS)
// ============================================

export interface EvaluationWithRelations extends Evaluation {
  employee: Employee
  cycle: EvaluationCycle
  reviewers: Array<EvaluationReviewer & {
    reviewer: Employee
  }>
}

// ============================================
// TIPOS PARA LA UI
// ============================================

export interface EvaluationListItem {
  id: string
  empleado: {
    id: string
    nombre: string
    apellido: string
    puesto: string
    avatar: string | null
  }
  ciclo: {
    id: string
    nombre: string
  }
  estado: string
  estadoRaw: string
  progreso: {
    completados: number
    total: number
    porcentaje: number
  }
  puntaje: number | null
  fecha: string
}

export interface EvaluationStats {
  activas: number
  pendientes: number
  finalizadas: number
  promedioGeneral: number
}

// ============================================
// TIPOS PARA CREACIÓN DE EVALUACIONES
// ============================================

export interface EmployeeOption {
  id: string
  nombre: string
  apellido: string
  puesto?: string
  avatar_url?: string
  email?: string
}

export interface EvaluationCycleOption {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: string
}

export interface ReviewerSelection {
  employee: EmployeeOption
  reviewerType: ReviewerType
}

export interface CreateEvaluationPayload {
  cycle_id: string
  employee_id: string
  status: string
}

export interface CreateReviewerPayload {
  evaluation_id: string
  reviewer_employee_id: string
  reviewer_type: string
  completed: boolean
}

// ============================================
// HELPERS DE TRANSFORMACIÓN
// ============================================

export const EVALUATION_STATUS_LABELS: Record<string, string> = {
  'pending': 'Pendiente',
  'in_progress': 'En progreso',
  'completed': 'Finalizada',
  'cancelled': 'Cancelada',
}

export const EVALUATION_STATUS_STYLES: Record<string, string> = {
  'pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'in_progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
}

// ============================================
// FUNCIONES HELPER
// ============================================

export function getEvaluationStatusLabel(status: string): string {
  return EVALUATION_STATUS_LABELS[status] || status
}

export function getEvaluationStatusStyle(status: string): string {
  return EVALUATION_STATUS_STYLES[status] || EVALUATION_STATUS_STYLES.pending
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function transformEvaluationForUI(
  evaluation: EvaluationWithRelations
): EvaluationListItem {
  const completedReviewers = evaluation.reviewers.filter(
    (r) => r.completed === true
  ).length
  const totalReviewers = evaluation.reviewers.length

  // Calcular puntaje promedio de reviewers completados
  const reviewersWithScores = evaluation.reviewers.filter(r => r.completed)
  let averageScore: number | null = null
  
  if (reviewersWithScores.length > 0) {
    // Obtener todas las respuestas de estos reviewers
    const allScores: number[] = []
    // Nota: Necesitarás incluir las answers en el query
    // Por ahora retornamos null hasta que tengamos las answers
  }

  return {
    id: evaluation.id,
    empleado: {
      id: evaluation.employee.id,
      nombre: evaluation.employee.nombre,
      apellido: evaluation.employee.apellido,
      puesto: evaluation.employee.puesto || 'Sin puesto',
      avatar: evaluation.employee.avatar_url || null,
    },
    ciclo: {
      id: evaluation.cycle?.id || '',
      nombre: evaluation.cycle?.title || 'Sin ciclo',
    },
    estado: getEvaluationStatusLabel(evaluation.status || 'pending'),
    estadoRaw: evaluation.status || 'pending',
    progreso: {
      completados: completedReviewers,
      total: totalReviewers,
      porcentaje: calculateProgress(completedReviewers, totalReviewers),
    },
    puntaje: averageScore,
    fecha: evaluation.created_at || new Date().toISOString(),
  }
}
