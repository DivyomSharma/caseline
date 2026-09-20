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
drop table if exists public.hearings cascade;
drop table if exists public.court_cases cascade;
drop table if exists public.statements cascade;
drop table if exists public.case_sections cascade;
drop table if exists public.cases cascade;
drop table if exists public.victims cascade;
drop table if exists public.officers cascade;
drop table if exists public.police_stations cascade;
drop table if exists public.profiles cascade;
drop table if exists public.legal_sections cascade;
drop table if exists public.acts cascade;
drop table if exists public.data_sources cascade;
drop trigger if exists on_auth_user_created on auth.users;

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
    id text primary key default gen_random_uuid()::text,
    name text not null,
    station_code text not null unique,
    district text not null,
    address text,
    contact text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Officers Table
create table public.officers (
    id text primary key default gen_random_uuid()::text,
    profile_id uuid references public.profiles(id) on delete cascade unique,
    badge_number text not null unique,
    rank text not null,
    station_id text references public.police_stations(id) on delete set null,
    phone text,
    joining_date date not null default current_date,
    status text not null default 'active' check (status in ('active', 'inactive', 'suspended', 'on_leave')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Victims / Complainants Table
create table public.victims (
    id text primary key default gen_random_uuid()::text,
    full_name text not null,
    contact text,
    address text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Cases Table
create table public.cases (
    id text primary key default gen_random_uuid()::text,
    case_number text not null unique,
    crime_type text not null,
    description text,
    incident_date date not null,
    incident_time time without time zone,
    location text not null,
    station_id text references public.police_stations(id) on delete set null,
    assigned_officer_id text references public.officers(id) on delete set null,
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
    status text not null default 'registered' check (status in ('registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed', 'solved', 'closed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. FIRs (First Information Reports) Table
create table public.firs (
    id text primary key default gen_random_uuid()::text,
    fir_number text not null unique,
    case_id text references public.cases(id) on delete set null,
    complaint_date date not null default current_date,
    complaint_description text not null,
    complainant_id text references public.victims(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Criminal Records Table
create table public.criminals (
    id text primary key default gen_random_uuid()::text,
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
    case_id text references public.cases(id) on delete cascade,
    criminal_id text references public.criminals(id) on delete cascade,
    relationship_status text not null default 'suspect' check (relationship_status in ('suspect', 'accused', 'convicted', 'acquitted')),
    primary key (case_id, criminal_id)
);

-- 9. Case Victims (Many-to-Many Join)
create table public.case_victims (
    case_id text references public.cases(id) on delete cascade,
    victim_id text references public.victims(id) on delete cascade,
    primary key (case_id, victim_id)
);

-- 10. Investigations (Detailed investigator logs)
create table public.investigations (
    id text primary key default gen_random_uuid()::text,
    case_id text references public.cases(id) on delete cascade not null,
    officer_id text references public.officers(id) on delete set null,
    update_type text not null check (update_type in ('Initial Investigation', 'Witness Interview', 'Evidence Collection', 'Suspect Identification', 'Interrogation', 'Document Verification', 'Field Investigation', 'Final Review')),
    notes text not null,
    next_action text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Evidence Records Table
create table public.evidence (
    id text primary key default gen_random_uuid()::text,
    case_id text references public.cases(id) on delete cascade not null,
    evidence_type text not null check (evidence_type in ('Document', 'Photograph', 'Video', 'Physical Evidence', 'Digital Evidence', 'Other')),
    description text,
    collected_date date not null default current_date,
    collected_by text references public.officers(id) on delete set null,
    storage_location text,
    file_url text,
    status text not null default 'collected' check (status in ('collected', 'analyzing', 'verified', 'disposed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Case Audit / System Updates Table
create table public.case_updates (
    id text primary key default gen_random_uuid()::text,
    case_id text references public.cases(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    update_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Legal Corpus (BNS/BNSS/BSA) — see src/lib/legal-sections.ts for the
--     matching TS constants used by the app's offline mock-db mode.
create table public.acts (
    code text primary key,
    name text not null,
    in_force_from date,
    replaces text
);

create table public.legal_sections (
    id text primary key,
    act_code text references public.acts(code) on delete cascade not null,
    section_number text not null,
    title text not null,
    summary text not null,
    old_law_act text,
    old_law_section text,
    source_url text
);

create table public.case_sections (
    case_id text references public.cases(id) on delete cascade,
    section_id text references public.legal_sections(id) on delete cascade,
    primary key (case_id, section_id)
);

-- 14. Court Tracker
create table public.court_cases (
    id text primary key default gen_random_uuid()::text,
    case_id text references public.cases(id) on delete cascade not null unique,
    court_complex text not null,
    cnr_number text,
    judge_name text,
    next_hearing_date date,
    case_status text not null default 'pending' check (case_status in ('pending', 'charges_framed', 'trial', 'judgment', 'disposed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.hearings (
    id text primary key default gen_random_uuid()::text,
    court_case_id text references public.court_cases(id) on delete cascade not null,
    hearing_date date not null,
    purpose text not null,
    order_summary text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Statement Intelligence
create table public.statements (
    id text primary key default gen_random_uuid()::text,
    case_id text references public.cases(id) on delete cascade not null,
    witness_name text not null,
    statement_text text not null,
    recorded_date date not null default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Dataset provenance registry — powers the Government/Court/Demo badges
create table public.data_sources (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    agency text not null,
    source_url text,
    license text,
    last_synced timestamp with time zone,
    is_live boolean not null default false
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

-- --------------------------------------------------
-- RLS HELPER FUNCTIONS
-- --------------------------------------------------
-- Returns true for admins, or for officers whose own station matches the
-- given station_id. Replaces the old `using (true)` policies below, which let
-- any authenticated user (any role, any station) read every case/criminal/
-- evidence row system-wide regardless of district or assignment.
create or replace function public.can_access_station(target_station_id text)
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    left join public.officers o on o.profile_id = p.id
    where p.id = auth.uid()
      and (p.role = 'admin' or o.station_id = target_station_id)
  );
$$ language sql security definer stable;

-- Read policies (role/station scoped)
create policy "Read own profile or admin reads all" on public.profiles for select using (
  id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Authenticated users read police stations" on public.police_stations for select using (auth.uid() is not null);
create policy "Authenticated users read officer directory" on public.officers for select using (auth.uid() is not null);
create policy "Station-scoped victims read access" on public.victims for select using (
  exists (
    select 1 from public.case_victims cv join public.cases c on c.id = cv.case_id
    where cv.victim_id = victims.id and public.can_access_station(c.station_id)
  )
);
create policy "Station-scoped cases read access" on public.cases for select using (public.can_access_station(station_id));
create policy "Station-scoped firs read access" on public.firs for select using (
  exists (select 1 from public.cases c where c.id = firs.case_id and public.can_access_station(c.station_id))
);
create policy "Authenticated users read criminal records" on public.criminals for select using (auth.uid() is not null);
create policy "Station-scoped case_criminals read access" on public.case_criminals for select using (
  exists (select 1 from public.cases c where c.id = case_criminals.case_id and public.can_access_station(c.station_id))
);
create policy "Station-scoped case_victims read access" on public.case_victims for select using (
  exists (select 1 from public.cases c where c.id = case_victims.case_id and public.can_access_station(c.station_id))
);
create policy "Station-scoped investigations read access" on public.investigations for select using (
  exists (select 1 from public.cases c where c.id = investigations.case_id and public.can_access_station(c.station_id))
);
create policy "Station-scoped evidence read access" on public.evidence for select using (
  exists (select 1 from public.cases c where c.id = evidence.case_id and public.can_access_station(c.station_id))
);
create policy "Station-scoped case_updates read access" on public.case_updates for select using (
  exists (select 1 from public.cases c where c.id = case_updates.case_id and public.can_access_station(c.station_id))
);

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

-- Legal corpus & provenance registry: read-only reference data for all
-- authenticated users; only admins seed/edit it.
alter table public.acts enable row level security;
alter table public.legal_sections enable row level security;
alter table public.case_sections enable row level security;
alter table public.data_sources enable row level security;

create policy "Authenticated users read acts" on public.acts for select using (auth.uid() is not null);
create policy "Authenticated users read legal sections" on public.legal_sections for select using (auth.uid() is not null);
create policy "Admins manage acts" on public.acts for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage legal sections" on public.legal_sections for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Station-scoped case_sections read access" on public.case_sections for select using (
    exists (select 1 from public.cases c where c.id = case_sections.case_id and public.can_access_station(c.station_id))
);
create policy "Officers/Admins can link case sections" on public.case_sections for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
create policy "Authenticated users read data sources" on public.data_sources for select using (auth.uid() is not null);
create policy "Admins manage data sources" on public.data_sources for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Court Tracker & Statement Intelligence: station-scoped like the rest of
-- case-linked data.
alter table public.court_cases enable row level security;
alter table public.hearings enable row level security;
alter table public.statements enable row level security;

create policy "Station-scoped court_cases read access" on public.court_cases for select using (
    exists (select 1 from public.cases c where c.id = court_cases.case_id and public.can_access_station(c.station_id))
);
create policy "Officers/Admins can manage court_cases" on public.court_cases for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
create policy "Station-scoped hearings read access" on public.hearings for select using (
    exists (
      select 1 from public.court_cases cc join public.cases c on c.id = cc.case_id
      where cc.id = hearings.court_case_id and public.can_access_station(c.station_id)
    )
);
create policy "Officers/Admins can manage hearings" on public.hearings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);
create policy "Station-scoped statements read access" on public.statements for select using (
    exists (select 1 from public.cases c where c.id = statements.case_id and public.can_access_station(c.station_id))
);
create policy "Officers/Admins can manage statements" on public.statements for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))
);

-- --------------------------------------------------
-- LEGAL CORPUS SEED DATA (mirrors src/lib/legal-sections.ts)
-- --------------------------------------------------
insert into public.acts (code, name, in_force_from, replaces) values
    ('BNS', 'Bharatiya Nyaya Sanhita, 2023', '2024-07-01', 'IPC, 1860'),
    ('BNSS', 'Bharatiya Nagarik Suraksha Sanhita, 2023', '2024-07-01', 'CrPC, 1973'),
    ('BSA', 'Bharatiya Sakshya Adhiniyam, 2023', '2024-07-01', 'Indian Evidence Act, 1872');

insert into public.legal_sections (id, act_code, section_number, title, summary, old_law_act, old_law_section, source_url) values
    ('bns-103', 'BNS', '103', 'Murder', 'Culpable homicide amounting to murder; punishment provisions for intentional killing.', 'IPC', '302', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-115', 'BNS', '115', 'Voluntarily causing hurt', 'Whoever voluntarily causes hurt to any person.', 'IPC', '323', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-118', 'BNS', '118', 'Voluntarily causing grievous hurt', 'Grievous hurt caused voluntarily, including by dangerous weapons or means.', 'IPC', '325/326', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-303', 'BNS', '303', 'Theft', 'Dishonestly taking movable property out of the possession of another without consent.', 'IPC', '378/379', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-308', 'BNS', '308', 'Extortion', 'Intentionally putting a person in fear of injury to dishonestly induce delivery of property.', 'IPC', '383/384', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-309', 'BNS', '309', 'Robbery', 'Theft or extortion committed with force, or the threat of instant hurt/wrongful restraint.', 'IPC', '392', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-311', 'BNS', '311', 'Dacoity', 'Robbery committed by five or more persons acting in concert.', 'IPC', '395', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-318', 'BNS', '318', 'Cheating', 'Fraudulently or dishonestly inducing a person to deliver property or do/omit an act.', 'IPC', '420', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-331', 'BNS', '331', 'House-breaking / lurking house-trespass', 'Trespass into a building used as a human dwelling, by breaking, at night or otherwise.', 'IPC', '449/454/457', 'https://www.indiacode.nic.in/handle/123456789/20062'),
    ('bns-351', 'BNS', '351', 'Criminal intimidation', 'Threatening a person with injury to person, reputation, or property to cause alarm.', 'IPC', '506', 'https://www.indiacode.nic.in/handle/123456789/20062');

insert into public.data_sources (name, agency, source_url, license, is_live) values
    ('Delhi Police organisational structure', 'Delhi Police', 'https://www.delhipolice.gov.in', 'Public/Government', false),
    ('India Code — BNS/BNSS/BSA', 'Ministry of Law and Justice, GoI', 'https://www.indiacode.nic.in', 'Public/Government', false);
