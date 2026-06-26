"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDepositCaseOnChain } from "@/lib/stellar/contract-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppSession } from "@/components/providers/app-client-provider";

const defaultForm = {
  propertyName: "",
  propertyAddress: "",
  tenantName: "",
  tenantWalletAddress: "",
  landlordName: "Landlord",
  landlordWalletAddress: "",
  mediatorWalletAddress: "",
  depositAmount: 1800,
  assetCode: "USDC",
  rentalStartDate: "2026-07-01",
  rentalEndDate: "2026-12-31",
  depositTerms: "Deposit stays in escrow until the end-of-rental workflow is complete.",
  deductionTerms: "Deductions require attached evidence and tenant review.",
};

export function CreateCaseForm() {
  const { session } = useAppSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    ...defaultForm,
    landlordName: session.name || defaultForm.landlordName,
    landlordWalletAddress: session.walletAddress,
    mediatorWalletAddress: session.walletAddress || "",
  });

  function updateField(field: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createDepositCaseOnChain(form);

      if (!result.success) {
        toast.error(result.errorMessage ?? "Could not create the case.");
        return;
      }

      toast.success("Deposit case deployed on Stellar testnet.");
      router.push("/cases");
      router.refresh();
    });
  }

  return (
    <Card>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submitForm}>
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Property</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={form.propertyName} onChange={(event) => updateField("propertyName", event.target.value)} placeholder="Property name" />
            <Input value={form.propertyAddress} onChange={(event) => updateField("propertyAddress", event.target.value)} placeholder="Property address" />
          </div>
        </div>

        <Input value={form.tenantName} onChange={(event) => updateField("tenantName", event.target.value)} placeholder="Tenant name" />
        <Input value={form.tenantWalletAddress} onChange={(event) => updateField("tenantWalletAddress", event.target.value)} placeholder="Tenant wallet" />
        <Input value={form.landlordName} onChange={(event) => updateField("landlordName", event.target.value)} placeholder="Landlord name" />
        <Input value={form.landlordWalletAddress} onChange={(event) => updateField("landlordWalletAddress", event.target.value)} placeholder="Landlord wallet" />
        <Input value={form.mediatorWalletAddress} onChange={(event) => updateField("mediatorWalletAddress", event.target.value)} placeholder="Mediator wallet" />
        <Input type="number" value={form.depositAmount} onChange={(event) => updateField("depositAmount", Number(event.target.value))} placeholder="Deposit amount" />
        <Input value={form.assetCode} onChange={(event) => updateField("assetCode", event.target.value)} placeholder="Asset code" />
        <Input type="date" value={form.rentalStartDate} onChange={(event) => updateField("rentalStartDate", event.target.value)} />
        <Input type="date" value={form.rentalEndDate} onChange={(event) => updateField("rentalEndDate", event.target.value)} />
        <div className="md:col-span-2">
          <Textarea value={form.depositTerms} onChange={(event) => updateField("depositTerms", event.target.value)} placeholder="Deposit terms" />
        </div>
        <div className="md:col-span-2">
          <Textarea value={form.deductionTerms} onChange={(event) => updateField("deductionTerms", event.target.value)} placeholder="Deduction terms" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create escrow case"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
