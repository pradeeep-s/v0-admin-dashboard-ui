import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from './db'
import { authorize } from './permissions'
import { PermissionResource, PermissionAction, User } from './types'

/**
 * Parse session from request cookies
 */
export function getSessionFromRequest(request: NextRequest): any {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionMatch = cookieHeader.match(/session=([^;]+)/)

    if (!sessionMatch) {
      return null
    }

    const session = JSON.parse(decodeURIComponent(sessionMatch[1]))
    return session
  } catch (e) {
    return null
  }
}

/**
 * Verify authentication
 */
export async function verifyAuth(request: NextRequest): Promise<{ user: User | null; error: NextResponse | null }> {
  const session = getSessionFromRequest(request)

  if (!session || !session.id) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    }
  }

  try {
    const user = await queryOne<User>(
      'SELECT id, username, email, role, is_active as "isActive", branch_id as "branchId" FROM public.users WHERE id = $1 AND is_active = true',
      [session.id]
    )

    if (!user) {
      return {
        user: null,
        error: NextResponse.json({ success: false, message: 'User not found' }, { status: 401 }),
      }
    }

    return { user, error: null }
  } catch (error) {
    console.error('[API] Auth verification error:', error)
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 500 }),
    }
  }
}

/**
 * Verify authorization for a specific resource and action
 */
export function verifyAuthorization(
  user: User | null,
  resource: PermissionResource,
  action: PermissionAction
): { authorized: boolean; error: NextResponse | null } {
  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (!authorize(user.role, resource, action)) {
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      ),
    }
  }

  return { authorized: true, error: null }
}

/**
 * Require authentication middleware
 * Use this to protect API routes that require authentication
 */
export async function requireAuth(request: NextRequest) {
  const { user, error } = await verifyAuth(request)
  return { user, error }
}

/**
 * Require authorization middleware
 * Use this to protect API routes that require specific permissions
 */
export async function requirePermission(
  request: NextRequest,
  resource: PermissionResource,
  action: PermissionAction
) {
  const { user, error: authError } = await verifyAuth(request)

  if (authError) {
    return { user: null, authorized: false, error: authError }
  }

  const { authorized, error: permError } = verifyAuthorization(user, resource, action)

  if (!authorized) {
    return { user, authorized: false, error: permError }
  }

  return { user, authorized: true, error: null }
}
