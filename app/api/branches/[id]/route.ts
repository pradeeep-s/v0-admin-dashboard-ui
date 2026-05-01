import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// UPDATE
export async function PUT(req: NextRequest, { params }: any) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('branches')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  return NextResponse.json({ data, error })
}

// DELETE
export async function DELETE(req: NextRequest, { params }: any) {
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', params.id)

  return NextResponse.json({ success: !error })
}