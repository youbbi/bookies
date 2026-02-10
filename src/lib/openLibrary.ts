// Open Library API Service
// Documentation: https://openlibrary.org/developers/api

// Use proxy in development (but not in tests) to avoid CORS issues
const useProxy = import.meta.env.DEV && import.meta.env.MODE !== 'test'
const BASE_URL = useProxy ? '/api/openlibrary' : 'https://openlibrary.org'
const COVERS_URL = useProxy ? '/api/covers' : 'https://covers.openlibrary.org'

// Types for Open Library API responses
export interface OpenLibrarySearchResult {
  key: string // e.g., "/works/OL12345W"
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number // Cover ID for cover image
  isbn?: string[]
  edition_count?: number
}

export interface OpenLibrarySearchResponse {
  numFound: number
  start: number
  docs: OpenLibrarySearchResult[]
}

export interface OpenLibraryBook {
  key: string
  title: string
  authors?: string[]
  coverUrl?: string
  publishYear?: number
  isbn?: string
  description?: string
}

/**
 * Get cover image URL for a book
 * @param coverId - The cover ID from Open Library
 * @param size - 'S' (small), 'M' (medium), or 'L' (large)
 */
export function getCoverUrl(
  coverId: number | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): string | undefined {
  if (!coverId) return undefined
  return `${COVERS_URL}/b/id/${coverId}-${size}.jpg`
}

/**
 * Get cover image URL by ISBN
 * @param isbn - The book's ISBN
 * @param size - 'S' (small), 'M' (medium), or 'L' (large)
 */
export function getCoverUrlByIsbn(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  return `${COVERS_URL}/b/isbn/${isbn}-${size}.jpg`
}

/**
 * Search for books by query (title, author, etc.)
 * @param query - Search query
 * @param limit - Maximum number of results (default 10)
 */
export async function searchBooks(query: string, limit = 10): Promise<OpenLibraryBook[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    fields: 'key,title,author_name,first_publish_year,cover_i,isbn',
  })

  const response = await fetch(`${BASE_URL}/search.json?${params}`)

  if (!response.ok) {
    throw new Error(`Open Library search failed: ${response.status}`)
  }

  const data: OpenLibrarySearchResponse = await response.json()

  return data.docs.map((doc) => ({
    key: doc.key,
    title: doc.title,
    authors: doc.author_name,
    coverUrl: getCoverUrl(doc.cover_i, 'M'),
    publishYear: doc.first_publish_year,
    isbn: doc.isbn?.[0],
  }))
}

/**
 * Look up a book by ISBN
 * @param isbn - The book's ISBN (10 or 13 digits)
 */
export async function lookupByIsbn(isbn: string): Promise<OpenLibraryBook | null> {
  // Clean the ISBN (remove dashes and spaces)
  const cleanIsbn = isbn.replace(/[-\s]/g, '')

  console.log('=== ISBN LOOKUP ===')
  console.log('Original ISBN:', isbn)
  console.log('Cleaned ISBN:', cleanIsbn)
  console.log('ISBN length:', cleanIsbn.length)
  console.log('API URL:', `${BASE_URL}/isbn/${cleanIsbn}.json`)

  const response = await fetch(`${BASE_URL}/isbn/${cleanIsbn}.json`)

  console.log('Response status:', response.status)
  console.log('Response ok:', response.ok)

  if (!response.ok) {
    if (response.status === 404) {
      console.log('Book not found in Open Library for ISBN:', cleanIsbn)
      return null
    }
    console.error('Open Library API error:', response.status)
    throw new Error(`Open Library ISBN lookup failed: ${response.status}`)
  }

  const data = await response.json()
  console.log('Open Library response data:', JSON.stringify(data, null, 2))

  // The ISBN endpoint returns edition data, we need to get work info for authors
  let authors: string[] = []
  if (data.authors) {
    // Fetch author names
    const authorPromises = data.authors.map(async (author: { key: string }) => {
      const authorResponse = await fetch(`${BASE_URL}${author.key}.json`)
      if (authorResponse.ok) {
        const authorData = await authorResponse.json()
        return authorData.name
      }
      return null
    })
    authors = (await Promise.all(authorPromises)).filter(Boolean)
  }

  return {
    key: data.works?.[0]?.key || data.key,
    title: data.title,
    authors,
    coverUrl: getCoverUrlByIsbn(cleanIsbn, 'M'),
    publishYear: data.publish_date ? parseInt(data.publish_date) : undefined,
    isbn: cleanIsbn,
    description: typeof data.description === 'string' ? data.description : data.description?.value,
  }
}
