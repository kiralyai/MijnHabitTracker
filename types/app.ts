export type HabitType = "binary" | "count" | "duration";

export type FrequencyType =
  | "daily"
  | "weekdays"
  | "weekly_count"
  | "monthly_count"
  | "custom";

export type EntryStatus = "pending" | "completed" | "partial" | "missed" | "skipped";

export type ChallengeStatus = "active" | "completed" | "failed" | "paused";

export type ThemePreference = "system" | "light" | "dark";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  categoryId?: string | null;
  title: string;
  description: string;
  icon: string;
  color: string;
  habitType: HabitType;
  frequencyType: FrequencyType;
  targetValue?: number | null;
  targetUnit?: string | null;
  daysOfWeek?: number[] | null;
  weeklyTargetCount?: number | null;
  monthlyTargetCount?: number | null;
  customFrequency?: {
    intervalDays?: number;
    label?: string;
  } | null;
  startDate: string;
  endDate?: string | null;
  challengeDuration?: number | null;
  isArchived: boolean;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  userId: string;
  habitId: string;
  entryDate: string;
  status: EntryStatus;
  completed: boolean;
  numericValue?: number | null;
  durationMinutes?: number | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeRuleSet {
  breakOnMiss?: boolean;
  allowedMisses?: number;
  targetSuccessRate?: number;
}

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetDays?: number | null;
  status: ChallengeStatus;
  rules?: ChallengeRuleSet | null;
  habitIds: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNote {
  id: string;
  userId: string;
  entryDate: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  theme: ThemePreference;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timezone: string;
  defaultDashboardRange: "4w" | "8w" | "12w";
  createdAt: string;
  updatedAt: string;
}

export interface DemoDataset {
  profile: Profile;
  categories: Category[];
  habits: Habit[];
  entries: HabitEntry[];
  challenges: Challenge[];
  dailyNotes: DailyNote[];
  preferences: UserPreference;
}

export interface HabitFormValues {
  id?: string;
  title: string;
  description: string;
  categoryId?: string | null;
  icon: string;
  color: string;
  habitType: HabitType;
  frequencyType: FrequencyType;
  targetValue?: number | null;
  targetUnit?: string | null;
  daysOfWeek?: number[];
  weeklyTargetCount?: number | null;
  monthlyTargetCount?: number | null;
  customIntervalDays?: number | null;
  startDate: string;
  endDate?: string | null;
  challengeDuration?: number | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface ChallengeFormValues {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetDays?: number | null;
  status: ChallengeStatus;
  habitIds: string[];
  breakOnMiss?: boolean;
  allowedMisses?: number | null;
  targetSuccessRate?: number | null;
  notes?: string | null;
}

export interface Viewer {
  id: string;
  email: string;
  fullName: string;
  mode: "demo" | "supabase";
}

export interface HabitSnapshot {
  habit: Habit;
  entry?: HabitEntry;
  progressRatio: number;
  dueToday: boolean;
  completedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  weeklyRate: number;
  monthlyRate: number;
  overallRate: number;
  atRisk: boolean;
}
