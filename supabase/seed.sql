do $$
declare
  target_user uuid;
begin
  select id into target_user
  from auth.users
  order by created_at asc
  limit 1;

  if target_user is null then
    raise notice 'No auth user found. Sign up once in the app, then rerun supabase/seed.sql.';
    return;
  end if;

  insert into public.profiles (id, email, full_name)
  values (target_user, 'demo@northstar.app', 'Northstar Demo User')
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  insert into public.user_preferences (id, user_id, theme, week_starts_on, timezone, default_dashboard_range)
  values (
    '90000000-0000-0000-0000-000000000001',
    target_user,
    'system',
    1,
    'Europe/Amsterdam',
    '8w'
  )
  on conflict (user_id) do update
  set theme = excluded.theme,
      week_starts_on = excluded.week_starts_on,
      timezone = excluded.timezone,
      default_dashboard_range = excluded.default_dashboard_range,
      updated_at = now();

  insert into public.categories (id, user_id, name, color, icon)
  values
    ('10000000-0000-0000-0000-000000000001', target_user, 'Discipline', '#ff6b4a', 'ShieldCheck'),
    ('10000000-0000-0000-0000-000000000002', target_user, 'Fitness', '#16a34a', 'Dumbbell'),
    ('10000000-0000-0000-0000-000000000003', target_user, 'Focus', '#2563eb', 'BrainCircuit'),
    ('10000000-0000-0000-0000-000000000004', target_user, 'Lifestyle', '#d97706', 'MoonStar')
  on conflict (id) do update
  set user_id = excluded.user_id,
      name = excluded.name,
      color = excluded.color,
      icon = excluded.icon,
      updated_at = now();

  insert into public.habits (
    id, user_id, category_id, title, description, icon, color, habit_type, frequency_type,
    target_value, target_unit, days_of_week, weekly_target_count, monthly_target_count,
    custom_frequency, start_date, challenge_duration, notes, is_archived, is_active
  )
  values
    ('20000000-0000-0000-0000-000000000001', target_user, '10000000-0000-0000-0000-000000000001', 'Wake Up Early', 'Out of bed before 06:30 on workdays.', 'Sunrise', '#ff6b4a', 'binary', 'weekdays', null, null, array[1,2,3,4,5], null, null, null, current_date - 120, 90, 'Better sleep, calmer mornings, sharper first work block.', false, true),
    ('20000000-0000-0000-0000-000000000002', target_user, '10000000-0000-0000-0000-000000000002', 'Morning Cardio', 'At least 30 minutes of low-intensity cardio.', 'Dumbbell', '#16a34a', 'duration', 'monthly_count', 30, 'minutes', null, null, 12, null, current_date - 95, 60, 'Keep the month moving without overfilling every week.', false, true),
    ('20000000-0000-0000-0000-000000000003', target_user, '10000000-0000-0000-0000-000000000001', 'No Porn', 'Keep the streak clean and protect focus.', 'ShieldCheck', '#0d9488', 'binary', 'daily', null, null, null, null, null, null, current_date - 120, 90, 'One of the highest-leverage habits in the system.', false, true),
    ('20000000-0000-0000-0000-000000000004', target_user, '10000000-0000-0000-0000-000000000004', 'No Clubbing', 'Protect Friday and Saturday nights from energy leaks.', 'MoonStar', '#d97706', 'binary', 'weekdays', null, null, array[5,6], null, null, null, current_date - 110, null, 'More sleep, less drift, stronger weekend reset.', false, true),
    ('20000000-0000-0000-0000-000000000005', target_user, '10000000-0000-0000-0000-000000000001', 'Sober Days Only', 'No alcohol, even socially.', 'GlassWater', '#2563eb', 'binary', 'daily', null, null, null, null, null, null, current_date - 120, 60, 'Shows up immediately in sleep and next-day mood.', false, true),
    ('20000000-0000-0000-0000-000000000006', target_user, '10000000-0000-0000-0000-000000000003', 'Offline Hours', 'Three phone-free hours every other day.', 'WifiOff', '#475569', 'duration', 'custom', 180, 'minutes', null, null, null, '{"intervalDays": 2, "label": "Every 2 days"}', current_date - 90, null, 'Useful reset habit whenever attention feels fragmented.', false, true),
    ('20000000-0000-0000-0000-000000000007', target_user, '10000000-0000-0000-0000-000000000003', 'Project Work', 'Two hours of output on the priority build.', 'Briefcase', '#2563eb', 'duration', 'weekdays', 120, 'minutes', array[1,2,3,4,5], null, null, null, current_date - 120, null, 'Measured by focused output, not busy time.', false, true),
    ('20000000-0000-0000-0000-000000000008', target_user, '10000000-0000-0000-0000-000000000001', 'No Casino', 'No betting or gambling sessions.', 'ShieldBan', '#dc2626', 'binary', 'daily', null, null, null, null, null, null, current_date - 120, 30, 'Binary and non-negotiable.', false, true),
    ('20000000-0000-0000-0000-000000000009', target_user, '10000000-0000-0000-0000-000000000001', 'Cold Shower', 'One cold finish every morning.', 'Snowflake', '#0d9488', 'binary', 'daily', null, null, null, null, null, null, current_date - 120, null, 'Fast win that sets tone and discipline.', false, true),
    ('20000000-0000-0000-0000-000000000010', target_user, '10000000-0000-0000-0000-000000000003', 'Deep Work Session', 'Five 90-minute sessions each week.', 'BrainCircuit', '#2563eb', 'duration', 'weekly_count', 90, 'minutes', null, 5, null, null, current_date - 120, 60, 'The main scorecard for focused output.', false, true),
    ('20000000-0000-0000-0000-000000000011', target_user, '10000000-0000-0000-0000-000000000004', 'Read 30 Minutes', 'A calm reading block before bed.', 'BookOpen', '#d97706', 'duration', 'daily', 30, 'minutes', null, null, null, null, current_date - 100, null, 'A reliable closing ritual when the day felt noisy.', false, true),
    ('20000000-0000-0000-0000-000000000012', target_user, '10000000-0000-0000-0000-000000000002', '10,000 Steps', 'Get enough movement without needing a gym session.', 'Footprints', '#16a34a', 'count', 'daily', 10000, 'steps', null, null, null, null, current_date - 120, null, 'Big effect on energy and sleep when it stays consistent.', false, true)
  on conflict (id) do update
  set user_id = excluded.user_id,
      category_id = excluded.category_id,
      title = excluded.title,
      description = excluded.description,
      icon = excluded.icon,
      color = excluded.color,
      habit_type = excluded.habit_type,
      frequency_type = excluded.frequency_type,
      target_value = excluded.target_value,
      target_unit = excluded.target_unit,
      days_of_week = excluded.days_of_week,
      weekly_target_count = excluded.weekly_target_count,
      monthly_target_count = excluded.monthly_target_count,
      custom_frequency = excluded.custom_frequency,
      start_date = excluded.start_date,
      challenge_duration = excluded.challenge_duration,
      notes = excluded.notes,
      is_archived = excluded.is_archived,
      is_active = excluded.is_active,
      updated_at = now();

  insert into public.challenges (id, user_id, title, description, start_date, end_date, target_days, status, rules_json, notes)
  values
    ('30000000-0000-0000-0000-000000000001', target_user, '90-Day Morning Reset', 'Build a calmer, cleaner start to the day.', current_date - 44, current_date + 46, 90, 'active', '{"targetSuccessRate": 0.85}', 'The goal is not perfection, but a stable first half of the day.'),
    ('30000000-0000-0000-0000-000000000002', target_user, '60-Day Deep Focus Sprint', 'Protect your output across the whole work week.', current_date - 21, current_date + 39, 60, 'active', '{"targetSuccessRate": 0.8}', 'A challenge designed to reduce context switching and drift.'),
    ('30000000-0000-0000-0000-000000000003', target_user, '30-Day Zero Casino', 'No slips, no exceptions, no rationalizing.', current_date - 12, current_date + 18, 30, 'active', '{"breakOnMiss": true, "allowedMisses": 0, "targetSuccessRate": 1}', 'Short, hard, clean challenge.')
  on conflict (id) do update
  set user_id = excluded.user_id,
      title = excluded.title,
      description = excluded.description,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      target_days = excluded.target_days,
      status = excluded.status,
      rules_json = excluded.rules_json,
      notes = excluded.notes,
      updated_at = now();

  delete from public.challenge_habits
  where challenge_id in (
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003'
  );

  insert into public.challenge_habits (challenge_id, habit_id)
  values
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000010'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008');

  delete from public.habit_entries
  where user_id = target_user
    and habit_id in (
      '20000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000005',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000008',
      '20000000-0000-0000-0000-000000000009',
      '20000000-0000-0000-0000-000000000010',
      '20000000-0000-0000-0000-000000000011',
      '20000000-0000-0000-0000-000000000012'
    )
    and entry_date >= current_date - 84;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, note)
  select target_user, '20000000-0000-0000-0000-000000000001', day::date,
         case when abs(sin(extract(epoch from day) / 70000.0 + 0.5)) > 0.22 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 70000.0 + 0.5)) > 0.22,
         case when abs(sin(extract(epoch from day) / 70000.0 + 0.5)) > 0.96 then 'Strong morning, no snooze.' else null end
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where extract(isodow from day) between 1 and 5;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, duration_minutes, note)
  select target_user, '20000000-0000-0000-0000-000000000002', day::date,
         case when round(30 * (0.4 + abs(sin(extract(epoch from day) / 61000.0 + 0.7)) * 0.9)) >= 30 then 'completed' else 'partial' end,
         round(30 * (0.4 + abs(sin(extract(epoch from day) / 61000.0 + 0.7)) * 0.9)) >= 30,
         round(30 * (0.4 + abs(sin(extract(epoch from day) / 61000.0 + 0.7)) * 0.9)),
         null
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where extract(isodow from day) in (1,3,5);

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed)
  select target_user, '20000000-0000-0000-0000-000000000003', day::date,
         case when abs(sin(extract(epoch from day) / 81000.0 + 1.1)) > 0.14 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 81000.0 + 1.1)) > 0.14
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed)
  select target_user, '20000000-0000-0000-0000-000000000004', day::date,
         case when abs(sin(extract(epoch from day) / 63000.0 + 0.9)) > 0.38 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 63000.0 + 0.9)) > 0.38
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where extract(isodow from day) in (5,6);

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed)
  select target_user, '20000000-0000-0000-0000-000000000005', day::date,
         case when abs(sin(extract(epoch from day) / 72000.0 + 1.7)) > 0.18 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 72000.0 + 1.7)) > 0.18
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, duration_minutes)
  select target_user, '20000000-0000-0000-0000-000000000006', day::date,
         case when round(180 * (0.3 + abs(sin(extract(epoch from day) / 62000.0 + 2.5)) * 0.95)) >= 180 then 'completed' else 'partial' end,
         round(180 * (0.3 + abs(sin(extract(epoch from day) / 62000.0 + 2.5)) * 0.95)) >= 180,
         round(180 * (0.3 + abs(sin(extract(epoch from day) / 62000.0 + 2.5)) * 0.95))
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where mod((day::date - (current_date - 90))::int, 2) = 0;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, duration_minutes, note)
  select target_user, '20000000-0000-0000-0000-000000000007', day::date,
         case when round(120 * (0.35 + abs(sin(extract(epoch from day) / 69000.0 + 0.2)) * 0.9)) >= 120 then 'completed' else 'partial' end,
         round(120 * (0.35 + abs(sin(extract(epoch from day) / 69000.0 + 0.2)) * 0.9)) >= 120,
         round(120 * (0.35 + abs(sin(extract(epoch from day) / 69000.0 + 0.2)) * 0.9)),
         case when abs(sin(extract(epoch from day) / 69000.0 + 0.2)) > 0.95 then 'Strong output block with no chat drift.' else null end
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where extract(isodow from day) between 1 and 5;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed)
  select target_user, '20000000-0000-0000-0000-000000000008', day::date,
         case when abs(sin(extract(epoch from day) / 76000.0 + 1.3)) > 0.12 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 76000.0 + 1.3)) > 0.12
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed)
  select target_user, '20000000-0000-0000-0000-000000000009', day::date,
         case when abs(sin(extract(epoch from day) / 65000.0 + 1.8)) > 0.24 then 'completed' else 'missed' end,
         abs(sin(extract(epoch from day) / 65000.0 + 1.8)) > 0.24
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, duration_minutes)
  select target_user, '20000000-0000-0000-0000-000000000010', day::date,
         case when round(90 * (0.45 + abs(sin(extract(epoch from day) / 58000.0 + 2.0)) * 0.85)) >= 90 then 'completed' else 'partial' end,
         round(90 * (0.45 + abs(sin(extract(epoch from day) / 58000.0 + 2.0)) * 0.85)) >= 90,
         round(90 * (0.45 + abs(sin(extract(epoch from day) / 58000.0 + 2.0)) * 0.85))
  from generate_series(current_date - 84, current_date, interval '1 day') day
  where extract(isodow from day) between 1 and 5;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, duration_minutes)
  select target_user, '20000000-0000-0000-0000-000000000011', day::date,
         case when round(30 * (0.35 + abs(sin(extract(epoch from day) / 67000.0 + 0.4)) * 0.95)) >= 30 then 'completed' else 'partial' end,
         round(30 * (0.35 + abs(sin(extract(epoch from day) / 67000.0 + 0.4)) * 0.95)) >= 30,
         round(30 * (0.35 + abs(sin(extract(epoch from day) / 67000.0 + 0.4)) * 0.95))
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  insert into public.habit_entries (user_id, habit_id, entry_date, status, completed, numeric_value, note)
  select target_user, '20000000-0000-0000-0000-000000000012', day::date,
         case when round(10000 * (0.42 + abs(sin(extract(epoch from day) / 74000.0 + 0.1)) * 0.8)) >= 10000 then 'completed' else 'partial' end,
         round(10000 * (0.42 + abs(sin(extract(epoch from day) / 74000.0 + 0.1)) * 0.8)) >= 10000,
         round(10000 * (0.42 + abs(sin(extract(epoch from day) / 74000.0 + 0.1)) * 0.8)),
         case when abs(sin(extract(epoch from day) / 74000.0 + 0.1)) > 0.96 then 'Extra walk after dinner pushed it over the line.' else null end
  from generate_series(current_date - 84, current_date, interval '1 day') day;

  delete from public.daily_notes
  where user_id = target_user
    and entry_date in (
      current_date - 1,
      current_date - 3,
      current_date - 7,
      current_date - 11,
      current_date - 16,
      current_date - 22
    );

  insert into public.daily_notes (user_id, entry_date, content)
  values
    (target_user, current_date - 1, 'The morning felt lighter because I planned tonight yesterday.'),
    (target_user, current_date - 3, 'Phone stayed out of reach until lunch and the whole day felt less noisy.'),
    (target_user, current_date - 7, 'Sleep quality tracks with the no-clubbing and sober streak almost instantly.'),
    (target_user, current_date - 11, 'Project work slips whenever chat opens before the first focus block.'),
    (target_user, current_date - 16, 'Cardio is easier when the clothes are laid out the night before.'),
    (target_user, current_date - 22, 'Weekend structure matters more than motivation right now.');
end;
$$;
