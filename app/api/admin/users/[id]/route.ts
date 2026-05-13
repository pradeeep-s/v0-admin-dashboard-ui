import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { queryOne, query } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/users/[id]
 * Update user (Admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { user, authorized, error } = await requirePermission(request, 'users', 'edit')

  if (!authorized) {
    return error!
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { role, branchId, isActive } = body

    const updatedUser = await queryOne<any>(
      `UPDATE public.users 
       SET role = $1, branch_id = $2, is_active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, username, email, role, branch_id as "branchId", is_active as "isActive"`,
      [role, branchId || null, isActive, id]
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    })
  } catch (err) {
    console.error('[API] User PUT error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { user, authorized, error } = await requirePermission(request, 'users', 'delete')

  if (!authorized) {
    return error!
  }

  try {
    const { id } = await params

    // Soft delete: mark as inactive instead of hard delete
    const result = await query(
      'UPDATE public.users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (err) {
    console.error('[API] User DELETE error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
