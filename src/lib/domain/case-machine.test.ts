import { performCaseAction } from "@/lib/domain/case-machine";
import { createSeedData } from "@/lib/server/seed";
import type { AppDatabase } from "@/lib/types";

function createdCase(db: AppDatabase) {
  const template = db.cases[0];
  const wallet = db.users.find((entry) => entry.role === "TENANT")!.walletAddress;
  const landlord = db.users.find((entry) => entry.role === "LANDLORD")!.walletAddress;
  const mediator = db.users.find((entry) => entry.role === "MEDIATOR")!.walletAddress;

  const entry = {
    ...template,
    id: "case_created_test",
    status: "CREATED" as const,
    fundTxHash: undefined,
    releaseTxHash: undefined,
    tenantWalletAddress: wallet,
    landlordWalletAddress: landlord,
    mediatorWalletAddress: mediator,
  };

  db.cases.unshift(entry);
  return entry;
}

describe("case machine", () => {
  it("funds a created case and stores the tx hash", () => {
    const db = createSeedData();
    const entry = createdCase(db);

    const result = performCaseAction(db, entry.id, {
      type: "FUND_DEPOSIT",
      actorRole: "TENANT",
      actorWallet: entry.tenantWalletAddress,
    });

    expect(result.case.status).toBe("FUNDED");
    expect(result.txHash).toBeTruthy();
  });

  it("blocks refund request without move-out evidence", () => {
    const db = createSeedData();
    const entry = db.cases.find((caseItem) => caseItem.id === "case_orchard_flat")!;

    performCaseAction(db, entry.id, {
      type: "CONFIRM_MOVE_IN",
      actorRole: "LANDLORD",
      actorWallet: entry.landlordWalletAddress,
    });

    expect(() =>
      performCaseAction(db, entry.id, {
        type: "REQUEST_REFUND",
        actorRole: "TENANT",
        actorWallet: entry.tenantWalletAddress,
      }),
    ).toThrow("Upload move-out evidence before requesting a refund.");
  });

  it("blocks dispute resolution that exceeds the deposit total", () => {
    const db = createSeedData();
    const entry = db.cases.find((caseItem) => caseItem.id === "case_atlas_loft")!;

    expect(() =>
      performCaseAction(db, entry.id, {
        type: "RESOLVE_DISPUTE",
        actorRole: "MEDIATOR",
        actorWallet: entry.mediatorWalletAddress,
        tenantAmount: 1700,
        landlordAmount: 400,
        resolutionNote: "Amounts exceed deposit",
      }),
    ).toThrow("Resolution split cannot exceed the deposit amount.");
  });

  it("accepts a deduction and closes the case", () => {
    const db = createSeedData();
    const entry = db.cases.find((caseItem) => caseItem.id === "case_atlas_loft")!;
    entry.status = "DEDUCTION_PROPOSED";

    const result = performCaseAction(db, entry.id, {
      type: "ACCEPT_DEDUCTION",
      actorRole: "TENANT",
      actorWallet: entry.tenantWalletAddress,
    });

    expect(result.case.status).toBe("CLOSED");
    expect(result.txHash).toBeTruthy();
  });
});
