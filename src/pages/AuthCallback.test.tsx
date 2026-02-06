import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { User, AuthError } from '@supabase/supabase-js'
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
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(supabase.auth.getSession).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { getByText } = render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    )

    expect(getByText(/signing you in/i)).toBeInTheDocument()
  })

  it('navigates to home on successful session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: '123', email: 'test@example.com' } as User,
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          token_type: 'bearer',
          expires_at: Date.now() + 3600,
        },
      },
      error: null,
    })

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('navigates to sign-in on error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid token', name: 'AuthError', status: 400 } as AuthError,
    })

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true })
    })
  })

  it('navigates to sign-in when no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true })
    })
  })
})
