create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null check (color in ('blue', 'green')),
  bio text,
  active boolean not null default true
);

create table if not exists public.swimmers (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid references auth.users(id) on delete set null,
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,
  swimmer_name text not null,
  swimmer_age integer check (swimmer_age is null or swimmer_age between 0 and 99),
  skill_level text not null check (
    skill_level in ('New swimmer', 'Beginner', 'Intermediate', 'Advanced stroke technique')
  ),
  comments text,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  starts_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint one_slot_per_instructor_time unique (instructor_id, starts_at)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  availability_slot_id uuid not null unique references public.availability_slots(id) on delete restrict,
  parent_user_id uuid references auth.users(id) on delete set null,
  swimmer_id uuid not null references public.swimmers(id) on delete restrict,
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,
  number_of_students text not null check (number_of_students in ('1', '2', 'special_request')),
  skill_level text not null check (
    skill_level in ('New swimmer', 'Beginner', 'Intermediate', 'Advanced stroke technique')
  ),
  comments text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  swimmer_id uuid not null references public.swimmers(id) on delete cascade,
  instructor_id uuid references public.instructors(id) on delete set null,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists swimmers_parent_user_id_idx on public.swimmers(parent_user_id);
create index if not exists availability_slots_starts_at_idx on public.availability_slots(starts_at);
create index if not exists availability_slots_public_idx on public.availability_slots(starts_at, is_booked);
create index if not exists bookings_parent_user_id_idx on public.bookings(parent_user_id);
create index if not exists bookings_swimmer_id_idx on public.bookings(swimmer_id);
create index if not exists lesson_notes_swimmer_id_idx on public.lesson_notes(swimmer_id);

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = user_id
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'parent'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.instructors (name, color, bio)
values
  ('Eric', 'blue', 'Calm technical coaching for confidence, safety, and stroke development.'),
  ('Instructor 2', 'green', 'Encouraging private instruction for safety, comfort, and steady progress.')
on conflict (name) do update
set color = excluded.color,
    bio = excluded.bio,
    active = true;

alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.swimmers enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.lesson_notes enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.instructors from anon, authenticated;
revoke all on table public.swimmers from anon, authenticated;
revoke all on table public.availability_slots from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.lesson_notes from anon, authenticated;

grant select on table public.profiles to authenticated;

grant select on table public.instructors to anon, authenticated;

grant select on table public.swimmers to authenticated;
grant insert (
  parent_user_id,
  parent_name,
  parent_email,
  parent_phone,
  swimmer_name,
  swimmer_age,
  skill_level,
  comments
) on public.swimmers to authenticated;
grant update (
  parent_name,
  parent_email,
  parent_phone,
  swimmer_name,
  swimmer_age,
  skill_level,
  comments
) on public.swimmers to authenticated;

grant select on table public.availability_slots to anon, authenticated;
grant select on table public.bookings to authenticated;

grant select, insert, update, delete on table public.lesson_notes to authenticated;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and role = 'parent');

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read active instructors" on public.instructors;
create policy "public read active instructors"
on public.instructors for select
using (active = true);

