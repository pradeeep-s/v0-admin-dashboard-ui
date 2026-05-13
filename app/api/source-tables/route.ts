import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      ORDER BY table_name
    `);

    return NextResponse.json({
      tables: result.rows.map((r) => r.table_name),
    });
  } finally {
    client.release();
  }
}