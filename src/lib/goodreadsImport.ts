// GoodReads Import Engine
// Orchestrates: fetch RSS → resolve via Open Library → deduplicate → add to shelf

import type { UserBookWithBook } from '@/types'
import type { GoodReadsBook } from './goodreads'
import type { OpenLibraryBook } from './openLibrary'
import { fetchGoodReadsBooks, extractGoodReadsUserId, SHELF_TO_STATUS } from './goodreads'
import { lookupByIsbn, searchBooks } from './openLibrary'
import { addBookToShelf, getUserBooks } from './bookshelf'

export interface ImportResult {
  totalFound: number
  imported: number
  skipped: number
  failed: number
  errors: string[]
}

/**
 * Check if a GoodReads book already exists on the user's Bookies shelf.
 * Matches by ISBN first, then by title+author (case-insensitive).
 */
export function isDuplicateBook(grBook: GoodReadsBook, existingBooks: UserBookWithBook[]): boolean {
  // Match by ISBN (if both have one)
  if (grBook.isbn) {
    const isbnMatch = existingBooks.some((ub) => ub.book.isbn && ub.book.isbn === grBook.isbn)
    if (isbnMatch) return true
  }

  // Match by title + author (case-insensitive)
  const titleMatch = existingBooks.some(
    (ub) =>
      ub.book.title.toLowerCase() === grBook.title.toLowerCase() &&
      ub.book.author?.toLowerCase() === grBook.author.toLowerCase()
  )

  return titleMatch
}

/**
 * Resolve a GoodReads book to an OpenLibraryBook.
 * Tries ISBN lookup first, then search, then creates a fallback from RSS data.
 */
export async function resolveBook(grBook: GoodReadsBook): Promise<OpenLibraryBook> {
  // Try ISBN lookup first
  if (grBook.isbn) {
    try {
      const result = await lookupByIsbn(grBook.isbn)
      if (result) return result
    } catch {
      // Fall through to search
    }
  }

  // Try search by title + author
  try {
    const query = `${grBook.title} ${grBook.author}`.trim()
    const results = await searchBooks(query, 1)
    if (results.length > 0) return results[0]
  } catch {
    // Fall through to fallback
  }

  // Fallback: create book from RSS data directly
  return {
    key: `goodreads-import-${grBook.isbn || grBook.title.replace(/\s+/g, '-').toLowerCase()}`,
    title: grBook.title,
    authors: grBook.author ? [grBook.author] : [],
    isbn: grBook.isbn || undefined,
    coverUrl: grBook.coverUrl || undefined,
  }
}

/**
 * Import a user's GoodReads library into Bookies.
 * Fetches books from RSS, resolves via Open Library, skips duplicates, adds to shelf.
 */
export async function importGoodReadsLibrary(
  userId: string,
  goodReadsProfileUrl: string,
  onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
  const grUserId = extractGoodReadsUserId(goodReadsProfileUrl)
  if (!grUserId) {
    throw new Error('Invalid GoodReads profile URL')
  }

  // Fetch all books from GoodReads RSS feeds
  const grBooks = await fetchGoodReadsBooks(grUserId)

  // Get existing books on user's shelf for duplicate detection
  const existingBooks = await getUserBooks(userId)

  const result: ImportResult = {
    totalFound: grBooks.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < grBooks.length; i++) {
    const grBook = grBooks[i]

    // Check for duplicates
    if (isDuplicateBook(grBook, existingBooks)) {
      result.skipped++
      onProgress?.(i + 1, grBooks.length)
      continue
    }

    try {
      // Resolve to OpenLibraryBook
      const olBook = await resolveBook(grBook)

      // Add to shelf with correct reading status
      const readingStatus = SHELF_TO_STATUS[grBook.shelf]
      const userBook = await addBookToShelf(userId, olBook, readingStatus)

      // Add to existing books to prevent duplicate additions within same import
      existingBooks.push(userBook)
      result.imported++
    } catch (error) {
      result.failed++
      result.errors.push(
        `${grBook.title}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    onProgress?.(i + 1, grBooks.length)

    // Rate limit: small delay between Open Library API calls
    if (i < grBooks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return result
}
