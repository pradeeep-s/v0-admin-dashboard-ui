import { getPooledClient } from '@/lib/supabase/pool'
import { NextRequest, NextResponse } from 'next/server'

// GET all branches
export async function GET() {
  const supabase = await getPooledClient()
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ data, error })
}

// CREATE branch
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('branches')
    .insert([body])
    .select()
    .single()

  return NextResponse.json({ data, error })
}
