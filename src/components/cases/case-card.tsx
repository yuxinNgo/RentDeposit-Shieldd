import Link from "next/link";
import { ArrowRight, Building2, CalendarRange } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/utils";
import type { CaseRecord } from "@/lib/types";

export function CaseCard({ caseItem }: { caseItem: CaseRecord }) {
  return (
    <Card className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Escrow case</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{caseItem.propertyName}</h3>
          </div>
          <StatusBadge status={caseItem.status} />
        </div>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{caseItem.propertyAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            <span>
              {formatDate(caseItem.rentalStartDate)} to {formatDate(caseItem.rentalEndDate)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Deposit</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {currency(caseItem.depositAmount, caseItem.assetCode)}
          </p>
        </div>
        <Link
          href={`/cases/${caseItem.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
        >
          Open case
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
