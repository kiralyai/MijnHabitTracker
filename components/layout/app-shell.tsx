import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { Viewer } from "@/types/app";

export function AppShell({
  viewer,
  children,
}: {
  viewer: Viewer;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,107,74,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(13,148,136,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.04),transparent_24%)]" />
      <div className="mx-auto flex max-w-[1700px]">
        <aside className="sticky top-0 hidden h-screen w-[296px] shrink-0 p-4 lg:block">
          <Sidebar viewer={viewer} />
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar viewer={viewer} />
          <main className="flex-1 px-4 py-5 pb-28 md:px-6 lg:px-8 lg:pb-10">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
