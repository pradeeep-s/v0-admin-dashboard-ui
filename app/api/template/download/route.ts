import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const schemeId = new URL(req.url).searchParams.get('schemeId')

    if (!schemeId) {
      return new Response('schemeId required', { status: 400 })
    }

    // 🟢 Get scheme name
    const { data: scheme } = await supabase
      .from('schemes')
      .select('name')
      .eq('id', schemeId)
      .single()

    if (!scheme) {
      return new Response('Scheme not found', { status: 400 })
    }

    const tableName = scheme.name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .replace(/\s+/g, '_')

    // 🟢 Get columns from YOUR schema table
    const { data: columns, error } = await supabase
      .from('dynamic_schemas')
      .select('column_name')
      .eq('scheme_id', schemeId)

    if (error || !columns || columns.length === 0) {
      return new Response('No schema found', { status: 400 })
    }

    const headers = columns.map((c: any) => c.column_name)

    // 🟢 Create Excel
    const ws = XLSX.utils.aoa_to_sheet([headers])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tableName)

    const buffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    return new Response(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename=${tableName}.xlsx`,
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal server error', { status: 500 })
  }
}