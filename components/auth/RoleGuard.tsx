'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/types'
import { redirect } from 'next/navigation'

interface RoleGuardProps {
  children: ReactNode
  requiredRoles: UserRole[]
  fallback?: ReactNode
}

/**
 * Component to guard content by role
 * Redirects to login if not authenticated, shows fallback if wrong role
 */
export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect('/login')
  }

  if (!requiredRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Redirect to appropriate role dashboard
    const roleDashboard: Record<UserRole, string> = {
      Admin: '/admin/dashboard',
      Branch: '/branch/dashboard',
      Operator: '/operator/dashboard',
    }

    redirect(roleDashboard[user.role])
  }

  return <>{children}</>
}
