"use client";

import Link from "next/link";
import { BadgeCheck, ExternalLink, GitCommitHorizontal, PlayCircle, Users } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { MonitoringStatusCard } from "@/components/analytics/monitoring-status-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shortHash } from "@/lib/utils";

export function SubmissionScreen() {
  const { data, isLoading, error, refresh } = useAppData();

  if (isLoading) {
    return <LoadingState label="Loading submission package..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load submission data."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="hero-mesh">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Startup track level 5</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Submission evidence bundle</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            One page to review repo link, live on-chain contract addresses, user proof, feedback and readiness notes before pushing the final package.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={data.submission.repoUrl} target="_blank">
              <Button variant="primary">
                <ExternalLink className="h-4 w-4" />
                GitHub repo
              </Button>
            </Link>
            {data.submission.demoVideoUrl ? (
              <Link href={data.submission.demoVideoUrl} target="_blank">
                <Button variant="secondary">
                  <PlayCircle className="h-4 w-4" />
                  Demo video
                </Button>
              </Link>
            ) : null}
          </div>
        </Card>
        <MonitoringStatusCard monitoring={data.monitoring} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-[var(--blue)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">User validation proof</p>
          </div>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">{data.submission.uniqueWalletAddresses}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">unique wallet addresses with recorded interactions</p>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[var(--green)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Contract address</p>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{shortHash(data.submission.contractAddress, 10)}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {data.submission.contractAddress ? "Most recent case contract deployed from the app on Stellar testnet." : "No case contract has been deployed from this workspace yet."}
          </p>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <GitCommitHorizontal className="h-5 w-5 text-[var(--amber)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Commit readiness</p>
          </div>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">{data.submission.commitCount}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {data.submission.commitsReady ? "20+ meaningful commits recorded in git history." : "Need at least 20 meaningful commits in git history."}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Checklist</p>
          <div className="space-y-3">
            {data.submission.screenshotsChecklist.map((item) => (
              <div key={item} className="rounded-[22px] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--text-secondary)]">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Wallet proof list</p>
          {data.submission.proofUsers.length === 0 ? (
            <EmptyState
              title="No proof wallets yet"
              description="Wallet proof appears here after Stellar testnet interactions are recorded in the app."
            />
          ) : (
            <div className="space-y-3">
              {data.submission.proofUsers.map((user) => (
                <div key={user.walletAddress} className="rounded-[22px] border border-[var(--border)] bg-white/80 p-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{shortHash(user.walletAddress, 8)}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {user.role} • {user.lastAction} • feedback {user.feedbackSubmitted ? "yes" : "no"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
