import { getBootstrapPayload, submitFeedback } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";
import { feedbackSchema } from "@/lib/validation";

export async function GET() {
  try {
    const payload = await getBootstrapPayload();
    return jsonOk(payload.feedback);
  } catch (error) {
    return jsonError(error, "api");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = feedbackSchema.parse(body);
    const feedback = await submitFeedback(payload);
    return jsonOk(feedback);
  } catch (error) {
    return jsonError(error, "api");
  }
}
