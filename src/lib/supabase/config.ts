/** Supabase connection details, from the environment. Empty when not set up. */
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when the site should read its content from Supabase. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Storage bucket for pictures and videos uploaded in the admin panel. */
export const MEDIA_BUCKET = 'media';
