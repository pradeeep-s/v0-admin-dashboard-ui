import { hashPassword } from '@/lib/auth-utils'
import { queryOne, query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Register a new user with email and password
 * Stores credentials in users table with hashed password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, role, branchId } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters',
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await queryOne<any>(
      'SELECT id FROM public.users WHERE email = $1',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 400 }
      )
    }

    // Generate unique username if not provided
    let finalUsername = username
    if (!finalUsername) {
      finalUsername = email.split('@')[0] + Math.random().toString(36).substring(7)
    }

    // Check if username is unique
    const existingUsername = await queryOne<any>(
      'SELECT id FROM public.users WHERE username = $1',
      [finalUsername]
    )

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username already taken',
        },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate UUID for new user
    const userId = crypto.randomUUID()

    // Create user in users table
    const newUser = await queryOne<any>(
      `INSERT INTO public.users (id, email, username, password_hash, role, branch_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, username, email, role, is_active, branch_id as "branchId"`,
      [userId, email, finalUsername, passwordHash, role || 'Operator', branchId || null]
    )

    if (!newUser) {
      console.error('[DB] Error creating user')
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create user',
        },
        { status: 400 }
      )
    }

    console.log('[DB] New user registered:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.is_active,
          branchId: newUser.branchId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[DB] Register API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
