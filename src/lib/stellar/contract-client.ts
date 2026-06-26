"use client";

import { createCaseApi, performCaseActionApi } from "@/lib/api/client";
import { sha256Buffer } from "@/lib/stellar/crypto";
import {
  deployEscrowContractClient,
  getEscrowContractClient,
  onChainStatusToAppStatus,
  readOnChainCase,
  submitContractWrite,
  type EscrowContractClient,
} from "@/lib/stellar/escrow-contract";
import { isValidContractAddress, isValidPublicKey } from "@/lib/stellar/network";
import { getPublicKey, signTransaction } from "@/lib/stellar/wallet";
import type { CaseRecord, UserRole } from "@/lib/types";

interface StellarActionResult {
  success: boolean;
  txHash?: string;
  contractAddress?: string;
  errorMessage?: string;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function toOnChainAmount(value: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    throw new Error("Amounts sent on-chain must be positive integers.");
  }

  return BigInt(value);
}

function normalizeAssetCode(assetCode: string) {
  const normalized = assetCode.trim().toUpperCase();

  if (normalized.length < 2 || normalized.length > 10) {
    throw new Error("Asset code must be between 2 and 10 characters.");
  }

  return normalized;
}

function assertValidWallet(address: string, label: string) {
  if (!isValidPublicKey(address)) {
    throw new Error(`Invalid ${label} Stellar wallet address.`);
  }
}

function assertContractAddress(contractAddress: string) {
  if (!isValidContractAddress(contractAddress)) {
    throw new Error("This case does not have a live Soroban contract address. Create a fresh on-chain case first.");
  }
}

async function assertConnectedWallet(expectedWallet: string) {
  const activeWallet = await getPublicKey();

  if (!activeWallet) {
    throw new Error("Connect the matching wallet before signing this transaction.");
  }

  if (activeWallet !== expectedWallet) {
    throw new Error("The connected wallet does not match the actor wallet required for this case.");
  }
}

function assertActorAssignedToCase(caseRecord: CaseRecord, actorRole: UserRole, actorWallet: string) {
  if (actorRole === "TENANT" && caseRecord.tenantWalletAddress !== actorWallet) {
    throw new Error("The connected wallet is not the tenant wallet assigned to this case.");
  }

  if (actorRole === "LANDLORD" && caseRecord.landlordWalletAddress !== actorWallet) {
    throw new Error("The connected wallet is not the landlord wallet assigned to this case.");
  }

  if (actorRole === "MEDIATOR" && caseRecord.mediatorWalletAddress !== actorWallet) {
    throw new Error("The connected wallet is not the mediator wallet assigned to this case.");
  }
}

function assertMoveInEvidence(caseRecord: CaseRecord) {
  if (!caseRecord.evidences.some((entry) => entry.phase === "MOVE_IN")) {
    throw new Error("Upload at least one move-in evidence file before confirming move-in.");
  }
}

function assertMoveOutEvidence(caseRecord: CaseRecord) {
  if (!caseRecord.evidences.some((entry) => entry.phase === "MOVE_OUT")) {
    throw new Error("Upload move-out evidence before requesting a refund.");
  }
}

async function loadCaseClient(caseRecord: CaseRecord, actorRole: UserRole, actorWallet: string) {
  assertContractAddress(caseRecord.contractAddress);
  assertActorAssignedToCase(caseRecord, actorRole, actorWallet);
  await assertConnectedWallet(actorWallet);

  return getEscrowContractClient({
    contractId: caseRecord.contractAddress,
    publicKey: actorWallet,
    signTransaction,
  });
}

async function syncOnChainAction(
  caseRecord: CaseRecord,
  client: EscrowContractClient,
  txHash: string,
  payload: (resultingStatus: ReturnType<typeof onChainStatusToAppStatus>) => Record<string, unknown>,
) {
  const onChainCase = await readOnChainCase(client);
  const resultingStatus = onChainStatusToAppStatus(onChainCase.status);
  await performCaseActionApi(caseRecord.id, payload(resultingStatus));

  return {
    success: true as const,
    txHash,
    contractAddress: caseRecord.contractAddress,
  };
}

async function runCaseMutation(
  caseRecord: CaseRecord,
  actorRole: UserRole,
  actorWallet: string,
  invoke: (client: EscrowContractClient) => Promise<{ txHash: string }>,
  payload: (txHash: string, resultingStatus: ReturnType<typeof onChainStatusToAppStatus>) => Record<string, unknown>,
): Promise<StellarActionResult> {
  try {
    const client = await loadCaseClient(caseRecord, actorRole, actorWallet);
    const { txHash } = await invoke(client);
    return await syncOnChainAction(caseRecord, client, txHash, (resultingStatus) => payload(txHash, resultingStatus));
  } catch (error) {
    return {
      success: false,
      errorMessage: toErrorMessage(error),
    };
  }
}

