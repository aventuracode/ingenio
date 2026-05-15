import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CycleForm from '@/components/evaluations/CycleForm'

// ============================================
// PÁGINA: NUEVO CICLO - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Nuevo Ciclo de Evaluación | Ingenio',
  description: 'Crear un nuevo ciclo de evaluación',
}

export default function NewCyclePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/evaluaciones/ciclos"
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nuevo Ciclo de Evaluación
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea un nuevo período de evaluación de desempeño
          </p>
        </div>
      </div>

      {/* FORM */}
      <CycleForm mode="create" />
    </div>
  )
}
