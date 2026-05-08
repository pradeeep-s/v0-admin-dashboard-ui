import { pool } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// UPDATE
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json()
  const { id } = await params

  const client = await pool.connect()

  try {
    const result = await client.query(
      `UPDATE branches
       SET name = $1, code = $2, location = $3
       WHERE id = $4
       RETURNING *`,
      [body.name, body.code, body.location, id]
    )

    return NextResponse.json({
      data: result.rows[0],
      error: null,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const client = await pool.connect()

  try {
    await client.query(
      `DELETE FROM branches
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    return NextResponse.json({
      success: true,
      error: null,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
