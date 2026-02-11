import type { LoanStatus } from '@/types'

type BookCardSize = 'default' | 'small' | 'shelf'

interface BookCardProps {
  title: string
  author?: string | null
  coverUrl?: string | null
  loanStatus?: LoanStatus
  lentToName?: string | null
  borrowedFromName?: string | null
  onClick?: () => void
  size?: BookCardSize
}

const sizeConfig: Record<
  BookCardSize,
  { card: string; cover: string; info: string; showInfo: boolean }
> = {
  default: {
    card: 'w-32',
    cover: 'w-32 h-48',
    info: 'w-32',
    showInfo: true,
  },
  small: {
    card: 'w-20',
    cover: 'w-20 h-28',
    info: 'w-20',
    showInfo: true,
  },
  shelf: {
    card: 'w-24',
    cover: 'w-24 h-36',
    info: 'w-24',
    showInfo: false,
  },
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
  loanStatus,
  lentToName,
  borrowedFromName,
  onClick,
  size = 'default',
}: BookCardProps) {
  const status = loanStatus ? statusConfig[loanStatus] : null
  const sizes = sizeConfig[size]

  const getStatusText = () => {
    if (!loanStatus || !status) return null
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
      className={`group flex flex-col ${sizes.card} text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg`}
    >
      {/* Cover */}
      <div
        className={`relative ${sizes.cover} rounded-lg overflow-hidden shadow-card group-hover:shadow-card-hover transition-shadow bg-cream-300`}
      >
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

        {/* Status badge - only show if loanStatus is provided */}
        {status && (
          <div
            className={`absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs font-medium text-center truncate ${status.className}`}
          >
            {getStatusText()}
          </div>
        )}
      </div>

      {/* Info - hidden for shelf size */}
      {sizes.showInfo && (
        <div className={`mt-2 ${sizes.info}`}>
          <h3 className="font-medium text-foreground text-sm truncate" title={title}>
            {title}
          </h3>
          {author && (
            <p className="text-xs text-muted truncate" title={author}>
              {author}
            </p>
          )}
        </div>
      )}
    </button>
  )
}
