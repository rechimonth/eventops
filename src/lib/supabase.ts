import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anon) console.warn('[supabase] faltan EXPO_PUBLIC_SUPABASE_URL/ANON_KEY (ver .env.example)');

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});
