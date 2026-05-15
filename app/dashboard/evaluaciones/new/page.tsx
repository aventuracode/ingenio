import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import EvaluationForm from '@/components/evaluations/EvaluationForm'

// ============================================
// PÁGINA: NUEVA EVALUACIÓN - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Nueva Evaluación 360° | Ingenio',
  description: 'Crear una nueva evaluación de desempeño',
}

export default async function NewEvaluationPage() {
  // Fetch data en paralelo para mejor performance
  const [employees, cycles] = await Promise.all([
    EvaluationsService.getEmployeesForSelection(),
    EvaluationsService.getActiveCycles(),
  ])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/evaluaciones"
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Evaluación 360°</h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea una nueva evaluación de desempeño para un empleado
          </p>
        </div>
      </div>

      {/* VALIDACIÓN DE DATOS */}
      {employees.length === 0 || cycles.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-2 font-semibold text-amber-900">
            No se puede crear una evaluación
          </h3>
          <div className="space-y-1 text-sm text-amber-800">
            {employees.length === 0 && (
              <p>• No hay empleados activos disponibles.</p>
            )}
            {cycles.length === 0 && (
              <p>• No hay ciclos de evaluación activos.</p>
            )}
          </div>
          <Link
            href="/dashboard/evaluaciones"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:text-amber-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </div>
      ) : (
        <EvaluationForm employees={employees} cycles={cycles} />
      )}
    </div>
  )
}
