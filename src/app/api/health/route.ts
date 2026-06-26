import { NextResponse } from "next/server";
import { ensureDatabaseReady } from "@/lib/server/db";
import { postgresQuery } from "@/lib/server/postgres";

export async function GET() {
  try {
    await ensureDatabaseReady();
    await postgresQuery("SELECT 1");

    return NextResponse.json(
      {
        status: "ok",
        database: "reachable",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        message: error instanceof Error ? error.message : "Unknown healthcheck failure",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
