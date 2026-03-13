"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createEmptyDataset,
  mapChallengeRow,
  mapDailyNoteRow,
  mapHabitEntryRow,
  mapHabitRow,
  mapUserPreferenceRow,
} from "@/lib/supabase/app-data";
import { toDateKey } from "@/lib/utils";
import type { Challenge, ChallengeFormValues, DemoDataset, Habit, HabitEntry, HabitFormValues } from "@/types/app";
import type { Database } from "@/types/database";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];
type HabitEntryRow = Database["public"]["Tables"]["habit_entries"]["Row"];
type HabitEntryInsert = Database["public"]["Tables"]["habit_entries"]["Insert"];
type ChallengeRow = Database["public"]["Tables"]["challenges"]["Row"];
type ChallengeInsert = Database["public"]["Tables"]["challenges"]["Insert"];
type ChallengeHabitInsert = Database["public"]["Tables"]["challenge_habits"]["Insert"];
type DailyNoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];
type DailyNoteInsert = Database["public"]["Tables"]["daily_notes"]["Insert"];
type UserPreferenceRow = Database["public"]["Tables"]["user_preferences"]["Row"];
type UserPreferenceInsert = Database["public"]["Tables"]["user_preferences"]["Insert"];

type HabitStoreState = DemoDataset & {
  replaceDataset: (dataset: DemoDataset) => void;
  saveHabit: (values: HabitFormValues) => Promise<Habit>;
  toggleHabitActive: (habitId: string) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleBinaryEntry: (habitId: string, date: Date | string) => Promise<void>;
  updateEntryValue: (habitId: string, date: Date | string, value: number, note?: string) => Promise<void>;
  setEntryNote: (habitId: string, date: Date | string, note: string) => Promise<void>;
  setDailyNote: (date: Date | string, content: string) => Promise<void>;
  saveChallenge: (values: ChallengeFormValues) => Promise<Challenge>;
  updatePreferences: (values: Partial<DemoDataset["preferences"]>) => Promise<void>;
};

type HabitStore = StoreApi<HabitStoreState>;

const HabitStoreContext = createContext<HabitStore | null>(null);

async function getSupabaseOrThrow() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }

  return supabase;
}

function toWritePayload<T>(value: T): never {
  return value as never;
}

function toWriteRows<T>(value: T[]): never[] {
  return value as never[];
}

function resolveEntryStatus(habit: Habit, value?: number) {
  if (habit.habitType === "binary") {
    return value ? "completed" : "missed";
  }

  const threshold = habit.targetValue ?? 1;
  if (!value || value <= 0) {
    return "missed";
  }

  return value >= threshold ? "completed" : "partial";
}

function patchEntry(entries: HabitEntry[], nextEntry: HabitEntry) {
  const existingIndex = entries.findIndex(
    (entry) => entry.habitId === nextEntry.habitId && entry.entryDate === nextEntry.entryDate,
  );

  if (existingIndex === -1) {
    return [...entries, nextEntry];
  }

  const draft = [...entries];
  draft[existingIndex] = nextEntry;
  return draft;
}

function createChallengeRules(values: ChallengeFormValues) {
  const rules = {
    breakOnMiss: values.breakOnMiss ?? false,
    allowedMisses: values.allowedMisses ?? undefined,
    targetSuccessRate: values.targetSuccessRate ?? undefined,
  };

  return Object.values(rules).some((value) => value !== undefined && value !== false) ? rules : null;
}

