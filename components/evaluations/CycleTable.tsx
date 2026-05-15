'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Archive,
  Play,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react'
import type { EvaluationCycleListItem } from '@/types/evaluation-cycle'
import CycleStatusBadge from './CycleStatusBadge'
import { createClient } from '@/lib/supabase/client'

// ============================================
// COMPONENT: CYCLE TABLE
// ============================================

interface CycleTableProps {
  cycles: EvaluationCycleListItem[]
}

export default function CycleTable({ cycles }: CycleTableProps) {
  const router = useRouter()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el ciclo "${title}"?`)) {
      return
    }

    setLoading(id)
    setError(null)

    try {
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from('evaluation_cycles')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      router.refresh()
    } catch (err) {
      console.error('Error deleting cycle:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar el ciclo')
    } finally {
      setLoading(null)
      setOpenMenuId(null)
    }
  }

  const handleActivate = async (id: string) => {
    setLoading(id)
    setError(null)

    try {
      const supabase = createClient()

      // Desactivar otros ciclos activos
      await supabase
        .from('evaluation_cycles')
        .update({ status: 'draft' })
        .eq('status', 'active')
        .neq('id', id)

      // Activar este ciclo
      const { error: updateError } = await supabase
        .from('evaluation_cycles')
        .update({ status: 'active' })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      router.refresh()
    } catch (err) {
      console.error('Error activating cycle:', err)
      setError(err instanceof Error ? err.message : 'Error al activar el ciclo')
    } finally {
      setLoading(null)
      setOpenMenuId(null)
    }
  }

  const handleComplete = async (id: string) => {
    setLoading(id)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('evaluation_cycles')
        .update({ status: 'completed' })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      router.refresh()
    } catch (err) {
      console.error('Error completing cycle:', err)
      setError(err instanceof Error ? err.message : 'Error al completar el ciclo')
    } finally {
      setLoading(null)
      setOpenMenuId(null)
    }
  }

  const handleArchive = async (id: string) => {
    setLoading(id)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('evaluation_cycles')
        .update({ status: 'archived' })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      router.refresh()
    } catch (err) {
      console.error('Error archiving cycle:', err)
      setError(err instanceof Error ? err.message : 'Error al archivar el ciclo')
    } finally {
      setLoading(null)
      setOpenMenuId(null)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (cycles.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <ClipboardCheck className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No hay ciclos de evaluación
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Comienza creando tu primer ciclo de evaluación.
        </p>
        <Link
          href="/dashboard/evaluaciones/ciclos/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Calendar className="h-4 w-4" />
          Crear Ciclo
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Evaluaciones
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  {/* CICLO */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {cycle.title}
                      </div>
                      {cycle.description && (
                        <div className="mt-1 text-sm text-gray-600 line-clamp-1">
                          {cycle.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <CycleStatusBadge status={cycle.status} />
                  </td>

                  {/* PERÍODO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </span>
                    </div>
                  </td>

                  {/* EVALUACIONES */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {cycle.evaluationsCount}
                        </span>
                        <span className="text-gray-500"> total</span>
                      </div>
                      {cycle.evaluationsCount > 0 && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-green-600">
                            ✓ {cycle.completedCount}
                          </span>
                          <span className="text-amber-600">
                            ⏱ {cycle.pendingCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === cycle.id ? null : cycle.id)
                        }
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        disabled={loading === cycle.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* DROPDOWN MENU */}
                      {openMenuId === cycle.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg">
                            <div className="py-1">
                              {/* EDITAR */}
                              {cycle.canEdit && (
                                <Link
                                  href={`/dashboard/evaluaciones/ciclos/${cycle.id}/edit`}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </Link>
                              )}

                              {/* ACTIVAR */}
                              {cycle.status === 'draft' && (
                                <button
                                  onClick={() => handleActivate(cycle.id)}
                                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                  disabled={loading === cycle.id}
                                >
                                  <Play className="h-4 w-4" />
                                  Activar
                                </button>
                              )}

                              {/* COMPLETAR */}
                              {cycle.status === 'active' && (
                                <button
                                  onClick={() => handleComplete(cycle.id)}
                                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                  disabled={loading === cycle.id}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Completar
                                </button>
                              )}

                              {/* ARCHIVAR */}
                              {cycle.status === 'completed' && (
                                <button
                                  onClick={() => handleArchive(cycle.id)}
                                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                  disabled={loading === cycle.id}
                                >
                                  <Archive className="h-4 w-4" />
                                  Archivar
                                </button>
                              )}

                              {/* ELIMINAR */}
                              {cycle.canDelete && (
                                <>
                                  <div className="my-1 border-t border-gray-200" />
                                  <button
                                    onClick={() => handleDelete(cycle.id, cycle.title)}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                    disabled={loading === cycle.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
