import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { schemeId, columns } = await req.json()

    if (!schemeId || !columns || columns.length === 0) {
      return Response.json(
        { success: false, message: 'Invalid input' },
        { status: 400 }
      )
    }

    // 🟢 STEP 1: Get Scheme Details
    const { data: scheme, error: schemeError } = await supabase
      .from('schemes')
      .select('id, name, code')
      .eq('id', schemeId)
      .single()

    if (schemeError || !scheme) {
      return Response.json(
        { success: false, message: 'Scheme not found' },
        { status: 400 }
      )
    }

    const tableName = scheme.code.toLowerCase().replace(/\s+/g, '_')

    // 🟢 STEP 2: Get OLD columns
    const { data: oldColumnsData } = await supabase
      .from('dynamic_schemas')
      .select('column_name')
      .eq('scheme_id', schemeId)

    const oldCols =
      oldColumnsData?.map((c: any) => c.column_name) || []

    const newCols = columns.map((c: any) => c.databaseColumn)

    // 🟢 STEP 3: DELETE OLD SCHEMA
    await supabase
      .from('dynamic_schemas')
      .delete()
      .eq('scheme_id', schemeId)

    // 🟢 STEP 4: INSERT NEW SCHEMA
    await supabase.from('dynamic_schemas').insert(
      columns.map((col: any) => ({
        scheme_id: schemeId,
        scheme_code: scheme.code,
        table_name: tableName,
        column_name: col.databaseColumn,
        data_type: col.dataType,
        is_required: col.isRequired,
      }))
    )

    // 🟢 STEP 5: CREATE TABLE IF NOT EXISTS
    const sqlColumns = columns.map((col: any) => {
      let type = 'TEXT'

      if (col.dataType === 'number') type = 'NUMERIC'
      if (col.dataType === 'date') type = 'DATE'
      if (col.dataType === 'boolean') type = 'BOOLEAN'

      return `"${col.databaseColumn}" ${type} ${
        col.isRequired ? 'NOT NULL' : ''
      }`
    })

    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID DEFAULT gen_random_uuid(),
        ${sqlColumns.join(',')}
      )
    `

    await supabase.rpc('execute_sql', { query: createQuery })

    // 🟢 STEP 6: ADD NEW COLUMNS
    for (const col of newCols) {
      if (!oldCols.includes(col)) {
        await supabase.rpc('execute_sql', {
          query: `ALTER TABLE ${tableName} ADD COLUMN "${col}" TEXT`,
        })
      }
    }

    // 🟢 STEP 7: REMOVE OLD COLUMNS
    for (const col of oldCols) {
      if (!newCols.includes(col)) {
        await supabase.rpc('execute_sql', {
          query: `ALTER TABLE ${tableName} DROP COLUMN "${col}"`,
        })
      }
    }

    return Response.json({
      success: true,
      message: 'Schema and table updated successfully',
    })
  } catch (error) {
    console.error('Schema save error:', error)

    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}