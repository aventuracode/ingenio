'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  Send,
  AlertCircle,
} from 'lucide-react'
import type { EvaluationDetailForReviewer } from '@/types/reviewer-evaluation'
import QuestionCard from './QuestionCard'
import { createClient } from '@/lib/supabase/client'

// ============================================
// COMPONENT: EVALUATION ANSWER FORM
// ============================================

interface EvaluationAnswerFormProps {
  evaluation: EvaluationDetailForReviewer
  reviewerEmployeeId: string
}

export default function EvaluationAnswerForm({
  evaluation,
  reviewerEmployeeId,
}: EvaluationAnswerFormProps) {
  const router = useRouter()

  // Estado de las respuestas
  const [answers, setAnswers] = useState(
    evaluation.questions.map((q) => ({
      question_id: q.id,
      score: q.score,
      comment: q.comment,
    }))
  )

  // Estado de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saveType, setSaveType] = useState<'draft' | 'submit'>('draft')

  // ============================================
  // HANDLERS
  // ============================================

  const handleScoreChange = (questionId: string, score: number) => {
    setAnswers((prev) =>
      prev.map((a) => (a.question_id === questionId ? { ...a, score } : a))
    )
    setError(null)
  }

  const handleCommentChange = (questionId: string, comment: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.question_id === questionId ? { ...a, comment } : a))
    )
  }

  const validateAnswers = (): boolean => {
    const unanswered = answers.filter((a) => a.score === null)

    if (unanswered.length > 0) {
      setError(
        `Debes calificar todas las preguntas antes de enviar (${unanswered.length} pendientes)`
      )
      return false
    }

    return true
  }

  const handleSaveDraft = async (e: FormEvent) => {
    e.preventDefault()
    setSaveType('draft')
    await saveAnswers(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveType('submit')

    if (!validateAnswers()) {
      return
    }

    if (
      !confirm(
        '¿Estás seguro de enviar esta evaluación? No podrás modificarla después.'
      )
    ) {
      return
    }

    await saveAnswers(true)
  }

  const saveAnswers = async (complete: boolean) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Preparar respuestas (solo las que tienen score)
      const answersToSave = answers
        .filter((a) => a.score !== null)
        .map((a) => ({
          evaluation_id: evaluation.evaluationId,
          reviewer_employee_id: reviewerEmployeeId,
          question_id: a.question_id,
          score: a.score!,
          comment: a.comment || null,
        }))

      if (answersToSave.length === 0) {
        setError('Debes responder al menos una pregunta')
        setLoading(false)
        return
      }

      // Eliminar respuestas existentes
      await supabase
        .from('evaluation_answers')
        .delete()
        .eq('evaluation_id', evaluation.evaluationId)
        .eq('reviewer_employee_id', reviewerEmployeeId)

      // Insertar nuevas respuestas
      const { error: insertError } = await supabase
        .from('evaluation_answers')
        .insert(answersToSave)

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Si se completa, marcar reviewer como completado
      if (complete) {
        const { error: completeError } = await supabase
          .from('evaluation_reviewers')
          .update({ completed: true })
          .eq('evaluation_id', evaluation.evaluationId)
          .eq('reviewer_employee_id', reviewerEmployeeId)

        if (completeError) {
          throw new Error(completeError.message)
        }

        // Verificar si todos los reviewers completaron
        const { data: allReviewers } = await supabase
          .from('evaluation_reviewers')
          .select('completed')
          .eq('evaluation_id', evaluation.evaluationId)

        if (allReviewers) {
          const allCompleted = allReviewers.every((r) => r.completed === true)
          const newStatus = allCompleted ? 'completed' : 'in_progress'

          await supabase
            .from('evaluations')
            .update({ status: newStatus })
            .eq('id', evaluation.evaluationId)
        }
      }

      // Success
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/mis-evaluaciones')
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error('Error saving answers:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar respuestas')
      setLoading(false)
    }
  }

  // Calcular progreso actual
  const answeredCount = answers.filter((a) => a.score !== null).length
  const totalCount = answers.length
  const currentProgress =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  // ============================================
  // RENDER
  // ============================================

  return (
    <form className="space-y-6">
      {/* MENSAJES DE ERROR/SUCCESS */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            {saveType === 'submit'
              ? '¡Evaluación enviada exitosamente! Redirigiendo...'
              : '¡Borrador guardado exitosamente!'}
          </p>
        </div>
      )}

      {/* PROGRESS BAR */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Progreso de la evaluación
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {answeredCount}/{totalCount} preguntas
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {currentProgress === 100
            ? '¡Todas las preguntas respondidas! Puedes enviar la evaluación.'
            : `Completa todas las preguntas para enviar la evaluación.`}
        </p>
      </div>

      {/* INSTRUCCIONES */}
      {!evaluation.completed && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="mb-1 font-semibold">Instrucciones:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Califica cada competencia del 1 al 5 (siendo 5 la mejor calificación)</li>
                <li>Puedes agregar comentarios opcionales para cada pregunta</li>
                <li>Guarda tu progreso haciendo clic en "Guardar borrador"</li>
                <li>Una vez completadas todas las preguntas, haz clic en "Enviar evaluación"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PREGUNTAS */}
      <div className="space-y-6">
        {evaluation.questions.map((question, index) => {
          const answer = answers.find((a) => a.question_id === question.id)

          return (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              question={question.question}
              category={question.category}
              score={answer?.score || null}
              comment={answer?.comment || ''}
              onScoreChange={(score) => handleScoreChange(question.id, score)}
              onCommentChange={(comment) => handleCommentChange(question.id, comment)}
              disabled={evaluation.completed || loading}
            />
          )
        })}
      </div>

      {/* STICKY FOOTER CON BOTONES */}
      {!evaluation.completed && (
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {answeredCount}/{totalCount}
                </span>{' '}
                preguntas respondidas
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading || answeredCount === 0}
                >
                  {loading && saveType === 'draft' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar borrador
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading || currentProgress < 100}
                >
                  {loading && saveType === 'submit' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar evaluación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE SI YA ESTÁ COMPLETADA */}
      {evaluation.completed && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
          <h3 className="mb-2 text-lg font-semibold text-green-900">
            Evaluación completada
          </h3>
          <p className="text-sm text-green-700">
            Ya has enviado esta evaluación. No puedes modificarla.
          </p>
        </div>
      )}
    </form>
  )
}
