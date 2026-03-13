"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getErrorMessage(error: Error & { digest?: string }) {
  return error.message || "We couldn't load your app data right now.";
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card className="rounded-[28px] border-white/10 bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">We couldn&apos;t load your dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">{getErrorMessage(error)}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            If you just connected a fresh Supabase project, make sure the app tables, trigger, and RLS policies from the
            initial migration are installed.
          </p>
          <Button className="rounded-2xl" onClick={reset} type="button">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
