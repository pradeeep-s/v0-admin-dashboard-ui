import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, sessions } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const session = sessions.get(sessionId)

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid session',
        },
        { status: 401 }
      )
    }

    // Find user by id
    let user = null
    for (const userData of Object.values(mockUsers)) {
      if (userData.id === session.userId) {
        user = userData
        break
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
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
