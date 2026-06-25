import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className="rounded-2xl bg-[rgba(63,111,231,0.1)] p-2 text-[var(--blue)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </Card>
  );
}
