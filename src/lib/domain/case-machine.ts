import { DEMO_CONTRACT_ADDRESS } from "@/lib/constants";
import { createMockHash } from "@/lib/utils";
import type {
  AnalyticsEvent,
  AppDatabase,
  AuditLog,
  CaseRecord,
  DeductionProposal,
  Dispute,
  EvidenceFile,
  RentalDepositCase,
  UserRole,
  WalletInteraction,
} from "@/lib/types";

type ActionInput =
  | {
      type: "FUND_DEPOSIT";
      actorRole: "TENANT";
      actorWallet: string;
    }
  | {
      type: "UPLOAD_EVIDENCE";
      actorRole: UserRole;
      actorWallet: string;
      phase: "MOVE_IN" | "MOVE_OUT" | "DISPUTE";
      category: string;
      fileName: string;
      description: string;
    }
  | {
      type: "CONFIRM_MOVE_IN";
      actorRole: "TENANT" | "LANDLORD";
      actorWallet: string;
    }
  | {
      type: "REQUEST_REFUND";
      actorRole: "TENANT";
      actorWallet: string;
    }
  | {
      type: "APPROVE_FULL_REFUND";
      actorRole: "LANDLORD";
      actorWallet: string;
    }
  | {
      type: "PROPOSE_DEDUCTION";
      actorRole: "LANDLORD";
      actorWallet: string;
      amount: number;
      reason: string;
      evidenceIds: string[];
    }
  | {
      type: "ACCEPT_DEDUCTION";
      actorRole: "TENANT";
      actorWallet: string;
    }
  | {
      type: "OPEN_DISPUTE";
      actorRole: "TENANT" | "LANDLORD";
      actorWallet: string;
      reason: string;
    }
  | {
      type: "RESOLVE_DISPUTE";
      actorRole: "MEDIATOR";
      actorWallet: string;
      tenantAmount: number;
      landlordAmount: number;
      resolutionNote: string;
    };

export interface ActionResult {
  case: RentalDepositCase;
  txHash?: string;
}

function now() {
  return new Date().toISOString();
}

function findCaseOrThrow(db: AppDatabase, caseId: string) {
  const targetCase = db.cases.find((entry) => entry.id === caseId);

  if (!targetCase) {
    throw new Error("Case not found.");
  }

  return targetCase;
}

function recordAudit(
  db: AppDatabase,
  caseId: string,
  actorRole: UserRole,
  actorWallet: string,
  action: string,
  message: string,
  txHash?: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const auditEntry: AuditLog = {
    id: `audit_${crypto.randomUUID()}`,
    caseId,
    actorRole,
    actorWallet,
    action,
    message,
    txHash,
    metadata,
    createdAt: now(),
  };

  db.auditLogs.unshift(auditEntry);
}

function recordWalletInteraction(
  db: AppDatabase,
  walletAddress: string,
  action: string,
  success: boolean,
  caseId?: string,
  txHash?: string,
  errorMessage?: string,
) {
  const interaction: WalletInteraction = {
    id: `wallet_${crypto.randomUUID()}`,
    walletAddress,
    action,
    txHash,
    contractAddress: DEMO_CONTRACT_ADDRESS,
    caseId,
    success,
    errorMessage,
    createdAt: now(),
  };

  db.walletInteractions.unshift(interaction);
}

function recordEvent(
  db: AppDatabase,
  eventName: string,
  userRole: UserRole,
  walletAddress: string,
  path: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const event: AnalyticsEvent = {
    id: `event_${crypto.randomUUID()}`,
    eventName,
    userRole,
    walletAddress,
    path,
    metadata,
    createdAt: now(),
  };

  db.analyticsEvents.unshift(event);
}

function createEvidence(
  db: AppDatabase,
  caseId: string,
  actorRole: UserRole,
  actorWallet: string,
  phase: EvidenceFile["phase"],
  category: string,
  fileName: string,
  description: string,
) {
  const evidence: EvidenceFile = {
    id: `evidence_${crypto.randomUUID()}`,
    caseId,
    phase,
    category,
    fileName,
    description,
    fileUrl: `/evidence/${fileName.replaceAll(" ", "-").toLowerCase()}`,
    fileHash: createMockHash("evidence"),
    uploadedByRole: actorRole,
    uploadedByWallet: actorWallet,
    createdAt: now(),
  };

  db.evidences.unshift(evidence);
  return evidence;
}

function assertRole(actual: UserRole, expected: UserRole | UserRole[]) {
  const allowed = Array.isArray(expected) ? expected : [expected];

  if (!allowed.includes(actual)) {
    throw new Error("This role cannot perform the requested action.");
  }
}

