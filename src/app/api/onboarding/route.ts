import { completeOnboarding } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = onboardingSchema.parse(body);
    const user = await completeOnboarding(payload);
    return jsonOk(user);
  } catch (error) {
    return jsonError(error, "api");
  }
}
