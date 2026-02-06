import { useState, useMemo } from 'react'
import { signInWithMagicLink } from '@/lib/auth'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail) return

    setFormState('loading')
    setErrorMessage(null)

    const { error } = await signInWithMagicLink(email)

    if (error) {
      setFormState('error')
      setErrorMessage(error.message)
    } else {
      setFormState('success')
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-wood-600 mb-2">Connexion</h1>
          <p className="text-muted">Entrez votre courriel pour recevoir un lien magique</p>
        </div>

        {formState === 'success' ? (
          <div className="card text-center">
            <div className="text-warm-green text-4xl mb-4">✓</div>
            <h2 className="text-xl font-medium text-wood-600 mb-2">Lien envoyé!</h2>
            <p className="text-muted">
              Vérifiez votre boîte de réception et cliquez sur le lien pour vous connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-wood-500 mb-2">
                Courriel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@courriel.com"
                className="w-full px-4 py-3 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoComplete="email"
                autoFocus
              />
            </div>

            {formState === 'error' && errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!isValidEmail || formState === 'loading'}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {formState === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
