import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookSearchModal } from './BookSearchModal'
import type { OpenLibraryBook } from '@/lib'

// Mock the searchBooks function
vi.mock('@/lib', () => ({
  searchBooks: vi.fn(),
}))

import { searchBooks } from '@/lib'

const mockSearchBooks = vi.mocked(searchBooks)

describe('BookSearchModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSelectBook = vi.fn()

  const mockBooks: OpenLibraryBook[] = [
    {
      key: '/works/OL123W',
      title: 'Le Petit Prince',
      authors: ['Antoine de Saint-Exupéry'],
      coverUrl: 'https://covers.openlibrary.org/b/id/12345-M.jpg',
      publishYear: 1943,
      isbn: '9780156012195',
    },
    {
      key: '/works/OL456W',
      title: 'Les Misérables',
      authors: ['Victor Hugo'],
      publishYear: 1862,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BookSearchModal isOpen={false} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal when isOpen is true', () => {
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    expect(screen.getByText('Ajouter un livre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Rechercher par titre ou auteur...')).toBeInTheDocument()
    expect(screen.getByText('Chercher')).toBeInTheDocument()
  })

  it('shows initial help text', () => {
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    expect(screen.getByText('Recherchez un livre par titre ou auteur.')).toBeInTheDocument()
  })

  it('closes modal when clicking backdrop', async () => {
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    // Click the backdrop (the fixed overlay div)
    const backdrop = document.querySelector('.fixed.inset-0')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('closes modal when clicking close button', async () => {
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const closeButton = screen.getByLabelText('Fermer')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('disables search button when query is empty', () => {
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const searchButton = screen.getByText('Chercher')
    expect(searchButton).toBeDisabled()
  })

  it('enables search button when query has content', async () => {
    const user = userEvent.setup()
    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'test')

    const searchButton = screen.getByText('Chercher')
    expect(searchButton).not.toBeDisabled()
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    )

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'test')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('displays search results', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce(mockBooks)

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'petit prince')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument()
      expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument()
      expect(screen.getByText('1943')).toBeInTheDocument()
    })

    expect(screen.getByText('Les Misérables')).toBeInTheDocument()
    expect(screen.getByText('Victor Hugo')).toBeInTheDocument()
  })

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce([])

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'xyznonexistent')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé.')).toBeInTheDocument()
    })
  })

  it('shows error message on search failure', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockRejectedValueOnce(new Error('Network error'))

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'test')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors de la recherche. Veuillez réessayer.')
      ).toBeInTheDocument()
    })
  })

  it('calls onSelectBook when clicking Ajouter button', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce(mockBooks)

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'petit prince')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument()
    })

    const addButtons = screen.getAllByText('Ajouter')
    fireEvent.click(addButtons[0])

    expect(mockOnSelectBook).toHaveBeenCalledWith(mockBooks[0])
  })

  it('resets state after selecting a book', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce(mockBooks)

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'petit prince')

    const searchButton = screen.getByText('Chercher')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument()
    })

    const addButtons = screen.getAllByText('Ajouter')
    fireEvent.click(addButtons[0])

    // After selection, results should be cleared
    expect(screen.queryByText('Le Petit Prince')).not.toBeInTheDocument()
  })

  it('triggers search on Enter key press', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce(mockBooks)

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'petit prince{enter}')

    await waitFor(() => {
      expect(mockSearchBooks).toHaveBeenCalledWith('petit prince', 10)
    })
  })

  it('displays book cover when available', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce(mockBooks)

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'test')

    fireEvent.click(screen.getByText('Chercher'))

    await waitFor(() => {
      const coverImage = screen.getByAltText('Couverture de Le Petit Prince')
      expect(coverImage).toBeInTheDocument()
      expect(coverImage).toHaveAttribute('src', 'https://covers.openlibrary.org/b/id/12345-M.jpg')
    })
  })

  it('shows placeholder when no cover available', async () => {
    const user = userEvent.setup()
    mockSearchBooks.mockResolvedValueOnce([mockBooks[1]]) // Les Misérables has no coverUrl

    render(<BookSearchModal isOpen={true} onClose={mockOnClose} onSelectBook={mockOnSelectBook} />)

    const input = screen.getByPlaceholderText('Rechercher par titre ou auteur...')
    await user.type(input, 'test')

    fireEvent.click(screen.getByText('Chercher'))

    await waitFor(() => {
      expect(screen.getByText('Pas de couverture')).toBeInTheDocument()
    })
  })
})
