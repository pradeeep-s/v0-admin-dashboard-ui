import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { dbConfig } = await req.json();

  const client = await pool.connect();

  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
  `);

  client.release();

  return NextResponse.json(result.rows);
}