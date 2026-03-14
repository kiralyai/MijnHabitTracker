"use client";

import Image from "next/image";
import { CheckCircle2, TrendingUp } from "lucide-react";

import { createDemoDataset } from "@/lib/demo-data";
import { getDashboardModel } from "@/lib/selectors";
import { CompletionRing } from "@/components/shared/completion-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TrendChartCard } from "@/components/dashboard/trend-chart-card";

export function DashboardPreview() {
  const model = getDashboardModel(createDemoDataset(), new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <TrendChartCard
        title="Weekly momentum"
        description="A live preview of the MijnHabitTracker dashboard with sample habit activity."
        data={model.trendData}
      />
      <div className="grid gap-6">
        <Card className="rounded-[28px] border-white/10 bg-card/80">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Consistency</p>
              <CardTitle className="mt-2 font-heading text-3xl">{model.consistencyScore}</CardTitle>
            </div>
            <CompletionRing
              value={model.todayRate}
              size={104}
              label="Today"
              caption={`${model.completedToday}/${Math.max(model.dueToday.length, 1)} habits cleared`}
            />
          </CardHeader>
        </Card>
        <Card className="rounded-[28px] border-white/10 bg-card/80">
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                <span className="inline-flex size-6 items-center justify-center overflow-hidden rounded-lg bg-white/5 p-1">
                  <Image
                    src="/logo.png"
                    alt="MijnHabitTracker logo"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                </span>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Active</p>
                <p className="mt-1 font-heading text-2xl">{model.activeHabitCount}</p>
              </div>
              <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                <CheckCircle2 className="size-4 text-[color:var(--brand-teal)]" />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</p>
                <p className="mt-1 font-heading text-2xl">{model.completedToday}</p>
              </div>
              <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                <TrendingUp className="size-4 text-[color:var(--brand-blue)]" />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Week</p>
                <p className="mt-1 font-heading text-2xl">{Math.round(model.weekRate * 100)}%</p>
              </div>
            </div>
            {model.topHabits.slice(0, 3).map((habit) => (
              <ProgressBar
                key={habit.habit.id}
                label={habit.habit.title}
                meta={`${habit.currentStreak} streak`}
                value={habit.monthlyRate}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
