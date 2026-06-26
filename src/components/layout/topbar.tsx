"use client";

import { usePathname } from "next/navigation";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { WalletConnectButton } from "@/components/layout/wallet-connect-button";
import { NetworkBadge } from "@/components/common/network-badge";
import { useAppSession } from "@/components/providers/app-client-provider";

function pageTitle(pathname: string) {
  if (pathname.startsWith("/cases/new")) return "Create a new deposit case";
  if (pathname.startsWith("/cases/")) return "Deposit case detail";
  if (pathname.startsWith("/cases")) return "Case workspace";
  if (pathname.startsWith("/disputes")) return "Mediator dispute desk";
  if (pathname.startsWith("/analytics")) return "Usage and product analytics";
  if (pathname.startsWith("/feedback")) return "User feedback and validation";
  if (pathname.startsWith("/submission")) return "Startup track submission kit";
  if (pathname.startsWith("/dashboard")) return "Operations overview";
  return "RentDeposit Shield";
}

export function Topbar() {
  const pathname = usePathname();
  const { session } = useAppSession();
  const displayName = session.name.trim() || session.role.toLowerCase();

  return (
    <header className="panel sticky top-4 z-20 rounded-[28px] px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Rental deposit protection</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{pageTitle(pathname)}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Signed in as <span className="font-semibold text-[var(--text-primary)]">{displayName}</span> with the{" "}
            {session.role.toLowerCase()} lens.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <NetworkBadge />
          <RoleSwitcher />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
