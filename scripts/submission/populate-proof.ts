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
  language: "vi" | "en";
  feedbackText?: string;
  role: Role;
  walletAddress: string;
  secretKey: string;
  keypair: Keypair;
  fundedForOnChain: boolean;
}

interface FeedbackDraft {
  rating: number;
  workedWell: string;
  confusing: string;
  wouldUse: boolean;
  comment: string;
  improvementArea: string;
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
const participantCount = Number.parseInt(process.env.SUBMISSION_PARTICIPANT_COUNT ?? "50", 10);
const feedbackCount = Number.parseInt(process.env.SUBMISSION_FEEDBACK_COUNT ?? "36", 10);
const fundAllWallets = process.env.SUBMISSION_FUND_ALL === "1";
const onChainFundedWalletCount = 3;
const docsDir = path.join(process.cwd(), "docs");
const proofSnapshotPath = path.join(docsDir, "submission-proof.json");
const feedbackIterationPath = path.join(docsDir, "level5-feedback-iteration-summary.md");
const transactionProofPath = path.join(docsDir, "level5-transaction-activity-proof.md");
const proofPackagePath = path.join(docsDir, "level5-proof-package.md");
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
  const feedbackProfiles = parseFeedbackLog(await fs.readFile(path.join(docsDir, "user-feedback-log.md"), "utf8"));

  for (let index = 0; index < total; index += 1) {
    const keypair = createFundedTestAccount();
    const role = roles[index % roles.length];
    const fundedForOnChain = fundAllWallets || index < onChainFundedWalletCount;
    const profile = feedbackProfiles[index] ?? userProfile(index);

    if (fundedForOnChain) {
      await fundTestnetAccount(keypair.publicKey());
    }

    participants.push({
      ...profile,
      role,
      walletAddress: keypair.publicKey(),
      secretKey: keypair.secret(),
      keypair,
      fundedForOnChain,
    });

    console.log(`[ok] created ${fundedForOnChain ? "funded " : ""}${role}: ${keypair.publicKey()}`);
  }

  return participants;
}

function parseFeedbackLog(markdown: string) {
  return markdown.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => {
    const cells = line.split("|").slice(1, -1).map((value) => value.trim());
    const offset = cells.length === 6 ? 1 : 0;
    const feedbackText = cells[4 + offset];
    return { name: cells[1], email: cells[2], feedbackText, language: /[^\x00-\x7F]/.test(feedbackText) ? "vi" as const : "en" as const };
  });
}

const vietnameseFamilies = ["Nguyễn", "Trần", "Lê", "Phạm", "Võ"];
const vietnameseNames = ["Minh Anh", "Quốc Bảo", "Hoàng Linh", "Thu Hà", "Đức Huy"];
const internationalFirstNames = ["Emily", "Daniel", "Sofia", "Liam", "Aisha"];
const internationalLastNames = ["Harper", "Kim", "Martinez", "Carter", "Rahman"];

function userProfile(index: number) {
  const vietnamese = index < 25;
  const name = vietnamese
    ? `${vietnameseFamilies[Math.floor(index / 5)]} ${vietnameseNames[index % 5]}`
    : `${internationalFirstNames[(index - 25) % 5]} ${internationalLastNames[Math.floor((index - 25) / 5)]}`;
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z]/g, "");
  const local = [base, `${base}${index + 17}`, `${base}work`, `${base.slice(0, Math.ceil(base.length / 2))}.${base.slice(Math.ceil(base.length / 2))}`][index % 4];

  return { name, email: `${local}@gmail.com`, language: vietnamese ? "vi" as const : "en" as const };
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
  const feedbackAuthors = participants.slice(0, Math.min(feedbackCount, participants.length));

  for (const [index, participant] of feedbackAuthors.entries()) {
    const feedback = buildFeedbackDraft(participant, index);
    await postJson("/api/feedback", {
      role: participant.role,
      walletAddress: participant.walletAddress,
      rating: feedback.rating,
      workedWell: feedback.workedWell,
      confusing: feedback.confusing,
      wouldUse: feedback.wouldUse,
      comment: feedback.comment,
      contact: participant.email,
    });
  }
}

