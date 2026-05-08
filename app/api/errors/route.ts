import { queryMany, queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get user from session cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionMatch = cookieHeader.match(/session=([^;]+)/)
    
    if (!sessionMatch) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    let session
    try {
      session = JSON.parse(decodeURIComponent(sessionMatch[1]))
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')
    const columnName = searchParams.get('columnName')
    const errorType = searchParams.get('errorType')

    let sqlQuery = `
      SELECT ue.id, ue.upload_id, ue.row_number, ue.column_name, ue.error_message, 
             ue.error_type, ue.created_at, u.user_id
      FROM public.upload_errors ue
      JOIN public.uploads u ON ue.upload_id = u.id
      WHERE u.user_id = $1
    `
    const params: any[] = [session.id]
    let paramIndex = 2

    if (uploadId) {
      sqlQuery += ` AND ue.upload_id = $${paramIndex}`
      params.push(uploadId)
      paramIndex++
    }

    if (columnName) {
      sqlQuery += ` AND ue.column_name ILIKE $${paramIndex}`
      params.push(`%${columnName}%`)
      paramIndex++
    }

    if (errorType) {
      sqlQuery += ` AND ue.error_type = $${paramIndex}`
      params.push(errorType)
      paramIndex++
    }

    const data = await queryMany<any>(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('[DB] Errors API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}
