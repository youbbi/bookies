import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractGoodReadsUserId,
  isValidGoodReadsUrl,
  parseGoodReadsRssXml,
  fetchGoodReadsBooks,
} from './goodreads'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('GoodReads URL Parser', () => {
  describe('extractGoodReadsUserId', () => {
    it('extracts user ID from standard profile URL', () => {
      expect(extractGoodReadsUserId('https://www.goodreads.com/user/show/12345-username')).toBe(
        '12345'
      )
    })

    it('extracts user ID from URL without username slug', () => {
      expect(extractGoodReadsUserId('https://www.goodreads.com/user/show/12345')).toBe('12345')
    })

    it('extracts user ID from URL without www', () => {
      expect(extractGoodReadsUserId('https://goodreads.com/user/show/12345-john')).toBe('12345')
    })

    it('extracts user ID from HTTP URL', () => {
      expect(extractGoodReadsUserId('http://www.goodreads.com/user/show/98765-jane')).toBe('98765')
    })

    it('extracts user ID from URL with trailing slash', () => {
      expect(extractGoodReadsUserId('https://www.goodreads.com/user/show/12345-username/')).toBe(
        '12345'
      )
    })

    it('extracts user ID from URL with query parameters', () => {
      expect(
        extractGoodReadsUserId('https://www.goodreads.com/user/show/12345-username?ref=nav')
      ).toBe('12345')
    })

    it('returns null for non-GoodReads URL', () => {
      expect(extractGoodReadsUserId('https://google.com/user/show/12345')).toBeNull()
    })

    it('returns null for GoodReads URL without user/show path', () => {
      expect(extractGoodReadsUserId('https://www.goodreads.com/book/show/12345')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(extractGoodReadsUserId('')).toBeNull()
    })

    it('returns null for invalid URL', () => {
      expect(extractGoodReadsUserId('not-a-url')).toBeNull()
    })

    it('returns null for GoodReads URL without user ID', () => {
      expect(extractGoodReadsUserId('https://www.goodreads.com/user/show/')).toBeNull()
    })
  })

  describe('isValidGoodReadsUrl', () => {
    it('returns true for valid GoodReads profile URL', () => {
      expect(isValidGoodReadsUrl('https://www.goodreads.com/user/show/12345-username')).toBe(true)
    })

    it('returns false for non-GoodReads URL', () => {
      expect(isValidGoodReadsUrl('https://google.com')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidGoodReadsUrl('')).toBe(false)
    })

    it('returns false for invalid URL', () => {
      expect(isValidGoodReadsUrl('not-a-url')).toBe(false)
    })
  })
})

describe('GoodReads RSS XML Parser', () => {
  const makeRss = (items: string) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test shelf</title>
    ${items}
  </channel>
</rss>`

  const fullItem = `<item>
    <title>Too Big to Fail</title>
    <author_name>Andrew Ross Sorkin</author_name>
    <isbn>0593296974</isbn>
    <book_large_image_url>https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1234.jpg</book_large_image_url>
    <user_rating>4</user_rating>
    <book_id>228143912</book_id>
    <average_rating>4.51</average_rating>
    <book_published>2025</book_published>
  </item>`

  it('parses a complete RSS item correctly', () => {
    const result = parseGoodReadsRssXml(makeRss(fullItem), 'read')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      title: 'Too Big to Fail',
      author: 'Andrew Ross Sorkin',
      isbn: '0593296974',
      coverUrl: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1234.jpg',
      rating: 4,
      shelf: 'read',
    })
  })

  it('parses multiple items', () => {
    const secondItem = `<item>
      <title>Second Book</title>
      <author_name>Jane Doe</author_name>
      <isbn>1234567890</isbn>
      <book_large_image_url>https://example.com/cover.jpg</book_large_image_url>
      <user_rating>5</user_rating>
      <book_id>999</book_id>
    </item>`

    const result = parseGoodReadsRssXml(makeRss(fullItem + secondItem), 'read')
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Too Big to Fail')
    expect(result[1].title).toBe('Second Book')
  })

  it('handles missing ISBN gracefully', () => {
    const item = `<item>
      <title>No ISBN Book</title>
      <author_name>Author</author_name>
      <isbn></isbn>
      <book_large_image_url>https://example.com/cover.jpg</book_large_image_url>
      <user_rating>3</user_rating>
    </item>`

    const result = parseGoodReadsRssXml(makeRss(item), 'to-read')
    expect(result[0].isbn).toBe('')
    expect(result[0].shelf).toBe('to-read')
  })

  it('handles zero rating (no rating given)', () => {
    const item = `<item>
      <title>Unrated Book</title>
      <author_name>Author</author_name>
      <isbn>1234567890</isbn>
      <book_large_image_url>https://example.com/cover.jpg</book_large_image_url>
      <user_rating>0</user_rating>
    </item>`

    const result = parseGoodReadsRssXml(makeRss(item), 'currently-reading')
    expect(result[0].rating).toBe(0)
    expect(result[0].shelf).toBe('currently-reading')
  })

  it('handles missing cover URL', () => {
    const item = `<item>
      <title>No Cover Book</title>
      <author_name>Author</author_name>
      <isbn>1234567890</isbn>
      <book_large_image_url></book_large_image_url>
      <user_rating>2</user_rating>
    </item>`

    const result = parseGoodReadsRssXml(makeRss(item), 'read')
    expect(result[0].coverUrl).toBe('')
  })

  it('returns empty array for empty RSS feed', () => {
    const result = parseGoodReadsRssXml(makeRss(''), 'read')
    expect(result).toEqual([])
  })

  it('returns empty array for invalid XML', () => {
    const result = parseGoodReadsRssXml('not xml at all', 'read')
    expect(result).toEqual([])
  })

  it('assigns the correct shelf from the parameter', () => {
    const result = parseGoodReadsRssXml(makeRss(fullItem), 'to-read')
    expect(result[0].shelf).toBe('to-read')
  })
})

describe('GoodReads RSS Fetch Service', () => {
  const makeRssResponse = (items: string) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test shelf</title>
    ${items}
  </channel>
</rss>`

  const bookItem = (title: string, isbn: string) => `<item>
    <title>${title}</title>
    <author_name>Author</author_name>
    <isbn>${isbn}</isbn>
    <book_large_image_url>https://example.com/cover.jpg</book_large_image_url>
    <user_rating>4</user_rating>
  </item>`

  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('fetches books from all three shelves', async () => {
    // Mock three shelf responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(makeRssResponse(bookItem('Read Book', '1111111111'))),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(makeRssResponse(bookItem('Reading Book', '2222222222'))),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(makeRssResponse(bookItem('Want Book', '3333333333'))),
      })

    const result = await fetchGoodReadsBooks('12345')

    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(result).toHaveLength(3)
    expect(result[0].shelf).toBe('read')
    expect(result[1].shelf).toBe('currently-reading')
    expect(result[2].shelf).toBe('to-read')
  })

  it('constructs correct RSS feed URLs with proxy prefix', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(makeRssResponse('')),
    })

    await fetchGoodReadsBooks('12345')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/review/list_rss/12345?shelf=read')
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/review/list_rss/12345?shelf=currently-reading')
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/review/list_rss/12345?shelf=to-read')
    )
  })

  it('returns empty array when all shelves fail', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    })

    const result = await fetchGoodReadsBooks('99999')
    expect(result).toEqual([])
  })

  it('returns partial results when some shelves fail', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(makeRssResponse(bookItem('Read Book', '1111111111'))),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(makeRssResponse(bookItem('Want Book', '3333333333'))),
      })

    const result = await fetchGoodReadsBooks('12345')
    expect(result).toHaveLength(2)
  })

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await fetchGoodReadsBooks('12345')
    expect(result).toEqual([])
  })

  it('handles empty shelves', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(makeRssResponse('')),
    })

    const result = await fetchGoodReadsBooks('12345')
    expect(result).toEqual([])
  })
})
