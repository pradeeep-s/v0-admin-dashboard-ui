import { getPooledClient } from '@/lib/supabase/pool'
import { NextRequest, NextResponse } from 'next/server'

// UPDATE
export async function PUT(req: NextRequest, { params }: any) {
  const supabase = await getPooledClient()
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
