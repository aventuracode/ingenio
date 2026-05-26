import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props {
  employeeId: string
}

export default async function DashboardEmployee({ employeeId }: Props) {
  const supabase = await createClient()

  // Obtener evaluaciones donde es evaluado
  const { data: myEvaluations } = await supabase
    .from('evaluations')
    .select(`
      id,
      status,
      created_at,
      cycle:evaluation_cycles(id, title, end_date),
      reviewers:evaluation_reviewers(
        id,
        completed,
        reviewer_type
      )
    `)
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })

  // Obtener evaluaciones donde es reviewer
  const { data: reviewerEvaluations } = await supabase
    .from('evaluation_reviewers')
    .select(`
      id,
      completed,
      reviewer_type,
      evaluation:evaluations(
        id,
        status,
        employee:employees(id, nombre, apellido, puesto),
        cycle:evaluation_cycles(id, title, end_date)
      )
    `)
    .eq('reviewer_employee_id', employeeId)
    .order('created_at', { ascending: false })

  const myEvals = myEvaluations || []
  const reviewerEvals = reviewerEvaluations || []

  // Calcular stats
  const totalEvaluations = myEvals.length
  const pendingAsReviewer = reviewerEvals.filter((r) => !r.completed).length
  const completedAsReviewer = reviewerEvals.filter((r) => r.completed).length

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mis evaluaciones y feedback
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Mis Evaluaciones */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Mis Evaluaciones
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalEvaluations}
              </p>
              <p className="mt-1 text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Pendientes como Reviewer */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Pendientes de Evaluar
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pendingAsReviewer}
              </p>
              <p className="mt-1 text-xs text-gray-500">Por completar</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Completadas como Reviewer */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Evaluaciones Completadas
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {completedAsReviewer}
              </p>
              <p className="mt-1 text-xs text-gray-500">Finalizadas</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Mi Feedback */}
        <Link
          href="/dashboard/mi-feedback"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Mi Feedback</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                Ver Resultados
              </p>
              <p className="mt-1 text-xs text-gray-500">Anónimo</p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

      {/* SECCIONES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MIS EVALUACIONES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Mis Evaluaciones
              </h4>
            </div>
            <Link
              href="/dashboard/mis-evaluaciones"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {myEvals.length > 0 ? (
              myEvals.slice(0, 5).map((evaluation: any) => (
                <div
                  key={evaluation.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {evaluation.cycle?.title || 'Sin ciclo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.reviewers?.length || 0} reviewers asignados
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {evaluation.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No tienes evaluaciones asignadas
              </p>
            )}
          </div>
        </div>

        {/* EVALUACIONES PENDIENTES (como reviewer) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Pendientes de Evaluar
              </h4>
            </div>
            <Link
              href="/dashboard/mis-evaluaciones"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {reviewerEvals.filter((r) => !r.completed).length > 0 ? (
              reviewerEvals
                .filter((r) => !r.completed)
                .slice(0, 5)
                .map((reviewer: any) => (
                  <Link
                    key={reviewer.id}
                    href={`/dashboard/mis-evaluaciones`}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-all hover:border-amber-200 hover:bg-amber-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {reviewer.evaluation?.employee?.nombre}{' '}
                        {reviewer.evaluation?.employee?.apellido}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reviewer.evaluation?.employee?.puesto} •{' '}
                        {reviewer.reviewer_type}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No tienes evaluaciones pendientes
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
              Gestiona tus evaluaciones y feedback
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/mis-evaluaciones"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Mis Evaluaciones
            </Link>
            <Link
              href="/dashboard/mi-feedback"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" />
              Mi Feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
