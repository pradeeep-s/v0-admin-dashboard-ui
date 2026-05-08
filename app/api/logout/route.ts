import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    })

    response.cookies.delete('session')
    return response
  } catch (error) {
    console.error('[v0] Logout API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
