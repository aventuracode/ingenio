'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EmployeeFormData } from '@/types/employee'

export default function EmployeeForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    puesto: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    activo: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('employees')
        .insert([formData])

      if (insertError) {
        throw insertError
      }

      router.push('/dashboard/empleados')
      router.refresh()
    } catch (err) {
      console.error('Error creating employee:', err)
      setError(err instanceof Error ? err.message : 'Error al crear el empleado')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Juan"
            />
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Pérez"
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
              DNI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ej: 40111222"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="juan.perez@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">
              Puesto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="puesto"
              name="puesto"
              value={formData.puesto}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Desarrollador"
            />
          </div>

          <div>
            <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700">
              Fecha de Ingreso <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Empleado activo
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  )
}
