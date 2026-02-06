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
    })

    it('renders the app title', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('Bookies')).toBeInTheDocument()
      })
    })

    it('renders the tagline in French', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('Partagez vos livres avec vos proches')).toBeInTheDocument()
      })
    })

    it('renders the tree bookshelf', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('En cours')).toBeInTheDocument()
        expect(screen.getByText('Mes coups de cœur')).toBeInTheDocument()
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
