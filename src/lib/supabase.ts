import { createClient } from '@supabase/supabase-js';
import { parseSetup, type DeskSetup, type SavedSetup } from './desk';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = url ? `sb-${new URL(url).hostname.split('.')[0]}-auth-token` : '';
export const supabase = url && key ? createClient(url, key) : null;

export function requireClient() {
  if (!supabase) throw new Error('회원 서비스를 준비 중이에요. 잠시 후 다시 이용해 주세요.');
  return supabase;
}
async function requireUser(expectedId: string) {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.id !== expectedId) throw new Error('로그인이 만료되었어요. 다시 로그인해 주세요.');
  return { client, user: data.user };
}
function parseSaved(data: unknown): SavedSetup {
  const setup = parseSetup(data);
  const row = data as SavedSetup;
  if (typeof row.user_id !== 'string' || typeof row.updated_at !== 'string' || !Number.isFinite(Date.parse(row.updated_at))) throw new Error('저장된 구성 정보를 읽을 수 없어요.');
  return { ...setup, user_id: row.user_id, created_at: row.created_at, updated_at: row.updated_at };
}
export async function fetchSetup(userId: string): Promise<SavedSetup | null> {
  const { client } = await requireUser(userId);
  const { data, error } = await client.from('desk_setups').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? parseSaved(data) : null;
}
export async function saveSetup(userId: string, setup: DeskSetup): Promise<SavedSetup> {
  const { client } = await requireUser(userId);
  const { data, error } = await client.from('desk_setups').upsert({ user_id: userId, ...parseSetup(setup) }, { onConflict: 'user_id' }).select().single();
  if (error) throw error;
  return parseSaved(data);
}
export async function deleteSetup(userId: string) {
  const { client } = await requireUser(userId);
  const { error } = await client.from('desk_setups').delete().eq('user_id', userId);
  if (error) throw error;
}
export async function deleteOwnAccount(userId: string) {
  const { client } = await requireUser(userId);
  const { data, error } = await client.functions.invoke('delete-account', {
    method: 'POST', body: { confirmation: 'DELETE_MY_ACCOUNT' },
  });
  if (error) {
    const status = error.context instanceof Response ? error.context.status : 0;
    if (status === 401) throw new Error('로그인이 만료되었어요. 다시 로그인한 뒤 탈퇴해 주세요.');
    if (status === 404) throw new Error('현재 회원 탈퇴를 연결하지 못했어요. ssh09140@naver.com으로 문의해 주세요.');
    throw new Error('탈퇴 완료를 확인하지 못했어요. 다시 로그인해 계정 상태를 확인하거나 ssh09140@naver.com으로 문의해 주세요.');
  }
  if (data?.deleted !== true) throw new Error('탈퇴 완료를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
  // Remote deletion succeeded; a local sign-out problem must not imply deletion failed.
  try { await client.auth.signOut({ scope: 'local' }); } catch { /* Deletion is already complete. */ }
  try {
    localStorage.removeItem(authStorageKey);
    localStorage.removeItem(`${authStorageKey}-code-verifier`);
  } catch { /* Browser storage can be unavailable; clear in-memory UI state as well. */ }
}
export function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? '');
  if (/Invalid login credentials/i.test(raw)) return '이메일 또는 비밀번호를 확인해 주세요.';
  if (/Email not confirmed/i.test(raw)) return '가입 이메일의 확인 링크를 먼저 눌러 주세요.';
  if (/rate limit|too many requests|security purposes/i.test(raw)) return '요청이 많아요. 잠시 후 다시 시도해 주세요.';
  if (/fetch|network|Failed to fetch/i.test(raw)) return '서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.';
  if (/row-level security|permission denied/i.test(raw)) return '저장 권한을 확인하지 못했어요. 다시 로그인한 뒤 시도해 주세요.';
  if (/violates check constraint/i.test(raw)) return '책상 크기나 제품 배치 정보를 확인해 주세요.';
  if (/Password should|weak password/i.test(raw)) return '더 안전한 비밀번호를 입력해 주세요. 최소 8자 이상을 권장해요.';
  if (/signup.*disabled/i.test(raw)) return '현재 회원가입을 준비 중이에요.';
  if (/already registered/i.test(raw)) return '이미 가입된 이메일이에요. 로그인하거나 비밀번호를 재설정해 주세요.';
  if (/[가-힣]/.test(raw)) return raw;
  return '요청을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
