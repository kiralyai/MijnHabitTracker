"use client";

import Link from "next/link";

import { ChallengeCard } from "@/components/challenges/challenge-card";
import { TrendChartCard } from "@/components/dashboard/trend-chart-card";
import { CompletionRing } from "@/components/shared/completion-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getDashboardModel } from "@/lib/selectors";
import { cn, formatPercent } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export default function DashboardPage() {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const model = getDashboardModel(dataset, new Date());

  if (model.activeHabitCount === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Dashboard"
          title="Your habit operating system"
          description="A clean read on today’s commitments, weekly pacing, risk signals, and long-horizon challenge momentum."
        />
        <EmptyState
          title="Your dashboard is ready for the first habit"
          description="Create one habit to unlock the daily board, weekly pacing, monthly consistency map, and challenge tracking."
          action={
            <Link
              href="/app/habits/new"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90",
              )}
            >
              Create your first habit
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Your habit operating system"
        description="A clean read on today’s commitments, weekly pacing, risk signals, and long-horizon challenge momentum."
        actions={
          <Link
            href="/app/today"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90",
            )}
          >
            Open today
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          color="#ff6b4a"
          helper={`${model.completedToday}/${Math.max(model.dueToday.length, 1)} habits cleared today`}
          icon="CircleCheckBig"
          label="Today"
          trend={`${Math.round(model.todayRate * 100)}%`}
          value={String(model.completedToday)}
        />
        <StatCard
          color="#0d9488"
          helper="Frequency-aware streak and completion health"
          icon="ChartLine"
          label="Consistency"
          trend={`${model.consistencyScore}/100`}
          value={`${Math.round(model.weekRate * 100)}%`}
        />
        <StatCard
          color="#2563eb"
          helper="Habits currently active in the system"
          icon="Sparkles"
          label="Active habits"
          value={String(model.activeHabitCount)}
        />
        <StatCard
          color="#d97706"
          helper={`${model.riskHabits.length} habits need attention`}
          icon="Flag"
          label="Monthly rate"
          value={`${Math.round(model.monthRate * 100)}%`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TrendChartCard
          title="Completion trend"
          description="Weekly completion momentum across the last eight weeks."
          data={model.trendData}
        />
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader className="items-center text-center">
            <CardTitle className="font-heading text-3xl">Today at a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-center">
              <CompletionRing
                value={model.todayRate}
                label="today"
                caption={`${model.completedToday} of ${model.dueToday.length || 1} done`}
              />
            </div>
            <div className="space-y-3">
              {model.dueToday.slice(0, 4).map((item) => (
                <div key={item.habit.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.habit.title}</p>
                    <p className="text-sm text-muted-foreground">{formatPercent(item.progressRatio)}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Current streak: {item.currentStreak}. Best streak: {item.bestStreak}.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Habit performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {model.topHabits.map((habit) => (
              <ProgressBar
                key={habit.habit.id}
                label={habit.habit.title}
                meta={`${habit.currentStreak} streak`}
                value={habit.monthlyRate}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Current challenges</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {model.challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.challenge.id}
                daysRemaining={challenge.daysRemaining}
                description={challenge.challenge.description}
                habitsCount={challenge.habits.length}
                id={challenge.challenge.id}
                onTrack={challenge.onTrack}
                progress={challenge.progress}
                status={challenge.status}
                title={challenge.challenge.title}
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">At risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.riskHabits.length ? (
              model.riskHabits.map((habit) => (
                <div key={habit.habit.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                  <p className="font-medium text-foreground">{habit.habit.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Weekly rate is {Math.round(habit.weeklyRate * 100)}% with a current streak of {habit.currentStreak}.
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                No habits are flashing warning signs right now.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Recent reflections</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {model.recentNotes.map((note) => (
              <div key={note.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                <p className="font-medium text-foreground">{note.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
