import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Empleado no encontrado</h2>
        <p className="mb-6 text-gray-600">
          El empleado que buscas no existe o ha sido eliminado.
        </p>
        <Link
          href="/dashboard/empleados"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Volver al listado
        </Link>
      </div>
    </div>
  )
}
