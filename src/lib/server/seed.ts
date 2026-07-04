import type { AppDatabase } from "@/lib/types";

export function createSeedData(): AppDatabase {
  return {
    users: [],
    cases: [],
    evidences: [],
    deductionProposals: [],
    disputes: [],
    auditLogs: [],
    walletInteractions: [],
    feedback: [],
    analyticsEvents: [],
    errorLogs: [],
    submissionMeta: {
      publicRepoUrl: "https://github.com/yuxinNgo/RentDeposit-Shieldd",
      liveDemoUrl: "",
      contractDeploymentAddress: "",
      demoVideoUrl: "",
      screenshotsChecklist: [
        "Landing page desktop",
        "Analytics dashboard activity proof",
        "Submission proof with 50 wallet addresses",
        "Feedback iteration summary",
        "Mobile responsive cases list",
      ],
    },
  };
}
