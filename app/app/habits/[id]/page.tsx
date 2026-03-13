"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { TrendChartCard } from "@/components/dashboard/trend-chart-card";
import { HabitForm } from "@/components/habits/habit-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StreakBadge } from "@/components/shared/streak-badge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getHabitDetailModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export default function HabitDetailPage() {
  const params = useParams<{ id: string }>();
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const categories = useHabitStore((state) => state.categories);
  const [editing, setEditing] = useState(false);
  const model = getHabitDetailModel(dataset, params.id, new Date());

  if (!model) {
    return (
      <EmptyState
        title="Habit not found"
        description="This habit may have been deleted or the link is no longer valid."
        action={
          <Link className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")} href="/app/habits">
            Back to habits
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Habit detail"
        title={model.habit.title}
        description={model.habit.description}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setEditing((value) => !value)} type="button">
              {editing ? "Close editor" : "Edit habit"}
            </Button>
            <Link className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")} href="/app/week">
              Open weekly board
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Current streak</p>
            <p className="mt-3 font-heading text-4xl">{model.summary.currentStreak}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Best streak</p>
            <p className="mt-3 font-heading text-4xl">{model.summary.bestStreak}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Weekly rate</p>
            <p className="mt-3 font-heading text-4xl">{Math.round(model.summary.weeklyRate * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly rate</p>
            <p className="mt-3 font-heading text-4xl">{Math.round(model.summary.monthlyRate * 100)}%</p>
          </CardContent>
        </Card>
      </section>

      {editing ? <HabitForm categories={categories} initialHabit={model.habit} onComplete={() => setEditing(false)} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TrendChartCard
          title="Progress over time"
          description="Daily progress for the last six weeks."
          data={model.series.map((item) => ({ label: item.label, rate: item.progress }))}
        />
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Consistency snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar value={model.summary.weeklyRate} label="Weekly completion" />
            <ProgressBar value={model.summary.monthlyRate} label="Monthly completion" />
            <ProgressBar value={model.summary.overallRate} label="Overall completion" />
            <div className="flex flex-wrap gap-2">
              <StreakBadge value={model.summary.currentStreak} />
              <StreakBadge label="best" value={model.summary.bestStreak} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Recent entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.recentEntries.length ? (
              model.recentEntries.map((entry) => (
                <div key={entry.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{entry.entryDate}</p>
                    <p className="text-sm text-muted-foreground">{entry.status}</p>
                  </div>
                  {entry.note ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.note}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                No entries yet. Track this habit from Today or the weekly board to start building history.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Linked challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.challenges.length ? (
              model.challenges.map((challenge) => (
                <div key={challenge.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                  <p className="font-medium text-foreground">{challenge.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{challenge.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                This habit is not linked to any challenge yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
