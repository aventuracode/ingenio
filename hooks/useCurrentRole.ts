'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidRole, type Role } from '@/lib/auth/roles'

// ============================================
// HOOK: USE CURRENT ROLE
// ============================================

export function useCurrentRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchUserRole() {
      try {
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

        // Validar que sea un role válido usando la función centralizada
        const userRole = roleName && isValidRole(roleName) ? roleName : null

        setRole(userRole)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error fetching role:', error)
        setRole(null)
        setLoading(false)
      }
    }

    // Fetch inicial
    fetchUserRole()

    // Escuchar cambios en la sesión de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Usuario se loguea o token se refresca
        setLoading(true)
        await fetchUserRole()
      } else if (event === 'SIGNED_OUT') {
        // Usuario se desloguea
        setRole(null)
        setLoading(false)
      }
    })

    // Cleanup: desuscribirse al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { role, loading }
}
