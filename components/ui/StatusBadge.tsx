import { Clock, User, CheckCircle2, XCircle } from 'lucide-react'
import {
  getEvaluationStatusLabel,
  getEvaluationStatusStyle,
  type EvaluationStatus,
} from '@/types/evaluation'

// ============================================
// COMPONENT: STATUS BADGE
// ============================================
// Badge de estado de evaluación con icono según estado.

const ICON_MAP: Record<string, typeof Clock | null> = {
  pending: Clock,
  in_progress: User,
  completed: CheckCircle2,
  cancelled: XCircle,
}

interface StatusBadgeProps {
  status: EvaluationStatus | string
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const Icon = ICON_MAP[status] ?? null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getEvaluationStatusStyle(status)}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label ?? getEvaluationStatusLabel(status)}
    </span>
  )
}
