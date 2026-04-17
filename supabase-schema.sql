-- =============================================
-- StudyComp SQL Schema
-- Supabase → SQL Editor дээр ажиллуулна
-- =============================================

-- 1. Profiles (auth.users-тай холбоотой)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role text not null default 'PARENT' -- 'PARENT' | 'CREATOR' | 'ADMIN'
);

-- 2. Students (хүүхдийн профайл)
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  age int,
  avatar text default '🐱',
  points int default 0,
  level int default 1,
  created_at timestamptz default now()
);

-- 3. Exercises (контент бүтээгчийн тоглоом)
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  type text not null, -- 'MEMORY_CARD' | 'DRAG_DROP' | 'NUMBER_SEQUENCE'
  point_reward int default 10,
  data jsonb not null, -- тоглоомын өгөгдөл
  is_published boolean default true,
  created_at timestamptz default now()
);

-- 4. Student exercise results
create table if not exists exercise_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  score int default 0,
  completed_at timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security) policies
-- =============================================
alter table profiles enable row level security;
alter table students enable row level security;
alter table exercises enable row level security;
alter table exercise_results enable row level security;

-- Profiles: өөрийн profile уншиж, бичих
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Students: эцэг эх өөрийн хүүхдүүдийг удирдана
create policy "students_select" on students for select using (
  parent_id = auth.uid() or auth.uid() in (select id from profiles where role = 'ADMIN')
);
create policy "students_insert" on students for insert with check (parent_id = auth.uid());
create policy "students_update" on students for update using (parent_id = auth.uid());
create policy "students_delete" on students for delete using (parent_id = auth.uid());

-- Exercises: бүгд уншиж болно, зохиогч л засна
create policy "exercises_select" on exercises for select using (is_published = true or creator_id = auth.uid());
create policy "exercises_insert" on exercises for insert with check (creator_id = auth.uid());
create policy "exercises_update" on exercises for update using (creator_id = auth.uid());
create policy "exercises_delete" on exercises for delete using (creator_id = auth.uid());

-- Exercise results
create policy "results_select" on exercise_results for select using (
  student_id in (select id from students where parent_id = auth.uid())
);
create policy "results_insert" on exercise_results for insert with check (true);
