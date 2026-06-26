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
      liveDemoUrl: "http://localhost:3000",
      contractDeploymentAddress: "",
      demoVideoUrl: "",
      screenshotsChecklist: [
        "Landing page desktop",
        "Dashboard overview",
        "Case detail timeline",
        "Mediator dispute panel",
        "Mobile responsive cases list",
      ],
    },
  };
}
