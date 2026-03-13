"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChallengeCard } from "@/components/challenges/challenge-card";
import { ChallengeForm } from "@/components/challenges/challenge-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getChallengesModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export default function ChallengesPage() {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const habits = useHabitStore((state) => state.habits);
  const [showForm, setShowForm] = useState(false);
  const activeHabits = useMemo(() => habits.filter((habit) => !habit.isArchived), [habits]);
  const challenges = getChallengesModel(dataset, new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Challenges"
        title="Run disciplined sprints"
        description="Structure 30, 60, 90-day pushes around the habits that actually move your identity."
        actions={
          <Button
            className="bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90"
            onClick={() => setShowForm((value) => !value)}
            type="button"
          >
            {showForm ? "Close form" : "New challenge"}
          </Button>
        }
      />

      {showForm ? <ChallengeForm habits={activeHabits} onComplete={() => setShowForm(false)} /> : null}

      {!activeHabits.length && !showForm ? (
        <EmptyState
          title="Challenges need habits first"
          description="Create at least one active habit before you group habits into a challenge sprint."
          action={
            <Link
              href="/app/habits/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90",
              )}
            >
              Create a habit first
            </Link>
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          {challenges.length ? (
            challenges.map((challenge) => (
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
            ))
          ) : (
            <EmptyState
              title="No challenges yet"
              description="Create your first challenge to group identity habits or output habits into a focused sprint."
            />
          )}
        </div>

        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardContent className="space-y-5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Challenge guide</p>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>Link habits that share a clear outcome, not just habits that happen to sound impressive together.</p>
              <p>Use break-on-miss rules for identity habits like no porn, no casino, or sober streaks.</p>
              <p>For output challenges, use success-rate pacing instead of perfection so the trend stays honest.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
