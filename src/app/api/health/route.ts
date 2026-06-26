import { NextResponse } from "next/server";
import { ensureDatabaseReady } from "@/lib/server/db";
import { postgresQuery } from "@/lib/server/postgres";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Healthcheck timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function GET() {
  try {
    await withTimeout(
      (async () => {
        await ensureDatabaseReady();
        await postgresQuery("SELECT 1");
      })(),
      5_000,
    );

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
        status: "degraded",
        database: "unreachable",
        message: error instanceof Error ? error.message : "Unknown healthcheck failure",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
