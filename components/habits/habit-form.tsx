"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { HABIT_COLORS, HABIT_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useHabitStore } from "@/hooks/use-habit-store";
import type { Category, Habit, HabitFormValues } from "@/types/app";

function parseOptionalNumber(value: unknown) {
  if (value === "" || value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const habitSchema = z
  .object({
    title: z.string().min(2, "Use a clear habit name."),
    description: z.string().min(10, "Give the habit a little context."),
    categoryId: z.string().nullable().optional(),
    icon: z.string().min(1),
    color: z.string().min(1),
    habitType: z.enum(["binary", "count", "duration"]),
    frequencyType: z.enum(["daily", "weekdays", "weekly_count", "monthly_count", "custom"]),
    targetValue: z.coerce.number().nullable().optional(),
    targetUnit: z.string().nullable().optional(),
    daysOfWeek: z.array(z.number()).optional(),
    weeklyTargetCount: z.coerce.number().nullable().optional(),
    monthlyTargetCount: z.coerce.number().nullable().optional(),
    customIntervalDays: z.coerce.number().nullable().optional(),
    startDate: z.string().min(1),
    endDate: z.string().nullable().optional(),
    challengeDuration: z.coerce.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.endDate && values.startDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "The end date must be on or after the start date.",
        path: ["endDate"],
      });
    }

    if (values.habitType !== "binary" && !values.targetValue) {
      ctx.addIssue({ code: "custom", message: "A target value is required.", path: ["targetValue"] });
    }

    if (values.frequencyType === "weekdays" && !values.daysOfWeek?.length) {
      ctx.addIssue({ code: "custom", message: "Pick at least one weekday.", path: ["daysOfWeek"] });
    }

    if (values.frequencyType === "weekly_count" && !values.weeklyTargetCount) {
      ctx.addIssue({
        code: "custom",
        message: "Set how many completions you want each week.",
        path: ["weeklyTargetCount"],
      });
    }

    if (values.frequencyType === "monthly_count" && !values.monthlyTargetCount) {
      ctx.addIssue({
        code: "custom",
        message: "Set how many completions you want each month.",
        path: ["monthlyTargetCount"],
      });
    }

    if (values.frequencyType === "custom" && !values.customIntervalDays) {
      ctx.addIssue({
        code: "custom",
        message: "Choose the number of days between each repetition.",
        path: ["customIntervalDays"],
      });
    }
  });

const weekdayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function HabitForm({
  categories,
  initialHabit,
  onComplete,
}: {
  categories: Category[];
  initialHabit?: Habit | null;
  onComplete?: (habit: Habit) => void;
}) {
  const router = useRouter();
  const saveHabit = useHabitStore((state) => state.saveHabit);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<HabitFormValues>({
    defaultValues: {
      id: initialHabit?.id,
      title: initialHabit?.title ?? "",
      description: initialHabit?.description ?? "",
      categoryId: initialHabit?.categoryId ?? null,
      icon: initialHabit?.icon ?? HABIT_ICONS[0],
      color: initialHabit?.color ?? HABIT_COLORS[0].value,
      habitType: initialHabit?.habitType ?? "binary",
      frequencyType: initialHabit?.frequencyType ?? "daily",
      targetValue: initialHabit?.targetValue ?? null,
      targetUnit: initialHabit?.targetUnit ?? "minutes",
      daysOfWeek: initialHabit?.daysOfWeek ?? [],
      weeklyTargetCount: initialHabit?.weeklyTargetCount ?? null,
      monthlyTargetCount: initialHabit?.monthlyTargetCount ?? null,
      customIntervalDays: initialHabit?.customFrequency?.intervalDays ?? null,
      startDate: initialHabit?.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: initialHabit?.endDate ?? null,
      challengeDuration: initialHabit?.challengeDuration ?? null,
      notes: initialHabit?.notes ?? null,
      isActive: initialHabit?.isActive ?? true,
    },
  });

  const frequencyType = useWatch({ control: form.control, name: "frequencyType" });
  const habitType = useWatch({ control: form.control, name: "habitType" });
  const selectedDays = useWatch({ control: form.control, name: "daysOfWeek" }) ?? [];
  const renderError = (name: keyof HabitFormValues) => {
    const error = form.formState.errors[name];

    if (!error?.message) {
      return null;
    }

    return <p className="text-sm text-destructive">{String(error.message)}</p>;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors();
    setFormError(null);
    const parsed = habitSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof HabitFormValues, { message: issue.message });
        }
      });
      return;
    }

    try {
      setPending(true);
      const saved = await saveHabit({
        ...values,
        ...parsed.data,
      });
      toast.success(initialHabit ? "Habit updated." : "Habit created.");
      onComplete?.(saved);
      router.push(`/app/habits/${saved.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save habit.";
      setFormError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  });

  return (
    <Card className="rounded-[32px] border-white/10 bg-card/90 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.55)]">
      <CardContent className="pt-6">
        <form className="space-y-8" onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Wake Up Early" {...form.register("title")} />
              {renderError("title")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? null : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="min-h-28 rounded-[22px]"
              placeholder="Out of bed before 06:30, no snooze."
              {...form.register("description")}
            />
            {renderError("description")}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Controller
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HABIT_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Controller
                control={form.control}
                name="color"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HABIT_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Habit type</Label>
              <Controller
                control={form.control}
                name="habitType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binary">Binary</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Controller
                control={form.control}
                name="frequencyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekdays">Specific weekdays</SelectItem>
                      <SelectItem value="weekly_count">X times per week</SelectItem>
                      <SelectItem value="monthly_count">X times per month</SelectItem>
                      <SelectItem value="custom">Custom cadence</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {habitType !== "binary" ? (
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target</Label>
                  <Input id="targetValue" type="number" {...form.register("targetValue", { setValueAs: parseOptionalNumber })} />
                  {renderError("targetValue")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetUnit">Unit</Label>
                  <Input id="targetUnit" placeholder="minutes" {...form.register("targetUnit")} />
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                Binary habits are either done or not done.
              </div>
            )}
          </div>

          {frequencyType === "weekdays" ? (
            <div className="space-y-3">
              <Label>Days of week</Label>
              <div className="flex flex-wrap gap-2">
                {weekdayOptions.map((day) => {
                  const active = selectedDays.includes(day.value);
                  return (
                    <Button
                      key={day.value}
                      type="button"
                      variant={active ? "default" : "outline"}
                      onClick={() => {
                        const next = active
                          ? selectedDays.filter((value) => value !== day.value)
                          : [...selectedDays, day.value].sort();
                        form.setValue("daysOfWeek", next, { shouldValidate: true });
                      }}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </div>
              {form.formState.errors.daysOfWeek ? (
                <p className="text-sm text-destructive">{form.formState.errors.daysOfWeek.message as string}</p>
              ) : null}
            </div>
          ) : null}

          {frequencyType === "weekly_count" ? (
            <div className="space-y-2">
              <Label htmlFor="weeklyTargetCount">Weekly target count</Label>
              <Input
                id="weeklyTargetCount"
                type="number"
                {...form.register("weeklyTargetCount", { setValueAs: parseOptionalNumber })}
              />
              {renderError("weeklyTargetCount")}
            </div>
          ) : null}

          {frequencyType === "monthly_count" ? (
            <div className="space-y-2">
              <Label htmlFor="monthlyTargetCount">Monthly target count</Label>
              <Input
                id="monthlyTargetCount"
                type="number"
                {...form.register("monthlyTargetCount", { setValueAs: parseOptionalNumber })}
              />
              {renderError("monthlyTargetCount")}
            </div>
          ) : null}

          {frequencyType === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="customIntervalDays">Repeat every N days</Label>
              <Input
                id="customIntervalDays"
                type="number"
                {...form.register("customIntervalDays", { setValueAs: parseOptionalNumber })}
              />
              {renderError("customIntervalDays")}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
              {renderError("startDate")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {renderError("endDate")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="challengeDuration">Challenge duration (days)</Label>
              <Input
                id="challengeDuration"
                type="number"
                placeholder="30"
                {...form.register("challengeDuration", { setValueAs: parseOptionalNumber })}
              />
              {renderError("challengeDuration")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              className="min-h-28 rounded-[22px]"
              placeholder="Cues, guardrails, or context for this habit."
              {...form.register("notes")}
            />
          </div>

          {formError ? (
            <div className="rounded-[22px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-[24px] border border-border/70 bg-background/60 px-4 py-4">
            <div>
              <p className="font-medium text-foreground">Habit active</p>
              <p className="text-sm text-muted-foreground">Inactive habits stay visible in history but stop showing up as due.</p>
            </div>
            <Controller
              control={form.control}
              name="isActive"
                  render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
                />
              </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.push("/app/habits")}>
              Cancel
            </Button>
            <Button
              className="bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90"
              disabled={pending}
              type="submit"
            >
              {pending ? <LoaderCircle className="animate-spin" /> : null}
              {pending ? "Saving..." : initialHabit ? "Save changes" : "Create habit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
