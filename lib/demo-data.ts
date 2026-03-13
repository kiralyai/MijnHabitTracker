import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  formatISO,
  subDays,
} from "date-fns";

import type {
  Category,
  Challenge,
  DailyNote,
  DemoDataset,
  Habit,
  HabitEntry,
  UserPreference,
} from "@/types/app";
import { clamp, toDateKey } from "@/lib/utils";

const DEMO_USER_ID = "e657330f-bf85-4e68-9d30-7d6d0d3a8f3b";
const NOW = new Date();
const START = subDays(NOW, 83);

const iso = (value: Date) => formatISO(value);

const profile = {
  id: DEMO_USER_ID,
  email: "stanley@northstar.app",
  fullName: "Stanley Redemann",
  avatarUrl: null,
  createdAt: iso(subDays(NOW, 120)),
  updatedAt: iso(NOW),
};

const categories: Category[] = [
  {
    id: "cat-discipline",
    userId: DEMO_USER_ID,
    name: "Discipline",
    color: "#ff6b4a",
    icon: "ShieldCheck",
    description: "Rules that keep your baseline clean and repeatable.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "cat-fitness",
    userId: DEMO_USER_ID,
    name: "Fitness",
    color: "#16a34a",
    icon: "Dumbbell",
    description: "Daily movement, recovery, and athletic consistency.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "cat-focus",
    userId: DEMO_USER_ID,
    name: "Focus",
    color: "#2563eb",
    icon: "BrainCircuit",
    description: "Deep work, project output, and protected attention.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "cat-lifestyle",
    userId: DEMO_USER_ID,
    name: "Lifestyle",
    color: "#d97706",
    icon: "MoonStar",
    description: "Environment and routines that shape your energy.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
];

const habits: Habit[] = [
  {
    id: "habit-wake-up-early",
    userId: DEMO_USER_ID,
    categoryId: "cat-discipline",
    title: "Wake Up Early",
    description: "Out of bed before 06:30 on workdays.",
    icon: "Sunrise",
    color: "#ff6b4a",
    habitType: "binary",
    frequencyType: "weekdays",
    daysOfWeek: [1, 2, 3, 4, 5],
    startDate: toDateKey(subDays(NOW, 120)),
    challengeDuration: 90,
    isArchived: false,
    isActive: true,
    notes: "Better sleep, calmer mornings, sharper first work block.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-morning-cardio",
    userId: DEMO_USER_ID,
    categoryId: "cat-fitness",
    title: "Morning Cardio",
    description: "At least 30 minutes of low-intensity cardio.",
    icon: "Dumbbell",
    color: "#16a34a",
    habitType: "duration",
    frequencyType: "monthly_count",
    monthlyTargetCount: 12,
    targetValue: 30,
    targetUnit: "minutes",
    startDate: toDateKey(subDays(NOW, 95)),
    challengeDuration: 60,
    isArchived: false,
    isActive: true,
    notes: "Keep the month moving without overfilling every week.",
    createdAt: iso(subDays(NOW, 95)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-no-porn",
    userId: DEMO_USER_ID,
    categoryId: "cat-discipline",
    title: "No Porn",
    description: "Keep the streak clean and protect focus.",
    icon: "ShieldCheck",
    color: "#0d9488",
    habitType: "binary",
    frequencyType: "daily",
    startDate: toDateKey(subDays(NOW, 120)),
    challengeDuration: 90,
    isArchived: false,
    isActive: true,
    notes: "One of the highest-leverage habits in the system.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-no-clubbing",
    userId: DEMO_USER_ID,
    categoryId: "cat-lifestyle",
    title: "No Clubbing",
    description: "Protect Friday and Saturday nights from energy leaks.",
    icon: "MoonStar",
    color: "#d97706",
    habitType: "binary",
    frequencyType: "weekdays",
    daysOfWeek: [5, 6],
    startDate: toDateKey(subDays(NOW, 110)),
    isArchived: false,
    isActive: true,
    notes: "More sleep, less drift, stronger weekend reset.",
    createdAt: iso(subDays(NOW, 110)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-sober-days-only",
    userId: DEMO_USER_ID,
    categoryId: "cat-discipline",
    title: "Sober Days Only",
    description: "No alcohol, even socially.",
    icon: "GlassWater",
    color: "#2563eb",
    habitType: "binary",
    frequencyType: "daily",
    startDate: toDateKey(subDays(NOW, 120)),
    challengeDuration: 60,
    isArchived: false,
    isActive: true,
    notes: "Shows up immediately in sleep and next-day mood.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-offline-hours",
    userId: DEMO_USER_ID,
    categoryId: "cat-focus",
    title: "Offline Hours",
    description: "Three phone-free hours every other day.",
    icon: "WifiOff",
    color: "#475569",
    habitType: "duration",
    frequencyType: "custom",
    customFrequency: {
      intervalDays: 2,
      label: "Every 2 days",
    },
    targetValue: 180,
    targetUnit: "minutes",
    startDate: toDateKey(subDays(NOW, 90)),
    isArchived: false,
    isActive: true,
    notes: "Useful reset habit whenever attention feels fragmented.",
    createdAt: iso(subDays(NOW, 90)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-project-work",
    userId: DEMO_USER_ID,
    categoryId: "cat-focus",
    title: "Project Work",
    description: "Two hours of output on the priority build.",
    icon: "Briefcase",
    color: "#2563eb",
    habitType: "duration",
    frequencyType: "weekdays",
    daysOfWeek: [1, 2, 3, 4, 5],
    targetValue: 120,
    targetUnit: "minutes",
    startDate: toDateKey(subDays(NOW, 120)),
    isArchived: false,
    isActive: true,
    notes: "Measured by focused output, not busy time.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-no-casino",
    userId: DEMO_USER_ID,
    categoryId: "cat-discipline",
    title: "No Casino",
    description: "No betting or gambling sessions.",
    icon: "ShieldBan",
    color: "#dc2626",
    habitType: "binary",
    frequencyType: "daily",
    startDate: toDateKey(subDays(NOW, 120)),
    challengeDuration: 30,
    isArchived: false,
    isActive: true,
    notes: "Binary and non-negotiable.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-cold-shower",
    userId: DEMO_USER_ID,
    categoryId: "cat-discipline",
    title: "Cold Shower",
    description: "One cold finish every morning.",
    icon: "Snowflake",
    color: "#0d9488",
    habitType: "binary",
    frequencyType: "daily",
    startDate: toDateKey(subDays(NOW, 120)),
    isArchived: false,
    isActive: true,
    notes: "Fast win that sets tone and discipline.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-deep-work-session",
    userId: DEMO_USER_ID,
    categoryId: "cat-focus",
    title: "Deep Work Session",
    description: "Five 90-minute sessions each week.",
    icon: "BrainCircuit",
    color: "#2563eb",
    habitType: "duration",
    frequencyType: "weekly_count",
    weeklyTargetCount: 5,
    targetValue: 90,
    targetUnit: "minutes",
    startDate: toDateKey(subDays(NOW, 120)),
    challengeDuration: 60,
    isArchived: false,
    isActive: true,
    notes: "The main scorecard for focused output.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-read-30",
    userId: DEMO_USER_ID,
    categoryId: "cat-lifestyle",
    title: "Read 30 Minutes",
    description: "A calm reading block before bed.",
    icon: "BookOpen",
    color: "#d97706",
    habitType: "duration",
    frequencyType: "daily",
    targetValue: 30,
    targetUnit: "minutes",
    startDate: toDateKey(subDays(NOW, 100)),
    isArchived: false,
    isActive: true,
    notes: "A reliable closing ritual when the day felt noisy.",
    createdAt: iso(subDays(NOW, 100)),
    updatedAt: iso(NOW),
  },
  {
    id: "habit-steps",
    userId: DEMO_USER_ID,
    categoryId: "cat-fitness",
    title: "10,000 Steps",
    description: "Get enough movement without needing a gym session.",
    icon: "Footprints",
    color: "#16a34a",
    habitType: "count",
    frequencyType: "daily",
    targetValue: 10000,
    targetUnit: "steps",
    startDate: toDateKey(subDays(NOW, 120)),
    isArchived: false,
    isActive: true,
    notes: "Big effect on energy and sleep when it stays consistent.",
    createdAt: iso(subDays(NOW, 120)),
    updatedAt: iso(NOW),
  },
];

const challenges: Challenge[] = [
  {
    id: "challenge-morning-reset",
    userId: DEMO_USER_ID,
    title: "90-Day Morning Reset",
    description: "Build a calmer, cleaner start to the day.",
    startDate: toDateKey(subDays(NOW, 44)),
    endDate: toDateKey(addDays(NOW, 46)),
    targetDays: 90,
    status: "active",
    rules: {
      targetSuccessRate: 0.85,
    },
    habitIds: [
      "habit-wake-up-early",
      "habit-cold-shower",
      "habit-no-porn",
      "habit-read-30",
    ],
    notes: "The goal is not perfection, but a stable first half of the day.",
    createdAt: iso(subDays(NOW, 44)),
    updatedAt: iso(NOW),
  },
  {
    id: "challenge-deep-focus",
    userId: DEMO_USER_ID,
    title: "60-Day Deep Focus Sprint",
    description: "Protect your output across the whole work week.",
    startDate: toDateKey(subDays(NOW, 21)),
    endDate: toDateKey(addDays(NOW, 39)),
    targetDays: 60,
    status: "active",
    rules: {
      targetSuccessRate: 0.8,
    },
    habitIds: ["habit-deep-work-session", "habit-project-work", "habit-offline-hours"],
    notes: "A challenge designed to reduce context switching and drift.",
    createdAt: iso(subDays(NOW, 21)),
    updatedAt: iso(NOW),
  },
  {
    id: "challenge-zero-casino",
    userId: DEMO_USER_ID,
    title: "30-Day Zero Casino",
    description: "No slips, no exceptions, no rationalizing.",
    startDate: toDateKey(subDays(NOW, 12)),
    endDate: toDateKey(addDays(NOW, 18)),
    targetDays: 30,
    status: "active",
    rules: {
      breakOnMiss: true,
      allowedMisses: 0,
      targetSuccessRate: 1,
    },
    habitIds: ["habit-no-casino"],
    notes: "Short, hard, clean challenge.",
    createdAt: iso(subDays(NOW, 12)),
    updatedAt: iso(NOW),
  },
];

const preferences: UserPreference = {
  id: "pref-default",
  userId: DEMO_USER_ID,
  theme: "system",
  weekStartsOn: 1,
  timezone: "Europe/Amsterdam",
  defaultDashboardRange: "8w",
  createdAt: iso(subDays(NOW, 120)),
  updatedAt: iso(NOW),
};

function signal(seed: string, date: Date) {
  const distance = differenceInCalendarDays(date, START);
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return clamp(Math.abs(Math.sin(distance * 0.68 + hash * 0.017)));
}

function isScheduledForGeneration(habit: Habit, date: Date) {
  const day = date.getDay();
  const diff = differenceInCalendarDays(date, new Date(habit.startDate));

  if (diff < 0) {
    return false;
  }

  if (habit.endDate && differenceInCalendarDays(date, new Date(habit.endDate)) > 0) {
    return false;
  }

  switch (habit.frequencyType) {
    case "daily":
      return true;
    case "weekdays":
      return habit.daysOfWeek?.includes(day) ?? false;
    case "weekly_count":
      return [1, 2, 3, 4, 5].includes(day);
    case "monthly_count":
      return [1, 3, 5].includes(day);
    case "custom":
      return diff % (habit.customFrequency?.intervalDays ?? 1) === 0;
    default:
      return false;
  }
}

function createEntry(habit: Habit, date: Date): HabitEntry | null {
  if (!isScheduledForGeneration(habit, date)) {
    return null;
  }

  const momentum = signal(habit.id, date);
  const streakLift = signal(`${habit.id}-lift`, addWeeks(date, -1));
  const score = clamp(momentum * 0.75 + streakLift * 0.25);
  const completed = score > 0.22;
  const strong = score > 0.48;
  const dateKey = toDateKey(date);
  const noteEveryNowAndThen = signal(`${habit.id}-note`, date) > 0.96;

  if (habit.habitType === "binary") {
    return {
      id: `${habit.id}-${dateKey}`,
      userId: habit.userId,
      habitId: habit.id,
      entryDate: dateKey,
      status: completed ? "completed" : "missed",
      completed,
      note: noteEveryNowAndThen
        ? completed
          ? "Strong day. The cue felt automatic."
          : "Energy dipped and the pattern broke late."
        : null,
      createdAt: iso(date),
      updatedAt: iso(date),
    };
  }

  if (habit.habitType === "duration") {
    const target = habit.targetValue ?? 0;
    const ratio = strong ? 0.9 + score * 0.35 : 0.35 + score * 0.55;
    const durationMinutes = Math.round(target * ratio);

    return {
      id: `${habit.id}-${dateKey}`,
      userId: habit.userId,
      habitId: habit.id,
      entryDate: dateKey,
      status: durationMinutes >= target ? "completed" : durationMinutes > 0 ? "partial" : "missed",
      completed: durationMinutes >= target,
      durationMinutes,
      note: noteEveryNowAndThen
        ? durationMinutes >= target
          ? "Locked in a strong session without checking messages."
          : "Started late and only got a partial block in."
        : null,
      createdAt: iso(date),
      updatedAt: iso(date),
    };
  }

  const target = habit.targetValue ?? 0;
  const ratio = strong ? 0.82 + score * 0.4 : 0.4 + score * 0.55;
  const numericValue = Math.round(target * ratio);

  return {
    id: `${habit.id}-${dateKey}`,
    userId: habit.userId,
    habitId: habit.id,
    entryDate: dateKey,
    status: numericValue >= target ? "completed" : numericValue > 0 ? "partial" : "missed",
    completed: numericValue >= target,
    numericValue,
    note: noteEveryNowAndThen
      ? numericValue >= target
        ? "Extra walk after dinner pushed it over the line."
        : "A desk-heavy day made this one hard."
      : null,
    createdAt: iso(date),
    updatedAt: iso(date),
  };
}

function createDailyNotes(): DailyNote[] {
  const noteOffsets = [1, 3, 7, 11, 16, 22];
  const copy = [
    "The morning felt lighter because I planned tonight yesterday.",
    "Phone stayed out of reach until lunch and the whole day felt less noisy.",
    "Noticed that sleep quality tracks with the no-clubbing and sober streak instantly.",
    "Project work slips whenever I open chat before the first focus block.",
    "The cardio habit is easier when clothes are laid out the night before.",
    "Weekend structure matters more than motivation right now.",
  ];

  return noteOffsets.map((offset, index) => {
    const date = subDays(NOW, offset);
    return {
      id: `daily-note-${offset}`,
      userId: DEMO_USER_ID,
      entryDate: toDateKey(date),
      content: copy[index],
      createdAt: iso(date),
      updatedAt: iso(date),
    };
  });
}

export function createDemoDataset(): DemoDataset {
  const entries = eachDayOfInterval({ start: START, end: NOW })
    .flatMap((date) => habits.map((habit) => createEntry(habit, date)))
    .filter((entry): entry is HabitEntry => Boolean(entry));

  return {
    profile,
    categories,
    habits,
    entries,
    challenges,
    dailyNotes: createDailyNotes(),
    preferences,
  };
}
