import { buildBootstrapPayload } from "@/lib/server/bootstrap";
import { createSeedData } from "@/lib/server/seed";

describe("bootstrap payload", () => {
  it("builds empty-state submission summary without seeded wallets", () => {
    const payload = buildBootstrapPayload(createSeedData());

    expect(payload.submission.uniqueWalletAddresses).toBe(0);
    expect(payload.submission.proofUsers).toHaveLength(0);
    expect(payload.dashboard.totalCases).toBe(0);
  });
});
