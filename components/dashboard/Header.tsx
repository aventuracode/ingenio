'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/empleados': 'Empleados',
  '/dashboard/usuarios': 'Usuarios',
}

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const pageTitle = pageNames[pathname] || 'Dashboard'
  const userName = user?.email?.split('@')[0] || 'Usuario'

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">{pageTitle}</h2>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">{userName}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
