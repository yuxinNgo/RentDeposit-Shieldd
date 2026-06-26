import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RoleRouteGuard } from "@/components/layout/role-route-guard";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell py-4 pb-24 lg:pb-8">
      <RoleRouteGuard />
      <div className="flex gap-6">
        <Sidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <Topbar />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
