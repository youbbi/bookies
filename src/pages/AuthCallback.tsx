import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Auth callback page that handles OAuth redirects.
 * Supabase automatically processes the URL hash/params and exchanges
 * the code for a session. This component checks the session and redirects.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        // Auth failed, redirect to sign-in
        navigate('/sign-in', { replace: true })
        return
      }

      // Auth successful, redirect to home (My Shelf)
      navigate('/', { replace: true })
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">Signing you in...</div>
        <div className="text-muted-foreground text-sm">Please wait</div>
      </div>
    </div>
  )
}
