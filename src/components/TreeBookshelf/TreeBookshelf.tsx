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
    </div>
  )
}
