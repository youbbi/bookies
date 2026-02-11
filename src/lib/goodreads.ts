// GoodReads Import Service
// Fetches user's books via public RSS feeds

import type { ReadingStatus } from '@/types'

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
