import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// ============================================
// COMPONENT: EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className={`text-sm text-gray-600 ${action ? 'mb-6' : ''}`}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
