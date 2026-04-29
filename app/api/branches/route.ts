import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('branches')
      .select('id, name, code, location, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('[v0] Branches query error:', error)
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
    console.error('[v0] Branches API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}
