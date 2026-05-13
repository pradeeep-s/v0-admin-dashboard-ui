import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { queryMany } from '@/lib/db'

/**
 * GET /api/branch/modules
 * Get assigned modules for branch user
 */
export async function GET(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(request, 'modules', 'view')

  if (!authorized || user?.role !== 'Branch') {
    return error || NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    // Get modules assigned to this branch
    const modules = await queryMany<any>(
      `SELECT DISTINCT
        m.id, m.name, m.code, m.description, m.is_active as "isActive"
       FROM public.modules m
       INNER JOIN public.branch_modules bm ON m.id = bm.module_id
       WHERE bm.branch_user_id = $1 AND m.is_active = true
       ORDER BY m.name`,
      [user!.id]
    )

    return NextResponse.json({
      success: true,
      data: modules,
    })
  } catch (err) {
    console.error('[API] Branch modules GET error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}
