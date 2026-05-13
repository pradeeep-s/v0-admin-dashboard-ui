import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-auth'
import { queryOne, query } from '@/lib/db'

/**
 * POST /api/operator/upload
 * Upload file with validation (Operator only)
 */
export async function POST(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(request, 'uploads', 'create')

  if (!authorized) {
    return error!
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const moduleId = formData.get('moduleId') as string
    const branchId = user?.branchId

    if (!file || !moduleId) {
      return NextResponse.json(
        { success: false, message: 'File and moduleId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only Excel and CSV files are allowed.' },
        { status: 400 }
      )
    }

    // Check if operator has access to this module
    const moduleAccess = await queryOne<any>(
      `SELECT om.id FROM public.operator_modules om
       WHERE om.operator_user_id = $1 AND om.module_id = $2`,
      [user!.id, moduleId]
    )

    if (!moduleAccess) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this module' },
        { status: 403 }
      )
    }

    // Create upload record
    const uploadId = crypto.randomUUID()
    const uploadRecord = await queryOne<any>(
      `INSERT INTO public.uploads 
       (id, user_id, username, branch_id, module_id, file_name, file_size, total_rows, success_rows, failed_rows, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING id, user_id as "userId", file_name as "fileName", status`,
      [
        uploadId,
        user!.id,
        user!.username,
        branchId,
        moduleId,
        file.name,
        file.size,
        0, // Total rows will be updated after validation
        0, // Success rows
        0, // Failed rows
        'pending',
      ]
    )

    if (!uploadRecord) {
      return NextResponse.json(
        { success: false, message: 'Failed to create upload record' },
        { status: 500 }
      )
    }

    // TODO: Process file asynchronously
    // - Parse Excel/CSV
    // - Validate rows against module columns and validation rules
    // - Insert valid rows
    // - Store errors
    // - Update upload record with counts

    return NextResponse.json(
      {
        success: true,
        message: 'Upload initiated',
        data: uploadRecord,
      },
      { status: 202 }
    )
  } catch (err) {
    console.error('[API] Upload POST error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/operator/upload
 * Get operator's upload history
 */
export async function GET(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(request, 'uploads', 'view')

  if (!authorized) {
    return error!
  }

  try {
    const uploads = await queryMany<any>(
      `SELECT 
        id, user_id as "userId", username, module_id as "moduleId",
        file_name as "fileName", total_rows as "totalRows", 
        success_rows as "successRows", failed_rows as "failedRows",
        status, created_at as "createdAt"
       FROM public.uploads
       WHERE user_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [user!.id, user!.id]
    )

    return NextResponse.json({
      success: true,
      data: uploads,
    })
  } catch (err) {
    console.error('[API] Upload GET error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch uploads' },
      { status: 500 }
    )
  }
}
