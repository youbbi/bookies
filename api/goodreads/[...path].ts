import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel catch-all serverless function that proxies GoodReads RSS feed requests.
 * Handles requests like: /api/goodreads/review/list_rss/12345?shelf=read
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Extract the path segments from the catch-all route
  const pathSegments = req.query.path
  if (!pathSegments || !Array.isArray(pathSegments)) {
    return res.status(400).json({ error: 'Missing path' })
  }

  const goodreadsPath = '/' + pathSegments.join('/')

  // Only allow proxying to GoodReads RSS endpoints
  if (!goodreadsPath.startsWith('/review/list_rss/')) {
    return res.status(403).json({ error: 'Only GoodReads RSS feed paths are allowed' })
  }

  try {
    // Reconstruct query params (excluding the catch-all 'path' param)
    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'path' && typeof value === 'string') {
        queryParams.append(key, value)
      }
    }
    const queryString = queryParams.toString()
    const url = `https://www.goodreads.com${goodreadsPath}${queryString ? '?' + queryString : ''}`

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
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(xml)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch GoodReads RSS',
    })
  }
}
