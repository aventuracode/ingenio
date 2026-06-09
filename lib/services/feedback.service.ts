import { createClient } from '@/lib/supabase/server'
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
    const categoryMap = new Map<
      string,
      { scores: number[]; count: number }
    >()

    answers.forEach((answer: any) => {
      const category = answer.question?.category || 'General'
      const existing = categoryMap.get(category) || {
        scores: [],
        count: 0,
      }
      existing.scores.push(answer.score)
      existing.count++
      categoryMap.set(category, existing)
    })

    const scoresByCategory = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        averageScore:
          data.scores.reduce((sum, s) => sum + s, 0) / data.count,
        count: data.count,
      })
    )

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

    // Identificar fortalezas (categorías con score > 4)
    const strengths = scoresByCategory
      .filter((cat) => cat.averageScore > 4)
      .map((cat) => cat.category)

    // Identificar oportunidades de mejora (categorías con score < 3)
    const improvements = scoresByCategory
      .filter((cat) => cat.averageScore < 3)
      .map((cat) => cat.category)

    // Calcular tendencia (comparar últimos 30 días vs anteriores)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAnswers = answers.filter(
      (a) => new Date(a.created_at) >= thirtyDaysAgo
    )
    const olderAnswers = answers.filter(
      (a) => new Date(a.created_at) < thirtyDaysAgo
    )

    let trend: 'up' | 'down' | 'stable' = 'stable'

    if (recentAnswers.length > 0 && olderAnswers.length > 0) {
      const recentAvg =
        recentAnswers.reduce((sum, a) => sum + a.score, 0) /
        recentAnswers.length
      const olderAvg =
        olderAnswers.reduce((sum, a) => sum + a.score, 0) /
        olderAnswers.length

      if (recentAvg > olderAvg + 0.2) trend = 'up'
      else if (recentAvg < olderAvg - 0.2) trend = 'down'
    }

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
