import { ClipboardCheck, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { ReviewerEvaluationsService } from '@/lib/services/reviewer-evaluations.service'
import PendingEvaluationsTable from '@/components/evaluations/PendingEvaluationsTable'

// ============================================
// PÁGINA: MIS EVALUACIONES - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Mis Evaluaciones | Ingenio',
  description: 'Evaluaciones asignadas para responder',
}

export default async function MyEvaluationsPage() {
  // Obtener evaluaciones del reviewer actual
  const evaluations = await ReviewerEvaluationsService.getMyEvaluations()

  // Calcular estadísticas
  const stats = {
    total: evaluations.length,
    pending: evaluations.filter((e) => e.status === 'pending').length,
    inProgress: evaluations.filter((e) => e.status === 'in_progress').length,
    completed: evaluations.filter((e) => e.completed).length,
  }

  // Stats cards configuration
  const statsConfig = [
    {
      name: 'Total Asignadas',
      value: stats.total.toString(),
      icon: ClipboardCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Pendientes',
      value: stats.pending.toString(),
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      name: 'En Progreso',
      value: stats.inProgress.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Completadas',
      value: stats.completed.toString(),
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Evaluaciones</h1>
        <p className="mt-1 text-sm text-gray-600">
          Evaluaciones asignadas para que respondas
        </p>
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
      <PendingEvaluationsTable evaluations={evaluations} />
    </div>
  )
}
