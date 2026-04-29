import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const formData = await request.formData()
  const file = formData.get('file')
  const branchId = formData.get('branchId')
  const moduleId = formData.get('moduleId')
  const schemeId = formData.get('schemeId')

  if (!file || !branchId || !moduleId || !schemeId) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Simulate file processing and generate mock result
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

  return NextResponse.json({
    success: true,
    data: {
      id: `UPL-${Date.now()}`,
      branchId,
      moduleId,
      schemeId,
      totalRows,
      successRows,
      failedRows,
      status,
      uploadedAt: new Date().toISOString(),
      fileName: (file as File).name,
      errorCount: failedRows,
    },
  })
}
