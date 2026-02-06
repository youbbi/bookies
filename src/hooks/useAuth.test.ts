import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

// Mock the auth context
const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockSession = { user: mockUser, access_token: 'token' }
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: mockUser,
    session: mockSession,
    loading: false,
  })),
}))

// Mock the auth service
vi.mock('@/lib/auth', () => ({
  signInWithMagicLink: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

import { useAuthContext } from '@/contexts/AuthContext'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes user from context', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockUser)
  })

  it('exposes session from context', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.session).toEqual(mockSession)
  })

  it('exposes loading from context', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(false)
  })

  it('exposes isAuthenticated helper', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('isAuthenticated is false when no user', () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      user: null,
      session: null,
      loading: false,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
  })

  describe('signInWithMagicLink', () => {
    it('calls auth service signInWithMagicLink', async () => {
      vi.mocked(signInWithMagicLink).mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signInWithMagicLink('test@example.com')
      })

      expect(signInWithMagicLink).toHaveBeenCalledWith('test@example.com')
    })

    it('returns result from auth service', async () => {
      vi.mocked(signInWithMagicLink).mockResolvedValueOnce({
        success: false,
        error: 'Rate limit',
      })

      const { result } = renderHook(() => useAuth())

      let authResult
      await act(async () => {
        authResult = await result.current.signInWithMagicLink('test@example.com')
      })

      expect(authResult).toEqual({ success: false, error: 'Rate limit' })
    })
  })

  describe('signInWithGoogle', () => {
    it('calls auth service signInWithGoogle', async () => {
      vi.mocked(signInWithGoogle).mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(signInWithGoogle).toHaveBeenCalledOnce()
    })
  })

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    })

    it('returns success when signOut succeeds', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

      const { result } = renderHook(() => useAuth())

      let authResult
      await act(async () => {
        authResult = await result.current.signOut()
      })

      expect(authResult).toEqual({ success: true })
    })

    it('returns error when signOut fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: { message: 'Network error', name: 'AuthError', status: 500 },
      })

      const { result } = renderHook(() => useAuth())

      let authResult
      await act(async () => {
        authResult = await result.current.signOut()
      })

      expect(authResult).toEqual({ success: false, error: 'Network error' })
    })
  })
})
