type AdminClient = {
  auth: {
    getUser(token: string): Promise<{ data: { user: { id: string } | null }; error: unknown }>;
    admin: { deleteUser(id: string): Promise<{ error: unknown }> };
  };
};
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
export function createDeleteAccountHandler(getAdmin: () => AdminClient) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { code: 'METHOD_NOT_ALLOWED' });
    const token = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return reply(401, { code: 'AUTH_REQUIRED' });
    try {
      const body = await request.json().catch(() => null);
      if (body?.confirmation !== 'DELETE_MY_ACCOUNT') return reply(400, { code: 'CONFIRMATION_REQUIRED' });
      const admin = getAdmin();
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) return reply(401, { code: 'AUTH_REQUIRED' });
      // Ignore body.user_id: only the identity verified by Auth can be deleted.
      const { error: deletionError } = await admin.auth.admin.deleteUser(data.user.id);
      if (deletionError) return reply(500, { code: 'DELETE_FAILED' });
      return reply(200, { deleted: true });
    } catch { return reply(500, { code: 'DELETE_FAILED' }); }
  };
}
