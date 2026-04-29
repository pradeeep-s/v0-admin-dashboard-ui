import { createClient } from '@/lib/supabase/server'
import { authenticateUser } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    console.log('[v0] Login attempt for email:', email)

    // Authenticate user using users table (email + password_hash with bcrypt verification)
    const { user: userData, error: authError, isNewUser } = await authenticateUser(email, password)

    if (authError || !userData) {
      console.error('[v0] Authentication failed:', authError)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    if (!userData.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'User account is inactive',
        },
        { status: 403 }
      )
    }

    // Update last login
    const supabase = await createClient()
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id)

    console.log('[v0] Login successful for email:', email, 'New user:', isNewUser)

    const response = NextResponse.json(
      {
        success: true,
        message: isNewUser ? 'Account created and logged in' : 'Login successful',
        data: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
        },
      },
      { status: 200 }
    )

    return response
  } catch (error) {
    console.error('[v0] Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
