import { beforeEach, expect, it, vi } from 'vitest';
import { createDeleteAccountHandler } from './handler';
const admin = { auth: { getUser: vi.fn(), admin: { deleteUser: vi.fn() } } };
const handler = createDeleteAccountHandler(() => admin);
const request = (body: Record<string, unknown> = { confirmation: 'DELETE_MY_ACCOUNT' }, token = 'valid-token') => new Request('https://example.test/delete-account', {
  method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body),
});
beforeEach(() => {
  vi.resetAllMocks();
  admin.auth.getUser.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
  admin.auth.admin.deleteUser.mockResolvedValue({ error: null });
});
it('never deletes for missing or invalid authentication', async () => {
  expect((await handler(request(undefined, ''))).status).toBe(401);
  admin.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid') });
  expect((await handler(request())).status).toBe(401);
  expect(admin.auth.admin.deleteUser).not.toHaveBeenCalled();
});
it('requires confirmation and rejects other methods', async () => {
  expect((await handler(request({}))).status).toBe(400);
  expect((await handler(new Request('https://example.test'))).status).toBe(405);
  expect(admin.auth.admin.deleteUser).not.toHaveBeenCalled();
});
it('ignores a forged target and deletes only the verified owner', async () => {
  const result = await handler(request({ confirmation: 'DELETE_MY_ACCOUNT', user_id: 'victim' }));
  expect(admin.auth.getUser).toHaveBeenCalledWith('valid-token');
  expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('owner');
  expect(await result.json()).toEqual({ deleted: true });
});
it('never reports success or leaks private errors after a server failure', async () => {
  admin.auth.admin.deleteUser.mockResolvedValue({ error: new Error('private detail') });
  const result = await handler(request());
  expect(result.status).toBe(500);
  expect(await result.json()).toEqual({ code: 'DELETE_FAILED' });
});
it('handles preflight without account operations', async () => {
  expect((await handler(new Request('https://example.test', { method: 'OPTIONS' }))).status).toBe(204);
  expect(admin.auth.getUser).not.toHaveBeenCalled();
});
