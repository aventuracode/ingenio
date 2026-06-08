import { createClient } from '@/lib/supabase/server'
import type {
  EvaluationWithRelations,
  EvaluationStats,
  EvaluationListItem,
  EmployeeOption,
  EvaluationCycleOption,
  CreateEvaluationPayload,
  CreateReviewerPayload,
  EvaluationDetailData,
  EvaluationBasicData,
  CategoryScore,
  ReviewerWithStatus,
} from '@/types/evaluation'
import {
  transformEvaluationForUI,
  deriveEvaluationStatus,
  getEvaluationStatusLabel,
  calculateProgress,
} from '@/types/evaluation'
import { getReviewerTypeLabel } from '@/lib/constants/reviewer-types'

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
   * Usa estado derivado basado en progreso real de reviewers
   */
  static async getEvaluationStats(): Promise<EvaluationStats> {
    const supabase = await createClient()

    // Obtener todas las evaluaciones con sus reviewers
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        reviewers:evaluation_reviewers (
          completed
        )
      `)

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

    // Calcular estadísticas usando estado derivado
    let activas = 0
    let pendientes = 0
    let finalizadas = 0

    evaluations.forEach((evaluation) => {
      const reviewers = evaluation.reviewers || []
      const completedCount = reviewers.filter((r: any) => r.completed === true).length
      const totalCount = reviewers.length

      // Derivar estado basado en progreso
      const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

      if (percentage === 0) {
        pendientes++
      } else if (percentage === 100) {
        finalizadas++
      } else {
        activas++
      }
    })

    // TODO: Calcular promedio desde evaluation_answers cuando se implemente
    const promedioGeneral = 0

    return {
      activas,
      pendientes,
      finalizadas,
      promedioGeneral: Math.round(promedioGeneral * 10) / 10,
    }
  }

  /**
   * Obtiene una evaluación específica por ID (versión simplificada)
   * Retorna información básica sin resultados ni evaluadores
   */
  static async getEvaluationById(id: string): Promise<EvaluationBasicData | null> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(
          `
          id,
          status,
          created_at,
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
          ),
          reviewers:evaluation_reviewers (
            id,
            reviewer_employee_id,
            reviewer_type,
            completed,
            created_at,
            reviewer:employees!evaluation_reviewers_reviewer_employee_id_fkey (
              id,
              nombre,
              apellido,
              puesto,
              avatar_url
            )
          )
        `
        )
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching evaluation:', error)
        return null
      }

      // Extraer employee y cycle (vienen como objetos únicos)
      const employee = data.employee as any
      const cycle = data.cycle as any
      const reviewers = (data.reviewers as any[]) || []

      // Calcular progreso
      const total = reviewers.length
      const completados = reviewers.filter((r) => r.completed === true).length
      const porcentaje = calculateProgress(completados, total)

      // Obtener respuestas de evaluation_answers con información de preguntas
      const { data: answers } = await supabase
        .from('evaluation_answers')
        .select(
          `
          reviewer_employee_id,
          question_id,
          score,
          created_at,
          question:evaluation_questions!evaluation_answers_question_id_fkey (
            id,
            category
          )
        `
        )
        .eq('evaluation_id', id)
        .order('created_at', { ascending: true })

      // Calcular resultados
      const totalRespuestas = answers?.length || 0
      const respuestasConScore = answers?.filter((a) => a.score !== null) || []
      const promedioGeneral =
        respuestasConScore.length > 0
          ? respuestasConScore.reduce((sum, a) => sum + (a.score || 0), 0) /
            respuestasConScore.length
          : null

      // Contar preguntas únicas respondidas
      const preguntasUnicas = new Set(answers?.map((a) => a.question_id) || [])
      const totalPreguntas = preguntasUnicas.size

      // Calcular promedios por categoría
      const categoriaMap = new Map<
        string,
        { scores: number[]; total: number }
      >()

      answers?.forEach((answer: any) => {
        const categoria = answer.question?.category
        if (categoria && answer.score !== null) {
          if (!categoriaMap.has(categoria)) {
            categoriaMap.set(categoria, { scores: [], total: 0 })
          }
          const cat = categoriaMap.get(categoria)!
          cat.scores.push(answer.score)
          cat.total++
        }
      })

      const scoresPorCategoria = Array.from(categoriaMap.entries()).map(
        ([categoria, data]) => ({
          categoria,
          promedio:
            data.scores.reduce((sum, score) => sum + score, 0) /
            data.scores.length,
          totalRespuestas: data.total,
        })
      )

      // Mapear evaluadores con su información completa
      const evaluadores = reviewers.map((reviewer: any) => {
        // Buscar la primera respuesta del reviewer para obtener la fecha
        const firstAnswer = answers?.find(
          (a) => a.reviewer_employee_id === reviewer.reviewer_employee_id
        )

        return {
          id: reviewer.id,
          nombre: reviewer.reviewer?.nombre || '',
          apellido: reviewer.reviewer?.apellido || '',
          puesto: reviewer.reviewer?.puesto || 'Sin puesto',
          avatar: reviewer.reviewer?.avatar_url || null,
          tipo: reviewer.reviewer_type,
          tipoLabel: getReviewerTypeLabel(reviewer.reviewer_type),
          completado: reviewer.completed || false,
          fechaRespuesta: firstAnswer?.created_at || null,
        }
      })

      return {
        id: data.id,
        empleado: {
          id: employee?.id || '',
          nombre: employee?.nombre || '',
          apellido: employee?.apellido || '',
          puesto: employee?.puesto || 'Sin puesto',
          avatar: employee?.avatar_url || null,
        },
        ciclo: {
          id: cycle?.id || '',
          nombre: cycle?.title || 'Sin ciclo',
          descripcion: cycle?.description || '',
        },
        estado: data.status || 'pending',
        fechaCreacion: data.created_at || '',
        progreso: {
          completados,
          total,
          porcentaje,
        },
        evaluadores,
        resultados: {
          promedioGeneral,
          totalRespuestas,
          totalPreguntas,
          scoresPorCategoria,
        },
      }
    } catch (error) {
      console.error('Error getting evaluation by id:', error)
      return null
    }
  }

  /**
   * Actualiza una evaluación existente
   */
  static async updateEvaluation(
    evaluationId: string,
    data: {
      employee_id?: string
      cycle_id?: string
      reviewers?: Array<{
        reviewer_employee_id: string
        reviewer_type: string
      }>
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()

      // 1. Actualizar evaluación (empleado y/o ciclo)
      const updateData: any = {}
      if (data.employee_id) updateData.employee_id = data.employee_id
      if (data.cycle_id) updateData.cycle_id = data.cycle_id

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('evaluations')
          .update(updateData)
          .eq('id', evaluationId)

        if (updateError) {
          throw new Error(`Error al actualizar evaluación: ${updateError.message}`)
        }
      }

      // 2. Actualizar evaluadores si se proporcionaron
      if (data.reviewers && data.reviewers.length > 0) {
        // Eliminar evaluadores existentes
        const { error: deleteError } = await supabase
          .from('evaluation_reviewers')
          .delete()
          .eq('evaluation_id', evaluationId)

        if (deleteError) {
          throw new Error(`Error al eliminar evaluadores: ${deleteError.message}`)
        }

        // Insertar nuevos evaluadores
        const reviewersToInsert = data.reviewers.map((r) => ({
          evaluation_id: evaluationId,
          reviewer_employee_id: r.reviewer_employee_id,
          reviewer_type: r.reviewer_type,
          completed: false,
        }))

        const { error: insertError } = await supabase
          .from('evaluation_reviewers')
          .insert(reviewersToInsert)

        if (insertError) {
          throw new Error(`Error al insertar evaluadores: ${insertError.message}`)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating evaluation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
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
   * Obtiene el detalle completo de una evaluación con resultados consolidados
   */
  static async getEvaluationDetail(
    id: string
  ): Promise<EvaluationDetailData | null> {
    const supabase = await createClient()

    try {
      // Obtener evaluación con relaciones
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select(
          `
          id,
          employee_id,
          cycle_id,
          status,
          created_at,
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
            description,
            start_date,
            end_date
          ),
          reviewers:evaluation_reviewers (
            id,
            reviewer_employee_id,
            reviewer_type,
            completed,
            created_at,
            reviewer:employees!evaluation_reviewers_reviewer_employee_id_fkey (
              id,
              nombre,
              apellido,
              puesto,
              avatar_url
            )
          )
        `
        )
        .eq('id', id)
        .single()

      if (evalError || !evaluation) {
        console.error('Error fetching evaluation detail:', evalError)
        return null
      }

      // Obtener todas las respuestas de esta evaluación
      const { data: answers } = await supabase
        .from('evaluation_answers')
        .select(
          `
          id,
          evaluation_id,
          reviewer_employee_id,
          question_id,
          score,
          comment,
          created_at,
          question:evaluation_questions!evaluation_answers_question_id_fkey (
            id,
            question,
            category
          )
        `
        )
        .eq('evaluation_id', id)

      // Calcular promedio general
      const allScores = answers?.map((a) => a.score) || []
      const promedioGeneral =
        allScores.length > 0
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
          : null

      // Calcular promedios por categoría
      const scoresByCategory: Record<string, number[]> = {}
      answers?.forEach((answer: any) => {
        const category = answer.question?.category || 'General'
        if (!scoresByCategory[category]) {
          scoresByCategory[category] = []
        }
        scoresByCategory[category].push(answer.score)
      })

      const scoresPorCategoria: CategoryScore[] = Object.entries(
        scoresByCategory
      ).map(([category, scores]) => ({
        category,
        averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        totalResponses: scores.length,
      }))

      // Mapear evaluadores con estado
      const evaluadores: ReviewerWithStatus[] =
        evaluation.reviewers?.map((reviewer: any) => {
          // Buscar fecha de respuesta (primera respuesta del reviewer)
          const reviewerAnswers = answers?.filter(
            (a) => a.reviewer_employee_id === reviewer.reviewer_employee_id
          )
          const fechaRespuesta =
            reviewerAnswers && reviewerAnswers.length > 0
              ? reviewerAnswers[0].created_at
              : null

          return {
            id: reviewer.id,
            nombre: reviewer.reviewer?.nombre || '',
            apellido: reviewer.reviewer?.apellido || '',
            puesto: reviewer.reviewer?.puesto || 'Sin puesto',
            avatar: reviewer.reviewer?.avatar_url || null,
            tipo: reviewer.reviewer_type,
            tipoLabel: getReviewerTypeLabel(reviewer.reviewer_type),
            completado: reviewer.completed || false,
            fechaRespuesta,
          }
        }) || []

      // Calcular progreso
      const completados = evaluadores.filter((e) => e.completado).length
      const total = evaluadores.length
      const porcentaje = calculateProgress(completados, total)

      // Derivar estado
      const estadoRaw = deriveEvaluationStatus(completados, total)

      // Extraer employee y cycle (vienen como objetos únicos, no arrays)
      const employee = evaluation.employee as any
      const cycle = evaluation.cycle as any

      return {
        id: evaluation.id,
        empleado: {
          id: employee?.id || '',
          nombre: employee?.nombre || '',
          apellido: employee?.apellido || '',
          puesto: employee?.puesto || 'Sin puesto',
          avatar: employee?.avatar_url || null,
        },
        ciclo: {
          id: cycle?.id || '',
          nombre: cycle?.title || 'Sin ciclo',
          descripcion: cycle?.description || '',
          fechaInicio: cycle?.start_date || '',
          fechaFin: cycle?.end_date || '',
        },
        estado: getEvaluationStatusLabel(estadoRaw),
        estadoRaw,
        fechaCreacion: evaluation.created_at || '',
        progreso: {
          completados,
          total,
          porcentaje,
        },
        resultados: {
          promedioGeneral,
          totalRespuestas: allScores.length,
          scoresPorCategoria,
        },
        evaluadores,
      }
    } catch (error) {
      console.error('Error getting evaluation detail:', error)
      return null
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
