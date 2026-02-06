import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

interface DisplayNamePromptProps {
  userId: string
  onComplete: () => void
}

type FormState = 'idle' | 'loading' | 'error'

export function DisplayNamePrompt({ userId, onComplete }: DisplayNamePromptProps) {
  const [displayName, setDisplayName] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValidName = useMemo(() => {
    const trimmed = displayName.trim()
    return trimmed.length >= 2 && trimmed.length <= 30
  }, [displayName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidName) return

    setFormState('loading')
    setErrorMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() } as never)
      .eq('id', userId)

    if (error) {
      setFormState('error')
      setErrorMessage(error.message)
    } else {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-wood-600 mb-2">Nom d'affichage</h1>
          <p className="text-muted">Comment voulez-vous qu'on vous appelle?</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-wood-500 mb-2">
              Votre nom
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Marie"
              maxLength={30}
              className="w-full px-4 py-3 rounded-lg border border-cream-300 bg-cream-50 text-wood-600 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoComplete="name"
              autoFocus
            />
            <p className="text-xs text-muted mt-1">Entre 2 et 30 caractères</p>
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
            disabled={!isValidName || formState === 'loading'}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {formState === 'loading' ? 'Enregistrement...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}
