-- Caseline PostgreSQL Schema Design
-- Target: Supabase PostgreSQL database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist to allow clean reset
drop table if exists public.case_updates cascade;
drop table if exists public.evidence cascade;
drop table if exists public.investigations cascade;
drop table if exists public.case_victims cascade;
drop table if exists public.case_criminals cascade;
drop table if exists public.criminals cascade;
drop table if exists public.firs cascade;
drop table if exists public.cases cascade;
drop table if exists public.victims cascade;
drop table if exists public.officers cascade;
drop table if exists public.police_stations cascade;
drop table if exists public.profiles cascade;

-- 1. Profiles Table (Linked to Supabase Auth users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    email text not null,
    role text not null default 'viewer' check (role in ('admin', 'officer', 'viewer')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Police Stations Table
create table public.police_stations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    station_code text not null unique,
    district text not null,
    address text,
    contact text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Officers Table
create table public.officers (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references public.profiles(id) on delete cascade unique,
    badge_number text not null unique,
    rank text not null,
    station_id uuid references public.police_stations(id) on delete set null,
    phone text,
    joining_date date not null default current_date,
    status text not null default 'active' check (status in ('active', 'inactive', 'suspended', 'on_leave')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Victims / Complainants Table
create table public.victims (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    contact text,
    address text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Cases Table
create table public.cases (
    id uuid default gen_random_uuid() primary key,
    case_number text not null unique,
    crime_type text not null,
    description text,
    incident_date date not null,
    incident_time time without time zone,
    location text not null,
    station_id uuid references public.police_stations(id) on delete set null,
    assigned_officer_id uuid references public.officers(id) on delete set null,
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
    status text not null default 'registered' check (status in ('registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed', 'solved', 'closed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. FIRs (First Information Reports) Table
create table public.firs (
    id uuid default gen_random_uuid() primary key,
    fir_number text not null unique,
    case_id uuid references public.cases(id) on delete set null,
    complaint_date date not null default current_date,
    complaint_description text not null,
    complainant_id uuid references public.victims(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Criminal Records Table
create table public.criminals (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    alias text,
    date_of_birth date,
    gender text check (gender in ('male', 'female', 'other')),
    address text,
    identification_details text,
    photograph_url text,
    notes text,
    status text not null default 'suspect' check (status in ('suspect', 'accused', 'convicted', 'acquitted', 'wanted')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Case Criminals (Many-to-Many Join)
create table public.case_criminals (
    case_id uuid references public.cases(id) on delete cascade,
    criminal_id uuid references public.criminals(id) on delete cascade,
    relationship_status text not null default 'suspect' check (relationship_status in ('suspect', 'accused', 'convicted', 'acquitted')),
    primary key (case_id, criminal_id)
);

-- 9. Case Victims (Many-to-Many Join)
create table public.case_victims (
    case_id uuid references public.cases(id) on delete cascade,
    victim_id uuid references public.victims(id) on delete cascade,
    primary key (case_id, victim_id)
);

-- 10. Investigations (Detailed investigator logs)
create table public.investigations (
    id uuid default gen_random_uuid() primary key,
    case_id uuid references public.cases(id) on delete cascade not null,
    officer_id uuid references public.officers(id) on delete set null,
    update_type text not null check (update_type in ('Initial Investigation', 'Witness Interview', 'Evidence Collection', 'Suspect Identification', 'Interrogation', 'Document Verification', 'Field Investigation', 'Final Review')),
    notes text not null,
    next_action text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Evidence Records Table
create table public.evidence (
    id uuid default gen_random_uuid() primary key,
    case_id uuid references public.cases(id) on delete cascade not null,
    evidence_type text not null check (evidence_type in ('Document', 'Photograph', 'Video', 'Physical Evidence', 'Digital Evidence', 'Other')),
    description text,
    collected_date date not null default current_date,
    collected_by uuid references public.officers(id) on delete set null,
    storage_location text,
    file_url text,
    status text not null default 'collected' check (status in ('collected', 'analyzing', 'verified', 'disposed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Case Audit / System Updates Table
create table public.case_updates (
    id uuid default gen_random_uuid() primary key,
    case_id uuid references public.cases(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    update_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------
-- INDEXES FOR HIGH PERFORMANCE
-- --------------------------------------------------
create index idx_cases_case_number on public.cases(case_number);
create index idx_cases_crime_type on public.cases(crime_type);
create index idx_cases_status on public.cases(status);
create index idx_cases_incident_date on public.cases(incident_date);
create index idx_cases_station_id on public.cases(station_id);
create index idx_cases_assigned_officer_id on public.cases(assigned_officer_id);

create index idx_firs_fir_number on public.firs(fir_number);
create index idx_criminals_full_name on public.criminals(full_name);
create index idx_investigations_case_id on public.investigations(case_id);
create index idx_evidence_case_id on public.evidence(case_id);
create index idx_case_updates_case_id on public.case_updates(case_id);

-- --------------------------------------------------
-- DATABASE TRIGGERS
-- --------------------------------------------------

-- 1. Automate profile creation on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Fictional Officer'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'viewer'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Automate updated_at column updates for cases
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_case_modified
  before update on public.cases
  for each row execute procedure public.set_updated_at();

-- --------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------
alter table public.profiles enable row level security;
alter table public.police_stations enable row level security;
alter table public.officers enable row level security;
alter table public.victims enable row level security;
alter table public.cases enable row level security;
alter table public.firs enable row level security;
alter table public.criminals enable row level security;
alter table public.case_criminals enable row level security;
alter table public.case_victims enable row level security;
alter table public.investigations enable row level security;
alter table public.evidence enable row level security;
alter table public.case_updates enable row level security;

-- Read policies (Viewer, Officer, Admin)
create policy "Allow all profiles read access" on public.profiles for select using (true);
create policy "Allow all police stations read access" on public.police_stations for select using (true);
create policy "Allow all officers read access" on public.officers for select using (true);
create policy "Allow all victims read access" on public.victims for select using (true);
create policy "Allow all cases read access" on public.cases for select using (true);
create policy "Allow all firs read access" on public.firs for select using (true);
create policy "Allow all criminals read access" on public.criminals for select using (true);
create policy "Allow all case_criminals read access" on public.case_criminals for select using (true);
create policy "Allow all case_victims read access" on public.case_victims for select using (true);
create policy "Allow all investigations read access" on public.investigations for select using (true);
create policy "Allow all evidence read access" on public.evidence for select using (true);
create policy "Allow all case_updates read access" on public.case_updates for select using (true);

-- Admin policies (Full access)
create policy "Admins have full access to profiles" on public.profiles for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins have full access to stations" on public.police_stations for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins have full access to officers" on public.officers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Officer policies (Insert / Update records)
create policy "Officers/Admins can write cases" on public.cases for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
create policy "Officers/Admins can update cases" on public.cases for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can write firs" on public.firs for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can write criminals" on public.criminals for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can write case relationships" on public.case_criminals for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
create policy "Officers/Admins can write case victims" on public.case_victims for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can write victims" on public.victims for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can log investigations" on public.investigations for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can manage evidence" on public.evidence for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

create policy "Officers/Admins can add case updates" on public.case_updates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
