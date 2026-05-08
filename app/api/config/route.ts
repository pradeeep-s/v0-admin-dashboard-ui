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

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can access config' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const schemeId = searchParams.get('schemeId')

    if (type === 'column-mappings') {
      let query = supabase
        .from('column_mappings')
        .select('id, scheme_id, excel_column, database_column, data_type, is_required')

      if (schemeId) {
        query = query.eq('scheme_id', schemeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('[v0] Column mappings query error:', error)
        return NextResponse.json(
          { success: false, message: error.message, data: [] },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      })
    }

    if (type === 'validation-rules') {
      let query = supabase
        .from('validation_rules')
        .select('id, scheme_id, column_name, rule_type, rule_value, error_message')

      if (schemeId) {
        query = query.eq('scheme_id', schemeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('[v0] Validation rules query error:', error)
        return NextResponse.json(
          { success: false, message: error.message, data: [] },
          { status: 400 }
        )
      }

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

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'Admin') {
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

      const { data, error } = await supabase
        .from('column_mappings')
        .insert([
          {
            scheme_id: schemeId,
            excel_column: excelColumn,
            database_column: databaseColumn,
            data_type: dataType,
            is_required: isRequired || false,
          },
        ])
        .select()

      if (error) {
        console.error('[v0] Column mapping creation error:', error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Column mapping created successfully',
        data: data?.[0],
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

      const { data, error } = await supabase
        .from('validation_rules')
        .insert([
          {
            scheme_id: schemeId,
            column_name: columnName,
            rule_type: ruleType,
            rule_value: ruleValue || null,
            error_message: errorMessage,
          },
        ])
        .select()

      if (error) {
        console.error('[v0] Validation rule creation error:', error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Validation rule created successfully',
        data: data?.[0],
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Config API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
