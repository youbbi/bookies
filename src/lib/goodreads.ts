// GoodReads Import Service
// Fetches user's books via public RSS feeds

import type { ReadingStatus } from '@/types'

const GOODREADS_API = '/api/goodreads'

/** A book parsed from a GoodReads RSS feed */
export interface GoodReadsBook {
  title: string
  author: string
  isbn: string
  coverUrl: string
  rating: number // 0-5, 0 means no rating
  shelf: GoodReadsShelf
}

export type GoodReadsShelf = 'read' | 'currently-reading' | 'to-read'

/** Maps GoodReads shelves to Bookies reading statuses */
export const SHELF_TO_STATUS: Record<GoodReadsShelf, ReadingStatus> = {
  read: 'read',
  'currently-reading': 'reading',
  'to-read': 'to_read',
}

const GOODREADS_URL_REGEX = /^https?:\/\/(?:www\.)?goodreads\.com\/user\/show\/(\d+)/

/**
 * Extract the numeric user ID from a GoodReads profile URL.
 * Returns null if the URL is not a valid GoodReads profile URL.
 */
export function extractGoodReadsUserId(url: string): string | null {
  if (!url) return null
  const match = url.match(GOODREADS_URL_REGEX)
  return match ? match[1] : null
}

/**
 * Check if a string is a valid GoodReads profile URL.
 */
export function isValidGoodReadsUrl(url: string): boolean {
  return extractGoodReadsUserId(url) !== null
}

/**
 * Helper to get text content of an XML element by tag name.
 */
function getTagText(item: Element, tagName: string): string {
  const el = item.getElementsByTagName(tagName)[0]
  return el?.textContent?.trim() ?? ''
}

/**
 * Parse GoodReads RSS XML into an array of GoodReadsBook objects.
 * The shelf parameter indicates which shelf this RSS feed represents.
 */
export function parseGoodReadsRssXml(xml: string, shelf: GoodReadsShelf): GoodReadsBook[] {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      console.error('[GoodReads] XML parse error:', parseError.textContent?.slice(0, 300))
      return []
    }

    const items = doc.querySelectorAll('item')
    const books: GoodReadsBook[] = []

    items.forEach((item) => {
      books.push({
        title: getTagText(item, 'title'),
        author: getTagText(item, 'author_name'),
        isbn: getTagText(item, 'isbn'),
        coverUrl: getTagText(item, 'book_large_image_url'),
        rating: parseInt(getTagText(item, 'user_rating') || '0', 10),
        shelf,
      })
    })

    return books
  } catch (error) {
    console.error('[GoodReads] parseGoodReadsRssXml exception:', error)
    return []
  }
}

const SHELVES: GoodReadsShelf[] = ['read', 'currently-reading', 'to-read']

const MAX_PAGES = 10 // Safety limit to avoid infinite loops

/**
 * Fetch a single page of a shelf's RSS feed.
 */
async function fetchShelfPage(
  userId: string,
  shelf: GoodReadsShelf,
  page: number
): Promise<GoodReadsBook[]> {
  const url = `${GOODREADS_API}?userId=${userId}&shelf=${shelf}&page=${page}`
  try {
    const response = await fetch(url)

    if (!response.ok) {
      const body = await response.text().catch(() => '(unreadable)')
      console.error(
        `[GoodReads] fetchShelf ${shelf} p${page}: HTTP ${response.status}`,
        body.slice(0, 200)
      )
      return []
    }

    const text = await response.text()
    const contentType = response.headers.get('content-type') ?? ''

    // Detect SPA fallback — HTML returned instead of XML
    if (contentType.includes('text/html') || text.trimStart().startsWith('<!')) {
      console.error(
        `[GoodReads] fetchShelf ${shelf} p${page}: got HTML instead of XML (function not reached?)`,
        text.slice(0, 200)
      )
      return []
    }

    return parseGoodReadsRssXml(text, shelf)
  } catch (error) {
    console.error(`[GoodReads] fetchShelf ${shelf} p${page}: exception`, error)
    return []
  }
}

/**
 * Fetch all pages of a single shelf's RSS feed (GoodReads returns ~50 items/page).
 */
async function fetchShelf(userId: string, shelf: GoodReadsShelf): Promise<GoodReadsBook[]> {
  const allBooks: GoodReadsBook[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const books = await fetchShelfPage(userId, shelf, page)
    if (books.length === 0) break
    allBooks.push(...books)
  }

  return allBooks
}

/**
 * Fetch all books from a GoodReads user's library (read, currently-reading, to-read).
 * Returns a flat array of GoodReadsBook with shelf information.
 */
export async function fetchGoodReadsBooks(userId: string): Promise<GoodReadsBook[]> {
  const results = await Promise.all(SHELVES.map((shelf) => fetchShelf(userId, shelf)))
  return results.flat()
}
