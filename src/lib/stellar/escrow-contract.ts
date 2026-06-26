import { Buffer } from "buffer";
import {
  Client as SorobanContractClient,
  type AssembledTransaction,
  type MethodOptions,
  type SignTransaction,
} from "@stellar/stellar-sdk/contract";
import type { DepositCaseStatus } from "@/lib/types";
import {
  STELLAR_CONTRACT_WASM_HASH,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
} from "@/lib/stellar/network";

const browserGlobal = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (typeof window !== "undefined" && !browserGlobal.Buffer) {
  browserGlobal.Buffer = Buffer;
}

export interface OnChainDepositCase {
  amount: bigint;
  asset_code: string;
  deduction_amount: bigint;
  deduction_reason_hash: Buffer | undefined;
  dispute_reason_hash: Buffer | undefined;
  funded_amount: bigint;
  initialized: boolean;
  landlord: string;
  landlord_release_amount: bigint;
  mediator: string;
  released: boolean;
  resolution_hash: Buffer | undefined;
  status: OnChainDepositCaseStatus;
  tenant: string;
  tenant_release_amount: bigint;
}

export type OnChainDepositCaseStatus =
  | { tag: "Created"; values: void }
  | { tag: "Funded"; values: void }
  | { tag: "MoveInConfirmed"; values: void }
  | { tag: "RefundRequested"; values: void }
  | { tag: "DeductionProposed"; values: void }
  | { tag: "Disputed"; values: void }
  | { tag: "Refunded"; values: void }
  | { tag: "PartiallyRefunded"; values: void }
  | { tag: "ReleasedToLandlord"; values: void }
  | { tag: "Closed"; values: void };

export interface EscrowContractClientShape {
  get_case: (options?: MethodOptions) => Promise<AssembledTransaction<OnChainDepositCase>>;
  close_case: (args: { actor: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  fund_deposit: (args: { actor: string; amount: bigint }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  open_dispute: (args: { actor: string; reason_hash: Buffer }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  request_refund: (args: { actor: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  confirm_move_in: (args: { actor: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  initialize_case: (
    args: { tenant: string; landlord: string; mediator: string; asset_code: string; amount: bigint },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;
  resolve_dispute: (
    args: {
      actor: string;
      tenant_amount: bigint;
      landlord_amount: bigint;
      resolution_hash: Buffer;
    },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;
  accept_deduction: (args: { actor: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  propose_deduction: (
    args: { actor: string; deduction_amount: bigint; reason_hash: Buffer },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;
  approve_full_refund: (args: { actor: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}

export type EscrowContractClient = SorobanContractClient & EscrowContractClientShape;

interface RuntimeOptions {
  publicKey: string;
  signTransaction?: SignTransaction;
}

interface ContractRuntimeOptions extends RuntimeOptions {
  contractId: string;
}

function toEscrowClient(client: SorobanContractClient) {
  return client as EscrowContractClient;
}

function buildClientOptions({ contractId, publicKey, signTransaction }: ContractRuntimeOptions) {
  return {
    contractId,
    publicKey,
    signTransaction,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: STELLAR_RPC_URL,
  };
}

function transactionHash(sent: {
  sendTransactionResponse?: { hash: string };
  getTransactionResponse?: { txHash: string };
}) {
  return sent.getTransactionResponse?.txHash ?? sent.sendTransactionResponse?.hash ?? "";
}

export function onChainStatusToAppStatus(status: OnChainDepositCaseStatus): DepositCaseStatus {
  switch (status.tag) {
    case "Created":
      return "CREATED";
    case "Funded":
      return "FUNDED";
    case "MoveInConfirmed":
      return "MOVE_IN_CONFIRMED";
    case "RefundRequested":
      return "REFUND_REQUESTED";
    case "DeductionProposed":
      return "DEDUCTION_PROPOSED";
    case "Disputed":
      return "DISPUTED";
    case "Refunded":
      return "REFUNDED";
    case "PartiallyRefunded":
      return "PARTIALLY_REFUNDED";
    case "ReleasedToLandlord":
      return "RELEASED_TO_LANDLORD";
    case "Closed":
      return "CLOSED";
  }
}

export async function getEscrowContractClient(options: ContractRuntimeOptions) {
  const client = await SorobanContractClient.from(buildClientOptions(options));
  return toEscrowClient(client);
}

export async function deployEscrowContractClient({ publicKey, signTransaction }: RuntimeOptions) {
  const tx = await SorobanContractClient.deploy(null, {
    publicKey,
    signTransaction,
    address: publicKey,
    wasmHash: STELLAR_CONTRACT_WASM_HASH,
    format: "hex",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: STELLAR_RPC_URL,
  });
  const sent = await tx.signAndSend();
  return {
    client: toEscrowClient(sent.result),
    txHash: transactionHash(sent),
  };
}

export async function submitContractWrite(transaction: Promise<AssembledTransaction<null>>) {
  const assembled = await transaction;
  const sent = await assembled.signAndSend();
  return {
    txHash: transactionHash(sent),
  };
}

export async function readOnChainCase(client: EscrowContractClient) {
  const snapshot = await client.get_case();
  return snapshot.result;
}
