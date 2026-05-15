import { createClient } from '@/lib/supabase/server'
import type {
  MyEvaluationListItem,
  EvaluationDetailForReviewer,
  SubmitEvaluationPayload,
  QuestionWithAnswer,
} from '@/types/reviewer-evaluation'
import { getReviewerTypeLabel } from '@/lib/constants/reviewer-types'

// ============================================
// SERVICE: REVIEWER EVALUATIONS
// ============================================

export class ReviewerEvaluationsService {
  /**
   * Obtiene el employee_id del usuario autenticado
   */
  static async getCurrentEmployeeId(): Promise<string | null> {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return employee?.id || null
  }

  /**
   * Obtiene todas las evaluaciones asignadas al reviewer actual
   */
  static async getMyEvaluations(): Promise<MyEvaluationListItem[]> {
    const supabase = await createClient()

    // Obtener employee_id del usuario autenticado
    const employeeId = await this.getCurrentEmployeeId()

    if (!employeeId) {
      return []
    }

    // Obtener evaluaciones donde soy reviewer
    const { data: reviewerEvaluations, error } = await supabase
      .from('evaluation_reviewers')
      .select(
        `
        id,
        evaluation_id,
        reviewer_employee_id,
        reviewer_type,
        completed,
        created_at,
        evaluation:evaluations!evaluation_reviewers_evaluation_id_fkey (
          id,
          cycle_id,
          employee_id,
          status,
          created_at,
          employee:employees!evaluations_employee_id_fkey (
            id,
            nombre,
            apellido,
            puesto,
            avatar_url,
            email
          ),
          cycle:evaluation_cycles!evaluations_cycle_id_fkey (
            id,
            title,
            description,
            start_date,
            end_date
          )
        )
      `
      )
      .eq('reviewer_employee_id', employeeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my evaluations:', error)
      return []
    }

    if (!reviewerEvaluations || reviewerEvaluations.length === 0) {
      return []
    }

    // Obtener conteo de respuestas por evaluación
    const evaluationIds = reviewerEvaluations.map((re) => re.evaluation_id)

    const { data: answers } = await supabase
      .from('evaluation_answers')
      .select('evaluation_id, question_id')
      .eq('reviewer_employee_id', employeeId)
      .in('evaluation_id', evaluationIds)

    // Obtener total de preguntas activas
    const { data: questions } = await supabase
      .from('evaluation_questions')
      .select('id')
      .eq('active', true)

    const totalQuestions = questions?.length || 0

    // Mapear a UI
    const evaluations: MyEvaluationListItem[] = reviewerEvaluations.map((re: any) => {
      const evaluation = re.evaluation
      const employee = evaluation?.employee
      const cycle = evaluation?.cycle

      const answeredQuestions =
        answers?.filter((a) => a.evaluation_id === re.evaluation_id).length || 0

      const progress =
        totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

      let status: 'pending' | 'in_progress' | 'completed' = 'pending'
      if (re.completed) {
        status = 'completed'
      } else if (answeredQuestions > 0) {
        status = 'in_progress'
      }

      return {
        id: re.id,
        evaluationId: re.evaluation_id,
        employeeName: employee?.nombre || '',
        employeeLastName: employee?.apellido || '',
        employeePosition: employee?.puesto || 'Sin puesto',
        employeeAvatar: employee?.avatar_url || null,
        cycleTitle: cycle?.title || 'Sin ciclo',
        reviewerType: re.reviewer_type,
        reviewerTypeLabel: getReviewerTypeLabel(re.reviewer_type),
        completed: re.completed,
        status,
        statusLabel: status === 'completed' ? 'Completada' : status === 'in_progress' ? 'En progreso' : 'Pendiente',
        progress,
        totalQuestions,
        answeredQuestions,
        createdAt: re.created_at,
        canRespond: !re.completed,
      }
    })

    return evaluations
  }

