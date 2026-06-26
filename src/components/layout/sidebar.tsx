"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleMission, getRoleNavItems, isNavItemActive } from "@/lib/navigation";
import { NetworkBadge } from "@/components/common/network-badge";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { session } = useAppSession();
  const navItems = getRoleNavItems(session.role);
  const mission = getRoleMission(session.role);
  const PrimaryActionIcon = mission.primaryActionIcon;

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-[28px] border border-[var(--border)] bg-[rgba(255,253,248,0.86)] p-6 shadow-[0_20px_50px_rgba(21,34,56,0.10)] lg:flex">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-3 py-2">
          <div className="rounded-2xl bg-[rgba(63,111,231,0.12)] p-2 text-[var(--blue)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">RentDeposit Shield</p>
            <p className="text-xs text-[var(--text-muted)]">Stellar testnet escrow workspace</p>
          </div>
        </div>
        <NetworkBadge />
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item, pathname);

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
        <p className="mb-2 text-sm font-semibold">{mission.missionTitle}</p>
        <p className="mb-4 text-sm text-white/75">{mission.missionDescription}</p>
        <Link href={mission.defaultHref} className="block">
          <Button className="w-full bg-white text-[var(--navy)] hover:bg-white/90">
            <PrimaryActionIcon className="h-4 w-4" />
            {mission.primaryActionLabel}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
