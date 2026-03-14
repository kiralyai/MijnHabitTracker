import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck2, ShieldCheck, Target } from "lucide-react";

import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TAGLINE, MARKETING_BENEFITS, MARKETING_FEATURES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1440px] px-4 pt-6 pb-20 md:px-6 lg:px-10">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.94),rgba(13,148,136,0.84))] px-6 py-6 text-white shadow-[0_26px_90px_-36px_rgba(15,23,42,0.8)] md:px-8 lg:px-10">
          <header className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-sm shadow-black/5">
                <Image
                  src="/logo.png"
                  alt="MijnHabitTracker logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <p className="font-heading text-2xl tracking-tight">MijnHabitTracker</p>
                <p className="text-sm text-white/70">Premium habit tracking for serious consistency.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/app/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90"
              >
                Open app
              </Link>
            </div>
          </header>

          <div className="grid gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80">
                <ShieldCheck className="size-4 text-[color:var(--brand-coral)]" />
                Daily tracking, weekly execution, long-range accountability
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl font-heading text-5xl leading-tight tracking-tight md:text-6xl">
                  Track habits with clarity, consistency, and a dashboard that keeps you honest.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/72">{APP_TAGLINE}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90"
                >
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/app/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
                >
                  Explore the demo
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-[26px] border-white/10 bg-white/7 text-white">
                  <CardContent className="pt-6">
                    <CalendarCheck2 className="size-5 text-[color:var(--brand-coral)]" />
                    <p className="mt-4 font-heading text-3xl">Fast</p>
                    <p className="mt-2 text-sm text-white/70">One-tap daily check-ins that still feel premium on mobile.</p>
                  </CardContent>
                </Card>
                <Card className="rounded-[26px] border-white/10 bg-white/7 text-white">
                  <CardContent className="pt-6">
                    <BarChart3 className="size-5 text-[color:var(--brand-teal)]" />
                    <p className="mt-4 font-heading text-3xl">Smart</p>
                    <p className="mt-2 text-sm text-white/70">Frequency-aware metrics, streaks, pacing, and weak spot detection.</p>
                  </CardContent>
                </Card>
                <Card className="rounded-[26px] border-white/10 bg-white/7 text-white">
                  <CardContent className="pt-6">
                    <Target className="size-5 text-[color:var(--brand-blue)]" />
                    <p className="mt-4 font-heading text-3xl">Focused</p>
                    <p className="mt-2 text-sm text-white/70">Goals, challenges, and analytics built around execution instead of noise.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] space-y-6 px-4 pb-8 md:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {MARKETING_FEATURES.map((feature) => (
            <Card key={feature.title} className="rounded-[28px] border-white/10 bg-card/85">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-muted)]">
                  Feature
                </p>
                <h2 className="mt-4 font-heading text-3xl tracking-tight">{feature.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-[30px] border-white/10 bg-card/85">
            <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
              {MARKETING_BENEFITS.map((benefit) => (
                <div key={benefit} className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                  <p className="font-medium text-foreground">{benefit}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-[30px] border-white/10 bg-card/85">
            <CardContent className="space-y-4 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-muted)]">
                Simple pricing placeholder
              </p>
              <h2 className="font-heading text-4xl tracking-tight">One focused plan.</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Start in demo mode for free. Add Supabase when you want real auth, personal data, and production deployment.
              </p>
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--brand-coral)] px-5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--brand-coral)]/90"
              >
                Start building
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
