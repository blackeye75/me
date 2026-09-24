import { cache } from 'react';
import { localContent, type SiteContent } from '@/content';
import { supabaseConfigured, supabaseKey, supabaseUrl } from '@/lib/supabase/config';

/** Cache tag for everything read from Supabase; the admin panel expires it on save. */
export const CONTENT_TAG = 'content';

/** The sections that can be stored in Supabase, one row each. */
export const SECTION_KEYS = [
  'profile', 'intro', 'nav', 'about', 'work', 'projects', 'services',
  'experience', 'darkroom', 'footer', 'aboutPage', 'worksPage',
] as const satisfies ReadonlyArray<keyof SiteContent>;

export type SectionKey = (typeof SECTION_KEYS)[number];

type Row = { id: string; data: unknown };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Lays the stored sections over the defaults in `src/content`. A section that
 * was never saved keeps its default, and an object section keeps any default
 * field the stored copy lacks, so older rows survive new fields in the model.
 */
export function mergeContent(rows: Row[]): SiteContent {
  const content: Record<string, unknown> = { ...localContent };
  for (const row of rows) {
    if (!(SECTION_KEYS as readonly string[]).includes(row.id)) continue;
    const fallback = content[row.id];
    if (Array.isArray(fallback)) content[row.id] = Array.isArray(row.data) ? row.data : fallback;
    else if (isObject(fallback) && isObject(row.data)) content[row.id] = { ...fallback, ...row.data };
  }
  const merged = content as SiteContent;
  // The public address always comes from the environment, never the database.
  merged.profile = { ...merged.profile, siteUrl: localContent.profile.siteUrl };
  return merged;
}

/** Reads the stored sections through Supabase's REST API, cached until the admin saves. */
async function fetchRows(): Promise<Row[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/content?select=id,data`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    cache: 'force-cache',
    next: { tags: [CONTENT_TAG] },
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
  return (await response.json()) as Row[];
}

/**
 * The single place the site reads its content from.
 *
 * With Supabase configured, sections edited in the admin panel (/admin) replace
 * the defaults in `src/content`. Without it, or if Supabase can't be reached,
 * the site uses the defaults.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!supabaseConfigured) return localContent;
  try {
    return mergeContent(await fetchRows());
  } catch (error) {
    console.error('Could not load content from Supabase; using the defaults.', error);
    return localContent;
  }
});
