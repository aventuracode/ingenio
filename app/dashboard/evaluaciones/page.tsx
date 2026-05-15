import { 
  Plus, 
  Search, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Star,
  Calendar,
  User,
  Users
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import { getEvaluationStatusStyle } from '@/types/evaluation'

// ============================================
// PÁGINA DE EVALUACIONES - SERVER COMPONENT
// ============================================
// Esta página obtiene datos dinámicos de Supabase
// y los muestra manteniendo el diseño visual original

export default async function EvaluacionesPage() {
  // Obtener datos de Supabase en paralelo para mejor performance
  const [evaluations, stats] = await Promise.all([
    EvaluationsService.getEvaluations(),
    EvaluationsService.getEvaluationStats(),
  ])

  // Configuración de stats cards con datos dinámicos
  const statsConfig = [
    {
      name: 'Evaluaciones Activas',
      value: stats.activas.toString(),
      icon: ClipboardCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Pendientes',
      value: stats.pendientes.toString(),
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      name: 'Finalizadas',
      value: stats.finalizadas.toString(),
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Promedio General',
      value: stats.promedioGeneral.toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      suffix: '/5',
    },
  ]
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones 360°</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona evaluaciones de desempeño y feedback de empleados.
          </p>
        </div>
        <Link
          href="/dashboard/evaluaciones/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Nueva Evaluación
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
                  <p className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-lg font-medium text-gray-500">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`rounded-xl ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-0 transition-opacity group-hover:opacity-100`} />
            </div>
          )
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar evaluaciones por empleado, evaluador o tipo..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Puntaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {evaluations.map((evaluation) => (
                <tr
                  key={evaluation.id}
                  className="group transition-colors hover:bg-gray-50"
                >
                  {/* EMPLEADO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {evaluation.empleado.avatar ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100">
                          <Image
                            src={evaluation.empleado.avatar}
                            alt={`${evaluation.empleado.nombre} ${evaluation.empleado.apellido}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white ring-2 ring-gray-100">
                          {evaluation.empleado.nombre.charAt(0)}{evaluation.empleado.apellido.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {evaluation.empleado.nombre} {evaluation.empleado.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          {evaluation.empleado.puesto}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* PROGRESO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {evaluation.progreso.completados}/{evaluation.progreso.total}
                        </span>
                      </div>
                      <div className="w-24">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{ width: `${evaluation.progreso.porcentaje}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {evaluation.progreso.porcentaje}%
                      </span>
                    </div>
                  </td>

                  {/* CICLO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {evaluation.ciclo.nombre}
                      </span>
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getEvaluationStatusStyle(
                        evaluation.estadoRaw
                      )}`}
                    >
                      {evaluation.estadoRaw === 'pending' && (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {evaluation.estadoRaw === 'in_progress' && (
                        <User className="h-3.5 w-3.5" />
                      )}
                      {evaluation.estadoRaw === 'completed' && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {evaluation.estado}
                    </span>
                  </td>

                  {/* PUNTAJE */}
                  <td className="whitespace-nowrap px-6 py-4">
                    {evaluation.puntaje ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-gray-900">
                            {evaluation.puntaje}
                          </span>
                          <span className="text-sm text-gray-500">/5</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin calificar</span>
                    )}
                  </td>

                  {/* FECHA */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(evaluation.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPTY STATE (hidden when there's data) */}
      {evaluations.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ClipboardCheck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No hay evaluaciones
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            Comienza creando tu primera evaluación de desempeño.
          </p>
          <Link
            href="/dashboard/evaluaciones/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Link>
        </div>
      )}
    </div>
  )
}
