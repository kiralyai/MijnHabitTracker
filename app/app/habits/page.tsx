"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { HabitIcon } from "@/components/shared/habit-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StreakBadge } from "@/components/shared/streak-badge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getHabitsModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export default function HabitsPage() {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const toggleHabitActive = useHabitStore((state) => state.toggleHabitActive);
  const archiveHabit = useHabitStore((state) => state.archiveHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const model = getHabitsModel(dataset, new Date());

  const filteredHabits = model.habits.filter((habit) =>
    `${habit.habit.title} ${habit.category?.name ?? ""}`.toLowerCase().includes(deferredQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Habits"
        title="Manage the system"
        description="Create, pause, archive, and tune habits without sacrificing the clarity of your tracking workflow."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Input
              className="w-[240px]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search habits"
              value={query}
            />
            <Link
              href="/app/habits/new"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90",
              )}
            >
              New habit
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[26px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active habits</p>
            <p className="mt-3 font-heading text-4xl">{model.habits.filter((habit) => habit.habit.isActive).length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[26px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Archived</p>
            <p className="mt-3 font-heading text-4xl">{model.archivedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[26px] border-white/10 bg-card/85">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Best performer</p>
            <p className="mt-3 font-heading text-4xl">{model.habits[0]?.habit.title ?? "None"}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5">
        {filteredHabits.length ? (
          filteredHabits.map((habit) => (
            <Card key={habit.habit.id} className="rounded-[28px] border-white/10 bg-card/85">
              <CardContent className="space-y-5 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <HabitIcon name={habit.habit.icon} color={habit.habit.color} />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {habit.category ? (
                          <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {habit.category.name}
                          </span>
                        ) : null}
                        <StreakBadge value={habit.currentStreak} />
                      </div>
                      <h2 className="font-heading text-3xl tracking-tight">{habit.habit.title}</h2>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{habit.habit.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")} href={`/app/habits/${habit.habit.id}`}>
                      Open
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        void toggleHabitActive(habit.habit.id).catch((error) => {
                          toast.error(error instanceof Error ? error.message : "Unable to update habit.");
                        });
                      }}
                      type="button"
                    >
                      {habit.habit.isActive ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        void archiveHabit(habit.habit.id).catch((error) => {
                          toast.error(error instanceof Error ? error.message : "Unable to archive habit.");
                        });
                      }}
                      type="button"
                    >
                      Archive
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        void deleteHabit(habit.habit.id).catch((error) => {
                          toast.error(error instanceof Error ? error.message : "Unable to delete habit.");
                        });
                      }}
                      type="button"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr_0.9fr]">
                  <ProgressBar value={habit.weeklyRate} label="Weekly rate" meta={`${Math.round(habit.weeklyRate * 100)}%`} />
                  <ProgressBar value={habit.monthlyRate} label="Monthly rate" meta={`${Math.round(habit.monthlyRate * 100)}%`} />
                  <ProgressBar value={habit.overallRate} label="Overall rate" meta={`${Math.round(habit.overallRate * 100)}%`} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            title={query ? "No habits match this search" : "No habits yet"}
            description={
              query
                ? "Try a different search term or clear the filter to see all habits."
                : "Create your first habit to unlock today, week, month, analytics, and challenge flows."
            }
            action={
              !query ? (
                <Link
                  href="/app/habits/new"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90",
                  )}
                >
                  Create habit
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
