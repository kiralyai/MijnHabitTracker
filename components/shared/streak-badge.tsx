import { Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StreakBadge({
  value,
  label = "streak",
}: {
  value: number;
  label?: string;
}) {
  return (
    <Badge className="gap-1 rounded-full bg-[color:var(--brand-warm)]/12 px-3 py-1 text-[color:var(--brand-warm)]">
      <Flame className="size-3.5" />
      {value} {label}
    </Badge>
  );
}
