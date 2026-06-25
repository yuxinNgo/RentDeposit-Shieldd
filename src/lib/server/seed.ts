import { DEMO_CONTRACT_ADDRESS } from "@/lib/constants";
import { createMockHash } from "@/lib/utils";
import type { AppDatabase, User } from "@/lib/types";

function wallet(seed: string) {
  return `G${seed.toUpperCase().replace(/[^A-Z0-9]/g, "").padEnd(55, "A").slice(0, 55)}`;
}

function user(
  id: string,
  name: string,
  email: string,
  role: User["role"],
  walletAddress: string,
  createdAt: string,
): User {
  return {
    id,
    name,
    email,
    role,
    walletAddress,
    onboardingCompleted: true,
    createdAt,
  };
}

export function createSeedData(): AppDatabase {
  const createdAt = "2026-06-20T08:00:00.000Z";
  const tenantWallet = wallet("tenantdemo0000000000000000000000000000000000000000000");
  const landlordWallet = wallet("landlorddemo0000000000000000000000000000000000000000");
  const mediatorWallet = wallet("mediatordemo000000000000000000000000000000000000000");

  const users: AppDatabase["users"] = [
    user("usr_landlord", "Mira Alvarez", "mira@rentdepositshield.app", "LANDLORD", landlordWallet, createdAt),
    user("usr_tenant", "Jonah Reed", "jonah@rentdepositshield.app", "TENANT", tenantWallet, createdAt),
    user("usr_mediator", "Ari Solis", "ari@rentdepositshield.app", "MEDIATOR", mediatorWallet, createdAt),
    user("usr_admin", "Platform Ops", "ops@rentdepositshield.app", "ADMIN", wallet("admindemo0000000000000000000000000000000000000000"), createdAt),
    ...Array.from({ length: 7 }, (_, index) =>
      user(
        `usr_validation_${index + 1}`,
        `Validation User ${index + 1}`,
        `validator${index + 1}@example.com`,
        index % 2 === 0 ? "TENANT" : "LANDLORD",
        wallet(`validationwallet${index + 1}`),
        `2026-06-${String(14 + index).padStart(2, "0")}T08:30:00.000Z`,
      ),
    ),
  ];

  const cases: AppDatabase["cases"] = [
    {
      id: "case_atlas_loft",
      propertyName: "Atlas Loft 04B",
      propertyAddress: "41 Harbor Street, Newark",
      tenantName: "Jonah Reed",
      tenantWalletAddress: tenantWallet,
      landlordName: "Mira Alvarez",
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
      depositAmount: 1800,
      assetCode: "USDC",
      status: "DISPUTED",
      contractAddress: DEMO_CONTRACT_ADDRESS,
      fundTxHash: createMockHash("fund"),
      rentalStartDate: "2026-05-01",
      rentalEndDate: "2026-10-31",
      depositTerms: "Deposit remains locked until both parties confirm the move-out condition or mediator resolves a dispute.",
      deductionTerms: "Only documented damages or unpaid utilities can be deducted with proof attached.",
      createdAt: "2026-06-10T08:00:00.000Z",
      updatedAt: "2026-06-23T10:00:00.000Z",
    },
    {
      id: "case_orchard_flat",
      propertyName: "Orchard Flat 12A",
      propertyAddress: "18 Orchard Lane, Queens",
      tenantName: "Lena Morris",
      tenantWalletAddress: wallet("lenamorriswallet000000000000000000000000000000000"),
      landlordName: "Mira Alvarez",
      landlordWalletAddress: landlordWallet,
      mediatorWalletAddress: mediatorWallet,
      depositAmount: 2400,
      assetCode: "USDC",
      status: "FUNDED",
      contractAddress: DEMO_CONTRACT_ADDRESS,
      fundTxHash: createMockHash("fund"),
      rentalStartDate: "2026-06-01",
      rentalEndDate: "2026-12-31",
      depositTerms: "Escrow opens after Stellar testnet funding and releases only with workflow consensus.",
      deductionTerms: "Deductions require evidence and tenant review before release.",
      createdAt: "2026-06-11T11:00:00.000Z",
      updatedAt: "2026-06-20T13:40:00.000Z",
    },
    {
      id: "case_river_studio",
      propertyName: "River Studio 09C",
      propertyAddress: "9 Riverside Walk, Jersey City",
      tenantName: "Kai Flores",
      tenantWalletAddress: wallet("kaifloreswallet000000000000000000000000000000000"),
      landlordName: "Amaya Holt",
      landlordWalletAddress: wallet("amayaholtwallet000000000000000000000000000000000"),
      mediatorWalletAddress: mediatorWallet,
      depositAmount: 1500,
      assetCode: "USDC",
      status: "CLOSED",
      contractAddress: DEMO_CONTRACT_ADDRESS,
      fundTxHash: createMockHash("fund"),
      releaseTxHash: createMockHash("release"),
      rentalStartDate: "2026-02-01",
      rentalEndDate: "2026-04-30",
      depositTerms: "Funds stay in escrow until the move-out checklist is signed off.",
      deductionTerms: "Landlord may propose deductions tied to documented cleaning or repair costs.",
      createdAt: "2026-03-01T10:10:00.000Z",
      updatedAt: "2026-05-07T12:15:00.000Z",
    },
  ];

  const evidences: AppDatabase["evidences"] = [
    {
      id: "ev_1",
      caseId: "case_atlas_loft",
      phase: "MOVE_IN",
      category: "video",
      fileName: "atlas-entry-walkthrough.mp4",
      fileUrl: "/evidence/atlas-entry-walkthrough",
      fileHash: createMockHash("evidence"),
      description: "Joint move-in walkthrough captured on arrival.",
      uploadedByRole: "TENANT",
      uploadedByWallet: tenantWallet,
      createdAt: "2026-06-10T08:10:00.000Z",
    },
    {
      id: "ev_2",
      caseId: "case_atlas_loft",
      phase: "MOVE_OUT",
      category: "photos",
      fileName: "atlas-move-out-photos.zip",
      fileUrl: "/evidence/atlas-move-out-photos",
      fileHash: createMockHash("evidence"),
      description: "Move-out gallery showing wall scuffs and appliance state.",
      uploadedByRole: "TENANT",
      uploadedByWallet: tenantWallet,
      createdAt: "2026-06-22T10:10:00.000Z",
    },
    {
      id: "ev_3",
      caseId: "case_orchard_flat",
      phase: "MOVE_IN",
      category: "inventory",
      fileName: "orchard-inventory.pdf",
      fileUrl: "/evidence/orchard-inventory",
      fileHash: createMockHash("evidence"),
      description: "Signed inventory sheet and meter readings.",
      uploadedByRole: "LANDLORD",
      uploadedByWallet: landlordWallet,
      createdAt: "2026-06-20T13:10:00.000Z",
    },
    {
      id: "ev_4",
      caseId: "case_river_studio",
      phase: "DISPUTE",
      category: "invoice",
      fileName: "river-cleaning-invoice.pdf",
      fileUrl: "/evidence/river-cleaning-invoice",
      fileHash: createMockHash("evidence"),
      description: "Cleaning invoice attached during deduction negotiation.",
      uploadedByRole: "LANDLORD",
      uploadedByWallet: wallet("amayaholtwallet000000000000000000000000000000000"),
      createdAt: "2026-05-01T11:10:00.000Z",
    },
  ];

  const deductionProposals: AppDatabase["deductionProposals"] = [
    {
      id: "ded_1",
      caseId: "case_atlas_loft",
      amount: 320,
      reason: "Paint touch-up for hallway scrape and deep cleaning.",
      evidenceIds: ["ev_2"],
      status: "PROPOSED",
      createdAt: "2026-06-23T08:00:00.000Z",
    },
  ];

  const disputes: AppDatabase["disputes"] = [
    {
      id: "dis_1",
      caseId: "case_atlas_loft",
      openedByRole: "TENANT",
      reason: "Tenant disputes repaint charge and requests mediator review.",
      status: "OPEN",
      createdAt: "2026-06-23T09:10:00.000Z",
    },
  ];

  const auditLogs: AppDatabase["auditLogs"] = [
    {
      id: "audit_1",
      caseId: "case_atlas_loft",
      actorRole: "LANDLORD",
      actorWallet: landlordWallet,
      action: "CREATE_CASE",
      message: "Landlord created the Atlas Loft escrow case.",
      createdAt: "2026-06-10T08:00:00.000Z",
    },
    {
      id: "audit_2",
      caseId: "case_atlas_loft",
      actorRole: "TENANT",
      actorWallet: tenantWallet,
      action: "FUND_DEPOSIT",
      message: "Tenant funded the deposit into escrow.",
      txHash: cases[0].fundTxHash,
      createdAt: "2026-06-10T08:20:00.000Z",
    },
    {
      id: "audit_3",
      caseId: "case_atlas_loft",
      actorRole: "TENANT",
      actorWallet: tenantWallet,
      action: "REQUEST_REFUND",
      message: "Tenant requested the return of the deposit.",
      createdAt: "2026-06-22T10:40:00.000Z",
    },
    {
      id: "audit_4",
      caseId: "case_atlas_loft",
      actorRole: "LANDLORD",
      actorWallet: landlordWallet,
      action: "PROPOSE_DEDUCTION",
      message: "Landlord proposed a partial deduction.",
      createdAt: "2026-06-23T08:00:00.000Z",
    },
    {
      id: "audit_5",
      caseId: "case_atlas_loft",
      actorRole: "TENANT",
      actorWallet: tenantWallet,
      action: "OPEN_DISPUTE",
      message: "A dispute was opened and moved to mediation.",
      createdAt: "2026-06-23T09:10:00.000Z",
    },
    {
      id: "audit_6",
      caseId: "case_orchard_flat",
      actorRole: "LANDLORD",
      actorWallet: landlordWallet,
      action: "CREATE_CASE",
      message: "Landlord created the Orchard Flat case.",
      createdAt: "2026-06-11T11:00:00.000Z",
    },
    {
      id: "audit_7",
      caseId: "case_orchard_flat",
      actorRole: "TENANT",
      actorWallet: wallet("lenamorriswallet000000000000000000000000000000000"),
      action: "FUND_DEPOSIT",
      message: "Tenant funded the deposit into escrow.",
      txHash: cases[1].fundTxHash,
      createdAt: "2026-06-20T13:40:00.000Z",
    },
    {
      id: "audit_8",
      caseId: "case_river_studio",
      actorRole: "MEDIATOR",
      actorWallet: mediatorWallet,
      action: "RESOLVE_DISPUTE",
      message: "Mediator resolved the dispute and released funds.",
      txHash: cases[2].releaseTxHash,
      createdAt: "2026-05-07T12:15:00.000Z",
    },
  ];

  const walletInteractions: AppDatabase["walletInteractions"] = [
    {
      id: "wi_1",
      walletAddress: tenantWallet,
      action: "fund_deposit",
      txHash: cases[0].fundTxHash,
      contractAddress: DEMO_CONTRACT_ADDRESS,
      caseId: "case_atlas_loft",
      success: true,
      createdAt: "2026-06-10T08:20:00.000Z",
    },
    {
      id: "wi_2",
      walletAddress: landlordWallet,
      action: "wallet_connected",
      contractAddress: DEMO_CONTRACT_ADDRESS,
      success: true,
      createdAt: "2026-06-09T10:00:00.000Z",
    },
    {
      id: "wi_3",
      walletAddress: mediatorWallet,
      action: "resolve_dispute",
      txHash: cases[2].releaseTxHash,
      contractAddress: DEMO_CONTRACT_ADDRESS,
      caseId: "case_river_studio",
      success: true,
      createdAt: "2026-05-07T12:15:00.000Z",
    },
    ...Array.from({ length: 7 }, (_, index) => ({
      id: `wi_validation_${index + 1}`,
      walletAddress: wallet(`validationwallet${index + 1}`),
      action: index % 2 === 0 ? "wallet_connected" : "fund_deposit",
      txHash: createMockHash(`validation${index + 1}`),
      contractAddress: DEMO_CONTRACT_ADDRESS,
      caseId: index % 2 === 0 ? undefined : "case_orchard_flat",
      success: true,
      createdAt: `2026-06-${String(14 + index).padStart(2, "0")}T10:00:00.000Z`,
    })),
  ];

  const feedback: AppDatabase["feedback"] = [
    {
      id: "fb_1",
      role: "TENANT",
      walletAddress: tenantWallet,
      rating: 5,
      workedWell: "The timeline and tx hashes made the process feel transparent.",
      confusing: "I wanted clearer guidance on when to upload move-out evidence.",
      wouldUse: true,
      comment: "Strong demo. The dispute step felt credible.",
      contact: "jonah@example.com",
      createdAt: "2026-06-23T12:00:00.000Z",
    },
    {
      id: "fb_2",
      role: "LANDLORD",
      walletAddress: landlordWallet,
      rating: 4,
      workedWell: "Creating a case and proposing deductions was easy.",
      confusing: "Wanted faster hints about acceptable deduction evidence.",
      wouldUse: true,
      comment: "Would use this for testnet demos and landlord workshops.",
      createdAt: "2026-06-23T12:10:00.000Z",
    },
  ];

  const analyticsEvents: AppDatabase["analyticsEvents"] = [
    {
      id: "event_1",
      eventName: "page_view",
      userRole: "ADMIN",
      walletAddress: users[3].walletAddress,
      path: "/dashboard",
      createdAt: "2026-06-24T09:00:00.000Z",
    },
    {
      id: "event_2",
      eventName: "wallet_connected",
      userRole: "LANDLORD",
      walletAddress: landlordWallet,
      path: "/onboarding",
      createdAt: "2026-06-24T09:01:00.000Z",
    },
    {
      id: "event_3",
      eventName: "case_created",
      userRole: "LANDLORD",
      walletAddress: landlordWallet,
      path: "/cases/new",
      createdAt: "2026-06-24T09:02:00.000Z",
    },
    {
      id: "event_4",
      eventName: "deposit_funded",
      userRole: "TENANT",
      walletAddress: tenantWallet,
      path: "/cases/case_atlas_loft",
      createdAt: "2026-06-24T09:03:00.000Z",
    },
    {
      id: "event_5",
      eventName: "dispute_opened",
      userRole: "TENANT",
      walletAddress: tenantWallet,
      path: "/cases/case_atlas_loft",
      createdAt: "2026-06-24T09:05:00.000Z",
    },
    {
      id: "event_6",
      eventName: "feedback_submitted",
      userRole: "TENANT",
      walletAddress: tenantWallet,
      path: "/feedback",
      createdAt: "2026-06-24T09:10:00.000Z",
    },
    {
      id: "event_7",
      eventName: "submission_page_viewed",
      userRole: "ADMIN",
      walletAddress: users[3].walletAddress,
      path: "/submission",
      createdAt: "2026-06-24T09:12:00.000Z",
    },
  ];

  const errorLogs: AppDatabase["errorLogs"] = [
    {
      id: "err_1",
      scope: "wallet",
      message: "Freighter extension not detected. Falling back to demo wallet.",
      createdAt: "2026-06-24T09:15:00.000Z",
    },
    {
      id: "err_2",
      scope: "api",
      message: "Rejected refund request without move-out evidence.",
      caseId: "case_orchard_flat",
      createdAt: "2026-06-24T09:18:00.000Z",
    },
  ];

  return {
    users,
    cases,
    evidences,
    deductionProposals,
    disputes,
    auditLogs,
    walletInteractions,
    feedback,
    analyticsEvents,
    errorLogs,
    submissionMeta: {
      publicRepoUrl: "https://github.com/your-handle/rentdeposit-shield",
      liveDemoUrl: "http://localhost:3000",
      contractDeploymentAddress: DEMO_CONTRACT_ADDRESS,
      demoVideoUrl: "https://example.com/demo-video-placeholder",
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
