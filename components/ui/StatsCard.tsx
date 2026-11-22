import type { LucideIcon } from 'lucide-react'

// ============================================
// COMPONENT: STATS CARD + STATS GRID
// ============================================
// Las clases de color deben ser literales para que Tailwind no las purgue.

export type StatColor = 'blue' | 'amber' | 'green' | 'purple' | 'gray' | 'red' | 'indigo'

const COLOR_MAP: Record<StatColor, { bar: string; bg: string; text: string }> = {
  blue: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  amber: { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  green: { bar: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  gray: { bar: 'bg-gray-500', bg: 'bg-gray-50', text: 'text-gray-600' },
  red: { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
  indigo: { bar: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
}

export interface StatItem {
  name: string
  value: string
  description?: string
  suffix?: string
  icon: LucideIcon
  color: StatColor
}

export function StatsCard({
  name,
  value,
  description,
  suffix,
  icon: Icon,
  color,
}: StatItem) {
  const colors = COLOR_MAP[color]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {suffix && (
              <span className="text-lg font-medium text-gray-500">{suffix}</span>
            )}
          </p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={`rounded-xl ${colors.bg} p-3`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${colors.bar} opacity-0 transition-opacity group-hover:opacity-100`}
      />
    </div>
  )
}

export function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatsCard key={stat.name} {...stat} />
      ))}
    </div>
  )
}
