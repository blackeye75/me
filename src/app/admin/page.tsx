import type { Metadata } from 'next';
import { Login } from '@/components/admin/Login';
import { Notice } from '@/components/admin/Notice';
import { Studio } from '@/components/admin/Studio';
import { localContent } from '@/content';
import { SECTION_KEYS } from '@/lib/content';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
};

/** The content admin. Sign in with a Supabase user whose email is in the `admins` table. */
export default async function Admin() {
  const name = localContent.profile.name;
  if (!supabaseConfigured) {
    return (
      <Notice title="Connect Supabase" name={name}>
        <p>The admin panel stores content in Supabase. To switch it on:</p>
        <ol>
          <li>Create a Supabase project and run the files in <code>supabase/migrations</code>, oldest first, in its SQL editor.</li>
          <li>Create your user under Authentication → Users, then add your email: <code>insert into public.admins (email) values (&apos;you@example.com&apos;);</code></li>
          <li>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (Project Settings → API), locally in <code>.env.local</code> and in Vercel, then redeploy.</li>
        </ol>
        <p>Until then the site uses the defaults in <code>src/content</code>.</p>
      </Notice>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Login name={name} />;

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    return (
      <Notice title="No access" name={name} signOut>
        <p><strong>{user.email}</strong> is signed in but is not an admin.</p>
        <p>Add it in the Supabase SQL editor: <code>insert into public.admins (email) values (&apos;{user.email}&apos;);</code></p>
      </Notice>
    );
  }

  const { data: rows, error } = await supabase.from('content').select('id, data, updated_at');
  if (error) {
    return (
      <Notice title="Can't read content" name={name} signOut>
        <p>{error.message}</p>
        <p>Check that the migration in <code>supabase/migrations</code> has been run.</p>
      </Notice>
    );
  }

  const stored = Object.fromEntries(
    (rows ?? [])
      .filter((row) => (SECTION_KEYS as readonly string[]).includes(row.id))
      .map((row) => [row.id, { data: row.data as unknown, updatedAt: row.updated_at as string }]),
  );
  // The site address comes from the environment, so it isn't editable.
  const profile: Record<string, unknown> = { ...localContent.profile };
  delete profile.siteUrl;
  const defaults = { ...localContent, profile };

  return <Studio defaults={defaults} stored={stored} email={user.email ?? ''} name={name} />;
}
