import { endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subDays, subWeeks } from "date-fns";

import { createDemoDataset } from "@/lib/demo-data";
import {
  aggregateRangePerformance,
  entryForDate,
  findRecentNotes,
  getChallengeProgress,
  getDailyHabitSummary,
  getFrequencyLabel,
  getMonthDays,
  getWeekDays,
  getEntryProgress,
  isHabitDueOnDate,
  isHabitScheduledOnDate,
} from "@/lib/habit-utils";
import type { Challenge, DemoDataset } from "@/types/app";

export function getDatasetOrDemo(dataset?: DemoDataset) {
  return dataset ?? createDemoDataset();
}

export function getDashboardModel(dataset: DemoDataset, referenceDate: Date) {
  const activeHabits = dataset.habits.filter((habit) => !habit.isArchived && habit.isActive);
  const snapshots = activeHabits.map((habit) =>
    getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences),
  );
  const dueToday = snapshots.filter((snapshot) => snapshot.dueToday);
  const completedToday = dueToday.filter((snapshot) => snapshot.completedToday).length;
  const todayRate = dueToday.length === 0 ? 0 : completedToday / dueToday.length;

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: dataset.preferences.weekStartsOn });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: dataset.preferences.weekStartsOn });
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const weekRange = aggregateRangePerformance(
    activeHabits,
    dataset.entries,
    weekStart,
    weekEnd,
    dataset.preferences,
  );
  const monthRange = aggregateRangePerformance(
    activeHabits,
    dataset.entries,
    monthStart,
    monthEnd,
    dataset.preferences,
  );
  const challenges = dataset.challenges.map((challenge) =>
    getChallengeProgress(challenge, dataset, referenceDate),
  );
  const challengeSuccessRate =
    challenges.length === 0
      ? 0
      : challenges.filter((challenge) => challenge.onTrack || challenge.status === "completed").length /
        challenges.length;
  const consistencyScore = Math.round(
    (todayRate * 0.2 + weekRange.rate * 0.35 + monthRange.rate * 0.3 + challengeSuccessRate * 0.15) * 100,
  );

  const trendData = Array.from({ length: 8 }, (_, index) => {
    const weekDate = subWeeks(referenceDate, 7 - index);
    const weekStartForBar = startOfWeek(weekDate, { weekStartsOn: dataset.preferences.weekStartsOn });
    const weekEndForBar = endOfWeek(weekDate, { weekStartsOn: dataset.preferences.weekStartsOn });
    const performance = aggregateRangePerformance(
      activeHabits,
      dataset.entries,
      weekStartForBar,
      weekEndForBar,
      dataset.preferences,
    );

    return {
      label: format(weekStartForBar, "MMM d"),
      rate: Math.round(performance.rate * 100),
    };
  });

  const distribution = dataset.categories.map((category) => {
    const categoryHabits = activeHabits.filter((habit) => habit.categoryId === category.id);
    const performance = aggregateRangePerformance(
      categoryHabits,
      dataset.entries,
      monthStart,
      monthEnd,
      dataset.preferences,
    );

    return {
      name: category.name,
      value: Math.round(performance.rate * 100),
      color: category.color,
    };
  });

  return {
    activeHabitCount: activeHabits.length,
    completedToday,
    todayRate,
    weekRate: weekRange.rate,
    monthRate: monthRange.rate,
    consistencyScore,
    snapshots,
    dueToday,
    challenges,
    trendData,
    distribution,
    topHabits: [...snapshots].sort((a, b) => b.monthlyRate - a.monthlyRate).slice(0, 5),
    streakLeaders: [...snapshots].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 4),
    riskHabits: [...snapshots].filter((habit) => habit.atRisk).slice(0, 4),
    recentNotes: findRecentNotes(dataset.entries, dataset.dailyNotes, referenceDate),
  };
}

