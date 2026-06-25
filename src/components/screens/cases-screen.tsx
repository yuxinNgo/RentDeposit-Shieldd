"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { CaseCard } from "@/components/cases/case-card";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DepositCaseStatus } from "@/lib/types";

export function CasesScreen() {
  const { data, isLoading, error, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DepositCaseStatus | "ALL">("ALL");
  const deferredSearch = useDeferredValue(search);

  const filteredCases = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalized = deferredSearch.trim().toLowerCase();

    return data.cases.filter((entry) => {
      const matchesSearch =
        normalized.length === 0 ||
        entry.propertyName.toLowerCase().includes(normalized) ||
        entry.propertyAddress.toLowerCase().includes(normalized) ||
        entry.tenantName.toLowerCase().includes(normalized);
      const matchesStatus = status === "ALL" || entry.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [data, deferredSearch, status]);

  if (isLoading) {
    return <LoadingState label="Loading cases..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load cases."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <Input
            className="border-none bg-transparent px-0"
            value={search}
            onChange={(event) =>
              startTransition(() => {
                setSearch(event.target.value);
              })
            }
            placeholder="Search by property, address or tenant"
          />
        </div>
        <div className="flex gap-3">
          <Select value={status} onChange={(event) => setStatus(event.target.value as DepositCaseStatus | "ALL")} className="min-w-44">
            <option value="ALL">All statuses</option>
            <option value="CREATED">Created</option>
            <option value="FUNDED">Funded</option>
            <option value="MOVE_IN_CONFIRMED">Move-in confirmed</option>
            <option value="REFUND_REQUESTED">Refund requested</option>
            <option value="DEDUCTION_PROPOSED">Deduction proposed</option>
            <option value="DISPUTED">Disputed</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <Link href="/cases/new">
            <Button>Create case</Button>
          </Link>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <EmptyState title="No cases match this filter" description="Try a different status or clear the search query." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      )}
    </div>
  );
}
