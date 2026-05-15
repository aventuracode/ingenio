// ============================================
// TYPES: REVIEWER EVALUATIONS
// ============================================

export type ReviewerEvaluationStatus = 'pending' | 'in_progress' | 'completed'

// ============================================
// INTERFACES BASE
// ============================================

export interface ReviewerEvaluation {
  id: string
  evaluation_id: string
  reviewer_employee_id: string
  reviewer_type: string
  completed: boolean
  created_at: string
}

export interface EvaluationQuestion {
  id: string
  question: string
  category?: string
  active: boolean
}

export interface EvaluationAnswer {
  id: string
  evaluation_id: string
  reviewer_employee_id: string
  question_id: string
  score: number
  comment?: string
  created_at?: string
}

// ============================================
// INTERFACES CON RELACIONES
// ============================================

export interface ReviewerEvaluationWithDetails {
  id: string
  evaluation_id: string
  reviewer_employee_id: string
  reviewer_type: string
  completed: boolean
  created_at: string
  evaluation: {
    id: string
    cycle_id: string
    employee_id: string
    status: string
    created_at: string
    employee: {
      id: string
      nombre: string
      apellido: string
      puesto?: string
      avatar_url?: string
      email?: string
    }
    cycle: {
      id: string
      title: string
      description?: string
      start_date?: string
      end_date?: string
    }
  }
}

// ============================================
// PAYLOADS
// ============================================

export interface ReviewerAnswerPayload {
  evaluation_id: string
  reviewer_employee_id: string
  question_id: string
  score: number
  comment?: string
}

export interface SubmitEvaluationPayload {
  evaluation_id: string
  reviewer_employee_id: string
  answers: Array<{
    question_id: string
    score: number
    comment?: string
  }>
}

// ============================================
// UI TYPES
// ============================================

export interface MyEvaluationListItem {
  id: string
  evaluationId: string
  employeeName: string
  employeeLastName: string
  employeePosition: string
  employeeAvatar: string | null
  cycleTitle: string
  reviewerType: string
  reviewerTypeLabel: string
  completed: boolean
  status: ReviewerEvaluationStatus
  statusLabel: string
  progress: number
  totalQuestions: number
  answeredQuestions: number
  createdAt: string
  canRespond: boolean
}

export interface QuestionWithAnswer {
  id: string
  question: string
  category: string
  score: number | null
  comment: string
}

export interface EvaluationDetailForReviewer {
  id: string
  evaluationId: string
  employeeName: string
  employeeLastName: string
  employeePosition: string
  employeeAvatar: string | null
  cycleTitle: string
  cycleDescription: string
  reviewerType: string
  reviewerTypeLabel: string
  completed: boolean
  questions: QuestionWithAnswer[]
  totalQuestions: number
  answeredQuestions: number
  progress: number
}
