import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')
    const columnName = searchParams.get('columnName')
    const errorType = searchParams.get('errorType')

    let query = supabase
      .from('upload_errors')
      .select(
        `id, upload_id, row_number, column_name, error_message, 
         error_type, created_at, uploads(user_id)`
      )
      .eq('uploads.user_id', user.id)

    if (uploadId) {
      query = query.eq('upload_id', uploadId)
    }

    if (columnName) {
      query = query.ilike('column_name', `%${columnName}%`)
    }

    if (errorType) {
      query = query.eq('error_type', errorType)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Errors query error:', error)
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
    console.error('[v0] Errors API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}
