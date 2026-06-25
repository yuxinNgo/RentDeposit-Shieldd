import { FileText, Fingerprint } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { shortHash } from "@/lib/utils";
import type { EvidenceFile } from "@/lib/types";

export function EvidenceGallery({ evidences }: { evidences: EvidenceFile[] }) {
  if (evidences.length === 0) {
    return <EmptyState title="No evidence yet" description="Upload move-in, move-out or dispute files to build the case record." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {evidences.map((evidence) => (
        <Card key={evidence.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{evidence.fileName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {evidence.phase.replace("_", " ")} • {evidence.category}
              </p>
            </div>
            <div className="rounded-2xl bg-[rgba(63,111,231,0.08)] p-2 text-[var(--blue)]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{evidence.description}</p>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Fingerprint className="h-3.5 w-3.5" />
            {shortHash(evidence.fileHash)}
          </div>
        </Card>
      ))}
    </div>
  );
}
