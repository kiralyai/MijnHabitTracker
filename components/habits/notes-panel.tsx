"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHabitStore } from "@/hooks/use-habit-store";

export function NotesPanel({
  date,
  initialNote,
  recentNotes,
}: {
  date: Date;
  initialNote?: string;
  recentNotes: Array<{ id: string; title: string; body: string; kind: "day" | "entry" }>;
}) {
  const setDailyNote = useHabitStore((state) => state.setDailyNote);
  const [draft, setDraft] = useState(initialNote ?? "");
  const [pending, setPending] = useState(false);

  return (
    <Card className="rounded-[28px] border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Reflection</CardTitle>
        <CardDescription>Keep short notes on why the day felt strong or where it started to wobble.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Textarea
            className="min-h-32 rounded-[22px]"
            placeholder="What made today easier or harder than expected?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void setDailyNote(date, draft)
                .then(() => {
                  toast.success("Reflection saved.");
                })
                .catch((error) => {
                  toast.error(error instanceof Error ? error.message : "Unable to save reflection.");
                })
                .finally(() => {
                  setPending(false);
                });
            }}
            type="button"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : <Check />}
            {pending ? "Saving..." : "Save reflection"}
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Recent notes</p>
          <div className="space-y-3">
            {recentNotes.length ? (
              recentNotes.map((note) => (
                <div key={note.id} className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{note.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{note.kind}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                No reflections yet. Save a note here or add quick notes to habit entries.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
