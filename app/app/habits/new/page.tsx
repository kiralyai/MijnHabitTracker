"use client";

import { PageHeader } from "@/components/shared/page-header";
import { HabitForm } from "@/components/habits/habit-form";
import { useHabitStore } from "@/hooks/use-habit-store";

export default function NewHabitPage() {
  const categories = useHabitStore((state) => state.categories);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New habit"
        title="Design a habit that survives real life"
        description="Define the cadence, target, and context clearly so streaks and analytics stay honest."
      />
      <HabitForm categories={categories} />
    </div>
  );
}
