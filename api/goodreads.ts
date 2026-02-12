import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless function that proxies GoodReads RSS feed requests.
 * Called as: /api/goodreads?userId=12345&shelf=read
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = req.query.userId as string
  const shelf = req.query.shelf as string

  if (!userId || !shelf) {
    return res.status(400).json({ error: 'Missing userId or shelf parameter' })
  }

  if (!['read', 'currently-reading', 'to-read'].includes(shelf)) {
    return res.status(400).json({ error: 'Invalid shelf' })
  }

  const page = (req.query.page as string) || '1'

  try {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`

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
