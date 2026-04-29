import { mockErrors } from '@/lib/mock-data'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get('uploadId')
  const columnName = searchParams.get('columnName')
  const errorType = searchParams.get('errorType')

  let data = mockErrors

  if (uploadId) {
    data = data.filter((error) => error.uploadId === uploadId)
  }

  if (columnName) {
    data = data.filter((error) =>
      error.columnName.toLowerCase().includes(columnName.toLowerCase())
    )
  }

  if (errorType) {
    data = data.filter((error) => error.errorType === errorType)
  }

  return NextResponse.json({
    success: true,
    data,
  })
}
