export type UserRole = "TENANT" | "LANDLORD" | "MEDIATOR" | "ADMIN";

export type DepositCaseStatus =
  | "CREATED"
  | "FUNDED"
  | "MOVE_IN_CONFIRMED"
  | "REFUND_REQUESTED"
  | "DEDUCTION_PROPOSED"
  | "DISPUTED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "RELEASED_TO_LANDLORD"
  | "CLOSED";

export type EvidencePhase = "MOVE_IN" | "MOVE_OUT" | "DISPUTE";

export type DeductionStatus = "PROPOSED" | "ACCEPTED" | "REJECTED";
export type DisputeStatus = "OPEN" | "RESOLVED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface RentalDepositCase {
  id: string;
  propertyName: string;
  propertyAddress: string;
  tenantName: string;
  tenantWalletAddress: string;
  landlordName: string;
  landlordWalletAddress: string;
  mediatorWalletAddress: string;
  depositAmount: number;
  assetCode: string;
  status: DepositCaseStatus;
  contractAddress: string;
  fundTxHash?: string;
  releaseTxHash?: string;
  rentalStartDate: string;
  rentalEndDate: string;
  depositTerms: string;
  deductionTerms: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceFile {
  id: string;
  caseId: string;
  phase: EvidencePhase;
  category: string;
  fileName: string;
  fileUrl: string;
  fileHash: string;
  description: string;
  uploadedByRole: UserRole;
  uploadedByWallet: string;
  createdAt: string;
}

export interface DeductionProposal {
  id: string;
  caseId: string;
  amount: number;
  reason: string;
  evidenceIds: string[];
  status: DeductionStatus;
  createdAt: string;
}

export interface Dispute {
  id: string;
  caseId: string;
  openedByRole: UserRole;
  reason: string;
  status: DisputeStatus;
  tenantAmount?: number;
  landlordAmount?: number;
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  caseId: string;
  actorRole: UserRole;
  actorWallet: string;
  action: string;
  message: string;
  txHash?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface WalletInteraction {
  id: string;
  walletAddress: string;
  action: string;
  txHash?: string;
  contractAddress?: string;
  caseId?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  role: UserRole;
  walletAddress: string;
  rating: number;
  workedWell: string;
  confusing: string;
  wouldUse: boolean;
  comment: string;
  contact?: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userRole: UserRole;
  walletAddress: string;
  path: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface ErrorLog {
  id: string;
  scope: "wallet" | "contract" | "api" | "ui";
  message: string;
  detail?: string;
  caseId?: string;
  createdAt: string;
}

export interface SubmissionMeta {
  publicRepoUrl: string;
  liveDemoUrl: string;
  contractDeploymentAddress: string;
  demoVideoUrl: string;
  screenshotsChecklist: string[];
}

export interface AppDatabase {
  users: User[];
  cases: RentalDepositCase[];
  evidences: EvidenceFile[];
  deductionProposals: DeductionProposal[];
  disputes: Dispute[];
  auditLogs: AuditLog[];
  walletInteractions: WalletInteraction[];
  feedback: Feedback[];
  analyticsEvents: AnalyticsEvent[];
  errorLogs: ErrorLog[];
  submissionMeta: SubmissionMeta;
}

export interface CaseRecord extends RentalDepositCase {
  evidences: EvidenceFile[];
  deductionProposal?: DeductionProposal;
  dispute?: Dispute;
  auditTimeline: AuditLog[];
}

export interface DashboardSummary {
  totalCases: number;
  fundedCases: number;
  openDisputes: number;
  closedCases: number;
  depositVolume: number;
  walletInteractions: number;
  feedbackCount: number;
  recentActivity: AuditLog[];
}

export interface FeedbackSummary {
  totalResponses: number;
  averageRating: number;
  positiveThemes: Array<{ label: string; count: number }>;
  confusingThemes: Array<{ label: string; count: number }>;
  wouldUsePercentage: number;
}

export interface AnalyticsSummary {
  totals: Record<string, number>;
  funnel: Array<{ stage: string; value: number }>;
  recentEvents: AnalyticsEvent[];
}

export interface MonitoringSummary {
  health: "healthy" | "watching" | "attention";
  totalErrors: number;
  walletErrors: number;
  contractErrors: number;
  apiErrors: number;
  latestErrors: ErrorLog[];
}

export interface ProofUser {
  walletAddress: string;
  role: UserRole;
  connectedAt: string;
  lastAction: string;
  txHash?: string;
  feedbackSubmitted: boolean;
}

export interface SubmissionSummary {
  repoUrl: string;
  liveDemoUrl: string;
  contractAddress: string;
  demoVideoUrl: string;
  analyticsReady: boolean;
  monitoringReady: boolean;
  readmeReady: boolean;
  commitsReady: boolean;
  screenshotsChecklist: string[];
  totalOnboardedUsers: number;
  uniqueWalletAddresses: number;
  proofUsers: ProofUser[];
}

export interface BootstrapPayload {
  users: User[];
  cases: CaseRecord[];
  feedback: Feedback[];
  dashboard: DashboardSummary;
  analytics: AnalyticsSummary;
  feedbackSummary: FeedbackSummary;
  monitoring: MonitoringSummary;
  submission: SubmissionSummary;
}
