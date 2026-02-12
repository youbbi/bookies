import { useState } from 'react'
import type { UserBookWithBook } from '@/types'
import { BookCard } from '@/components/BookCard'

interface BookSectionProps {
  title: string
  books: UserBookWithBook[]
  defaultExpanded?: boolean
  onBookClick?: (book: UserBookWithBook) => void
  showLoanStatus?: boolean
}

export function BookSection({
  title,
  books,
  defaultExpanded = false,
  onBookClick,
  showLoanStatus = false,
}: BookSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="book-section">
      <button
        type="button"
        className="book-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="book-section__header-left">
          <svg
            className={`book-section__chevron ${isExpanded ? 'book-section__chevron--expanded' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="book-section__title">{title}</span>
        </div>
        <span className="book-section__count">{books.length}</span>
      </button>

      <div
        id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`book-section__content ${isExpanded ? 'book-section__content--expanded' : 'book-section__content--collapsed'}`}
      >
        {books.length > 0 ? (
          <div className="book-section__books">
            {books.map((userBook) => (
              <BookCard
                key={userBook.id}
                title={userBook.book.title}
                author={userBook.book.author}
                coverUrl={userBook.book.cover_url}
                loanStatus={showLoanStatus ? userBook.loan_status : undefined}
                onClick={() => onBookClick?.(userBook)}
                size="shelf"
              />
            ))}
          </div>
        ) : (
          <p className="book-section__empty">Aucun livre dans cette section</p>
        )}
      </div>
    </div>
  )
}
