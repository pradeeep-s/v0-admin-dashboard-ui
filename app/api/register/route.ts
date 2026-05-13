import { createClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Register a new user with email and password
 * Stores credentials in users table with hashed password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, role } = body

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

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

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
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', finalUsername)
      .single()

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
    const userId = crypto.randomUUID ? crypto.randomUUID() : generateUUID()

    // Create user in users table
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          username: finalUsername,
          password_hash: passwordHash,
          role: role || 'Operator',
          is_active: true,
        },
      ])
      .select('id, username, email, role, is_active')
      .single()

    if (createError) {
      console.error('[v0] Error creating user:', createError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create user',
        },
        { status: 400 }
      )
    }

    console.log('[v0] New user registered:', email)

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
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Register API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * Simple UUID generator fallback
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
