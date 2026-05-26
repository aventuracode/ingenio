import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'

// ============================================
// PÁGINA: ANALYTICS - PLACEHOLDER
// ============================================

export const metadata = {
  title: 'Analytics | Ingenio',
  description: 'Analytics y reportes de evaluaciones',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Reportes y análisis de evaluaciones de desempeño
        </p>
      </div>

      {/* PLACEHOLDER CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: 'Promedio General',
            value: '4.2',
            description: 'De 5.0',
            icon: Target,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
          },
          {
            name: 'Participación',
            value: '87%',
            description: 'Completadas',
            icon: Users,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
          },
          {
            name: 'Tendencia',
            value: '+12%',
            description: 'vs mes anterior',
            icon: TrendingUp,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
          },
          {
            name: 'Reportes',
            value: '24',
            description: 'Generados',
            icon: BarChart3,
            color: 'bg-amber-500',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`rounded-xl ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-0 transition-opacity group-hover:opacity-100`}
              />
            </div>
          )
        })}
      </div>

      {/* PLACEHOLDER MESSAGE */}
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Analytics en Desarrollo
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Los reportes y gráficos detallados estarán disponibles próximamente.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Incluirá: Evolución temporal, comparativas por departamento, skills más valorados, y más.
          </p>
        </div>
      </div>
    </div>
  )
}
