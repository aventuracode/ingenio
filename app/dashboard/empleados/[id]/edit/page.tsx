import { createClient } from '@/lib/supabase/server'
import EmployeeForm from '@/components/EmployeeForm'
import { EmployeeFormData } from '@/types/employee'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !employee) {
    notFound()
  }

  const initialData: EmployeeFormData = {
    nombre: employee.nombre,
    apellido: employee.apellido,
    dni: employee.dni,
    email: employee.email,
    puesto: employee.puesto,
    fecha_ingreso: employee.fecha_ingreso,
    activo: employee.activo,
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/empleados"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a empleados
        </Link>
        <h3 className="text-2xl font-bold text-gray-900">Editar Empleado</h3>
        <p className="mt-1 text-sm text-gray-600">
          Actualiza la información de {employee.nombre} {employee.apellido}
        </p>
      </div>

      <EmployeeForm employeeId={id} initialData={initialData} />
    </div>
  )
}
