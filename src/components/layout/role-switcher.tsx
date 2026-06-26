"use client";

import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/constants";
import { getDefaultRouteForRole, isPathAllowedForRole } from "@/lib/navigation";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Select } from "@/components/ui/select";

export function RoleSwitcher() {
  const { session, setRole } = useAppSession();
  const pathname = usePathname();
  const router = useRouter();

  function handleRoleChange(nextRole: typeof session.role) {
    setRole(nextRole);

    if (!isPathAllowedForRole(nextRole, pathname)) {
      router.replace(getDefaultRouteForRole(nextRole));
    }
  }

  return (
    <div className="min-w-32">
      <Select value={session.role} onChange={(event) => handleRoleChange(event.target.value as typeof session.role)}>
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </Select>
    </div>
  );
}
