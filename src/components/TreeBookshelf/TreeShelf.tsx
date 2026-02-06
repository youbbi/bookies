import type { UserBookWithBook } from '@/types'
import { BookCard } from '@/components/BookCard'

export type ShelfPosition = 'upper-center' | 'lower-center'

interface TreeShelfProps {
  position: ShelfPosition
  label: string
  books: UserBookWithBook[]
  onBookClick?: (book: UserBookWithBook) => void
}

export function TreeShelf({ position, label, books, onBookClick }: TreeShelfProps) {
  return (
    <div
      className={`tree-shelf tree-shelf--${position}`}
      role="region"
      aria-label={`Étagère ${label}`}
    >
      <div className="tree-shelf__surface">
        <span className="tree-shelf__label">{label}</span>
        <div className="tree-shelf__books">
          {books.map((userBook) => (
            <BookCard
              key={userBook.id}
              title={userBook.book.title}
              author={userBook.book.author}
              coverUrl={userBook.book.cover_url}
              loanStatus={userBook.loan_status}
              onClick={() => onBookClick?.(userBook)}
              size="shelf"
            />
          ))}
          {books.length === 0 && <span className="tree-shelf__empty">Glissez un livre ici</span>}
        </div>
      </div>
      <div className="tree-shelf__edge" aria-hidden="true" />
    </div>
  )
}
