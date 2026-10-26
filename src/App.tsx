import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, UserRound, ArrowRight } from 'lucide-react';
import { useApp } from './context';
import { AuthDialog } from './components/AuthDialog';
import { Modal } from './components/Modal';
import { Privacy } from './pages/Privacy';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Studio } from './pages/Studio';
import { deleteOwnAccount, friendlyError, requireClient } from './lib/supabase';

function ScrollAndTitle() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = `${pathname === '/studio' ? '내 책상 꾸미기' : pathname.startsWith('/products/') ? '제품 상세' : pathname === '/products' ? '제품 탐색' : pathname === '/privacy' ? '개인정보 처리방침' : '나다운 책상의 시작'} — DeskPick`; }, [pathname]);
  return null;
}
function AuthCallback() {
  const { user, authReady, setAuthMode, authMode } = useApp();
  return <div className="callback-page"><p className="eyebrow">WELCOME BACK</p><h1>{!authReady ? '로그인 정보를 확인하고 있어요.' : user ? '다시 만나서 반가워요.' : '이메일 확인을 마치셨나요?'}</h1><p>{authMode === 'reset' ? '새 비밀번호를 설정해 주세요.' : user ? '이제 내 책상을 저장하고 이어서 꾸며볼 수 있어요.' : '로그인해서 내 책상 구성을 이어서 꾸며보세요.'}</p><div className="callback-actions">{!user && authReady && <button className="btn primary" onClick={() => setAuthMode('login')}>로그인</button>}<Link className="btn" to="/studio">내 책상으로 <ArrowRight size={17} /></Link></div></div>;
}
export default function App() {
  const { user, authReady, authMode, setAuthMode, notify, forgetDeletedAccount } = useApp();
  const [accountOpen, setAccountOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const navigate = useNavigate();
  async function logout() {
    setBusy(true);
    try { const { error } = await requireClient().auth.signOut({ scope: 'local' }); if (error) throw error; setAccountOpen(false); notify('로그아웃했어요. 현재 편집 중인 배치는 유지됩니다.'); }
    catch (err) { notify(friendlyError(err)); } finally { setBusy(false); }
  }
  async function deleteAccount() {
    if (confirmDelete !== '탈퇴' || busy) return;
    setBusy(true); setAccountError('');
    try {
      if (!user) throw new Error('다시 로그인한 뒤 탈퇴해 주세요.');
      await deleteOwnAccount(user.id);
      forgetDeletedAccount();
      setAccountOpen(false); notify('회원 탈퇴가 완료되었어요.'); navigate('/');
    } catch (err) { setAccountError(friendlyError(err)); } finally { setBusy(false); }
  }
  return <><ScrollAndTitle /><a className="skip-link" href="#main">본문으로 바로가기</a>
    <header><Link className="logo" to="/" aria-label="DeskPick 홈">deskpick<span>●</span></Link><nav aria-label="주 메뉴"><NavLink to="/" end>홈</NavLink><NavLink to="/products">제품 탐색</NavLink><NavLink to="/studio">내 책상 꾸미기 <ArrowUpRight className="nav-arrow" size={15} /></NavLink></nav><div className="account-nav">{!authReady ? <span className="account-loading">계정 확인 중…</span> : user ? <><button className="account-button" onClick={() => { setAccountOpen(true); setDeleting(false); setAccountError(''); setConfirmDelete(''); }}><span className="account-dot">●</span> 내 계정</button><button className="logout-button" disabled={busy} onClick={logout} aria-label="로그아웃"><LogOut size={15} /><span>로그아웃</span></button></> : <><button className="account-button" onClick={() => setAuthMode('login')}>로그인</button><button className="signup-button" onClick={() => setAuthMode('signup')}>회원가입 <ArrowUpRight size={14} /></button></>}</div></header>
    <main id="main"><Routes><Route path="/" element={<Home />} /><Route path="/products" element={<Home catalogOnly />} /><Route path="/products/:id" element={<ProductDetail />} /><Route path="/studio" element={<Studio />} /><Route path="/auth/callback" element={<AuthCallback />} /><Route path="/privacy" element={<Privacy />} /><Route path="*" element={<div className="empty-state"><h1>페이지를 찾을 수 없어요.</h1><Link className="btn" to="/">홈으로 돌아가기</Link></div>} /></Routes></main>
    <footer><div className="footer-inner"><div><Link className="logo" to="/">deskpick<span>●</span></Link><p>작은 변화로 시작하는, 나다운 책상.</p></div><div className="footer-links"><Link to="/products">제품 탐색</Link><Link to="/studio">내 책상 꾸미기</Link><Link to="/privacy">개인정보 처리방침</Link></div></div><div className="footer-bottom"><span>가격·치수는 공식 판매처 확인 기준이며 변동될 수 있습니다. 도형은 배치 참고용입니다.</span><span>© 2026 DeskPick</span></div></footer>
    {authMode && <AuthDialog />}
    {accountOpen && user && <Modal title="내 계정" onClose={() => { if (!busy) setAccountOpen(false); }}><div className="auth-mark"><UserRound size={24} /></div><h2>{deleting ? '회원 탈퇴를 진행할까요?' : '반가워요.'}</h2><p className="account-email">{user.email}</p>{deleting ? <><p className="auth-copy">계정과 저장한 책상 구성이 삭제되며 되돌릴 수 없어요. 계속하려면 아래에 ‘탈퇴’를 입력해 주세요.</p><label className="field">확인 문구<input value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder="탈퇴" /></label><p className="form-error" role="alert">{accountError}</p><div className="dialog-actions"><button className="btn" disabled={busy} onClick={() => setDeleting(false)}>돌아가기</button><button className="btn danger" disabled={busy || confirmDelete !== '탈퇴'} onClick={deleteAccount}>{busy ? '처리 중…' : '계정 영구 삭제'}</button></div></> : <><p className="auth-copy">좋아하는 책상 구성을 저장하고<br />다음에도 이어서 꾸며보세요.</p><button className="btn primary full" onClick={() => { setAccountOpen(false); navigate('/studio'); }}>내 책상 꾸미기 <ArrowRight size={16} /></button><button className="btn full" disabled={busy} onClick={logout} style={{ marginTop: 10 }}>로그아웃</button><button className="text-btn delete-link full" onClick={() => setDeleting(true)}>회원 탈퇴</button></>}</Modal>}
  </>;
}
