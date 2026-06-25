"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { performCaseActionApi } from "@/lib/api/client";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EvidencePhase } from "@/lib/types";

export function EvidenceUploadCard({
  caseId,
  onUpdated,
}: {
  caseId: string;
  onUpdated: () => Promise<unknown>;
}) {
  const { session } = useAppSession();
  const [phase, setPhase] = useState<EvidencePhase>("MOVE_IN");
  const [fileName, setFileName] = useState("walkthrough-photo-set");
  const [category, setCategory] = useState("photos");
  const [description, setDescription] = useState("Condition evidence for the property walkthrough.");
  const [isPending, startTransition] = useTransition();

  function submitEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await performCaseActionApi(caseId, {
          type: "UPLOAD_EVIDENCE",
          actorRole: session.role,
          actorWallet: session.walletAddress,
          phase,
          category,
          fileName,
          description,
        });
        toast.success("Evidence uploaded.");
        await onUpdated();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload evidence.");
      }
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Evidence upload</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Store a file reference, category and description in the local audit trail.
        </p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submitEvidence}>
        <Select value={phase} onChange={(event) => setPhase(event.target.value as EvidencePhase)}>
          <option value="MOVE_IN">Move-in</option>
          <option value="MOVE_OUT">Move-out</option>
          <option value="DISPUTE">Dispute</option>
        </Select>
        <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
        <Input value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="File name" />
        <div className="md:col-span-2">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" variant="secondary" disabled={isPending || !session.walletAddress}>
            {isPending ? "Uploading..." : "Upload evidence"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
