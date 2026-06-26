"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDefaultRouteForRole, isPathAllowedForRole } from "@/lib/navigation";
import { useAppSession } from "@/components/providers/app-client-provider";

export function RoleRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAppSession();

  useEffect(() => {
    if (isPathAllowedForRole(session.role, pathname)) {
      return;
    }

    router.replace(getDefaultRouteForRole(session.role));
  }, [pathname, router, session.role]);

  return null;
}
