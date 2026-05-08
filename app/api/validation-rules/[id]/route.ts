import { getPooledClient } from '@/lib/supabase/pool'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await getPooledClient()

  const body = await request.json()

  const { data, error } = await supabase
    .from('validation_rules')
    .update(body)
    .eq('id', id)
    .select()

  if (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    })
  }

  return NextResponse.json({
    success: true,
    data: data[0],
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await getPooledClient()

  const { error } = await supabase
    .from('validation_rules')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    })
  }

  return NextResponse.json({
    success: true,
  })
}
