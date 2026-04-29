import { mockSchemes } from '@/lib/mock-data'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')

  let data = mockSchemes

  if (moduleId) {
    data = mockSchemes.filter((scheme) => scheme.moduleId === moduleId)
  }

  return NextResponse.json({
    success: true,
    data,
  })
}

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const body = await request.json()

  const newScheme = {
    id: `SCH-${Date.now()}`,
    ...body,
    isActive: true,
  }

  return NextResponse.json({
    success: true,
    data: newScheme,
  })
}
