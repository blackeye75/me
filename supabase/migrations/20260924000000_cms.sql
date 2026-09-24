-- Content management for the portfolio.
--
-- Every section of the site (profile, projects, services, the About page, ...)
-- is one row in `content`, keyed by the section's name, with the section itself
-- stored as JSON. A section without a row falls back to the defaults in
-- src/content, so the site works before anything has been edited.
--
-- Anyone may read content (the public site does). Only the email addresses
-- listed in `admins` may change it, enforced here with row level security.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- True when the signed-in user's email is in `admins`.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Admins can see the admin list (to confirm their own access); nobody edits it
-- through the API. Add admins in the SQL editor:
--   insert into public.admins (email) values ('you@example.com');
drop policy if exists "Admins can read admins" on public.admins;
create policy "Admins can read admins" on public.admins
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table if not exists public.content (
  id text primary key check (id in (
    'profile', 'intro', 'nav', 'about', 'work', 'projects', 'services',
    'experience', 'darkroom', 'footer', 'aboutPage', 'worksPage'
  )),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.content enable row level security;

drop policy if exists "Content is public" on public.content;
create policy "Content is public" on public.content
  for select to anon, authenticated using (true);

drop policy if exists "Admins can add content" on public.content;
create policy "Admins can add content" on public.content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can change content" on public.content;
create policy "Admins can change content" on public.content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can remove content" on public.content;
create policy "Admins can remove content" on public.content
  for delete to authenticated using (public.is_admin());

-- Keep updated_at and updated_by current.
create or replace function public.touch_content()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists content_touch on public.content;
create trigger content_touch
  before insert or update on public.content
  for each row execute function public.touch_content();

-- ---------------------------------------------------------------------------
-- Media: pictures, logos and videos uploaded from the admin panel
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Media is public" on storage.objects;
create policy "Media is public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "Admins can upload media" on storage.objects;
create policy "Admins can upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins can replace media" on storage.objects;
create policy "Admins can replace media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins can remove media" on storage.objects;
create policy "Admins can remove media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
