import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('modules')
      .select('id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('[v0] Modules query error:', error)
      return NextResponse.json(
        { success: false, message: error.message, data: [] },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('[v0] Modules API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, code, description } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: 'Name and code are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('modules')
      .insert([{ name, code, description, is_active: true }])
      .select()

    if (error) {
      console.error('[v0] Module creation error:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Module created successfully',
      data: data?.[0],
    })
  } catch (error) {
    console.error('[v0] Module API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
