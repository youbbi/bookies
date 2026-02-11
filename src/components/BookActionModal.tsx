import { useState } from 'react'
import type { UserBookWithBook, ReadingStatus } from '@/types'
import { updateReadingStatus, updateBookRating } from '@/lib/bookshelf'
import { StarRating } from './StarRating'

interface BookActionModalProps {
  book: UserBookWithBook | null
  onClose: () => void
  onRemove: (userBookId: string) => Promise<void>
  onStatusChange?: (userBookId: string, newStatus: ReadingStatus) => void
  onRatingChange?: (userBookId: string, newRating: number | null) => void
}

const readingStatusLabels: Record<ReadingStatus, string> = {
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lu',
}

const allStatuses: ReadingStatus[] = ['to_read', 'reading', 'read']

export function BookActionModal({
  book,
  onClose,
  onRemove,
  onStatusChange,
  onRatingChange,
}: BookActionModalProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingRating, setIsUpdatingRating] = useState(false)
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

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (newStatus === book.reading_status) return
    try {
      setIsUpdatingStatus(true)
      setError(null)
      await updateReadingStatus(book.id, newStatus)
      onStatusChange?.(book.id, newStatus)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleRatingChange = async (newRating: number | null) => {
    try {
      setIsUpdatingRating(true)
      setError(null)
      await updateBookRating(book.id, newRating)
      onRatingChange?.(book.id, newRating)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsUpdatingRating(false)
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

        {/* Star rating */}
        <div className="px-4 pb-4">
          <p className="text-sm text-muted mb-2">Votre note:</p>
          <div className={isUpdatingRating ? 'opacity-50 pointer-events-none' : ''}>
            <StarRating value={book.rating} onChange={handleRatingChange} size="md" />
          </div>
        </div>

        {/* Reading status selector */}
        <div className="px-4 pb-4">
          <p className="text-sm text-muted mb-2">Changer le statut:</p>
          <div className="flex gap-2">
            {allStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={isUpdatingStatus || status === book.reading_status}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  status === book.reading_status
                    ? 'bg-wood-500 text-white'
                    : 'bg-cream-200 text-wood-500 hover:bg-cream-300'
                }`}
              >
                {readingStatusLabels[status]}
              </button>
            ))}
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
