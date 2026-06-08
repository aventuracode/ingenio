'use client'

import { useState, useEffect, FormEvent } from 'react'
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
  Save,
} from 'lucide-react'
import type {
  EmployeeOption,
  EvaluationCycleOption,
  ReviewerSelection,
  CreateEvaluationPayload,
  CreateReviewerPayload,
  EvaluationBasicData,
} from '@/types/evaluation'
import { createClient } from '@/lib/supabase/client'

// ============================================
// PROPS DEL COMPONENTE
// ============================================

interface EvaluationFormUnifiedProps {
  mode: 'create' | 'edit'
  employees: EmployeeOption[]
  cycles: EvaluationCycleOption[]
  initialData?: EvaluationBasicData
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

export default function EvaluationFormUnified({
  mode,
  employees,
  cycles,
  initialData,
}: EvaluationFormUnifiedProps) {
  const router = useRouter()
  const isEditMode = mode === 'edit'

  // Estado del formulario
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialData?.empleado.id || ''
  )
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    initialData?.ciclo.id || ''
  )
  const [reviewers, setReviewers] = useState<ReviewerSelection[]>([])

  // Estado de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Estado del selector de reviewer
  const [selectedReviewerEmployeeId, setSelectedReviewerEmployeeId] = useState<string>('')
  const [selectedReviewerType, setSelectedReviewerType] = useState<string>('peer')

  // ============================================
  // EFECTO: CARGAR DATOS INICIALES EN MODO EDIT
  // ============================================

  useEffect(() => {
    if (isEditMode && initialData) {
      // Mapear evaluadores existentes al formato del formulario
      const existingReviewers: ReviewerSelection[] = initialData.evaluadores.map(
        (evaluador) => {
          const employee = employees.find((e) => e.id === evaluador.id)
          return {
            employee: employee || {
              id: evaluador.id,
              nombre: evaluador.nombre,
              apellido: evaluador.apellido,
              puesto: evaluador.puesto,
              avatar_url: evaluador.avatar || undefined,
            },
            reviewerType: evaluador.tipo as any,
          }
        }
      )
      setReviewers(existingReviewers)
    }
  }, [isEditMode, initialData, employees])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validaciones
    if (!isEditMode && !selectedEmployeeId) {
      setError('Debes seleccionar un empleado para evaluar')
      return
    }

    if (!isEditMode && !selectedCycleId) {
      setError('Debes seleccionar un ciclo de evaluación')
      return
    }

    if (reviewers.length === 0) {
      setError('Debes agregar al menos un evaluador')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      if (isEditMode && initialData) {
        // MODO EDICIÓN: Actualizar evaluación completa
        const response = await fetch('/api/evaluations/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evaluationId: initialData.id,
            employee_id: selectedEmployeeId,
            cycle_id: selectedCycleId,
            reviewers: reviewers.map((r) => ({
              reviewer_employee_id: r.employee.id,
              reviewer_type: r.reviewerType,
            })),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error al actualizar la evaluación')
        }

        setSuccess(true)

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          router.push(`/dashboard/evaluaciones/${initialData.id}`)
          router.refresh()
        }, 1500)
      } else {
        // MODO CREACIÓN: Crear nueva evaluación
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

        setSuccess(true)

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          router.push('/dashboard/evaluaciones')
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err)
      setError(
        err instanceof Error
          ? err.message
          : `Error al ${isEditMode ? 'actualizar' : 'crear'} la evaluación. Por favor, intenta de nuevo.`
      )
    } finally {
      setLoading(false)
    }
  }

  // Filtrar empleados disponibles
  const availableEmployees = employees.filter(
    (emp) =>
      emp.id !== selectedEmployeeId &&
      !reviewers.some((r) => r.employee.id === emp.id)
  )

  // Obtener empleado seleccionado
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* INFORMACIÓN DE LA EVALUACIÓN */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Información de la Evaluación
          </h3>
        </div>

        <div className="space-y-4">
          {/* EMPLEADO EVALUADO */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Empleado a Evaluar
              <span className="text-red-500"> *</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido} - {emp.puesto}
                </option>
              ))}
            </select>
          </div>

          {/* CICLO */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ciclo de Evaluación
              <span className="text-red-500"> *</span>
            </label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Seleccionar ciclo...</option>
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.title}
                  {cycle.description && ` - ${cycle.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EVALUADORES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Evaluadores Asignados
          </h3>
        </div>

        {/* AGREGAR EVALUADOR */}
        <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SELECT EMPLEADO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Empleado
              </label>
              <select
                value={selectedReviewerEmployeeId}
                onChange={(e) => setSelectedReviewerEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Seleccionar empleado...</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellido} - {emp.puesto}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT TIPO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tipo de Evaluador
              </label>
              <select
                value={selectedReviewerType}
                onChange={(e) => setSelectedReviewerType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            disabled={loading || !selectedReviewerEmployeeId}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Agregar Evaluador
          </button>
        </div>

        {/* LISTA DE EVALUADORES */}
        {reviewers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              No hay evaluadores asignados. Agrega al menos uno para continuar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewers.map((reviewer) => {
              const typeInfo = REVIEWER_TYPES.find(
                (t) => t.value === reviewer.reviewerType
              )
              return (
                <div
                  key={reviewer.employee.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {reviewer.employee.avatar_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={reviewer.employee.avatar_url}
                          alt={`${reviewer.employee.nombre} ${reviewer.employee.apellido}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                        {reviewer.employee.nombre.charAt(0)}
                        {reviewer.employee.apellido.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {reviewer.employee.nombre} {reviewer.employee.apellido}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reviewer.employee.puesto}
                      </div>
                    </div>
                    <span
                      className={`ml-4 rounded-full px-3 py-1 text-xs font-semibold ${typeInfo?.color}`}
                    >
                      {typeInfo?.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReviewer(reviewer.employee.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Eliminar evaluador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Error</h4>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">¡Éxito!</h4>
            <p className="mt-1 text-sm text-green-700">
              {isEditMode
                ? 'La evaluación se actualizó correctamente.'
                : 'La evaluación se creó correctamente.'}{' '}
              Redirigiendo...
            </p>
          </div>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || reviewers.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditMode ? 'Guardando...' : 'Creando...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditMode ? 'Guardar Cambios' : 'Crear Evaluación'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
