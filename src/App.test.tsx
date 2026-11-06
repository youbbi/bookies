import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import * as authContext from '@/contexts/AuthContext'
import * as bookshelfLib from '@/lib/bookshelf'
import type { User, Session } from '@supabase/supabase-js'

// Mock the PNG imports
vi.mock('@/assets/tree-bookshelf.png', () => ({
  default: '/mock-tree.png',
}))
vi.mock('@/assets/tree-bookshelf@2x.png', () => ({
  default: '/mock-tree@2x.png',
}))

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

// Mock bookshelf lib
vi.mock('@/lib/bookshelf', () => ({
  getUserBooks: vi.fn(),
  getMyLoanRequests: vi.fn().mockResolvedValue([]),
}))

// Mock supabase profile lookup (username)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { username: 'testuser' } }),
        }),
      }),
    }),
  },
}))

const mockUser: Partial<User> = {
  id: 'user-123',
  email: 'test@example.com',
}

const mockSession: Partial<Session> = {
  user: mockUser as User,
  access_token: 'mock-token',
}

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      vi.mocked(authContext.useAuthContext).mockReturnValue({
        user: mockUser as User,
        session: mockSession as Session,
        loading: false,
      })
      vi.mocked(bookshelfLib.getUserBooks).mockResolvedValue([])
      vi.mocked(bookshelfLib.getMyLoanRequests).mockResolvedValue([])
    })

    it('renders the header with the user display name', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument()
      })
    })

    it('renders the share button once the username is loaded', async () => {
      renderApp()
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /partager ma bibliothèque/i })
        ).toBeInTheDocument()
      })
    })

    it('renders the currently-reading tree and shelf sections', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('En cours de lecture')).toBeInTheDocument()
        expect(screen.getByText('À lire')).toBeInTheDocument()
        expect(screen.getByText('Lus')).toBeInTheDocument()
      })
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      vi.mocked(authContext.useAuthContext).mockReturnValue({
        user: null,
        session: null,
        loading: false,
      })
    })

    it('shows sign-in prompt on home page', () => {
      renderApp()
      expect(screen.getByText(/connectez-vous/i)).toBeInTheDocument()
    })

    it('renders sign-in page at /sign-in route', () => {
      renderApp('/sign-in')
      expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
    })
  })
})
