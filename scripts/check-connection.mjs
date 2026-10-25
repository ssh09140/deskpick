// Read-only smoke check. Does not create users, send email, or write data.
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url), 'utf8').trim().split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
const url = env.VITE_SUPABASE_URL;
const headers = { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY };
try {
  const auth = await fetch(`${url}/auth/v1/settings`, { headers, signal: AbortSignal.timeout(15000) });
  const settings = await auth.json();
  console.log(JSON.stringify({ authSettingsStatus: auth.status, emailEnabled: settings.external?.email, signupDisabled: settings.disable_signup }));
  const table = await fetch(`${url}/rest/v1/desk_setups?select=user_id&limit=0`, { headers, signal: AbortSignal.timeout(15000) });
  const body = await table.json();
  console.log(JSON.stringify({ anonymousTableStatus: table.status, anonymousBlocked: !table.ok, code: body.code, message: body.message }));
  if (!auth.ok || table.ok || ![401, 403].includes(table.status) || body.code !== '42501') process.exitCode = 1;
} catch (error) { console.error('Connection check failed:', error.cause?.code ?? error.message); process.exitCode = 1; }
