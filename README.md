# Mijn Habit Tracker

A standalone, premium habit tracking web app built with Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Zustand, React Hook Form, Zod, and Supabase.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts
- Supabase auth + Postgres schema + RLS
- React Hook Form + Zod
- Zustand
- date-fns

## Project structure

```text
MijnHabitTracker/
  app/
  components/
  hooks/
  lib/
  public/
  styles/
  supabase/
  types/
  .env.example
  next.config.js
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  package.json
  README.md
```

## What’s included

- Marketing landing page
- Supabase email/password auth UI plus Google sign-in button wiring
- Protected app shell with responsive sidebar and mobile navigation
- Dashboard with completion metrics, streaks, insights, and charts
- Daily, weekly, and monthly tracking flows
- Habit creation, editing, detail pages, and notes
- Challenge tracking, analytics, and settings
- Demo data that persists locally when Supabase is not configured
- Supabase schema and seed SQL for production hookup

## Architecture overview

- `app/`
  - public routes: `/`, `/login`, `/signup`
  - protected routes: `/app/*`
  - auth callbacks: `/auth/callback`, `/auth/confirm`
- `components/`
  - `layout/` shell, sidebar, topbar, mobile nav
  - `shared/` stat cards, badges, progress UI, settings form
  - `habits/` checklists, forms, weekly grid, monthly heatmap
  - `challenges/` challenge cards and form
  - `dashboard/` charts and dashboard preview blocks
- `lib/`
  - `habit-utils.ts` scheduling, streaks, and challenge logic
  - `selectors.ts` dashboard and page-specific derived models
  - `demo-data.ts` realistic seed content for local demo mode
  - `supabase/` browser, server, and middleware helpers
- `hooks/`
  - `use-habit-store.ts` persisted local demo state
- `supabase/`
  - `migrations/001_initial_schema.sql` schema, indexes, triggers, and RLS
  - `seed.sql` demo seed for a real Supabase project

## Key utility functions

- `lib/habit-utils.ts`
  - `isHabitScheduledOnDate`
  - `isHabitDueOnDate`
  - `aggregateRangePerformance`
  - `getStreakStats`
  - `getChallengeProgress`
- `lib/selectors.ts`
  - `getDashboardModel`
  - `getTodayModel`
  - `getWeekModel`
  - `getMonthModel`
  - `getHabitDetailModel`
  - `getAnalyticsModel`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env.local
```

3. Add your Supabase values to `.env.local` if you want real auth and database access.

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Demo mode

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, the app still runs in demo mode:

- the full UI is available
- habits, entries, and preferences persist locally in the browser
- seeded demo data keeps the dashboard, charts, and trackers populated

## Connecting Supabase

1. Create a Supabase project.
2. Add the values from Project Settings > API to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

3. Apply the schema in `supabase/migrations/001_initial_schema.sql`.
4. Sign up once in the app so an `auth.users` row exists.
5. Run `supabase/seed.sql` to populate sample habits, entries, challenges, and preferences.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```
