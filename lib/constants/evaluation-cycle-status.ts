import type { EvaluationCycleStatus } from '@/types/evaluation-cycle'

// ============================================
// CONSTANTS: EVALUATION CYCLE STATUS
// ============================================

export const CYCLE_STATUS_LABELS: Record<EvaluationCycleStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  archived: 'Archivado',
}

export const CYCLE_STATUS_COLORS: Record<
  EvaluationCycleStatus,
  {
    bg: string
    text: string
    border: string
    dot: string
  }
> = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  },
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  archived: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
}

export const CYCLE_STATUS_OPTIONS: Array<{
  value: EvaluationCycleStatus
  label: string
  description: string
}> = [
  {
    value: 'draft',
    label: 'Borrador',
    description: 'Ciclo en preparación, no visible para empleados',
  },
  {
    value: 'active',
    label: 'Activo',
    description: 'Ciclo en curso, evaluaciones pueden crearse',
  },
  {
    value: 'completed',
    label: 'Completado',
    description: 'Ciclo finalizado, evaluaciones completadas',
  },
  {
    value: 'archived',
    label: 'Archivado',
    description: 'Ciclo archivado, solo lectura',
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCycleStatusLabel(status: EvaluationCycleStatus): string {
  return CYCLE_STATUS_LABELS[status] || status
}

export function getCycleStatusColors(status: EvaluationCycleStatus) {
  return CYCLE_STATUS_COLORS[status] || CYCLE_STATUS_COLORS.draft
}

export function canEditCycle(status: EvaluationCycleStatus): boolean {
  return status === 'draft' || status === 'active'
}

export function canDeleteCycle(
  status: EvaluationCycleStatus,
  evaluationsCount: number
): boolean {
  return status === 'draft' && evaluationsCount === 0
}

export function canActivateCycle(status: EvaluationCycleStatus): boolean {
  return status === 'draft'
}

export function canCompleteCycle(status: EvaluationCycleStatus): boolean {
  return status === 'active'
}

export function canArchiveCycle(status: EvaluationCycleStatus): boolean {
  return status === 'completed'
}
