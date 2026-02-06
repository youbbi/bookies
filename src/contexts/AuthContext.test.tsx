import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from './AuthContext'
import type { User, Session } from '@supabase/supabase-js'

// Mock supabase client
const mockOnAuthStateChange = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        mockOnAuthStateChange(callback)
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      },
    },
  },
}))

// Test component that consumes the context
function TestConsumer() {
  const { user, session, loading } = useAuthContext()
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <span data-testid="session">{session ? 'exists' : 'null'}</span>
    </div>
  )
}

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  created_at: '2026-01-01',
  app_metadata: {},
  user_metadata: {},
}

const mockSession: Session = {
  user: mockUser,
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  expires_at: Date.now() / 1000 + 3600,
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides loading state initially', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    // Initially loading
    expect(getByTestId('loading').textContent).toBe('true')

    // After session check completes
    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false')
    })
  })

  it('provides user and session when authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null })

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false')
      expect(getByTestId('user').textContent).toBe('test@example.com')
      expect(getByTestId('session').textContent).toBe('exists')
    })
  })

  it('provides null user when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false')
      expect(getByTestId('user').textContent).toBe('null')
      expect(getByTestId('session').textContent).toBe('null')
    })
  })

  it('subscribes to auth state changes', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalledOnce()
    })
  })

  it('updates state when auth state changes', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    let authStateCallback: (event: string, session: Session | null) => void = () => {}
    mockOnAuthStateChange.mockImplementation((cb) => {
      authStateCallback = cb
    })

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('null')
    })

    // Simulate sign-in event
    act(() => {
      authStateCallback('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('test@example.com')
      expect(getByTestId('session').textContent).toBe('exists')
    })
  })

  it('clears state on sign-out event', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null })

    let authStateCallback: (event: string, session: Session | null) => void = () => {}
    mockOnAuthStateChange.mockImplementation((cb) => {
      authStateCallback = cb
    })

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('test@example.com')
    })

    // Simulate sign-out event
    act(() => {
      authStateCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('null')
      expect(getByTestId('session').textContent).toBe('null')
    })
  })

  it('throws error when useAuthContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useAuthContext must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
