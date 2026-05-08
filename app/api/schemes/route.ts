import { queryMany, queryOne, query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    let sqlQuery = 'SELECT id, module_id, name, code, description, is_active FROM public.schemes WHERE is_active = true'
    const params: any[] = []

    if (moduleId) {
      sqlQuery += ` AND module_id = $1`
      params.push(moduleId)
    }

    sqlQuery += ` ORDER BY name`

    const data = await queryMany<any>(sqlQuery, params.length > 0 ? params : undefined)

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('[v0] Schemes API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { moduleId, name, code, description } = body

    if (!moduleId || !name || !code) {
      return NextResponse.json(
        { success: false, message: 'Module ID, name, and code are required' },
        { status: 400 }
      )
    }

    const data = await queryOne<any>(
      `INSERT INTO public.schemes (module_id, name, code, description, is_active, created_at)
       VALUES ($1, $2, $3, $4, true, NOW())
       RETURNING id, module_id, name, code, description, is_active`,
      [moduleId, name, description || null]
    )

    if (!data) {
      console.error('[DB] Scheme creation error')
      return NextResponse.json(
        { success: false, message: 'Failed to create scheme' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Scheme created successfully',
      data,
    })
  } catch (error) {
    console.error('[DB] Scheme API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const data = await queryOne<any>(
      `UPDATE public.schemes 
       SET module_id = $1, name = $2, code = $3, description = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, module_id, name, code, description, is_active`,
      [body.moduleId, body.name, body.code, body.description || null, body.isActive, id]
    )

    return NextResponse.json({ success: !!data, data })
  } catch (error) {
    console.error('[DB] Scheme PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
