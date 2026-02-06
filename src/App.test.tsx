import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock the SVG import
vi.mock('@/assets/tree-bookshelf.svg', () => ({
  default: '/mock-tree.svg',
}))

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('Bookies')).toBeInTheDocument()
  })

  it('renders the tagline in French', () => {
    render(<App />)
    expect(screen.getByText('Partagez vos livres avec vos proches')).toBeInTheDocument()
  })

  it('renders the tree bookshelf', () => {
    render(<App />)
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Mes coups de cœur')).toBeInTheDocument()
  })
})
