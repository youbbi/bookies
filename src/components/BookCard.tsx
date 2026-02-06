import type { LoanStatus } from '@/types'

interface BookCardProps {
  title: string
  author?: string | null
  coverUrl?: string | null
  loanStatus?: LoanStatus
  lentToName?: string | null
  borrowedFromName?: string | null
  onClick?: () => void
}

const statusConfig: Record<LoanStatus, { label: string; className: string }> = {
  available: {
    label: 'Disponible',
    className: 'bg-warm-green text-cream-50',
  },
  lent: {
    label: 'Prêté',
    className: 'bg-warm-amber text-cream-50',
  },
  borrowed: {
    label: 'Emprunté',
    className: 'bg-wood-400 text-cream-50',
  },
}

export function BookCard({
  title,
  author,
  coverUrl,
  loanStatus = 'available',
  lentToName,
  borrowedFromName,
  onClick,
}: BookCardProps) {
  const status = statusConfig[loanStatus]

  const getStatusText = () => {
    if (loanStatus === 'lent' && lentToName) {
      return `Prêté à ${lentToName}`
    }
    if (loanStatus === 'borrowed' && borrowedFromName) {
      return `Emprunté de ${borrowedFromName}`
    }
    return status.label
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col w-32 text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg"
    >
      {/* Cover */}
      <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-card group-hover:shadow-card-hover transition-shadow bg-cream-300">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Couverture de ${title}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2">
            <span className="text-muted text-xs text-center font-serif">{title}</span>
          </div>
        )}

        {/* Status badge */}
        <div
          className={`absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs font-medium text-center truncate ${status.className}`}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 w-32">
        <h3 className="font-medium text-foreground text-sm truncate" title={title}>
          {title}
        </h3>
        {author && (
          <p className="text-xs text-muted truncate" title={author}>
            {author}
          </p>
        )}
      </div>
    </button>
  )
}
