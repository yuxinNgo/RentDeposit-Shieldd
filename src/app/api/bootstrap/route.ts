import { getBootstrapPayload } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function GET() {
  try {
    const payload = await getBootstrapPayload();
    return jsonOk(payload);
  } catch (error) {
    return jsonError(error, "api");
  }
}
