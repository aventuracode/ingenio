import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// ============================================
// COMPONENT: FORM SECTION
// ============================================
// Card de sección de formulario: icono en cuadrado de color + título/subtítulo.

export type SectionColor = 'blue' | 'amber' | 'green' | 'purple' | 'indigo' | 'gray'

const COLOR_MAP: Record<SectionColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

interface FormSectionProps {
  icon: LucideIcon
  iconColor: SectionColor
  title: string
  description?: string
  children: ReactNode
}

export default function FormSection({
  icon: Icon,
  iconColor,
  title,
  description,
  children,
}: FormSectionProps) {
  const colors = COLOR_MAP[iconColor]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-lg ${colors.bg} p-2`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
