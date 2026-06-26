import { z } from "zod";
import { isValidContractAddress, isValidPublicKey } from "@/lib/stellar/network";

const stellarPublicKeySchema = z.string().refine(isValidPublicKey, "Invalid Stellar account address.");
const contractAddressSchema = z.string().refine(isValidContractAddress, "Invalid Stellar contract address.");

export const createCaseSchema = z.object({
  propertyName: z.string().min(3),
  propertyAddress: z.string().min(5),
  tenantName: z.string().min(2),
  tenantWalletAddress: stellarPublicKeySchema,
  landlordName: z.string().min(2),
  landlordWalletAddress: stellarPublicKeySchema,
  mediatorWalletAddress: stellarPublicKeySchema,
  depositAmount: z.coerce.number().positive(),
  assetCode: z.string().trim().min(2).max(10),
  rentalStartDate: z.string().min(8),
  rentalEndDate: z.string().min(8),
  depositTerms: z.string().min(10),
  deductionTerms: z.string().min(10),
  contractAddress: contractAddressSchema,
  creationTxHash: z.string().min(10).optional(),
});

export const onboardingSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
  walletAddress: stellarPublicKeySchema,
});

export const feedbackSchema = z.object({
  role: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
  walletAddress: stellarPublicKeySchema,
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
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.literal("FUNDED"),
  }),
  z.object({
    type: z.literal("UPLOAD_EVIDENCE"),
    actorRole: z.enum(["TENANT", "LANDLORD", "MEDIATOR", "ADMIN"]),
    actorWallet: stellarPublicKeySchema,
    phase: z.enum(["MOVE_IN", "MOVE_OUT", "DISPUTE"]),
    category: z.string().min(2),
    fileName: z.string().min(2),
    description: z.string().min(4),
  }),
  z.object({
    type: z.literal("CONFIRM_MOVE_IN"),
    actorRole: z.enum(["TENANT", "LANDLORD"]),
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.literal("MOVE_IN_CONFIRMED"),
  }),
  z.object({
    type: z.literal("REQUEST_REFUND"),
    actorRole: z.literal("TENANT"),
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.literal("REFUND_REQUESTED"),
  }),
  z.object({
    type: z.literal("APPROVE_FULL_REFUND"),
    actorRole: z.literal("LANDLORD"),
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.literal("REFUNDED"),
  }),
  z.object({
    type: z.literal("PROPOSE_DEDUCTION"),
    actorRole: z.literal("LANDLORD"),
    actorWallet: stellarPublicKeySchema,
    amount: z.coerce.number().positive(),
    reason: z.string().min(4),
    evidenceIds: z.array(z.string()).default([]),
    txHash: z.string().min(10),
    resultingStatus: z.literal("DEDUCTION_PROPOSED"),
  }),
  z.object({
    type: z.literal("ACCEPT_DEDUCTION"),
    actorRole: z.literal("TENANT"),
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.enum(["PARTIALLY_REFUNDED", "RELEASED_TO_LANDLORD"]),
  }),
  z.object({
    type: z.literal("OPEN_DISPUTE"),
    actorRole: z.enum(["TENANT", "LANDLORD"]),
    actorWallet: stellarPublicKeySchema,
    reason: z.string().min(4),
    txHash: z.string().min(10),
    resultingStatus: z.literal("DISPUTED"),
  }),
  z.object({
    type: z.literal("RESOLVE_DISPUTE"),
    actorRole: z.literal("MEDIATOR"),
    actorWallet: stellarPublicKeySchema,
    tenantAmount: z.coerce.number().nonnegative(),
    landlordAmount: z.coerce.number().nonnegative(),
    resolutionNote: z.string().min(4),
    txHash: z.string().min(10),
    resultingStatus: z.literal("CLOSED"),
  }),
  z.object({
    type: z.literal("CLOSE_CASE"),
    actorRole: z.enum(["LANDLORD", "MEDIATOR"]),
    actorWallet: stellarPublicKeySchema,
    txHash: z.string().min(10),
    resultingStatus: z.literal("CLOSED"),
  }),
]);
