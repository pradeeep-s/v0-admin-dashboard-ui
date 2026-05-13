import { UserRole, Permission, PermissionResource, PermissionAction } from './types'

/**
 * Role-based permission matrix
 * Defines what resources each role can access and what actions they can perform
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'branches', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'modules', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'module_columns', actions: ['view', 'create', 'edit', 'delete', 'configure'] },
    { resource: 'queries', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'uploads', actions: ['view', 'delete'] },
    { resource: 'errors', actions: ['view', 'delete'] },
    { resource: 'settings', actions: ['view', 'edit', 'configure'] },
  ],
  Branch: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'uploads', actions: ['view'] },
    { resource: 'errors', actions: ['view'] },
    { resource: 'modules', actions: ['view'] },
  ],
  Operator: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'uploads', actions: ['view', 'create'] },
    { resource: 'errors', actions: ['view'] },
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.some((p) => p.resource === resource && p.actions.includes(action))
}

/**
 * Check if a role has any permission for a resource
 */
export function canAccessResource(role: UserRole, resource: PermissionResource): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.some((p) => p.resource === resource)
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if user can perform action on resource
 */
export function authorize(
  role: UserRole | undefined,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  if (!role) return false
  return hasPermission(role, resource, action)
}

/**
 * Get all accessible resources for a role
 */
export function getAccessibleResources(role: UserRole): PermissionResource[] {
  return ROLE_PERMISSIONS[role].map((p) => p.resource)
}
