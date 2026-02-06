import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signInWithMagicLink } from './auth'
import { supabase } from './supabase'

// Mock the supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('signInWithMagicLink', () => {
    it('calls supabase signInWithOtp with email', async () => {
      const mockSignInWithOtp = vi.mocked(supabase.auth.signInWithOtp)
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      await signInWithMagicLink('test@example.com')

      expect(mockSignInWithOtp).toHaveBeenCalledOnce()
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    it('returns success when email is sent', async () => {
      const mockSignInWithOtp = vi.mocked(supabase.auth.signInWithOtp)
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      const result = await signInWithMagicLink('test@example.com')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns error when supabase fails', async () => {
      const mockSignInWithOtp = vi.mocked(supabase.auth.signInWithOtp)
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: { message: 'Rate limit exceeded', name: 'AuthError', status: 429 },
      })

      const result = await signInWithMagicLink('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
    })

    it('validates email format', async () => {
      const result = await signInWithMagicLink('invalid-email')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email address')
      expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled()
    })

    it('rejects empty email', async () => {
      const result = await signInWithMagicLink('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email is required')
      expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled()
    })

    it('trims whitespace from email', async () => {
      const mockSignInWithOtp = vi.mocked(supabase.auth.signInWithOtp)
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      await signInWithMagicLink('  test@example.com  ')

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })
})
