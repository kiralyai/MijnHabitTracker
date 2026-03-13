"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/shared/settings-form";
import { useHabitStore } from "@/hooks/use-habit-store";

export default function SettingsPage() {
  const preferences = useHabitStore((state) => state.preferences);
  const profile = useHabitStore((state) => state.profile);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Preferences and profile"
        description="Tune your theme, calendar defaults, timezone, and session behavior."
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SettingsForm preferences={preferences} />
        <Card className="rounded-[32px] border-white/10 bg-card/90 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.55)]">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[24px] border border-border/70 bg-background/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</p>
              <p className="mt-2 font-medium text-foreground">{profile.fullName}</p>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-background/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
              <p className="mt-2 font-medium text-foreground">{profile.email}</p>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-background/60 p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Signing out clears the active Supabase session on this device and returns you to the login screen.
              </p>
              <LogoutButton className="mt-4" variant="outline" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
