import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), single: vi.fn(), upsert: vi.fn(), delete: vi.fn() };
  return { query, client: { auth: { getUser: vi.fn(), signOut: vi.fn() }, functions: { invoke: vi.fn() }, from: vi.fn() } };
});
vi.mock('@supabase/supabase-js', () => ({ createClient: () => mock.client }));
import { deleteOwnAccount, deleteSetup, fetchSetup, saveSetup } from './supabase';
import { emptySetup } from './desk';

const saved = { ...emptySetup(), user_id: 'user-a', created_at: '2026-10-25T00:00:00Z', updated_at: '2026-10-25T01:00:00Z' };
beforeEach(() => {
  vi.clearAllMocks();
  mock.client.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
  mock.client.from.mockReturnValue(mock.query);
  mock.query.select.mockReturnValue(mock.query);
  mock.query.eq.mockReturnValue(mock.query);
  mock.query.upsert.mockReturnValue(mock.query);
  mock.query.delete.mockReturnValue(mock.query);
  mock.query.single.mockResolvedValue({ data: saved, error: null });
  mock.query.maybeSingle.mockResolvedValue({ data: saved, error: null });
});
describe('account-scoped persistence (mocked SDK, not live RLS)', () => {
  it('refuses writes if the signed-in user changed', async () => {
    await expect(saveSetup('user-b', emptySetup())).rejects.toThrow('다시 로그인');
    expect(mock.client.from).not.toHaveBeenCalled();
  });
  it('upserts the precise schema without client-supplied timestamps', async () => {
    expect(await saveSetup('user-a', emptySetup())).toEqual(saved);
    expect(mock.query.upsert).toHaveBeenCalledWith({ user_id: 'user-a', ...emptySetup() }, { onConflict: 'user_id' });
    expect(mock.query.single).toHaveBeenCalled();
  });
  it('scopes reads to the current user and supports the no-saved-layout case', async () => {
    mock.query.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await fetchSetup('user-a')).toBeNull();
    expect(mock.query.eq).toHaveBeenCalledWith('user_id', 'user-a');
  });
  it('does not report a successful save after a server rejection', async () => {
    const denied = { message: 'row-level security rejected' };
    mock.query.single.mockResolvedValue({ data: null, error: denied });
    await expect(saveSetup('user-a', emptySetup())).rejects.toEqual(denied);
  });
  it('refuses malformed server data instead of overwriting the working layout', async () => {
    mock.query.maybeSingle.mockResolvedValue({ data: { ...saved, items: [false] }, error: null });
    await expect(fetchSetup('user-a')).rejects.toThrow();
  });
  it('scopes deletions and propagates server failures', async () => {
    const denied = { message: 'permission denied' };
    mock.query.eq.mockResolvedValue({ error: denied });
    await expect(deleteSetup('user-a')).rejects.toEqual(denied);
    expect(mock.query.eq).toHaveBeenCalledWith('user_id', 'user-a');
  });
});

describe('account deletion (mocked SDK)', () => {
  it('does not invoke deletion after an account change', async () => {
    await expect(deleteOwnAccount('other')).rejects.toThrow('다시 로그인');
    expect(mock.client.functions.invoke).not.toHaveBeenCalled();
  });
  it('sends confirmation without choosing a deletion target', async () => {
    mock.client.functions.invoke.mockResolvedValue({ data: { deleted: true }, error: null });
    mock.client.auth.signOut.mockResolvedValue({ error: null });
    await deleteOwnAccount('user-a');
    expect(mock.client.functions.invoke).toHaveBeenCalledWith('delete-account', { method: 'POST', body: { confirmation: 'DELETE_MY_ACCOUNT' } });
    expect(mock.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
  it('preserves login on rejection and distinguishes an expired session', async () => {
    mock.client.functions.invoke.mockResolvedValue({ data: null, error: { context: new Response(null, { status: 401 }) } });
    await expect(deleteOwnAccount('user-a')).rejects.toThrow('만료');
    expect(mock.client.auth.signOut).not.toHaveBeenCalled();
  });
  it('does not mistake an unsuccessful response for deletion', async () => {
    mock.client.functions.invoke.mockResolvedValue({ data: { deleted: false }, error: null });
    await expect(deleteOwnAccount('user-a')).rejects.toThrow('확인하지 못했어요');
    expect(mock.client.auth.signOut).not.toHaveBeenCalled();
  });
});
