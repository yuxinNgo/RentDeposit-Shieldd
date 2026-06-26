import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MonitoringSummary } from "@/lib/types";

export function MonitoringStatusCard({ monitoring }: { monitoring: MonitoringSummary }) {
  const tone =
    monitoring.health === "healthy"
      ? "text-[var(--green)]"
      : monitoring.health === "watching"
        ? "text-[var(--amber)]"
        : "text-[var(--coral)]";

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Monitoring status</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Custom error logging captures wallet, contract and API issues across the local app runtime.
          </p>
        </div>
        {monitoring.health === "healthy" ? (
          <ShieldCheck className={`h-5 w-5 ${tone}`} />
        ) : (
          <AlertTriangle className={`h-5 w-5 ${tone}`} />
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[22px] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Wallet</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{monitoring.walletErrors}</p>
        </div>
        <div className="rounded-[22px] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Contract</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{monitoring.contractErrors}</p>
        </div>
        <div className="rounded-[22px] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">API</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{monitoring.apiErrors}</p>
        </div>
      </div>
      <div className="space-y-3">
        {monitoring.latestErrors.map((entry) => (
          <div key={entry.id} className="rounded-[20px] border border-[var(--border)] bg-white/80 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.message}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{entry.scope}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
