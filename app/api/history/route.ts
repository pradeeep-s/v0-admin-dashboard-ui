import { mockUploadHistory } from '@/lib/mock-data'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branchId')
  const moduleId = searchParams.get('moduleId')

  let data = mockUploadHistory

  if (branchId) {
    data = data.filter((item) => item.branchId === branchId)
  }

  if (moduleId) {
    data = data.filter((item) => item.moduleId === moduleId)
  }

  // Sort by uploaded date descending
  data = data.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )

  return NextResponse.json({
    success: true,
    data,
  })
}
