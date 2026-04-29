import { NextResponse } from 'next/server'
import {
  mockColumnMappings,
  mockValidationRules,
} from '@/lib/mock-data'

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const schemeId = searchParams.get('schemeId')

  if (type === 'column-mappings') {
    let data = mockColumnMappings

    if (schemeId) {
      data = data.filter((item) => item.schemeId === schemeId)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  }

  if (type === 'validation-rules') {
    let data = mockValidationRules

    if (schemeId) {
      data = data.filter((item) => item.schemeId === schemeId)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  }

  return NextResponse.json(
    { success: false, error: 'Invalid type parameter' },
    { status: 400 }
  )
}

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const body = await request.json()
  const { type } = body

  let newItem
  if (type === 'column-mapping') {
    newItem = {
      id: `COL-${Date.now()}`,
      ...body,
    }
  } else if (type === 'validation-rule') {
    newItem = {
      id: `VAL-${Date.now()}`,
      ...body,
    }
  }

  return NextResponse.json({
    success: true,
    data: newItem,
  })
}
