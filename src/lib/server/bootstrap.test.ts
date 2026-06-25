import { buildBootstrapPayload } from "@/lib/server/bootstrap";
import { createSeedData } from "@/lib/server/seed";

describe("bootstrap payload", () => {
  it("builds proof users and submission summary", () => {
    const payload = buildBootstrapPayload(createSeedData());

    expect(payload.submission.uniqueWalletAddresses).toBeGreaterThanOrEqual(10);
    expect(payload.submission.proofUsers).toHaveLength(10);
    expect(payload.dashboard.totalCases).toBeGreaterThan(0);
  });
});
