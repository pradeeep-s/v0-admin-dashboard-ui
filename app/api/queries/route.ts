import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET all queries
export async function GET() {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT * FROM queries ORDER BY created_at DESC"
    );

    return NextResponse.json({
      data: result.rows,
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json({
      data: null,
      error: error.message,
    });
  } finally {
    client.release();
  }
}

// SAVE query
export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const { name, query, description, variables } = body;

    // Allow only SELECT queries
    if (!query.toLowerCase().trim().startsWith("select")) {
      return NextResponse.json({
        error: "Only SELECT queries are allowed",
      });
    }

    const parsedVariables =
      typeof variables === "string"
        ? JSON.parse(variables)
        : variables || {};

    const result = await client.query(
      `
      INSERT INTO queries (name, query, description, variables)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, query, description, parsedVariables]
    );

    return NextResponse.json({
      message: "Query saved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    });
  } finally {
    client.release();
  }
}