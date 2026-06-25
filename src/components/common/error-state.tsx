import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  label,
  onRetry,
}: {
  label: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[rgba(184,82,82,0.22)] bg-[rgba(184,82,82,0.06)] p-6 text-left">
      <div className="mb-4 flex items-center gap-3 text-[var(--coral)]">
        <AlertTriangle className="h-5 w-5" />
        <p className="font-semibold">Something blocked this flow</p>
      </div>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">{label}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
