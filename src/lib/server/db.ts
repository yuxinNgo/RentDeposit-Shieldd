import { promises as fs } from "node:fs";
import path from "node:path";
import { createSeedData } from "@/lib/server/seed";
import type { AppDatabase } from "@/lib/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app-db.json");

let queue = Promise.resolve();

async function ensureDbFile() {
  await fs.mkdir(DB_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(createSeedData(), null, 2), "utf8");
  }
}

export async function readDb(): Promise<AppDatabase> {
  await queue;
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as AppDatabase;
}

export async function writeDb(next: AppDatabase) {
  await ensureDbFile();
  await fs.writeFile(DB_PATH, JSON.stringify(next, null, 2), "utf8");
}

export async function updateDb<T>(mutator: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });

  queue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}
