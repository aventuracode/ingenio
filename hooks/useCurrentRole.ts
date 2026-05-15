'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/navigation'

// ============================================
// HOOK: USE CURRENT ROLE
// ============================================

export function useCurrentRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const supabase = createClient()

        // Obtener usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setRole(null)
          setLoading(false)
          return
        }

        // Obtener profile con role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(
            `
            id,
            role:roles!profiles_role_id_fkey (
              name
            )
          `
          )
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error)
          setRole(null)
          setLoading(false)
          return
        }

        // Extraer role name
        const roleName = (profile?.role as any)?.name as string | undefined

        // Validar que sea un role válido
        const validRoles: UserRole[] = ['admin', 'rrhh', 'manager', 'employee']
        const userRole = validRoles.includes(roleName as UserRole)
          ? (roleName as UserRole)
          : null

        setRole(userRole)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error fetching role:', error)
        setRole(null)
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  return { role, loading }
}
