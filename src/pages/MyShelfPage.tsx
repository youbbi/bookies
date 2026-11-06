import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { FeaturedTree } from '@/components/FeaturedTree'
import { BookSection } from '@/components/BookSection'
import { SearchBar } from '@/components/LibrarySearch'
import { BookActionModal, BarcodeScannerModal, BookSearchModal } from '@/components'
import { GoodReadsImportModal } from '@/components/GoodReadsImportModal'
import { AppHeader } from '@/components/AppHeader'
import { UsernamePrompt } from '@/components/UsernamePrompt'
import { LoanRequestsPanel } from '@/components/LoanRequestsPanel'
import {
  getUserBooks,
  removeBookFromShelf,
  addBookToShelf,
  getMyLoanRequests,
} from '@/lib/bookshelf'
import { supabase } from '@/lib/supabase'
import { lookupByIsbn } from '@/lib/openLibrary'
import { importGoodReadsLibrary, type ImportResult } from '@/lib/goodreadsImport'
import type { UserBookWithBook, LoanRequestWithBook, ReadingStatus, BookFormat } from '@/types'

export function MyShelfPage() {
  const { user, loading: authLoading } = useAuthContext()
  const [books, setBooks] = useState<UserBookWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<UserBookWithBook | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(
    null
  )
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [scanMessage, setScanMessage] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null | undefined>(undefined) // undefined = loading
  const [loanRequests, setLoanRequests] = useState<LoanRequestWithBook[]>([])

  // Fetch username from profile
  useEffect(() => {
    if (!user) {
      setUsername(null)
      return
    }

    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { username: string | null } | null }) => {
        setUsername(data?.username ?? null)
      })
  }, [user])

  // Fetch loan requests
  const fetchLoanRequests = useCallback(async () => {
    if (!user) return
    try {
      const requests = await getMyLoanRequests(user.id)
      setLoanRequests(requests)
    } catch {
      // Silent fail — not critical
    }
  }, [user])

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
    fetchLoanRequests()
  }, [user, fetchLoanRequests])

  const handleRemoveBook = useCallback(async (userBookId: string) => {
    await removeBookFromShelf(userBookId)
    setBooks((prev) => prev.filter((b) => b.id !== userBookId))
  }, [])

  const handleStatusChange = useCallback((userBookId: string, newStatus: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === userBookId ? { ...b, reading_status: newStatus } : b))
    )
  }, [])

  const handleRatingChange = useCallback((userBookId: string, newRating: number | null) => {
    setBooks((prev) => prev.map((b) => (b.id === userBookId ? { ...b, rating: newRating } : b)))
    setSelectedBook((prev) => (prev?.id === userBookId ? { ...prev, rating: newRating } : prev))
  }, [])

  const handleFormatChange = useCallback(
    (userBookId: string, newFormat: BookFormat, newLocation: string | null) => {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === userBookId
            ? {
                ...b,
                book_format: newFormat,
                location: newLocation,
                // Non-physical books can't be lent
                ...(newFormat !== 'physical'
                  ? { loan_status: 'available' as const, lent_to_user_id: null }
                  : {}),
              }
            : b
        )
      )
    },
    []
  )

  const handleLocationChange = useCallback((userBookId: string, newLocation: string | null) => {
    setBooks((prev) => prev.map((b) => (b.id === userBookId ? { ...b, location: newLocation } : b)))
    setSelectedBook((prev) => (prev?.id === userBookId ? { ...prev, location: newLocation } : prev))
  }, [])

  const handleAddBook = useCallback(
    async (book: Parameters<typeof addBookToShelf>[1]) => {
      if (!user) return

      setScanMessage(`Ajout de "${book.title}"...`)

      try {
        const userBook = await addBookToShelf(user.id, book)
        setBooks((prev) => [userBook, ...prev])
        setScanMessage(`"${book.title}" ajouté!`)
        setTimeout(() => setScanMessage(null), 3000)
      } catch (err) {
        console.error('Error adding book:', err)
        setScanMessage(`Erreur lors de l'ajout. Veuillez réessayer.`)
        setTimeout(() => setScanMessage(null), 5000)
      }
    },
    [user]
  )

  const handleStartImport = useCallback(
    async (goodReadsUrl: string) => {
      if (!user) return
      setIsImportOpen(false)
      setImportProgress({ current: 0, total: 0 })
      setImportResult(null)

      try {
        const result = await importGoodReadsLibrary(user.id, goodReadsUrl, (current, total) => {
          setImportProgress({ current, total })
        })
        setImportProgress(null)
        setImportResult(result)

        console.log('[GoodReads Import] Result:', {
          totalFound: result.totalFound,
          imported: result.imported,
          skipped: result.skipped,
          failed: result.failed,
        })
        if (result.errors.length > 0) {
          console.warn('[GoodReads Import] Errors:', result.errors)
        }

        // Refresh books list
        const userBooks = await getUserBooks(user.id)
        setBooks(userBooks)

        // Auto-dismiss result after 10 seconds
        setTimeout(() => setImportResult(null), 10000)
      } catch (err) {
        setImportProgress(null)
        setScanMessage(
          `Erreur d'importation: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
        )
        setTimeout(() => setScanMessage(null), 8000)
      }
    },
    [user]
  )

  const handleBarcodeScan = useCallback(
    async (barcode: string) => {
      if (!user) return

      setScanMessage(`Code: ${barcode} - Recherche...`)

      try {
        const book = await lookupByIsbn(barcode)

        if (!book) {
          setScanMessage(`Code "${barcode}" non trouvé. Essayez la recherche manuelle.`)
          setTimeout(() => setScanMessage(null), 5000)
          return
        }

        setScanMessage(`Ajout de "${book.title}"...`)

        const userBook = await addBookToShelf(user.id, book)
        setBooks((prev) => [userBook, ...prev])

        setScanMessage(`"${book.title}" ajouté!`)
        setTimeout(() => setScanMessage(null), 3000)
      } catch {
        setScanMessage(`Erreur pour code ${barcode}. Essayez la recherche manuelle.`)
        setTimeout(() => setScanMessage(null), 5000)
      }
    },
    [user]
  )

  // Categorize books by reading status (must be before early returns)
  const readingBooks = useMemo(() => books.filter((b) => b.reading_status === 'reading'), [books])
  const toReadBooks = useMemo(() => books.filter((b) => b.reading_status === 'to_read'), [books])
  const readBooks = useMemo(() => books.filter((b) => b.reading_status === 'read'), [books])

  // Top-rated books (4-5 stars) for "Mes coups de cœur"
  const favoriteBooks = useMemo(
    () => readBooks.filter((b) => b.rating !== null && b.rating >= 4),
    [readBooks]
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

  // Show username prompt if not set
  if (username === undefined) {
    // Still loading profile
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-wood-500">Chargement...</p>
      </div>
    )
  }

  if (username === null) {
    return <UsernamePrompt userId={user.id} onComplete={(u) => setUsername(u)} />
  }

  // Show bookshelf with user's books
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'

  const handleBookClick = (book: UserBookWithBook) => setSelectedBook(book)

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <AppHeader displayName={displayName} username={username} />

      {/* Loan requests panel */}
      <LoanRequestsPanel requests={loanRequests} onRequestHandled={fetchLoanRequests} />

      {/* Featured Tree Section - Currently Reading */}
      <FeaturedTree books={readingBooks} onBookClick={handleBookClick} />

      {/* Collapsible Book Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Mes coups de cœur - only show if there are favorites */}
        {favoriteBooks.length > 0 && (
          <BookSection
            title="Mes coups de cœur"
            books={favoriteBooks}
            defaultExpanded
            onBookClick={handleBookClick}
            showLoanStatus
          />
        )}

        <BookSection
          title="À lire"
          books={toReadBooks}
          defaultExpanded
          onBookClick={handleBookClick}
        />

        <BookSection
          title="Lus"
          books={readBooks}
          defaultExpanded={false}
          onBookClick={handleBookClick}
          showLoanStatus
        />
      </div>

      {/* Library Search Bar */}
      <SearchBar books={books} onBookClick={handleBookClick} />

      {/* Modals */}
      <BookActionModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRemove={handleRemoveBook}
        onStatusChange={handleStatusChange}
        onRatingChange={handleRatingChange}
        onFormatChange={handleFormatChange}
        onLocationChange={handleLocationChange}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <BookSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBook={handleAddBook}
      />

      <GoodReadsImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onStartImport={handleStartImport}
      />

      {/* Floating action buttons */}
      <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-40">
        {/* Import button */}
        <button
          type="button"
          onClick={() => setIsImportOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Importer depuis GoodReads"
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </button>

        {/* Add book button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Ajouter un livre"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Scanner button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="w-14 h-14 bg-wood-500 hover:bg-wood-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
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
      </div>

      {/* Import progress toast */}
      {importProgress && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-wood-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Importation en cours...</p>
              {importProgress.total > 0 && (
                <>
                  <p className="text-xs text-white/80">
                    {importProgress.current} / {importProgress.total} livres
                  </p>
                  <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/80 rounded-full transition-all duration-300"
                      style={{
                        width: `${(importProgress.current / importProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import result toast */}
      {importResult && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Importation terminée</p>
              <p className="text-xs text-white/80">
                {importResult.imported} importés
                {importResult.skipped > 0 && `, ${importResult.skipped} ignorés`}
                {importResult.failed > 0 && `, ${importResult.failed} échoués`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setImportResult(null)}
              className="text-white/80 hover:text-white ml-3"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      )}

      {/* Scan message toast */}
      {scanMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-wood-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {scanMessage}
        </div>
      )}
    </div>
  )
}
