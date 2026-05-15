'use client'

import { MessageSquare } from 'lucide-react'
import ScoreSelector from './ScoreSelector'

// ============================================
// COMPONENT: QUESTION CARD
// ============================================

interface QuestionCardProps {
  questionNumber: number
  question: string
  category: string
  score: number | null
  comment: string
  onScoreChange: (score: number) => void
  onCommentChange: (comment: string) => void
  disabled?: boolean
}

export default function QuestionCard({
  questionNumber,
  question,
  category,
  score,
  comment,
  onScoreChange,
  onCommentChange,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
              {questionNumber}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        </div>
      </div>

      {/* SCORE SELECTOR */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Calificación <span className="text-red-500">*</span>
        </label>
        <ScoreSelector value={score} onChange={onScoreChange} disabled={disabled} />
      </div>

      {/* COMMENT */}
      <div>
        <label
          htmlFor={`comment-${questionNumber}`}
          className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <MessageSquare className="h-4 w-4" />
          Comentarios (opcional)
        </label>
        <textarea
          id={`comment-${questionNumber}`}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Agrega comentarios adicionales sobre esta competencia..."
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </div>
  )
}
