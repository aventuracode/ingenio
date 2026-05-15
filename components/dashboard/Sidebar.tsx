'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, ChevronRight, Building2 } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { getNavigationForRole } from '@/lib/config/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { role, loading } = useCurrentRole()

  // Obtener navegación basada en el role del usuario
  const navigation = getNavigationForRole(role)

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-[#0B1120]">
      {/* HEADER */}
      <div className="flex h-16 items-center border-b border-white/5 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-white">
              Ingenio ERP
            </h1>

            <p className="text-xs text-gray-400">
              Human Resources
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6">
        <div className="mb-4 px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            General
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
          {navigation.map((item) => {
            // Lógica mejorada para evitar que rutas hijas activen rutas padres
            let isActive = false
            
            if (pathname === item.href) {
              // Coincidencia exacta
              isActive = true
            } else if (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) {
              // Para rutas que no sean /dashboard, verificar si es una subruta
              // Pero solo si no hay otra ruta más específica en la navegación
              const moreSpecificRoute = navigation.find(
                (navItem) =>
                  navItem.href !== item.href &&
                  navItem.href.startsWith(item.href) &&
                  pathname.startsWith(navItem.href)
              )
              isActive = !moreSpecificRoute
            }

            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-white'
                    }`}
                  />

                  <span>{item.name}</span>
                </div>

                {isActive && (
                  <ChevronRight className="h-4 w-4 text-white/80" />
                )}
              </Link>
            )
          })}
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-white/5 p-4">
        <button
          onClick={logout}
          className="
            group flex w-full items-center gap-3 rounded-xl
            px-3 py-3 text-sm font-medium text-gray-400
            transition-all duration-200
            hover:bg-red-500/10 hover:text-red-400
          "
        >
          <LogOut className="h-5 w-5" />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}