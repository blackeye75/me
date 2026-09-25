-- Tightening after Supabase's security advisor.

-- is_admin() runs with the caller's rights instead of elevated ones. Each
-- signed-in user may read their own row in `admins`, which is all it needs.
drop policy if exists "Admins can read admins" on public.admins;
drop policy if exists "Users can read their own admin row" on public.admins;
create policy "Users can read their own admin row" on public.admins
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Only signed-in users need it (the admin panel and the write policies).
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Fixed search path for the timestamp trigger.
create or replace function public.touch_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;