export async function createDepositCaseOnChain(payload: Record<string, unknown>): Promise<StellarActionResult> {
  try {
    const form = payload as {
      propertyName: string;
      propertyAddress: string;
      tenantName: string;
      tenantWalletAddress: string;
      landlordName: string;
      landlordWalletAddress: string;
      mediatorWalletAddress: string;
      depositAmount: number;
      assetCode: string;
      rentalStartDate: string;
      rentalEndDate: string;
      depositTerms: string;
      deductionTerms: string;
    };

    assertValidWallet(form.tenantWalletAddress, "tenant");
    assertValidWallet(form.landlordWalletAddress, "landlord");
    assertValidWallet(form.mediatorWalletAddress, "mediator");
    await assertConnectedWallet(form.landlordWalletAddress);

    const { client, txHash: deployTxHash } = await deployEscrowContractClient({
      publicKey: form.landlordWalletAddress,
      signTransaction,
    });

    const initialized = await submitContractWrite(
      client.initialize_case({
        tenant: form.tenantWalletAddress,
        landlord: form.landlordWalletAddress,
        mediator: form.mediatorWalletAddress,
        asset_code: normalizeAssetCode(form.assetCode),
        amount: toOnChainAmount(form.depositAmount),
      }),
    );

    await createCaseApi({
      ...form,
      assetCode: normalizeAssetCode(form.assetCode),
      contractAddress: client.options.contractId,
      creationTxHash: initialized.txHash || deployTxHash,
    });

    return {
      success: true,
      txHash: initialized.txHash || deployTxHash,
      contractAddress: client.options.contractId,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: toErrorMessage(error),
    };
  }
}

export async function fundDepositOnChain(caseRecord: CaseRecord, actorRole: "TENANT", actorWallet: string) {
  return runCaseMutation(
    caseRecord,
    actorRole,
    actorWallet,
    (client) =>
      submitContractWrite(
        client.fund_deposit({
          actor: actorWallet,
          amount: toOnChainAmount(caseRecord.depositAmount),
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "FUND_DEPOSIT",
      actorRole,
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}

export async function confirmMoveInOnChain(caseRecord: CaseRecord, actorRole: "TENANT" | "LANDLORD", actorWallet: string) {
  assertMoveInEvidence(caseRecord);

  return runCaseMutation(
    caseRecord,
    actorRole,
    actorWallet,
    (client) =>
      submitContractWrite(
        client.confirm_move_in({
          actor: actorWallet,
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "CONFIRM_MOVE_IN",
      actorRole,
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}

export async function requestRefundOnChain(caseRecord: CaseRecord, actorWallet: string) {
  assertMoveOutEvidence(caseRecord);

  return runCaseMutation(
    caseRecord,
    "TENANT",
    actorWallet,
    (client) =>
      submitContractWrite(
        client.request_refund({
          actor: actorWallet,
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "REQUEST_REFUND",
      actorRole: "TENANT",
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}

export async function approveFullRefundOnChain(caseRecord: CaseRecord, actorWallet: string) {
  return runCaseMutation(
    caseRecord,
    "LANDLORD",
    actorWallet,
    (client) =>
      submitContractWrite(
        client.approve_full_refund({
          actor: actorWallet,
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "APPROVE_FULL_REFUND",
      actorRole: "LANDLORD",
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}

export async function proposeDeductionOnChain(
  caseRecord: CaseRecord,
  actorWallet: string,
  amount: number,
  reason: string,
) {
  return runCaseMutation(
    caseRecord,
    "LANDLORD",
    actorWallet,
    async (client) =>
      submitContractWrite(
        client.propose_deduction({
          actor: actorWallet,
          deduction_amount: toOnChainAmount(amount),
          reason_hash: await sha256Buffer(reason),
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "PROPOSE_DEDUCTION",
      actorRole: "LANDLORD",
      actorWallet,
      amount,
      reason,
      evidenceIds: [],
      txHash,
      resultingStatus,
    }),
  );
}

export async function acceptDeductionOnChain(caseRecord: CaseRecord, actorWallet: string) {
  return runCaseMutation(
    caseRecord,
    "TENANT",
    actorWallet,
    (client) =>
      submitContractWrite(
        client.accept_deduction({
          actor: actorWallet,
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "ACCEPT_DEDUCTION",
      actorRole: "TENANT",
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}

export async function openDisputeOnChain(
  caseRecord: CaseRecord,
  actorRole: "TENANT" | "LANDLORD",
  actorWallet: string,
  reason: string,
) {
  return runCaseMutation(
    caseRecord,
    actorRole,
    actorWallet,
    async (client) =>
      submitContractWrite(
        client.open_dispute({
          actor: actorWallet,
          reason_hash: await sha256Buffer(reason),
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "OPEN_DISPUTE",
      actorRole,
      actorWallet,
      reason,
      txHash,
      resultingStatus,
    }),
  );
}

export async function resolveDisputeOnChain(
  caseRecord: CaseRecord,
  actorWallet: string,
  tenantAmount: number,
  landlordAmount: number,
  resolutionNote: string,
) {
  return runCaseMutation(
    caseRecord,
    "MEDIATOR",
    actorWallet,
    async (client) =>
      submitContractWrite(
        client.resolve_dispute({
          actor: actorWallet,
          tenant_amount: toOnChainAmount(tenantAmount),
          landlord_amount: toOnChainAmount(landlordAmount),
          resolution_hash: await sha256Buffer(resolutionNote),
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "RESOLVE_DISPUTE",
      actorRole: "MEDIATOR",
      actorWallet,
      tenantAmount,
      landlordAmount,
      resolutionNote,
      txHash,
      resultingStatus,
    }),
  );
}

export async function closeCaseOnChain(caseRecord: CaseRecord, actorRole: "LANDLORD" | "MEDIATOR", actorWallet: string) {
  return runCaseMutation(
    caseRecord,
    actorRole,
    actorWallet,
    (client) =>
      submitContractWrite(
        client.close_case({
          actor: actorWallet,
        }),
      ),
    (txHash, resultingStatus) => ({
      type: "CLOSE_CASE",
      actorRole,
      actorWallet,
      txHash,
      resultingStatus,
    }),
  );
}
