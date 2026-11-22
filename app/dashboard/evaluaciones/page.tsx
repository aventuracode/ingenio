import {
  Plus,
  Search,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Star,
  Calendar,
  Users,
  Eye,
  Pencil,
} from 'lucide-react'
import Link from 'next/link'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import { formatDate } from '@/lib/utils/date'
import { StatsGrid, type StatItem } from '@/components/ui/StatsCard'
import StatusBadge from '@/components/ui/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

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
  const statsConfig: StatItem[] = [
    {
      name: 'Evaluaciones Activas',
      value: stats.activas.toString(),
      icon: ClipboardCheck,
      color: 'blue',
    },
    {
      name: 'Pendientes',
      value: stats.pendientes.toString(),
      icon: Clock,
      color: 'amber',
    },
    {
      name: 'Finalizadas',
      value: stats.finalizadas.toString(),
      icon: CheckCircle2,
      color: 'green',
    },
    {
      name: 'Promedio General',
      value: stats.promedioGeneral.toFixed(1),
      icon: TrendingUp,
      color: 'purple',
      suffix: '/5',
    },
  ]
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Evaluaciones 360°"
        description="Gestiona evaluaciones de desempeño y feedback de empleados."
        action={
          <Link
            href="/dashboard/evaluaciones/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Nueva Evaluación
          </Link>
        }
      />

      {/* STATS CARDS */}
      <StatsGrid stats={statsConfig} />

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
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Acciones
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
                      <Avatar
                        nombre={evaluation.empleado.nombre}
                        apellido={evaluation.empleado.apellido}
                        src={evaluation.empleado.avatar}
                        ring
                      />
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
                    <StatusBadge
                      status={evaluation.estadoRaw}
                      label={evaluation.estado}
                    />
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
                      {formatDate(evaluation.fecha)}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/evaluaciones/${evaluation.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </Link>
                      { evaluation.estadoRaw === 'pending' && <Link
                        href={`/dashboard/evaluaciones/${evaluation.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Editar evaluación"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Link>
                      }
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
        <EmptyState
          icon={ClipboardCheck}
          title="No hay evaluaciones"
          description="Comienza creando tu primera evaluación de desempeño."
          action={
            <Link
              href="/dashboard/evaluaciones/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nueva Evaluación
            </Link>
          }
        />
      )}
    </div>
  )
}
