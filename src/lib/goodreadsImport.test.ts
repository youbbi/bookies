import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isDuplicateBook, resolveBook, importGoodReadsLibrary } from './goodreadsImport'
import type { GoodReadsBook } from './goodreads'
import type { UserBookWithBook, Book } from '@/types'

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock openLibrary
vi.mock('./openLibrary', () => ({
  lookupByIsbn: vi.fn(),
  searchBooks: vi.fn(),
}))

// Mock bookshelf
vi.mock('./bookshelf', () => ({
  addBookToShelf: vi.fn(),
  getUserBooks: vi.fn(),
}))

// Mock goodreads
vi.mock('./goodreads', () => ({
  fetchGoodReadsBooks: vi.fn(),
  extractGoodReadsUserId: vi.fn(),
  SHELF_TO_STATUS: {
    read: 'read',
    'currently-reading': 'reading',
    'to-read': 'to_read',
  },
}))

import { lookupByIsbn, searchBooks } from './openLibrary'
import { addBookToShelf, getUserBooks } from './bookshelf'
import { fetchGoodReadsBooks, extractGoodReadsUserId } from './goodreads'

const mockLookupByIsbn = vi.mocked(lookupByIsbn)
const mockSearchBooks = vi.mocked(searchBooks)
const mockAddBookToShelf = vi.mocked(addBookToShelf)
const mockGetUserBooks = vi.mocked(getUserBooks)
const mockFetchGoodReadsBooks = vi.mocked(fetchGoodReadsBooks)
const mockExtractUserId = vi.mocked(extractGoodReadsUserId)

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'book-1',
  open_library_id: '/works/OL123W',
  isbn: '9780316769488',
  title: 'The Catcher in the Rye',
  author: 'J.D. Salinger',
  cover_url: null,
  description: null,
  publish_year: 1951,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  ...overrides,
})

const makeUserBook = (overrides: Partial<UserBookWithBook> = {}): UserBookWithBook => ({
  id: 'ub-1',
  user_id: 'user-1',
  book_id: 'book-1',
  loan_status: 'available',
  reading_status: 'read',
  rating: null,
  lent_to_user_id: null,
  borrowed_from_user_id: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  book: makeBook(),
  ...overrides,
})

const makeGrBook = (overrides: Partial<GoodReadsBook> = {}): GoodReadsBook => ({
  title: 'The Catcher in the Rye',
  author: 'J.D. Salinger',
  isbn: '9780316769488',
  coverUrl: 'https://example.com/cover.jpg',
  rating: 4,
  shelf: 'read',
  ...overrides,
})

describe('Duplicate Detection', () => {
  it('detects duplicate by ISBN match', () => {
    const existingBooks = [makeUserBook()]
    const grBook = makeGrBook({ isbn: '9780316769488' })

    expect(isDuplicateBook(grBook, existingBooks)).toBe(true)
  })

  it('detects duplicate by title+author match (case-insensitive)', () => {
    const existingBooks = [makeUserBook()]
    const grBook = makeGrBook({
      isbn: '',
      title: 'the catcher in the rye',
      author: 'j.d. salinger',
    })

    expect(isDuplicateBook(grBook, existingBooks)).toBe(true)
  })

  it('returns false when no duplicate exists', () => {
    const existingBooks = [makeUserBook()]
    const grBook = makeGrBook({
      isbn: '0000000000',
      title: 'Different Book',
      author: 'Different Author',
    })

    expect(isDuplicateBook(grBook, existingBooks)).toBe(false)
  })

  it('returns false for empty existing books', () => {
    const grBook = makeGrBook()
    expect(isDuplicateBook(grBook, [])).toBe(false)
  })

  it('ignores empty ISBN in duplicate check', () => {
    const existingBooks = [makeUserBook({ book: makeBook({ isbn: null }) })]
    const grBook = makeGrBook({ isbn: '' })

    // Should not match on empty ISBN, should check title+author instead
    expect(isDuplicateBook(grBook, existingBooks)).toBe(true) // matches by title+author
  })
})

