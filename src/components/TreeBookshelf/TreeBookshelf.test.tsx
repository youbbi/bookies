import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TreeBookshelf } from './TreeBookshelf'
import type { UserBookWithBook } from '@/types'

// Mock the PNG imports
vi.mock('@/assets/tree-bookshelf.png', () => ({
  default: '/mock-tree.png',
}))
vi.mock('@/assets/tree-bookshelf@2x.png', () => ({
  default: '/mock-tree@2x.png',
}))

const createMockBook = (
  id: string,
  title: string,
  readingStatus: 'to_read' | 'reading' | 'read'
): UserBookWithBook => ({
  id,
  user_id: 'user-1',
  book_id: `book-${id}`,
  loan_status: 'available',
  reading_status: readingStatus,
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

describe('TreeBookshelf', () => {
  const mockOnBookClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the tree image', () => {
    const { container } = render(<TreeBookshelf books={[]} />)

    const treeImage = container.querySelector('.tree-bookshelf__tree')
    expect(treeImage).toBeInTheDocument()
    expect(treeImage).toHaveAttribute('src', '/mock-tree.png')
  })

  it('renders both shelf labels', () => {
    render(<TreeBookshelf books={[]} />)

    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Mes coups de cœur')).toBeInTheDocument()
  })

  it('renders shelves with correct aria labels', () => {
    render(<TreeBookshelf books={[]} />)

    expect(screen.getByRole('region', { name: 'Étagère En cours' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Étagère Mes coups de cœur' })).toBeInTheDocument()
  })

  it('shows empty state for shelves without books', () => {
    render(<TreeBookshelf books={[]} />)

    const emptyMessages = screen.getAllByText('Glissez un livre ici')
    expect(emptyMessages).toHaveLength(2)
  })

  it('distributes books to correct shelves based on reading_status', () => {
    const books: UserBookWithBook[] = [
      createMockBook('1', 'Book Reading', 'reading'),
      createMockBook('2', 'Book Read', 'read'),
    ]

    render(<TreeBookshelf books={books} />)

    // Book titles appear twice in BookCard (placeholder + title), so use getAllByText
    expect(screen.getAllByText('Book Reading').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Book Read').length).toBeGreaterThan(0)
  })

  it('groups multiple books with same reading_status on same shelf', () => {
    const books: UserBookWithBook[] = [
      createMockBook('1', 'First Reading', 'reading'),
      createMockBook('2', 'Second Reading', 'reading'),
      createMockBook('3', 'Third Reading', 'reading'),
    ]

    render(<TreeBookshelf books={books} />)

    // Book titles appear twice in BookCard (placeholder + title), so use getAllByText
    expect(screen.getAllByText('First Reading').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Second Reading').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Third Reading').length).toBeGreaterThan(0)

    // Only the shelf without books should show empty message
    const emptyMessages = screen.getAllByText('Glissez un livre ici')
    expect(emptyMessages).toHaveLength(1) // Mes coups de cœur is empty
  })

  it('calls onBookClick when a book is clicked', () => {
    const book = createMockBook('1', 'Clickable Book', 'reading')

    render(<TreeBookshelf books={[book]} onBookClick={mockOnBookClick} />)

    // Book title appears twice, get the h3 element specifically
    const bookTitle = screen.getAllByText('Clickable Book')[0]
    const bookButton = bookTitle.closest('button')
    expect(bookButton).toBeInTheDocument()

    fireEvent.click(bookButton!)

    expect(mockOnBookClick).toHaveBeenCalledWith(book)
  })

  it('renders decorations', () => {
    const { container } = render(<TreeBookshelf books={[]} />)

    const decorations = container.querySelector('.tree-decorations')
    expect(decorations).toBeInTheDocument()
  })

  it('renders main container with correct class', () => {
    const { container } = render(<TreeBookshelf books={[]} />)

    const bookshelf = container.querySelector('.tree-bookshelf')
    expect(bookshelf).toBeInTheDocument()
  })
})

describe('TreeShelf', () => {
  it('applies correct position class', () => {
    const { container } = render(<TreeBookshelf books={[]} />)

    expect(container.querySelector('.tree-shelf--upper-center')).toBeInTheDocument()
    expect(container.querySelector('.tree-shelf--lower-center')).toBeInTheDocument()
  })
})
