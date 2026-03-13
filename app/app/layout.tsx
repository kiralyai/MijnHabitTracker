import { AppShell } from "@/components/layout/app-shell";
import { HabitStoreProvider } from "@/hooks/use-habit-store";
import { getAppBootstrap } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { viewer, dataset } = await getAppBootstrap();

  return (
    <HabitStoreProvider initialDataset={dataset}>
      <AppShell viewer={viewer}>{children}</AppShell>
    </HabitStoreProvider>
  );
}
