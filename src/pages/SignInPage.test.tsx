import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SignInPage } from './SignInPage'

// Mock the auth functions
vi.mock('@/lib/auth', () => ({
  signInWithMagicLink: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth'

const renderSignInPage = () => {
  return render(
    <MemoryRouter>
      <SignInPage />
    </MemoryRouter>
  )
}

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders the sign-in page with email input', () => {
      renderSignInPage()

      expect(screen.getByRole('textbox', { name: /courriel/i })).toBeInTheDocument()
    })

    it('renders the send magic link button', () => {
      renderSignInPage()

      expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument()
    })

    it('renders a welcoming heading', () => {
      renderSignInPage()

      expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
    })

    it('has email input with correct type for mobile keyboards', () => {
      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('form validation', () => {
    it('disables submit button when email is empty', () => {
      renderSignInPage()

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when valid email is entered', async () => {
      const user = userEvent.setup()
      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      expect(submitButton).toBeEnabled()
    })

    it('keeps button disabled for invalid email format', async () => {
      const user = userEvent.setup()
      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('magic link submission', () => {
    it('calls signInWithMagicLink when form is submitted', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithMagicLink).mockResolvedValueOnce({ error: null })

      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      await user.click(submitButton)

      expect(signInWithMagicLink).toHaveBeenCalledWith('test@example.com')
    })

    it('shows loading state while sending magic link', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithMagicLink).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /envoi en cours/i })).toBeDisabled()
    })

    it('shows success message after magic link is sent', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithMagicLink).mockResolvedValueOnce({ error: null })

      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/lien envoyé/i)).toBeInTheDocument()
      })
    })

    it('shows error message when magic link fails', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithMagicLink).mockResolvedValueOnce({
        error: { message: 'Rate limit exceeded' },
      })

      renderSignInPage()

      const emailInput = screen.getByRole('textbox', { name: /courriel/i })
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('Google OAuth', () => {
    it('renders Continue with Google button', () => {
      renderSignInPage()

      expect(screen.getByRole('button', { name: /continuer avec google/i })).toBeInTheDocument()
    })

    it('calls signInWithGoogle when Google button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithGoogle).mockResolvedValueOnce({ error: null })

      renderSignInPage()

      const googleButton = screen.getByRole('button', { name: /continuer avec google/i })
      await user.click(googleButton)

      expect(signInWithGoogle).toHaveBeenCalled()
    })

    it('shows error when Google sign-in fails', async () => {
      const user = userEvent.setup()
      vi.mocked(signInWithGoogle).mockResolvedValueOnce({
        error: { message: 'Google auth failed' },
      })

      renderSignInPage()

      const googleButton = screen.getByRole('button', { name: /continuer avec google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('renders a divider between email and Google options', () => {
      renderSignInPage()

      // The divider should have "ou" as standalone text
      expect(screen.getByText('ou')).toBeInTheDocument()
    })
  })
})
