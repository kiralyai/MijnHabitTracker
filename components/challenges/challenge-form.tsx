"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useHabitStore } from "@/hooks/use-habit-store";
import type { Challenge, ChallengeFormValues, Habit } from "@/types/app";

function parseOptionalNumber(value: unknown) {
  if (value === "" || value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const challengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(12),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  targetDays: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(["active", "completed", "failed", "paused"]),
  habitIds: z.array(z.string()).min(1, "Link at least one habit."),
  breakOnMiss: z.boolean().optional(),
  allowedMisses: z.coerce.number().int().min(0).nullable().optional(),
  targetSuccessRate: z.coerce.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
}).superRefine((values, ctx) => {
  if (values.endDate < values.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "The end date must be on or after the start date.",
      path: ["endDate"],
    });
  }
});

export function ChallengeForm({
  habits,
  initialChallenge,
  onComplete,
}: {
  habits: Habit[];
  initialChallenge?: Challenge | null;
  onComplete?: (challenge: Challenge) => void;
}) {
  const router = useRouter();
  const saveChallenge = useHabitStore((state) => state.saveChallenge);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ChallengeFormValues>({
    defaultValues: {
      id: initialChallenge?.id,
      title: initialChallenge?.title ?? "",
      description: initialChallenge?.description ?? "",
      startDate: initialChallenge?.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: initialChallenge?.endDate ?? new Date().toISOString().slice(0, 10),
      targetDays: initialChallenge?.targetDays ?? null,
      status: initialChallenge?.status ?? "active",
      habitIds: initialChallenge?.habitIds ?? [],
      breakOnMiss: initialChallenge?.rules?.breakOnMiss ?? false,
      allowedMisses: initialChallenge?.rules?.allowedMisses ?? 0,
      targetSuccessRate:
        initialChallenge?.rules?.targetSuccessRate == null
          ? 85
          : initialChallenge.rules.targetSuccessRate * 100,
      notes: initialChallenge?.notes ?? null,
    },
  });

  const selectedHabits = useWatch({ control: form.control, name: "habitIds" }) ?? [];
  const breakOnMiss = useWatch({ control: form.control, name: "breakOnMiss" });
  const renderError = (name: keyof ChallengeFormValues) => {
    const error = form.formState.errors[name];

    if (!error?.message) {
      return null;
    }

    return <p className="text-sm text-destructive">{String(error.message)}</p>;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors();
    setFormError(null);
    const parsed = challengeSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof ChallengeFormValues, { message: issue.message });
        }
      });
      return;
    }

    try {
      setPending(true);
      const payload: ChallengeFormValues = {
        ...values,
        ...parsed.data,
        targetSuccessRate:
          parsed.data.targetSuccessRate == null ? undefined : parsed.data.targetSuccessRate / 100,
      };
      const challenge = await saveChallenge(payload);
      toast.success(initialChallenge ? "Challenge updated." : "Challenge created.");
      onComplete?.(challenge);
      router.push(`/app/challenges/${challenge.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save challenge.";
      setFormError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  });

  return (
    <Card className="rounded-[32px] border-white/10 bg-card/90 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.55)]">
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="challenge-title">Title</Label>
              <Input id="challenge-title" placeholder="60-Day Deep Focus Sprint" {...form.register("title")} />
              {renderError("title")}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge-description">Description</Label>
            <Textarea id="challenge-description" className="min-h-28 rounded-[22px]" {...form.register("description")} />
            {renderError("description")}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="challenge-start">Start date</Label>
              <Input id="challenge-start" type="date" {...form.register("startDate")} />
              {renderError("startDate")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-end">End date</Label>
              <Input id="challenge-end" type="date" {...form.register("endDate")} />
              {renderError("endDate")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-days">Target days</Label>
              <Input id="target-days" type="number" {...form.register("targetDays", { setValueAs: parseOptionalNumber })} />
              {renderError("targetDays")}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Linked habits</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {habits.map((habit) => {
                const checked = selectedHabits.includes(habit.id);
                return (
                  <label
                    key={habit.id}
                    className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-background/60 px-4 py-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        const next = checked
                          ? selectedHabits.filter((id) => id !== habit.id)
                          : [...selectedHabits, habit.id];
                        form.setValue("habitIds", next, { shouldValidate: true });
                      }}
                    />
                    <span className="font-medium text-foreground">{habit.title}</span>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.habitIds ? (
              <p className="text-sm text-destructive">{form.formState.errors.habitIds.message}</p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3 rounded-[24px] border border-border/70 bg-background/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Break on miss</p>
                  <p className="text-sm text-muted-foreground">Fail the challenge immediately if a protected day breaks.</p>
                </div>
                <Controller
                  control={form.control}
                  name="breakOnMiss"
                  render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
                />
              </div>
              {breakOnMiss ? (
                <div className="space-y-2">
                  <Label htmlFor="allowed-misses">Allowed misses</Label>
                  <Input id="allowed-misses" type="number" {...form.register("allowedMisses", { setValueAs: parseOptionalNumber })} />
                  {renderError("allowedMisses")}
                </div>
              ) : null}
            </div>

            <div className="space-y-2 rounded-[24px] border border-border/70 bg-background/60 p-4">
              <Label htmlFor="target-success-rate">Target success rate (%)</Label>
              <Input
                id="target-success-rate"
                type="number"
                {...form.register("targetSuccessRate", { setValueAs: parseOptionalNumber })}
              />
              {renderError("targetSuccessRate")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge-notes">Notes</Label>
            <Textarea id="challenge-notes" className="min-h-24 rounded-[22px]" {...form.register("notes")} />
          </div>

          {formError ? (
            <div className="rounded-[22px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.push("/app/challenges")}>
              Cancel
            </Button>
            <Button
              className="bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90"
              disabled={pending}
              type="submit"
            >
              {pending ? <LoaderCircle className="animate-spin" /> : null}
              {pending ? "Saving..." : initialChallenge ? "Save challenge" : "Create challenge"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
