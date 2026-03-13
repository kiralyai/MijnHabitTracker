import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { HabitCard } from "@/components/habits/habit-card";
import { buttonVariants } from "@/components/ui/button";
import { cn, toDateKey } from "@/lib/utils";
import type { Category, HabitEntry, HabitSnapshot } from "@/types/app";

export function DailyHabitChecklist({
  items,
  date,
}: {
  items: Array<{
    habit: HabitSnapshot["habit"];
    category?: Category | null;
    entry?: HabitEntry;
    summary: HabitSnapshot;
  }>;
  date: Date;
}) {
  const dateKey = toDateKey(date);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No habits due right now"
        description="Your current filters are clean. This is a good time to review the weekly board or create a new habit."
        action={
          <Link className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")} href="/app/habits/new">
            Create habit
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <HabitCard
          key={`${item.habit.id}-${dateKey}`}
          category={item.category}
          date={date}
          entry={item.entry}
          habit={item.habit}
          summary={item.summary}
        />
      ))}
    </div>
  );
}
