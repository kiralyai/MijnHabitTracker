"use client";

import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NumericEntryInput({
  value,
  target,
  unit,
  onCommit,
}: {
  value: number;
  target: number;
  unit?: string | null;
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
          placeholder={`Target ${target}`}
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
        {[target * 0.5, target, target * 1.2].map((preset) => (
          <Button
            key={preset}
            size="xs"
            type="button"
            variant="outline"
            onClick={() => {
              const next = Math.round(preset);
              setDraft(String(next));
              onCommit(next);
            }}
          >
            {Math.round(preset)} {unit}
          </Button>
        ))}
      </div>
    </div>
  );
}
