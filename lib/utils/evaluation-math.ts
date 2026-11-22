// ============================================
// HELPERS: AGREGACIÓN DE SCORES DE EVALUACIONES
// ============================================

/** Límites para clasificar categorías en feedback */
export const FEEDBACK_THRESHOLDS = {
  STRENGTH: 4,
  IMPROVEMENT: 3,
} as const

/** Largo máximo de comentarios generales */
export const MAX_COMMENT_LENGTH = 2000

export interface CategoryAverage {
  category: string
  averageScore: number
  totalResponses: number
}

interface AnswerLike {
  score: number | null
  created_at?: string
  question?:
    | { category?: string | null }
    | Array<{ category?: string | null }>
    | null
}

function getCategory(
  question: AnswerLike['question']
): string | null | undefined {
  const q = Array.isArray(question) ? question[0] : question
  return q?.category
}

/**
 * Promedio de scores (ignora nulls). Devuelve null si no hay scores.
 */
export function averageScore(scores: Array<number | null>): number | null {
  const valid = scores.filter((s): s is number => s !== null)
  if (valid.length === 0) return null
  return valid.reduce((sum, s) => sum + s, 0) / valid.length
}

/**
 * Agrupa respuestas por categoría de pregunta y calcula promedios.
 * Ignora respuestas sin score.
 */
export function groupScoresByCategory(
  answers: AnswerLike[]
): CategoryAverage[] {
  const categoryMap = new Map<string, number[]>()

  answers.forEach((answer) => {
    if (answer.score === null) return
    const category = getCategory(answer.question) || 'General'
    const scores = categoryMap.get(category) || []
    scores.push(answer.score)
    categoryMap.set(category, scores)
  })

  return Array.from(categoryMap.entries()).map(([category, scores]) => ({
    category,
    averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    totalResponses: scores.length,
  }))
}

/**
 * Tendencia del score: compara el promedio de los últimos `days`
 * días contra el resto. Requiere `created_at` en las respuestas.
 */
export function computeTrend(
  answers: AnswerLike[],
  days = 30
): 'up' | 'down' | 'stable' {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const recent: number[] = []
  const older: number[] = []

  answers.forEach((a) => {
    if (a.score === null || !a.created_at) return
    if (new Date(a.created_at) >= cutoff) {
      recent.push(a.score)
    } else {
      older.push(a.score)
    }
  })

  if (recent.length === 0 || older.length === 0) return 'stable'

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
  const olderAvg = older.reduce((s, v) => s + v, 0) / older.length

  if (recentAvg > olderAvg + 0.2) return 'up'
  if (recentAvg < olderAvg - 0.2) return 'down'
  return 'stable'
}
