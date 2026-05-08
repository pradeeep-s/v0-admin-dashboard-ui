import { queryOne, queryMany } from '@/lib/db'
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

    // Check if user is admin
    const userData = await queryOne<any>(
      'SELECT role FROM public.users WHERE id = $1',
      [session.id]
    )

    if (!userData || userData.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can access config' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const schemeId = searchParams.get('schemeId')

    if (type === 'column-mappings') {
      let sqlQuery = 'SELECT id, scheme_id, excel_column, database_column, data_type, is_required FROM public.column_mappings'
      const params: any[] = []

      if (schemeId) {
        sqlQuery += ` WHERE scheme_id = $1`
        params.push(schemeId)
      }

      const data = await queryMany<any>(sqlQuery, params.length > 0 ? params : undefined)

      return NextResponse.json({
        success: true,
        data: data || [],
      })
    }

    if (type === 'validation-rules') {
      let sqlQuery = 'SELECT id, scheme_id, column_name, rule_type, rule_value, error_message FROM public.validation_rules'
      const params: any[] = []

      if (schemeId) {
        sqlQuery += ` WHERE scheme_id = $1`
        params.push(schemeId)
      }

      const data = await queryMany<any>(sqlQuery, params.length > 0 ? params : undefined)

      return NextResponse.json({
        success: true,
        data: data || [],
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Config API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Check if user is admin
    const userData = await queryOne<any>(
      'SELECT role FROM public.users WHERE id = $1',
      [session.id]
    )

    if (!userData || userData.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can create config' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type } = body

    if (type === 'column-mapping') {
      const { schemeId, excelColumn, databaseColumn, dataType, isRequired } = body

      if (!schemeId || !excelColumn || !databaseColumn || !dataType) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const data = await queryOne<any>(
        `INSERT INTO public.column_mappings (scheme_id, excel_column, database_column, data_type, is_required, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, scheme_id, excel_column, database_column, data_type, is_required`,
        [schemeId, excelColumn, databaseColumn, dataType, isRequired || false]
      )

      if (!data) {
        console.error('[DB] Column mapping creation error')
        return NextResponse.json(
          { success: false, message: 'Failed to create column mapping' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Column mapping created successfully',
        data,
      })
    }

    if (type === 'validation-rule') {
      const { schemeId, columnName, ruleType, ruleValue, errorMessage } = body

      if (!schemeId || !columnName || !ruleType || !errorMessage) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const data = await queryOne<any>(
        `INSERT INTO public.validation_rules (scheme_id, column_name, rule_type, rule_value, error_message, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, scheme_id, column_name, rule_type, rule_value, error_message`,
        [schemeId, columnName, ruleType, ruleValue || null, errorMessage]
      )

      if (!data) {
        console.error('[DB] Validation rule creation error')
        return NextResponse.json(
          { success: false, message: 'Failed to create validation rule' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Validation rule created successfully',
        data,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[DB] Config API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
