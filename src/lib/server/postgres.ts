import path from "node:path";
import { Pool, type PoolClient, type QueryResult } from "pg";

declare global {
  var __rentDepositPool: Pool | undefined;
}

function loadEnvFileIfAvailable(path: string) {
  const runtimeProcess = process as typeof process & {
    loadEnvFile?: (filePath?: string) => void;
  };

  if (typeof runtimeProcess.loadEnvFile !== "function") {
    return;
  }

  try {
    runtimeProcess.loadEnvFile(path);
  } catch {
    // Ignore missing local env files in production-like environments.
  }
}

function loadEnvironmentFromCommonLocations() {
  const cwd = process.cwd();
  const candidates = [
    ".env.local",
    ".env",
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(cwd, "..", ".env.local"),
    path.join(cwd, "..", ".env"),
    path.join(cwd, "..", "..", ".env.local"),
    path.join(cwd, "..", "..", ".env"),
  ];

  for (const candidate of candidates) {
    loadEnvFileIfAvailable(candidate);
  }
}

function databaseUrl() {
  if (!process.env.DATABASE_URL) {
    loadEnvironmentFromCommonLocations();
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured. Set it in your environment or .env.local before using the app API.");
  }

  if (url.includes("sslmode=require") && !url.includes("uselibpqcompat=") && !url.includes("sslmode=verify-full")) {
    return `${url}&uselibpqcompat=true`;
  }

  return url;
}

export function getPool() {
  if (!globalThis.__rentDepositPool) {
    globalThis.__rentDepositPool = new Pool({
      connectionString: databaseUrl(),
      max: 4,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalThis.__rentDepositPool;
}

export async function withPostgresClient<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function postgresQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) {
  const result = (await getPool().query(text, values)) as QueryResult<T>;
  return result;
}
