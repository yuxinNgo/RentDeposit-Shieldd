import { Card } from "@/components/ui/card";
import { TransactionHashLink } from "@/components/common/transaction-hash-link";
import { currency } from "@/lib/utils";
import type { CaseRecord } from "@/lib/types";

export function DepositSummaryCard({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Escrow and release proof</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Contract, funding hash and release hash are surfaced for every case.
          </p>
        </div>
        <p className="text-xl font-semibold text-[var(--text-primary)]">
          {currency(caseRecord.depositAmount, caseRecord.assetCode)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Contract address</p>
          <div className="mt-2">
            <TransactionHashLink hash={caseRecord.contractAddress} kind="contract" />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Fund transaction</p>
          <div className="mt-2">
            <TransactionHashLink hash={caseRecord.fundTxHash} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Release transaction</p>
          <div className="mt-2">
            <TransactionHashLink hash={caseRecord.releaseTxHash} />
          </div>
        </div>
      </div>
    </Card>
  );
}
