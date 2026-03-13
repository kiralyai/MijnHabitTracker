import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitIcon } from "@/components/shared/habit-icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  helper,
  icon,
  color,
  trend,
  className,
}: {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: string;
  trend?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border-white/10 bg-gradient-to-br from-card via-card to-card/80 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      <CardHeader className="relative gap-3 border-b border-border/60 pb-4">
        <div className="absolute inset-x-0 top-0 h-px opacity-80" style={{ backgroundColor: color }} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <CardTitle className="mt-3 font-heading text-3xl text-foreground">{value}</CardTitle>
          </div>
          <HabitIcon name={icon} color={color} />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 pt-4">
        <p className="text-sm text-muted-foreground">{helper}</p>
        {trend ? <div className="text-sm font-medium text-foreground">{trend}</div> : null}
      </CardContent>
    </Card>
  );
}
