import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless function that proxies GoodReads RSS feed requests.
 * This avoids CORS issues when fetching from the browser in production.
 *
 * Usage: GET /api/goodreads?path=/review/list_rss/12345&shelf=read&page=1
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { path } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  // Only allow proxying to GoodReads RSS endpoints
  if (!path.startsWith('/review/list_rss/')) {
    return res.status(403).json({ error: 'Only GoodReads RSS feed paths are allowed' })
  }

  try {
    const url = `https://www.goodreads.com${path}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bookies/1.0 (book sharing app)',
      },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `GoodReads returned ${response.status}` })
    }

    const xml = await response.text()

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=300') // Cache 5 min
    return res.status(200).send(xml)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch GoodReads RSS',
    })
  }
}
