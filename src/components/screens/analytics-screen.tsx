"use client";

import { useAppData } from "@/hooks/use-app-data";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { MonitoringStatusCard } from "@/components/analytics/monitoring-status-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/common/metric-card";
import { BarChart3, CircleDollarSign, Eye, UserRoundCheck } from "lucide-react";

export function AnalyticsScreen() {
  const { data, isLoading, error, refresh } = useAppData();

  if (isLoading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load analytics."} onRetry={() => void refresh()} />;
  }

  const totals = data.analytics.totals;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Eye} label="Page views" value={String(totals.page_view ?? 0)} description="Tracked directly from the app event stream." />
        <MetricCard icon={UserRoundCheck} label="Wallet connects" value={String(totals.wallet_connected ?? 0)} description="Connection proofs ready for submission." />
        <MetricCard icon={CircleDollarSign} label="Deposits funded" value={String(totals.deposit_funded ?? 0)} description="Cases where escrow funding completed." />
        <MetricCard icon={BarChart3} label="Feedback" value={String(totals.feedback_submitted ?? data.feedback.length)} description="Responses from demo participants." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AnalyticsPanel analytics={data.analytics} />
        <MonitoringStatusCard monitoring={data.monitoring} />
      </section>

      <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Recent events</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Latest tracked analytics events from seeded and local demo traffic.</p>
        </div>
        {data.analytics.recentEvents.length === 0 ? (
          <EmptyState title="No events yet" description="Interact with the app to populate analytics events." />
        ) : (
          <div className="space-y-3">
            {data.analytics.recentEvents.map((event) => (
              <div key={event.id} className="rounded-[22px] border border-[var(--border)] bg-white/80 px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{event.eventName}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {event.userRole} • {event.path}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
