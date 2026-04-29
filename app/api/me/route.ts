import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email, role, is_active, last_login')
      .eq('id', authUser.id)
      .single()

    if (userError || !userData) {
      console.error('[v0] User fetch error:', userError)
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isActive: userData.is_active,
        lastLogin: userData.last_login,
      },
    })
  } catch (error) {
    console.error('[v0] Me API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
