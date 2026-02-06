import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Mock the PNG imports
vi.mock('@/assets/tree-bookshelf.png', () => ({
  default: '/mock-tree.png',
}))
vi.mock('@/assets/tree-bookshelf@2x.png', () => ({
  default: '/mock-tree@2x.png',
}))

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  it('renders the app title', () => {
    renderApp()
    expect(screen.getByText('Bookies')).toBeInTheDocument()
  })

  it('renders the tagline in French', () => {
    renderApp()
    expect(screen.getByText('Partagez vos livres avec vos proches')).toBeInTheDocument()
  })

  it('renders the tree bookshelf', () => {
    renderApp()
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Mes coups de cœur')).toBeInTheDocument()
  })

  it('renders sign-in page at /sign-in route', () => {
    renderApp('/sign-in')
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
  })
})
