import { Plus, Calendar, TrendingUp, Archive, FileText } from 'lucide-react'
import Link from 'next/link'
import { EvaluationCyclesService } from '@/lib/services/evaluation-cycles.service'
import CycleTable from '@/components/evaluations/CycleTable'

// ============================================
// PÁGINA: CICLOS DE EVALUACIÓN - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Ciclos de Evaluación | Ingenio',
  description: 'Gestiona los ciclos de evaluación de desempeño',
}

export default async function CyclesPage() {
  // Fetch data en paralelo
  const [cycles, stats] = await Promise.all([
    EvaluationCyclesService.getCycles(),
    EvaluationCyclesService.getCycleStats(),
  ])

  // Stats cards configuration
  const statsConfig = [
    {
      name: 'Total de Ciclos',
      value: stats.total.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Ciclos Activos',
      value: stats.active.toString(),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Borradores',
      value: stats.draft.toString(),
      icon: Calendar,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
    },
    {
      name: 'Completados',
      value: stats.completed.toString(),
      icon: Archive,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ciclos de Evaluación
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los períodos de evaluación de desempeño
          </p>
        </div>
        <Link
          href="/dashboard/evaluaciones/ciclos/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Ciclo
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
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

      {/* TABLE */}
      <CycleTable cycles={cycles} />
    </div>
  )
}
