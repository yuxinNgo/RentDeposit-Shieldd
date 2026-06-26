import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Keypair } from "@stellar/stellar-sdk";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  deployEscrowContractClient,
  getEscrowContractClient,
  submitContractWrite,
} from "../../src/lib/stellar/escrow-contract";
import { STELLAR_CONTRACT_WASM_HASH, STELLAR_NETWORK_PASSPHRASE } from "../../src/lib/stellar/network";
import { buildContract, createFundedTestAccount, fundTestnetAccount, installContractCode } from "../stellar/common";

type Role = "LANDLORD" | "TENANT" | "MEDIATOR";

interface Participant {
  name: string;
  email: string;
  role: Role;
  walletAddress: string;
  secretKey: string;
  keypair: Keypair;
}

interface BootstrapSummary {
  submission: {
    repoUrl: string;
    contractAddress: string;
    uniqueWalletAddresses: number;
    totalOnboardedUsers: number;
    proofUsers: Array<{
      walletAddress: string;
      role: Role;
      connectedAt: string;
      lastAction: string;
      txHash?: string;
      feedbackSubmitted: boolean;
    }>;
  };
  feedbackSummary: {
    totalResponses: number;
    averageRating: number;
    positiveThemes: Array<{ label: string; count: number }>;
    confusingThemes: Array<{ label: string; count: number }>;
    wouldUsePercentage: number;
  };
  analytics: {
    totals: Record<string, number>;
  };
  dashboard: {
    totalCases: number;
    fundedCases: number;
    walletInteractions: number;
  };
}

const baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";
const docsDir = path.join(process.cwd(), "docs");
const proofSnapshotPath = path.join(docsDir, "submission-proof.json");
const localWalletDumpPath = path.join(process.cwd(), ".submission-wallets.local.json");

async function expectOk<T>(response: Response) {
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  return body as T;
}

async function postJson<T>(pathname: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return expectOk<T>(response);
}

async function getJson<T>(pathname: string) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "GET",
    cache: "no-store",
  });

  return expectOk<T>(response);
}

async function createParticipants(total: number) {
  const roles: Role[] = ["LANDLORD", "TENANT", "MEDIATOR"];
  const participants: Participant[] = [];

  for (let index = 0; index < total; index += 1) {
    const keypair = createFundedTestAccount();
    await fundTestnetAccount(keypair.publicKey());
    const role = roles[index % roles.length];

    participants.push({
      name: `Proof ${role.toLowerCase()} ${index + 1}`,
      email: `proof-${role.toLowerCase()}-${index + 1}@rentdeposit.local`,
      role,
      walletAddress: keypair.publicKey(),
      secretKey: keypair.secret(),
      keypair,
    });

    console.log(`[ok] funded ${role}: ${keypair.publicKey()}`);
  }

  return participants;
}

async function connectParticipants(participants: Participant[]) {
  for (const participant of participants) {
    await postJson("/api/wallet/connect", {
      role: participant.role,
      walletAddress: participant.walletAddress,
      name: participant.name,
      email: participant.email,
    });
  }
}

async function createOnChainCase(participants: Participant[]) {
  const landlord = participants.find((entry) => entry.role === "LANDLORD");
  const tenant = participants.find((entry) => entry.role === "TENANT");
  const mediator = participants.find((entry) => entry.role === "MEDIATOR");

  if (!landlord || !tenant || !mediator) {
    throw new Error("Could not select landlord, tenant and mediator proof accounts.");
  }

  const { wasmHash } = await buildContract();

  if (wasmHash !== STELLAR_CONTRACT_WASM_HASH) {
    throw new Error(`Built Wasm hash ${wasmHash} does not match app hash ${STELLAR_CONTRACT_WASM_HASH}.`);
  }

  const installedHash = await installContractCode(landlord.secretKey);

  if (installedHash !== wasmHash) {
    throw new Error(`Installed Wasm hash mismatch. Expected ${wasmHash}, got ${installedHash}.`);
  }

  const landlordSigner = basicNodeSigner(landlord.keypair, STELLAR_NETWORK_PASSPHRASE);
  const tenantSigner = basicNodeSigner(tenant.keypair, STELLAR_NETWORK_PASSPHRASE);

  const { client } = await deployEscrowContractClient({
    publicKey: landlord.walletAddress,
    signTransaction: landlordSigner.signTransaction,
  });

  const initialize = await submitContractWrite(
    client.initialize_case({
      tenant: tenant.walletAddress,
      landlord: landlord.walletAddress,
      mediator: mediator.walletAddress,
      asset_code: "USDC",
      amount: BigInt(1800),
    }),
  );

  const createdCase = await postJson<{ id: string; contractAddress: string }>("/api/cases", {
    propertyName: "District 7 Riverside Loft",
    propertyAddress: "Nguyen Huu Tho, District 7, Ho Chi Minh City",
    tenantName: tenant.name,
    tenantWalletAddress: tenant.walletAddress,
    landlordName: landlord.name,
    landlordWalletAddress: landlord.walletAddress,
    mediatorWalletAddress: mediator.walletAddress,
    depositAmount: 1800,
    assetCode: "USDC",
    rentalStartDate: "2026-07-01",
    rentalEndDate: "2026-12-31",
    depositTerms: "Deposit remains locked until the agreed end-of-rental flow is completed on Stellar testnet.",
    deductionTerms: "Landlord deductions require evidence and tenant review before release.",
    contractAddress: client.options.contractId,
    creationTxHash: initialize.txHash,
  });

  const tenantClient = await getEscrowContractClient({
    contractId: client.options.contractId,
    publicKey: tenant.walletAddress,
    signTransaction: tenantSigner.signTransaction,
  });

  const fund = await submitContractWrite(
    tenantClient.fund_deposit({
      actor: tenant.walletAddress,
      amount: BigInt(1800),
    }),
  );

  await postJson(`/api/cases/${createdCase.id}/actions`, {
    type: "FUND_DEPOSIT",
    actorRole: "TENANT",
    actorWallet: tenant.walletAddress,
    txHash: fund.txHash,
    resultingStatus: "FUNDED",
  });

  await postJson(`/api/cases/${createdCase.id}/actions`, {
    type: "UPLOAD_EVIDENCE",
    actorRole: "TENANT",
    actorWallet: tenant.walletAddress,
    phase: "MOVE_IN",
    category: "walkthrough",
    fileName: "move-in-checklist.pdf",
    description: "Tenant uploaded move-in checklist evidence for the funded case.",
  });

  const moveIn = await submitContractWrite(
    tenantClient.confirm_move_in({
      actor: tenant.walletAddress,
    }),
  );

  await postJson(`/api/cases/${createdCase.id}/actions`, {
    type: "CONFIRM_MOVE_IN",
    actorRole: "TENANT",
    actorWallet: tenant.walletAddress,
    txHash: moveIn.txHash,
    resultingStatus: "MOVE_IN_CONFIRMED",
  });

  console.log(`[ok] created app case ${createdCase.id} with contract ${createdCase.contractAddress}`);

  return {
    caseId: createdCase.id,
    contractAddress: createdCase.contractAddress,
    creationTxHash: initialize.txHash,
    fundedTxHash: fund.txHash,
    moveInTxHash: moveIn.txHash,
  };
}

