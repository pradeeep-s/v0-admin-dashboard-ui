import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    let query = supabase
      .from('schemes')
      .select('id, module_id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name')

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Schemes query error:', error)
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
    console.error('[v0] Schemes API error:', error)
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

    const { moduleId, name, code, description } = body

    if (!moduleId || !name || !code) {
      return NextResponse.json(
        { success: false, message: 'Module ID, name, and code are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schemes')
      .insert([{ module_id: moduleId, name, code, description, is_active: true }])
      .select()

    if (error) {
      console.error('[v0] Scheme creation error:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Scheme created successfully',
      data: data?.[0],
    })
  } catch (error) {
    console.error('[v0] Scheme API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
