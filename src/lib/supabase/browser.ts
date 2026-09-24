import { createBrowserClient } from '@supabase/ssr';
import { supabaseKey, supabaseUrl } from './config';

/** A Supabase client for the admin panel in the browser. */
export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);
