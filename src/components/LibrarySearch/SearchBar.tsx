import { useState, useEffect, useRef, useMemo } from 'react'
import Fuse from 'fuse.js'
import type { UserBookWithBook } from '@/types'

interface SearchBarProps {
  books: UserBookWithBook[]
  onBookClick?: (book: UserBookWithBook) => void
}

export function SearchBar({ books, onBookClick }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(books, {
        keys: [
          { name: 'book.title', weight: 0.6 },
          { name: 'book.author', weight: 0.4 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [books]
  )

  // Get search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query, { limit: 10 }).map((result) => result.item)
  }, [fuse, query])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (book: UserBookWithBook) => {
    onBookClick?.(book)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="library-search">
      {/* Search results overlay */}
      {isOpen && query.trim() && (
        <div className="library-search__results">
          {results.length > 0 ? (
            results.map((book) => (
              <button
                key={book.id}
                type="button"
                className="library-search__result-item"
                onClick={() => handleSelect(book)}
              >
                {book.book.cover_url ? (
                  <img src={book.book.cover_url} alt="" className="library-search__result-cover" />
                ) : (
                  <div className="library-search__result-cover flex items-center justify-center">
                    <span className="text-[8px] text-muted text-center px-1">
                      {book.book.title.slice(0, 20)}
                    </span>
                  </div>
                )}
                <div className="library-search__result-info">
                  <p className="library-search__result-title">{book.book.title}</p>
                  {book.book.author && (
                    <p className="library-search__result-author">{book.book.author}</p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="library-search__no-results">Aucun livre trouvé pour "{query}"</p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="library-search__input-wrapper">
        <svg className="library-search__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="library-search__input"
          placeholder="Rechercher dans ma bibliothèque..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button type="button" className="library-search__clear" onClick={handleClear}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
