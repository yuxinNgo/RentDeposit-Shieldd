"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/lib/types";

export function AnalyticsPanel({ analytics }: { analytics: AnalyticsSummary }) {
  return (
    <Card className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Conversion funnel</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Track how test users move from onboarding into case creation, funding and dispute resolution.
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.funnel}>
            <CartesianGrid stroke="rgba(21,34,56,0.08)" vertical={false} />
            <XAxis dataKey="stage" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip cursor={{ fill: "rgba(63,111,231,0.05)" }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#3f6fe7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
