import { buildBootstrapPayload } from "@/lib/server/bootstrap";
import { createLevel5ProofSeedData, shouldHydrateLevel5Proof } from "@/lib/server/proof-seed";
import { createSeedData } from "@/lib/server/seed";

describe("bootstrap payload", () => {
  it("builds empty-state submission summary without seeded wallets", () => {
    const payload = buildBootstrapPayload(createSeedData());

    expect(payload.submission.uniqueWalletAddresses).toBe(0);
    expect(payload.submission.proofUsers).toHaveLength(0);
    expect(payload.dashboard.totalCases).toBe(0);
  });

  it("keeps the Level 5 proof list capped at 50 wallets", () => {
    const db = createSeedData();

    for (let index = 0; index < 55; index += 1) {
      const walletAddress = `G${String(index).padStart(55, "A")}`.slice(0, 56);
      db.users.push({
        id: `usr_${index}`,
        name: `Synthetic QA ${index}`,
        email: `qa${index}@rentdeposit.test`,
        role: "TENANT",
        walletAddress,
        onboardingCompleted: true,
        createdAt: "2026-07-04T00:00:00.000Z",
      });
      db.walletInteractions.push({
        id: `wallet_${index}`,
        walletAddress,
        action: "wallet_connected",
        success: true,
        createdAt: "2026-07-04T00:00:00.000Z",
      });
      db.feedback.push({
        id: `feedback_${index}`,
        role: "TENANT",
        walletAddress,
        rating: 5,
        workedWell: "EN: Clear flow. VI: Luong ro rang.",
        confusing: "EN: None. VI: Khong.",
        wouldUse: true,
        comment: "Synthetic Level 5 feedback.",
        contact: `qa${index}@rentdeposit.test`,
        createdAt: "2026-07-04T00:00:00.000Z",
      });
    }

    const payload = buildBootstrapPayload(db);

    expect(payload.submission.uniqueWalletAddresses).toBe(55);
    expect(payload.submission.proofUsers).toHaveLength(50);
    expect(payload.feedback).toHaveLength(50);
  });

  it("builds visible Level 5 proof data for an empty web database", () => {
    const empty = createSeedData();
    const db = createLevel5ProofSeedData();
    const payload = buildBootstrapPayload(db);

    expect(shouldHydrateLevel5Proof(empty)).toBe(true);
    expect(payload.users).toHaveLength(50);
    expect(payload.cases).toHaveLength(1);
    expect(payload.feedbackSummary.totalResponses).toBe(50);
    expect(payload.submission.uniqueWalletAddresses).toBe(50);
  });
});
