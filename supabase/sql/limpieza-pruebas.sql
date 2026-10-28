-- Limpieza después de las pruebas: deja la base de registros en cero.
-- Pegar completo en Supabase → SQL Editor → New query → Run.
-- Borra los registros y el contador anti-spam (rate_limits).
-- NO toca a los administradores (public.admins) ni a los usuarios del panel.

begin;
truncate table public.registrations;
truncate table public.rate_limits restart identity;
commit;

-- Verificación: debe mostrar 0 y 0.
select
  (select count(*) from public.registrations) as registros,
  (select count(*) from public.rate_limits)   as rate_limits;
