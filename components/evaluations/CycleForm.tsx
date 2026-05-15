'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react'
import type {
  EvaluationCycle,
  CycleFormData,
  EvaluationCycleStatus,
} from '@/types/evaluation-cycle'
import { CYCLE_STATUS_OPTIONS } from '@/lib/constants/evaluation-cycle-status'
import { createClient } from '@/lib/supabase/client'

// ============================================
// COMPONENT: CYCLE FORM
// ============================================

interface CycleFormProps {
  cycle?: EvaluationCycle
  mode: 'create' | 'edit'
}

export default function CycleForm({ cycle, mode }: CycleFormProps) {
  const router = useRouter()

  // Estado del formulario
  const [formData, setFormData] = useState<CycleFormData>({
    title: cycle?.title || '',
    description: cycle?.description || '',
    start_date: cycle?.start_date || '',
    end_date: cycle?.end_date || '',
    status: (cycle?.status as EvaluationCycleStatus) || 'draft',
  })

  // Estado de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ============================================
  // HANDLERS
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('El título es requerido')
      return false
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)

      if (endDate <= startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Validar ciclos activos
      if (formData.status === 'active') {
        const { data: activeCycles } = await supabase
          .from('evaluation_cycles')
          .select('id')
          .eq('status', 'active')
          .neq('id', cycle?.id || '')

        if (activeCycles && activeCycles.length > 0) {
          throw new Error(
            'Ya existe un ciclo activo. Desactiva el ciclo actual antes de activar uno nuevo.'
          )
        }
      }

      if (mode === 'create') {
        // Crear nuevo ciclo
        const { error: insertError } = await supabase
          .from('evaluation_cycles')
          .insert([formData])

        if (insertError) {
          throw new Error(insertError.message)
        }
      } else {
        // Actualizar ciclo existente
        if (!cycle?.id) {
          throw new Error('ID de ciclo no encontrado')
        }

        const { error: updateError } = await supabase
          .from('evaluation_cycles')
          .update(formData)
          .eq('id', cycle.id)

        if (updateError) {
          throw new Error(updateError.message)
        }
      }

      // Success
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/evaluaciones/ciclos')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Error saving cycle:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el ciclo')
      setLoading(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            {mode === 'create'
              ? '¡Ciclo creado exitosamente!'
              : '¡Ciclo actualizado exitosamente!'}{' '}
            Redirigiendo...
          </p>
        </div>
      )}

      {/* INFORMACIÓN BÁSICA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Información Básica
            </h3>
            <p className="text-sm text-gray-600">
              Datos generales del ciclo de evaluación
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* TÍTULO */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Q2 2024 - Evaluación Semestral"
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
              disabled={loading}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el propósito y alcance de este ciclo de evaluación..."
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
          </div>

          {/* ESTADO */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
              disabled={loading}
            >
              {CYCLE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              Solo puede haber un ciclo activo a la vez
            </p>
          </div>
        </div>
      </div>

      {/* PERÍODO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Período de Evaluación
            </h3>
            <p className="text-sm text-gray-600">
              Define las fechas de inicio y fin del ciclo
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* FECHA INICIO */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
          </div>

          {/* FECHA FIN */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de Fin
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
          </div>
        </div>
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
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creando...' : 'Guardando...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {mode === 'create' ? 'Crear Ciclo' : 'Guardar Cambios'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
