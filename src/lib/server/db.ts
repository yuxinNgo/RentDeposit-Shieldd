import { createLevel5ProofSeedData, shouldHydrateLevel5Proof } from "@/lib/server/proof-seed";
import { postgresQuery, withPostgresClient } from "@/lib/server/postgres";
import type { AppDatabase } from "@/lib/types";

const APP_STATE_ID = "primary";

declare global {
  var __rentDepositDbReady: Promise<void> | undefined;
}

function normalizeState(value: unknown): AppDatabase {
  if (typeof value === "string") {
    return JSON.parse(value) as AppDatabase;
  }

  return value as AppDatabase;
}

async function initializeDatabase() {
  await withPostgresClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          id TEXT PRIMARY KEY,
          state JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(
        `
          INSERT INTO app_state (id, state)
          VALUES ($1, $2::jsonb)
          ON CONFLICT (id) DO NOTHING
        `,
        [APP_STATE_ID, JSON.stringify(createLevel5ProofSeedData())],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function ensureDatabaseReady() {
  if (!globalThis.__rentDepositDbReady) {
    globalThis.__rentDepositDbReady = initializeDatabase().catch((error) => {
      globalThis.__rentDepositDbReady = undefined;
      throw error;
    });
  }

  await globalThis.__rentDepositDbReady;
}

export async function readDb(): Promise<AppDatabase> {
  await ensureDatabaseReady();
  const result = await postgresQuery<{ state: unknown }>("SELECT state FROM app_state WHERE id = $1", [APP_STATE_ID]);
  const row = result.rows[0];

  if (!row) {
    throw new Error("Database state row is missing.");
  }

  const db = normalizeState(row.state);

  if (shouldHydrateLevel5Proof(db)) {
    const seeded = createLevel5ProofSeedData();
    await writeDb(seeded);
    return seeded;
  }

  return db;
}

export async function writeDb(next: AppDatabase) {
  await ensureDatabaseReady();
  await postgresQuery(
    `
      UPDATE app_state
      SET state = $2::jsonb, updated_at = NOW()
      WHERE id = $1
    `,
    [APP_STATE_ID, JSON.stringify(next)],
  );
}

export async function updateDb<T>(mutator: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  await ensureDatabaseReady();

  return withPostgresClient(async (client) => {
    await client.query("BEGIN");

    try {
      const result = await client.query<{ state: unknown }>(
        "SELECT state FROM app_state WHERE id = $1 FOR UPDATE",
        [APP_STATE_ID],
      );
      const row = result.rows[0];

      if (!row) {
        throw new Error("Database state row is missing.");
      }

      const state = normalizeState(row.state);
      const db = shouldHydrateLevel5Proof(state) ? createLevel5ProofSeedData() : state;
      const output = await mutator(db);

      await client.query(
        `
          UPDATE app_state
          SET state = $2::jsonb, updated_at = NOW()
          WHERE id = $1
        `,
        [APP_STATE_ID, JSON.stringify(db)],
      );

      await client.query("COMMIT");
      return output;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}
