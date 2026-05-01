import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: any) {
  const supabase = await createClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('schemes')
    .update({
      module_id: body.moduleId,
      name: body.name,
      code: body.code,
      description: body.description,
      is_active: body.isActive,
    })
    .eq('id', params.id)
    .select()
    .single()

  return NextResponse.json({ success: !error, data })
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { id } = await context.params  // ✅ FIX

  await supabase.from('schemes').delete().eq('id', id)

  return NextResponse.json({ success: true })
}