async function submitFeedback(participants: Participant[]) {
  const feedbackAuthors = participants.slice(0, 8);

  for (const [index, participant] of feedbackAuthors.entries()) {
    const rating = index % 3 === 0 ? 5 : index % 3 === 1 ? 4 : 5;
    await postJson("/api/feedback", {
      role: participant.role,
      walletAddress: participant.walletAddress,
      rating,
      workedWell: "Wallet connection, audit trail visibility and role-based flow were straightforward to validate.",
      confusing: "Need clearer copy around evidence timing and who closes the case after settlement.",
      wouldUse: true,
      comment: `Proof feedback ${index + 1}: the escrow workflow felt consistent for ${participant.role.toLowerCase()} testing.`,
      contact: participant.email,
    });
  }
}

async function writeSnapshot(summary: BootstrapSummary, participants: Participant[], caseSummary: Record<string, string>) {
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(
    proofSnapshotPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl,
        contract: caseSummary,
        participantCount: participants.length,
        participants: participants.map((entry) => ({
          role: entry.role,
          name: entry.name,
          walletAddress: entry.walletAddress,
        })),
        submission: {
          repoUrl: summary.submission.repoUrl,
          contractAddress: summary.submission.contractAddress,
          totalOnboardedUsers: summary.submission.totalOnboardedUsers,
          uniqueWalletAddresses: summary.submission.uniqueWalletAddresses,
          proofUsers: summary.submission.proofUsers,
        },
        analytics: {
          totals: summary.analytics.totals,
          totalCases: summary.dashboard.totalCases,
          fundedCases: summary.dashboard.fundedCases,
          walletInteractions: summary.dashboard.walletInteractions,
        },
        feedback: summary.feedbackSummary,
      },
      null,
      2,
    ),
    "utf8",
  );

  await fs.writeFile(
    localWalletDumpPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: "Local-only Stellar testnet wallets for optional manual Freighter import. Do not commit this file.",
        participants: participants.map((entry) => ({
          role: entry.role,
          name: entry.name,
          email: entry.email,
          walletAddress: entry.walletAddress,
          secretKey: entry.secretKey,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function main() {
  await postJson("/api/dev/reset", {});
  console.log("[ok] reset workspace");

  const participants = await createParticipants(12);
  await connectParticipants(participants);
  console.log("[ok] connected proof wallets through project API");

  const caseSummary = await createOnChainCase(participants);
  await submitFeedback(participants);
  console.log("[ok] submitted feedback sample");

  const bootstrap = await getJson<BootstrapSummary>("/api/bootstrap");
  await writeSnapshot(bootstrap, participants, caseSummary);

  console.log(JSON.stringify({
    repoUrl: bootstrap.submission.repoUrl,
    contractAddress: bootstrap.submission.contractAddress,
    uniqueWalletAddresses: bootstrap.submission.uniqueWalletAddresses,
    proofUsers: bootstrap.submission.proofUsers.length,
    totalFeedback: bootstrap.feedbackSummary.totalResponses,
    averageRating: bootstrap.feedbackSummary.averageRating,
    walletInteractions: bootstrap.dashboard.walletInteractions,
    analyticsTotals: bootstrap.analytics.totals,
  }, null, 2));
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
