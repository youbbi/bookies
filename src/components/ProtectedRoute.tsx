import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-muted">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    // Redirect to sign-in, preserving the intended destination
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
