import { Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TransactionHashLink } from "@/components/common/transaction-hash-link";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/lib/types";

export function AuditTimeline({ items }: { items: AuditLog[] }) {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Audit timeline</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Every state transition, transaction hash and wallet actor is preserved.
          </p>
        </div>
        <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-[22px] border border-[var(--border)] bg-white/80 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.message}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{formatDate(item.createdAt)}</p>
            </div>
            {item.txHash ? (
              <div className="mt-3">
                <TransactionHashLink hash={item.txHash} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
