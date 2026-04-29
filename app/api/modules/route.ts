import { mockModules } from '@/lib/mock-data'
import { NextResponse } from 'next/server'

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: mockModules,
  })
}

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const body = await request.json()

  const newModule = {
    id: `MOD-${Date.now()}`,
    ...body,
    isActive: true,
  }

  return NextResponse.json({
    success: true,
    data: newModule,
  })
}
