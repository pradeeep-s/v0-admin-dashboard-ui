import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const schemeId = searchParams.get('schemeId')

  if (!schemeId) {
    return Response.json({ success: false, message: 'schemeId required' })
  }

  const { data, error } = await supabase
    .from('dynamic_schemas')
    .select('*')
    .eq('scheme_id', schemeId)

  if (error) {
    return Response.json({ success: false, message: error.message })
  }

  return Response.json({
    success: true,
    data,
  })
}