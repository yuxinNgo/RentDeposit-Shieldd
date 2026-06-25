"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  acceptDeductionOnChain,
  approveFullRefundOnChain,
  confirmMoveInOnChain,
  fundDepositOnChain,
  openDisputeOnChain,
  proposeDeductionOnChain,
  requestRefundOnChain,
} from "@/lib/stellar/contract-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppSession } from "@/components/providers/app-client-provider";
import type { CaseRecord } from "@/lib/types";

export function ActionPanel({
  caseRecord,
  onUpdated,
}: {
  caseRecord: CaseRecord;
  onUpdated: () => Promise<unknown>;
}) {
  const { session } = useAppSession();
  const [deductionAmount, setDeductionAmount] = useState(Math.round(caseRecord.depositAmount * 0.15));
  const [deductionReason, setDeductionReason] = useState("Deep cleaning and wall touch-up based on documented damage.");
  const [disputeReason, setDisputeReason] = useState("The proposed deduction is higher than the documented damage.");
  const [isPending, startTransition] = useTransition();

  const canFund = session.role === "TENANT" && caseRecord.status === "CREATED";
  const canConfirmMoveIn = ["TENANT", "LANDLORD"].includes(session.role) && caseRecord.status === "FUNDED";
  const canRequestRefund = session.role === "TENANT" && caseRecord.status === "MOVE_IN_CONFIRMED";
  const canApproveRefund = session.role === "LANDLORD" && caseRecord.status === "REFUND_REQUESTED";
  const canProposeDeduction = session.role === "LANDLORD" && caseRecord.status === "REFUND_REQUESTED";
  const canAcceptDeduction = session.role === "TENANT" && caseRecord.status === "DEDUCTION_PROPOSED";
  const canOpenDispute = ["TENANT", "LANDLORD"].includes(session.role) && ["REFUND_REQUESTED", "DEDUCTION_PROPOSED"].includes(caseRecord.status);

  const availableActions = useMemo(
    () =>
      [
        canFund && "Fund deposit",
        canConfirmMoveIn && "Confirm move-in",
        canRequestRefund && "Request refund",
        canApproveRefund && "Approve full refund",
        canProposeDeduction && "Propose deduction",
        canAcceptDeduction && "Accept deduction",
        canOpenDispute && "Open dispute",
      ].filter(Boolean) as string[],
    [canFund, canConfirmMoveIn, canRequestRefund, canApproveRefund, canProposeDeduction, canAcceptDeduction, canOpenDispute],
  );

  async function run(action: () => Promise<{ success: boolean; errorMessage?: string }>, successMessage: string) {
    const result = await action();

    if (!result.success) {
      toast.error(result.errorMessage ?? "This action failed.");
      return;
    }

    toast.success(successMessage);
    await onUpdated();
  }

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Role-based action panel</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Available actions adapt to the selected role and the case lifecycle.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {canFund ? (
          <Button
            disabled={isPending || !session.walletAddress}
            onClick={() =>
              startTransition(() => {
                void run(
                  () => fundDepositOnChain(caseRecord.id, "TENANT", session.walletAddress),
                  "Deposit funded on demo testnet.",
                );
              })
            }
          >
            Fund deposit
          </Button>
        ) : null}
        {canConfirmMoveIn ? (
          <Button
            variant="secondary"
            disabled={isPending || !session.walletAddress}
            onClick={() =>
              startTransition(() => {
                void run(
                  () => confirmMoveInOnChain(caseRecord.id, session.role as "TENANT" | "LANDLORD", session.walletAddress),
                  "Move-in confirmed.",
                );
              })
            }
          >
            Confirm move-in
          </Button>
        ) : null}
        {canRequestRefund ? (
          <Button
            variant="secondary"
            disabled={isPending || !session.walletAddress}
            onClick={() =>
              startTransition(() => {
                void run(() => requestRefundOnChain(caseRecord.id, session.walletAddress), "Refund requested.");
              })
            }
          >
            Request refund
          </Button>
        ) : null}
        {canApproveRefund ? (
          <Button
            disabled={isPending || !session.walletAddress}
            onClick={() =>
              startTransition(() => {
                void run(() => approveFullRefundOnChain(caseRecord.id, session.walletAddress), "Full refund approved.");
              })
            }
          >
            Approve full refund
          </Button>
        ) : null}
        {canAcceptDeduction ? (
          <Button
            variant="secondary"
            disabled={isPending || !session.walletAddress}
            onClick={() =>
              startTransition(() => {
                void run(() => acceptDeductionOnChain(caseRecord.id, session.walletAddress), "Deduction accepted.");
              })
            }
          >
            Accept deduction
          </Button>
        ) : null}
      </div>

      {canProposeDeduction ? (
        <div className="grid gap-3 rounded-[24px] border border-[var(--border)] bg-white/70 p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Deduction proposal</p>
          <Input type="number" value={deductionAmount} onChange={(event) => setDeductionAmount(Number(event.target.value))} placeholder="Deduction amount" />
          <Textarea value={deductionReason} onChange={(event) => setDeductionReason(event.target.value)} placeholder="Reason" />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              disabled={isPending || !session.walletAddress}
              onClick={() =>
                startTransition(() => {
                  void run(
                    () => proposeDeductionOnChain(caseRecord.id, session.walletAddress, deductionAmount, deductionReason),
                    "Deduction proposed.",
                  );
                })
              }
            >
              Submit deduction
            </Button>
          </div>
        </div>
      ) : null}

      {canOpenDispute ? (
        <div className="grid gap-3 rounded-[24px] border border-[var(--border)] bg-white/70 p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Dispute intake</p>
          <Textarea value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} placeholder="Why this needs mediation" />
          <div className="flex justify-end">
            <Button
              variant="danger"
              disabled={isPending || !session.walletAddress}
              onClick={() =>
                startTransition(() => {
                  void run(
                    () => openDisputeOnChain(caseRecord.id, session.role as "TENANT" | "LANDLORD", session.walletAddress, disputeReason),
                    "Dispute opened.",
                  );
                })
              }
            >
              Open dispute
            </Button>
          </div>
        </div>
      ) : null}

      {availableActions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          No actions are available for the current role and status. Switch roles or move the case to the next stage.
        </p>
      ) : null}
    </Card>
  );
}
