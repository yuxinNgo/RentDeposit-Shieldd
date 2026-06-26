import { readDb } from "../../src/lib/server/db";
import { postgresQuery } from "../../src/lib/server/postgres";

async function main() {
  const versionResult = await postgresQuery<{ version: string }>("SELECT version()");
  const state = await readDb();

  console.log("Connected to Neon Postgres.");
  console.log(`Version: ${versionResult.rows[0]?.version ?? "unknown"}`);
  console.log(`Users: ${state.users.length}`);
  console.log(`Cases: ${state.cases.length}`);
  console.log(`Feedback: ${state.feedback.length}`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
