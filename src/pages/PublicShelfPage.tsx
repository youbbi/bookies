import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProfileByUsername, getPublicShelfBooks } from '@/lib/bookshelf'
import { BookCard } from '@/components/BookCard'
import { PublicBookDetailModal } from '@/components/PublicBookDetailModal'
import type { Profile, UserBookWithBook } from '@/types'

export function PublicShelfPage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [books, setBooks] = useState<UserBookWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedBook, setSelectedBook] = useState<UserBookWithBook | null>(null)

  useEffect(() => {
    if (!username) return

    const load = async () => {
      try {
        const p = await getProfileByUsername(username)
        if (!p) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setProfile(p)
        const userBooks = await getPublicShelfBooks(p.id)
        setBooks(userBooks)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [username])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-wood-500">Chargement...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-2xl font-serif text-wood-600 mb-4">Utilisateur introuvable</h1>
        <p className="text-muted mb-6 text-center">
          Cette bibliothèque n'existe pas ou n'est plus disponible.
        </p>
        <Link to="/" className="btn-secondary">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const ownerName = profile.display_name || username || 'Utilisateur'

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-wood-600 text-cream-50 px-4 py-6 text-center">
        <p className="text-sm text-cream-200 mb-1">Bibliothèque de</p>
        <h1 className="text-2xl font-serif">{ownerName}</h1>
        <p className="text-sm text-cream-200 mt-2">
          {books.length} livre{books.length !== 1 ? 's' : ''} disponible
          {books.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Book grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted text-center">Aucun livre disponible pour le moment.</p>
        </div>
      ) : (
        <div className="px-4 py-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 justify-items-center">
            {books.map((ub) => (
              <BookCard
                key={ub.id}
                title={ub.book.title}
                author={ub.book.author}
                coverUrl={ub.book.cover_url}
                onClick={() => setSelectedBook(ub)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Book detail modal with request form */}
      <PublicBookDetailModal
        book={selectedBook}
        ownerId={profile.id}
        ownerName={ownerName}
        onClose={() => setSelectedBook(null)}
      />

      {/* Footer branding */}
      <div className="text-center py-4">
        <Link to="/" className="text-xs text-muted hover:text-wood-500 transition-colors">
          Bookies
        </Link>
      </div>
    </div>
  )
}
