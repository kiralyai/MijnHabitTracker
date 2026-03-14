"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/types/app";

function getTitle(pathname: string) {
  if (pathname.startsWith("/app/dashboard")) return "Dashboard";
  if (pathname.startsWith("/app/today")) return "Today";
  if (pathname.startsWith("/app/week")) return "Weekly board";
  if (pathname.startsWith("/app/month")) return "Monthly overview";
  if (pathname.startsWith("/app/habits/new")) return "Create habit";
  if (pathname.startsWith("/app/habits")) return "Habits";
  if (pathname.startsWith("/app/challenges")) return "Challenges";
  if (pathname.startsWith("/app/analytics")) return "Analytics";
  if (pathname.startsWith("/app/settings")) return "Settings";
  return "MijnHabitTracker";
}

export function Topbar({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              aria-label="Open navigation"
              className="lg:hidden"
              render={
                <Button size="icon" variant="outline" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-sm border-r border-border/70 bg-background/95 p-3">
              <Sidebar viewer={viewer} className="pr-2" />
            </SheetContent>
          </Sheet>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">App shell</p>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/habits/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "hidden rounded-2xl bg-[color:var(--brand-coral)] px-4 text-white hover:bg-[color:var(--brand-coral)]/90 sm:inline-flex",
            )}
          >
            <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-sm shadow-black/5">
              <Image
                src="/logo.png"
                alt="MijnHabitTracker logo"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </span>
            New habit
          </Link>
          <LogoutButton className="hidden rounded-2xl sm:inline-flex" variant="outline" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
