import { getPooledClient } from '@/lib/supabase/pool'

export async function GET() {
  const supabase = await getPooledClient()
  const { data } = await supabase.from('schemes').select('id,name')

  return Response.json(data)
}
