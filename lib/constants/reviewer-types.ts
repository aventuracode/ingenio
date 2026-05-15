// ============================================
// CONSTANTS: REVIEWER TYPES
// ============================================

export const REVIEWER_TYPE_LABELS: Record<string, string> = {
  self: 'Autoevaluación',
  manager: 'Supervisor',
  peer: 'Par/Colega',
  subordinate: 'Subordinado',
}

export const REVIEWER_TYPE_COLORS: Record<
  string,
  {
    bg: string
    text: string
    border: string
  }
> = {
  self: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  manager: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  peer: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  subordinate: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
}

export function getReviewerTypeLabel(type: string): string {
  return REVIEWER_TYPE_LABELS[type] || type
}

export function getReviewerTypeColors(type: string) {
  return REVIEWER_TYPE_COLORS[type] || REVIEWER_TYPE_COLORS.peer
}
