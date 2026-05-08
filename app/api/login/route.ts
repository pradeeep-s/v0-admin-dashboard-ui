import { authenticateUser } from '@/lib/auth-utils'
import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    console.log('[AUTH] Login attempt:', email)

    // Authenticate user using users table
    const { user, error, isNewUser } = await authenticateUser(email, password)

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: error || 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User account is inactive' },
        { status: 403 }
      )
    }

    // Update last login
    try {
      await query('UPDATE public.users SET last_login = NOW() WHERE id = $1', [user.id])
    } catch (err) {
      console.warn('[AUTH] Failed to update last login:', err)
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: isNewUser ? 'Account created and logged in' : 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })

    response.cookies.set(
      'session',
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      {
        httpOnly: true,
        path: '/',
      }
    )

    return response
  } catch (err) {
    console.error('[AUTH ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
