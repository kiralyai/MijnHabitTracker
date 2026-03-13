import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Challenge, ChallengeRuleSet, DailyNote, DemoDataset, Habit, HabitEntry, Profile, UserPreference } from "@/types/app";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type HabitEntryRow = Database["public"]["Tables"]["habit_entries"]["Row"];
type ChallengeRow = Database["public"]["Tables"]["challenges"]["Row"];
type ChallengeHabitRow = Database["public"]["Tables"]["challenge_habits"]["Row"];
type DailyNoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];
type UserPreferenceRow = Database["public"]["Tables"]["user_preferences"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type UserPreferenceInsert = Database["public"]["Tables"]["user_preferences"]["Insert"];

type DbErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

function ensure<T>(value: T | null, message: string): T {
  if (value == null) {
    throw new Error(message);
  }

  return value;
}

function normalizeRules(rules: Record<string, unknown> | null): ChallengeRuleSet | null {
  if (!rules) {
    return null;
  }

  return {
    breakOnMiss: typeof rules.breakOnMiss === "boolean" ? rules.breakOnMiss : undefined,
    allowedMisses: typeof rules.allowedMisses === "number" ? rules.allowedMisses : undefined,
    targetSuccessRate: typeof rules.targetSuccessRate === "number" ? rules.targetSuccessRate : undefined,
  };
}

function toWritePayload<T>(value: T): never {
  return value as never;
}

function createFriendlyDataError(error: DbErrorLike, context: string) {
  if (error.code === "42P01") {
    return new Error(`Supabase app tables are missing. Run the initial database migration before opening ${context}.`);
  }

  if (error.code === "42501") {
    return new Error(`Supabase blocked access to the app data for ${context}. Verify the Row Level Security policies from the initial migration.`);
  }

  return new Error(error.message ?? `We couldn't load ${context}.`);
}

export function createEmptyDataset(user?: Pick<User, "id" | "email" | "user_metadata">): DemoDataset {
  const userId = user?.id ?? "";
  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";
  const now = new Date().toISOString();

  return {
    profile: {
      id: userId,
      email: user?.email ?? "",
      fullName,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    },
    categories: [],
    habits: [],
    entries: [],
    challenges: [],
    dailyNotes: [],
    preferences: {
      id: "",
      userId,
      theme: "system",
      weekStartsOn: 1,
      timezone: "UTC",
      defaultDashboardRange: "8w",
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function mapProfileRow(row: ProfileRow, user?: User): Profile {
  return {
    id: row.id,
    email: row.email || user?.email || "",
    fullName: row.full_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? row.email,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategoryRow(row: CategoryRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description ?? "",
    icon: row.icon ?? "Sparkles",
    color: row.color,
    habitType: row.habit_type as Habit["habitType"],
    frequencyType: row.frequency_type as Habit["frequencyType"],
    targetValue: row.target_value,
    targetUnit: row.target_unit,
    daysOfWeek: row.days_of_week,
    weeklyTargetCount: row.weekly_target_count,
    monthlyTargetCount: row.monthly_target_count,
    customFrequency:
      row.custom_frequency && typeof row.custom_frequency === "object"
        ? {
            intervalDays:
              typeof row.custom_frequency.intervalDays === "number"
                ? row.custom_frequency.intervalDays
                : undefined,
            label:
              typeof row.custom_frequency.label === "string"
                ? row.custom_frequency.label
                : undefined,
          }
        : null,
    startDate: row.start_date,
    endDate: row.end_date,
    challengeDuration: row.challenge_duration,
    isArchived: row.is_archived,
    isActive: row.is_active,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHabitEntryRow(row: HabitEntryRow): HabitEntry {
  return {
    id: row.id,
    userId: row.user_id,
    habitId: row.habit_id,
    entryDate: row.entry_date,
    status: row.status as HabitEntry["status"],
    completed: row.completed,
    numericValue: row.numeric_value,
    durationMinutes: row.duration_minutes,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChallengeRow(row: ChallengeRow, habitIds: string[]): Challenge {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? "",
    startDate: row.start_date,
    endDate: row.end_date,
    targetDays: row.target_days,
    status: row.status as Challenge["status"],
    habitIds,
    rules: normalizeRules(row.rules_json),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDailyNoteRow(row: DailyNoteRow): DailyNote {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserPreferenceRow(row: UserPreferenceRow): UserPreference {
  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme as UserPreference["theme"],
    weekStartsOn: row.week_starts_on as UserPreference["weekStartsOn"],
    timezone: row.timezone,
    defaultDashboardRange: row.default_dashboard_range as UserPreference["defaultDashboardRange"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureUserScaffold(supabase: DbClient, user: User) {
  const profilePayload: ProfileInsert = {
    id: user.id,
    email: user.email ?? "",
    full_name:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null,
    avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
  };

  const profileResult = await supabase
    .from("profiles")
    .upsert(toWritePayload(profilePayload), { onConflict: "id" })
    .select("*")
    .single();

  if (profileResult.error) {
    throw createFriendlyDataError(profileResult.error, "your profile");
  }

  const preferencePayload: UserPreferenceInsert = {
    user_id: user.id,
  };

  const preferencesResult = await supabase
    .from("user_preferences")
    .upsert(toWritePayload(preferencePayload), { onConflict: "user_id" })
    .select("*")
    .single();

  if (preferencesResult.error) {
    throw createFriendlyDataError(preferencesResult.error, "your preferences");
  }

  return {
    profile: profileResult.data as ProfileRow,
    preferences: preferencesResult.data as UserPreferenceRow,
  };
}

export async function getUserDataset(supabase: DbClient, user: User): Promise<DemoDataset> {
  const userId = user.id;
  const scaffold = await ensureUserScaffold(supabase, user);

  const [categoriesResult, habitsResult, entriesResult, challengesResult, dailyNotesResult] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", userId).order("name"),
    supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("habit_entries").select("*").eq("user_id", userId).order("entry_date", { ascending: false }),
    supabase.from("challenges").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("daily_notes").select("*").eq("user_id", userId).order("entry_date", { ascending: false }),
  ]);

  if (categoriesResult.error) throw createFriendlyDataError(categoriesResult.error, "your categories");
  if (habitsResult.error) throw createFriendlyDataError(habitsResult.error, "your habits");
  if (entriesResult.error) throw createFriendlyDataError(entriesResult.error, "your habit history");
  if (challengesResult.error) throw createFriendlyDataError(challengesResult.error, "your challenges");
  if (dailyNotesResult.error) throw createFriendlyDataError(dailyNotesResult.error, "your daily notes");

  const profile = mapProfileRow(scaffold.profile, user);
  const categories = ((categoriesResult.data ?? []) as CategoryRow[]).map(mapCategoryRow);
  const habits = ((habitsResult.data ?? []) as HabitRow[]).map(mapHabitRow);
  const entries = ((entriesResult.data ?? []) as HabitEntryRow[]).map(mapHabitEntryRow);
  const challengeRows = (challengesResult.data ?? []) as ChallengeRow[];
  const challengeIds = challengeRows.map((row) => row.id);
  const challengeHabitsResult = challengeIds.length
    ? await supabase.from("challenge_habits").select("*").in("challenge_id", challengeIds)
    : { data: [], error: null };

  if (challengeHabitsResult.error) {
    throw createFriendlyDataError(challengeHabitsResult.error, "your challenge links");
  }

  const challengeLinks = new Map<string, string[]>();

  for (const link of (challengeHabitsResult.data ?? []) as ChallengeHabitRow[]) {
    const current = challengeLinks.get(link.challenge_id) ?? [];
    current.push(link.habit_id);
    challengeLinks.set(link.challenge_id, current);
  }

  const challenges = challengeRows.map((row) =>
    mapChallengeRow(row, challengeLinks.get(row.id) ?? []),
  );
  const dailyNotes = ((dailyNotesResult.data ?? []) as DailyNoteRow[]).map(mapDailyNoteRow);
  const preferences = mapUserPreferenceRow(scaffold.preferences);

  return {
    profile,
    categories,
    habits,
    entries,
    challenges,
    dailyNotes,
    preferences,
  };
}

export function mapSavedProfile(row: ProfileRow | null, user: User): Profile {
  return row ? mapProfileRow(row, user) : createEmptyDataset(user).profile;
}

export function requireUserId(userId: string) {
  return ensure(userId, "Authenticated user is required.");
}
