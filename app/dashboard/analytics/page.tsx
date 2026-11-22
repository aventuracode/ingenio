import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { StatsGrid, type StatItem } from '@/components/ui/StatsCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

// ============================================
// PÁGINA: ANALYTICS - PLACEHOLDER
// ============================================

export const metadata = {
  title: 'Analytics | Ingenio',
  description: 'Analytics y reportes de evaluaciones',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Analytics"
        description="Reportes y análisis de evaluaciones de desempeño"
      />

      {/* PLACEHOLDER CARDS */}
      <StatsGrid
        stats={
          [
            {
              name: 'Promedio General',
              value: '4.2',
              description: 'De 5.0',
              icon: Target,
              color: 'blue',
            },
            {
              name: 'Participación',
              value: '87%',
              description: 'Completadas',
              icon: Users,
              color: 'green',
            },
            {
              name: 'Tendencia',
              value: '+12%',
              description: 'vs mes anterior',
              icon: TrendingUp,
              color: 'purple',
            },
            {
              name: 'Reportes',
              value: '24',
              description: 'Generados',
              icon: BarChart3,
              color: 'amber',
            },
          ] satisfies StatItem[]
        }
      />

      {/* PLACEHOLDER MESSAGE */}
      <EmptyState
        icon={BarChart3}
        title="Analytics en Desarrollo"
        description="Los reportes y gráficos detallados estarán disponibles próximamente. Incluirá: Evolución temporal, comparativas por departamento, skills más valorados, y más."
      />
    </div>
  )
}
