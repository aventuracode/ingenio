import { createClient } from '@/lib/supabase/server'
import type {
  EvaluationCycle,
  EvaluationCycleWithStats,
  EvaluationCycleListItem,
  CreateEvaluationCyclePayload,
  UpdateEvaluationCyclePayload,
  EvaluationCycleStatus,
} from '@/types/evaluation-cycle'
import {
  getCycleStatusLabel,
  canEditCycle,
  canDeleteCycle,
} from '@/lib/constants/evaluation-cycle-status'

// ============================================
// SERVICE: EVALUATION CYCLES
// ============================================

export class EvaluationCyclesService {
  /**
   * Obtiene todos los ciclos con estadísticas
   */
  static async getCycles(): Promise<EvaluationCycleListItem[]> {
    const supabase = await createClient()

    // Obtener ciclos
    const { data: cycles, error: cyclesError } = await supabase
      .from('evaluation_cycles')
      .select('*')
      .order('created_at', { ascending: false })

    if (cyclesError) {
      console.error('Error fetching cycles:', cyclesError)
      return []
    }

    if (!cycles || cycles.length === 0) {
      return []
    }

    // Obtener conteo de evaluaciones por ciclo
    const { data: evaluationCounts, error: countsError } = await supabase
      .from('evaluations')
      .select('cycle_id, status')

    if (countsError) {
      console.error('Error fetching evaluation counts:', countsError)
    }

    // Mapear estadísticas
    const cyclesWithStats: EvaluationCycleListItem[] = cycles.map((cycle) => {
      const cycleEvaluations = evaluationCounts?.filter(
        (e) => e.cycle_id === cycle.id
      ) || []

      const evaluationsCount = cycleEvaluations.length
      const completedCount = cycleEvaluations.filter(
        (e) => e.status === 'completed'
      ).length
      const pendingCount = cycleEvaluations.filter(
        (e) => e.status === 'pending' || e.status === 'in_progress'
      ).length

      const status = (cycle.status || 'draft') as EvaluationCycleStatus

      return {
        id: cycle.id,
        title: cycle.title,
        description: cycle.description || '',
        startDate: cycle.start_date || null,
        endDate: cycle.end_date || null,
        status,
        statusLabel: getCycleStatusLabel(status),
        evaluationsCount,
        completedCount,
        pendingCount,
        createdAt: cycle.created_at || new Date().toISOString(),
        isActive: status === 'active',
        canEdit: canEditCycle(status),
        canDelete: canDeleteCycle(status, evaluationsCount),
      }
    })

    return cyclesWithStats
  }

  /**
   * Obtiene un ciclo por ID
   */
  static async getCycleById(id: string): Promise<EvaluationCycle | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluation_cycles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching cycle:', error)
      return null
    }

    return data as EvaluationCycle
  }

  /**
   * Crea un nuevo ciclo
   */
  static async createCycle(
    payload: CreateEvaluationCyclePayload
  ): Promise<{ success: boolean; cycleId?: string; error?: string }> {
    const supabase = await createClient()

    try {
      // Validar que no haya múltiples ciclos activos si el nuevo es activo
      if (payload.status === 'active') {
        const { data: activeCycles } = await supabase
          .from('evaluation_cycles')
          .select('id')
          .eq('status', 'active')

        if (activeCycles && activeCycles.length > 0) {
          return {
            success: false,
            error: 'Ya existe un ciclo activo. Desactiva el ciclo actual antes de activar uno nuevo.',
          }
        }
      }

      // Validar fechas
      if (payload.start_date && payload.end_date) {
        const startDate = new Date(payload.start_date)
        const endDate = new Date(payload.end_date)

        if (endDate <= startDate) {
          return {
            success: false,
            error: 'La fecha de fin debe ser posterior a la fecha de inicio',
          }
        }
      }

      // Crear ciclo
      const { data, error } = await supabase
        .from('evaluation_cycles')
        .insert([payload])
        .select()
        .single()

      if (error) {
        console.error('Error creating cycle:', error)
        return {
          success: false,
          error: `Error al crear el ciclo: ${error.message}`,
        }
      }

      return {
        success: true,
        cycleId: data.id,
      }
    } catch (error) {
      console.error('Unexpected error creating cycle:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Actualiza un ciclo existente
   */
  static async updateCycle(
    id: string,
    payload: UpdateEvaluationCyclePayload
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
      // Validar que no haya múltiples ciclos activos
      if (payload.status === 'active') {
        const { data: activeCycles } = await supabase
          .from('evaluation_cycles')
          .select('id')
          .eq('status', 'active')
          .neq('id', id)

        if (activeCycles && activeCycles.length > 0) {
          return {
            success: false,
            error: 'Ya existe otro ciclo activo. Desactívalo antes de activar este.',
          }
        }
      }

      // Validar fechas si se proporcionan ambas
      if (payload.start_date && payload.end_date) {
        const startDate = new Date(payload.start_date)
        const endDate = new Date(payload.end_date)

        if (endDate <= startDate) {
          return {
            success: false,
            error: 'La fecha de fin debe ser posterior a la fecha de inicio',
          }
        }
      }

      // Actualizar ciclo
      const { error } = await supabase
        .from('evaluation_cycles')
        .update(payload)
        .eq('id', id)

      if (error) {
        console.error('Error updating cycle:', error)
        return {
          success: false,
          error: `Error al actualizar el ciclo: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error updating cycle:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Elimina un ciclo (solo si no tiene evaluaciones)
   */
  static async deleteCycle(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
      // Verificar que no tenga evaluaciones
      const { data: evaluations } = await supabase
        .from('evaluations')
        .select('id')
        .eq('cycle_id', id)

      if (evaluations && evaluations.length > 0) {
        return {
          success: false,
          error: 'No se puede eliminar un ciclo que tiene evaluaciones asociadas',
        }
      }

      // Eliminar ciclo
      const { error } = await supabase
        .from('evaluation_cycles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting cycle:', error)
        return {
          success: false,
          error: `Error al eliminar el ciclo: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting cycle:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Cambia el estado de un ciclo
   */
  static async updateCycleStatus(
    id: string,
    status: EvaluationCycleStatus
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateCycle(id, { status })
  }

  /**
   * Activa un ciclo (desactiva otros ciclos activos)
   */
  static async activateCycle(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
      // Desactivar todos los ciclos activos
      const { error: deactivateError } = await supabase
        .from('evaluation_cycles')
        .update({ status: 'draft' })
        .eq('status', 'active')
        .neq('id', id)

      if (deactivateError) {
        console.error('Error deactivating cycles:', deactivateError)
      }

      // Activar el ciclo seleccionado
      return this.updateCycleStatus(id, 'active')
    } catch (error) {
      console.error('Unexpected error activating cycle:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado',
      }
    }
  }

  /**
   * Obtiene estadísticas generales de ciclos
   */
  static async getCycleStats(): Promise<{
    total: number
    active: number
    draft: number
    completed: number
    archived: number
  }> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluation_cycles')
      .select('status')

    if (error || !data) {
      return {
        total: 0,
        active: 0,
        draft: 0,
        completed: 0,
        archived: 0,
      }
    }

    return {
      total: data.length,
      active: data.filter((c) => c.status === 'active').length,
      draft: data.filter((c) => c.status === 'draft').length,
      completed: data.filter((c) => c.status === 'completed').length,
      archived: data.filter((c) => c.status === 'archived').length,
    }
  }
}
