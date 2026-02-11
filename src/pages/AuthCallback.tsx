import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Auth callback page that handles OAuth and magic link redirects.
 * Supabase processes the URL hash/params and exchanges the code for a session.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for auth state changes - this fires when Supabase processes the URL token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Auth successful, redirect to home
        navigate('/', { replace: true })
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Ignore these events
      } else if (!session) {
        // No session after processing, redirect to sign-in
        // Add a small delay to ensure Supabase has processed the URL
        setTimeout(() => {
          navigate('/sign-in', { replace: true })
        }, 1000)
      }
    })

    // Also check if there's already a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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