describe('Book Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves book by ISBN via Open Library', async () => {
    const olBook = {
      key: '/works/OL123W',
      title: 'The Catcher in the Rye',
      authors: ['J.D. Salinger'],
      isbn: '9780316769488',
    }
    mockLookupByIsbn.mockResolvedValueOnce(olBook)

    const result = await resolveBook(makeGrBook())

    expect(mockLookupByIsbn).toHaveBeenCalledWith('9780316769488')
    expect(result).toEqual(olBook)
  })

  it('falls back to search when ISBN lookup returns null', async () => {
    mockLookupByIsbn.mockResolvedValueOnce(null)
    const olBook = {
      key: '/works/OL456W',
      title: 'The Catcher in the Rye',
      authors: ['J.D. Salinger'],
    }
    mockSearchBooks.mockResolvedValueOnce([olBook])

    const result = await resolveBook(makeGrBook())

    expect(mockSearchBooks).toHaveBeenCalledWith('The Catcher in the Rye J.D. Salinger', 1)
    expect(result).toEqual(olBook)
  })

  it('falls back to search when no ISBN provided', async () => {
    const olBook = {
      key: '/works/OL789W',
      title: 'No ISBN Book',
      authors: ['Author'],
    }
    mockSearchBooks.mockResolvedValueOnce([olBook])

    const result = await resolveBook(makeGrBook({ isbn: '' }))

    expect(mockLookupByIsbn).not.toHaveBeenCalled()
    expect(mockSearchBooks).toHaveBeenCalled()
    expect(result).toEqual(olBook)
  })

  it('creates fallback book from RSS data when Open Library has no results', async () => {
    mockLookupByIsbn.mockResolvedValueOnce(null)
    mockSearchBooks.mockResolvedValueOnce([])

    const grBook = makeGrBook({ title: 'Obscure Book', author: 'Unknown', isbn: '1234567890' })
    const result = await resolveBook(grBook)

    expect(result).toEqual({
      key: 'goodreads-import-1234567890',
      title: 'Obscure Book',
      authors: ['Unknown'],
      isbn: '1234567890',
      coverUrl: 'https://example.com/cover.jpg',
    })
  })

  it('handles ISBN lookup errors gracefully', async () => {
    mockLookupByIsbn.mockRejectedValueOnce(new Error('API error'))
    mockSearchBooks.mockResolvedValueOnce([])

    const result = await resolveBook(makeGrBook())

    // Should fall back to raw data
    expect(result).toBeTruthy()
    expect(result.title).toBe('The Catcher in the Rye')
  })
})

describe('Import Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('imports books from GoodReads and returns summary', async () => {
    mockExtractUserId.mockReturnValue('12345')
    mockFetchGoodReadsBooks.mockResolvedValueOnce([
      makeGrBook({ title: 'Book A', isbn: '1111111111' }),
      makeGrBook({ title: 'Book B', isbn: '2222222222', shelf: 'to-read' }),
    ])
    mockGetUserBooks.mockResolvedValueOnce([])
    mockLookupByIsbn.mockResolvedValue({
      key: '/works/OL1W',
      title: 'Book',
      authors: ['Author'],
      isbn: '1111111111',
    })
    mockAddBookToShelf.mockResolvedValue(makeUserBook())

    const result = await importGoodReadsLibrary(
      'user-1',
      'https://www.goodreads.com/user/show/12345'
    )

    expect(result.totalFound).toBe(2)
    expect(result.imported).toBe(2)
    expect(result.skipped).toBe(0)
    expect(result.failed).toBe(0)
  })

  it('skips duplicate books', async () => {
    mockExtractUserId.mockReturnValue('12345')
    mockFetchGoodReadsBooks.mockResolvedValueOnce([
      makeGrBook({ title: 'The Catcher in the Rye', isbn: '9780316769488' }),
    ])
    mockGetUserBooks.mockResolvedValueOnce([makeUserBook()])
    mockLookupByIsbn.mockResolvedValue({
      key: '/works/OL1W',
      title: 'The Catcher in the Rye',
      authors: ['J.D. Salinger'],
      isbn: '9780316769488',
    })

    const result = await importGoodReadsLibrary(
      'user-1',
      'https://www.goodreads.com/user/show/12345'
    )

    expect(result.skipped).toBe(1)
    expect(result.imported).toBe(0)
    expect(mockAddBookToShelf).not.toHaveBeenCalled()
  })

  it('reports failed books in summary', async () => {
    mockExtractUserId.mockReturnValue('12345')
    mockFetchGoodReadsBooks.mockResolvedValueOnce([
      makeGrBook({ title: 'Failing Book', isbn: '3333333333' }),
    ])
    mockGetUserBooks.mockResolvedValueOnce([])
    mockLookupByIsbn.mockResolvedValueOnce({
      key: '/works/OL1W',
      title: 'Failing Book',
      authors: ['Author'],
      isbn: '3333333333',
    })
    mockAddBookToShelf.mockRejectedValueOnce(new Error('DB error'))

    const result = await importGoodReadsLibrary(
      'user-1',
      'https://www.goodreads.com/user/show/12345'
    )

    expect(result.failed).toBe(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Failing Book')
  })

  it('throws for invalid GoodReads URL', async () => {
    mockExtractUserId.mockReturnValue(null)

    await expect(importGoodReadsLibrary('user-1', 'https://google.com')).rejects.toThrow(
      'Invalid GoodReads profile URL'
    )
  })

  it('calls onProgress callback during import', async () => {
    mockExtractUserId.mockReturnValue('12345')
    mockFetchGoodReadsBooks.mockResolvedValueOnce([
      makeGrBook({ title: 'Book A', isbn: '1111111111' }),
      makeGrBook({ title: 'Book B', isbn: '2222222222' }),
    ])
    mockGetUserBooks.mockResolvedValueOnce([])
    mockLookupByIsbn.mockResolvedValue({
      key: '/works/OL1W',
      title: 'Book',
      authors: ['Author'],
    })
    mockAddBookToShelf.mockResolvedValue(makeUserBook())

    const onProgress = vi.fn()
    await importGoodReadsLibrary('user-1', 'https://www.goodreads.com/user/show/12345', onProgress)

    expect(onProgress).toHaveBeenCalledTimes(2)
    expect(onProgress).toHaveBeenCalledWith(1, 2)
    expect(onProgress).toHaveBeenCalledWith(2, 2)
  })
})
