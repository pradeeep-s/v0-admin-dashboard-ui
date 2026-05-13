import { useAuth } from './useAuth'
import { authorize, hasPermission, canAccessResource } from '@/lib/permissions'
import { PermissionResource, PermissionAction, UserRole } from '@/lib/types'

/**
 * Hook for checking authorization and permissions
 */
export function useAuthorization() {
  const { user } = useAuth()

  const checkPermission = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!user) return false
    return authorize(user.role, resource, action)
  }

  const checkResource = (resource: PermissionResource): boolean => {
    if (!user) return false
    return canAccessResource(user.role, resource)
  }

  const isBranch = (): boolean => user?.role === 'Branch'
  const isOperator = (): boolean => user?.role === 'Operator'
  const isAdmin = (): boolean => user?.role === 'Admin'

  return {
    user,
    checkPermission,
    checkResource,
    isAdmin,
    isBranch,
    isOperator,
    authorize: (resource: PermissionResource, action: PermissionAction) =>
      checkPermission(resource, action),
  }
}
