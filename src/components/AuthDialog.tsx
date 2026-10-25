import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp, type AuthMode } from '../context';
import { friendlyError, requireClient } from '../lib/supabase';
import { Modal } from './Modal';

export function AuthDialog() {
  const { authMode: mode, setAuthMode, notify } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  if (!mode) return null;
  const close = () => { if (!busy) setAuthMode(null); };
  const switchMode = (next: AuthMode) => { setAuthMode(next); setError(''); setPassword(''); setConfirm(''); setSent(false); };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if ((mode === 'signup' || mode === 'reset') && password !== confirm) { setError('비밀번호가 일치하지 않아요.'); return; }
    setBusy(true);
    try {
      const client = requireClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setAuthMode(null);
        notify('로그인했어요. 현재 배치를 계정에 저장할 수 있어요.');
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (data.session) { setAuthMode(null); notify('회원가입이 완료되었어요.'); }
        else setSent(true);
      } else if (mode === 'recover') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setAuthMode(null);
        notify('비밀번호를 변경했어요.');
      }
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (!email.trim() || !email.includes('@')) { setError('이메일을 입력한 뒤 확인 메일을 요청해 주세요.'); return; }
    setBusy(true); setError('');
    try {
      const { error } = await requireClient().auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      notify('확인이 필요한 계정이면 가입 확인 메일을 보내드려요.');
    } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  }
  const title = mode === 'signup' ? '나만의 책상을\n오래 간직하세요.' : mode === 'recover' ? '비밀번호를 잊으셨나요?' : mode === 'reset' ? '새 비밀번호를 설정하세요.' : '다시 만나서 반가워요.';
  return <Modal title={sent ? '이메일 확인 안내' : title} onClose={close}>
    <div className="logo auth-logo">deskpick<span>●</span></div>
    {sent ? <>
      <div className="auth-mark"><Mail size={26} /></div>
      <h2>이메일을 확인해 주세요.</h2>
      <p className="auth-copy"><strong>{email}</strong><br />{mode === 'recover' ? '가입된 이메일이면 비밀번호 재설정 링크를 보내드려요.' : '가입 확인이 필요한 경우 확인 링크를 보내드려요. 이미 가입한 이메일이라면 로그인해 주세요.'}<br />받은 편지함과 스팸함을 확인해 주세요.</p>
      <button className="btn primary full" onClick={() => switchMode('login')}>로그인으로 돌아가기 <ArrowRight size={16} /></button>
      <p className="auth-copy" style={{ marginTop: 18 }}>현재 꾸민 책상은 이 탭에 유지돼요.</p>
    </> : <>
      <p className="eyebrow">좋아하는 책상을, 그대로</p>
      <h2 style={{ whiteSpace: 'pre-line' }}>{title}</h2>
      <p className="auth-copy">{mode === 'recover' ? '가입한 이메일로 재설정 링크를 보내드려요.' : mode === 'reset' ? '다음 로그인부터 사용할 비밀번호를 입력해 주세요.' : '제품 탐색과 배치는 자유롭게. 나의 구성은 계정에 안전하게.'}</p>
      {(mode === 'login' || mode === 'signup') && <div className="auth-tabs"><button disabled={busy} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>로그인</button><button disabled={busy} className={mode === 'signup' ? 'on' : ''} onClick={() => switchMode('signup')}>회원가입</button></div>}
      <form onSubmit={submit}>
        {mode !== 'reset' && <label className="field">이메일<input type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label>}
        {mode !== 'recover' && <label className="field">{mode === 'reset' ? '새 비밀번호' : '비밀번호'}<span className="password-input"><input type={visible ? 'text' : 'password'} required minLength={mode === 'login' ? 1 : 8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? '비밀번호를 입력해 주세요' : '8자 이상 입력해 주세요'} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>}
        {(mode === 'signup' || mode === 'reset') && <label className="field">비밀번호 확인<input type="password" required minLength={8} autoComplete="new-password" placeholder="한 번 더 입력해 주세요" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={busy} /></label>}
        {mode === 'signup' && <label className="consent"><input type="checkbox" required /> <span><Link to="/privacy" target="_blank">개인정보 처리 안내</Link>를 읽고 계정 생성에 동의합니다.</span></label>}
        <p className="form-error" role="alert">{error}</p>
        <button className="btn primary full" disabled={busy} type="submit">{busy ? '처리 중…' : mode === 'signup' ? '이메일로 회원가입' : mode === 'recover' ? '재설정 링크 받기' : mode === 'reset' ? '비밀번호 변경' : '로그인'}{!busy && <ArrowRight size={16} />}</button>
      </form>
      {mode === 'login' && <div className="auth-secondary"><button className="text-btn" disabled={busy} onClick={() => switchMode('recover')}>비밀번호 찾기</button><button className="text-btn" disabled={busy} onClick={resend}>가입 확인 메일 다시 받기</button></div>}
      {mode === 'recover' && <button className="text-btn full" disabled={busy} onClick={() => switchMode('login')}>로그인으로 돌아가기</button>}
      <div className="auth-benefit"><Check size={15} /> 로그인 전후에도 현재 배치는 그대로 유지돼요.</div>
      <button className="text-btn full" disabled={busy} onClick={close}>계속 둘러보기</button>
    </>}
  </Modal>;
}
