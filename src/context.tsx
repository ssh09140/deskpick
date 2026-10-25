import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { User } from '@supabase/supabase-js';
import { emptySetup, parseSetup, type DeskSetup } from './lib/desk';
import { supabase } from './lib/supabase';

const DRAFT_KEY = 'deskpick.draft.v1';
export type AuthMode = 'login' | 'signup' | 'recover' | 'reset';
type Context = {
  setup: DeskSetup; setSetup: Dispatch<SetStateAction<DeskSetup>>;
  selectedId: string | null; setSelectedId: Dispatch<SetStateAction<string | null>>;
  user: User | null; authReady: boolean; authMode: AuthMode | null;
  setAuthMode: Dispatch<SetStateAction<AuthMode | null>>;
  notify: (message: string) => void;
};
const AppContext = createContext<Context | null>(null);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is missing');
  return context;
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<DeskSetup>(() => {
    try { const raw = sessionStorage.getItem(DRAFT_KEY); return raw ? parseSetup(JSON.parse(raw)) : emptySetup(); } catch { return emptySetup(); }
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const storageWarned = useRef(false);
  function notify(message: string) { clearTimeout(timer.current); setToast(message); timer.current = setTimeout(() => setToast(''), 5000); }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(setup)); }
    catch { if (!storageWarned.current) { storageWarned.current = true; notify('브라우저의 임시 저장을 사용할 수 없어요. 새로고침 전 계정에 구성을 저장해 주세요.'); } }
  }, [setup]);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (event === 'PASSWORD_RECOVERY') setAuthMode('reset');
    });
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has('error_description')) {
      notify('이메일 링크가 만료되었거나 유효하지 않아요. 새 확인 메일을 요청해 주세요.');
      history.replaceState(null, '', window.location.pathname);
      setAuthMode('login');
    }
    return () => data.subscription.unsubscribe();
  }, []);
  return <AppContext.Provider value={{ setup, setSetup, selectedId, setSelectedId, user, authReady, authMode, setAuthMode, notify }}>
    {children}
    <div className={`toast-message ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div>
  </AppContext.Provider>;
}
