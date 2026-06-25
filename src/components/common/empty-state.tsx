import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-white/60 p-8 text-center">
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--blue)]" />
      <p className="mb-2 text-base font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
