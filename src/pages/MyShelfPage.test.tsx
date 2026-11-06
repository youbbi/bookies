import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MyShelfPage } from './MyShelfPage'
import * as authContext from '@/contexts/AuthContext'
import * as bookshelfLib from '@/lib/bookshelf'
import type { UserBookWithBook } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

// Mock bookshelf lib
vi.mock('@/lib/bookshelf', () => ({
  getUserBooks: vi.fn(),
  getMyLoanRequests: vi.fn().mockResolvedValue([]),
}))

// Mock supabase profile lookup (username)
const mockProfile = vi.hoisted(() => ({ username: 'testuser' as string | null }))
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { username: mockProfile.username } }),
        }),
      }),
    }),
  },
}))

// Mock PNG imports
vi.mock('@/assets/tree-bookshelf.png', () => ({
  default: '/mock-tree.png',
}))
vi.mock('@/assets/tree-bookshelf@2x.png', () => ({
  default: '/mock-tree@2x.png',
}))

const mockUser: Partial<User> = {
  id: 'user-123',
  email: 'test@example.com',
}

const mockSession: Partial<Session> = {
  user: mockUser as User,
  access_token: 'mock-token',
}

const createMockBook = (
  id: string,
  title: string,
  readingStatus: 'to_read' | 'reading' | 'read'
): UserBookWithBook => ({
  id,
  user_id: 'user-123',
  book_id: `book-${id}`,
  loan_status: 'available',
  reading_status: readingStatus,
  book_format: 'physical',
  location: null,
  rating: null,
  lent_to_user_id: null,
  borrowed_from_user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  book: {
    id: `book-${id}`,
    open_library_id: null,
    isbn: null,
    title,
    author: 'Test Author',
    cover_url: null,
    description: null,
    publish_year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
})

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('MyShelfPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProfile.username = 'testuser'
    vi.mocked(bookshelfLib.getMyLoanRequests).mockResolvedValue([])
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      vi.mocked(authContext.useAuthContext).mockReturnValue({
        user: null,
        session: null,
        loading: false,
      })
    })

    it('redirects to sign-in page', () => {
      renderWithRouter(<MyShelfPage />)

      // Should show redirect message or redirect to sign-in
      expect(
        screen.getByText(/connectez-vous/i) || window.location.pathname === '/sign-in'
      ).toBeTruthy()
    })
  })

  describe('when loading auth state', () => {
    beforeEach(() => {
      vi.mocked(authContext.useAuthContext).mockReturnValue({
        user: null,
        session: null,
        loading: true,
      })
    })

    it('shows loading state', () => {
      renderWithRouter(<MyShelfPage />)

      expect(screen.getByText(/chargement/i)).toBeInTheDocument()
    })
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      vi.mocked(authContext.useAuthContext).mockReturnValue({
        user: mockUser as User,
        session: mockSession as Session,
        loading: false,
      })
    })

    it('fetches user books on mount', async () => {
      vi.mocked(bookshelfLib.getUserBooks).mockResolvedValue([])

      renderWithRouter(<MyShelfPage />)

      await waitFor(() => {
        expect(bookshelfLib.getUserBooks).toHaveBeenCalledWith('user-123')
      })
    })

    it('displays books in their sections', async () => {
      const mockBooks = [
        createMockBook('1', 'Reading Book', 'reading'),
        createMockBook('2', 'Finished Book', 'read'),
      ]
      vi.mocked(bookshelfLib.getUserBooks).mockResolvedValue(mockBooks)

      renderWithRouter(<MyShelfPage />)

      await waitFor(() => {
        expect(screen.getAllByText('Reading Book').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Finished Book').length).toBeGreaterThan(0)
      })
    })

    it('shows empty state when no books', async () => {
      vi.mocked(bookshelfLib.getUserBooks).mockResolvedValue([])

      renderWithRouter(<MyShelfPage />)

      await waitFor(() => {
        expect(screen.getByText(/aucun livre en cours/i)).toBeInTheDocument()
      })
    })

    it('prompts for a username when the profile has none', async () => {
      mockProfile.username = null
      vi.mocked(bookshelfLib.getUserBooks).mockResolvedValue([])

      renderWithRouter(<MyShelfPage />)

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })

    it('shows error message on fetch failure', async () => {
      vi.mocked(bookshelfLib.getUserBooks).mockRejectedValue(new Error('Erreur de chargement'))

      renderWithRouter(<MyShelfPage />)

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument()
      })
    })

    it('shows loading state while fetching books', () => {
      vi.mocked(bookshelfLib.getUserBooks).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderWithRouter(<MyShelfPage />)

      expect(screen.getByText(/chargement/i)).toBeInTheDocument()
    })
  })
})
