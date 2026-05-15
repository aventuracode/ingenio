'use client'

import { Star } from 'lucide-react'

// ============================================
// COMPONENT: SCORE SELECTOR
// ============================================

interface ScoreSelectorProps {
  value: number | null
  onChange: (score: number) => void
  disabled?: boolean
}

export default function ScoreSelector({
  value,
  onChange,
  disabled = false,
}: ScoreSelectorProps) {
  const scores = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-2">
      {scores.map((score) => {
        const isSelected = value !== null && score <= value
        const isHovered = false // Se puede agregar hover state si se desea

        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            disabled={disabled}
            className={`
              group relative flex h-12 w-12 items-center justify-center rounded-lg border-2 
              transition-all duration-200
              ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <Star
              className={`h-6 w-6 transition-all duration-200 ${
                isSelected
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 group-hover:text-yellow-300'
              }`}
            />
            <span
              className={`absolute -bottom-6 text-xs font-medium ${
                isSelected ? 'text-yellow-600' : 'text-gray-400'
              }`}
            >
              {score}
            </span>
          </button>
        )
      })}
    </div>
  )
}
