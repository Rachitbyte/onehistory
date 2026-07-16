create type public.user_role as enum ('PATIENT', 'DOCTOR', 'LAB', 'PHARMACY', 'ADMIN');
create type public.case_status as enum ('OPEN', 'CLOSED', 'ARCHIVED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'PATIENT',
  created_at timestamptz not null default now()
);

create table public.medical_cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  owner_id uuid not null references public.profiles(id),
  title text not null,
  status public.case_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  grantee_id uuid not null references public.profiles(id),
  case_id uuid references public.medical_cases(id) on delete cascade,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, grantee_id, case_id)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  case_id uuid references public.medical_cases(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.medical_cases enable row level security;
alter table public.consents enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles are visible to their owner" on public.profiles for select using (auth.uid() = id);
create policy "patients can read their cases" on public.medical_cases for select using (auth.uid() = patient_id);
create policy "patients can manage their consents" on public.consents for all using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
create policy "patients can read audit history for their cases" on public.audit_events for select using (
  exists (select 1 from public.medical_cases c where c.id = audit_events.case_id and c.patient_id = auth.uid())
);
