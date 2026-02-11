import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoodReadsImportModal } from './GoodReadsImportModal'

vi.mock('@/lib/goodreads', () => ({
  isValidGoodReadsUrl: vi.fn(),
}))

import { isValidGoodReadsUrl } from '@/lib/goodreads'

const mockIsValid = vi.mocked(isValidGoodReadsUrl)

describe('GoodReadsImportModal', () => {
  const mockOnClose = vi.fn()
  const mockOnStartImport = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsValid.mockReturnValue(false)
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GoodReadsImportModal
        isOpen={false}
        onClose={mockOnClose}
        onStartImport={mockOnStartImport}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with URL input when isOpen is true', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    expect(screen.getByText('Importer depuis GoodReads')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/goodreads\.com/i)).toBeInTheDocument()
    expect(screen.getByText('Importer')).toBeInTheDocument()
  })

  it('shows instructions text', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    expect(screen.getByText(/profil GoodReads/i)).toBeInTheDocument()
  })

  it('disables import button when URL is empty', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    expect(screen.getByText('Importer')).toBeDisabled()
  })

  it('disables import button for invalid URL', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(false)

    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'not-a-url')

    expect(screen.getByText('Importer')).toBeDisabled()
  })

  it('enables import button for valid URL', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)

    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')

    expect(screen.getByText('Importer')).not.toBeDisabled()
  })

  it('calls onStartImport with URL when import button is clicked', async () => {
    const user = userEvent.setup()
    mockIsValid.mockReturnValue(true)

    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    const input = screen.getByPlaceholderText(/goodreads\.com/i)
    await user.type(input, 'https://www.goodreads.com/user/show/12345')
    fireEvent.click(screen.getByText('Importer'))

    expect(mockOnStartImport).toHaveBeenCalledWith('https://www.goodreads.com/user/show/12345')
  })

  it('shows help section when help button is clicked', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    expect(screen.queryByText(/Connectez-vous sur/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByText(/Comment trouver/))

    expect(screen.getByText(/Connectez-vous sur/)).toBeInTheDocument()
    expect(screen.getByText(/goodreads.com\/user\/show/)).toBeInTheDocument()
  })

  it('closes modal when clicking backdrop', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    const backdrop = document.querySelector('.fixed.inset-0')
    if (backdrop) fireEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when clicking close button', () => {
    render(
      <GoodReadsImportModal isOpen={true} onClose={mockOnClose} onStartImport={mockOnStartImport} />
    )

    fireEvent.click(screen.getByLabelText('Fermer le modal'))

    expect(mockOnClose).toHaveBeenCalled()
  })
})
