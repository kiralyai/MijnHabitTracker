const PRODUCTION_SITE_URL = "https://mijnhabittracker.nl";
const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppSiteUrl() {
  const configured =
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ??
    normalizeUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (configured) {
    return configured;
  }

  return process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;
}

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: getAppSiteUrl(),
  };
}

export function isSupabaseConfigured() {
  const env = getSupabaseEnv();
  return Boolean(env.url && env.anonKey);
}
