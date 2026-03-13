"use client";

import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DurationEntryInput({
  value,
  target,
  onCommit,
}: {
  value: number;
  target: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value ? String(value) : "");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Target ${target} min`}
        />
        <Button
          size="sm"
          onClick={() =>
            startTransition(() => {
              onCommit(Number(draft) || 0);
            })
          }
          type="button"
        >
          Save
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {[15, Math.round(target / 2), target].map((preset) => (
          <Button
            key={preset}
            size="xs"
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(String(preset));
              onCommit(preset);
            }}
          >
            {preset} min
          </Button>
        ))}
      </div>
    </div>
  );
}
