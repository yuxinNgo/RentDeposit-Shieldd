import { performCaseAction } from "@/lib/domain/case-machine";
import { createSeedData } from "@/lib/server/seed";
import type { RentalDepositCase, User } from "@/lib/types";

function wallet(seed: string) {
  return `G${seed.padEnd(55, "A").slice(0, 55)}`;
}

function makeUser(role: User["role"], walletAddress: string): User {
  return {
    id: `usr_${role.toLowerCase()}`,
    name: `${role} User`,
    email: `${role.toLowerCase()}@example.com`,
    role,
    walletAddress,
    onboardingCompleted: true,
    createdAt: "2026-06-26T00:00:00.000Z",
  };
}

function makeCase(overrides: Partial<RentalDepositCase> = {}): RentalDepositCase {
  return {
    id: "case_test",
    propertyName: "Atlas Loft 04B",
    propertyAddress: "41 Harbor Street, Newark",
    tenantName: "Tenant User",
    tenantWalletAddress: wallet("TENANT"),
    landlordName: "Landlord User",
    landlordWalletAddress: wallet("LANDLORD"),
    mediatorWalletAddress: wallet("MEDIATOR"),
    depositAmount: 1800,
    assetCode: "USDC",
    status: "CREATED",
    contractAddress: "CCASETESTCONTRACTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    rentalStartDate: "2026-07-01",
    rentalEndDate: "2026-12-31",
    depositTerms: "Deposit stays in escrow until the workflow completes.",
    deductionTerms: "Deductions require evidence and tenant review.",
    createdAt: "2026-06-26T00:00:00.000Z",
    updatedAt: "2026-06-26T00:00:00.000Z",
    ...overrides,
  };
}

function makeDb() {
  const db = createSeedData();
  const tenantWallet = wallet("TENANT");
  const landlordWallet = wallet("LANDLORD");
  const mediatorWallet = wallet("MEDIATOR");

  db.users.push(
    makeUser("TENANT", tenantWallet),
    makeUser("LANDLORD", landlordWallet),
    makeUser("MEDIATOR", mediatorWallet),
  );

  return {
    db,
    tenantWallet,
    landlordWallet,
    mediatorWallet,
  };
}

describe("case machine", () => {
  it("funds a created case and stores the real tx hash", () => {
    const { db, tenantWallet, landlordWallet, mediatorWallet } = makeDb();
    const entry = makeCase({
      tenantWalletAddress: tenantWallet,
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
    });

    db.cases.unshift(entry);

    const result = performCaseAction(db, entry.id, {
      type: "FUND_DEPOSIT",
      actorRole: "TENANT",
      actorWallet: entry.tenantWalletAddress,
      txHash: "fund_tx_hash_123",
      resultingStatus: "FUNDED",
    });

    expect(result.case.status).toBe("FUNDED");
    expect(result.txHash).toBe("fund_tx_hash_123");
    expect(result.case.fundTxHash).toBe("fund_tx_hash_123");
  });

  it("blocks refund request without move-out evidence", () => {
    const { db, tenantWallet, landlordWallet, mediatorWallet } = makeDb();
    const entry = makeCase({
      status: "FUNDED",
      tenantWalletAddress: tenantWallet,
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
    });

    db.cases.unshift(entry);
    db.evidences.unshift({
      id: "ev_move_in",
      caseId: entry.id,
      phase: "MOVE_IN",
      category: "photos",
      fileName: "move-in.jpg",
      fileUrl: "/evidence/move-in.jpg",
      fileHash: "hash_move_in",
      description: "Move-in proof",
      uploadedByRole: "TENANT",
      uploadedByWallet: tenantWallet,
      createdAt: "2026-06-26T00:05:00.000Z",
    });

    performCaseAction(db, entry.id, {
      type: "CONFIRM_MOVE_IN",
      actorRole: "LANDLORD",
      actorWallet: entry.landlordWalletAddress,
      txHash: "confirm_tx_hash_123",
      resultingStatus: "MOVE_IN_CONFIRMED",
    });

    expect(() =>
      performCaseAction(db, entry.id, {
        type: "REQUEST_REFUND",
        actorRole: "TENANT",
        actorWallet: entry.tenantWalletAddress,
        txHash: "refund_tx_hash_123",
        resultingStatus: "REFUND_REQUESTED",
      }),
    ).toThrow("Upload move-out evidence before requesting a refund.");
  });

  it("blocks dispute resolution that exceeds the deposit total", () => {
    const { db, tenantWallet, landlordWallet, mediatorWallet } = makeDb();
    const entry = makeCase({
      status: "DISPUTED",
      tenantWalletAddress: tenantWallet,
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
    });

    db.cases.unshift(entry);
    db.disputes.unshift({
      id: "dispute_1",
      caseId: entry.id,
      openedByRole: "TENANT",
      reason: "Need mediation",
      status: "OPEN",
      createdAt: "2026-06-26T00:10:00.000Z",
    });

    expect(() =>
      performCaseAction(db, entry.id, {
        type: "RESOLVE_DISPUTE",
        actorRole: "MEDIATOR",
        actorWallet: entry.mediatorWalletAddress,
        tenantAmount: 1700,
        landlordAmount: 400,
        resolutionNote: "Amounts exceed deposit",
        txHash: "resolve_tx_hash_123",
        resultingStatus: "CLOSED",
      }),
    ).toThrow("Resolution split cannot exceed the deposit amount.");
  });

  it("accepts a deduction and keeps the contract-aligned terminal status", () => {
    const { db, tenantWallet, landlordWallet, mediatorWallet } = makeDb();
    const entry = makeCase({
      status: "DEDUCTION_PROPOSED",
      tenantWalletAddress: tenantWallet,
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
    });

    db.cases.unshift(entry);
    db.deductionProposals.unshift({
      id: "deduction_1",
      caseId: entry.id,
      amount: 250,
      reason: "Cleaning",
      evidenceIds: [],
      status: "PROPOSED",
      createdAt: "2026-06-26T00:15:00.000Z",
    });

    const result = performCaseAction(db, entry.id, {
      type: "ACCEPT_DEDUCTION",
      actorRole: "TENANT",
      actorWallet: entry.tenantWalletAddress,
      txHash: "deduction_tx_hash_123",
      resultingStatus: "PARTIALLY_REFUNDED",
    });

    expect(result.case.status).toBe("PARTIALLY_REFUNDED");
    expect(result.txHash).toBe("deduction_tx_hash_123");
  });
});
