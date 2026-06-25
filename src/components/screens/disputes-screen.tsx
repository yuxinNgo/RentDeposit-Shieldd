"use client";

import { useAppData } from "@/hooks/use-app-data";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { CaseCard } from "@/components/cases/case-card";
import { DisputeResolutionPanel } from "@/components/disputes/dispute-resolution-panel";
import { Card } from "@/components/ui/card";

export function DisputesScreen() {
  const { data, isLoading, error, refresh } = useAppData();

  if (isLoading) {
    return <LoadingState label="Loading disputes..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load disputes."} onRetry={() => void refresh()} />;
  }

  const disputedCases = data.cases.filter((entry) => entry.status === "DISPUTED");

  if (disputedCases.length === 0) {
    return <EmptyState title="No active disputes" description="Once a tenant or landlord opens a dispute, it will appear here for mediator review." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        {disputedCases.map((caseRecord) => (
          <CaseCard key={caseRecord.id} caseItem={caseRecord} />
        ))}
      </div>
      {disputedCases.map((caseRecord) => (
        <Card key={`${caseRecord.id}-desk`} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{caseRecord.propertyName}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{caseRecord.dispute?.reason}</p>
          </div>
          <DisputeResolutionPanel caseRecord={caseRecord} onUpdated={refresh} />
        </Card>
      ))}
    </div>
  );
}
