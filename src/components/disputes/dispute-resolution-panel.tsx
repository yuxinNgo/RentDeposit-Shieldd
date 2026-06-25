"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resolveDisputeOnChain } from "@/lib/stellar/contract-client";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CaseRecord } from "@/lib/types";

export function DisputeResolutionPanel({
  caseRecord,
  onUpdated,
}: {
  caseRecord: CaseRecord;
  onUpdated: () => Promise<unknown>;
}) {
  const { session } = useAppSession();
  const [tenantAmount, setTenantAmount] = useState(caseRecord.depositAmount * 0.8);
  const [landlordAmount, setLandlordAmount] = useState(caseRecord.depositAmount * 0.2);
  const [resolutionNote, setResolutionNote] = useState("Mediator reviewed the evidence and split cleaning vs wear-and-tear charges.");
  const [isPending, startTransition] = useTransition();

  function submitResolution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await resolveDisputeOnChain(
        caseRecord.id,
        session.walletAddress,
        Number(tenantAmount),
        Number(landlordAmount),
        resolutionNote,
      );

      if (!result.success) {
        toast.error(result.errorMessage ?? "Could not resolve dispute.");
        return;
      }

      toast.success("Dispute resolved.");
      await onUpdated();
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Mediator resolution panel</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Only the mediator role can sign the final split while the case is disputed.
        </p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submitResolution}>
        <Input type="number" value={tenantAmount} onChange={(event) => setTenantAmount(Number(event.target.value))} placeholder="Tenant amount" />
        <Input type="number" value={landlordAmount} onChange={(event) => setLandlordAmount(Number(event.target.value))} placeholder="Landlord amount" />
        <div className="md:col-span-2">
          <Textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Resolution note" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isPending || session.role !== "MEDIATOR" || !session.walletAddress}>
            {isPending ? "Resolving..." : "Resolve dispute"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
