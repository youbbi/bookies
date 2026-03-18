import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

interface UsernamePromptProps {
  userId: string
  onComplete: (username: string) => void
}

type FormState = 'idle' | 'loading' | 'error'

const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/

export function UsernamePrompt({ userId, onComplete }: UsernamePromptProps) {
  const [username, setUsername] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValid = useMemo(() => USERNAME_REGEX.test(username), [username])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setFormState('loading')
    setErrorMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ username } as never)
      .eq('id', userId)

    if (error) {
      setFormState('error')
      if (error.code === '23505') {
        setErrorMessage("Ce nom d'utilisateur est déjà pris")
      } else {
        setErrorMessage(error.message)
      }
    } else {
      onComplete(username)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-wood-600 mb-2">Nom d'utilisateur</h1>
          <p className="text-muted">Choisissez un identifiant pour partager votre bibliothèque</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-wood-500 mb-2">
              Identifiant
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="marie"
              maxLength={30}
              className="w-full px-4 py-3 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-muted mt-1">
              3-30 caractères, lettres minuscules, chiffres et tirets
            </p>
          </div>

          {username.length >= 3 && isValid && (
            <div className="mb-4 p-3 bg-cream-200 rounded-lg">
              <p className="text-xs text-wood-500">Votre lien de partage :</p>
              <p className="text-sm font-medium text-wood-600 break-all">
                {window.location.origin}/shelf/{username}
              </p>
            </div>
          )}

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
            disabled={!isValid || formState === 'loading'}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {formState === 'loading' ? 'Enregistrement...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}
