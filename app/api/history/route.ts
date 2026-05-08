import { queryMany } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const moduleId = searchParams.get('moduleId')

    let sqlQuery = `
      SELECT 
        u.id, u.user_id, u.username, u.branch_id, u.module_id, u.scheme_id, 
        u.file_name, u.total_rows, u.success_rows, u.failed_rows, u.status, u.created_at,
        b.name as branch_name, b.code as branch_code,
        m.name as module_name,
        s.name as scheme_name
      FROM public.uploads u
      LEFT JOIN public.branches b ON u.branch_id = b.id
      LEFT JOIN public.modules m ON u.module_id = m.id
      LEFT JOIN public.schemes s ON u.scheme_id = s.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      sqlQuery += ` AND u.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (moduleId) {
      sqlQuery += ` AND u.module_id = $${paramIndex}`
      params.push(moduleId)
      paramIndex++
    }

    sqlQuery += ` ORDER BY u.created_at DESC`

    const data = await queryMany<any>(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (err) {
    console.error('[DB] History error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}
