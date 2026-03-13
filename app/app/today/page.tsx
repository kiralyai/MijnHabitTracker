"use client";

import { addDays, format } from "date-fns";
import { useMemo, useState } from "react";

import { DailyHabitChecklist } from "@/components/habits/daily-habit-checklist";
import { NotesPanel } from "@/components/habits/notes-panel";
import { DateNavigator } from "@/components/shared/date-navigator";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { findRecentNotes } from "@/lib/habit-utils";
import { getTodayModel } from "@/lib/selectors";
import { useShallow } from "zustand/react/shallow";

export default function TodayPage() {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const model = getTodayModel(dataset, referenceDate);
  const recentNotes = findRecentNotes(dataset.entries, dataset.dailyNotes, referenceDate);

  const filteredItems = useMemo(
    () =>
      model.habits.filter((item) =>
        categoryFilter === "all" ? true : item.habit.categoryId === categoryFilter,
      ),
    [categoryFilter, model.habits],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Today"
        title="Clear the board"
        description="Fast daily execution with enough detail to understand momentum without slowing you down."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DateNavigator
              label={format(referenceDate, "EEEE, MMM d")}
              onNext={() => setReferenceDate((current) => addDays(current, 1))}
              onPrevious={() => setReferenceDate((current) => addDays(current, -1))}
            />
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {model.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          color="#ff6b4a"
          helper="Habits currently due for this date"
          icon="CircleCheckBig"
          label="Due today"
          value={String(model.total)}
        />
        <StatCard
          color="#0d9488"
          helper="Cleared against the due list"
          icon="ChartLine"
          label="Completed"
          value={String(model.completed)}
        />
        <StatCard
          color="#2563eb"
          helper="Daily completion rate"
          icon="Sparkles"
          label="Daily rate"
          value={`${Math.round(model.rate * 100)}%`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DailyHabitChecklist
          date={referenceDate}
          items={filteredItems.map((item) => ({
            habit: item.habit,
            category: item.category,
            entry: item.entry,
            summary: item.summary,
          }))}
        />
        <NotesPanel
          key={format(referenceDate, "yyyy-MM-dd")}
          date={referenceDate}
          initialNote={model.dailyNote?.content}
          recentNotes={recentNotes}
        />
      </section>
    </div>
  );
}
