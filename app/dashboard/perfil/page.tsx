import { redirect } from 'next/navigation'
import { User, Mail, Briefcase, Calendar, Shield, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// ============================================
// PÁGINA: MI PERFIL
// ============================================

export const metadata = {
  title: 'Mi Perfil | Ingenio',
  description: 'Información personal y configuración de cuenta',
}

export default async function PerfilPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener datos del perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      role:roles(name)
    `
    )
    .eq('id', user.id)
    .single()

  // Obtener datos del empleado si existe
  const { data: employee } = await supabase
    .from('employees')
    .select(
      `
      id,
      nombre,
      apellido,
      email,
      puesto,
      departamento,
      fecha_ingreso,
      telefono,
      avatar_url
    `
    )
    .eq('user_id', user.id)
    .single()

  const roleName = (profile?.role as any)?.name || 'Sin rol'

return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-1 text-sm text-gray-600">
          Información personal y configuración de cuenta
        </p>
      </div>

      {/* PERFIL CARD */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* HEADER CON AVATAR */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center gap-6">
            {/* AVATAR */}
            <div className="relative">
              {employee?.avatar_url ? (
                <img
                  src={employee.avatar_url}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* INFO BÁSICA */}
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold">
                {employee
                  ? `${employee.nombre} ${employee.apellido}`
                  : user.email || 'Usuario'}
              </h2>
              <p className="mt-1 text-blue-100">
                {employee?.puesto || 'Sin puesto asignado'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">
                  {roleName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN PERSONAL */}
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Información Personal
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {/* EMAIL */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Correo Electrónico
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {employee?.email || user.email || 'No disponible'}
                </p>
              </div>
            </div>

            {/* PUESTO */}
            {employee?.puesto && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Puesto</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.puesto}
                  </p>
                </div>
              </div>
            )}

            {/* DEPARTAMENTO */}
            {employee?.departamento && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-50 p-2">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Departamento
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.departamento}
                  </p>
                </div>
              </div>
            )}

            {/* FECHA INGRESO */}
            {employee?.fecha_ingreso && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-50 p-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Fecha de Ingreso
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(employee.fecha_ingreso).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* TELÉFONO */}
            {employee?.telefono && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-pink-50 p-2">
                  <Mail className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.telefono}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFORMACIÓN DE CUENTA */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Información de Cuenta
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
              <p className="mt-1 font-mono text-xs text-gray-600">
                {user.id}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Rol</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {roleName}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Última autenticación
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString('es-ES')
                  : 'No disponible'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Cuenta creada
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENSAJE SI NO ES EMPLEADO */}
      {!employee && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">
                Perfil de Empleado Incompleto
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                No tienes un perfil de empleado asociado. Contacta con RRHH
                para completar tu información.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
