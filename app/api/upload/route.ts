import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const branchId = formData.get('branchId') as string
    const moduleId = formData.get('moduleId') as string
    const schemeId = formData.get('schemeId') as string

    if (!file || !branchId || !moduleId || !schemeId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate file processing
    const totalRows = Math.floor(Math.random() * 2000) + 500
    const successRate = Math.random()
    const successRows = Math.floor(totalRows * successRate)
    const failedRows = totalRows - successRows

    let status: 'success' | 'partial' | 'failed' = 'success'
    if (failedRows === 0) {
      status = 'success'
    } else if (failedRows < totalRows * 0.25) {
      status = 'partial'
    } else {
      status = 'failed'
    }

    // Save upload record to database
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert([
        {
          user_id: user.id,
          branch_id: branchId,
          module_id: moduleId,
          scheme_id: schemeId,
          file_name: file.name,
          file_size: file.size,
          total_rows: totalRows,
          success_rows: successRows,
          failed_rows: failedRows,
          status,
        },
      ])
      .select()

    if (uploadError) {
      console.error('[v0] Upload record creation error:', uploadError)
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 400 }
      )
    }

    // Simulate adding errors if there are failures
    if (failedRows > 0) {
      const errorTypes = ['Invalid format', 'Missing required field', 'Out of range', 'Duplicate entry']
      const errors = []
      for (let i = 0; i < Math.min(failedRows, 50); i++) {
        errors.push({
          upload_id: uploadData[0].id,
          row_number: Math.floor(Math.random() * totalRows) + 1,
          column_name: ['Name', 'Email', 'Phone', 'Amount', 'Date'][Math.floor(Math.random() * 5)],
          error_message: errorTypes[Math.floor(Math.random() * errorTypes.length)],
          error_type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
        })
      }

      const { error: errorsInsertError } = await supabase
        .from('upload_errors')
        .insert(errors)

      if (errorsInsertError) {
        console.error('[v0] Error records creation error:', errorsInsertError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: uploadData[0].id,
        branchId,
        moduleId,
        schemeId,
        totalRows,
        successRows,
        failedRows,
        status,
        uploadedAt: uploadData[0].created_at,
        fileName: file.name,
        errorCount: failedRows,
      },
    })
  } catch (error) {
    console.error('[v0] Upload API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
