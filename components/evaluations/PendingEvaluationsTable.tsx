'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ClipboardCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import type { MyEvaluationListItem } from '@/types/reviewer-evaluation'
import { getReviewerTypeColors } from '@/lib/constants/reviewer-types'

// ============================================
// COMPONENT: PENDING EVALUATIONS TABLE
// ============================================

interface PendingEvaluationsTableProps {
  evaluations: MyEvaluationListItem[]
}

export default function PendingEvaluationsTable({
  evaluations,
}: PendingEvaluationsTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string, statusLabel: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
    }

    const icons = {
      pending: Clock,
      in_progress: ClipboardCheck,
      completed: CheckCircle2,
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
          colors[status as keyof typeof colors] || colors.pending
        }`}
      >
        <Icon className="h-3 w-3" />
        {statusLabel}
      </span>
    )
  }

  if (evaluations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <ClipboardCheck className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No tienes evaluaciones asignadas
        </h3>
        <p className="text-sm text-gray-600">
          Cuando se te asignen evaluaciones, aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Ciclo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {evaluations.map((evaluation) => {
              const reviewerColors = getReviewerTypeColors(evaluation.reviewerType)

              return (
                <tr
                  key={evaluation.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  {/* EMPLEADO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {evaluation.employeeAvatar ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100">
                          <Image
                            src={evaluation.employeeAvatar}
                            alt={`${evaluation.employeeName} ${evaluation.employeeLastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white ring-2 ring-gray-100">
                          {evaluation.employeeName.charAt(0)}
                          {evaluation.employeeLastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {evaluation.employeeName} {evaluation.employeeLastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {evaluation.employeePosition}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CICLO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {evaluation.cycleTitle}
                      </span>
                    </div>
                  </td>

                  {/* TIPO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${reviewerColors.bg} ${reviewerColors.text} ${reviewerColors.border}`}
                    >
                      {evaluation.reviewerTypeLabel}
                    </span>
                  </td>

                  {/* PROGRESO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700">
                            {evaluation.answeredQuestions}/{evaluation.totalQuestions}
                          </span>
                          <span className="text-gray-500">
                            {evaluation.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${evaluation.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(evaluation.status, evaluation.statusLabel)}
                  </td>

                  {/* FECHA */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(evaluation.createdAt)}
                    </span>
                  </td>

                  {/* ACCIÓN */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {evaluation.canRespond ? (
                      <Link
                        href={`/dashboard/mis-evaluaciones/${evaluation.evaluationId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        {evaluation.progress > 0 ? 'Continuar' : 'Responder'}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Completada
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
