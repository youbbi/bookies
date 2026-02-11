import { describe, it, expect } from 'vitest'
import { extractGoodReadsUserId, isValidGoodReadsUrl } from './goodreads'

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
