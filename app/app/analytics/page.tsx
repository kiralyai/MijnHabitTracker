"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { TrendChartCard } from "@/components/dashboard/trend-chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { selectHabitDataset, useHabitStore } from "@/hooks/use-habit-store";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getAnalyticsModel } from "@/lib/selectors";
import { useShallow } from "zustand/react/shallow";

export default function AnalyticsPage() {
  const dataset = useHabitStore(useShallow(selectHabitDataset));
  const model = getAnalyticsModel(dataset, new Date());
  const hasMounted = useHasMounted();

  if (dataset.habits.filter((habit) => !habit.isArchived && habit.isActive).length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Analytics"
          title="Performance, broken down"
          description="See the trends behind the streaks: weekday behavior, category balance, and which habits are carrying the system."
        />
        <EmptyState
          title="Analytics appears after the first active habit"
          description="Create and track a habit first, then this page will start charting completion trends and category balance."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Performance, broken down"
        description="See the trends behind the streaks: weekday behavior, category balance, and which habits are carrying the system."
      />

      <TrendChartCard
        title="Daily completion"
        description="A short trend line across the latest 12 days."
        data={model.monthlyTrend}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Completion by habit</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0}>
                <BarChart data={model.habitRates}>
                  <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, "Completion"]} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {model.habitRates.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full rounded-[24px]" />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-card/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Category balance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0}>
                <PieChart>
                  <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, "Rate"]} />
                  <Pie data={model.categoryRates} dataKey="value" innerRadius={78} outerRadius={112} paddingAngle={3}>
                    {model.categoryRates.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full rounded-[24px]" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[28px] border-white/10 bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Weekday performance</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {hasMounted ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0}>
              <BarChart data={model.weekdayPerformance}>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, "Completion"]} />
                <Bar dataKey="rate" fill="#0d9488" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full rounded-[24px]" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
