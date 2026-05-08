import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await context.params
  const body = await req.json()

  const { data, error } = await supabase
    .from('modules')
    .update({
      name: body.name,
      code: body.code,
      description: body.description,
      is_active: body.isActive,
    })
    .eq('id', id)
    .select()
    .single()

  return NextResponse.json({ success: !error, data })
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await context.params


  await supabase.from('modules').delete().eq('id', id)
  
console.log('Deleting DB ID:', id)

  return NextResponse.json({ success: true })
}