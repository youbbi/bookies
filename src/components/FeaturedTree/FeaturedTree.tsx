import type { UserBookWithBook } from '@/types'
import { BookCard } from '@/components/BookCard'
import treePng from '@/assets/tree-bookshelf.png'

interface FeaturedTreeProps {
  books: UserBookWithBook[]
  onBookClick?: (book: UserBookWithBook) => void
}

export function FeaturedTree({ books, onBookClick }: FeaturedTreeProps) {
  // Only show max 3 books in featured section
  const displayBooks = books.slice(0, 3)

  return (
    <div className="featured-tree">
      <img
        src={treePng}
        alt=""
        aria-hidden="true"
        className="featured-tree__background"
        draggable={false}
      />
      <div className="featured-tree__content">
        <h2 className="featured-tree__title">En cours de lecture</h2>
        {displayBooks.length > 0 ? (
          <div className="featured-tree__books">
            {displayBooks.map((userBook) => (
              <BookCard
                key={userBook.id}
                title={userBook.book.title}
                author={userBook.book.author}
                coverUrl={userBook.book.cover_url}
                onClick={() => onBookClick?.(userBook)}
                size="shelf"
              />
            ))}
          </div>
        ) : (
          <p className="featured-tree__empty">Aucun livre en cours</p>
        )}
      </div>
    </div>
  )
}
