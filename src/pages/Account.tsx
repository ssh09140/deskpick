import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, KeyRound, LogOut, UserRound } from 'lucide-react';
import { useApp } from '../context';
import { fetchSetup, friendlyError, requireClient } from '../lib/supabase';
import { money, totalPrice, type SavedSetup } from '../lib/desk';
import { DeskPreview } from '../components/DeskCanvas';
import { ErrorNotice } from '../components/ErrorNotice';
import { Modal } from '../components/Modal';

export function Account({ onDelete }: { onDelete: () => void }) {
  const { user, authReady, setSetup, setSelectedId, notify } = useApp();
  const [result, setResult] = useState<{ owner: string; data: SavedSetup | null } | null>(null);
  const [error, setError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [retry, setRetry] = useState(0);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [busy, setBusy] = useState(false);
  const owner = useRef(user?.id); owner.current = user?.id;
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    setError(''); setLogoutError(''); setResult(null); setConfirmLoad(false);
    if (user) fetchSetup(user.id).then(data => { if (active) setResult({ owner: user.id, data }); }).catch(err => { if (active) setError(friendlyError(err)); });
    return () => { active = false; };
  }, [user?.id, retry]);
  const saved = result?.owner === user?.id ? result?.data : null;
  async function logout() {
    setBusy(true); setLogoutError('');
    try { const { error } = await requireClient().auth.signOut({ scope: 'local' }); if (error) throw error; notify('로그아웃했어요.'); navigate('/'); }
    catch (err) { setLogoutError(friendlyError(err)); } finally { setBusy(false); }
  }
  function load() {
    if (!saved || owner.current !== saved.user_id) return;
    setSetup({ desk_width_mm: saved.desk_width_mm, desk_depth_mm: saved.desk_depth_mm, items: saved.items });
    setSelectedId(saved.items[0]?.instance_id ?? null); navigate('/studio'); notify('저장한 책상을 불러왔어요.');
  }
  if (!authReady) return <div className="empty-state" role="status">계정을 확인하고 있어요…</div>;
  if (!user) return <div className="empty-state"><UserRound size={42} /><h1>나만의 책상을 만나보세요</h1><p>로그인하면 저장한 책상을 확인할 수 있어요.</p><Link className="btn primary" to="/login">로그인</Link></div>;
  return <div className="wrap account-page"><div className="page-intro"><p className="eyebrow">YOUR OWN LITTLE SPACE</p><h1>마이페이지</h1><p>좋아하는 책상, 다음에도 그대로.</p></div><section className="profile-card"><span className="profile-avatar"><UserRound size={30} /></span><div><h2>반가워요!</h2><p>{user.email}</p></div></section>
    <section className="account-section"><h2>저장한 책상</h2>{error ? <ErrorNotice title="저장한 책상을 불러오지 못했어요" message={error} onRetry={() => setRetry(n => n + 1)} /> : !result ? <p className="loading-copy" role="status">저장한 책상을 불러오고 있어요…</p> : saved ? <div className="account-saved"><div className="saved-preview"><DeskPreview setup={saved} /></div><div><h3>나의 책상</h3><p>{saved.desk_width_mm} × {saved.desk_depth_mm} mm · 제품 {saved.items.length}개</p><strong>{money(totalPrice(saved.items))}</strong><p>{new Date(saved.updated_at).toLocaleDateString('ko-KR')} 저장</p><button className="btn primary" onClick={() => setConfirmLoad(true)}>이어서 꾸미기 <ArrowRight size={17} /></button></div></div> : <div className="empty-state"><Bookmark size={36} /><h3>아직 저장한 책상이 없어요</h3><p>좋아하는 제품을 배치하고 나만의 책상을 저장해 보세요.</p><Link className="btn primary" to="/studio">지금 책상 꾸미기 <ArrowRight size={17} /></Link></div>}</section>
    <section className="account-section"><h2>계정 관리</h2>{logoutError && <ErrorNotice title="로그아웃하지 못했어요" message={logoutError} onRetry={logout} busy={busy} />}<div className="account-menu"><Link to="/forgot-password"><KeyRound size={20} /> 비밀번호 재설정 <ArrowRight size={17} /></Link><button disabled={busy} onClick={logout}><LogOut size={20} /> 로그아웃 <ArrowRight size={17} /></button></div><button className="text-btn delete-link" onClick={onDelete}>회원 탈퇴</button></section>
    {confirmLoad && saved && <Modal title="저장한 책상 불러오기" onClose={() => setConfirmLoad(false)}><h2>저장한 책상으로 바꿀까요?</h2><p className="auth-copy">현재 편집 중인 배치가 바뀝니다. 저장하지 않은 변경사항은 사라져요.</p><div className="dialog-actions"><button className="btn" onClick={() => setConfirmLoad(false)}>취소</button><button className="btn primary" onClick={load}>불러오기</button></div></Modal>}
  </div>;
}
