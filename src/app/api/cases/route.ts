import { getBootstrapPayload, createCase } from "@/lib/server/repository";
import { createCaseSchema } from "@/lib/validation";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function GET() {
  try {
    const payload = await getBootstrapPayload();
    return jsonOk(payload.cases);
  } catch (error) {
    return jsonError(error, "api");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createCaseSchema.parse(body);
    const createdCase = await createCase(payload);
    return jsonOk(createdCase);
  } catch (error) {
    return jsonError(error, "api");
  }
}