function assertStatus(
  current: RentalDepositCase["status"],
  allowed: RentalDepositCase["status"] | RentalDepositCase["status"][],
) {
  const allowedStatuses = Array.isArray(allowed) ? allowed : [allowed];

  if (!allowedStatuses.includes(current)) {
    throw new Error(`Invalid status transition from ${current}.`);
  }
}

export function buildCaseRecord(db: AppDatabase, targetCase: RentalDepositCase): CaseRecord {
  return {
    ...targetCase,
    evidences: db.evidences
      .filter((entry) => entry.caseId === targetCase.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    deductionProposal: db.deductionProposals.find((entry) => entry.caseId === targetCase.id),
    dispute: db.disputes.find((entry) => entry.caseId === targetCase.id),
    auditTimeline: db.auditLogs
      .filter((entry) => entry.caseId === targetCase.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  };
}

export function performCaseAction(db: AppDatabase, caseId: string, actionInput: ActionInput): ActionResult {
  const targetCase = findCaseOrThrow(db, caseId);
  const timestamp = now();

  if (targetCase.status === "CLOSED") {
    throw new Error("This case is already closed.");
  }

  if (actionInput.type === "UPLOAD_EVIDENCE") {
    const evidence = createEvidence(
      db,
      caseId,
      actionInput.actorRole,
      actionInput.actorWallet,
      actionInput.phase,
      actionInput.category,
      actionInput.fileName,
      actionInput.description,
    );

    recordAudit(
      db,
      caseId,
      actionInput.actorRole,
      actionInput.actorWallet,
      "UPLOAD_EVIDENCE",
      `${actionInput.actorRole.toLowerCase()} uploaded ${actionInput.phase.toLowerCase().replace("_", "-")} evidence.`,
      undefined,
      { evidenceId: evidence.id, phase: actionInput.phase },
    );

    recordEvent(
      db,
      actionInput.phase === "MOVE_IN" ? "move_in_evidence_uploaded" : "page_view",
      actionInput.actorRole,
      actionInput.actorWallet,
      `/cases/${caseId}`,
      { phase: actionInput.phase },
    );

    targetCase.updatedAt = timestamp;
    return { case: targetCase };
  }

  if (actionInput.type === "FUND_DEPOSIT") {
    assertRole(actionInput.actorRole, "TENANT");
    assertStatus(targetCase.status, "CREATED");
    const txHash = createMockHash("fund");
    targetCase.status = "FUNDED";
    targetCase.fundTxHash = txHash;
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "FUND_DEPOSIT", "Tenant funded the deposit into escrow.", txHash);
    recordWalletInteraction(db, actionInput.actorWallet, "fund_deposit", true, caseId, txHash);
    recordEvent(db, "deposit_funded", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`, {
      amount: targetCase.depositAmount,
    });
    return { case: targetCase, txHash };
  }

  if (actionInput.type === "CONFIRM_MOVE_IN") {
    assertRole(actionInput.actorRole, ["TENANT", "LANDLORD"]);
    assertStatus(targetCase.status, "FUNDED");
    const moveInEvidence = db.evidences.filter((entry) => entry.caseId === caseId && entry.phase === "MOVE_IN");

    if (moveInEvidence.length === 0) {
      throw new Error("Upload at least one move-in evidence file first.");
    }

    targetCase.status = "MOVE_IN_CONFIRMED";
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "CONFIRM_MOVE_IN", "Move-in condition confirmed and escrow is active.");
    return { case: targetCase };
  }

  if (actionInput.type === "REQUEST_REFUND") {
    assertRole(actionInput.actorRole, "TENANT");
    assertStatus(targetCase.status, "MOVE_IN_CONFIRMED");
    const moveOutEvidence = db.evidences.filter((entry) => entry.caseId === caseId && entry.phase === "MOVE_OUT");

    if (moveOutEvidence.length === 0) {
      throw new Error("Upload move-out evidence before requesting a refund.");
    }

    targetCase.status = "REFUND_REQUESTED";
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "REQUEST_REFUND", "Tenant requested the return of the deposit.");
    recordEvent(db, "refund_requested", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`);
    return { case: targetCase };
  }

  if (actionInput.type === "APPROVE_FULL_REFUND") {
    assertRole(actionInput.actorRole, "LANDLORD");
    assertStatus(targetCase.status, "REFUND_REQUESTED");
    const txHash = createMockHash("refund");
    targetCase.status = "CLOSED";
    targetCase.releaseTxHash = txHash;
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "APPROVE_FULL_REFUND", "Landlord approved the full refund release.", txHash);
    recordWalletInteraction(db, actionInput.actorWallet, "approve_full_refund", true, caseId, txHash);
    recordEvent(db, "refund_requested", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`, {
      resolution: "full_refund",
    });
    return { case: targetCase, txHash };
  }

  if (actionInput.type === "PROPOSE_DEDUCTION") {
    assertRole(actionInput.actorRole, "LANDLORD");
    assertStatus(targetCase.status, "REFUND_REQUESTED");

    if (actionInput.amount > targetCase.depositAmount) {
      throw new Error("Deduction cannot be greater than the deposit amount.");
    }

    const proposal: DeductionProposal = {
      id: `deduction_${crypto.randomUUID()}`,
      caseId,
      amount: actionInput.amount,
      reason: actionInput.reason,
      evidenceIds: actionInput.evidenceIds,
      status: "PROPOSED",
      createdAt: timestamp,
    };

    db.deductionProposals = db.deductionProposals.filter((entry) => entry.caseId !== caseId);
    db.deductionProposals.unshift(proposal);
    targetCase.status = "DEDUCTION_PROPOSED";
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "PROPOSE_DEDUCTION", "Landlord proposed a partial deduction.", undefined, {
      amount: actionInput.amount,
    });
    recordEvent(db, "deduction_proposed", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`, {
      amount: actionInput.amount,
    });
    return { case: targetCase };
  }

  if (actionInput.type === "ACCEPT_DEDUCTION") {
    assertRole(actionInput.actorRole, "TENANT");
    assertStatus(targetCase.status, "DEDUCTION_PROPOSED");
    const txHash = createMockHash("split");
    const proposal = db.deductionProposals.find((entry) => entry.caseId === caseId);

    if (!proposal) {
      throw new Error("No deduction proposal exists for this case.");
    }

    proposal.status = "ACCEPTED";
    targetCase.status = "CLOSED";
    targetCase.releaseTxHash = txHash;
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "ACCEPT_DEDUCTION", "Tenant accepted the deduction split and funds were released.", txHash);
    recordWalletInteraction(db, actionInput.actorWallet, "accept_deduction", true, caseId, txHash);
    recordEvent(db, "deduction_accepted", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`, {
      deductionAmount: proposal.amount,
    });
    return { case: targetCase, txHash };
  }

  if (actionInput.type === "OPEN_DISPUTE") {
    assertRole(actionInput.actorRole, ["TENANT", "LANDLORD"]);
    assertStatus(targetCase.status, ["REFUND_REQUESTED", "DEDUCTION_PROPOSED"]);
    const dispute: Dispute = {
      id: `dispute_${crypto.randomUUID()}`,
      caseId,
      openedByRole: actionInput.actorRole,
      reason: actionInput.reason,
      status: "OPEN",
      createdAt: timestamp,
    };

    db.disputes = db.disputes.filter((entry) => entry.caseId !== caseId);
    db.disputes.unshift(dispute);
    targetCase.status = "DISPUTED";
    targetCase.updatedAt = timestamp;
    recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "OPEN_DISPUTE", "A dispute was opened and moved to mediation.");
    recordEvent(db, "dispute_opened", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`);
    return { case: targetCase };
  }

  assertRole(actionInput.actorRole, "MEDIATOR");
  assertStatus(targetCase.status, "DISPUTED");

  if (actionInput.tenantAmount + actionInput.landlordAmount > targetCase.depositAmount) {
    throw new Error("Resolution split cannot exceed the deposit amount.");
  }

  const dispute = db.disputes.find((entry) => entry.caseId === caseId);

  if (!dispute) {
    throw new Error("No open dispute exists for this case.");
  }

  const txHash = createMockHash("resolve");
  dispute.status = "RESOLVED";
  dispute.tenantAmount = actionInput.tenantAmount;
  dispute.landlordAmount = actionInput.landlordAmount;
  dispute.resolutionNote = actionInput.resolutionNote;
  dispute.resolvedAt = timestamp;
  targetCase.status = "CLOSED";
  targetCase.releaseTxHash = txHash;
  targetCase.updatedAt = timestamp;
  recordAudit(db, caseId, actionInput.actorRole, actionInput.actorWallet, "RESOLVE_DISPUTE", "Mediator resolved the dispute and released funds.", txHash, {
    tenantAmount: actionInput.tenantAmount,
    landlordAmount: actionInput.landlordAmount,
  });
  recordWalletInteraction(db, actionInput.actorWallet, "resolve_dispute", true, caseId, txHash);
  recordEvent(db, "dispute_resolved", actionInput.actorRole, actionInput.actorWallet, `/cases/${caseId}`, {
    tenantAmount: actionInput.tenantAmount,
    landlordAmount: actionInput.landlordAmount,
  });
  return { case: targetCase, txHash };
}
