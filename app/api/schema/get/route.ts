import { getPooledClient } from '@/lib/supabase/pool'

export async function GET(req: Request) {
  const supabase = await getPooledClient()
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
