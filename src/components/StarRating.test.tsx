import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating } from './StarRating'

describe('StarRating', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 5 stars', () => {
    render(<StarRating value={null} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('displays correct number of filled stars', () => {
    render(<StarRating value={3} />)
    const buttons = screen.getAllByRole('button')

    // Check aria-pressed for exact match
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true') // 3rd star
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false')
    expect(buttons[4]).toHaveAttribute('aria-pressed', 'false')
  })

  it('displays no filled stars when value is null', () => {
    render(<StarRating value={null} />)
    const buttons = screen.getAllByRole('button')

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('calls onChange when star is clicked', () => {
    render(<StarRating value={null} onChange={mockOnChange} />)

    fireEvent.click(screen.getByLabelText('3 étoiles'))
    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('clears rating when clicking the same star', () => {
    render(<StarRating value={3} onChange={mockOnChange} />)

    fireEvent.click(screen.getByLabelText('3 étoiles'))
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('changes rating when clicking a different star', () => {
    render(<StarRating value={3} onChange={mockOnChange} />)

    fireEvent.click(screen.getByLabelText('5 étoiles'))
    expect(mockOnChange).toHaveBeenCalledWith(5)
  })

  it('does not call onChange when readonly', () => {
    render(<StarRating value={3} onChange={mockOnChange} readonly />)

    fireEvent.click(screen.getByLabelText('5 étoiles'))
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('increases rating on ArrowRight key', () => {
    render(<StarRating value={2} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('decreases rating on ArrowLeft key', () => {
    render(<StarRating value={3} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowLeft' })
    expect(mockOnChange).toHaveBeenCalledWith(2)
  })

  it('sets rating to null when decreasing from 1', () => {
    render(<StarRating value={1} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowLeft' })
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('does not exceed 5 when increasing', () => {
    render(<StarRating value={5} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(mockOnChange).toHaveBeenCalledWith(5)
  })

  it('increases rating on ArrowUp key', () => {
    render(<StarRating value={2} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowUp' })
    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('decreases rating on ArrowDown key', () => {
    render(<StarRating value={3} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowDown' })
    expect(mockOnChange).toHaveBeenCalledWith(2)
  })

  it('does not respond to keyboard when readonly', () => {
    render(<StarRating value={3} onChange={mockOnChange} readonly />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('starts at 1 when increasing from null', () => {
    render(<StarRating value={null} onChange={mockOnChange} />)

    const container = screen.getByRole('group')
    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(mockOnChange).toHaveBeenCalledWith(1)
  })

  it('renders with correct aria-label', () => {
    render(<StarRating value={null} />)

    expect(screen.getByLabelText('1 étoile')).toBeInTheDocument()
    expect(screen.getByLabelText('2 étoiles')).toBeInTheDocument()
  })

  it('has group role with Note label', () => {
    render(<StarRating value={null} />)

    expect(screen.getByRole('group', { name: 'Note' })).toBeInTheDocument()
  })
})
