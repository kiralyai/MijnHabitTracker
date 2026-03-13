"use client";

import { format } from "date-fns";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { getMonthModel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export function MonthlyHeatmap({ referenceDate }: { referenceDate: Date }) {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const model = getMonthModel(dataset, referenceDate);

  if (model.habitRows.length === 0) {
    return (
      <EmptyState
        title="No active habits this month"
        description="Add a habit first, then this view will show your consistency map and strongest days."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="rounded-[28px] border-white/10 bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Consistency map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {model.calendar.map((day) => (
              <div
                key={day.day.toISOString()}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-[18px] border text-center transition-colors",
                  day.inMonth ? "border-border/70" : "border-transparent opacity-35",
                )}
                style={{
                  background:
                    day.rate >= 0.9
                      ? "rgba(13,148,136,0.28)"
                      : day.rate >= 0.65
                        ? "rgba(37,99,235,0.22)"
                        : day.rate > 0
                          ? "rgba(255,107,74,0.16)"
                          : "rgba(148,163,184,0.08)",
                }}
              >
                <span className="font-medium text-foreground">{day.label}</span>
                <span className="text-[11px] text-muted-foreground">
                  {day.completed}/{day.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/10 bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Best days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {model.bestDays.length ? (
            model.bestDays.map((day) => (
              <div key={day.day.toISOString()} className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{format(day.day, "EEEE, MMM d")}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(day.rate * 100)}%</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {day.completed} of {day.total} habits cleared.
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              No completed days yet for this month. Keep tracking and your strongest days will show up here.
            </div>
          )}

          <div className="space-y-4">
            {model.habitRows.slice(0, 5).map((row) => (
              <ProgressBar
                key={row.habit.id}
                label={row.habit.title}
                meta={`${row.completedDays}/${Math.max(row.totalDays, 1)} days`}
                value={row.totalDays === 0 ? 0 : row.completedDays / row.totalDays}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
