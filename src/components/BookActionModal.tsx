import { useState } from 'react'
import type { UserBookWithBook, ReadingStatus } from '@/types'

interface BookActionModalProps {
  book: UserBookWithBook | null
  onClose: () => void
  onRemove: (userBookId: string) => Promise<void>
}

const readingStatusLabels: Record<ReadingStatus, string> = {
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lu',
}

export function BookActionModal({ book, onClose, onRemove }: BookActionModalProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!book) return null

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      setError(null)
      await onRemove(book.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsRemoving(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-cream-100 rounded-xl shadow-lg max-w-sm w-full overflow-hidden">
        {/* Book info */}
        <div className="p-4 flex gap-4">
          {/* Cover */}
          <div className="w-24 h-36 rounded-lg overflow-hidden shadow-card bg-cream-300 flex-shrink-0">
            {book.book.cover_url ? (
              <img
                src={book.book.cover_url}
                alt={`Couverture de ${book.book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <span className="text-muted text-xs text-center font-serif">{book.book.title}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-medium text-wood-600 truncate">
              {book.book.title}
            </h2>
            {book.book.author && <p className="text-sm text-muted truncate">{book.book.author}</p>}
            {book.book.publish_year && (
              <p className="text-xs text-muted mt-1">{book.book.publish_year}</p>
            )}

            {/* Reading status badge */}
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-cream-300 text-wood-500">
              {readingStatusLabels[book.reading_status]}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 pb-2">
            <p className="text-red-600 text-sm">Erreur: {error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-cream-300 p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full py-3 px-4 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
          >
            {isRemoving ? 'Suppression...' : 'Retirer de ma bibliothèque'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
