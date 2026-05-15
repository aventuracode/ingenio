// ============================================
// TYPES: EVALUATION CYCLES
// ============================================

export type EvaluationCycleStatus = 'draft' | 'active' | 'completed' | 'archived'

// ============================================
// INTERFACES BASE
// ============================================

export interface EvaluationCycle {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: EvaluationCycleStatus
  created_by?: string
  created_at?: string
}

export interface EvaluationCycleWithStats extends EvaluationCycle {
  evaluations_count: number
  completed_evaluations: number
  pending_evaluations: number
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateEvaluationCyclePayload {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status: EvaluationCycleStatus
}

export interface UpdateEvaluationCyclePayload {
  title?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: EvaluationCycleStatus
}

// ============================================
// UI TYPES
// ============================================

export interface EvaluationCycleListItem {
  id: string
  title: string
  description: string
  startDate: string | null
  endDate: string | null
  status: EvaluationCycleStatus
  statusLabel: string
  evaluationsCount: number
  completedCount: number
  pendingCount: number
  createdAt: string
  isActive: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface CycleFormData {
  title: string
  description: string
  start_date: string
  end_date: string
  status: EvaluationCycleStatus
}
