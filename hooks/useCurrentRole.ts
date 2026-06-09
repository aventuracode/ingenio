'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidRole, type Role } from '@/lib/auth/roles'
import type { User } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Singleton cache a nivel de módulo
// Sobrevive re-montajes y navegación SPA. Se invalida solo en SIGNED_OUT.
// ---------------------------------------------------------------------------
let roleCache: { userId: string; role: Role | null } | null = null

function withTimeout(promise: any, ms: number): Promise<any> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms)
    ),
  ])
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useCurrentRole() {
  const [role, setRole] = useState<Role | null>(roleCache?.role ?? null)
  const [loading, setLoading] = useState(roleCache === null)
  const isMounted = useRef(true)
  const currentUserId = useRef<string | null>(roleCache?.userId ?? null)

  const fetchRole = useCallback(async (user: User) => {
    // Si el userId no cambió y tenemos cache, no hacer nada
    if (roleCache?.userId === user.id) {
      if (isMounted.current) {
        setRole(roleCache.role)
        setLoading(false)
      }
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('role:roles!profiles_role_id_fkey ( name )')
          .eq('id', user.id)
          .single(),
        5000
      )

      if (!isMounted.current) return

      if (error) throw error

      const roleName = (data?.role as any)?.name as string | undefined
      const resolved = roleName && isValidRole(roleName) ? roleName : null

      // Actualizar cache y estado
      roleCache = { userId: user.id, role: resolved }
      currentUserId.current = user.id

      setRole(resolved)
    } catch (err) {
      // En error de red/timeout: mantener role anterior si es el mismo usuario
      if (isMounted.current && currentUserId.current !== user.id) {
        setRole(null)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    isMounted.current = true

    // ------------------------------------------------------------------
    // Carga inicial: getSession() lee localStorage, nunca hace red
    // ------------------------------------------------------------------
    async function bootstrap() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!isMounted.current) return

      if (!session?.user) {
        setRole(null)
        setLoading(false)
        return
      }

      await fetchRole(session.user)
    }

    bootstrap()

    // ------------------------------------------------------------------
    // Listener: solo reaccionar a cambios reales de sesión
    // ------------------------------------------------------------------
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          roleCache = null
          currentUserId.current = null
          if (isMounted.current) {
            setRole(null)
            setLoading(false)
          }
          return
        }

        // SIGNED_IN / TOKEN_REFRESHED
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session?.user || !isMounted.current) return

          // CLAVE: si es el mismo usuario, no recargar
          // Esto cubre el caso de volver a la pestaña
          if (currentUserId.current === session.user.id && roleCache) {
            return
          }

          setLoading(true)
          await fetchRole(session.user)
        }
      }
    )

    return () => {
      isMounted.current = false
      subscription.unsubscribe()
    }
  }, [fetchRole])

  return { role, loading }
}