"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { completeOnboardingApi } from "@/lib/api/client";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/constants";
import { connectWallet } from "@/lib/stellar/wallet";
import { useAppSession } from "@/components/providers/app-client-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function OnboardingScreen() {
  const { session, setRole, setSession } = useAppSession();
  const [name, setName] = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [isPending, startTransition] = useTransition();

  async function connect() {
    const result = await connectWallet();
    setSession({ walletAddress: result.walletAddress });
    toast.success(`Wallet ${result.source === "mock" ? "mocked" : "connected"} on Stellar testnet.`);
  }

  function submit() {
    startTransition(async () => {
      try {
        await completeOnboardingApi({
          name,
          email,
          role: session.role,
          walletAddress: session.walletAddress,
        });
        setSession({ name, email });
        toast.success("Onboarding completed.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not complete onboarding.");
      }
    });
  }

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="hero-mesh">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Welcome flow</p>
          <h1 className="mt-2 text-4xl font-semibold text-[var(--text-primary)]">Choose your role and open the testnet workspace</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            This MVP runs on Stellar testnet only, uses no real funds and should not be presented as a licensed escrow service.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRole(role)}
                className={`rounded-[24px] border px-4 py-4 text-left transition-colors ${
                  session.role === role
                    ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                    : "border-[var(--border)] bg-white/80 text-[var(--text-primary)]"
                }`}
              >
                <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                <p className="mt-2 text-sm opacity-80">
                  {role === "LANDLORD"
                    ? "Create cases and manage deductions."
                    : role === "TENANT"
                      ? "Fund escrow and request refunds."
                      : role === "MEDIATOR"
                        ? "Resolve disputes with a final split."
                        : "Monitor analytics and readiness."}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Profile setup</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Connect a wallet first, then store your role and basic profile through the internal API.</p>
            </div>
            <Select value={session.role} onChange={(event) => setRole(event.target.value as typeof session.role)}>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
            <Input value={session.walletAddress} readOnly placeholder="Connect wallet to populate address" />
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => void connect()}>
                Connect wallet
              </Button>
              <Button onClick={submit} disabled={isPending || !session.walletAddress}>
                {isPending ? "Saving..." : "Complete onboarding"}
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost">Open dashboard</Button>
              </Link>
            </div>
            <div className="rounded-[24px] bg-[rgba(63,111,231,0.06)] p-4 text-sm text-[var(--text-secondary)]">
              Next action:
              <span className="ml-2 font-semibold text-[var(--text-primary)]">
                {session.role === "LANDLORD"
                  ? "Create a new deposit case."
                  : session.role === "TENANT"
                    ? "Open a case and fund escrow."
                    : session.role === "MEDIATOR"
                      ? "Review disputed cases."
                      : "Inspect analytics and submission readiness."}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
