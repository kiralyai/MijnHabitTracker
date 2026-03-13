import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <Skeleton className="h-5 w-[32rem] max-w-full rounded-2xl" />
      </div>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="rounded-[26px] border-white/10 bg-card/85">
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-2xl" />
              <Skeleton className="h-4 w-40 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[28px] border-white/10 bg-card/85">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-6 w-48 rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-[24px]" />
        </CardContent>
      </Card>
    </div>
  );
}
