'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import type {
  EmployeeOption,
  EvaluationCycleOption,
  ReviewerSelection,
  CreateEvaluationPayload,
  CreateReviewerPayload,
} from '@/types/evaluation'
import { createClient } from '@/lib/supabase/client'

// ============================================
// PROPS DEL COMPONENTE
// ============================================

interface EvaluationFormProps {
  employees: EmployeeOption[]
  cycles: EvaluationCycleOption[]
}

// ============================================
// TIPOS DE REVIEWER
// ============================================

const REVIEWER_TYPES = [
  { value: 'self', label: 'Autoevaluación', color: 'bg-purple-100 text-purple-700' },
  { value: 'manager', label: 'Supervisor', color: 'bg-blue-100 text-blue-700' },
  { value: 'peer', label: 'Par/Colega', color: 'bg-green-100 text-green-700' },
  { value: 'subordinate', label: 'Subordinado', color: 'bg-amber-100 text-amber-700' },
] as const

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EvaluationForm({ employees, cycles }: EvaluationFormProps) {
  const router = useRouter()

  // Estado del formulario
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [selectedCycleId, setSelectedCycleId] = useState<string>('')
  const [reviewers, setReviewers] = useState<ReviewerSelection[]>([])

  // Estado de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Estado del selector de reviewer
  const [selectedReviewerEmployeeId, setSelectedReviewerEmployeeId] = useState<string>('')
  const [selectedReviewerType, setSelectedReviewerType] = useState<string>('peer')

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddReviewer = () => {
    if (!selectedReviewerEmployeeId) {
      setError('Selecciona un empleado para agregar como evaluador')
      return
    }

    // Verificar que no esté ya agregado
    const alreadyAdded = reviewers.some(
      (r) => r.employee.id === selectedReviewerEmployeeId
    )

    if (alreadyAdded) {
      setError('Este empleado ya fue agregado como evaluador')
      return
    }

    const employee = employees.find((e) => e.id === selectedReviewerEmployeeId)
    if (!employee) return

    setReviewers([
      ...reviewers,
      {
        employee,
        reviewerType: selectedReviewerType as any,
      },
    ])

    // Reset selector
    setSelectedReviewerEmployeeId('')
    setSelectedReviewerType('peer')
    setError(null)
  }

  const handleRemoveReviewer = (employeeId: string) => {
    setReviewers(reviewers.filter((r) => r.employee.id !== employeeId))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validaciones
    if (!selectedEmployeeId) {
      setError('Selecciona un empleado a evaluar')
      setLoading(false)
      return
    }

    if (!selectedCycleId) {
      setError('Selecciona un ciclo de evaluación')
      setLoading(false)
      return
    }

    if (reviewers.length === 0) {
      setError('Agrega al menos un evaluador')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // 1. Crear evaluación
      const evaluationPayload: CreateEvaluationPayload = {
        cycle_id: selectedCycleId,
        employee_id: selectedEmployeeId,
        status: 'pending',
      }

      const { data: evaluation, error: evaluationError } = await supabase
        .from('evaluations')
        .insert([evaluationPayload])
        .select()
        .single()

      if (evaluationError) {
        throw new Error(`Error al crear la evaluación: ${evaluationError.message}`)
      }

      if (!evaluation) {
        throw new Error('No se pudo crear la evaluación')
      }

      // 2. Crear reviewers
      const reviewersPayload: CreateReviewerPayload[] = reviewers.map((r) => ({
        evaluation_id: evaluation.id,
        reviewer_employee_id: r.employee.id,
        reviewer_type: r.reviewerType,
        completed: false,
      }))

      const { error: reviewersError } = await supabase
        .from('evaluation_reviewers')
        .insert(reviewersPayload)

      if (reviewersError) {
        // Rollback: eliminar evaluación
        await supabase.from('evaluations').delete().eq('id', evaluation.id)
        throw new Error(`Error al asignar evaluadores: ${reviewersError.message}`)
      }

      // Success
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/evaluaciones')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Error creating evaluation:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la evaluación')
      setLoading(false)
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  const getReviewerTypeLabel = (type: string) => {
    return REVIEWER_TYPES.find((t) => t.value === type)?.label || type
  }

  const getReviewerTypeColor = (type: string) => {
    return REVIEWER_TYPES.find((t) => t.value === type)?.color || 'bg-gray-100 text-gray-700'
  }

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)
  const selectedCycle = cycles.find((c) => c.id === selectedCycleId)

  // Empleados disponibles para agregar como reviewers (excluir ya agregados)
  const availableEmployees = employees.filter(
    (e) => !reviewers.some((r) => r.employee.id === e.id)
  )

  // ============================================
  // RENDER
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* MENSAJES DE ERROR/SUCCESS */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            ¡Evaluación creada exitosamente! Redirigiendo...
          </p>
        </div>
      )}

      {/* SECCIÓN 1: EMPLEADO A EVALUAR */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Empleado a Evaluar</h3>
            <p className="text-sm text-gray-600">Selecciona quién será evaluado</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
              Empleado <span className="text-red-500">*</span>
            </label>
            <select
              id="employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
              disabled={loading}
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nombre} {employee.apellido} {employee.puesto ? `- ${employee.puesto}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* PREVIEW DEL EMPLEADO SELECCIONADO */}
          {selectedEmployee && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              {selectedEmployee.avatar_url ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
                  <Image
                    src={selectedEmployee.avatar_url}
                    alt={`${selectedEmployee.nombre} ${selectedEmployee.apellido}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white ring-2 ring-white">
                  {selectedEmployee.nombre.charAt(0)}
                  {selectedEmployee.apellido.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">
                  {selectedEmployee.nombre} {selectedEmployee.apellido}
                </div>
                <div className="text-sm text-gray-600">{selectedEmployee.puesto || 'Sin puesto'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: CICLO DE EVALUACIÓN */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ciclo de Evaluación</h3>
            <p className="text-sm text-gray-600">Selecciona el período de evaluación</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="cycle" className="block text-sm font-medium text-gray-700">
              Ciclo <span className="text-red-500">*</span>
            </label>
            <select
              id="cycle"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
              disabled={loading}
            >
              <option value="">Seleccionar ciclo...</option>
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.title}
                </option>
              ))}
            </select>
          </div>

          {/* PREVIEW DEL CICLO SELECCIONADO */}
          {selectedCycle && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 font-semibold text-gray-900">{selectedCycle.title}</div>
              {selectedCycle.description && (
                <p className="mb-3 text-sm text-gray-600">{selectedCycle.description}</p>
              )}
              {selectedCycle.start_date && selectedCycle.end_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(selectedCycle.start_date).toLocaleDateString('es-ES')} -{' '}
                    {new Date(selectedCycle.end_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: EVALUADORES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Evaluadores</h3>
            <p className="text-sm text-gray-600">
              Agrega las personas que evaluarán al empleado
            </p>
          </div>
        </div>

        {/* AGREGAR EVALUADOR */}
        <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reviewer" className="block text-sm font-medium text-gray-700">
                Evaluador
              </label>
              <select
                id="reviewer"
                value={selectedReviewerEmployeeId}
                onChange={(e) => setSelectedReviewerEmployeeId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={loading}
              >
                <option value="">Seleccionar evaluador...</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.nombre} {employee.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reviewerType" className="block text-sm font-medium text-gray-700">
                Tipo de Evaluador
              </label>
              <select
                id="reviewerType"
                value={selectedReviewerType}
                onChange={(e) => setSelectedReviewerType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={loading}
              >
                {REVIEWER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddReviewer}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || !selectedReviewerEmployeeId}
          >
            <Plus className="h-4 w-4" />
            Agregar Evaluador
          </button>
        </div>

        {/* LISTA DE EVALUADORES */}
        {reviewers.length > 0 ? (
          <div className="space-y-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Evaluadores agregados ({reviewers.length})
              </span>
            </div>
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.employee.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {reviewer.employee.avatar_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100">
                      <Image
                        src={reviewer.employee.avatar_url}
                        alt={`${reviewer.employee.nombre} ${reviewer.employee.apellido}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white ring-2 ring-gray-100">
                      {reviewer.employee.nombre.charAt(0)}
                      {reviewer.employee.apellido.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {reviewer.employee.nombre} {reviewer.employee.apellido}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {reviewer.employee.puesto || 'Sin puesto'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getReviewerTypeColor(
                          reviewer.reviewerType
                        )}`}
                      >
                        {getReviewerTypeLabel(reviewer.reviewerType)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveReviewer(reviewer.employee.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">No hay evaluadores agregados</p>
            <p className="text-xs text-gray-500">
              Agrega al menos un evaluador para continuar
            </p>
          </div>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading || reviewers.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Crear Evaluación
            </>
          )}
        </button>
      </div>
    </form>
  )
}
