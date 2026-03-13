import Link from "next/link";

import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChallengeCard({
  id,
  title,
  description,
  progress,
  status,
  daysRemaining,
  habitsCount,
  onTrack,
}: {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  daysRemaining: number;
  habitsCount: number;
  onTrack: boolean;
}) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-card/80">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="font-heading text-2xl">{title}</CardTitle>
            <CardDescription className="text-sm leading-6">{description}</CardDescription>
          </div>
          <Badge
            className={
              onTrack
                ? "rounded-full bg-[color:var(--brand-teal)]/12 text-[color:var(--brand-teal)]"
                : "rounded-full bg-[color:var(--brand-warm)]/12 text-[color:var(--brand-warm)]"
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProgressBar value={progress} label="Challenge progress" meta={`${Math.round(progress * 100)}%`} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Days left</p>
            <p className="mt-2 font-heading text-3xl">{daysRemaining}</p>
          </div>
          <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Linked habits</p>
            <p className="mt-2 font-heading text-3xl">{habitsCount}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Link className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")} href={`/app/challenges/${id}`}>
          Open challenge
        </Link>
      </CardFooter>
    </Card>
  );
}
