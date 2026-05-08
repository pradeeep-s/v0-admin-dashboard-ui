import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET all branches
export async function GET() {
  const client = await pool.connect()
  const result = await client.query(
    "SELECT * FROM branches ORDER BY created_at DESC"
  )

  return NextResponse.json({
    data: result.rows,
    error: null,
  })
}

// CREATE branch
export async function POST(req: NextRequest) {
  const body = await req.json()

  const client = await pool.connect()
  const result = await client.query(
    `INSERT INTO branches (name, code, location)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [body.name, body.code, body.location]
  )

  return NextResponse.json({
    data: result.rows[0],
    error: null,
  })
}