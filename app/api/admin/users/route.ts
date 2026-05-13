import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { queryMany, queryOne } from '@/lib/db'

/**
 * GET /api/admin/users
 * List all users (Admin only)
 */
export async function GET(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(request, 'users', 'view')

  if (!authorized) {
    return error!
  }

  try {
    const users = await queryMany<any>(
      `SELECT 
        id, username, email, role, branch_id as "branchId", 
        is_active as "isActive", created_at, last_login
       FROM public.users 
       ORDER BY created_at DESC`,
      []
    )

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.error('[API] Users GET error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(request, 'users', 'create')

  if (!authorized) {
    return error!
  }

  try {
    const body = await request.json()
    const { email, username, role, branchId } = body

    if (!email || !username || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await queryOne<any>(
      'SELECT id FROM public.users WHERE email = $1',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10)
    const { hashPassword } = await import('@/lib/auth-utils')
    const passwordHash = await hashPassword(tempPassword)

    const newUser = await queryOne<any>(
      `INSERT INTO public.users (id, email, username, password_hash, role, branch_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, username, email, role, branch_id as "branchId", is_active as "isActive"`,
      [crypto.randomUUID(), email, username, passwordHash, role, branchId || null]
    )

    if (!newUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: {
          ...newUser,
          tempPassword, // Share temporary password with admin
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[API] Users POST error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
