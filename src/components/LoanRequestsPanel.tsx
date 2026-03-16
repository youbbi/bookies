import { useState } from 'react'
import type { LoanRequestWithBook } from '@/types'
import { updateLoanRequestStatus } from '@/lib/bookshelf'

interface LoanRequestsPanelProps {
  requests: LoanRequestWithBook[]
  onRequestHandled: () => void
}

export function LoanRequestsPanel({ requests, onRequestHandled }: LoanRequestsPanelProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  if (requests.length === 0) return null

  const handleAction = async (requestId: string, status: 'accepted' | 'declined') => {
    setProcessingId(requestId)
    try {
      await updateLoanRequestStatus(requestId, status)
      onRequestHandled()
    } catch (err) {
      console.error('Error updating loan request:', err)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="bg-warm-amber/10 border border-warm-amber/30 rounded-xl p-4">
        <h2 className="font-serif text-lg text-wood-600 mb-3">
          Demandes d'emprunt ({requests.length})
        </h2>

        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-cream-100 rounded-lg p-3 shadow-sm">
              <div className="flex gap-3">
                {/* Book thumbnail */}
                <div className="w-12 h-18 rounded overflow-hidden bg-cream-300 flex-shrink-0">
                  {req.user_book.book.cover_url ? (
                    <img
                      src={req.user_book.book.cover_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted text-[8px] text-center">
                        {req.user_book.book.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-wood-600 truncate">
                    {req.user_book.book.title}
                  </p>
                  <p className="text-xs text-muted">
                    Demandé par <span className="font-medium">{req.requester_name}</span>
                  </p>
                  {req.message && (
                    <p className="text-xs text-wood-500 mt-1 italic line-clamp-2">
                      « {req.message} »
                    </p>
                  )}
                  {req.requester_email && (
                    <p className="text-xs text-muted mt-1">{req.requester_email}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'accepted')}
                  disabled={processingId === req.id}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-warm-green text-cream-50 hover:bg-warm-green/90 transition-colors disabled:opacity-50"
                >
                  {processingId === req.id ? '...' : 'Accepter'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'declined')}
                  disabled={processingId === req.id}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-cream-200 text-wood-500 hover:bg-cream-300 transition-colors disabled:opacity-50"
                >
                  Décliner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
