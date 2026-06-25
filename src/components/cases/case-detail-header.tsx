import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { currency, formatDate } from "@/lib/utils";
import type { CaseRecord } from "@/lib/types";

export function CaseDetailHeader({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <Card className="hero-mesh relative overflow-hidden">
      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Escrow case detail</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{caseRecord.propertyName}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{caseRecord.propertyAddress}</p>
        </div>
        <div className="grid gap-4 rounded-[24px] bg-white/80 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Status</p>
            <div className="mt-2">
              <StatusBadge status={caseRecord.status} />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Deposit</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {currency(caseRecord.depositAmount, caseRecord.assetCode)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Rental window</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              {formatDate(caseRecord.rentalStartDate)} to {formatDate(caseRecord.rentalEndDate)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
