import { useState } from 'react'
import type { UserBookWithBook } from '@/types'
import { createLoanRequest } from '@/lib/bookshelf'
import { StarRating } from './StarRating'

interface PublicBookDetailModalProps {
  book: UserBookWithBook | null
  ownerId: string
  ownerName: string
  onClose: () => void
}

type ModalState = 'details' | 'form' | 'loading' | 'success' | 'error'

export function PublicBookDetailModal({
  book,
  ownerId,
  ownerName,
  onClose,
}: PublicBookDetailModalProps) {
  const [state, setState] = useState<ModalState>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!book) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setState('loading')
    try {
      await createLoanRequest({
        user_book_id: book.id,
        owner_id: ownerId,
        requester_name: name.trim(),
        requester_email: email.trim() || undefined,
        message: message.trim() || undefined,
      })
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const handleClose = () => {
    setState('details')
    setName('')
    setEmail('')
    setMessage('')
    setErrorMessage('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-cream-100 rounded-xl shadow-lg max-w-sm w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Book info */}
        <div className="p-4 flex gap-4">
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

          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-medium text-wood-600">{book.book.title}</h2>
            {book.book.author && <p className="text-sm text-muted">{book.book.author}</p>}
            {book.book.publish_year && (
              <p className="text-xs text-muted mt-1">{book.book.publish_year}</p>
            )}
            {book.rating && (
              <div className="mt-2">
                <StarRating value={book.rating} readonly size="sm" />
              </div>
            )}
          </div>
        </div>

        {book.book.description && state === 'details' && (
          <div className="px-4 pb-4">
            <p className="text-sm text-wood-500 line-clamp-4">{book.book.description}</p>
          </div>
        )}

        {/* Request button */}
        {state === 'details' && (
          <div className="border-t border-cream-300 p-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setState('form')}
              className="w-full btn-primary py-3 text-lg min-h-[44px]"
            >
              Demander à emprunter
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Request form */}
        {(state === 'form' || state === 'loading') && (
          <form onSubmit={handleSubmit} className="border-t border-cream-300 p-4">
            <p className="text-sm font-medium text-wood-600 mb-3">
              Envoyer une demande à {ownerName}
            </p>

            <div className="mb-3">
              <label htmlFor="requester-name" className="block text-xs text-muted mb-1">
                Votre nom *
              </label>
              <input
                id="requester-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="Marie"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="requester-email" className="block text-xs text-muted mb-1">
                Votre email (optionnel)
              </label>
              <input
                id="requester-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="marie@exemple.fr"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="requester-message" className="block text-xs text-muted mb-1">
                Message (optionnel)
              </label>
              <textarea
                id="requester-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm resize-none"
                placeholder="J'aimerais beaucoup lire ce livre !"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setState('details')}
                disabled={state === 'loading'}
                className="flex-1 py-2 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors text-sm"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!name.trim() || state === 'loading'}
                className="flex-1 btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {state === 'loading' ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}

        {/* Success state */}
        {state === 'success' && (
          <div className="border-t border-cream-300 p-4 text-center">
            <div className="mb-3">
              <svg
                className="w-12 h-12 mx-auto text-warm-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-wood-600 font-medium mb-1">Demande envoyée !</p>
            <p className="text-sm text-muted mb-4">{ownerName} sera notifié(e) de votre demande.</p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="border-t border-cream-300 p-4">
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {errorMessage}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setState('form')}
                className="flex-1 py-2 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors text-sm"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
