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
