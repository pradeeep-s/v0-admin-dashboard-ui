import { NextResponse } from "next/server";
import { pool as sourcePool } from "@/lib/db";
import { pool as destPool } from "@/lib/destdb";
import { buildSafeQuery } from "@/lib/query-builders";

export async function POST(req: Request) {
  const {
    mode,
    table,
    destTable,
    queryId,
    variables,
    branchCode,
  } = await req.json();

  const sourceClient = await sourcePool.connect();
  const destClient = await destPool.connect();

  try {
    let finalQuery = "";
    let values: any[] = [];

    // =========================
    // VALIDATE TABLE NAMES
    // =========================
    if (!/^[a-zA-Z0-9_]+$/.test(destTable)) {
      throw new Error("Invalid destination table");
    }

    // =========================
    // AUTO MODE
    // =========================
    if (mode === "auto") {

      if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        throw new Error("Invalid source table");
      }

      // branch filter automatic
      if (branchCode) {
        finalQuery = `
          SELECT *
          FROM ${table}
          WHERE branch_id = $1
        `;

        values = [branchCode];

      } else {
        finalQuery = `SELECT * FROM ${table}`;
      }
    }

    // =========================
    // CUSTOM MODE
    // =========================
    if (mode === "custom") {

      const queryData = await sourceClient.query(
        `SELECT * FROM queries WHERE id = $1`,
        [queryId]
      );

      if (queryData.rows.length === 0) {
        throw new Error("Predefined query not found");
      }

      const savedQuery = queryData.rows[0];

      // AUTO inject branch_code variable
      const mergedVariables = {
        ...variables,
        branch_code: branchCode,
      };

      // BUILD SAFE QUERY
      const built = buildSafeQuery(
        savedQuery.query,
        mergedVariables
      );

      finalQuery = built.finalQuery;
      values = built.values;
    }

    // =========================
    // EXECUTE SOURCE QUERY
    // =========================
    const result = await sourceClient.query(
      finalQuery,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No data found",
      });
    }

    // =========================
    // GET COLUMNS
    // =========================
    const columns = Object.keys(result.rows[0]);

    // placeholders
    const placeholders = columns
      .map((_, i) => `$${i + 1}`)
      .join(",");

    // safer insert
    const insertQuery = `
      INSERT INTO ${destTable}
      (${columns.join(",")})
      VALUES (${placeholders})
    `;

    // =========================
    // TRANSACTION START
    // =========================
    await destClient.query("BEGIN");

    // =========================
    // INSERT ROWS
    // =========================
    for (const row of result.rows) {

      const vals = columns.map(
        (col) => row[col]
      );

      await destClient.query(
        insertQuery,
        vals
      );
    }

    // =========================
    // COMMIT
    // =========================
    await destClient.query("COMMIT");

    return NextResponse.json({
      success: true,
      copiedRows: result.rows.length,
      message: `Copied ${result.rows.length} rows successfully`,
    });

  } catch (err: any) {

    // rollback on failure
    await destClient.query("ROLLBACK");

    console.error(err);

    return NextResponse.json({
      success: false,
      error: err.message,
    });

  } finally {
    sourceClient.release();
    destClient.release();
  }
}