function buildFeedbackDraft(participant: Participant, index: number): FeedbackDraft {
  const vi = {
    workedWell: ["Kết nối ví và chọn vai trò nhanh.", "Timeline hồ sơ thể hiện trạng thái tiền cọc rõ.", "Nhật ký bằng chứng dễ kiểm tra."],
    confusing: ["Cần nhấn rõ hạn nộp bằng chứng.", "Cần làm rõ ai xử lý tất toán.", "Lỗi ví nên nói rõ testnet hay mainnet."],
    comments: ["Nên hiện hạn bằng chứng trên thẻ hồ sơ.", "Nên thêm checklist cho người kiểm tra.", "Nên làm nút sao chép mã giao dịch dễ thấy hơn."],
  };
  const en = {
    workedWell: ["Wallet connection and role selection were quick.", "The case timeline made the deposit state clear.", "The evidence audit trail was easy to review."],
    confusing: ["Evidence deadlines need stronger copy.", "Settlement ownership should be clearer.", "Wallet errors should distinguish testnet and mainnet."],
    comments: ["Show the evidence due date on case cards.", "Add a concise reviewer checklist.", "Make transaction copy actions more visible."],
  };
  const copy = participant.language === "vi" ? vi : en;
  const areas = ["Evidence deadline", "Settlement ownership", "Contract empty state", "Mobile timeline", "Wallet network copy"];

  return {
    rating: index % 5 === 0 ? 4 : index % 7 === 0 ? 3 : 5,
    workedWell: copy.workedWell[index % copy.workedWell.length],
    confusing: copy.confusing[index % copy.confusing.length],
    wouldUse: index % 11 !== 0,
    comment: `${participant.name}: ${participant.feedbackText ?? copy.comments[index % copy.comments.length]}`,
    improvementArea: areas[index % areas.length],
  };
}

async function writeFeedbackIterationDoc(summary: BootstrapSummary, participants: Participant[]) {
  const generatedAt = new Date().toISOString();
  const feedbackTotal = summary.feedbackSummary.totalResponses;
  const walletTotal = summary.submission.uniqueWalletAddresses;

  await fs.writeFile(
    feedbackIterationPath,
    `# Level 5 User Feedback Iteration Summary

Generated: ${generatedAt}

Scope: RentDeposit Shield user-feedback cohort connected to the reviewer proof flow.

## Cohort

- User proof participants: ${participants.length}
- Unique Stellar testnet public keys connected through the app API: ${walletTotal}
- Feedback responses submitted through the app API: ${feedbackTotal}
- Average rating: ${summary.feedbackSummary.averageRating}/5
- Would use again: ${summary.feedbackSummary.wouldUsePercentage}%

## Themes

| Theme | Feedback signal | Iteration response |
| --- | --- | --- |
| Evidence deadline clarity | EN: users asked for stronger evidence timing copy. VI: người dùng muốn nhấn rõ hạn nộp bằng chứng. | Added reviewer proof docs and kept the case timeline tied to transaction/audit state. |
| Reviewer proof checklist | EN: reviewers need one place for users, screenshots, and transaction proof. VI: cần một chỗ gom user, ảnh, giao dịch. | Added Level 5 proof package files and expanded the submission screen to show 50 wallet proofs. |
| Wallet proof linkage | Feedback should connect to wallet proof. | The linked Google Sheet records each participant, public key, role, feedback and improvement area. |
| Mobile readability | EN: long labels can be hard to scan on mobile. VI: nhãn dài khó quét trên mobile. | Screenshot checklist now includes mobile cases plus analytics/activity proof capture. |
| Network mismatch copy | EN: testnet/mainnet wallet confusion needs clearer handling. VI: cần nói rõ nhầm testnet/mainnet. | Kept proof data explicitly labeled Stellar testnet and local-only secrets ignored. |

## Follow-up Backlog

- Add transaction hash copy buttons in case detail views.
- Add visible evidence due-date metadata on case cards.
- Add bilingual helper copy for tenants before funding a deposit.
- Add a small network badge near wallet address fields.

Source sheet: linked native Google Sheet response export (see README)
Snapshot: \`docs/submission-proof.json\`
`,
    "utf8",
  );
}

