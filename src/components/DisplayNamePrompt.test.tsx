import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisplayNamePrompt } from './DisplayNamePrompt'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}))

import { supabase } from '@/lib/supabase'

describe('DisplayNamePrompt', () => {
  const mockOnComplete = vi.fn()
  const mockUserId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderPrompt = () => {
    return render(<DisplayNamePrompt userId={mockUserId} onComplete={mockOnComplete} />)
  }

  describe('initial render', () => {
    it('renders a heading asking for display name', () => {
      renderPrompt()

      expect(screen.getByRole('heading', { name: /nom d'affichage/i })).toBeInTheDocument()
    })

    it('renders a text input for the display name', () => {
      renderPrompt()

      expect(screen.getByRole('textbox', { name: /nom/i })).toBeInTheDocument()
    })

    it('renders a submit button', () => {
      renderPrompt()

      expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
    })

    it('has a description explaining the prompt', () => {
      renderPrompt()

      expect(screen.getByText(/voulez-vous qu'on vous appelle/i)).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('disables submit button when input is empty', () => {
      renderPrompt()

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      expect(submitButton).toBeDisabled()
    })

    it('disables submit button when name is too short (less than 2 chars)', async () => {
      const user = userEvent.setup()
      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'A')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when name is valid (2+ chars)', async () => {
      const user = userEvent.setup()
      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'Jo')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      expect(submitButton).toBeEnabled()
    })

    it('limits input to 30 characters via maxLength attribute', () => {
      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      expect(input).toHaveAttribute('maxLength', '30')
    })

    it('shows character count hint', () => {
      renderPrompt()

      expect(screen.getByText(/2.*30/)).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls supabase to update profile on submit', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }))
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as ReturnType<typeof supabase.from>)

      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'Marie')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      await user.click(submitButton)

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith({ display_name: 'Marie' })
    })

    it('shows loading state while saving', async () => {
      const user = userEvent.setup()
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => new Promise(() => {})), // Never resolves
        })),
      } as ReturnType<typeof supabase.from>)

      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'Marie')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /enregistrement/i })).toBeDisabled()
    })

    it('calls onComplete after successful save', async () => {
      const user = userEvent.setup()
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      } as ReturnType<typeof supabase.from>)

      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'Marie')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled()
      })
    })

    it('shows error message on save failure', async () => {
      const user = userEvent.setup()
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
        })),
      } as ReturnType<typeof supabase.from>)

      renderPrompt()

      const input = screen.getByRole('textbox', { name: /nom/i })
      await user.type(input, 'Marie')

      const submitButton = screen.getByRole('button', { name: /continuer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })
})
