import { buildBootstrapPayload } from "@/lib/server/bootstrap";
import { readDb, updateDb } from "@/lib/server/db";
import { createSeedData } from "@/lib/server/seed";
import { DEMO_CONTRACT_ADDRESS } from "@/lib/constants";
import { performCaseAction, buildCaseRecord } from "@/lib/domain/case-machine";
import type { AppDatabase, ErrorLog, Feedback, RentalDepositCase, User } from "@/lib/types";

function now() {
  return new Date().toISOString();
}

function upsertUser(db: AppDatabase, candidate: Omit<User, "id" | "createdAt"> & Partial<Pick<User, "id" | "createdAt">>) {
  const existing = db.users.find((entry) => entry.walletAddress === candidate.walletAddress);

  if (existing) {
    Object.assign(existing, candidate);
    return existing;
  }

  const user: User = {
    id: candidate.id ?? `usr_${crypto.randomUUID()}`,
    createdAt: candidate.createdAt ?? now(),
    ...candidate,
  };

  db.users.unshift(user);
  return user;
}

export async function getBootstrapPayload() {
  const db = await readDb();
  return buildBootstrapPayload(db);
}

export async function getCaseById(caseId: string) {
  const db = await readDb();
  const targetCase = db.cases.find((entry) => entry.id === caseId);

  if (!targetCase) {
    return null;
  }

  return buildCaseRecord(db, targetCase);
}

export async function resetDatabase() {
  return updateDb((db) => {
    const seed = createSeedData();
    Object.assign(db, seed);
    return buildBootstrapPayload(db);
  });
}

export async function createCase(input: Omit<RentalDepositCase, "id" | "status" | "contractAddress" | "createdAt" | "updatedAt">) {
  return updateDb((db) => {
    const timestamp = now();
    const createdCase: RentalDepositCase = {
      id: `case_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
      status: "CREATED",
      contractAddress: DEMO_CONTRACT_ADDRESS,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };

    db.cases.unshift(createdCase);
    db.auditLogs.unshift({
      id: `audit_${crypto.randomUUID()}`,
      caseId: createdCase.id,
      actorRole: "LANDLORD",
      actorWallet: createdCase.landlordWalletAddress,
      action: "CREATE_CASE",
      message: `Landlord created the ${createdCase.propertyName} escrow case.`,
      createdAt: timestamp,
    });
    db.analyticsEvents.unshift({
      id: `event_${crypto.randomUUID()}`,
      eventName: "case_created",
      userRole: "LANDLORD",
      walletAddress: createdCase.landlordWalletAddress,
      path: "/cases/new",
      createdAt: timestamp,
    });
    return buildCaseRecord(db, createdCase);
  });
}

export async function connectWallet(role: User["role"], walletAddress: string, name = `${role} demo user`, email = `${role.toLowerCase()}@example.com`) {
  return updateDb((db) => {
    const timestamp = now();
    const user = upsertUser(db, {
      name,
      email,
      role,
      walletAddress,
      onboardingCompleted: true,
    });

    db.walletInteractions.unshift({
      id: `wallet_${crypto.randomUUID()}`,
      walletAddress,
      action: "wallet_connected",
      success: true,
      contractAddress: DEMO_CONTRACT_ADDRESS,
      createdAt: timestamp,
    });

    db.analyticsEvents.unshift({
      id: `event_${crypto.randomUUID()}`,
      eventName: "wallet_connected",
      userRole: role,
      walletAddress,
      path: "/onboarding",
      createdAt: timestamp,
    });

    return user;
  });
}

export async function completeOnboarding(input: Omit<User, "id" | "createdAt" | "onboardingCompleted">) {
  return updateDb((db) => {
    const user = upsertUser(db, {
      ...input,
      onboardingCompleted: true,
    });

    db.analyticsEvents.unshift({
      id: `event_${crypto.randomUUID()}`,
      eventName: "onboarding_completed",
      userRole: input.role,
      walletAddress: input.walletAddress,
      path: "/onboarding",
      createdAt: now(),
    });

    return user;
  });
}

export async function submitFeedback(input: Omit<Feedback, "id" | "createdAt">) {
  return updateDb((db) => {
    const feedback: Feedback = {
      id: `feedback_${crypto.randomUUID()}`,
      createdAt: now(),
      ...input,
    };

    db.feedback.unshift(feedback);
    db.analyticsEvents.unshift({
      id: `event_${crypto.randomUUID()}`,
      eventName: "feedback_submitted",
      userRole: input.role,
      walletAddress: input.walletAddress,
      path: "/feedback",
      createdAt: feedback.createdAt,
    });
    return feedback;
  });
}

export async function runCaseAction(caseId: string, actionInput: Parameters<typeof performCaseAction>[2]) {
  return updateDb((db) => performCaseAction(db, caseId, actionInput));
}

export async function logError(scope: ErrorLog["scope"], message: string, detail?: string, caseId?: string) {
  return updateDb((db) => {
    db.errorLogs.unshift({
      id: `err_${crypto.randomUUID()}`,
      scope,
      message,
      detail,
      caseId,
      createdAt: now(),
    });
  });
}
