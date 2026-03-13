"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHasMounted } from "@/hooks/use-has-mounted";

export function TrendChartCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; rate: number }>;
}) {
  const hasMounted = useHasMounted();

  return (
    <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_20px_80px_-38px_rgba(15,23,42,0.55)]">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trend-fill" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} stroke="var(--muted-foreground)" />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                tickMargin={10}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
                formatter={(value) => [`${Number(value ?? 0)}%`, "Completion"]}
              />
              <Area
                dataKey="rate"
                fill="url(#trend-fill)"
                stroke="#0d9488"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full gap-3">
            <Skeleton className="h-full rounded-[24px]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
