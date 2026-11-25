-- Nuvora Fase 1: skema awal + RLS + constraint anti-bentrok
-- Semua waktu disimpan sebagai timestamptz (UTC).

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- Enum status booking
do $$ begin
  create type booking_status as enum ('booked', 'completed', 'cancelled', 'no_show');
exception
  when duplicate_object then null;
end $$;

-- =====================
-- businesses
-- =====================
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  phone text,
  address text,
  timezone text not null default 'Asia/Jakarta',
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  constraint businesses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);

-- =====================
-- services
-- =====================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price integer check (price is null or price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists services_business_id_idx on public.services(business_id);

-- =====================
-- availability_rules
-- =====================
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  constraint availability_rules_time_order check (end_time > start_time)
);

create index if not exists availability_rules_business_id_idx on public.availability_rules(business_id);

-- =====================
-- closed_dates
-- =====================
create table if not exists public.closed_dates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  date date not null,
  reason text,
  constraint closed_dates_unique_per_business unique (business_id, date)
);

create index if not exists closed_dates_business_id_idx on public.closed_dates(business_id);

-- =====================
-- bookings
-- =====================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status booking_status not null default 'booked',
  manage_token text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  constraint bookings_time_order check (ends_at > starts_at),
  constraint bookings_manage_token_length check (char_length(manage_token) >= 32)
);

create index if not exists bookings_business_id_idx on public.bookings(business_id);
create index if not exists bookings_service_id_idx on public.bookings(service_id);
create index if not exists bookings_starts_at_idx on public.bookings(starts_at);
create unique index if not exists bookings_manage_token_uidx on public.bookings(manage_token);

-- Cegah dua booking aktif bertabrakan pada bisnis yang sama.
-- Booking dengan status cancelled tidak memblokir slot.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    business_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status <> 'cancelled');

-- =====================
-- reminders
-- =====================
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  type text not null check (type in ('h1', 'h2')),
  send_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed'))
);

create index if not exists reminders_business_id_idx on public.reminders(business_id);
create index if not exists reminders_booking_id_idx on public.reminders(booking_id);
create index if not exists reminders_send_at_idx on public.reminders(send_at);

-- =====================
-- Helper: cek kepemilikan bisnis
-- =====================
create or replace function public.is_business_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_business_owner(uuid) from public;
grant execute on function public.is_business_owner(uuid) to anon, authenticated;

-- =====================
-- RLS
-- =====================
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.availability_rules enable row level security;
alter table public.closed_dates enable row level security;
alter table public.bookings enable row level security;
alter table public.reminders enable row level security;

-- businesses
-- Pemilik bisa melihat bisnis miliknya sendiri.
create policy "businesses_select_owner"
  on public.businesses for select
  to authenticated
  using (owner_id = auth.uid());

-- Publik/anon boleh membaca profil bisnis (untuk halaman booking publik).
create policy "businesses_select_public"
  on public.businesses for select
  to anon, authenticated
  using (true);

-- Pemilik bisa membuat bisnis untuk dirinya sendiri.
create policy "businesses_insert_owner"
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Pemilik hanya bisa mengubah bisnis miliknya.
create policy "businesses_update_owner"
  on public.businesses for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Pemilik hanya bisa menghapus bisnis miliknya.
create policy "businesses_delete_owner"
  on public.businesses for delete
  to authenticated
  using (owner_id = auth.uid());

-- services
-- Publik boleh membaca layanan aktif milik bisnis mana pun (untuk halaman booking).
create policy "services_select_public_active"
  on public.services for select
  to anon, authenticated
  using (is_active = true);

-- Pemilik boleh membaca semua layanan milik bisnisnya, termasuk nonaktif.
create policy "services_select_owner"
  on public.services for select
  to authenticated
  using (public.is_business_owner(business_id));

-- Pemilik boleh menambah layanan ke bisnisnya.
create policy "services_insert_owner"
  on public.services for insert
  to authenticated
  with check (public.is_business_owner(business_id));

-- Pemilik boleh mengubah layanan bisnisnya.
create policy "services_update_owner"
  on public.services for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- Pemilik boleh menghapus layanan bisnisnya.
create policy "services_delete_owner"
  on public.services for delete
  to authenticated
  using (public.is_business_owner(business_id));

-- availability_rules
-- Publik boleh membaca jam buka untuk menampilkan slot kosong.
create policy "availability_rules_select_public"
  on public.availability_rules for select
  to anon, authenticated
  using (true);

-- Pemilik boleh kelola jam buka bisnisnya.
create policy "availability_rules_insert_owner"
  on public.availability_rules for insert
  to authenticated
  with check (public.is_business_owner(business_id));

create policy "availability_rules_update_owner"
  on public.availability_rules for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

create policy "availability_rules_delete_owner"
  on public.availability_rules for delete
  to authenticated
  using (public.is_business_owner(business_id));

