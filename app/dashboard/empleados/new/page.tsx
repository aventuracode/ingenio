import EmployeeForm from '@/components/EmployeeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
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
        <h3 className="text-2xl font-bold text-gray-900">Crear Empleado</h3>
        <p className="mt-1 text-sm text-gray-600">
          Completa el formulario para agregar un nuevo empleado
        </p>
      </div>

      <EmployeeForm />
    </div>
  )
}
