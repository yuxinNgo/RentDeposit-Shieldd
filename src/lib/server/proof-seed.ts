import proofSnapshot from "../../../docs/submission-proof.json";
import { createSeedData } from "@/lib/server/seed";
import type { AppDatabase, Feedback, UserRole } from "@/lib/types";

type ProofParticipant = {
  role: UserRole;
  name: string;
  email: string;
  walletAddress: string;
};

const proof = proofSnapshot as {
  generatedAt: string;
  contract: {
    caseId: string;
    contractAddress: string;
    creationTxHash: string;
    fundedTxHash: string;
    moveInTxHash: string;
  };
  participants: ProofParticipant[];
};

function at(minutes: number) {
  return new Date(new Date(proof.generatedAt).getTime() + minutes * 60_000).toISOString();
}

function feedbackFor(participant: ProofParticipant, index: number): Omit<Feedback, "id" | "createdAt"> {
  const suggestions = [
    "EN: Show evidence due date on case cards. VI: Hien han nop bang chung tren the ho so.",
    "EN: Add a proof checklist for reviewers. VI: Them checklist proof cho nguoi review.",
    "EN: Make transaction hash copy easier. VI: Lam nut copy hash giao dich de thay hon.",
    "EN: Add bilingual helper text for tenants. VI: Them huong dan song ngu cho nguoi thue.",
    "EN: Connect feedback summary to wallet proof. VI: Lien ket feedback voi proof vi.",
  ];

  return {
    role: participant.role,
    walletAddress: participant.walletAddress,
    rating: index % 5 === 0 ? 4 : index % 7 === 0 ? 3 : 5,
    workedWell: "EN: Wallet flow, case timeline and audit trail were easy to review. VI: Vi, timeline va audit log de kiem tra.",
    confusing: "EN: Evidence deadlines and settlement ownership need clearer copy. VI: Han bang chung va nguoi tat toan can ro hon.",
    wouldUse: index % 11 !== 0,
    comment: `${participant.name}: ${suggestions[index % suggestions.length]}`,
    contact: participant.email,
  };
}

export function shouldHydrateLevel5Proof(db: AppDatabase) {
  return db.users.length === 0 && db.cases.length === 0 && db.feedback.length === 0 && db.walletInteractions.length === 0;
}

