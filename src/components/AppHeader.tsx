import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@/lib/auth'

interface AppHeaderProps {
  displayName: string
}

export function AppHeader({ displayName }: AppHeaderProps) {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)

    const { error } = await signOut()

    if (!error) {
      navigate('/sign-in', { replace: true })
    }
    // If error, user stays on page and can try again
    setIsSigningOut(false)
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-medium text-cream-100 drop-shadow-md">{displayName}</span>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-sm text-cream-100 hover:text-cream-50 transition-colors drop-shadow-md disabled:opacity-50"
        aria-label="Déconnexion"
      >
        {isSigningOut ? '...' : 'Déconnexion'}
      </button>
    </header>
  )
}
