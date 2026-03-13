export const APP_NAME = "Northstar";
export const APP_TAGLINE =
  "Track habits with clarity, consistency, and a dashboard that keeps you accountable.";

export const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/app/today", label: "Today", icon: "CircleCheckBig" },
  { href: "/app/week", label: "Week", icon: "Grid2X2" },
  { href: "/app/month", label: "Month", icon: "CalendarRange" },
  { href: "/app/habits", label: "Habits", icon: "Sparkles" },
  { href: "/app/challenges", label: "Challenges", icon: "Flag" },
  { href: "/app/analytics", label: "Analytics", icon: "ChartLine" },
  { href: "/app/settings", label: "Settings", icon: "Settings2" },
] as const;

export const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

export const HABIT_COLORS = [
  { name: "Signal Coral", value: "#ff6b4a" },
  { name: "Harbor Teal", value: "#0d9488" },
  { name: "Aurora Blue", value: "#2563eb" },
  { name: "Cedar Gold", value: "#d97706" },
  { name: "Forest Green", value: "#16a34a" },
  { name: "Slate Ink", value: "#475569" },
];

export const HABIT_ICONS = [
  "Sunrise",
  "Dumbbell",
  "ShieldCheck",
  "MoonStar",
  "GlassWater",
  "WifiOff",
  "Briefcase",
  "ShieldBan",
  "Snowflake",
  "BrainCircuit",
  "BookOpen",
  "Footprints",
];

export const MARKETING_FEATURES = [
  {
    title: "Daily focus, frictionless check-ins",
    description:
      "Start each day with a clean command center that tells you exactly what matters now.",
  },
  {
    title: "Weekly execution board",
    description:
      "Toggle progress across the week with a polished grid that feels fast on desktop and mobile.",
  },
  {
    title: "Long-horizon accountability",
    description:
      "Run 30, 60, and 90-day challenges with streaks, pace indicators, and at-risk alerts.",
  },
];

export const MARKETING_BENEFITS = [
  "Premium dashboard design tuned for both desktop depth and mobile speed.",
  "Frequency-aware streaks for weekday, weekly-count, monthly-count, and custom habits.",
  "Analytics that spotlight momentum, weak spots, consistency, and challenge progress.",
];

export const DEMO_BADGE_TEXT = "Demo mode";
