import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, sessions } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
        },
        { status: 400 }
      )
    }

    const user = mockUsers[username]

    if (!user || user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'User account is inactive',
        },
        { status: 403 }
      )
    }

    // Create session
    const sessionId = Math.random().toString(36).substring(2, 15)
    sessions.set(sessionId, {
      userId: user.id,
      createdAt: new Date(),
    })

    // Set secure cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
      { status: 200 }
    )

    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
