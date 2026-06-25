"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, ShieldCheck } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NetworkBadge } from "@/components/common/network-badge";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-[28px] border border-[var(--border)] bg-[rgba(255,253,248,0.86)] p-6 shadow-[0_20px_50px_rgba(21,34,56,0.10)] lg:flex">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-3 py-2">
          <div className="rounded-2xl bg-[rgba(63,111,231,0.12)] p-2 text-[var(--blue)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">RentDeposit Shield</p>
            <p className="text-xs text-[var(--text-muted)]">Testnet-only escrow demo</p>
          </div>
        </div>
        <NetworkBadge />
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--navy)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)]",
              )}
            >
              {item.label}
              <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-white" : "bg-[var(--border-strong)]")} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] bg-[var(--navy)] p-5 text-white">
        <p className="mb-2 text-sm font-semibold">Case creation stays inside this app</p>
        <p className="mb-4 text-sm text-white/75">
          No separate backend. Every flow writes through Next.js API routes into the local demo store.
        </p>
        <Button className="w-full bg-white text-[var(--navy)] hover:bg-white/90" onClick={() => (window.location.href = "/cases/new")}>
          <FilePlus2 className="h-4 w-4" />
          Create case
        </Button>
      </div>
    </aside>
  );
}
