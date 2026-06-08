import { NextResponse } from 'next/server'
import { EvaluationsService } from '@/lib/services/evaluations.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { evaluationId, employee_id, cycle_id, reviewers } = body

    // Validaciones
    if (!evaluationId) {
      return NextResponse.json(
        { error: 'ID de evaluación requerido' },
        { status: 400 }
      )
    }

    if (!employee_id) {
      return NextResponse.json(
        { error: 'Empleado requerido' },
        { status: 400 }
      )
    }

    if (!cycle_id) {
      return NextResponse.json(
        { error: 'Ciclo requerido' },
        { status: 400 }
      )
    }

    if (!reviewers || reviewers.length === 0) {
      return NextResponse.json(
        { error: 'Debe haber al menos un evaluador' },
        { status: 400 }
      )
    }

    // Actualizar evaluación
    const result = await EvaluationsService.updateEvaluation(evaluationId, {
      employee_id,
      cycle_id,
      reviewers,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al actualizar la evaluación' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluación actualizada correctamente',
    })
  } catch (error) {
    console.error('Error in update evaluation API:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la evaluación',
      },
      { status: 500 }
    )
  }
}
