import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@/lib/auth'

interface AppHeaderProps {
  displayName: string
  username?: string
}

export function AppHeader({ displayName, username }: AppHeaderProps) {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)

    const { error } = await signOut()

    if (!error) {
      navigate('/sign-in', { replace: true })
    }
    // If error, user stays on page and can try again
    setIsSigningOut(false)
  }

  const handleShare = async () => {
    if (!username) return
    const url = `${window.location.origin}/shelf/${username}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-medium text-cream-100 drop-shadow-md">{displayName}</span>
      <div className="flex items-center gap-3">
        {username && (
          <button
            onClick={handleShare}
            className="text-sm text-cream-100 hover:text-cream-50 transition-colors drop-shadow-md"
            aria-label="Partager ma bibliothèque"
          >
            {copied ? 'Lien copié !' : 'Partager'}
          </button>
        )}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-sm text-cream-100 hover:text-cream-50 transition-colors drop-shadow-md disabled:opacity-50"
          aria-label="Déconnexion"
        >
          {isSigningOut ? '...' : 'Déconnexion'}
        </button>
      </div>
    </header>
  )
}