export function getTodayModel(dataset: DemoDataset, referenceDate: Date) {
  const habits = dataset.habits
    .filter((habit) => !habit.isArchived && habit.isActive)
    .filter((habit) => isHabitDueOnDate(habit, referenceDate, dataset.entries, dataset.preferences))
    .map((habit) => {
      const entry = entryForDate(dataset.entries, habit.id, referenceDate);
      const category = dataset.categories.find((item) => item.id === habit.categoryId);

      return {
        habit,
        entry,
        category,
        progressRatio: getEntryProgress(habit, entry),
        summary: getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences),
      };
    })
    .sort((left, right) => left.progressRatio - right.progressRatio || left.habit.title.localeCompare(right.habit.title));

  const completed = habits.filter((item) => item.progressRatio >= 1).length;

  return {
    habits,
    completed,
    total: habits.length,
    rate: habits.length === 0 ? 0 : completed / habits.length,
    categories: dataset.categories.filter((category) =>
      habits.some((item) => item.habit.categoryId === category.id),
    ),
    dailyNote: dataset.dailyNotes.find((note) => note.entryDate === format(referenceDate, "yyyy-MM-dd")),
  };
}

export function getWeekModel(dataset: DemoDataset, referenceDate: Date) {
  const weekDays = getWeekDays(referenceDate, dataset.preferences);
  const activeHabits = dataset.habits.filter((habit) => !habit.isArchived && habit.isActive);
  const rows = activeHabits.map((habit) => {
    const summary = getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences);

    return {
      habit,
      summary,
      cells: weekDays.map((day) => {
        const entry = entryForDate(dataset.entries, habit.id, day);
        return {
          day,
          entry,
          due: isHabitDueOnDate(habit, day, dataset.entries, dataset.preferences),
          scheduled: isHabitScheduledOnDate(habit, day),
          progress: getEntryProgress(habit, entry),
        };
      }),
    };
  });

  const daySummaries = weekDays.map((day) => {
    const due = activeHabits.filter((habit) => isHabitDueOnDate(habit, day, dataset.entries, dataset.preferences));
    const completed = due.filter((habit) =>
      getEntryProgress(habit, entryForDate(dataset.entries, habit.id, day)) >= 1,
    ).length;

    return {
      day,
      total: due.length,
      completed,
      rate: due.length === 0 ? 0 : completed / due.length,
    };
  });

  return {
    weekDays,
    rows,
    daySummaries,
    weekRate:
      daySummaries.reduce((sum, day) => sum + day.completed, 0) /
      Math.max(1, daySummaries.reduce((sum, day) => sum + day.total, 0)),
  };
}

export function getMonthModel(dataset: DemoDataset, referenceDate: Date) {
  const days = getMonthDays(referenceDate, dataset.preferences);
  const activeHabits = dataset.habits.filter((habit) => !habit.isArchived && habit.isActive);

  const calendar = days.map((day) => {
    const due = activeHabits.filter((habit) => isHabitDueOnDate(habit, day, dataset.entries, dataset.preferences));
    const completed = due.filter((habit) =>
      getEntryProgress(habit, entryForDate(dataset.entries, habit.id, day)) >= 1,
    ).length;
    const rate = due.length === 0 ? 0 : completed / due.length;

    return {
      day,
      label: format(day, "d"),
      inMonth: isSameMonth(day, referenceDate),
      completed,
      total: due.length,
      rate,
    };
  });

  const habitRows = activeHabits.map((habit) => {
    const monthDays = calendar.filter((item) => item.inMonth);
    const completedDays = monthDays.filter((item) =>
      getEntryProgress(habit, entryForDate(dataset.entries, habit.id, item.day)) >= 1,
    ).length;

    return {
      habit,
      completedDays,
      totalDays: monthDays.filter((item) => isHabitDueOnDate(habit, item.day, dataset.entries, dataset.preferences))
        .length,
    };
  });

  return {
    calendar,
    habitRows,
    bestDays: [...calendar]
      .filter((day) => day.inMonth && day.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 4),
  };
}

export function getHabitsModel(dataset: DemoDataset, referenceDate: Date) {
  const activeHabits = dataset.habits.filter((habit) => !habit.isArchived);

  return {
    habits: activeHabits.map((habit) => ({
      ...getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences),
      category: dataset.categories.find((category) => category.id === habit.categoryId),
      frequencyLabel: getFrequencyLabel(habit),
    })),
    archivedCount: dataset.habits.filter((habit) => habit.isArchived).length,
  };
}

