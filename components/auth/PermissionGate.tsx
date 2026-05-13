'use client'

import { ReactNode } from 'react'
import { useAuthorization } from '@/hooks/useAuthorization'
import { PermissionResource, PermissionAction } from '@/lib/types'

interface PermissionGateProps {
  resource: PermissionResource
  action: PermissionAction
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Component to conditionally render content based on permissions
 */
export function PermissionGate({ resource, action, children, fallback }: PermissionGateProps) {
  const { checkPermission } = useAuthorization()

  if (!checkPermission(resource, action)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
