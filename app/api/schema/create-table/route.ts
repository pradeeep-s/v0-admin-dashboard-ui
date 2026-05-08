import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { schemeId } = await req.json()

    if (!schemeId) {
      return Response.json({
        success: false,
        message: 'schemeId is required',
      })
    }

    // 🟢 1. Get scheme (for table name)
    const { data: scheme, error: schemeError } = await supabase
      .from('schemes')
      .select('id, name')
      .eq('id', schemeId)
      .single()

    if (schemeError || !scheme) {
      return Response.json({
        success: false,
        message: 'Scheme not found',
      })
    }

    // 🟢 2. Generate table name
    const tableName = scheme.name
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '')   // remove special chars
  .replace(/\s+/g, '_')

    // 🟢 3. Get schema columns (IMPORTANT: do NOT delete these)
    const { data: columns, error: colError } = await supabase
      .from('dynamic_schemas')
      .select('*')
      .eq('scheme_id', schemeId)

    if (colError || !columns || columns.length === 0) {
      return Response.json({
        success: false,
        message: 'No schema found for this scheme',
      })
    }

    // 🟢 4. DROP existing table (ONLY data table)
   const dropQuery = `DROP TABLE IF EXISTS "${tableName}" CASCADE`
    console.log('Executing SQL:', dropQuery)

    await supabase.rpc('execute_sql', { query: dropQuery })


    // 🟢 5. Build SQL columns
    const sqlColumns = columns.map((col: any) => {
      let type = 'TEXT'

      if (col.data_type === 'number') type = 'NUMERIC'
      if (col.data_type === 'date') type = 'DATE'
      if (col.data_type === 'boolean') type = 'BOOLEAN'

      return `"${col.column_name}" ${type} ${
        col.is_required ? 'NOT NULL' : ''
      }`
    })

    // 🟢 6. Create new table
   const createQuery = `
  CREATE TABLE "${tableName}" (
    id UUID DEFAULT gen_random_uuid(),
    branch_id UUID,
    branch_name TEXT,
    branch_code TEXT,
    module_id UUID,
    module_name TEXT,
    ${sqlColumns.join(',')}
  )
`

    await supabase.rpc('execute_sql', { query: createQuery })

    return Response.json({
      success: true,
      message: `Table "${tableName}" recreated successfully`,
    })
  } catch (error) {
    console.error('Create table error:', error)

    return Response.json({
      success: false,
      message: 'Internal server error',
    })
  }
}