function createHabitStore(initialDataset: DemoDataset) {
  return createStore<HabitStoreState>()((set, get) => ({
    ...initialDataset,
    replaceDataset: (dataset) => set(() => dataset),
    saveHabit: async (values) => {
      const supabase = await getSupabaseOrThrow();
      const now = new Date().toISOString();
      const existingHabit = get().habits.find((item) => item.id === values.id);
      const payload: HabitInsert | HabitUpdate = {
        user_id: get().profile.id,
        category_id: values.categoryId ?? null,
        title: values.title,
        description: values.description,
        icon: values.icon,
        color: values.color,
        habit_type: values.habitType,
        frequency_type: values.frequencyType,
        target_value: values.targetValue ?? null,
        target_unit: values.targetUnit ?? null,
        days_of_week: values.daysOfWeek?.length ? values.daysOfWeek : null,
        weekly_target_count: values.weeklyTargetCount ?? null,
        monthly_target_count: values.monthlyTargetCount ?? null,
        custom_frequency:
          values.frequencyType === "custom" && values.customIntervalDays
            ? {
                intervalDays: values.customIntervalDays,
                label: `Every ${values.customIntervalDays} day${values.customIntervalDays === 1 ? "" : "s"}`,
              }
            : null,
        start_date: values.startDate,
        end_date: values.endDate ?? null,
        challenge_duration: values.challengeDuration ?? null,
        is_archived: existingHabit?.isArchived ?? false,
        is_active: values.isActive ?? true,
        notes: values.notes ?? null,
        updated_at: now,
      };

      const query = values.id
        ? supabase.from("habits").update(toWritePayload(payload)).eq("id", values.id).select("*").single()
        : supabase.from("habits").insert(toWritePayload(payload)).select("*").single();
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const habit = mapHabitRow(data as HabitRow);

      set((state) => ({
        habits: state.habits.some((item) => item.id === habit.id)
          ? state.habits.map((item) => (item.id === habit.id ? habit : item))
          : [...state.habits, habit],
      }));

      return habit;
    },
    toggleHabitActive: async (habitId) => {
      const current = get().habits.find((habit) => habit.id === habitId);

      if (!current) {
        return;
      }

      const supabase = await getSupabaseOrThrow();
      const { data, error } = await supabase
        .from("habits")
        .update(toWritePayload<HabitUpdate>({ is_active: !current.isActive }))
        .eq("id", habitId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const habit = mapHabitRow(data as HabitRow);
      set((state) => ({
        habits: state.habits.map((item) => (item.id === habit.id ? habit : item)),
      }));
    },
    archiveHabit: async (habitId) => {
      const supabase = await getSupabaseOrThrow();
      const { data, error } = await supabase
        .from("habits")
        .update(toWritePayload<HabitUpdate>({ is_archived: true, is_active: false }))
        .eq("id", habitId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const habit = mapHabitRow(data as HabitRow);
      set((state) => ({
        habits: state.habits.map((item) => (item.id === habit.id ? habit : item)),
      }));
    },
    deleteHabit: async (habitId) => {
      const supabase = await getSupabaseOrThrow();
      const { error } = await supabase.from("habits").delete().eq("id", habitId);

      if (error) {
        throw error;
      }

      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== habitId),
        entries: state.entries.filter((entry) => entry.habitId !== habitId),
        challenges: state.challenges.map((challenge) => ({
          ...challenge,
          habitIds: challenge.habitIds.filter((id) => id !== habitId),
        })),
      }));
    },
    toggleBinaryEntry: async (habitId, date) => {
      const habit = get().habits.find((item) => item.id === habitId);

      if (!habit) {
        return;
      }

      const supabase = await getSupabaseOrThrow();
      const entryDate = toDateKey(date);
      const existing = get().entries.find((entry) => entry.habitId === habitId && entry.entryDate === entryDate);
      const completed = !existing?.completed;
      const payload: HabitEntryInsert = {
        user_id: get().profile.id,
        habit_id: habitId,
        entry_date: entryDate,
        status: completed ? "completed" : "missed",
        completed,
        numeric_value: null,
        duration_minutes: null,
        note: existing?.note ?? null,
      };
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(toWritePayload(payload), { onConflict: "user_id,habit_id,entry_date" })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const nextEntry = mapHabitEntryRow(data as HabitEntryRow);
      set((state) => ({
        entries: patchEntry(state.entries, nextEntry),
      }));
    },
    updateEntryValue: async (habitId, date, value, note) => {
      const habit = get().habits.find((item) => item.id === habitId);

      if (!habit) {
        return;
      }

      const supabase = await getSupabaseOrThrow();
      const entryDate = toDateKey(date);
      const existing = get().entries.find((entry) => entry.habitId === habitId && entry.entryDate === entryDate);
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(
          toWritePayload<HabitEntryInsert>({
            user_id: get().profile.id,
            habit_id: habitId,
            entry_date: entryDate,
            status: resolveEntryStatus(habit, value),
            completed: value >= (habit.targetValue ?? 1),
            numeric_value: habit.habitType === "count" ? value : null,
            duration_minutes: habit.habitType === "duration" ? value : null,
            note: note ?? existing?.note ?? null,
          }),
          { onConflict: "user_id,habit_id,entry_date" },
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const nextEntry = mapHabitEntryRow(data as HabitEntryRow);
      set((state) => ({
        entries: patchEntry(state.entries, nextEntry),
      }));
    },
    setEntryNote: async (habitId, date, note) => {
      const habit = get().habits.find((item) => item.id === habitId);

      if (!habit) {
        return;
      }

      const supabase = await getSupabaseOrThrow();
      const entryDate = toDateKey(date);
      const existing = get().entries.find((entry) => entry.habitId === habitId && entry.entryDate === entryDate);
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(
          toWritePayload<HabitEntryInsert>({
            user_id: get().profile.id,
            habit_id: habitId,
            entry_date: entryDate,
            status: existing?.status ?? "pending",
            completed: existing?.completed ?? false,
            numeric_value: existing?.numericValue ?? null,
            duration_minutes: existing?.durationMinutes ?? null,
            note,
          }),
          { onConflict: "user_id,habit_id,entry_date" },
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const nextEntry = mapHabitEntryRow(data as HabitEntryRow);
      set((state) => ({
        entries: patchEntry(state.entries, nextEntry),
      }));
    },
    setDailyNote: async (date, content) => {
      const supabase = await getSupabaseOrThrow();
      const entryDate = toDateKey(date);
      const { data, error } = await supabase
        .from("daily_notes")
        .upsert(
          toWritePayload<DailyNoteInsert>({
            user_id: get().profile.id,
            entry_date: entryDate,
            content,
          }),
          { onConflict: "user_id,entry_date" },
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const nextNote = mapDailyNoteRow(data as DailyNoteRow);
      set((state) => ({
        dailyNotes: state.dailyNotes.some((item) => item.id === nextNote.id)
          ? state.dailyNotes.map((item) => (item.id === nextNote.id ? nextNote : item))
          : [nextNote, ...state.dailyNotes],
      }));
    },
    saveChallenge: async (values) => {
      const supabase = await getSupabaseOrThrow();
      const rules = createChallengeRules(values);
      const payload: ChallengeInsert = {
        user_id: get().profile.id,
        title: values.title,
        description: values.description,
        start_date: values.startDate,
        end_date: values.endDate,
        target_days: values.targetDays ?? null,
        status: values.status,
        rules_json: rules,
        notes: values.notes ?? null,
      };
      const query = values.id
        ? supabase.from("challenges").update(toWritePayload(payload)).eq("id", values.id).select("*").single()
        : supabase.from("challenges").insert(toWritePayload(payload)).select("*").single();
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const challengeId = (data as ChallengeRow).id;
      const deleteLinksResult = await supabase.from("challenge_habits").delete().eq("challenge_id", challengeId);

      if (deleteLinksResult.error) {
        throw deleteLinksResult.error;
      }

      if (values.habitIds.length) {
        const insertLinksResult = await supabase.from("challenge_habits").insert(
          toWriteRows<ChallengeHabitInsert>(values.habitIds.map((habitId) => ({
            challenge_id: challengeId,
            habit_id: habitId,
          }))),
        );

        if (insertLinksResult.error) {
          throw insertLinksResult.error;
        }
      }

      const challenge = mapChallengeRow(data as ChallengeRow, values.habitIds);
      set((state) => ({
        challenges: state.challenges.some((item) => item.id === challenge.id)
          ? state.challenges.map((item) => (item.id === challenge.id ? challenge : item))
          : [...state.challenges, challenge],
      }));

      return challenge;
    },
    updatePreferences: async (values) => {
      const supabase = await getSupabaseOrThrow();
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(
          toWritePayload<UserPreferenceInsert>({
            user_id: get().profile.id,
            theme: values.theme ?? get().preferences.theme,
            week_starts_on: values.weekStartsOn ?? get().preferences.weekStartsOn,
            timezone: values.timezone ?? get().preferences.timezone,
            default_dashboard_range: values.defaultDashboardRange ?? get().preferences.defaultDashboardRange,
          }),
          { onConflict: "user_id" },
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const preferences = mapUserPreferenceRow(data as UserPreferenceRow);
      set(() => ({
        preferences,
      }));
    },
  }));
}

export function HabitStoreProvider({
  children,
  initialDataset,
}: {
  children: ReactNode;
  initialDataset: DemoDataset;
}) {
  const [store] = useState(() => createHabitStore(initialDataset));

  useEffect(() => {
    store.getState().replaceDataset(initialDataset);
  }, [initialDataset, store]);

  return createElement(HabitStoreContext.Provider, { value: store }, children);
}

export function useHabitStore<T>(selector: (state: HabitStoreState) => T): T {
  const store = useContext(HabitStoreContext);

  if (!store) {
    throw new Error("useHabitStore must be used within HabitStoreProvider.");
  }

  return useStore(store, selector);
}

export function selectHabitDataset(state: HabitStoreState): DemoDataset {
  return {
    profile: state.profile,
    categories: state.categories,
    habits: state.habits,
    entries: state.entries,
    challenges: state.challenges,
    dailyNotes: state.dailyNotes,
    preferences: state.preferences,
  };
}

export function createInitialHabitDataset() {
  return createEmptyDataset();
}

export function useMutationErrorToast() {
  return (error: unknown, fallback = "Something went wrong.") => {
    toast.error(error instanceof Error ? error.message : fallback);
  };
}
