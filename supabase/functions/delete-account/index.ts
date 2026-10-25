import { createClient } from 'npm:@supabase/supabase-js@2';

// Deploy separately to Supabase. Never put the service-role key in VITE_* variables.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json' },
});
Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });
  const token = request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return reply(401, { error: 'Authentication required' });
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return reply(503, { error: 'Service not configured' });
  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return reply(401, { error: 'Invalid session' });
    // The target comes only from the verified session; never accept a user ID from the request.
    const { error: deletionError } = await admin.auth.admin.deleteUser(data.user.id);
    if (deletionError) return reply(500, { error: 'Deletion failed' });
    return reply(200, { deleted: true });
  } catch { return reply(500, { error: 'Deletion failed' }); }
});
