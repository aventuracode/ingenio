import { createClient } from '@/lib/supabase/server'
import {
  groupScoresByCategory,
  computeTrend,
  FEEDBACK_THRESHOLDS,
} from '@/lib/utils/evaluation-math'
import type {
  EmployeeFeedbackDTO,
  EmployeeFeedbackStatsDTO,
} from '@/types/evaluation-dtos'

// ============================================
// SERVICIO DE FEEDBACK ANÓNIMO
// ============================================

export class FeedbackService {
  /**
   * Obtiene feedback anónimo para un employee
   * NO incluye reviewer_employee_id para mantener anonimato
   */
  static async getEmployeeFeedback(
    employeeId: string
  ): Promise<EmployeeFeedbackDTO[]> {
    const supabase = await createClient()

    // Primero obtener IDs de evaluaciones del employee
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('id')
      .eq('employee_id', employeeId)

    if (!evaluations || evaluations.length === 0) {
      return []
    }

    const evaluationIds = evaluations.map((e) => e.id)

    const { data, error } = await supabase
      .from('evaluation_answers')
      .select(
        `
        id,
        score,
        comment,
        created_at,
        question:evaluation_questions(category)
      `
      )
      .in('evaluation_id', evaluationIds)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    if (!data) return []

    // Mapear a DTO anónimo
    return data.map((answer: any) => ({
      id: answer.id,
      score: answer.score,
      comment: answer.comment,
      category: answer.question?.category || 'General',
      createdAt: answer.created_at,
    }))
  }

  /**
   * Obtiene estadísticas de feedback para un employee
   */
  static async getEmployeeFeedbackStats(
    employeeId: string
  ): Promise<EmployeeFeedbackStatsDTO | null> {
    const supabase = await createClient()

    // Primero obtener IDs de evaluaciones del employee
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('id')
      .eq('employee_id', employeeId)

    if (!evaluations || evaluations.length === 0) {
      return {
        averageScore: 0,
        totalReviews: 0,
        scoresByCategory: [],
        recentFeedback: [],
        strengths: [],
        improvements: [],
        trend: 'stable',
      }
    }

    const evaluationIds = evaluations.map((e) => e.id)

    // Obtener todas las respuestas del employee con categoría de la pregunta
    const { data: answers, error } = await supabase
      .from('evaluation_answers')
      .select(
        `
        id,
        score,
        comment,
        created_at,
        question:evaluation_questions(category)
      `
      )
      .in('evaluation_id', evaluationIds)

    if (error) {
      return null
    }

    if (!answers || answers.length === 0) {
      return {
        averageScore: 0,
        totalReviews: 0,
        scoresByCategory: [],
        recentFeedback: [],
        strengths: [],
        improvements: [],
        trend: 'stable',
      }
    }

    // Calcular promedio general
    const averageScore =
      answers.reduce((sum, a) => sum + a.score, 0) / answers.length

    // Agrupar por categoría
    const scoresByCategory = groupScoresByCategory(answers).map((cat) => ({
      category: cat.category,
      averageScore: cat.averageScore,
      count: cat.totalResponses,
    }))

    // Feedback reciente (últimos 5)
    const recentFeedback: EmployeeFeedbackDTO[] = answers
      .slice(0, 5)
      .map((answer: any) => ({
        id: answer.id,
        score: answer.score,
        comment: answer.comment,
        category: answer.question?.category || 'General',
        createdAt: answer.created_at,
      }))

    // Identificar fortalezas y oportunidades de mejora
    const strengths = scoresByCategory
      .filter((cat) => cat.averageScore > FEEDBACK_THRESHOLDS.STRENGTH)
      .map((cat) => cat.category)

    const improvements = scoresByCategory
      .filter((cat) => cat.averageScore < FEEDBACK_THRESHOLDS.IMPROVEMENT)
      .map((cat) => cat.category)

    // Calcular tendencia (últimos 30 días vs anteriores)
    const trend = computeTrend(answers)

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalReviews: answers.length,
      scoresByCategory,
      recentFeedback,
      strengths,
      improvements,
      trend,
    }
  }

  /**
   * Obtiene el employee_id del usuario autenticado
   */
  static async getCurrentEmployeeId(): Promise<string | null> {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return employee?.id || null
  }
}
