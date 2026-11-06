import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { AuthCallback } from './AuthCallback'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock supabase client
const mockUnsubscribe = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void

const fakeSession = {
  user: { id: '123', email: 'test@example.com' } as User,
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  token_type: 'bearer',
  expires_at: Date.now() + 3600,
} as Session

describe('AuthCallback', () => {
  let emitAuthEvent: AuthListener

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      emitAuthEvent = callback as AuthListener
      return {
        data: { subscription: { id: 'sub', callback, unsubscribe: mockUnsubscribe } },
      }
    })
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const renderCallback = () =>
    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    )

  it('renders loading state initially', () => {
    vi.mocked(supabase.auth.getSession).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { getByText } = renderCallback()

    expect(getByText(/signing you in/i)).toBeInTheDocument()
  })

  it('navigates to home when a session already exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: fakeSession },
      error: null,
    })

    renderCallback()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('navigates to home on SIGNED_IN event', () => {
    renderCallback()

    act(() => emitAuthEvent('SIGNED_IN', fakeSession))

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('navigates to sign-in when no session after processing', () => {
    vi.useFakeTimers()
    renderCallback()

    act(() => emitAuthEvent('INITIAL_SESSION', null))
    expect(mockNavigate).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true })
  })

  it('ignores SIGNED_OUT and TOKEN_REFRESHED events', () => {
    vi.useFakeTimers()
    renderCallback()

    act(() => {
      emitAuthEvent('SIGNED_OUT', null)
      emitAuthEvent('TOKEN_REFRESHED', null)
      vi.advanceTimersByTime(2000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('unsubscribes from auth changes on unmount', () => {
    const { unmount } = renderCallback()

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
