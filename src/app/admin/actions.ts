'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { CONTENT_TAG, SECTION_KEYS, type SectionKey } from '@/lib/content';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export type ActionResult = { ok: true; savedAt: string } | { ok: false; error: string };

/** Largest section accepted, as JSON. The biggest default is about 20 KB. */
const MAX_BYTES = 512 * 1024;

const isSection = (key: string): key is SectionKey => (SECTION_KEYS as readonly string[]).includes(key);

/** Signed in, and listed in `admins`. Supabase's row level security enforces the same rule. */
async function adminClient() {
  if (!supabaseConfigured) return { ok: false, error: 'Supabase is not configured.' } as const;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your session has ended. Sign in again.' } as const;
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) return { ok: false, error: `${user.email ?? 'This account'} is not an admin.` } as const;
  return { ok: true, supabase } as const;
}

/** Makes every page show the new content on its next visit. */
function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath('/', 'layout');
}

/** Saves one section and publishes it. */
export async function saveSection(key: string, data: unknown): Promise<ActionResult> {
  if (!isSection(key)) return { ok: false, error: 'Unknown section.' };
  if (data === null || typeof data !== 'object') return { ok: false, error: 'Nothing to save.' };
  if (JSON.stringify(data).length > MAX_BYTES) return { ok: false, error: 'This section is too large to save.' };
  if (key === 'projects') {
    const slugs = (data as { slug?: string }[]).map((p) => p.slug ?? '');
    const bad = slugs.find((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
    if (bad !== undefined) return { ok: false, error: `"${bad}" is not a valid page address. Use lowercase letters, numbers and hyphens.` };
    if (new Set(slugs).size !== slugs.length) return { ok: false, error: 'Two projects share a page address.' };
  }

  const client = await adminClient();
  if (!client.ok) return { ok: false, error: client.error };
  const { data: row, error } = await client.supabase
    .from('content')
    .upsert({ id: key, data })
    .select('updated_at')
    .single();
  if (error) return { ok: false, error: error.message };
  publish();
  return { ok: true, savedAt: row.updated_at as string };
}

/** Deletes a section's stored copy, so the site goes back to the default. */
export async function resetSection(key: string): Promise<ActionResult> {
  if (!isSection(key)) return { ok: false, error: 'Unknown section.' };
  const client = await adminClient();
  if (!client.ok) return { ok: false, error: client.error };
  const { error } = await client.supabase.from('content').delete().eq('id', key);
  if (error) return { ok: false, error: error.message };
  publish();
  return { ok: true, savedAt: new Date().toISOString() };
}