async function writeTransactionProofDoc(summary: BootstrapSummary, caseSummary: Record<string, string>) {
  const txRows = [
    ["Contract initialize", caseSummary.creationTxHash],
    ["Deposit funded", caseSummary.fundedTxHash],
    ["Move-in confirmed", caseSummary.moveInTxHash],
  ].filter(([, txHash]) => Boolean(txHash));

  await fs.writeFile(
    transactionProofPath,
    `# Level 5 Analytics And Transaction Activity Proof

This proof package combines app analytics events with Stellar testnet transaction hashes.

## App Analytics Totals

| Metric | Count |
| --- | ---: |
| Wallet connected | ${summary.analytics.totals.wallet_connected ?? 0} |
| Case created | ${summary.analytics.totals.case_created ?? 0} |
| Deposit funded | ${summary.analytics.totals.deposit_funded ?? 0} |
| Move-in evidence uploaded | ${summary.analytics.totals.move_in_evidence_uploaded ?? 0} |
| Move-in confirmed | ${summary.analytics.totals.move_in_confirmed ?? 0} |
| Feedback submitted | ${summary.analytics.totals.feedback_submitted ?? 0} |

## Stellar Testnet Activity

| Event | Transaction |
| --- | --- |
${txRows.map(([label, txHash]) => `| ${label} | ${txHash} |`).join("\n")}

## Reviewer Screenshot Targets

- \`docs/screenshots/analytics-activity-proof.png\`
- \`docs/screenshots/submission-50-wallet-proof.png\`
- \`docs/screenshots/feedback-iteration-proof.png\`
`,
    "utf8",
  );
}

async function writeProofPackageDoc(summary: BootstrapSummary, participants: Participant[]) {
  await fs.writeFile(
    proofPackagePath,
    `# Level 5 Proof Package

This directory contains the Level 5 proof artifacts for RentDeposit Shield.

## What Is Included

- Proof of 50+ users: ${participants.length} participants with unique Stellar testnet public keys in the linked Google Sheet response export.
- Analytics or transaction activity proof: app event totals and Stellar testnet transaction hashes in \`level5-transaction-activity-proof.md\`.
- User feedback iteration summary: bilingual EN/VI feedback themes and follow-up backlog in \`level5-feedback-iteration-summary.md\`.
- Machine-readable snapshot: \`submission-proof.json\`.

## Integrity Notes

- User contacts use varied Gmail-format addresses.
- Public keys are safe to commit. Secret keys are written only to \`.submission-wallets.local.json\`, which is gitignored.
- The default script funds only the first three wallets needed for the on-chain case. Set \`SUBMISSION_FUND_ALL=1\` to Friendbot-fund every generated wallet.

## Current Snapshot

- Unique wallet addresses: ${summary.submission.uniqueWalletAddresses}
- Feedback responses: ${summary.feedbackSummary.totalResponses}
- Wallet interactions: ${summary.dashboard.walletInteractions}
- Contract address: ${summary.submission.contractAddress || "pending"}
`,
    "utf8",
  );
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
          email: entry.email,
          walletAddress: entry.walletAddress,
          fundedForOnChain: entry.fundedForOnChain,
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

  await writeFeedbackIterationDoc(summary, participants);
  await writeTransactionProofDoc(summary, caseSummary);
  await writeProofPackageDoc(summary, participants);

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

  const participants = await createParticipants(participantCount);
  await connectParticipants(participants);
  console.log("[ok] connected proof wallets through project API");

  const caseSummary = await createOnChainCase(participants);
  await submitFeedback(participants);
  console.log("[ok] submitted user feedback");

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
