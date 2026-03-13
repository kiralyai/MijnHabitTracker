import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-dashed border-border/80 bg-card/70 shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
