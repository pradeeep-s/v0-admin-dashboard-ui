import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const moduleId = searchParams.get('moduleId')

   let query = supabase
  .from('uploads')
  .select(`
    id, user_id, username, branch_id, module_id, scheme_id, file_name,
    total_rows, success_rows, failed_rows, status, created_at,
    branches!fk_branch(name, code),
    modules!fk_module(name),
    schemes(name)
  `)
  .order('created_at', { ascending: false })

    if (branchId) query = query.eq('branch_id', branchId)
    if (moduleId) query = query.eq('module_id', moduleId)

    const { data, error } = await query

    if (error) {
      console.error('History error:', error)
      return NextResponse.json(
        { success: false, message: error.message, data: [] },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}