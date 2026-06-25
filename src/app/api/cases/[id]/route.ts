import { getCaseById } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const caseRecord = await getCaseById(id);

    if (!caseRecord) {
      return new Response(JSON.stringify({ error: "Case not found." }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return jsonOk(caseRecord);
  } catch (error) {
    return jsonError(error, "api");
  }
}
