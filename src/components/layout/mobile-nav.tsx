"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRoleNavItems, isNavItemActive } from "@/lib/navigation";
import { useAppSession } from "@/components/providers/app-client-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { session } = useAppSession();
  const items = getRoleNavItems(session.role);

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1rem)] max-w-md -translate-x-1/2 justify-between rounded-full border border-[var(--border)] bg-[rgba(255,253,248,0.95)] px-4 py-2 shadow-[0_20px_60px_rgba(21,34,56,0.14)] lg:hidden">
      {items.map((item) => {
        const isActive = isNavItemActive(item, pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-14 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold",
              isActive ? "bg-[var(--navy)] text-white" : "text-[var(--text-secondary)]",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
