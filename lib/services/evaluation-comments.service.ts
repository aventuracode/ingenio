import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// SERVICE: EVALUATION COMMENTS
// ============================================

export interface SaveCommentPayload {
  evaluation_id: string
  reviewer_employee_id: string
  general_comment: string
}

export interface ReviewerComment {
  id: string
  evaluation_id: string
  reviewer_employee_id: string
  comment: string
  created_at: string
}

export class EvaluationCommentsService {
  /**
   * Guarda o actualiza el comentario general de un reviewer (Server-side)
   */
  static async saveComment(
    payload: SaveCommentPayload
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    return this.saveCommentWithClient(supabase, payload)
  }

  /**
   * Guarda o actualiza el comentario general de un reviewer (con cliente personalizado)
   * Útil para componentes cliente que ya tienen una instancia de Supabase
   */
  static async saveCommentWithClient(
    supabase: SupabaseClient,
    payload: SaveCommentPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validar longitud del comentario
      if (payload.general_comment && payload.general_comment.length > 2000) {
        throw new Error('El comentario no puede exceder los 2000 caracteres')
      }

      // Verificar que el reviewer esté asignado a esta evaluación
      const { data: reviewer } = await supabase
        .from('evaluation_reviewers')
        .select('id')
        .eq('evaluation_id', payload.evaluation_id)
        .eq('reviewer_employee_id', payload.reviewer_employee_id)
        .single()

      if (!reviewer) {
        throw new Error('No tienes permiso para comentar en esta evaluación')
      }

      // Usar UPSERT para insertar o actualizar el comentario
      const { error: upsertError } = await supabase
        .from('evaluation_general_comments')
        .upsert(
          {
            evaluation_id: payload.evaluation_id,
            reviewer_employee_id: payload.reviewer_employee_id,
            comment: payload.general_comment,
          },
          {
            onConflict: 'evaluation_id,reviewer_employee_id',
            ignoreDuplicates: false,
          }
        )

      if (upsertError) {
        throw new Error(upsertError.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving comment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Obtiene el comentario general de un reviewer para una evaluación
   */
  static async getReviewerComment(
    evaluationId: string,
    reviewerEmployeeId: string
  ): Promise<ReviewerComment | null> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .from('evaluation_general_comments')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .eq('reviewer_employee_id', reviewerEmployeeId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(error.message)
      }

      return data as ReviewerComment
    } catch (error) {
      console.error('Error fetching reviewer comment:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener comentario'
      )
    }
  }

  /**
   * Obtiene los comentarios de una evaluación específica con información del evaluador
   * Solo para Admin/RRHH - incluye nombre del evaluador
   */
  static async getEvaluationComments(
    evaluationId: string
  ): Promise<
    Array<{
      id: string
      comment: string
      date: string
      reviewer: {
        nombre: string
        apellido: string
        puesto: string
        avatar: string | null
      }
    }>
  > {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .from('evaluation_general_comments')
        .select(
          `
          id,
          comment,
          created_at,
          reviewer:employees!evaluation_general_comments_reviewer_employee_id_fkey (
            nombre,
            apellido,
            puesto,
            avatar_url
          )
        `
        )
        .eq('evaluation_id', evaluationId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        return []
      }

      return data
        .filter((item: any) => item.comment && item.comment.trim())
        .map((item: any) => ({
          id: item.id,
          comment: item.comment,
          date: item.created_at,
          reviewer: {
            nombre: item.reviewer?.nombre || '',
            apellido: item.reviewer?.apellido || '',
            puesto: item.reviewer?.puesto || 'Sin puesto',
            avatar: item.reviewer?.avatar_url || null,
          },
        }))
    } catch (error) {
      console.error('Error fetching evaluation comments:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener comentarios'
      )
    }
  }

  /**
   * Obtiene todos los comentarios generales recibidos por un empleado
   * No incluye información del evaluador para mantener anonimato
   */
  static async getEmployeeComments(
    employeeId: string
  ): Promise<Array<{ comment: string; date: string }>> {
    const supabase = await createClient()

    try {
      // Obtener comentarios de evaluaciones donde el empleado es el evaluado
      const { data, error } = await supabase
        .from('evaluation_general_comments')
        .select(
          `
          comment,
          created_at,
          evaluation:evaluations!evaluation_general_comments_evaluation_id_fkey (
            employee_id
          )
        `
        )
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        return []
      }

      // Filtrar solo comentarios de evaluaciones del empleado
      const employeeComments = data
        .filter((item: any) => item.evaluation?.employee_id === employeeId)
        .filter((item: any) => item.comment && item.comment.trim())
        .map((item: any) => ({
          comment: item.comment,
          date: item.created_at,
        }))

      return employeeComments
    } catch (error) {
      console.error('Error fetching employee comments:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener comentarios'
      )
    }
  }
}
