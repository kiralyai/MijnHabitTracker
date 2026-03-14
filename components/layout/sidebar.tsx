"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { LogoutButton } from "@/components/auth/logout-button";
import { NAV_ITEMS } from "@/lib/constants";
import { HabitIcon, resolveIcon } from "@/components/shared/habit-icon";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/types/app";

export function Sidebar({ viewer, className }: { viewer: Viewer; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <Card className="rounded-[28px] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f766e] px-2 py-2 text-white shadow-[0_20px_70px_-26px_rgba(15,23,42,0.75)]">
        <CardContent className="space-y-6 px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-sm shadow-black/5">
  <Image
    src="/public/logo.png"
    alt="MijnHabitTracker logo"
    width={40}
    height={40}
    className="h-full w-full object-cover"
  />
</span>
              <div>
                  <p className="font-heading text-xl tracking-tight">MijnHabitTracker</p>
                  <p className="text-sm text-white/70">Consistency, designed.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
              <p className="text-sm text-white/70">Signed in as</p>
              <p className="mt-1 font-medium text-white">{viewer.fullName}</p>
              <p className="text-sm text-white/70">{viewer.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = resolveIcon(item.icon);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: active ? "secondary" : "ghost", size: "lg" }),
                    "h-12 w-full justify-start rounded-2xl border border-transparent px-4 text-sm",
                    active
                      ? "bg-white text-slate-900 hover:bg-white/90"
                      : "text-white/78 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/app/habits/new"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-12 w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90",
            )}
          >
            Create a habit
          </Link>
          <LogoutButton className="h-12 w-full rounded-2xl border-white/10 bg-white/6 text-white hover:bg-white/12 hover:text-white" variant="ghost" />
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/10 bg-card/75 shadow-[0_16px_60px_-32px_rgba(15,23,42,0.45)]">
        <CardContent className="space-y-4 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">MijnHabitTracker note</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep the app small in the morning: open it, clear today, and leave. The weekly board is for calibration,
              not procrastination.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
