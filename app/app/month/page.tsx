"use client";

import { addMonths, format } from "date-fns";
import { useState } from "react";

import { MonthlyHeatmap } from "@/components/habits/monthly-heatmap";
import { DateNavigator } from "@/components/shared/date-navigator";
import { PageHeader } from "@/components/shared/page-header";

export default function MonthPage() {
  const [referenceDate, setReferenceDate] = useState(new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Month"
        title="A wider view of consistency"
        description="Look for strong runs, weak patches, and whether the month tells the same story as the week."
        actions={
          <DateNavigator
            label={format(referenceDate, "MMMM yyyy")}
            onNext={() => setReferenceDate((current) => addMonths(current, 1))}
            onPrevious={() => setReferenceDate((current) => addMonths(current, -1))}
          />
        }
      />
      <MonthlyHeatmap referenceDate={referenceDate} />
    </div>
  );
}
