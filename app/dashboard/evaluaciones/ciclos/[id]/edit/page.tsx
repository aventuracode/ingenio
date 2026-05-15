import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EvaluationCyclesService } from '@/lib/services/evaluation-cycles.service'
import CycleForm from '@/components/evaluations/CycleForm'

// ============================================
// PÁGINA: EDITAR CICLO - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Editar Ciclo de Evaluación | Ingenio',
  description: 'Editar ciclo de evaluación',
}

interface EditCyclePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCyclePage({ params }: EditCyclePageProps) {
  const { id } = await params

  // Obtener ciclo
  const cycle = await EvaluationCyclesService.getCycleById(id)

  if (!cycle) {
    notFound()
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Editar Ciclo</h1>
          <p className="mt-1 text-sm text-gray-600">{cycle.title}</p>
        </div>
      </div>

      {/* FORM */}
      <CycleForm cycle={cycle} mode="edit" />
    </div>
  )
}
