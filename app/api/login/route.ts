import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('[v0] Auth error:', authError)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('[v0] User fetch error:', userError)
      return NextResponse.json(
        {
          success: false,
          message: 'User data not found',
        },
        { status: 400 }
      )
    }

    if (!userData.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: 'User account is inactive',
        },
        { status: 403 }
      )
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          isActive: userData.is_active,
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