export function getHabitDetailModel(dataset: DemoDataset, habitId: string, referenceDate: Date) {
  const habit = dataset.habits.find((item) => item.id === habitId);

  if (!habit) {
    return null;
  }

  const summary = getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences);
  const series = Array.from({ length: 42 }, (_, index) => {
    const day = subDays(referenceDate, 41 - index);
    const entry = entryForDate(dataset.entries, habit.id, day);

    return {
      label: format(day, "MMM d"),
      progress: Math.round(getEntryProgress(habit, entry) * 100),
    };
  });

  const recentEntries = dataset.entries
    .filter((entry) => entry.habitId === habit.id)
    .slice(0, 10)
    .reverse();

  return {
    habit,
    summary,
    category: dataset.categories.find((category) => category.id === habit.categoryId),
    challenges: dataset.challenges.filter((challenge) => challenge.habitIds.includes(habit.id)),
    recentEntries,
    series,
    notes: recentEntries.filter((entry) => entry.note),
  };
}

export function getChallengesModel(dataset: DemoDataset, referenceDate: Date) {
  return dataset.challenges.map((challenge) => getChallengeProgress(challenge, dataset, referenceDate));
}

export function getChallengeDetailModel(dataset: DemoDataset, challengeId: string, referenceDate: Date) {
  const challenge = dataset.challenges.find((item) => item.id === challengeId);

  if (!challenge) {
    return null;
  }

  const progress = getChallengeProgress(challenge, dataset, referenceDate);
  const chart = Array.from({ length: 8 }, (_, index) => {
    const date = subWeeks(referenceDate, 7 - index);
    const scoped = getChallengeProgress(
      {
        ...challenge,
        endDate: format(date, "yyyy-MM-dd"),
      } satisfies Challenge,
      dataset,
      date,
    );

    return {
      label: format(date, "MMM d"),
      progress: Math.round(scoped.progress * 100),
    };
  });

  return {
    ...progress,
    chart,
  };
}

export function getAnalyticsModel(dataset: DemoDataset, referenceDate: Date) {
  const activeHabits = dataset.habits.filter((habit) => !habit.isArchived && habit.isActive);
  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const day = subDays(referenceDate, 11 - index);
    const due = activeHabits.filter((habit) => isHabitDueOnDate(habit, day, dataset.entries, dataset.preferences));
    const completed = due.filter((habit) =>
      getEntryProgress(habit, entryForDate(dataset.entries, habit.id, day)) >= 1,
    ).length;

    return {
      label: format(day, "MMM d"),
      rate: due.length === 0 ? 0 : Math.round((completed / due.length) * 100),
    };
  });

  const habitRates = activeHabits.map((habit) => {
    const summary = getDailyHabitSummary(habit, dataset.entries, referenceDate, dataset.preferences);
    return {
      name: habit.title,
      value: Math.round(summary.overallRate * 100),
      color: habit.color,
    };
  });

  const weekdayPerformance = getWeekDays(referenceDate, dataset.preferences).map((day) => {
    const allMatchingDays = Array.from({ length: 8 }, (_, index) => subWeeks(day, index)).filter(
      (value) => value <= referenceDate,
    );
    const dailyRates = allMatchingDays.map((sampleDay) => {
      const due = activeHabits.filter((habit) =>
        isHabitDueOnDate(habit, sampleDay, dataset.entries, dataset.preferences),
      );
      const completed = due.filter((habit) =>
        getEntryProgress(habit, entryForDate(dataset.entries, habit.id, sampleDay)) >= 1,
      ).length;

      return due.length === 0 ? 0 : completed / due.length;
    });

    return {
      day: format(day, "EEE"),
      rate: Math.round((dailyRates.reduce((sum, rate) => sum + rate, 0) / Math.max(1, dailyRates.length)) * 100),
    };
  });

  return {
    monthlyTrend,
    habitRates,
    weekdayPerformance,
    categoryRates: dataset.categories.map((category) => {
      const categoryHabits = activeHabits.filter((habit) => habit.categoryId === category.id);
      const performance = aggregateRangePerformance(
        categoryHabits,
        dataset.entries,
        subDays(referenceDate, 29),
        referenceDate,
        dataset.preferences,
      );

      return {
        name: category.name,
        value: Math.round(performance.rate * 100),
        color: category.color,
      };
    }),
  };
}
