import { createClient } from 'npm:@supabase/supabase-js@2';
import { createDeleteAccountHandler } from './handler.ts';

// Admin credentials stay in the server environment, never in VITE_*.
Deno.serve(createDeleteAccountHandler(() => {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('Server configuration missing');
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}));
