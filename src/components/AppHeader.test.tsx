import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppHeader } from './AppHeader'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the auth functions
vi.mock('@/lib/auth', () => ({
  signOut: vi.fn(),
}))

import { signOut } from '@/lib/auth'

const renderHeader = (displayName = 'Marie') => {
  return render(
    <MemoryRouter>
      <AppHeader displayName={displayName} />
    </MemoryRouter>
  )
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('display', () => {
    it('renders the user display name', () => {
      renderHeader('Jean')

      expect(screen.getByText('Jean')).toBeInTheDocument()
    })

    it('renders the sign out button', () => {
      renderHeader()

      expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument()
    })
  })

  describe('sign out', () => {
    it('calls signOut when button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(signOut).mockResolvedValueOnce({ error: null })

      renderHeader()

      const signOutButton = screen.getByRole('button', { name: /déconnexion/i })
      await user.click(signOutButton)

      expect(signOut).toHaveBeenCalled()
    })

    it('navigates to sign-in page after successful sign out', async () => {
      const user = userEvent.setup()
      vi.mocked(signOut).mockResolvedValueOnce({ error: null })

      renderHeader()

      const signOutButton = screen.getByRole('button', { name: /déconnexion/i })
      await user.click(signOutButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true })
      })
    })

    it('shows loading state while signing out', async () => {
      const user = userEvent.setup()
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {})) // Never resolves

      renderHeader()

      const signOutButton = screen.getByRole('button', { name: /déconnexion/i })
      await user.click(signOutButton)

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
