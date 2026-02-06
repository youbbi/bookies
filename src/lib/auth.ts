import { supabase } from './supabase'

export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Validates email format using a simple regex pattern
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Gets the redirect URL for auth callbacks
 */
function getRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`
}

/**
 * Signs in a user by sending a magic link to their email.
 * The user clicks the link in their email to complete authentication.
 *
 * @param email - The user's email address
 * @returns Promise with success status and optional error message
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' }
  }

  if (!isValidEmail(trimmedEmail)) {
    return { success: false, error: 'Invalid email address' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Signs in a user using Google OAuth.
 * Redirects to Google for authentication, then back to the app.
 *
 * @returns Promise with success status and optional error message
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Signs out the current user.
 *
 * @returns Promise with error if sign out failed
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}
