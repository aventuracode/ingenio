import Image from 'next/image'
import { MessageSquare } from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface Comment {
  id: string
  comment: string
  date: string
  reviewer: {
    nombre: string
    apellido: string
    puesto: string
    avatar: string | null
  }
}

interface EvaluationCommentsSectionProps {
  comments: Comment[]
}

// ============================================
// COMPONENTE: SECCIÓN DE COMENTARIOS
// ============================================

export default function EvaluationCommentsSection({
  comments,
}: EvaluationCommentsSectionProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-amber-100 p-2">
          <MessageSquare className="h-5 w-5 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Comentarios Generales
        </h3>
      </div>

      {comments.length === 0 ? (
        // EMPTY STATE
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            Sin comentarios generales
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Los evaluadores aún no dejaron observaciones.
          </p>
        </div>
      ) : (
        // LISTA DE COMENTARIOS
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                {/* AVATAR */}
                <div className="flex-shrink-0">
                  {comment.reviewer.avatar ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={comment.reviewer.avatar}
                        alt={`${comment.reviewer.nombre} ${comment.reviewer.apellido}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                      {comment.reviewer.nombre.charAt(0)}
                      {comment.reviewer.apellido.charAt(0)}
                    </div>
                  )}
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 min-w-0">
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {comment.reviewer.nombre} {comment.reviewer.apellido}
                      </div>
                      <div className="text-sm text-gray-600">
                        {comment.reviewer.puesto}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {new Date(comment.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* COMENTARIO */}
                  <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.comment}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
