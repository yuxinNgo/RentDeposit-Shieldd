import type { DepositCaseStatus, UserRole } from "@/lib/types";

export const APP_NAME = "RentDeposit Shield";
export const LOCAL_STORAGE_SESSION_KEY = "rentdeposit-shield-session";
export const NETWORK_LABEL = "Stellar Testnet";
export const DEMO_CONTRACT_ADDRESS = "CD7MRENTDEPOSITESCROWTESTNETPLACEHOLDER000000000000";
export const STELLAR_EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

export const ROLE_LABELS: Record<UserRole, string> = {
  TENANT: "Tenant",
  LANDLORD: "Landlord",
  MEDIATOR: "Mediator",
  ADMIN: "Admin",
};

export const STATUS_LABELS: Record<DepositCaseStatus, string> = {
  CREATED: "Created",
  FUNDED: "Funded",
  MOVE_IN_CONFIRMED: "Move-in confirmed",
  REFUND_REQUESTED: "Refund requested",
  DEDUCTION_PROPOSED: "Deduction proposed",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
  RELEASED_TO_LANDLORD: "Released to landlord",
  CLOSED: "Closed",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cases", label: "Cases" },
  { href: "/disputes", label: "Disputes" },
  { href: "/analytics", label: "Analytics" },
  { href: "/feedback", label: "Feedback" },
  { href: "/submission", label: "Submission" },
];

export const ROLE_OPTIONS: UserRole[] = ["LANDLORD", "TENANT", "MEDIATOR", "ADMIN"];

export const EVENT_NAMES = [
  "page_view",
  "onboarding_started",
  "onboarding_completed",
  "wallet_connect_clicked",
  "wallet_connected",
  "wallet_connection_failed",
  "case_created",
  "deposit_funded",
  "move_in_evidence_uploaded",
  "refund_requested",
  "deduction_proposed",
  "deduction_accepted",
  "dispute_opened",
  "dispute_resolved",
  "feedback_submitted",
  "submission_page_viewed",
] as const;
