"use client";

import { useAppData } from "@/hooks/use-app-data";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/common/metric-card";
import { MessagesSquare, SmilePlus, ThumbsUp, Vote } from "lucide-react";

export function FeedbackScreen() {
  const { data, isLoading, error, refresh } = useAppData();

  if (isLoading) {
    return <LoadingState label="Loading feedback..." />;
  }

  if (error || !data) {
    return <ErrorState label={error instanceof Error ? error.message : "Could not load feedback."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={MessagesSquare} label="Responses" value={String(data.feedbackSummary.totalResponses)} description="Combined seeded and local feedback submissions." />
        <MetricCard icon={SmilePlus} label="Average rating" value={String(data.feedbackSummary.averageRating)} description="Mean score from 1 to 5." />
        <MetricCard icon={Vote} label="Would-use" value={`${data.feedbackSummary.wouldUsePercentage}%`} description="Participants who would try a real version later." />
        <MetricCard icon={ThumbsUp} label="Top theme" value={data.feedbackSummary.positiveThemes[0]?.label ?? "audit"} description="Most common positive feedback token." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <FeedbackForm onSubmitted={refresh} />
        <Card>
          <div className="mb-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Feedback summary</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Useful signals for the submission package and product iteration.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Positive themes</p>
              <div className="mt-3 space-y-2">
                {data.feedbackSummary.positiveThemes.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Confusing points</p>
              <div className="mt-3 space-y-2">
                {data.feedbackSummary.confusingThemes.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {data.feedback.map((entry) => (
              <div key={entry.id} className="rounded-[22px] border border-[var(--border)] bg-white/80 p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.comment}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {entry.role} • {entry.rating}/5
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