  /**
   * Obtiene los detalles de una evaluación para responder
   */
  static async getEvaluationForReviewer(
    evaluationId: string
  ): Promise<EvaluationDetailForReviewer | null> {
    const supabase = await createClient()

    // Obtener employee_id del usuario autenticado
    const employeeId = await this.getCurrentEmployeeId()

    if (!employeeId) {
      return null
    }

    // Verificar que el reviewer esté asignado a esta evaluación
    const { data: reviewerData, error: reviewerError } = await supabase
      .from('evaluation_reviewers')
      .select(
        `
        id,
        evaluation_id,
        reviewer_employee_id,
        reviewer_type,
        completed,
        evaluation:evaluations!evaluation_reviewers_evaluation_id_fkey (
          id,
          cycle_id,
          employee_id,
          status,
          employee:employees!evaluations_employee_id_fkey (
            id,
            nombre,
            apellido,
            puesto,
            avatar_url
          ),
          cycle:evaluation_cycles!evaluations_cycle_id_fkey (
            id,
            title,
            description
          )
        )
      `
      )
      .eq('evaluation_id', evaluationId)
      .eq('reviewer_employee_id', employeeId)
      .single()

    if (reviewerError || !reviewerData) {
      console.error('Error fetching reviewer evaluation:', reviewerError)
      return null
    }

    // Obtener preguntas activas
    const { data: questions, error: questionsError } = await supabase
      .from('evaluation_questions')
      .select('id, question, category')
      .eq('active', true)
      .order('category', { ascending: true })

    if (questionsError || !questions) {
      console.error('Error fetching questions:', questionsError)
      return null
    }

    // Obtener respuestas existentes
    const { data: existingAnswers } = await supabase
      .from('evaluation_answers')
      .select('question_id, score, comment')
      .eq('evaluation_id', evaluationId)
      .eq('reviewer_employee_id', employeeId)

    // Mapear preguntas con respuestas
    const questionsWithAnswers: QuestionWithAnswer[] = questions.map((q) => {
      const answer = existingAnswers?.find((a) => a.question_id === q.id)
      return {
        id: q.id,
        question: q.question,
        category: q.category || 'General',
        score: answer?.score || null,
        comment: answer?.comment || '',
      }
    })

    const evaluation = reviewerData.evaluation as any
    const employee = evaluation?.employee
    const cycle = evaluation?.cycle

    const answeredQuestions = questionsWithAnswers.filter((q) => q.score !== null).length
    const totalQuestions = questions.length
    const progress =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return {
      id: reviewerData.id,
      evaluationId: reviewerData.evaluation_id,
      employeeName: employee?.nombre || '',
      employeeLastName: employee?.apellido || '',
      employeePosition: employee?.puesto || 'Sin puesto',
      employeeAvatar: employee?.avatar_url || null,
      cycleTitle: cycle?.title || 'Sin ciclo',
      cycleDescription: cycle?.description || '',
      reviewerType: reviewerData.reviewer_type,
      reviewerTypeLabel: getReviewerTypeLabel(reviewerData.reviewer_type),
      completed: reviewerData.completed,
      questions: questionsWithAnswers,
      totalQuestions,
      answeredQuestions,
      progress,
    }
  }

  /**
   * Guarda o actualiza las respuestas de una evaluación
   */
  static async submitEvaluationAnswers(
    payload: SubmitEvaluationPayload
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
      // Verificar que el reviewer esté asignado
      const { data: reviewer } = await supabase
        .from('evaluation_reviewers')
        .select('id, completed')
        .eq('evaluation_id', payload.evaluation_id)
        .eq('reviewer_employee_id', payload.reviewer_employee_id)
        .single()

      if (!reviewer) {
        return {
          success: false,
          error: 'No tienes permiso para responder esta evaluación',
        }
      }

      if (reviewer.completed) {
        return {
          success: false,
          error: 'Esta evaluación ya fue completada',
        }
      }

      // Eliminar respuestas existentes
      await supabase
        .from('evaluation_answers')
        .delete()
        .eq('evaluation_id', payload.evaluation_id)
        .eq('reviewer_employee_id', payload.reviewer_employee_id)

      // Insertar nuevas respuestas
      const answersToInsert = payload.answers.map((answer) => ({
        evaluation_id: payload.evaluation_id,
        reviewer_employee_id: payload.reviewer_employee_id,
        question_id: answer.question_id,
        score: answer.score,
        comment: answer.comment || null,
      }))

      const { error: insertError } = await supabase
        .from('evaluation_answers')
        .insert(answersToInsert)

      if (insertError) {
        console.error('Error inserting answers:', insertError)
        return {
          success: false,
          error: `Error al guardar respuestas: ${insertError.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error submitting answers:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Completa la evaluación del reviewer
   */
  static async completeReviewerEvaluation(
    evaluationId: string,
    reviewerEmployeeId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
      // Marcar reviewer como completado
      const { error: updateError } = await supabase
        .from('evaluation_reviewers')
        .update({ completed: true })
        .eq('evaluation_id', evaluationId)
        .eq('reviewer_employee_id', reviewerEmployeeId)

      if (updateError) {
        console.error('Error completing reviewer:', updateError)
        return {
          success: false,
          error: `Error al completar evaluación: ${updateError.message}`,
        }
      }

      // Verificar si todos los reviewers completaron
      const { data: allReviewers } = await supabase
        .from('evaluation_reviewers')
        .select('completed')
        .eq('evaluation_id', evaluationId)

      if (allReviewers) {
        const allCompleted = allReviewers.every((r) => r.completed === true)

        // Actualizar estado de la evaluación
        const newStatus = allCompleted ? 'completed' : 'in_progress'

        await supabase
          .from('evaluations')
          .update({ status: newStatus })
          .eq('id', evaluationId)
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error completing evaluation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }
}
