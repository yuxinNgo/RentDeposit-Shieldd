"use client";

import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/constants";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Select } from "@/components/ui/select";

export function RoleSwitcher() {
  const { session, setRole } = useAppSession();

  return (
    <div className="min-w-32">
      <Select value={session.role} onChange={(event) => setRole(event.target.value as typeof session.role)}>
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </Select>
    </div>
  );
}
