import { ClipboardCheck, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { ReviewerEvaluationsService } from '@/lib/services/reviewer-evaluations.service'
import PendingEvaluationsTable from '@/components/evaluations/PendingEvaluationsTable'
import { StatsGrid, type StatItem } from '@/components/ui/StatsCard'
import PageHeader from '@/components/ui/PageHeader'

// ============================================
// PÁGINA: MIS EVALUACIONES - SERVER COMPONENT
// ============================================

export const metadata = {
  title: 'Mis Evaluaciones | Ingenio',
  description: 'Evaluaciones asignadas para responder',
}

export default async function MyEvaluationsPage() {
  // Obtener evaluaciones del reviewer actual
  const evaluations = await ReviewerEvaluationsService.getMyEvaluations()

  // Calcular estadísticas
  const stats = {
    total: evaluations.length,
    pending: evaluations.filter((e) => e.status === 'pending').length,
    inProgress: evaluations.filter((e) => e.status === 'in_progress').length,
    completed: evaluations.filter((e) => e.completed).length,
  }

  // Stats cards configuration
  const statsConfig: StatItem[] = [
    {
      name: 'Total Asignadas',
      value: stats.total.toString(),
      icon: ClipboardCheck,
      color: 'blue',
    },
    {
      name: 'Pendientes',
      value: stats.pending.toString(),
      icon: Clock,
      color: 'amber',
    },
    {
      name: 'En Progreso',
      value: stats.inProgress.toString(),
      icon: TrendingUp,
      color: 'purple',
    },
    {
      name: 'Completadas',
      value: stats.completed.toString(),
      icon: CheckCircle2,
      color: 'green',
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Mis Evaluaciones"
        description="Evaluaciones asignadas para que respondas"
      />

      {/* STATS CARDS */}
      <StatsGrid stats={statsConfig} />

      {/* TABLE */}
      <PendingEvaluationsTable evaluations={evaluations} />
    </div>
  )
}
