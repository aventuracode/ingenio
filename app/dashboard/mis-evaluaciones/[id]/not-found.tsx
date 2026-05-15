import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

// ============================================
// PÁGINA: NOT FOUND - EVALUACIÓN NO ENCONTRADA
// ============================================

export default function EvaluationNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Evaluación no encontrada
        </h1>
        <p className="mb-8 text-gray-600">
          La evaluación que buscas no existe o no tienes permiso para acceder a ella.
        </p>
        <Link
          href="/dashboard/mis-evaluaciones"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Evaluaciones
        </Link>
      </div>
    </div>
  )
}
