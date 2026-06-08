import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { EvaluationsService } from '@/lib/services/evaluations.service'
import { isValidRole } from '@/lib/auth/roles'
import EvaluationFormUnified from '@/components/evaluations/EvaluationFormUnified'

// ============================================
// PÁGINA: EDITAR EVALUACIÓN
// ============================================

export const metadata = {
  title: 'Editar Evaluación | Ingenio',
  description: 'Edita una evaluación de desempeño existente',
}

interface EditEvaluationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEvaluationPage({
  params,
}: EditEvaluationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.role as any)?.name
  const role = roleName && isValidRole(roleName) ? roleName : null

  // Solo Admin y RRHH pueden acceder
  if (role !== 'admin' && role !== 'rrhh') {
    redirect('/dashboard')
  }

  // Obtener datos en paralelo
  const [evaluation, employees, cycles] = await Promise.all([
    EvaluationsService.getEvaluationById(id),
    EvaluationsService.getEmployeesForSelection(),
    EvaluationsService.getActiveCycles(),
  ])

  if (!evaluation) {
    notFound()
  }

  // No permitir editar evaluaciones completadas
  if (evaluation.estado === 'completed') {
    redirect(`/dashboard/evaluaciones/${id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/evaluaciones/${id}`}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Evaluación 360°
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Modifica los evaluadores asignados a{' '}
            <span className="font-semibold">
              {evaluation.empleado.nombre} {evaluation.empleado.apellido}
            </span>
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <EvaluationFormUnified
        mode="edit"
        employees={employees}
        cycles={cycles}
        initialData={evaluation}
      />
    </div>
  )
}
