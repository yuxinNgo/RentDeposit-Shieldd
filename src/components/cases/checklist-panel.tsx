import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CaseRecord } from "@/lib/types";

export function ChecklistPanel({ caseRecord }: { caseRecord: CaseRecord }) {
  const items = [
    {
      label: "Wallet funded escrow",
      done: Boolean(caseRecord.fundTxHash),
    },
    {
      label: "Move-in evidence attached",
      done: caseRecord.evidences.some((entry) => entry.phase === "MOVE_IN"),
    },
    {
      label: "Move-out evidence attached",
      done: caseRecord.evidences.some((entry) => entry.phase === "MOVE_OUT"),
    },
    {
      label: "Dispute resolution ready",
      done: caseRecord.status !== "DISPUTED",
    },
  ];

  return (
    <Card>
      <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Case readiness checklist</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--green)]" />
            ) : (
              <CircleDashed className="h-4 w-4 text-[var(--amber)]" />
            )}
            <span className="text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
