import { mockBranches } from '@/lib/mock-data'
import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: mockBranches,
  })
}