-- closed_dates
-- Publik boleh membaca tanggal libur untuk perhitungan slot.
create policy "closed_dates_select_public"
  on public.closed_dates for select
  to anon, authenticated
  using (true);

-- Pemilik boleh kelola tanggal libur bisnisnya.
create policy "closed_dates_insert_owner"
  on public.closed_dates for insert
  to authenticated
  with check (public.is_business_owner(business_id));

create policy "closed_dates_update_owner"
  on public.closed_dates for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

create policy "closed_dates_delete_owner"
  on public.closed_dates for delete
  to authenticated
  using (public.is_business_owner(business_id));

-- bookings
-- PENTING: tidak ada policy select untuk anon.
-- Pelanggan tidak boleh membaca booking orang lain.
-- Pemilik hanya bisa membaca booking bisnisnya sendiri.
create policy "bookings_select_owner"
  on public.bookings for select
  to authenticated
  using (public.is_business_owner(business_id));

-- Publik boleh membuat booking (halaman booking publik).
-- Tidak boleh menyisipkan booking untuk service yang bukan milik business yang sama,
-- dan tidak boleh membuat booking berstatus selain booked.
create policy "bookings_insert_public"
  on public.bookings for insert
  to anon, authenticated
  with check (
    status = 'booked'
    and exists (
      select 1 from public.services s
      where s.id = service_id
        and s.business_id = bookings.business_id
        and s.is_active = true
    )
  );

-- Pemilik boleh mengubah booking bisnisnya (status, pindah jadwal, dll).
create policy "bookings_update_owner"
  on public.bookings for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- Pemilik boleh menghapus booking bisnisnya.
create policy "bookings_delete_owner"
  on public.bookings for delete
  to authenticated
  using (public.is_business_owner(business_id));

-- reminders
-- Hanya pemilik bisnis yang bisa melihat reminder bisnisnya.
create policy "reminders_select_owner"
  on public.reminders for select
  to authenticated
  using (public.is_business_owner(business_id));

-- Hanya pemilik bisnis yang bisa membuat reminder untuk bisnisnya.
create policy "reminders_insert_owner"
  on public.reminders for insert
  to authenticated
  with check (
    public.is_business_owner(business_id)
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.business_id = reminders.business_id
    )
  );

-- Pemilik boleh mengubah reminder bisnisnya (mis. menandai terkirim).
create policy "reminders_update_owner"
  on public.reminders for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- Pemilik boleh menghapus reminder bisnisnya.
create policy "reminders_delete_owner"
  on public.reminders for delete
  to authenticated
  using (public.is_business_owner(business_id));

-- =====================
-- RPC publik: buat booking tanpa bisa membaca booking orang lain
-- =====================
create or replace function public.create_public_booking(
  p_business_id uuid,
  p_service_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table (
  id uuid,
  business_id uuid,
  service_id uuid,
  customer_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  status booking_status,
  manage_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if nullif(trim(p_customer_name), '') is null then
    raise exception 'Nama pelanggan wajib diisi';
  end if;
  if p_customer_email is null and p_customer_phone is null then
    raise exception 'Email atau nomor WhatsApp wajib diisi';
  end if;

  if not exists (
    select 1 from public.services s
    where s.id = p_service_id
      and s.business_id = p_business_id
      and s.is_active = true
  ) then
    raise exception 'Layanan tidak valid';
  end if;

  insert into public.bookings (
    business_id, service_id, customer_name, customer_email, customer_phone, starts_at, ends_at, status
  )
  values (
    p_business_id, p_service_id, trim(p_customer_name), nullif(trim(p_customer_email), ''), nullif(trim(p_customer_phone), ''), p_starts_at, p_ends_at, 'booked'
  )
  returning * into v_booking;

  return query
  select v_booking.id, v_booking.business_id, v_booking.service_id, v_booking.customer_name,
         v_booking.starts_at, v_booking.ends_at, v_booking.status, v_booking.manage_token;
end;
$$;

revoke all on function public.create_public_booking(uuid, uuid, text, text, text, timestamptz, timestamptz) from public;
grant execute on function public.create_public_booking(uuid, uuid, text, text, text, timestamptz, timestamptz) to anon, authenticated;

-- =====================
-- RPC publik: lihat booking milik sendiri lewat manage_token
-- =====================
create or replace function public.get_booking_by_manage_token(p_token text)
returns table (
  id uuid,
  business_id uuid,
  service_id uuid,
  customer_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  status booking_status
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id, b.business_id, b.service_id, b.customer_name, b.starts_at, b.ends_at, b.status
  from public.bookings b
  where b.manage_token = p_token
  limit 1;
$$;

revoke all on function public.get_booking_by_manage_token(text) from public;
grant execute on function public.get_booking_by_manage_token(text) to anon, authenticated;
