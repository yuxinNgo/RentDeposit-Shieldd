import { STATUS_LABELS } from "@/lib/constants";
import type { DepositCaseStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const toneMap: Record<DepositCaseStatus, string> = {
  CREATED: "border-[rgba(63,111,231,0.16)] bg-[rgba(63,111,231,0.08)] text-[var(--blue)]",
  FUNDED: "border-[rgba(15,142,131,0.16)] bg-[rgba(15,142,131,0.08)] text-[var(--teal)]",
  MOVE_IN_CONFIRMED: "border-[rgba(43,138,87,0.16)] bg-[rgba(43,138,87,0.08)] text-[var(--green)]",
  REFUND_REQUESTED: "border-[rgba(209,138,45,0.16)] bg-[rgba(209,138,45,0.08)] text-[var(--amber)]",
  DEDUCTION_PROPOSED: "border-[rgba(184,82,82,0.16)] bg-[rgba(184,82,82,0.08)] text-[var(--coral)]",
  DISPUTED: "border-[rgba(184,82,82,0.16)] bg-[rgba(184,82,82,0.08)] text-[var(--coral)]",
  REFUNDED: "border-[rgba(43,138,87,0.16)] bg-[rgba(43,138,87,0.08)] text-[var(--green)]",
  PARTIALLY_REFUNDED: "border-[rgba(209,138,45,0.16)] bg-[rgba(209,138,45,0.08)] text-[var(--amber)]",
  RELEASED_TO_LANDLORD: "border-[rgba(22,56,93,0.16)] bg-[rgba(22,56,93,0.08)] text-[var(--navy)]",
  CLOSED: "border-[rgba(21,34,56,0.16)] bg-[rgba(21,34,56,0.06)] text-[var(--text-primary)]",
};

export function StatusBadge({ status }: { status: DepositCaseStatus }) {
  return <Badge className={toneMap[status]}>{STATUS_LABELS[status]}</Badge>;
}
