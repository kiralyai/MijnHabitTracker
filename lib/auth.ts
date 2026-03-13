import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserScaffold, getUserDataset, mapSavedProfile } from "@/lib/supabase/app-data";
import type { Viewer } from "@/types/app";
import type { DemoDataset } from "@/types/app";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getViewer(): Promise<Viewer> {
  const { supabase, user } = await requireUser();
  return getViewerFromUser(supabase, user);
}

async function getViewerFromUser(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  user: User,
): Promise<Viewer> {
  await ensureUserScaffold(supabase, user);
  const profileResult = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = mapSavedProfile(profileResult.data as ProfileRow | null, user);

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName || "Northstar member",
    mode: "supabase",
  };
}

export async function getAppBootstrap(): Promise<{ viewer: Viewer; dataset: DemoDataset }> {
  const { supabase, user } = await requireUser();
  const dataset = await getUserDataset(supabase, user);
  const viewer: Viewer = {
    id: dataset.profile.id,
    email: dataset.profile.email,
    fullName: dataset.profile.fullName || "Northstar member",
    mode: "supabase",
  };

  return { viewer, dataset };
}
