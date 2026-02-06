import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchBooks, lookupByIsbn, getCoverUrl, getCoverUrlByIsbn } from './openLibrary'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Open Library API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCoverUrl', () => {
    it('returns undefined for undefined coverId', () => {
      expect(getCoverUrl(undefined)).toBeUndefined()
    })

    it('returns correct URL with default medium size', () => {
      expect(getCoverUrl(12345)).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg')
    })

    it('returns correct URL with small size', () => {
      expect(getCoverUrl(12345, 'S')).toBe('https://covers.openlibrary.org/b/id/12345-S.jpg')
    })

    it('returns correct URL with large size', () => {
      expect(getCoverUrl(12345, 'L')).toBe('https://covers.openlibrary.org/b/id/12345-L.jpg')
    })
  })

  describe('getCoverUrlByIsbn', () => {
    it('returns correct URL with default medium size', () => {
      expect(getCoverUrlByIsbn('9780316769488')).toBe(
        'https://covers.openlibrary.org/b/isbn/9780316769488-M.jpg'
      )
    })

    it('returns correct URL with specified size', () => {
      expect(getCoverUrlByIsbn('9780316769488', 'L')).toBe(
        'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg'
      )
    })
  })

  describe('searchBooks', () => {
    it('returns empty array for empty query', async () => {
      const result = await searchBooks('')
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('returns empty array for whitespace-only query', async () => {
      const result = await searchBooks('   ')
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('searches and transforms results correctly', async () => {
      const mockResponse = {
        numFound: 2,
        start: 0,
        docs: [
          {
            key: '/works/OL123W',
            title: 'The Catcher in the Rye',
            author_name: ['J.D. Salinger'],
            first_publish_year: 1951,
            cover_i: 12345,
            isbn: ['9780316769488', '0316769487'],
          },
          {
            key: '/works/OL456W',
            title: 'Another Book',
            // No author, no cover, no publish year
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await searchBooks('catcher rye')

      expect(mockFetch).toHaveBeenCalledOnce()
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('openlibrary.org/search.json'))
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('q=catcher+rye'))

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        key: '/works/OL123W',
        title: 'The Catcher in the Rye',
        authors: ['J.D. Salinger'],
        publishYear: 1951,
        coverUrl: 'https://covers.openlibrary.org/b/id/12345-M.jpg',
        isbn: '9780316769488',
      })
      expect(result[1]).toEqual({
        key: '/works/OL456W',
        title: 'Another Book',
        authors: undefined,
        publishYear: undefined,
        coverUrl: undefined,
        isbn: undefined,
      })
    })

    it('respects limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ numFound: 0, start: 0, docs: [] }),
      })

      await searchBooks('test', 5)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'))
    })

    it('throws error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(searchBooks('test')).rejects.toThrow('Open Library search failed: 500')
    })
  })

  describe('lookupByIsbn', () => {
    it('cleans ISBN and makes correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            key: '/books/OL123M',
            title: 'Test Book',
            works: [{ key: '/works/OL456W' }],
          }),
      })

      await lookupByIsbn('978-0-316-76948-8')

      expect(mockFetch).toHaveBeenCalledWith('https://openlibrary.org/isbn/9780316769488.json')
    })

    it('returns null for 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await lookupByIsbn('0000000000')

      expect(result).toBeNull()
    })

    it('throws error for non-404 failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(lookupByIsbn('1234567890')).rejects.toThrow(
        'Open Library ISBN lookup failed: 500'
      )
    })

    it('fetches author names when authors are present', async () => {
      mockFetch
        // First call: ISBN lookup
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              key: '/books/OL123M',
              title: 'Test Book',
              works: [{ key: '/works/OL456W' }],
              authors: [{ key: '/authors/OL1A' }, { key: '/authors/OL2A' }],
              publish_date: '2020',
            }),
        })
        // Second call: First author
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'Author One' }),
        })
        // Third call: Second author
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'Author Two' }),
        })

      const result = await lookupByIsbn('1234567890')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({
        key: '/works/OL456W',
        title: 'Test Book',
        authors: ['Author One', 'Author Two'],
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1234567890-M.jpg',
        publishYear: 2020,
        isbn: '1234567890',
        description: undefined,
      })
    })

    it('handles string description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            key: '/books/OL123M',
            title: 'Test Book',
            description: 'A simple string description',
          }),
      })

      const result = await lookupByIsbn('1234567890')

      expect(result?.description).toBe('A simple string description')
    })

    it('handles object description with value property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            key: '/books/OL123M',
            title: 'Test Book',
            description: { type: '/type/text', value: 'Object description value' },
          }),
      })

      const result = await lookupByIsbn('1234567890')

      expect(result?.description).toBe('Object description value')
    })

    it('filters out null author names on failed author fetch', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              key: '/books/OL123M',
              title: 'Test Book',
              authors: [{ key: '/authors/OL1A' }],
            }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

      const result = await lookupByIsbn('1234567890')

      expect(result?.authors).toEqual([])
    })
  })
})
