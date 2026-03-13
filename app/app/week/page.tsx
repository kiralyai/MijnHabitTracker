"use client";

import { addWeeks, format } from "date-fns";
import { useState } from "react";

import { WeeklyGrid } from "@/components/habits/weekly-grid";
import { DateNavigator } from "@/components/shared/date-navigator";
import { PageHeader } from "@/components/shared/page-header";

export default function WeekPage() {
  const [referenceDate, setReferenceDate] = useState(new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Week"
        title="See execution across the whole week"
        description="The weekly board helps you spot drift early, recover before streaks break, and pace flexible habits correctly."
        actions={
          <DateNavigator
            label={format(referenceDate, "'Week of' MMM d")}
            onNext={() => setReferenceDate((current) => addWeeks(current, 1))}
            onPrevious={() => setReferenceDate((current) => addWeeks(current, -1))}
          />
        }
      />
      <WeeklyGrid referenceDate={referenceDate} />
    </div>
  );
}