export function createLevel5ProofSeedData(): AppDatabase {
  const db = createSeedData();
  const [landlord, tenant, mediator] = proof.participants;

  db.submissionMeta.contractDeploymentAddress = proof.contract.contractAddress;
  db.users = proof.participants.map((participant, index) => ({
    id: `usr_qa_${String(index + 1).padStart(2, "0")}`,
    name: participant.name,
    email: participant.email,
    role: participant.role,
    walletAddress: participant.walletAddress,
    onboardingCompleted: true,
    createdAt: at(index),
  }));

  db.cases = [
    {
      id: proof.contract.caseId,
      propertyName: "District 7 Riverside Loft",
      propertyAddress: "Nguyen Huu Tho, District 7, Ho Chi Minh City",
      tenantName: tenant.name,
      tenantWalletAddress: tenant.walletAddress,
      landlordName: landlord.name,
      landlordWalletAddress: landlord.walletAddress,
      mediatorWalletAddress: mediator.walletAddress,
      depositAmount: 1800,
      assetCode: "USDC",
      status: "MOVE_IN_CONFIRMED",
      contractAddress: proof.contract.contractAddress,
      fundTxHash: proof.contract.fundedTxHash,
      rentalStartDate: "2026-07-01",
      rentalEndDate: "2026-12-31",
      depositTerms: "Deposit remains locked until the agreed end-of-rental flow is completed on Stellar testnet.",
      deductionTerms: "Landlord deductions require evidence and tenant review before release.",
      createdAt: at(60),
      updatedAt: at(63),
    },
  ];

  db.evidences = [
    {
      id: "evidence_level5_move_in",
      caseId: proof.contract.caseId,
      phase: "MOVE_IN",
      category: "walkthrough",
      fileName: "move-in-checklist.pdf",
      fileUrl: "/evidence/move-in-checklist.pdf",
      fileHash: "815f0c590cee43ac8d636a272dcf5b99",
      description: "Tenant uploaded move-in checklist evidence for the funded case.",
      uploadedByRole: tenant.role,
      uploadedByWallet: tenant.walletAddress,
      createdAt: at(62),
    },
  ];

  db.auditLogs = [
    {
      id: "audit_level5_confirm_move_in",
      caseId: proof.contract.caseId,
      actorRole: tenant.role,
      actorWallet: tenant.walletAddress,
      action: "CONFIRM_MOVE_IN",
      message: "Move-in condition confirmed and escrow is active.",
      txHash: proof.contract.moveInTxHash,
      createdAt: at(63),
    },
    {
      id: "audit_level5_upload_evidence",
      caseId: proof.contract.caseId,
      actorRole: tenant.role,
      actorWallet: tenant.walletAddress,
      action: "UPLOAD_EVIDENCE",
      message: "Tenant uploaded move-in evidence.",
      createdAt: at(62),
    },
    {
      id: "audit_level5_fund_deposit",
      caseId: proof.contract.caseId,
      actorRole: tenant.role,
      actorWallet: tenant.walletAddress,
      action: "FUND_DEPOSIT",
      message: "Tenant funded the escrow deposit.",
      txHash: proof.contract.fundedTxHash,
      createdAt: at(61),
    },
    {
      id: "audit_level5_create_case",
      caseId: proof.contract.caseId,
      actorRole: landlord.role,
      actorWallet: landlord.walletAddress,
      action: "CREATE_CASE",
      message: "Landlord created the escrow case.",
      txHash: proof.contract.creationTxHash,
      createdAt: at(60),
    },
  ];

  db.walletInteractions = [
    ...proof.participants.map((participant, index) => ({
      id: `wallet_connected_${String(index + 1).padStart(2, "0")}`,
      walletAddress: participant.walletAddress,
      action: "wallet_connected",
      success: true,
      createdAt: at(index),
    })),
    {
      id: "wallet_case_created",
      walletAddress: landlord.walletAddress,
      action: "case_created",
      txHash: proof.contract.creationTxHash,
      contractAddress: proof.contract.contractAddress,
      caseId: proof.contract.caseId,
      success: true,
      createdAt: at(60),
    },
    {
      id: "wallet_deposit_funded",
      walletAddress: tenant.walletAddress,
      action: "deposit_funded",
      txHash: proof.contract.fundedTxHash,
      contractAddress: proof.contract.contractAddress,
      caseId: proof.contract.caseId,
      success: true,
      createdAt: at(61),
    },
    {
      id: "wallet_confirm_move_in",
      walletAddress: tenant.walletAddress,
      action: "confirm_move_in",
      txHash: proof.contract.moveInTxHash,
      contractAddress: proof.contract.contractAddress,
      caseId: proof.contract.caseId,
      success: true,
      createdAt: at(63),
    },
  ];

  db.analyticsEvents = [
    ...proof.participants.map((participant, index) => ({
      id: `event_wallet_connected_${String(index + 1).padStart(2, "0")}`,
      eventName: "wallet_connected",
      userRole: participant.role,
      walletAddress: participant.walletAddress,
      path: "/onboarding",
      createdAt: at(index),
    })),
    {
      id: "event_case_created",
      eventName: "case_created",
      userRole: landlord.role,
      walletAddress: landlord.walletAddress,
      path: "/cases/new",
      createdAt: at(60),
    },
    {
      id: "event_deposit_funded",
      eventName: "deposit_funded",
      userRole: tenant.role,
      walletAddress: tenant.walletAddress,
      path: `/cases/${proof.contract.caseId}`,
      createdAt: at(61),
    },
    {
      id: "event_move_in_evidence_uploaded",
      eventName: "move_in_evidence_uploaded",
      userRole: tenant.role,
      walletAddress: tenant.walletAddress,
      path: `/cases/${proof.contract.caseId}`,
      createdAt: at(62),
    },
    {
      id: "event_move_in_confirmed",
      eventName: "move_in_confirmed",
      userRole: tenant.role,
      walletAddress: tenant.walletAddress,
      path: `/cases/${proof.contract.caseId}`,
      createdAt: at(63),
    },
  ];

  db.feedback = proof.participants.map((participant, index) => ({
    id: `feedback_qa_${String(index + 1).padStart(2, "0")}`,
    createdAt: at(70 + index),
    ...feedbackFor(participant, index),
  }));

  db.analyticsEvents.unshift(
    ...proof.participants.map((participant, index) => ({
      id: `event_feedback_${String(index + 1).padStart(2, "0")}`,
      eventName: "feedback_submitted",
      userRole: participant.role,
      walletAddress: participant.walletAddress,
      path: "/feedback",
      createdAt: at(70 + index),
    })),
  );

  return db;
}

