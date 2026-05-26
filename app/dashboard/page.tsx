import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidRole } from '@/lib/auth/roles'
import DashboardRRHH from '@/components/dashboard/DashboardRRHH'
import DashboardEmployee from '@/components/dashboard/DashboardEmployee'

// ============================================
// PÁGINA: DASHBOARD DINÁMICO - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Dashboard | Ingenio',
  description: 'Dashboard personalizado',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener role del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.role as any)?.name
  const role = roleName && isValidRole(roleName) ? roleName : null

  if (!role) {
    redirect('/login')
  }

  // Obtener employee_id si existe
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const employeeId = employee?.id

  // Renderizar dashboard según role
  if (role === 'admin' || role === 'rrhh') {
    return <DashboardRRHH />
  }

  if (role === 'employee' && employeeId) {
    return <DashboardEmployee employeeId={employeeId} />
  }

  if (role === 'manager' && employeeId) {
    // TODO: Crear DashboardManager
    return <DashboardEmployee employeeId={employeeId} />
  }

  // Fallback
  redirect('/login')
}
