"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MOBILE_NAV_ITEMS } from "@/lib/constants";
import { resolveIcon } from "@/components/shared/habit-icon";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-border/70 bg-background/90 p-2 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = resolveIcon(item.icon);
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
