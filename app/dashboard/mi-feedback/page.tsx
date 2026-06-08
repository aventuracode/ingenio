import { redirect } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  MessageSquare,
  BarChart3,
  Award,
  Target,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { FeedbackService } from '@/lib/services/feedback.service'
import { EvaluationCommentsService } from '@/lib/services/evaluation-comments.service'
import { isValidRole } from '@/lib/auth/roles'

// ============================================
// PÁGINA: MI FEEDBACK (EMPLOYEE)
// ============================================

export const metadata = {
  title: 'Mi Feedback | Ingenio',
  description: 'Visualiza tu feedback de evaluaciones 360°',
}

export default async function MiFeedbackPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.role as any)?.name
  const role = roleName && isValidRole(roleName) ? roleName : null

  // Solo employees pueden ver esta página
  if (role !== 'employee') {
    redirect('/dashboard')
  }

  // Obtener employee_id
  const employeeId = await FeedbackService.getCurrentEmployeeId()

  if (!employeeId) {
    redirect('/dashboard')
  }

  // Obtener estadísticas de feedback
  const stats = await FeedbackService.getEmployeeFeedbackStats(employeeId)

  // Obtener comentarios generales recibidos
  const comments = await EvaluationCommentsService.getEmployeeComments(employeeId)

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Feedback</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualiza tu feedback de evaluaciones 360°
          </p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Sin Feedback Disponible
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Aún no tienes evaluaciones completadas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (stats.trend === 'up')
      return <TrendingUp className="h-5 w-5 text-green-600" />
    if (stats.trend === 'down')
      return <TrendingDown className="h-5 w-5 text-red-600" />
    return <Minus className="h-5 w-5 text-gray-600" />
  }

  const getTrendColor = () => {
    if (stats.trend === 'up') return 'text-green-600'
    if (stats.trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendText = () => {
    if (stats.trend === 'up') return 'Mejorando'
    if (stats.trend === 'down') return 'Descendiendo'
    return 'Estable'
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Feedback</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visualiza tu feedback anónimo de evaluaciones 360°
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Promedio General */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Promedio General
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.averageScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-gray-500">De 5.0</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Total Reviews */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Evaluaciones Recibidas
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalReviews}
              </p>
              <p className="mt-1 text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Tendencia */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tendencia</p>
              <p className={`mt-2 text-3xl font-bold ${getTrendColor()}`}>
                {getTrendText()}
              </p>
              <p className="mt-1 text-xs text-gray-500">Últimos 30 días</p>
            </div>
            <div
              className={`rounded-xl ${
                stats.trend === 'up'
                  ? 'bg-green-50'
                  : stats.trend === 'down'
                  ? 'bg-red-50'
                  : 'bg-gray-50'
              } p-3`}
            >
              {getTrendIcon()}
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-0 h-1 w-full ${
              stats.trend === 'up'
                ? 'bg-green-500'
                : stats.trend === 'down'
                ? 'bg-red-500'
                : 'bg-gray-500'
            } opacity-0 transition-opacity group-hover:opacity-100`}
          />
        </div>

        {/* Categorías */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.scoresByCategory.length}
              </p>
              <p className="mt-1 text-xs text-gray-500">Evaluadas</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* SCORES POR CATEGORÍA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">
            Promedio por Categoría
          </h4>
        </div>

        <div className="space-y-4">
          {stats.scoresByCategory.map((category) => (
            <div key={category.category}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {category.category}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {category.averageScore.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                  style={{ width: `${(category.averageScore / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {category.count} evaluaciones
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FORTALEZAS Y OPORTUNIDADES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fortalezas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Fortalezas</h4>
          </div>

          {stats.strengths.length > 0 ? (
            <div className="space-y-2">
              {stats.strengths.map((strength) => (
                <div
                  key={strength}
                  className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3"
                >
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    {strength}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Continúa mejorando para identificar fortalezas
            </p>
          )}
        </div>

        {/* Oportunidades de Mejora */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Oportunidades de Mejora
            </h4>
          </div>

          {stats.improvements.length > 0 ? (
            <div className="space-y-2">
              {stats.improvements.map((improvement) => (
                <div
                  key={improvement}
                  className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3"
                >
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">
                    {improvement}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              ¡Excelente! No hay áreas críticas de mejora
            </p>
          )}
        </div>
      </div>

      {/* FEEDBACK RECIENTE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">
            Feedback Reciente
          </h4>
        </div>

        {stats.recentFeedback.length > 0 ? (
          <div className="space-y-4">
            {stats.recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    {feedback.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {feedback.score.toFixed(1)}
                    </span>
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(feedback.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No hay feedback reciente disponible
          </p>
        )}
      </div>
{/* COMENTARIOS GENERALES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              Comentarios Generales
            </h4>
            <p className="text-sm text-gray-600">
              Feedback anónimo de tus evaluadores
            </p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {comments.length}
          </span>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                Sin comentarios
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Aún no has recibido comentarios generales en tus evaluaciones.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-indigo-100 p-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      Evaluador anónimo
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* NOTA DE ANONIMATO */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Nota:</strong> Todo el feedback es anónimo para fomentar
          respuestas honestas y constructivas. No se muestra quién proporcionó
          cada evaluación.
        </p>
      </div>
    </div>
  )
}
