// GoodReads Import Service
// Fetches user's books via public RSS feeds

import type { ReadingStatus } from '@/types'

// Both dev (Vite proxy) and prod (Vercel function) use the same path
const GOODREADS_BASE = '/api/goodreads'

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
    if (parseError) return []

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
  } catch {
    return []
  }
}

const SHELVES: GoodReadsShelf[] = ['read', 'currently-reading', 'to-read']

/**
 * Fetch a single shelf's RSS feed for a user.
 */
async function fetchShelf(userId: string, shelf: GoodReadsShelf): Promise<GoodReadsBook[]> {
  try {
    const url = `${GOODREADS_BASE}/review/list_rss/${userId}?shelf=${shelf}`
    const response = await fetch(url)

    if (!response.ok) return []

    const xml = await response.text()
    return parseGoodReadsRssXml(xml, shelf)
  } catch {
    return []
  }
}

/**
 * Fetch all books from a GoodReads user's library (read, currently-reading, to-read).
 * Returns a flat array of GoodReadsBook with shelf information.
 */
export async function fetchGoodReadsBooks(userId: string): Promise<GoodReadsBook[]> {
  const results = await Promise.all(SHELVES.map((shelf) => fetchShelf(userId, shelf)))
  return results.flat()
}
