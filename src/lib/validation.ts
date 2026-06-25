import { z } from "zod";

export const createCaseSchema = z.object({
  propertyName: z.string().min(3),
  propertyAddress: z.string().min(5),
  tenantName: z.string().min(2),
  tenantWalletAddress: z.string().min(10),
  landlordName: z.string().min(2),
  landlordWalletAddress: z.string().min(10),
  mediatorWalletAddress: z.string().min(10),
  depositAmount: z.coerce.number().positive(),
  assetCode: z.string().min(2).max(10),
  rentalStartDate: z.string().min(8),
  rentalEndDate: z.string().min(8),
  depositTerms: z.string().min(10),
  deductionTerms: z.string().min(10),
});

export const onboardingSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
  walletAddress: z.string().min(10),
});

export const feedbackSchema = z.object({
  role: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
  walletAddress: z.string().min(10),
  rating: z.coerce.number().min(1).max(5),
  workedWell: z.string().min(4),
  confusing: z.string().min(4),
  wouldUse: z.boolean(),
  comment: z.string().min(4),
  contact: z.string().optional(),
});

export const caseActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("FUND_DEPOSIT"),
    actorRole: z.literal("TENANT"),
    actorWallet: z.string().min(10),
  }),
  z.object({
    type: z.literal("UPLOAD_EVIDENCE"),
    actorRole: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
    actorWallet: z.string().min(10),
    phase: z.enum(["MOVE_IN", "MOVE_OUT", "DISPUTE"]),
    category: z.string().min(2),
    fileName: z.string().min(2),
    description: z.string().min(4),
  }),
  z.object({
    type: z.literal("CONFIRM_MOVE_IN"),
    actorRole: z.enum(["TENANT", "LANDLORD"]),
    actorWallet: z.string().min(10),
  }),
  z.object({
    type: z.literal("REQUEST_REFUND"),
    actorRole: z.literal("TENANT"),
    actorWallet: z.string().min(10),
  }),
  z.object({
    type: z.literal("APPROVE_FULL_REFUND"),
    actorRole: z.literal("LANDLORD"),
    actorWallet: z.string().min(10),
  }),
  z.object({
    type: z.literal("PROPOSE_DEDUCTION"),
    actorRole: z.literal("LANDLORD"),
    actorWallet: z.string().min(10),
    amount: z.coerce.number().positive(),
    reason: z.string().min(4),
    evidenceIds: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("ACCEPT_DEDUCTION"),
    actorRole: z.literal("TENANT"),
    actorWallet: z.string().min(10),
  }),
  z.object({
    type: z.literal("OPEN_DISPUTE"),
    actorRole: z.enum(["TENANT", "LANDLORD"]),
    actorWallet: z.string().min(10),
    reason: z.string().min(4),
  }),
  z.object({
    type: z.literal("RESOLVE_DISPUTE"),
    actorRole: z.literal("MEDIATOR"),
    actorWallet: z.string().min(10),
    tenantAmount: z.coerce.number().nonnegative(),
    landlordAmount: z.coerce.number().nonnegative(),
    resolutionNote: z.string().min(4),
  }),
]);
