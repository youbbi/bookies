import type { UserBookWithBook } from '@/types'
import { TreeSvg } from './TreeSvg'
import { TreeShelf } from './TreeShelf'
import { TreeDecorations } from './TreeDecorations'

interface TreeBookshelfProps {
  books: UserBookWithBook[]
  onBookClick?: (book: UserBookWithBook) => void
}

export function TreeBookshelf({ books, onBookClick }: TreeBookshelfProps) {
  // Currently reading books
  const reading = books.filter((b) => b.reading_status === 'reading')

  // Last 10 best read books (most recently read, could add rating filter later)
  const bestRead = books.filter((b) => b.reading_status === 'read').slice(0, 10)

  // Books to read (hidden from main shelves but need to be accessible)
  const toRead = books.filter((b) => b.reading_status === 'to_read')

  return (
    <div className="tree-bookshelf">
      <div className="tree-bookshelf__container">
        <TreeSvg />

        <TreeShelf
          position="upper-center"
          label="En cours"
          books={reading}
          onBookClick={onBookClick}
        />

        <TreeShelf
          position="lower-center"
          label="Mes coups de cœur"
          books={bestRead}
          onBookClick={onBookClick}
        />

        <TreeDecorations />
      </div>

      {/* Show "to read" books in a simple list at bottom if any exist */}
      {toRead.length > 0 && (
        <div className="mt-4 px-4 pb-4">
          <h3 className="text-sm font-medium text-wood-500 mb-2">À lire ({toRead.length})</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {toRead.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => onBookClick?.(book)}
                className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden shadow-card bg-cream-300"
              >
                {book.book.cover_url ? (
                  <img
                    src={book.book.cover_url}
                    alt={book.book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <span className="text-muted text-[8px] text-center font-serif line-clamp-3">
                      {book.book.title}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
