import { useState, useCallback } from 'react'
import { isValidGoodReadsUrl } from '@/lib/goodreads'

interface GoodReadsImportModalProps {
  isOpen: boolean
  onClose: () => void
  onStartImport: (url: string) => void
}

export function GoodReadsImportModal({
  isOpen,
  onClose,
  onStartImport,
}: GoodReadsImportModalProps) {
  const [url, setUrl] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const isUrlValid = isValidGoodReadsUrl(url)

  const handleImport = useCallback(() => {
    onStartImport(url)
    setUrl('')
    setShowHelp(false)
  }, [url, onStartImport])

  const handleClose = useCallback(() => {
    setUrl('')
    setShowHelp(false)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-cream-100 rounded-card shadow-card-hover w-full max-w-lg mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-cream-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-wood-500">Importer depuis GoodReads</h2>
            <button
              onClick={handleClose}
              className="text-muted hover:text-foreground p-1"
              aria-label="Fermer le modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted">
            Collez l'URL de votre profil GoodReads pour importer votre bibliothèque.
          </p>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.goodreads.com/user/show/..."
            className="w-full px-4 py-2 rounded-lg border border-cream-300 bg-cream-50 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />

          {/* Help section */}
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showHelp ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Comment trouver mon URL GoodReads ?
          </button>

          {showHelp && (
            <div className="text-sm text-muted bg-cream-50 rounded-lg p-3 space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Connectez-vous sur{' '}
                  <a
                    href="https://www.goodreads.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    goodreads.com
                  </a>
                </li>
                <li>Cliquez sur votre nom ou photo de profil</li>
                <li>Copiez l'URL de la page depuis la barre d'adresse</li>
              </ol>
              <p className="text-xs text-muted/70">
                L'URL ressemble à : goodreads.com/user/show/12345-votrenom
              </p>
              <p className="text-xs text-muted/70">
                Assurez-vous que vos étagères sont publiques dans vos paramètres de confidentialité
                GoodReads.
              </p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!isUrlValid}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  )
}
