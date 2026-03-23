import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookActionModal } from './BookActionModal'
import type { UserBookWithBook } from '@/types'

const mockBook: UserBookWithBook = {
  id: 'ub-1',
  user_id: 'user-123',
  book_id: 'book-1',
  loan_status: 'available',
  reading_status: 'reading',
  book_format: 'physical',
  location: null,
  rating: null,
  lent_to_user_id: null,
  borrowed_from_user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  book: {
    id: 'book-1',
    open_library_id: null,
    isbn: null,
    title: 'Test Book',
    author: 'Test Author',
    cover_url: 'https://example.com/cover.jpg',
    description: 'A test book description',
    publish_year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

describe('BookActionModal', () => {
  const mockOnClose = vi.fn()
  const mockOnRemove = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when book is null', () => {
    const { container } = render(
      <BookActionModal book={null} onClose={mockOnClose} onRemove={mockOnRemove} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders book title and author', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
  })

  it('renders book cover image', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    const coverImage = screen.getByAltText('Couverture de Test Book')
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('renders remove button', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    expect(screen.getByRole('button', { name: /retirer/i })).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    expect(screen.getByRole('button', { name: /fermer/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking overlay', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    // Click the overlay (backdrop)
    const overlay = screen.getByTestId('modal-overlay')
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove with book id when remove button is clicked', async () => {
    mockOnRemove.mockResolvedValue(undefined)

    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /retirer/i }))

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('ub-1')
    })
  })

  it('shows loading state while removing', async () => {
    mockOnRemove.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /retirer/i }))

    await waitFor(() => {
      expect(screen.getByText(/suppression/i)).toBeInTheDocument()
    })
  })

  it('shows error message on remove failure', async () => {
    mockOnRemove.mockRejectedValue(new Error('Erreur de suppression'))

    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /retirer/i }))

    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument()
    })
  })

  it('displays reading status badge', () => {
    render(<BookActionModal book={mockBook} onClose={mockOnClose} onRemove={mockOnRemove} />)

    // Look for the reading status badge specifically (the span with pill-like styling)
    const badges = screen.getAllByText(/en cours/i)
    expect(badges.length).toBeGreaterThan(0)
  })
})
