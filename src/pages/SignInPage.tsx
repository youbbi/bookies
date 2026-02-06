import { useState, useMemo } from 'react'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth'

type FormState = 'idle' | 'loading' | 'success' | 'error'
type GoogleState = 'idle' | 'loading' | 'error'

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [googleState, setGoogleState] = useState<GoogleState>('idle')
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

  const handleGoogleSignIn = async () => {
    setGoogleState('loading')
    setErrorMessage(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setGoogleState('error')
      setErrorMessage(error.message)
    }
    // On success, user will be redirected by Supabase
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

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-cream-300" />
              <span className="px-4 text-sm text-muted">ou</span>
              <div className="flex-1 border-t border-cream-300" />
            </div>

            {googleState === 'error' && errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleState === 'loading'}
              className="w-full btn-secondary py-3 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
