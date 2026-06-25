import { buildCaseRecord } from "@/lib/domain/case-machine";
import type {
  AnalyticsSummary,
  AppDatabase,
  BootstrapPayload,
  FeedbackSummary,
  MonitoringSummary,
  ProofUser,
  SubmissionSummary,
} from "@/lib/types";

function countTokens(values: string[]) {
  const bucket = new Map<string, number>();

  for (const value of values) {
    for (const token of value.toLowerCase().split(/[^a-z0-9]+/)) {
      if (token.length < 5) {
        continue;
      }

      bucket.set(token, (bucket.get(token) ?? 0) + 1);
    }
  }

  return [...bucket.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));
}

function buildAnalytics(db: AppDatabase): AnalyticsSummary {
  const totals = db.analyticsEvents.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.eventName] = (accumulator[event.eventName] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totals,
    funnel: [
      { stage: "Wallet connects", value: totals.wallet_connected ?? 0 },
      { stage: "Cases created", value: totals.case_created ?? db.cases.length },
      { stage: "Deposits funded", value: totals.deposit_funded ?? 0 },
      { stage: "Disputes resolved", value: totals.dispute_resolved ?? 0 },
      { stage: "Feedback submitted", value: totals.feedback_submitted ?? db.feedback.length },
    ],
    recentEvents: db.analyticsEvents.slice(0, 12),
  };
}

function buildFeedbackSummary(db: AppDatabase): FeedbackSummary {
  const totalResponses = db.feedback.length;
  const averageRating =
    totalResponses === 0
      ? 0
      : Number((db.feedback.reduce((sum, entry) => sum + entry.rating, 0) / totalResponses).toFixed(1));

  return {
    totalResponses,
    averageRating,
    positiveThemes: countTokens(db.feedback.map((entry) => entry.workedWell)),
    confusingThemes: countTokens(db.feedback.map((entry) => entry.confusing)),
    wouldUsePercentage:
      totalResponses === 0
        ? 0
        : Math.round((db.feedback.filter((entry) => entry.wouldUse).length / totalResponses) * 100),
  };
}

function buildMonitoring(db: AppDatabase): MonitoringSummary {
  const latestErrors = db.errorLogs.slice(0, 6);
  const walletErrors = db.errorLogs.filter((entry) => entry.scope === "wallet").length;
  const contractErrors = db.errorLogs.filter((entry) => entry.scope === "contract").length;
  const apiErrors = db.errorLogs.filter((entry) => entry.scope === "api").length;
  const totalErrors = db.errorLogs.length;

  return {
    health: totalErrors < 3 ? "healthy" : totalErrors < 6 ? "watching" : "attention",
    totalErrors,
    walletErrors,
    contractErrors,
    apiErrors,
    latestErrors,
  };
}

function buildProofUsers(db: AppDatabase): ProofUser[] {
  const seen = new Set<string>();
  const proofUsers: ProofUser[] = [];

  for (const interaction of db.walletInteractions) {
    if (seen.has(interaction.walletAddress)) {
      continue;
    }

    seen.add(interaction.walletAddress);
    const user = db.users.find((entry) => entry.walletAddress === interaction.walletAddress);

    proofUsers.push({
      walletAddress: interaction.walletAddress,
      role: user?.role ?? "TENANT",
      connectedAt: interaction.createdAt,
      lastAction: interaction.action,
      txHash: interaction.txHash,
      feedbackSubmitted: db.feedback.some((entry) => entry.walletAddress === interaction.walletAddress),
    });
  }

  return proofUsers.slice(0, 10);
}

function buildSubmission(db: AppDatabase): SubmissionSummary {
  const uniqueWalletAddresses = new Set(db.walletInteractions.map((entry) => entry.walletAddress));

  return {
    repoUrl: db.submissionMeta.publicRepoUrl,
    liveDemoUrl: db.submissionMeta.liveDemoUrl,
    contractAddress: db.submissionMeta.contractDeploymentAddress,
    demoVideoUrl: db.submissionMeta.demoVideoUrl,
    analyticsReady: db.analyticsEvents.length > 0,
    monitoringReady: db.errorLogs.length >= 0,
    readmeReady: true,
    commitsReady: false,
    screenshotsChecklist: db.submissionMeta.screenshotsChecklist,
    totalOnboardedUsers: db.users.filter((entry) => entry.onboardingCompleted).length,
    uniqueWalletAddresses: uniqueWalletAddresses.size,
    proofUsers: buildProofUsers(db),
  };
}

export function buildBootstrapPayload(db: AppDatabase): BootstrapPayload {
  const cases = db.cases
    .map((entry) => buildCaseRecord(db, entry))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return {
    users: db.users,
    cases,
    feedback: db.feedback.slice(0, 12),
    dashboard: {
      totalCases: db.cases.length,
      fundedCases: db.cases.filter((entry) => ["FUNDED", "MOVE_IN_CONFIRMED", "REFUND_REQUESTED", "DEDUCTION_PROPOSED", "DISPUTED"].includes(entry.status)).length,
      openDisputes: db.disputes.filter((entry) => entry.status === "OPEN").length,
      closedCases: db.cases.filter((entry) => entry.status === "CLOSED").length,
      depositVolume: db.cases.reduce((sum, entry) => sum + entry.depositAmount, 0),
      walletInteractions: db.walletInteractions.length,
      feedbackCount: db.feedback.length,
      recentActivity: db.auditLogs.slice(0, 8),
    },
    analytics: buildAnalytics(db),
    feedbackSummary: buildFeedbackSummary(db),
    monitoring: buildMonitoring(db),
    submission: buildSubmission(db),
  };
}
