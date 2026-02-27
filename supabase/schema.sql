-- Create a table for Meetings
create table if not exists meetings (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Changed from uuid references auth.users to text for NextAuth compatibility
  transcript text,
  summary text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for Insights
create table if not exists insights (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  issue text not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  jira_ticket_id text,
  status text check (status in ('open', 'resolved')) default 'open',
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table meetings enable row level security;
alter table insights enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own meetings" on meetings;
drop policy if exists "Users can insert their own meetings" on meetings;
drop policy if exists "Users can view insights for their meetings" on insights;
drop policy if exists "Users can insert insights for their meetings" on insights;

-- Create policies for meetings
-- Policy to allow users to view their own meetings
create policy "Users can view their own meetings" on meetings
  for select using (auth.uid()::text = user_id);

-- Policy to allow users to insert their own meetings
create policy "Users can insert their own meetings" on meetings
  for insert with check (auth.uid()::text = user_id);

-- Create policies for insights
-- Policy to allow users to view insights for their meetings
create policy "Users can view insights for their meetings" on insights
  for select using (
    exists (
      select 1 from meetings
      where meetings.id = insights.meeting_id
      and meetings.user_id = auth.uid()::text
    )
  );

-- Policy to allow users to insert insights for their meetings
create policy "Users can insert insights for their meetings" on insights
  for insert with check (
    exists (
      select 1 from meetings
      where meetings.id = insights.meeting_id
      and meetings.user_id = auth.uid()::text
    )
  );

-- Create a table for Waitlist
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for waitlist
alter table waitlist enable row level security;

-- Policy to allow anyone to join the waitlist (insert only)
create policy "Anyone can join the waitlist" on waitlist
  for insert with check (true);

