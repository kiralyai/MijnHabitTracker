"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod/v4";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHabitStore } from "@/hooks/use-habit-store";
import type { UserPreference } from "@/types/app";

const settingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  weekStartsOn: z.coerce.number().min(0).max(6),
  timezone: z.string().min(2),
  defaultDashboardRange: z.enum(["4w", "8w", "12w"]),
});

type SettingsValues = z.output<typeof settingsSchema>;

export function SettingsForm({ preferences }: { preferences: UserPreference }) {
  const updatePreferences = useHabitStore((state) => state.updatePreferences);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SettingsValues>({
    defaultValues: {
      theme: preferences.theme,
      weekStartsOn: preferences.weekStartsOn,
      timezone: preferences.timezone,
      defaultDashboardRange: preferences.defaultDashboardRange,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors();
    setFormError(null);
    const parsed = settingsSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof SettingsValues, { message: issue.message });
        }
      });
      return;
    }

    try {
      setPending(true);
      await updatePreferences({
        ...parsed.data,
        weekStartsOn: parsed.data.weekStartsOn as UserPreference["weekStartsOn"],
      });
      toast.success("Preferences saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save preferences.";
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
              <Label>Theme</Label>
              <Controller
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Dashboard range</Label>
              <Controller
                control={form.control}
                name="defaultDashboardRange"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4w">Last 4 weeks</SelectItem>
                      <SelectItem value="8w">Last 8 weeks</SelectItem>
                      <SelectItem value="12w">Last 12 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Week starts on</Label>
              <Controller
                control={form.control}
                name="weekStartsOn"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...form.register("timezone")} />
            </div>
          </div>

          {formError ? (
            <div className="rounded-[22px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              className="bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90"
              disabled={pending}
              type="submit"
            >
              {pending ? <LoaderCircle className="animate-spin" /> : null}
              {pending ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
