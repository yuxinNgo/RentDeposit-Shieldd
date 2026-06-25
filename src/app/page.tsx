import Link from "next/link";
import { ArrowRight, Orbit, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NetworkBadge } from "@/components/common/network-badge";
import { TransactionHashLink } from "@/components/common/transaction-hash-link";
import { DEMO_CONTRACT_ADDRESS } from "@/lib/constants";

const steps = [
  "Landlord creates a deposit case and assigns tenant + mediator wallets.",
  "Tenant funds the escrow case through the in-app wallet workflow.",
  "Both sides upload move-in and move-out evidence into the audit timeline.",
  "Refund, deduction or dispute resolution releases the escrow outcome.",
];

export default function HomePage() {
  return (
    <div className="page-shell py-5 pb-14">
      <header className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[rgba(255,253,248,0.84)] px-5 py-3 shadow-[0_12px_40px_rgba(21,34,56,0.08)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[rgba(63,111,231,0.12)] p-2 text-[var(--blue)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">RentDeposit Shield</span>
        </div>
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <Link href="/onboarding" className="text-sm font-semibold text-[var(--text-primary)]">
            Enter app
          </Link>
        </div>
      </header>

      <section className="hero-mesh noise-overlay relative mt-6 overflow-hidden rounded-[36px] border border-[var(--border)] px-6 py-10 shadow-[0_28px_80px_rgba(21,34,56,0.12)] md:px-10 md:py-14">
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-muted)]">Protect rental deposits on Stellar testnet</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--text-primary)] md:text-6xl">
              One escrow workflow for tenants, landlords and mediators.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              RentDeposit Shield turns a rental deposit into a transparent case timeline with wallet proof, evidence uploads, dispute resolution and a submission-ready audit trail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="secondary" size="lg">
                  Start onboarding
                </Button>
              </Link>
            </div>
            <div className="mt-8 rounded-[26px] border border-[rgba(184,82,82,0.12)] bg-[rgba(255,255,255,0.72)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Testnet disclaimer: this MVP is for Stellar testnet only, uses no real funds and is not a licensed escrow or legal substitute.
            </div>
          </div>
          <Card className="relative overflow-hidden">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[var(--navy)] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Case signal</p>
                <p className="mt-3 text-3xl font-semibold">$42.5k</p>
                <p className="mt-2 text-sm text-white/70">Seeded deposit volume in the local demo workspace</p>
              </div>
              <div className="rounded-[24px] bg-[rgba(15,142,131,0.09)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Proof wallets</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">10+</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Tracked wallet interactions for the submission kit</p>
              </div>
            </div>
            <div className="mt-4 rounded-[26px] border border-[var(--border)] bg-white/85 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Soroban contract plan</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Escrow state machine mirrored in the app flow</p>
                </div>
                <Orbit className="h-4 w-4 text-[var(--blue)]" />
              </div>
              <div className="space-y-3">
                <div className="rounded-[22px] bg-[var(--surface-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Contract address placeholder</p>
                  <div className="mt-2">
                    <TransactionHashLink hash={DEMO_CONTRACT_ADDRESS} kind="contract" />
                  </div>
                </div>
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-[22px] border border-[var(--border)] bg-white px-4 py-3">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(63,111,231,0.12)] text-sm font-semibold text-[var(--blue)]">
                      {index + 1}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card>
          <Workflow className="h-5 w-5 text-[var(--blue)]" />
          <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Problem</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Deposit disputes usually rely on fragmented screenshots, private transfers and no shared timeline when a property handover goes wrong.
          </p>
        </Card>
        <Card>
          <ShieldCheck className="h-5 w-5 text-[var(--teal)]" />
          <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Solution</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            This MVP keeps each case in one place: escrow lifecycle, evidence references, audit logs, tx hashes, wallet proof and mediator outcomes.
          </p>
        </Card>
        <Card>
          <Orbit className="h-5 w-5 text-[var(--amber)]" />
          <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Why Stellar</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Fast, low-cost testnet settlement and Soroban contract logic make it easy to demo programmable escrow without pretending to be a live custody platform.
          </p>
        </Card>
      </section>
    </div>
  );
}
