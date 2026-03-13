import { Progress } from "@/components/ui/progress";

export function ProgressBar({
  value,
  label,
  meta,
}: {
  value: number;
  label: string;
  meta?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {meta ?? `${Math.round(value * 100)}%`}
        </p>
      </div>
      <Progress value={Math.round(value * 100)} className="h-2.5 rounded-full bg-muted/70" />
    </div>
  );
}
