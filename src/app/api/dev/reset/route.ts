import { jsonError, jsonOk } from "@/lib/server/http";
import { resetDatabase } from "@/lib/server/repository";

export async function POST() {
  try {
    const payload = await resetDatabase();
    return jsonOk(payload);
  } catch (error) {
    return jsonError(error, "api");
  }
}
