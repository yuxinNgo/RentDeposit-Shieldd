"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/use-app-data";
import { ActionPanel } from "@/components/cases/action-panel";
import { AuditTimeline } from "@/components/cases/audit-timeline";
import { CaseDetailHeader } from "@/components/cases/case-detail-header";
import { ChecklistPanel } from "@/components/cases/checklist-panel";
import { DepositSummaryCard } from "@/components/cases/deposit-summary-card";
import { EvidenceGallery } from "@/components/cases/evidence-gallery";
import { EvidenceUploadCard } from "@/components/cases/evidence-upload-card";
import { DisputeResolutionPanel } from "@/components/disputes/dispute-resolution-panel";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card } from "@/components/ui/card";

export function CaseDetailScreen({ caseId }: { caseId: string }) {
  const { data, isLoading, error, refresh } = useAppData();

  const caseRecord = useMemo(() => data?.cases.find((entry) => entry.id === caseId), [data, caseId]);

  if (isLoading) {
    return <LoadingState label="Loading case detail..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load this case."} onRetry={() => void refresh()} />;
  }

  if (!caseRecord) {
    return <EmptyState title="Case not found" description="The requested case does not exist in the local store." />;
  }

  return (
    <div className="space-y-6">
      <CaseDetailHeader caseRecord={caseRecord} />
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <DepositSummaryCard caseRecord={caseRecord} />
          <EvidenceUploadCard caseId={caseId} onUpdated={refresh} />
          <EvidenceGallery evidences={caseRecord.evidences} />
        </div>
        <div className="space-y-6">
          <ChecklistPanel caseRecord={caseRecord} />
          <ActionPanel caseRecord={caseRecord} onUpdated={refresh} />
        </div>
      </section>

      {caseRecord.status === "DISPUTED" ? (
        <DisputeResolutionPanel caseRecord={caseRecord} onUpdated={refresh} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Escrow terms</p>
          <div className="space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p>{caseRecord.depositTerms}</p>
            <p>{caseRecord.deductionTerms}</p>
          </div>
        </Card>
        <AuditTimeline items={caseRecord.auditTimeline} />
      </section>
    </div>
  );
}
