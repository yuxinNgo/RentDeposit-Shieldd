import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STELLAR_EXPLORER_BASE } from "@/lib/constants";
import { shortHash } from "@/lib/utils";

export function TransactionHashLink({
  hash,
  kind = "tx",
}: {
  hash?: string;
  kind?: "tx" | "contract";
}) {
  if (!hash) {
    return <span className="text-sm text-[var(--text-muted)]">Pending</span>;
  }

  return (
    <Link
      href={`${STELLAR_EXPLORER_BASE}/${kind}/${hash}`}
      target="_blank"
      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--blue)]"
    >
      {shortHash(hash)}
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}
