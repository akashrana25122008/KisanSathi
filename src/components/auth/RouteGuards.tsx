import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/store/AuthContext'

function AuthLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo size="lg" />
        <span
          className="h-1.5 w-32 overflow-hidden rounded-full bg-brand-100"
          role="status"
          aria-label="Loading your account"
        >
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
        </span>
        <p className="text-xs font-medium text-ink-500">Opening your KisanSathi account...</p>
      </div>
    </div>
  )
}

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <AuthLoading />
  if (status === 'anonymous') {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequireCompleteProfile() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/welcome" replace />
  if (!user.profileComplete) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export function PublicOnly() {
  const { status, user } = useAuth()
  if (status === 'loading') return <AuthLoading />
  if (user) return <Navigate to={user.profileComplete ? '/' : '/onboarding'} replace />
  return <Outlet />
}
