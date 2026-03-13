"use client";

import { format } from "date-fns";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { DurationEntryInput } from "@/components/habits/duration-entry-input";
import { NumericEntryInput } from "@/components/habits/numeric-entry-input";
import { EmptyState } from "@/components/shared/empty-state";
import { HabitIcon } from "@/components/shared/habit-icon";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getWeekModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export function WeeklyGrid({ referenceDate }: { referenceDate: Date }) {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const toggleBinaryEntry = useHabitStore((state) => state.toggleBinaryEntry);
  const updateEntryValue = useHabitStore((state) => state.updateEntryValue);
  const model = getWeekModel(dataset, referenceDate);

  if (model.rows.length === 0) {
    return (
      <EmptyState
        title="No active habits on the weekly board"
        description="Create or reactivate a habit to see weekly pacing and schedule-aware tracking here."
      />
    );
  }

  return (
    <Card className="rounded-[28px] border-white/10 bg-card/85">
      <CardHeader className="gap-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="font-heading text-3xl">Weekly board</CardTitle>
          <div className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
            {Math.round(model.weekRate * 100)}% cleared this week
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-7">
          {model.daySummaries.map((day) => (
            <div key={day.day.toISOString()} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {format(day.day, "EEE")}
              </p>
              <p className="mt-2 font-heading text-2xl">{Math.round(day.rate * 100)}%</p>
              <p className="text-sm text-muted-foreground">
                {day.completed}/{day.total} complete
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[280px_repeat(7,minmax(72px,1fr))_140px] gap-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Habit
              </div>
              {model.weekDays.map((day) => (
                <div key={day.toISOString()} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {format(day, "EEE d")}
                </div>
              ))}
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Progress
              </div>

              {model.rows.map((row) => (
                <div key={row.habit.id} className="contents">
                  <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-3">
                      <HabitIcon name={row.habit.icon} color={row.habit.color} className="size-11" />
                      <div>
                        <p className="font-medium text-foreground">{row.habit.title}</p>
                        <p className="text-sm text-muted-foreground">{row.summary.currentStreak} active streak</p>
                      </div>
                    </div>
                  </div>

                  {row.cells.map((cell) => {
                    const activeCell = cell.due || cell.progress > 0 || cell.scheduled;

                    if (row.habit.habitType === "binary") {
                      return (
                        <button
                          key={cell.day.toISOString()}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-[18px] border text-sm transition-all",
                            activeCell
                              ? cell.progress >= 1
                                ? "border-[color:var(--brand-teal)]/40 bg-[color:var(--brand-teal)]/15 text-[color:var(--brand-teal)]"
                                : "border-border/70 bg-background/65 text-muted-foreground hover:border-[color:var(--brand-coral)]/40 hover:text-foreground"
                              : "border-transparent bg-muted/40 text-muted-foreground/50",
                          )}
                          disabled={!activeCell}
                          onClick={() => {
                            void toggleBinaryEntry(row.habit.id, cell.day).catch((error) => {
                              toast.error(error instanceof Error ? error.message : "Unable to update habit.");
                            });
                          }}
                          type="button"
                        >
                          {cell.progress >= 1 ? <Check className="size-4" /> : null}
                        </button>
                      );
                    }

                    const value =
                      row.habit.habitType === "count"
                        ? cell.entry?.numericValue ?? 0
                        : cell.entry?.durationMinutes ?? 0;

                    if (!activeCell) {
                      return (
                        <div
                          key={cell.day.toISOString()}
                          className="flex aspect-square items-center justify-center rounded-[18px] border border-transparent bg-muted/40 text-sm font-medium text-muted-foreground/50"
                        >
                          —
                        </div>
                      );
                    }

                    return (
                      <Popover key={cell.day.toISOString()}>
                        <PopoverTrigger
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-[18px] border text-sm font-medium transition-all",
                            "border-border/70 bg-background/65 text-foreground hover:border-[color:var(--brand-blue)]/40",
                          )}
                        >
                          {value > 0 ? value : "—"}
                        </PopoverTrigger>
                        <PopoverContent className="w-72 rounded-[24px] border border-border/70 bg-card/95 p-4">
                          <PopoverHeader>
                            <PopoverTitle>{row.habit.title}</PopoverTitle>
                          </PopoverHeader>
                          {row.habit.habitType === "count" ? (
                            <NumericEntryInput
                              key={`${row.habit.id}-${cell.day.toISOString()}-${value}`}
                              target={row.habit.targetValue ?? 0}
                              unit={row.habit.targetUnit}
                              value={value}
                              onCommit={(nextValue) => {
                                void updateEntryValue(row.habit.id, cell.day, nextValue).catch((error) => {
                                  toast.error(error instanceof Error ? error.message : "Unable to save progress.");
                                });
                              }}
                            />
                          ) : (
                            <DurationEntryInput
                              key={`${row.habit.id}-${cell.day.toISOString()}-${value}`}
                              target={row.habit.targetValue ?? 0}
                              value={value}
                              onCommit={(nextValue) => {
                                void updateEntryValue(row.habit.id, cell.day, nextValue).catch((error) => {
                                  toast.error(error instanceof Error ? error.message : "Unable to save progress.");
                                });
                              }}
                            />
                          )}
                        </PopoverContent>
                      </Popover>
                    );
                  })}

                  <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                    <ProgressBar value={row.summary.weeklyRate} label="Week" meta={`${Math.round(row.summary.weeklyRate * 100)}%`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
