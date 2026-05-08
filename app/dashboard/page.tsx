import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react'

const stats = [
  {
    name: 'Ingresos Totales',
    value: '$45,231',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Usuarios Activos',
    value: '2,345',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Ventas',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Crecimiento',
    value: '24.5%',
    change: '+4.3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h3>
        <p className="mt-1 text-sm text-gray-600">
          Aquí está un resumen de tu negocio hoy
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900">Actividad Reciente</h4>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nueva venta registrada
                  </p>
                  <p className="text-xs text-gray-500">Hace {i} hora{i > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900">Tareas Pendientes</h4>
          <div className="mt-4 space-y-3">
            {['Revisar reportes mensuales', 'Aprobar nuevos empleados', 'Actualizar inventario'].map(
              (task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{task}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
