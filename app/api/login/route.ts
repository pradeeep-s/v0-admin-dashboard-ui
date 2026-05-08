import { getPooledClient } from '@/lib/supabase/pool'
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

    // Get pooled client instance
    const supabase = await getPooledClient()

    // 🔹 Get user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 🔹 Verify password (bcrypt)
    const { data: match } = await supabase.rpc('verify_password', {
      password_input: password,
      password_hash: user.password_hash,
    })

    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'User inactive' },
        { status: 403 }
      )
    }

    // 🔹 Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // 🔐 Set session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })

    response.cookies.set('session', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
    }), {
      httpOnly: true,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[AUTH ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