drop policy if exists "admins manage instructors" on public.instructors;
create policy "admins manage instructors"
on public.instructors for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "parents read own swimmers" on public.swimmers;
create policy "parents read own swimmers"
on public.swimmers for select
using (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "parents insert own swimmers" on public.swimmers;
create policy "parents insert own swimmers"
on public.swimmers for insert
with check (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "parents update own swimmers" on public.swimmers;
create policy "parents update own swimmers"
on public.swimmers for update
using (parent_user_id = auth.uid() or public.is_admin())
with check (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "public read available future slots" on public.availability_slots;
drop policy if exists "public read future slots" on public.availability_slots;
create policy "public read future slots"
on public.availability_slots for select
using (starts_at > now());

drop policy if exists "admins manage slots" on public.availability_slots;
create policy "admins manage slots"
on public.availability_slots for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "parents read own bookings" on public.bookings;
create policy "parents read own bookings"
on public.bookings for select
using (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "admins manage bookings" on public.bookings;
create policy "admins manage bookings"
on public.bookings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage lesson notes" on public.lesson_notes;
create policy "admins manage lesson notes"
on public.lesson_notes for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.book_lesson(
  p_slot_id uuid,
  p_parent_name text,
  p_parent_email text,
  p_parent_phone text,
  p_swimmer_id uuid,
  p_swimmer_name text,
  p_swimmer_age integer,
  p_number_of_students text,
  p_skill_level text,
  p_comments text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.availability_slots%rowtype;
  v_user_id uuid := auth.uid();
  v_swimmer_id uuid;
  v_booking_id uuid;
begin
  if length(trim(coalesce(p_parent_name, ''))) < 2 or length(trim(p_parent_name)) > 120 then
    raise exception 'Parent name must be between 2 and 120 characters.';
  end if;

  if lower(trim(coalesce(p_parent_email, ''))) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or length(trim(p_parent_email)) > 254 then
    raise exception 'Please enter a valid parent email.';
  end if;

  if length(trim(coalesce(p_parent_phone, ''))) < 7 or length(trim(p_parent_phone)) > 40 then
    raise exception 'Please enter a valid parent phone number.';
  end if;

  if length(trim(coalesce(p_swimmer_name, ''))) < 1 or length(trim(p_swimmer_name)) > 120 then
    raise exception 'Swimmer name is required.';
  end if;

  if p_swimmer_age is not null and (p_swimmer_age < 0 or p_swimmer_age > 99) then
    raise exception 'Swimmer age must be between 0 and 99.';
  end if;

  if length(coalesce(p_comments, '')) > 1500 then
    raise exception 'Comments must be 1500 characters or fewer.';
  end if;

  select *
  into v_slot
  from public.availability_slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception 'This availability slot no longer exists.';
  end if;

  if v_slot.starts_at <= now() then
    raise exception 'This lesson time is in the past.';
  end if;

  if v_slot.is_booked then
    raise exception 'This instructor slot has already been booked.';
  end if;

  if not exists (
    select 1
    from public.instructors
    where instructors.id = v_slot.instructor_id
      and instructors.active = true
  ) then
    raise exception 'This instructor is not currently active.';
  end if;

  if p_number_of_students not in ('1', '2', 'special_request') then
    raise exception 'Invalid number of students.';
  end if;

  if p_skill_level not in ('New swimmer', 'Beginner', 'Intermediate', 'Advanced stroke technique') then
    raise exception 'Invalid skill level.';
  end if;

  if p_swimmer_id is not null and v_user_id is not null then
    select id
    into v_swimmer_id
    from public.swimmers
    where id = p_swimmer_id
      and parent_user_id = v_user_id;
  end if;

  if v_swimmer_id is null then
    insert into public.swimmers (
      parent_user_id,
      parent_name,
      parent_email,
      parent_phone,
      swimmer_name,
      swimmer_age,
      skill_level,
      comments
    )
    values (
      v_user_id,
      trim(p_parent_name),
      lower(trim(p_parent_email)),
      trim(p_parent_phone),
      trim(p_swimmer_name),
      p_swimmer_age,
      p_skill_level,
      nullif(trim(coalesce(p_comments, '')), '')
    )
    returning id into v_swimmer_id;
  end if;

  insert into public.bookings (
    availability_slot_id,
    parent_user_id,
    swimmer_id,
    parent_name,
    parent_email,
    parent_phone,
    number_of_students,
    skill_level,
    comments
  )
  values (
    p_slot_id,
    v_user_id,
    v_swimmer_id,
    trim(p_parent_name),
    lower(trim(p_parent_email)),
    trim(p_parent_phone),
    p_number_of_students,
    p_skill_level,
    nullif(trim(coalesce(p_comments, '')), '')
  )
  returning id into v_booking_id;

  update public.availability_slots
  set is_booked = true
  where id = p_slot_id;

  return v_booking_id;
end;
$$;

revoke all on function public.book_lesson(uuid, text, text, text, uuid, text, integer, text, text, text) from public;

create or replace function public.create_availability_slot(
  p_instructor_id uuid,
  p_starts_at_local timestamp without time zone
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required.';
  end if;

  if p_starts_at_local at time zone 'America/Chicago' <= now() then
    raise exception 'Availability must be in the future.';
  end if;

  if not exists (
    select 1
    from public.instructors
    where instructors.id = p_instructor_id
      and instructors.active = true
  ) then
    raise exception 'Choose an active instructor.';
  end if;

  insert into public.availability_slots (instructor_id, starts_at)
  values (p_instructor_id, p_starts_at_local at time zone 'America/Chicago')
  returning id into v_slot_id;

  return v_slot_id;
end;
$$;

revoke all on function public.create_availability_slot(uuid, timestamp without time zone) from public;

create or replace function public.ensure_lesson_note_matches_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.bookings
    where bookings.id = new.booking_id
      and bookings.swimmer_id = new.swimmer_id
  ) then
    raise exception 'Lesson note must reference a booking for the selected swimmer.';
  end if;

  return new;
end;
$$;

revoke all on function public.ensure_lesson_note_matches_booking() from public;

drop trigger if exists ensure_lesson_note_matches_booking on public.lesson_notes;
create trigger ensure_lesson_note_matches_booking
  before insert or update on public.lesson_notes
  for each row execute function public.ensure_lesson_note_matches_booking();

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.book_lesson(uuid, text, text, text, uuid, text, integer, text, text, text) to anon, authenticated;
grant execute on function public.create_availability_slot(uuid, timestamp without time zone) to authenticated;
