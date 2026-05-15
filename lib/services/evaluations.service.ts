import { createClient } from '@/lib/supabase/server'
import type {
  EvaluationWithRelations,
  EvaluationStats,
  EvaluationListItem,
  EmployeeOption,
  EvaluationCycleOption,
  CreateEvaluationPayload,
  CreateReviewerPayload,
} from '@/types/evaluation'
import { transformEvaluationForUI } from '@/types/evaluation'

// ============================================
// SERVICIO DE EVALUACIONES
// ============================================

export class EvaluationsService {
  /**
   * Obtiene todas las evaluaciones con sus relaciones
   * Incluye: employee, cycle, reviewers (con reviewer employee)
   */
  static async getEvaluations(): Promise<EvaluationListItem[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey (
          id,
          nombre,
          apellido,
          email,
          puesto,
          avatar_url
        ),
        cycle:evaluation_cycles!evaluations_cycle_id_fkey (
          id,
          title,
          description,
          start_date,
          end_date,
          status
        ),
        reviewers:evaluation_reviewers (
          id,
          evaluation_id,
          reviewer_employee_id,
          reviewer_type,
          completed,
          created_at,
          reviewer:employees!evaluation_reviewers_reviewer_employee_id_fkey (
            id,
            nombre,
            apellido,
            email,
            puesto,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching evaluations:', error)
      return [] // Retornar array vacío en caso de error
    }

    if (!data || data.length === 0) {
      return []
    }

    // Transformar datos para la UI
    return data.map((evaluation) =>
      transformEvaluationForUI(evaluation as EvaluationWithRelations)
    )
  }

  /**
   * Calcula las estadísticas generales de evaluaciones
   */
  static async getEvaluationStats(): Promise<EvaluationStats> {
    const supabase = await createClient()

    // Obtener todas las evaluaciones (sin average_score ya que no existe en la tabla)
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('status')

    if (error) {
      console.error('Error fetching evaluation stats:', error)
      return {
        activas: 0,
        pendientes: 0,
        finalizadas: 0,
        promedioGeneral: 0,
      }
    }

    if (!evaluations || evaluations.length === 0) {
      return {
        activas: 0,
        pendientes: 0,
        finalizadas: 0,
        promedioGeneral: 0,
      }
    }

    // Calcular estadísticas
    const activas = evaluations.filter((e) => e.status === 'in_progress').length
    const pendientes = evaluations.filter((e) => e.status === 'pending').length
    const finalizadas = evaluations.filter((e) => e.status === 'completed').length

    // TODO: Calcular promedio desde evaluation_answers cuando se implemente
    const promedioGeneral = 0

    return {
      activas,
      pendientes,
      finalizadas,
      promedioGeneral: Math.round(promedioGeneral * 10) / 10, // Redondear a 1 decimal
    }
  }

  /**
   * Obtiene una evaluación específica por ID con todas sus relaciones
   */
  static async getEvaluationById(id: string): Promise<EvaluationWithRelations | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        employee_id,
        cycle_id,
        status,
        created_at,
        updated_at,
        employee:employees (
          id,
          nombre,
          apellido,
          email,
          puesto,
          avatar_url,
          dni
        ),
        cycle:evaluation_cycles (
          id,
          name,
          description,
          start_date,
          end_date,
          status
        ),
        reviewers:evaluation_reviewers (
          id,
          evaluation_id,
          reviewer_id,
          relationship,
          status,
          average_score,
          invited_at,
          started_at,
          completed_at,
          reviewer:employees (
            id,
            nombre,
            apellido,
            email,
            puesto,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching evaluation:', error)
      return null
    }

    return data as EvaluationWithRelations
  }

  /**
   * Actualiza el progreso de una evaluación basado en sus reviewers
   */
  static async updateEvaluationProgress(evaluationId: string): Promise<void> {
    const supabase = await createClient()

    // Obtener todos los reviewers de esta evaluación
    const { data: reviewers, error: reviewersError } = await supabase
      .from('evaluation_reviewers')
      .select('completed')
      .eq('evaluation_id', evaluationId)

    if (reviewersError) {
      console.error('Error fetching reviewers:', reviewersError)
      return
    }

    if (!reviewers || reviewers.length === 0) {
      return
    }

    // Calcular estadísticas
    const completedReviewers = reviewers.filter((r) => r.completed === true)
    const totalReviewers = reviewers.length
    const completedCount = completedReviewers.length

    // Determinar estado de la evaluación
    let status: 'pending' | 'in_progress' | 'completed' = 'pending'
    if (completedCount === totalReviewers && totalReviewers > 0) {
      status = 'completed'
    } else if (completedCount > 0) {
      status = 'in_progress'
    }

    // Actualizar evaluación (solo status, sin campos que no existen)
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({
        status,
      })
      .eq('id', evaluationId)

    if (updateError) {
      console.error('Error updating evaluation:', updateError)
    }
  }

  /**
   * Obtiene todos los empleados activos para selección
   */
  static async getEmployeesForSelection(): Promise<EmployeeOption[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('employees')
      .select('id, nombre, apellido, puesto, avatar_url, email')
      .eq('activo', true)
      .order('apellido', { ascending: true })

    if (error) {
      console.error('Error fetching employees:', error)
      return []
    }

    return (data || []) as EmployeeOption[]
  }

  /**
   * Obtiene todos los ciclos de evaluación activos
   */
  static async getActiveCycles(): Promise<EvaluationCycleOption[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluation_cycles')
      .select('id, title, description, start_date, end_date, status')
      .eq('status', 'active')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching cycles:', error)
      return []
    }

    return (data || []) as EvaluationCycleOption[]
  }

  /**
   * Crea una nueva evaluación con sus reviewers
   */
  static async createEvaluation(
    evaluationData: CreateEvaluationPayload,
    reviewers: CreateReviewerPayload[]
  ): Promise<{ success: boolean; evaluationId?: string; error?: string }> {
    const supabase = await createClient()

    try {
      // 1. Crear la evaluación
      const { data: evaluation, error: evaluationError } = await supabase
        .from('evaluations')
        .insert([evaluationData])
        .select()
        .single()

      if (evaluationError) {
        console.error('Error creating evaluation:', evaluationError)
        return {
          success: false,
          error: `Error al crear la evaluación: ${evaluationError.message}`,
        }
      }

      if (!evaluation) {
        return {
          success: false,
          error: 'No se pudo crear la evaluación',
        }
      }

      // 2. Crear los reviewers
      const reviewersWithEvaluationId = reviewers.map((reviewer) => ({
        ...reviewer,
        evaluation_id: evaluation.id,
      }))

      const { error: reviewersError } = await supabase
        .from('evaluation_reviewers')
        .insert(reviewersWithEvaluationId)

      if (reviewersError) {
        console.error('Error creating reviewers:', reviewersError)
        // Intentar eliminar la evaluación creada
        await supabase.from('evaluations').delete().eq('id', evaluation.id)
        return {
          success: false,
          error: `Error al asignar evaluadores: ${reviewersError.message}`,
        }
      }

      return {
        success: true,
        evaluationId: evaluation.id,
      }
    } catch (error) {
      console.error('Unexpected error creating evaluation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }
}
