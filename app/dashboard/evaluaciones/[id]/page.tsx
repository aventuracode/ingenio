import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  TrendingUp,
  Users,
  Award,
  BarChart3,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import { isValidRole } from '@/lib/auth/roles'
import { getEvaluationStatusStyle } from '@/types/evaluation'
import { getReviewerTypeColors } from '@/lib/constants/reviewer-types'
import { EvaluationCommentsService } from '@/lib/services/evaluation-comments.service'
import EvaluationCommentsSection from '@/components/evaluations/EvaluationCommentsSection'

// ============================================
// PÁGINA: DETALLE DE EVALUACIÓN
// ============================================

export const metadata = {
  title: 'Detalle de Evaluación | Ingenio',
  description: 'Visualiza el detalle y resultados de una evaluación 360°',
}

interface EvaluationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EvaluationDetailPage({
  params,
}: EvaluationDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.role as any)?.name
  const role = roleName && isValidRole(roleName) ? roleName : null

  // Solo Admin y RRHH pueden acceder
  if (role !== 'admin' && role !== 'rrhh') {
    redirect('/dashboard')
  }

  // Obtener información de la evaluación y comentarios en paralelo
  const [evaluation, comments] = await Promise.all([
    EvaluationsService.getEvaluationById(id),
    EvaluationCommentsService.getEvaluationComments(id),
  ])

  if (!evaluation) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/evaluaciones"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalle de Evaluación
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Información completa y resultados consolidados
            </p>
          </div>
        </div>
        {evaluation.estado !== 'completed' && (
          <Link
            href={`/dashboard/evaluaciones/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Edit className="h-4 w-4" />
            Editar Evaluación
          </Link>
        )}
      </div>

      {/* INFORMACIÓN GENERAL */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Información General
          </h3>
        </div>

        <div className="flex items-start gap-6">
          {/* AVATAR */}
          <div className="flex-shrink-0">
            {evaluation.empleado.avatar ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-gray-100">
                <Image
                  src={evaluation.empleado.avatar}
                  alt={`${evaluation.empleado.nombre} ${evaluation.empleado.apellido}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white ring-4 ring-gray-100">
                {evaluation.empleado.nombre.charAt(0)}
                {evaluation.empleado.apellido.charAt(0)}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {evaluation.empleado.nombre} {evaluation.empleado.apellido}
              </div>
              <div className="mt-1 text-gray-600">
                {evaluation.empleado.puesto}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* CICLO */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Ciclo</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {evaluation.ciclo.nombre}
                  </div>
                </div>
              </div>

              {/* ESTADO */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Estado</div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getEvaluationStatusStyle(evaluation.estado)}`}
                  >
                    {evaluation.estado}
                  </span>
                </div>
              </div>

              {/* FECHA */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Fecha de creación</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(evaluation.fechaCreacion).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Progreso</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Evaluadores
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {evaluation.progreso.completados} de {evaluation.progreso.total}{' '}
              completados
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Porcentaje de avance</span>
              <span className="font-semibold text-blue-600">
                {evaluation.progreso.porcentaje}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${evaluation.progreso.porcentaje}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
        </div>

        {evaluation.resultados.promedioGeneral !== null ? (
          <div className="space-y-6">
            {/* PROMEDIO GENERAL */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Promedio General
                  </div>
                  <div className="mt-1 text-4xl font-bold text-gray-900">
                    {evaluation.resultados.promedioGeneral.toFixed(1)}
                    <span className="text-xl text-gray-500">/5.0</span>
                  </div>
                </div>
                <div className="rounded-full bg-white p-4 shadow-sm">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white/60 p-3">
                  <div className="text-xs text-gray-600">Total Respuestas</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {evaluation.resultados.totalRespuestas}
                  </div>
                </div>
                <div className="rounded-lg bg-white/60 p-3">
                  <div className="text-xs text-gray-600">
                    Preguntas Respondidas
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {evaluation.resultados.totalPreguntas}
                  </div>
                </div>
              </div>
            </div>

            {/* PROMEDIOS POR CATEGORÍA */}
            {evaluation.resultados.scoresPorCategoria.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  Promedio por Categoría
                </h4>
                <div className="space-y-3">
                  {evaluation.resultados.scoresPorCategoria.map((categoria) => (
                    <div key={categoria.categoria}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {categoria.categoria}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {categoria.promedio.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{
                            width: `${(categoria.promedio / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {categoria.totalRespuestas} respuestas
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-3 text-sm font-semibold text-gray-900">
              Sin resultados aún
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Los resultados aparecerán cuando los evaluadores completen sus
              respuestas.
            </p>
          </div>
        )}
      </div>

      {/* EVALUADORES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Evaluadores</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Fecha de Respuesta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {evaluation.evaluadores.map((evaluador) => {
                const colors = getReviewerTypeColors(evaluador.tipo)
                return (
                  <tr
                    key={evaluador.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* NOMBRE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {evaluador.avatar ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Image
                              src={evaluador.avatar}
                              alt={`${evaluador.nombre} ${evaluador.apellido}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                            {evaluador.nombre.charAt(0)}
                            {evaluador.apellido.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {evaluador.nombre} {evaluador.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            {evaluador.puesto}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TIPO */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {evaluador.tipoLabel}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="px-4 py-4">
                      {evaluador.completado ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock className="h-3.5 w-3.5" />
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* FECHA DE RESPUESTA */}
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {evaluador.fechaRespuesta
                        ? new Date(evaluador.fechaRespuesta).toLocaleDateString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMENTARIOS GENERALES */}
      <EvaluationCommentsSection comments={comments} />
    </div>
  )
}
