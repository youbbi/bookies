import { useState, useCallback } from 'react'
import { isValidGoodReadsUrl } from '@/lib/goodreads'
import { importGoodReadsLibrary, type ImportResult } from '@/lib/goodreadsImport'

type ViewState = 'input' | 'importing' | 'summary' | 'error'

interface GoodReadsImportModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userId: string
}

export function GoodReadsImportModal({
  isOpen,
  onClose,
  onComplete,
  userId,
}: GoodReadsImportModalProps) {
  const [url, setUrl] = useState('')
  const [view, setView] = useState<ViewState>('input')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const isUrlValid = isValidGoodReadsUrl(url)

  const handleImport = useCallback(async () => {
    setView('importing')
    setProgress({ current: 0, total: 0 })

    try {
      const importResult = await importGoodReadsLibrary(userId, url, (current, total) => {
        setProgress({ current, total })
      })
      setResult(importResult)
      setView('summary')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setView('error')
    }
  }, [userId, url])

  const handleClose = useCallback(() => {
    setUrl('')
    setView('input')
    setResult(null)
    setError('')
    onClose()
  }, [onClose])

  const handleDismiss = useCallback(() => {
    setUrl('')
    setView('input')
    setResult(null)
    onComplete()
  }, [onComplete])

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
        <div className="p-4">
          {view === 'input' && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Collez l'URL de votre profil GoodReads pour importer votre bibliothèque.
                Assurez-vous que vos étagères sont publiques.
              </p>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.goodreads.com/user/show/..."
                className="w-full px-4 py-2 rounded-lg border border-cream-300 bg-cream-50 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />

              <button
                onClick={handleImport}
                disabled={!isUrlValid}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importer
              </button>
            </div>
          )}

          {view === 'importing' && (
            <div className="py-8 text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
              <p className="text-foreground">
                Importation en cours...
                {progress.total > 0 && (
                  <span className="block text-sm text-muted mt-1">
                    {progress.current} / {progress.total} livres
                  </span>
                )}
              </p>
            </div>
          )}

          {view === 'summary' && result && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <svg
                  className="w-12 h-12 text-green-500 mx-auto mb-2"
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
                <h3 className="text-lg font-serif text-wood-500">Importation terminée</h3>
              </div>

              <div className="bg-cream-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Livres trouvés</span>
                  <span className="font-medium">{result.totalFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Importés</span>
                  <span className="font-medium text-green-600">{result.imported}</span>
                </div>
                {result.skipped > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Ignorés (doublons)</span>
                    <span className="font-medium text-yellow-600">{result.skipped}</span>
                  </div>
                )}
                {result.failed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Échoués</span>
                    <span className="font-medium text-red-600">{result.failed}</span>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="text-xs text-red-600 space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              )}

              <button onClick={handleDismiss} className="w-full btn-primary">
                Fermer
              </button>
            </div>
          )}

          {view === 'error' && (
            <div className="py-6 text-center space-y-4">
              <svg
                className="w-12 h-12 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600">Erreur: {error}</p>
              <button onClick={() => setView('input')} className="btn-secondary">
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
