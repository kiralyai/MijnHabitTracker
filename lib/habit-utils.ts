import {
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type {
  Challenge,
  ChallengeStatus,
  DailyNote,
  DemoDataset,
  Habit,
  HabitEntry,
  HabitSnapshot,
  UserPreference,
} from "@/types/app";
import { clamp, toDateKey } from "@/lib/utils";

function normalizeDate(value: Date | string) {
  return startOfDay(typeof value === "string" ? parseISO(value) : value);
}

function getRangeLimit(habit: Habit, start: Date, end: Date) {
  const habitStart = normalizeDate(habit.startDate);
  const habitEnd = habit.endDate ? normalizeDate(habit.endDate) : end;

  return {
    start: maxDate([start, habitStart]),
    end: minDate([end, habitEnd]),
  };
}

export function entryForDate(entries: HabitEntry[], habitId: string, date: Date | string) {
  const dateKey = toDateKey(date);
  return entries.find((entry) => entry.habitId === habitId && entry.entryDate === dateKey);
}

export function isHabitActiveOnDate(habit: Habit, date: Date | string) {
  const current = normalizeDate(date);
  const start = normalizeDate(habit.startDate);
  const end = habit.endDate ? normalizeDate(habit.endDate) : null;

  if (habit.isArchived || !habit.isActive) {
    return false;
  }

  if (isBefore(current, start)) {
    return false;
  }

  if (end && isAfter(current, end)) {
    return false;
  }

  return true;
}

export function isFixedScheduleHabit(habit: Habit) {
  return ["daily", "weekdays", "custom"].includes(habit.frequencyType);
}

export function isHabitScheduledOnDate(habit: Habit, date: Date | string) {
  if (!isHabitActiveOnDate(habit, date)) {
    return false;
  }

  const current = normalizeDate(date);
  const day = current.getDay();
  const diffDays = Math.round(
    (current.getTime() - normalizeDate(habit.startDate).getTime()) / 86_400_000,
  );

  switch (habit.frequencyType) {
    case "daily":
      return true;
    case "weekdays":
      return habit.daysOfWeek?.includes(day) ?? false;
    case "custom":
      return diffDays >= 0 && diffDays % (habit.customFrequency?.intervalDays ?? 1) === 0;
    case "weekly_count":
    case "monthly_count":
      return false;
    default:
      return false;
  }
}

export function getEntryProgress(habit: Habit, entry?: HabitEntry | null) {
  if (!entry) {
    return 0;
  }

  if (habit.habitType === "binary") {
    return entry.completed ? 1 : 0;
  }

  if (habit.habitType === "count") {
    return clamp((entry.numericValue ?? 0) / Math.max(habit.targetValue ?? 1, 1));
  }

  return clamp((entry.durationMinutes ?? 0) / Math.max(habit.targetValue ?? 1, 1));
}

export function isEntryComplete(habit: Habit, entry?: HabitEntry | null) {
  return getEntryProgress(habit, entry) >= 1;
}

function getCompletedOccurrences(
  habit: Habit,
  entries: HabitEntry[],
  start: Date,
  end: Date,
) {
  return eachDayOfInterval({ start, end }).reduce((count, day) => {
    const entry = entryForDate(entries, habit.id, day);
    return count + (isEntryComplete(habit, entry) ? 1 : 0);
  }, 0);
}

export function isHabitDueOnDate(
  habit: Habit,
  date: Date | string,
  entries: HabitEntry[],
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  if (!isHabitActiveOnDate(habit, date)) {
    return false;
  }

  if (isFixedScheduleHabit(habit)) {
    return isHabitScheduledOnDate(habit, date);
  }

  const current = normalizeDate(date);
  const weekStartsOn = preferences?.weekStartsOn ?? 1;

  if (habit.frequencyType === "weekly_count") {
    const start = startOfWeek(current, { weekStartsOn });
    const done = getCompletedOccurrences(habit, entries, start, current);
    return done < (habit.weeklyTargetCount ?? 1);
  }

  const start = startOfMonth(current);
  const done = getCompletedOccurrences(habit, entries, start, current);
  return done < (habit.monthlyTargetCount ?? 1);
}

function getPeriodPerformance(
  habit: Habit,
  entries: HabitEntry[],
  start: Date,
  end: Date,
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  const range = getRangeLimit(habit, start, end);

  if (isAfter(range.start, range.end)) {
    return { completed: 0, total: 0, rate: 0 };
  }

  if (habit.frequencyType === "weekly_count") {
    const weeks = eachWeekOfInterval({ start: range.start, end: range.end }, {
      weekStartsOn: preferences?.weekStartsOn ?? 1,
    });
    const target = habit.weeklyTargetCount ?? 1;

    const aggregate = weeks.reduce(
      (acc, weekStart) => {
        const weekEnd = minDate([
          endOfWeek(weekStart, { weekStartsOn: preferences?.weekStartsOn ?? 1 }),
          range.end,
        ]);
        const done = getCompletedOccurrences(habit, entries, maxDate([range.start, weekStart]), weekEnd);

        return {
          completed: acc.completed + Math.min(done, target),
          total: acc.total + target,
        };
      },
      { completed: 0, total: 0 },
    );

    return {
      ...aggregate,
      rate: aggregate.total === 0 ? 0 : aggregate.completed / aggregate.total,
    };
  }

  if (habit.frequencyType === "monthly_count") {
    const months = eachMonthOfInterval({ start: range.start, end: range.end });
    const target = habit.monthlyTargetCount ?? 1;

    const aggregate = months.reduce(
      (acc, monthStart) => {
        const monthEnd = minDate([endOfMonth(monthStart), range.end]);
        const done = getCompletedOccurrences(
          habit,
          entries,
          maxDate([range.start, monthStart]),
          monthEnd,
        );

        return {
          completed: acc.completed + Math.min(done, target),
          total: acc.total + target,
        };
      },
      { completed: 0, total: 0 },
    );

    return {
      ...aggregate,
      rate: aggregate.total === 0 ? 0 : aggregate.completed / aggregate.total,
    };
  }

  const scheduledDates = eachDayOfInterval({ start: range.start, end: range.end }).filter((day) =>
    isHabitScheduledOnDate(habit, day),
  );

  const completed = scheduledDates.reduce((count, day) => {
    const entry = entryForDate(entries, habit.id, day);
    return count + (isEntryComplete(habit, entry) ? 1 : 0);
  }, 0);

  return {
    completed,
    total: scheduledDates.length,
    rate: scheduledDates.length === 0 ? 0 : completed / scheduledDates.length,
  };
}

export function aggregateRangePerformance(
  habits: Habit[],
  entries: HabitEntry[],
  start: Date,
  end: Date,
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  const aggregate = habits.reduce(
    (acc, habit) => {
      const performance = getPeriodPerformance(habit, entries, start, end, preferences);
      return {
        completed: acc.completed + performance.completed,
        total: acc.total + performance.total,
      };
    },
    { completed: 0, total: 0 },
  );

  return {
    ...aggregate,
    rate: aggregate.total === 0 ? 0 : aggregate.completed / aggregate.total,
  };
}

function getOccurrenceStreak(habit: Habit, entries: HabitEntry[], referenceDate: Date) {
  const start = normalizeDate(habit.startDate);
  const scheduledDays = eachDayOfInterval({ start, end: referenceDate }).filter((day) =>
    isHabitScheduledOnDate(habit, day),
  );

  let current = 0;
  let longest = 0;
  let running = 0;

  for (const day of scheduledDays) {
    const complete = isEntryComplete(habit, entryForDate(entries, habit.id, day));

    if (complete) {
      running += 1;
      longest = Math.max(longest, running);
      current = running;
    } else {
      running = 0;
      current = 0;
    }
  }

  return { current, longest };
}

function getPeriodStreak(
  habit: Habit,
  entries: HabitEntry[],
  referenceDate: Date,
  period: "week" | "month",
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  const start = normalizeDate(habit.startDate);
  const periods =
    period === "week"
      ? eachWeekOfInterval({ start, end: referenceDate }, { weekStartsOn: preferences?.weekStartsOn ?? 1 })
      : eachMonthOfInterval({ start, end: referenceDate });

  const target = period === "week" ? habit.weeklyTargetCount ?? 1 : habit.monthlyTargetCount ?? 1;

  let current = 0;
  let longest = 0;
  let running = 0;

  for (const periodStart of periods) {
    const periodEnd =
      period === "week"
        ? endOfWeek(periodStart, { weekStartsOn: preferences?.weekStartsOn ?? 1 })
        : endOfMonth(periodStart);
    const completed = getCompletedOccurrences(
      habit,
      entries,
      maxDate([start, periodStart]),
      minDate([periodEnd, referenceDate]),
    );
    const isCurrent = isWithinInterval(referenceDate, { start: periodStart, end: periodEnd });
    const success = completed >= target;

    if (success) {
      running += 1;
      longest = Math.max(longest, running);
      current = running;
      continue;
    }

    if (isCurrent) {
      current = running;
      continue;
    }

    running = 0;
    current = 0;
  }

  return { current, longest };
}

export function getStreakStats(
  habit: Habit,
  entries: HabitEntry[],
  referenceDate: Date | string,
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  const current = normalizeDate(referenceDate);

  if (habit.frequencyType === "weekly_count") {
    return getPeriodStreak(habit, entries, current, "week", preferences);
  }

  if (habit.frequencyType === "monthly_count") {
    return getPeriodStreak(habit, entries, current, "month", preferences);
  }

  return getOccurrenceStreak(habit, entries, current);
}

export function getFrequencyLabel(habit: Habit) {
  switch (habit.frequencyType) {
    case "daily":
      return "Daily";
    case "weekdays":
      return habit.daysOfWeek?.length ? `On ${habit.daysOfWeek.length} selected days` : "Specific days";
    case "weekly_count":
      return `${habit.weeklyTargetCount ?? 1} times per week`;
    case "monthly_count":
      return `${habit.monthlyTargetCount ?? 1} times per month`;
    case "custom":
      return habit.customFrequency?.label ?? "Custom cadence";
    default:
      return "Habit";
  }
}

export function formatTarget(habit: Habit) {
  if (habit.habitType === "binary") {
    return "Done / not done";
  }

  return `${habit.targetValue ?? 0} ${habit.targetUnit ?? ""}`.trim();
}

export function getDailyHabitSummary(
  habit: Habit,
  entries: HabitEntry[],
  referenceDate: Date,
  preferences?: Pick<UserPreference, "weekStartsOn">,
) {
  const entry = entryForDate(entries, habit.id, referenceDate);
  const progressRatio = getEntryProgress(habit, entry);
  const { current, longest } = getStreakStats(habit, entries, referenceDate, preferences);

  const week = getPeriodPerformance(
    habit,
    entries,
    startOfWeek(referenceDate, { weekStartsOn: preferences?.weekStartsOn ?? 1 }),
    endOfWeek(referenceDate, { weekStartsOn: preferences?.weekStartsOn ?? 1 }),
    preferences,
  );
  const month = getPeriodPerformance(habit, entries, startOfMonth(referenceDate), endOfMonth(referenceDate), preferences);
  const overall = getPeriodPerformance(habit, entries, normalizeDate(habit.startDate), referenceDate, preferences);
  const recent = getPeriodPerformance(habit, entries, addDays(referenceDate, -6), referenceDate, preferences);
  const baseline = getPeriodPerformance(habit, entries, addDays(referenceDate, -27), addDays(referenceDate, -7), preferences);

  return {
    habit,
    entry,
    progressRatio,
    dueToday: isHabitDueOnDate(habit, referenceDate, entries, preferences),
    completedToday: progressRatio >= 1,
    currentStreak: current,
    bestStreak: longest,
    weeklyRate: week.rate,
    monthlyRate: month.rate,
    overallRate: overall.rate,
    atRisk: recent.rate + 0.12 < baseline.rate || week.rate < 0.55,
  } satisfies HabitSnapshot;
}

export function getWeekDays(referenceDate: Date, preferences?: Pick<UserPreference, "weekStartsOn">) {
  const start = startOfWeek(referenceDate, { weekStartsOn: preferences?.weekStartsOn ?? 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function getMonthDays(referenceDate: Date, preferences?: Pick<UserPreference, "weekStartsOn">) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: preferences?.weekStartsOn ?? 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: preferences?.weekStartsOn ?? 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function getChallengeProgress(
  challenge: Challenge,
  dataset: DemoDataset,
  referenceDate: Date | string,
) {
  const current = normalizeDate(referenceDate);
  const start = normalizeDate(challenge.startDate);
  const end = normalizeDate(challenge.endDate);
  const scopedEnd = isAfter(current, end) ? end : current;
  const habits = dataset.habits.filter((habit) => challenge.habitIds.includes(habit.id));

  const performance = aggregateRangePerformance(
    habits,
    dataset.entries,
    start,
    scopedEnd,
    dataset.preferences,
  );

  const daysElapsed = Math.max(0, Math.round((scopedEnd.getTime() - start.getTime()) / 86_400_000) + 1);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const misses = habits.reduce((count, habit) => {
    const range = getRangeLimit(habit, start, scopedEnd);

    if (isAfter(range.start, range.end)) {
      return count;
    }

    const scheduled = eachDayOfInterval({ start: range.start, end: range.end }).filter((day) =>
      isHabitDueOnDate(habit, day, dataset.entries, dataset.preferences),
    );

    return (
      count +
      scheduled.reduce((missesSoFar, day) => {
        const entry = entryForDate(dataset.entries, habit.id, day);
        return missesSoFar + (entry && !isEntryComplete(habit, entry) ? 1 : 0);
      }, 0)
    );
  }, 0);

  let status: ChallengeStatus = challenge.status;
  const requiredRate = challenge.rules?.targetSuccessRate ?? 0.8;

  if (challenge.rules?.breakOnMiss && misses > (challenge.rules.allowedMisses ?? 0)) {
    status = "failed";
  } else if (isAfter(current, end)) {
    status = performance.rate >= requiredRate ? "completed" : "failed";
  } else if (status !== "paused") {
    status = "active";
  }

  return {
    challenge,
    habits,
    progress: performance.rate,
    daysElapsed,
    daysRemaining,
    status,
    onTrack: performance.rate >= requiredRate,
    misses,
  };
}

export function findRecentNotes(entries: HabitEntry[], dailyNotes: DailyNote[], referenceDate: Date | string) {
  const current = normalizeDate(referenceDate);
  const latestEntries = entries
    .filter(
      (entry) =>
        entry.note &&
        isWithinInterval(normalizeDate(entry.entryDate), { start: addDays(current, -14), end: current }),
    )
    .slice(-6)
    .reverse();

  const latestDailyNotes = dailyNotes
    .filter((note) => isWithinInterval(normalizeDate(note.entryDate), { start: addDays(current, -14), end: current }))
    .slice(-4)
    .reverse();

  return [
    ...latestDailyNotes.map((note) => ({
      id: note.id,
      title: format(normalizeDate(note.entryDate), "EEE, MMM d"),
      body: note.content,
      kind: "day" as const,
    })),
    ...latestEntries.map((entry) => ({
      id: entry.id,
      title: format(normalizeDate(entry.entryDate), "EEE, MMM d"),
      body: entry.note ?? "",
      kind: "entry" as const,
    })),
  ].slice(0, 6);
}
