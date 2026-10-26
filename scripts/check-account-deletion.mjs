// Explicit live integration test. Creates only disposable accounts, sends no email,
// and keeps admin credentials in process memory. Never prints keys or sessions.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
if (!process.argv.includes('--allow-temporary-users')) throw new Error('Pass --allow-temporary-users to run this live test.');
const project = 'fgqpfghyliyvjnsbnimu';
const url = `https://${project}.supabase.co`;
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
let keys;
try {
  keys = JSON.parse(execFileSync('npx', ['--offline', '--yes', '--cache', '/private/tmp/deskpick-npm-cache', 'supabase', 'projects', 'api-keys', '--project-ref', project, '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
} catch { throw new Error('Cannot read project keys with the authenticated CLI. No credentials logged.'); }
function findKey(value) {
  if (!value || typeof value !== 'object') return null;
  if ((value.name === 'service_role' || value.id === 'service_role') && typeof value.api_key === 'string') return value.api_key;
  for (const item of Object.values(value)) { const key = findKey(item); if (key) return key; }
  return null;
}
const adminKey = findKey(keys);
if (!adminKey || !publicKey) throw new Error('Required keys unavailable; no users created.');
const created = new Set();
const adminHeaders = { apikey: adminKey, Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' };
async function api(path, { method = 'GET', body, headers = adminHeaders } = {}) {
  const response = await fetch(url + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, data };
}
const assert = (condition, label) => { if (!condition) throw new Error(label); console.log('PASS:', label); };
try {
  const users = [];
  for (let i = 0; i < 2; i++) {
    const email = `deskpick-qa-${randomUUID()}@example.com`;
    const password = randomUUID() + 'Aa1!';
    const result = await api('/auth/v1/admin/users', { method: 'POST', body: { email, password, email_confirm: true, user_metadata: { disposable_deskpick_test: true } } });
    if (!result.ok || !result.data?.id) throw new Error('Temporary account creation failed.');
    const id = result.data.id;
    created.add(id);
    const session = await api('/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: publicKey, 'Content-Type': 'application/json' }, body: { email, password } });
    if (!session.ok || !session.data?.access_token) throw new Error('Temporary account login failed.');
    const headers = { apikey: publicKey, Authorization: `Bearer ${session.data.access_token}`, 'Content-Type': 'application/json' };
    users.push({ id, headers });
    assert((await api('/rest/v1/desk_setups', { method: 'POST', headers, body: { user_id: id, desk_width_mm: 1400, desk_depth_mm: 800, items: [] } })).ok, 'Temporary user can save a desk');
  }
  const [a, b] = users;
  const ownRead = await api(`/rest/v1/desk_setups?user_id=eq.${a.id}&select=user_id`, { headers: a.headers });
  assert(ownRead.ok && ownRead.data.length === 1, 'User A can read the saved desk before deletion');
  const crossRead = await api(`/rest/v1/desk_setups?user_id=eq.${b.id}&select=user_id`, { headers: a.headers });
  assert(crossRead.ok && crossRead.data.length === 0, 'User A cannot read user B desk');
  const noAuth = await api('/functions/v1/delete-account', { method: 'POST', headers: { apikey: publicKey, 'Content-Type': 'application/json' }, body: { confirmation: 'DELETE_MY_ACCOUNT' } });
  assert(noAuth.status === 401, 'Unauthenticated deletion is rejected');
  const deletion = await api('/functions/v1/delete-account', { method: 'POST', headers: a.headers, body: { confirmation: 'DELETE_MY_ACCOUNT', user_id: b.id } });
  assert(deletion.ok && deletion.data?.deleted === true, 'Deletion endpoint succeeds for the signed-in test user');
  assert((await api(`/auth/v1/admin/users/${a.id}`)).status === 404, 'User A account is deleted');
  assert((await api(`/auth/v1/admin/users/${b.id}`)).ok, 'Forged target did not delete user B');
  // Existing JWT remains cryptographically valid until expiry. RLS scopes it to A.
  const remaining = await api(`/rest/v1/desk_setups?user_id=eq.${a.id}&select=user_id`, { headers: a.headers });
  assert(remaining.ok && remaining.data.length === 0, 'Deleted account desk is removed by cascade');
  created.delete(a.id);
  const bDeletion = await api('/functions/v1/delete-account', { method: 'POST', headers: b.headers, body: { confirmation: 'DELETE_MY_ACCOUNT' } });
  assert(bDeletion.ok && bDeletion.data?.deleted === true && (await api(`/auth/v1/admin/users/${b.id}`)).status === 404, 'Second temporary account deleted');
  created.delete(b.id);
} finally {
  for (const id of created) {
    const result = await api(`/auth/v1/admin/users/${id}`, { method: 'DELETE' });
    if (!result.ok && result.status !== 404) throw new Error('Temporary account cleanup needs attention.');
  }
}
console.log('Live verification complete. No temporary accounts remain.');
