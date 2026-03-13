"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DateNavigator({
  label,
  onPrevious,
  onNext,
}: {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 p-1 shadow-sm">
      <Button aria-label="Previous period" size="icon-sm" variant="ghost" onClick={onPrevious}>
        <ChevronLeft />
      </Button>
      <span className="min-w-32 px-3 text-center text-sm font-medium text-foreground">{label}</span>
      <Button aria-label="Next period" size="icon-sm" variant="ghost" onClick={onNext}>
        <ChevronRight />
      </Button>
    </div>
  );
}
