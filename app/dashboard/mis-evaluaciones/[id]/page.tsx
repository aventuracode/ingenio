import { ArrowLeft, User, Calendar, Briefcase } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ReviewerEvaluationsService } from '@/lib/services/reviewer-evaluations.service'
import EvaluationAnswerForm from '@/components/evaluations/EvaluationAnswerForm'
import { getReviewerTypeColors } from '@/lib/constants/reviewer-types'

// ============================================
// PÁGINA: RESPONDER EVALUACIÓN - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Responder Evaluación | Ingenio',
  description: 'Responder evaluación de desempeño',
}

interface RespondEvaluationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RespondEvaluationPage({
  params,
}: RespondEvaluationPageProps) {
  const { id: evaluationId } = await params

  // Obtener employee_id del usuario autenticado
  const reviewerEmployeeId =
    await ReviewerEvaluationsService.getCurrentEmployeeId()

  if (!reviewerEmployeeId) {
    notFound()
  }

  // Obtener detalles de la evaluación
  const evaluation =
    await ReviewerEvaluationsService.getEvaluationForReviewer(evaluationId)

  if (!evaluation) {
    notFound()
  }

  const reviewerColors = getReviewerTypeColors(evaluation.reviewerType)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/mis-evaluaciones"
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Evaluación de Desempeño
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Completa la evaluación respondiendo todas las preguntas
          </p>
        </div>
      </div>

      {/* INFORMACIÓN DEL EMPLEADO EVALUADO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Empleado a Evaluar
            </h3>
            <p className="text-sm text-gray-600">
              Información del empleado que estás evaluando
            </p>
          </div>
        </div>

        <div className="flex items-start gap-6">
          {/* AVATAR */}
          <div className="flex-shrink-0">
            {evaluation.employeeAvatar ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-gray-100">
                <Image
                  src={evaluation.employeeAvatar}
                  alt={`${evaluation.employeeName} ${evaluation.employeeLastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white ring-4 ring-gray-100">
                {evaluation.employeeName.charAt(0)}
                {evaluation.employeeLastName.charAt(0)}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {evaluation.employeeName} {evaluation.employeeLastName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{evaluation.employeePosition}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* CICLO */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Ciclo</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {evaluation.cycleTitle}
                  </div>
                </div>
              </div>

              {/* TIPO DE EVALUADOR */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Tu rol:</div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${reviewerColors.bg} ${reviewerColors.text} ${reviewerColors.border}`}
                >
                  {evaluation.reviewerTypeLabel}
                </span>
              </div>
            </div>

            {evaluation.cycleDescription && (
              <p className="text-sm text-gray-600">
                {evaluation.cycleDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORMULARIO DE RESPUESTAS */}
      <EvaluationAnswerForm
        evaluation={evaluation}
        reviewerEmployeeId={reviewerEmployeeId}
      />
    </div>
  )
}
