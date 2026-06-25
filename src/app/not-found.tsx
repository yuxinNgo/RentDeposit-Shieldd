import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center py-12 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">404</p>
      <h2 className="mt-2 text-4xl font-semibold text-[var(--text-primary)]">Route not found</h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
        The path does not exist in this RentDeposit Shield workspace.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
