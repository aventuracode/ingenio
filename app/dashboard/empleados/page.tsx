import { createClient } from '@/lib/supabase/server'
import EmployeeTable from '@/components/EmployeeTable'
import { Employee } from '@/types/employee'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function EmpleadosPage() {
  const supabase = await createClient()

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees:', error)
  }

  const employeeList: Employee[] = employees || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Empleados</h3>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tu equipo de trabajo
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">{employeeList.length}</span>
          </div>
          <Link
            href="/dashboard/empleados/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Empleado
          </Link>
        </div>
      </div>

      <EmployeeTable employees={employeeList} />
    </div>
  )
}
