import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BarcodeScannerModal } from './BarcodeScannerModal'

// Mock quagga2
vi.mock('@ericblade/quagga2', () => ({
  default: {
    init: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onDetected: vi.fn(),
    offDetected: vi.fn(),
  },
}))

describe('BarcodeScannerModal', () => {
  const mockOnClose = vi.fn()
  const mockOnScan = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BarcodeScannerModal isOpen={false} onClose={mockOnClose} onScan={mockOnScan} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when isOpen is true', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    expect(screen.getByText(/scanner/i)).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    expect(screen.getByRole('button', { name: /fermer|annuler/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    fireEvent.click(screen.getByRole('button', { name: /fermer|annuler/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking overlay', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    const overlay = screen.getByTestId('scanner-overlay')
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('shows scanning instructions', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    expect(screen.getAllByText(/code-barres|isbn/i).length).toBeGreaterThan(0)
  })

  it('renders video container for camera feed', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    expect(screen.getByTestId('scanner-viewport')).toBeInTheDocument()
  })

  it('shows initializing message while starting camera', () => {
    render(<BarcodeScannerModal isOpen={true} onClose={mockOnClose} onScan={mockOnScan} />)

    // Should show initializing message since mock doesn't call callback
    expect(screen.getByText(/initialisation/i)).toBeInTheDocument()
  })
})
