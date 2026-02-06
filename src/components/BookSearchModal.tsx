import { useState, useCallback } from 'react'
import { searchBooks, type OpenLibraryBook } from '@/lib'

interface BookSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectBook: (book: OpenLibraryBook) => void
}

export function BookSearchModal({ isOpen, onClose, onSelectBook }: BookSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OpenLibraryBook[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const books = await searchBooks(query, 10)
      setResults(books)
    } catch (err) {
      setError('Erreur lors de la recherche. Veuillez réessayer.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelect = (book: OpenLibraryBook) => {
    onSelectBook(book)
    // Reset state after selection
    setQuery('')
    setResults([])
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-cream-100 rounded-card shadow-card-hover w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-cream-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-wood-500">Ajouter un livre</h2>
            <button
              onClick={handleClose}
              className="text-muted hover:text-foreground p-1"
              aria-label="Fermer"
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

          {/* Search input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher par titre ou auteur..."
              className="flex-1 px-4 py-2 rounded-lg border border-cream-300 bg-cream-50 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Chercher'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && <p className="text-red-600 text-center py-4">{error}</p>}

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}

          {!isLoading && results.length === 0 && query && !error && (
            <p className="text-muted text-center py-8">Aucun résultat trouvé.</p>
          )}

          {!isLoading && results.length === 0 && !query && (
            <p className="text-muted text-center py-8">Recherchez un livre par titre ou auteur.</p>
          )}

          {results.length > 0 && (
            <ul className="space-y-3">
              {results.map((book) => (
                <li
                  key={book.key}
                  className="flex gap-3 p-3 rounded-lg bg-cream-50 hover:bg-cream-200 transition-colors"
                >
                  {/* Cover */}
                  <div className="w-16 h-24 flex-shrink-0 bg-cream-300 rounded overflow-hidden">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={`Couverture de ${book.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                        Pas de couverture
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{book.title}</h3>
                    {book.authors && (
                      <p className="text-sm text-muted truncate">{book.authors.join(', ')}</p>
                    )}
                    {book.publishYear && (
                      <p className="text-xs text-muted mt-1">{book.publishYear}</p>
                    )}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => handleSelect(book)}
                    className="self-center btn-secondary text-sm"
                  >
                    Ajouter
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
