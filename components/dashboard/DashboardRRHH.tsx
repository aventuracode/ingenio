import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import { getEvaluationStatusStyle } from '@/types/evaluation'

export default async function DashboardRRHH() {
  // Obtener estadísticas de evaluaciones
  const stats = await EvaluationsService.getEvaluationStats()

  // Obtener evaluaciones recientes
  const evaluations = await EvaluationsService.getEvaluations()
  const recentEvaluations = evaluations.slice(0, 5)
  const pendingEvaluations = evaluations
    .filter((e) => e.estadoRaw === 'pending' || e.estadoRaw === 'in_progress')
    .slice(0, 5)

  // Stats cards configuration
  const statsCards = [
    {
      name: 'Evaluaciones Activas',
      value: stats.activas.toString(),
      description: 'En progreso',
      icon: ClipboardCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Pendientes',
      value: stats.pendientes.toString(),
      description: 'Sin iniciar',
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      name: 'Finalizadas',
      value: stats.finalizadas.toString(),
      description: 'Completadas',
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Promedio Empresa',
      value: stats.promedioGeneral > 0 ? stats.promedioGeneral.toFixed(1) : '-',
      description: 'De 5.0',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard RRHH</h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen de evaluaciones y desempeño organizacional
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
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

      {/* SECCIONES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ACTIVIDAD RECIENTE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Evaluaciones Recientes
              </h4>
            </div>
            <Link
              href="/dashboard/evaluaciones"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {recentEvaluations.length > 0 ? (
              recentEvaluations.map((evaluation) => (
                <Link
                  key={evaluation.id}
                  href={`/dashboard/evaluaciones/${evaluation.id}`}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 transition-all hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                    {evaluation.empleado.nombre.charAt(0)}
                    {evaluation.empleado.apellido.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {evaluation.empleado.nombre} {evaluation.empleado.apellido}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.empleado.puesto} • {evaluation.ciclo.nombre}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      getEvaluationStatusStyle(evaluation.estadoRaw)
                    }`}
                  >
                    {evaluation.estado}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No hay evaluaciones recientes
              </p>
            )}
          </div>
        </div>

        {/* EVALUACIONES PENDIENTES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Requieren Atención
              </h4>
            </div>
            <Link
              href="/dashboard/evaluaciones"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {pendingEvaluations.length > 0 ? (
              pendingEvaluations.map((evaluation) => (
                <Link
                  key={evaluation.id}
                  href={`/dashboard/evaluaciones/${evaluation.id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-all hover:border-amber-200 hover:bg-amber-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {evaluation.empleado.nombre} {evaluation.empleado.apellido}
                    </p>
                    <p className="text-xs text-gray-500">
                      Progreso: {evaluation.progreso.completados}/
                      {evaluation.progreso.total} reviewers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${evaluation.progreso.porcentaje}%` }}
                      />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No hay evaluaciones pendientes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Acciones Rápidas
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona evaluaciones y empleados
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/evaluaciones/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Nueva Evaluación
            </Link>
            <Link
              href="/dashboard/empleados/new"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Users className="h-4 w-4" />
              Nuevo Empleado
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
