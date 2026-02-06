import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('Bookies')).toBeInTheDocument()
  })

  it('renders the tagline in French', () => {
    render(<App />)
    expect(screen.getByText('Partagez vos livres avec vos proches')).toBeInTheDocument()
  })

  it('renders the start button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Commencer' })).toBeInTheDocument()
  })
})
