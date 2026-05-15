import type { EvaluationCycleStatus } from '@/types/evaluation-cycle'
import {
  getCycleStatusLabel,
  getCycleStatusColors,
} from '@/lib/constants/evaluation-cycle-status'

// ============================================
// COMPONENT: CYCLE STATUS BADGE
// ============================================

interface CycleStatusBadgeProps {
  status: EvaluationCycleStatus
  showDot?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function CycleStatusBadge({
  status,
  showDot = true,
  size = 'md',
}: CycleStatusBadgeProps) {
  const colors = getCycleStatusColors(status)
  const label = getCycleStatusLabel(status)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`rounded-full ${colors.dot} ${dotSizeClasses[size]}`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}
