import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('name')

  return NextResponse.json({
    success: !error,
    data: data || [],
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()

  const { name, code, description } = body

  const { data, error } = await supabase
    .from('modules')
    .insert([
      {
        name,
        code,
        description,
        is_active: true,
      },
    ])
    .select()
    .single()

  return NextResponse.json({
    success: !error,
    data,
  })
}