import { Plus, Calendar, TrendingUp, Archive, FileText } from 'lucide-react'
import Link from 'next/link'
import { EvaluationCyclesService } from '@/lib/services/evaluation-cycles.service'
import CycleTable from '@/components/evaluations/CycleTable'
import { StatsGrid, type StatItem } from '@/components/ui/StatsCard'
import PageHeader from '@/components/ui/PageHeader'

// ============================================
// PÁGINA: CICLOS DE EVALUACIÓN - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Ciclos de Evaluación | Ingenio',
  description: 'Gestiona los ciclos de evaluación de desempeño',
}

export default async function CyclesPage() {
  // Fetch data en paralelo
  const [cycles, stats] = await Promise.all([
    EvaluationCyclesService.getCycles(),
    EvaluationCyclesService.getCycleStats(),
  ])

  // Stats cards configuration
  const statsConfig: StatItem[] = [
    {
      name: 'Total de Ciclos',
      value: stats.total.toString(),
      icon: FileText,
      color: 'blue',
    },
    {
      name: 'Ciclos Activos',
      value: stats.active.toString(),
      icon: TrendingUp,
      color: 'green',
    },
    {
      name: 'Borradores',
      value: stats.draft.toString(),
      icon: Calendar,
      color: 'gray',
    },
    {
      name: 'Completados',
      value: stats.completed.toString(),
      icon: Archive,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Ciclos de Evaluación"
        description="Gestiona los períodos de evaluación de desempeño"
        action={
          <Link
            href="/dashboard/evaluaciones/ciclos/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Nuevo Ciclo
          </Link>
        }
      />

      {/* STATS CARDS */}
      <StatsGrid stats={statsConfig} />

      {/* TABLE */}
      <CycleTable cycles={cycles} />
    </div>
  )
}
