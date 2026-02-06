import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { TreeBookshelf } from '@/components/TreeBookshelf'
import { AppHeader } from '@/components/AppHeader'
import { getUserBooks } from '@/lib/bookshelf'
import type { UserBookWithBook } from '@/types'

export function MyShelfPage() {
  const { user, loading: authLoading } = useAuthContext()
  const [books, setBooks] = useState<UserBookWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <TreeBookshelf
        books={books}
        onBookClick={(book) => console.log('Clicked:', book.book.title)}
      />
      <div className="tree-bookshelf__overlay">
        <h1 className="tree-bookshelf__title">Bookies</h1>
        <p className="tree-bookshelf__subtitle">Partagez vos livres avec vos proches</p>
      </div>
    </div>
  )
}
