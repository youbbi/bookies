import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { TreeBookshelf } from '@/components/TreeBookshelf'
import { BookActionModal, BarcodeScannerModal } from '@/components'
import { AppHeader } from '@/components/AppHeader'
import { getUserBooks, removeBookFromShelf, addBookToShelf } from '@/lib/bookshelf'
import { lookupByIsbn } from '@/lib/openLibrary'
import type { UserBookWithBook } from '@/types'

export function MyShelfPage() {
  const { user, loading: authLoading } = useAuthContext()
  const [books, setBooks] = useState<UserBookWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<UserBookWithBook | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchBooks = async () => {
      try {
        setLoading(true)
        setError(null)
        const userBooks = await getUserBooks(user.id)
        setBooks(userBooks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [user])

  const handleRemoveBook = useCallback(async (userBookId: string) => {
    await removeBookFromShelf(userBookId)
    setBooks((prev) => prev.filter((b) => b.id !== userBookId))
  }, [])

  const handleBarcodeScan = useCallback(
    async (barcode: string) => {
      if (!user) return

      setScanMessage('Recherche du livre...')

      try {
        const book = await lookupByIsbn(barcode)

        if (!book) {
          setScanMessage('Livre non trouvé pour ce code-barres')
          setTimeout(() => setScanMessage(null), 3000)
          return
        }

        setScanMessage(`Ajout de "${book.title}"...`)

        const userBook = await addBookToShelf(user.id, book)
        setBooks((prev) => [userBook, ...prev])

        setScanMessage(`"${book.title}" ajouté à votre bibliothèque!`)
        setTimeout(() => setScanMessage(null), 3000)
      } catch (err) {
        setScanMessage(err instanceof Error ? err.message : "Erreur lors de l'ajout")
        setTimeout(() => setScanMessage(null), 3000)
      }
    },
    [user]
  )

  // Show loading while checking auth
  if (authLoading || (loading && user)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-wood-500">Chargement...</p>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-2xl font-serif text-wood-600 mb-4">Ma Bibliothèque</h1>
        <p className="text-muted mb-6 text-center">
          Connectez-vous pour accéder à votre bibliothèque
        </p>
        <Link to="/sign-in" className="btn-primary">
          Se connecter
        </Link>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-red-600 mb-4">Erreur: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary">
          Réessayer
        </button>
      </div>
    )
  }

  // Show bookshelf with user's books
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <div className="h-screen overflow-hidden relative">
      <AppHeader displayName={displayName} />
      <TreeBookshelf books={books} onBookClick={(book) => setSelectedBook(book)} />
      <div className="tree-bookshelf__overlay">
        <h1 className="tree-bookshelf__title">Bookies</h1>
        <p className="tree-bookshelf__subtitle">Partagez vos livres avec vos proches</p>
      </div>

      <BookActionModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRemove={handleRemoveBook}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      {/* Floating action button for scanner */}
      <button
        type="button"
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Scanner un livre"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
          />
        </svg>
      </button>

      {/* Scan message toast */}
      {scanMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-wood-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {scanMessage}
        </div>
      )}
    </div>
  )
}
