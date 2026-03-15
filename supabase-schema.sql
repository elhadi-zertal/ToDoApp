-- ============================================
-- Supabase SQL Schema for To-Do App
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the todos table
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  is_complete boolean default false not null,
  created_at timestamptz default now() not null
);

-- 2. Enable Row Level Security
alter table public.todos enable row level security;

-- 3. Policy: Users can only see their own todos
create policy "Users can view their own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

-- 4. Policy: Users can insert their own todos
create policy "Users can insert their own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

-- 5. Policy: Users can update their own todos
create policy "Users can update their own todos"
  on public.todos
  for update
  using (auth.uid() = user_id);

-- 6. Policy: Users can delete their own todos
create policy "Users can delete their own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);

-- 7. Index for faster queries per user
create index if not exists idx_todos_user_id on public.todos(user_id);

-- ============================================
-- Task Scheduling columns (run after initial schema)
-- ============================================

-- 8. Optional due date for scheduling
alter table public.todos add column if not exists due_date date;

-- 9. Priority flag — set true automatically for overdue tasks
alter table public.todos add column if not exists priority boolean not null default false;

-- 10. Index for efficient due-date queries
create index if not exists idx_todos_due_date on public.todos(due_date);

-- 11. Optional description for each task
alter table public.todos add column if not exists description text;
