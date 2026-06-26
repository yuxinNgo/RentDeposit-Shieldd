"use client";

import Link from "next/link";
import { BarChart3, CircleDollarSign, FileStack, Gavel, MessagesSquare, Wallet } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { MetricCard } from "@/components/common/metric-card";
import { CaseCard } from "@/components/cases/case-card";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { MonitoringStatusCard } from "@/components/analytics/monitoring-status-card";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/utils";

export function DashboardScreen() {
  const { data, isLoading, error, refresh } = useAppData();

  if (isLoading) {
    return <LoadingState label="Loading dashboard metrics..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load dashboard."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={FileStack} label="Total cases" value={String(data.dashboard.totalCases)} description="Across live and closed on-chain deposit workflows." />
        <MetricCard icon={CircleDollarSign} label="Funded cases" value={String(data.dashboard.fundedCases)} description="Cases with the escrow flow already funded on Stellar testnet." />
        <MetricCard icon={Gavel} label="Open disputes" value={String(data.dashboard.openDisputes)} description="Cases currently queued for mediator review." />
        <MetricCard icon={Wallet} label="Wallet interactions" value={String(data.dashboard.walletInteractions)} description="Real wallet events recorded after successful connections or signatures." />
        <MetricCard icon={MessagesSquare} label="Feedback count" value={String(data.dashboard.feedbackCount)} description="Direct comments from test participants." />
        <MetricCard icon={BarChart3} label="Volume" value={currency(data.dashboard.depositVolume)} description="Total escrow volume across cases stored in the Neon workspace." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <AnalyticsPanel analytics={data.analytics} />
        <MonitoringStatusCard monitoring={data.monitoring} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {data.cases.length === 0 ? (
          <EmptyState title="No on-chain cases yet" description="Connect a landlord wallet and create the first Stellar testnet case from /cases/new." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.cases.slice(0, 4).map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        )}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Recent activity</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Fast scan of the last workflow transitions.</p>
            </div>
            <Link href="/cases" className="text-sm font-semibold text-[var(--blue)]">
              View all
            </Link>
          </div>
          {data.dashboard.recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No activity yet. Connect a real wallet and create a case to start the audit trail.</p>
          ) : (
            <div className="space-y-3">
              {data.dashboard.recentActivity.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-[var(--border)] bg-white/80 px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{formatDate(item.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
