import { NextRequest, NextResponse } from 'next/server'
import { sessions } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value

    if (sessionId) {
      sessions.delete(sessionId)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    })

    response.cookies.delete('sessionId')

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
