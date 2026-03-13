"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { DurationEntryInput } from "@/components/habits/duration-entry-input";
import { NumericEntryInput } from "@/components/habits/numeric-entry-input";
import { HabitIcon } from "@/components/shared/habit-icon";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StreakBadge } from "@/components/shared/streak-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHabitStore } from "@/hooks/use-habit-store";
import { formatTarget, getFrequencyLabel } from "@/lib/habit-utils";
import type { Category, Habit, HabitEntry, HabitSnapshot } from "@/types/app";

export function HabitCard({
  habit,
  category,
  entry,
  summary,
  date,
}: {
  habit: Habit;
  category?: Category | null;
  entry?: HabitEntry;
  summary: HabitSnapshot;
  date: Date;
}) {
  const toggleBinaryEntry = useHabitStore((state) => state.toggleBinaryEntry);
  const updateEntryValue = useHabitStore((state) => state.updateEntryValue);
  const setEntryNote = useHabitStore((state) => state.setEntryNote);
  const [note, setNote] = useState(entry?.note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const progressValue = habit.habitType === "count" ? entry?.numericValue ?? 0 : entry?.durationMinutes ?? 0;

  return (
    <Card className="rounded-[28px] border-white/10 bg-card/90 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.5)]">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <HabitIcon name={habit.icon} color={habit.color} />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {category ? (
                  <Badge className="rounded-full bg-foreground/5 px-3 py-1 text-foreground/80">{category.name}</Badge>
                ) : null}
                <StreakBadge value={summary.currentStreak} />
              </div>
              <div>
                <h3 className="font-heading text-2xl tracking-tight text-foreground">{habit.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{habit.description}</p>
              </div>
            </div>
          </div>

          {habit.habitType === "binary" ? (
            <Button
              className="h-12 rounded-2xl bg-[color:var(--brand-coral)] px-5 text-white hover:bg-[color:var(--brand-coral)]/90"
              onClick={() => {
                void toggleBinaryEntry(habit.id, date).catch((error) => {
                  toast.error(error instanceof Error ? error.message : "Unable to update habit.");
                });
              }}
              type="button"
            >
              <CheckCircle2 />
              {entry?.completed ? "Completed" : "Mark done"}
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-[24px] border border-border/70 bg-background/60 p-4">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{getFrequencyLabel(habit)}</span>
              <span>Target: {formatTarget(habit)}</span>
              <span>Best streak: {summary.bestStreak}</span>
            </div>
            <ProgressBar
              label="Today’s progress"
              meta={`${Math.round(summary.progressRatio * 100)}%`}
              value={summary.progressRatio}
            />

            {habit.habitType === "count" ? (
              <NumericEntryInput
                key={`${habit.id}-${progressValue}`}
                target={habit.targetValue ?? 0}
                unit={habit.targetUnit}
                value={progressValue}
                onCommit={(value) => {
                  void updateEntryValue(habit.id, date, value).catch((error) => {
                    toast.error(error instanceof Error ? error.message : "Unable to save progress.");
                  });
                }}
              />
            ) : null}

            {habit.habitType === "duration" ? (
              <DurationEntryInput
                key={`${habit.id}-${progressValue}`}
                target={habit.targetValue ?? 0}
                value={progressValue}
                onCommit={(value) => {
                  void updateEntryValue(habit.id, date, value).catch((error) => {
                    toast.error(error instanceof Error ? error.message : "Unable to save progress.");
                  });
                }}
              />
            ) : null}
          </div>

          <div className="space-y-4 rounded-[24px] border border-border/70 bg-background/60 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Quick note</p>
              <p className="text-sm text-muted-foreground">
                Capture what helped or what blocked today so streaks become easier to explain.
              </p>
            </div>
            <Input
              placeholder="Example: phone stayed in the kitchen until lunch."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button
              variant="outline"
              disabled={savingNote}
              onClick={() => {
                setSavingNote(true);
                void setEntryNote(habit.id, date, note)
                  .then(() => {
                    toast.success("Quick note saved.");
                  })
                  .catch((error) => {
                    toast.error(error instanceof Error ? error.message : "Unable to save note.");
                  })
                  .finally(() => {
                    setSavingNote(false);
                  });
              }}
              type="button"
            >
              {savingNote ? <LoaderCircle className="animate-spin" /> : <PencilLine />}
              {savingNote ? "Saving..." : "Save note"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
