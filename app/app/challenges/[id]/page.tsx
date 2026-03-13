"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { TrendChartCard } from "@/components/dashboard/trend-chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getChallengeDetailModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const model = getChallengeDetailModel(dataset, params.id, new Date());

  if (!model) {
    return (
      <EmptyState
        title="Challenge not found"
        description="The challenge may have been deleted or the link is no longer valid."
        action={
          <Link className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")} href="/app/challenges">
            Back to challenges
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Challenge detail"
        title={model.challenge.title}
        description={model.challenge.description}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Status</p>
            <p className="mt-3 font-heading text-4xl capitalize">{model.status}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Progress</p>
            <p className="mt-3 font-heading text-4xl">{Math.round(model.progress * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Days remaining</p>
            <p className="mt-3 font-heading text-4xl">{model.daysRemaining}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Misses</p>
            <p className="mt-3 font-heading text-4xl">{model.misses}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TrendChartCard
          title="Challenge pace"
          description="Weekly progress read for the current challenge."
          data={model.chart.map((point) => ({ label: point.label, rate: point.progress }))}
        />
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Linked habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {model.habits.length ? (
              model.habits.map((habit) => (
                <ProgressBar key={habit.id} label={habit.title} value={model.progress} meta={habit.frequencyType} />
              ))
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                No habits are linked to this challenge yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
