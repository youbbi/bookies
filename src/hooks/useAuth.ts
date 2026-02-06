import { useAuthContext } from '@/contexts/AuthContext'
import { signInWithMagicLink, signInWithGoogle, type AuthResult } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

/**
 * Hook that provides authentication state and actions.
 * Combines the auth context with sign-in/sign-out functions.
 */
export function useAuth() {
  const { user, session, loading } = useAuthContext()

  const isAuthenticated = !!user

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  return {
    // State from context
    user,
    session,
    loading,
    isAuthenticated,

    // Auth actions
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
  }
}
