"use client";

import { createCaseApi, performCaseActionApi } from "@/lib/api/client";
import type { UserRole } from "@/lib/types";

interface StellarActionResult {
  success: boolean;
  txHash?: string;
  contractAddress?: string;
  errorMessage?: string;
}

async function runAction(caseId: string, payload: Record<string, unknown>): Promise<StellarActionResult> {
  try {
    const response = await performCaseActionApi(caseId, payload);
    return {
      success: true,
      txHash: response.txHash,
      contractAddress: response.case.contractAddress,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createDepositCaseOnChain(payload: Record<string, unknown>): Promise<StellarActionResult> {
  try {
    const response = await createCaseApi(payload);
    return {
      success: true,
      contractAddress: response.contractAddress,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fundDepositOnChain(caseId: string, actorRole: UserRole, actorWallet: string) {
  return runAction(caseId, {
    type: "FUND_DEPOSIT",
    actorRole,
    actorWallet,
  });
}

export async function confirmMoveInOnChain(caseId: string, actorRole: UserRole, actorWallet: string) {
  return runAction(caseId, {
    type: "CONFIRM_MOVE_IN",
    actorRole,
    actorWallet,
  });
}

export async function requestRefundOnChain(caseId: string, actorWallet: string) {
  return runAction(caseId, {
    type: "REQUEST_REFUND",
    actorRole: "TENANT",
    actorWallet,
  });
}

export async function approveFullRefundOnChain(caseId: string, actorWallet: string) {
  return runAction(caseId, {
    type: "APPROVE_FULL_REFUND",
    actorRole: "LANDLORD",
    actorWallet,
  });
}

export async function proposeDeductionOnChain(caseId: string, actorWallet: string, amount: number, reason: string) {
  return runAction(caseId, {
    type: "PROPOSE_DEDUCTION",
    actorRole: "LANDLORD",
    actorWallet,
    amount,
    reason,
    evidenceIds: [],
  });
}

export async function acceptDeductionOnChain(caseId: string, actorWallet: string) {
  return runAction(caseId, {
    type: "ACCEPT_DEDUCTION",
    actorRole: "TENANT",
    actorWallet,
  });
}

export async function openDisputeOnChain(caseId: string, actorRole: "TENANT" | "LANDLORD", actorWallet: string, reason: string) {
  return runAction(caseId, {
    type: "OPEN_DISPUTE",
    actorRole,
    actorWallet,
    reason,
  });
}

export async function resolveDisputeOnChain(
  caseId: string,
  actorWallet: string,
  tenantAmount: number,
  landlordAmount: number,
  resolutionNote: string,
) {
  return runAction(caseId, {
    type: "RESOLVE_DISPUTE",
    actorRole: "MEDIATOR",
    actorWallet,
    tenantAmount,
    landlordAmount,
    resolutionNote,
  });
}
