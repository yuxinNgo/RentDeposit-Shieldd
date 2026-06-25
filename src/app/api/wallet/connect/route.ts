import { connectWallet } from "@/lib/server/repository";
import { jsonError, jsonOk } from "@/lib/server/http";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = onboardingSchema.partial({ name: true, email: true }).extend({
      role: onboardingSchema.shape.role,
      walletAddress: onboardingSchema.shape.walletAddress,
    }).parse(body);

    const user = await connectWallet(
      payload.role,
      payload.walletAddress,
      payload.name,
      payload.email,
    );
    return jsonOk(user);
  } catch (error) {
    return jsonError(error, "wallet");
  }
}
