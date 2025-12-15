import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) {
    // If user is logged in, redirect to home or the page they tried to access
    const from = location.state?.from?.pathname || '/home'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
