import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoodReadsImportModal } from './GoodReadsImportModal'

vi.mock('@/lib/goodreadsImport', () => ({
  importGoodReadsLibrary: vi.fn(),
}))

vi.mock('@/lib/goodreads', () => ({
  isValidGoodReadsUrl: vi.fn(),
}))

import { importGoodReadsLibrary } from '@/lib/goodreadsImport'
import { isValidGoodReadsUrl } from '@/lib/goodreads'

const mockImport = vi.mocked(importGoodReadsLibrary)
const mockIsValid = vi.mocked(isValidGoodReadsUrl)

describe('GoodReadsImportModal', () => {
  const mockOnClose = vi.fn()
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsValid.mockReturnValue(false)
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GoodReadsImportModal
        isOpen={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with URL input when isOpen is true', () => {
    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    expect(screen.getByText('Importer depuis GoodReads')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/goodreads\.com/i)).toBeInTheDocument()
    expect(screen.getByText('Importer')).toBeInTheDocument()
  })

  it('shows instructions text', () => {
    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    expect(screen.getByText(/profil GoodReads/i)).toBeInTheDocument()
  })

  it('disables import button when URL is empty', () => {
    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    expect(screen.getByText('Importer')).toBeDisabled()
  })

  it('disables import button for invalid URL', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(false)

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'not-a-url')

    expect(screen.getByText('Importer')).toBeDisabled()
  })

  it('enables import button for valid URL', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')

    expect(screen.getByText('Importer')).not.toBeDisabled()
  })

  it('shows progress during import', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)

    // Simulate a slow import that calls onProgress
    mockImport.mockImplementation(async (_userId, _url, onProgress) => {
      onProgress?.(1, 3)
      return { totalFound: 3, imported: 3, skipped: 0, failed: 0, errors: [] }
    })

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')
    fireEvent.click(screen.getByText('Importer'))

    await waitFor(() => {
      expect(screen.getByText(/importation/i)).toBeInTheDocument()
    })
  })

  it('shows summary after successful import', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)
    mockImport.mockResolvedValueOnce({
      totalFound: 10,
      imported: 8,
      skipped: 2,
      failed: 0,
      errors: [],
    })

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')
    fireEvent.click(screen.getByText('Importer'))

    await waitFor(() => {
      expect(screen.getByText(/8/)).toBeInTheDocument()
      expect(screen.getByText(/2/)).toBeInTheDocument()
    })
  })

  it('shows error state when import fails', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)
    mockImport.mockRejectedValueOnce(new Error('Could not access your GoodReads library'))

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')
    fireEvent.click(screen.getByText('Importer'))

    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument()
    })
  })

  it('calls onComplete after dismissing summary', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)
    mockImport.mockResolvedValueOnce({
      totalFound: 5,
      imported: 5,
      skipped: 0,
      failed: 0,
      errors: [],
    })

    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')
    fireEvent.click(screen.getByText('Importer'))

    await waitFor(() => {
      expect(screen.getByText('Fermer')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Fermer'))
    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('closes modal when clicking backdrop', () => {
    render(
      <GoodReadsImportModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        userId="user-1"
      />
    )

    const backdrop = document.querySelector('.fixed.inset-0')
    if (backdrop) fireEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
