-- Registros del evento Ubeenet Connect 2026.
create extension if not exists citext;

create table public.registrations (
  id           uuid primary key default gen_random_uuid(),
  full_name    text   not null check (char_length(full_name) between 3 and 120),
  email        citext not null unique,
  whatsapp     text   not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  consent      boolean not null check (consent = true),
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  email_status text not null default 'pending', -- pending | sent | failed
  created_at   timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Sin políticas para anon: nadie inserta ni lee desde el navegador.
-- Lectura solo para administradores autenticados en la lista:
create table public.admins (email citext primary key);
alter table public.admins enable row level security;

create policy "admins leen registros"
  on public.registrations for select to authenticated
  using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

create policy "admins se ven a sí mismos"
  on public.admins for select to authenticated
  using (email = (auth.jwt()->>'email'));

-- Rate limit de la Edge Function: intentos por IP (solo service_role escribe y lee).
create table public.rate_limits (
  id         bigint generated always as identity primary key,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_ip_created_at_idx on public.rate_limits (ip, created_at desc);
alter table public.rate_limits enable row level security;

-- Limpieza: borra intentos de más de un día (la función la llama de vez en cuando).
create or replace function public.purge_rate_limits() returns void
  language sql security definer set search_path = public as $$
  delete from public.rate_limits where created_at < now() - interval '1 day';
$$;
revoke all on function public.purge_rate_limits() from public, anon, authenticated;
grant execute on function public.purge_rate_limits() to service_role;

-- TODO: Jerry agrega los correos de administradores:
-- insert into public.admins (email) values ('media@publifix.net');
