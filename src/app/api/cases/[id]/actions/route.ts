import { buildCaseRecord } from "@/lib/domain/case-machine";
import { readDb } from "@/lib/server/db";
import { runCaseAction } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";
import { caseActionSchema } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const payload = caseActionSchema.parse(body);
    const result = await runCaseAction(id, payload);
    const db = await readDb();
    return jsonOk({
      case: buildCaseRecord(db, result.case),
      txHash: result.txHash,
    });
  } catch (error) {
    return jsonError(error, "contract", id);
  }
}
