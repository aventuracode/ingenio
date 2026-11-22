import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

// ============================================
// COMPONENT: FORM ALERT
// ============================================

type AlertVariant = 'error' | 'success' | 'info' | 'warning'

const VARIANT_MAP: Record<
  AlertVariant,
  { border: string; bg: string; iconText: string; title: string; message: string }
> = {
  error: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    iconText: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
  },
  success: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    iconText: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
  },
  info: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    iconText: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
  },
  warning: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    iconText: 'text-amber-600',
    title: 'text-amber-900',
    message: 'text-amber-800',
  },
}

const ICON_MAP: Record<AlertVariant, typeof CheckCircle2> = {
  error: XCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
}

interface FormAlertProps {
  variant: AlertVariant
  message: string
  title?: string
}

export default function FormAlert({ variant, message, title }: FormAlertProps) {
  const colors = VARIANT_MAP[variant]
  const Icon = ICON_MAP[variant]

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border ${colors.border} ${colors.bg} p-4`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${colors.iconText}`} />
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${colors.title}`}>{title}</h4>
        )}
        <p className={`${title ? 'mt-1' : ''} text-sm font-medium ${colors.message}`}>
          {message}
        </p>
      </div>
    </div>
  )
}
