import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, UserRound, ArrowRight } from 'lucide-react';
import { useApp } from './context';
import { AuthDialog } from './components/AuthDialog';
import { Modal } from './components/Modal';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Studio } from './pages/Studio';
import { friendlyError, requireClient } from './lib/supabase';

function ScrollAndTitle() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = `${pathname === '/studio' ? '내 책상 꾸미기' : pathname.startsWith('/products/') ? '제품 상세' : pathname === '/products' ? '제품 탐색' : pathname === '/privacy' ? '개인정보 처리 안내' : '나다운 책상의 시작'} — DeskPick`; }, [pathname]);
  return null;
}
function AuthCallback() {
  const { user, authReady, setAuthMode, authMode } = useApp();
  return <div className="callback-page"><p className="eyebrow">WELCOME BACK</p><h1>{!authReady ? '로그인 정보를 확인하고 있어요.' : user ? '다시 만나서 반가워요.' : '이메일 확인을 마치셨나요?'}</h1><p>{authMode === 'reset' ? '새 비밀번호를 설정해 주세요.' : user ? '이제 내 책상을 저장하고 이어서 꾸며볼 수 있어요.' : '로그인해서 내 책상 구성을 이어서 꾸며보세요.'}</p><div className="callback-actions">{!user && authReady && <button className="btn primary" onClick={() => setAuthMode('login')}>로그인</button>}<Link className="btn" to="/studio">내 책상으로 <ArrowRight size={17} /></Link></div></div>;
}
function Privacy() {
  return <article className="legal-page"><p className="eyebrow">YOUR DATA, YOUR DESK</p><h1>개인정보 처리 안내</h1><p className="legal-notice">DeskPick은 현재 개발·검증 단계입니다. 정식 공개 전 운영자와 문의처, 서비스 제공 지역에 맞춘 정책을 확정할 예정입니다.</p><h2>어떤 정보를 사용하나요?</h2><p>회원가입 시 이메일과 인증 정보를 Supabase Auth에서 처리합니다. 책상 저장에는 회원 식별자, 책상 치수, 제품 ID와 배치 좌표, 생성일·수정일을 사용합니다. 앱에서 비밀번호를 별도 테이블에 저장하지 않습니다.</p><h2>왜 저장하나요?</h2><p>회원 로그인, 이메일 확인·계정 복구, 다른 방문이나 기기에서 책상 구성을 불러오는 기능을 위해 사용합니다. 비회원도 탐색과 배치를 이용할 수 있습니다.</p><h2>브라우저에는 무엇이 남나요?</h2><p>로그인 상태 유지를 위한 인증 정보는 브라우저 저장소에 보관됩니다. 편집 중인 구성은 현재 탭의 임시 저장소에 보관되며, 로그아웃해도 화면의 배치는 유지됩니다. 공용 기기에서는 로그아웃 후 배치를 비우고 탭을 닫아 주세요. 별도의 광고·분석 도구는 연결하지 않았습니다.</p><h2>어떻게 지우나요?</h2><p>‘내 책상 꾸미기 → 저장한 구성’에서 계정에 저장한 구성을 삭제할 수 있습니다. 회원 탈퇴는 계정 메뉴에서 요청하며, 서버의 탈퇴 기능이 배포되어 있어야 처리됩니다. 탈퇴에 성공하면 회원 정보와 계정에 저장한 구성이 삭제됩니다.</p><h2>외부 서비스</h2><p>인증과 데이터 저장은 Supabase를 사용합니다. 글꼴을 위해 Google Fonts에 접속할 수 있습니다. 판매처 링크가 제공되는 경우 해당 사이트의 정책이 적용됩니다.</p><Link className="text-btn" to="/">홈으로 돌아가기 →</Link></article>;
}
export default function App() {
  const { user, authReady, authMode, setAuthMode, notify, setSetup, setSelectedId } = useApp();
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
      const client = requireClient();
      const { data, error } = await client.functions.invoke('delete-account', { method: 'POST' });
      if (error || !data?.deleted) throw new Error('회원 탈퇴를 완료하지 못했어요. 서버의 탈퇴 기능이 준비되었는지 확인이 필요합니다. 계정은 삭제 완료 상태가 아닙니다.');
      await client.auth.signOut({ scope: 'local' });
      setSetup({ desk_width_mm: 1400, desk_depth_mm: 800, items: [] }); setSelectedId(null);
      setAccountOpen(false); notify('회원 탈퇴가 완료되었어요.'); navigate('/');
    } catch (err) { setAccountError(friendlyError(err)); } finally { setBusy(false); }
  }
  return <><ScrollAndTitle /><a className="skip-link" href="#main">본문으로 바로가기</a>
    <header><Link className="logo" to="/" aria-label="DeskPick 홈">deskpick<span>●</span></Link><nav aria-label="주 메뉴"><NavLink to="/" end>홈</NavLink><NavLink to="/products">제품 탐색</NavLink><NavLink to="/studio">내 책상 꾸미기 <ArrowUpRight className="nav-arrow" size={15} /></NavLink></nav><div className="account-nav">{!authReady ? <span className="account-loading">계정 확인 중…</span> : user ? <><button className="account-button" onClick={() => { setAccountOpen(true); setDeleting(false); setAccountError(''); setConfirmDelete(''); }}><span className="account-dot">●</span> 내 계정</button><button className="logout-button" disabled={busy} onClick={logout} aria-label="로그아웃"><LogOut size={15} /><span>로그아웃</span></button></> : <><button className="account-button" onClick={() => setAuthMode('login')}>로그인</button><button className="signup-button" onClick={() => setAuthMode('signup')}>회원가입 <ArrowUpRight size={14} /></button></>}</div></header>
    <main id="main"><Routes><Route path="/" element={<Home />} /><Route path="/products" element={<Home catalogOnly />} /><Route path="/products/:id" element={<ProductDetail />} /><Route path="/studio" element={<Studio />} /><Route path="/auth/callback" element={<AuthCallback />} /><Route path="/privacy" element={<Privacy />} /><Route path="*" element={<div className="empty-state"><h1>페이지를 찾을 수 없어요.</h1><Link className="btn" to="/">홈으로 돌아가기</Link></div>} /></Routes></main>
    <footer><div className="footer-inner"><div><Link className="logo" to="/">deskpick<span>●</span></Link><p>작은 변화로 시작하는, 나다운 책상.</p></div><div className="footer-links"><Link to="/products">제품 탐색</Link><Link to="/studio">내 책상 꾸미기</Link><Link to="/privacy">개인정보 처리 안내</Link></div></div><div className="footer-bottom"><span>현재 상품·가격·치수는 목업의 예시 데이터입니다. 실제 구매 링크는 준비 중입니다.</span><span>© 2026 DeskPick</span></div></footer>
    {authMode && <AuthDialog />}
    {accountOpen && user && <Modal title="내 계정" onClose={() => { if (!busy) setAccountOpen(false); }}><div className="auth-mark"><UserRound size={24} /></div><h2>{deleting ? '회원 탈퇴를 진행할까요?' : '반가워요.'}</h2><p className="account-email">{user.email}</p>{deleting ? <><p className="auth-copy">계정과 저장한 책상 구성이 삭제되며 되돌릴 수 없어요. 계속하려면 아래에 ‘탈퇴’를 입력해 주세요.</p><label className="field">확인 문구<input value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder="탈퇴" /></label><p className="form-error" role="alert">{accountError}</p><div className="dialog-actions"><button className="btn" disabled={busy} onClick={() => setDeleting(false)}>돌아가기</button><button className="btn danger" disabled={busy || confirmDelete !== '탈퇴'} onClick={deleteAccount}>{busy ? '처리 중…' : '계정 영구 삭제'}</button></div></> : <><p className="auth-copy">좋아하는 책상 구성을 저장하고<br />다음에도 이어서 꾸며보세요.</p><button className="btn primary full" onClick={() => { setAccountOpen(false); navigate('/studio'); }}>내 책상 꾸미기 <ArrowRight size={16} /></button><button className="btn full" disabled={busy} onClick={logout} style={{ marginTop: 10 }}>로그아웃</button><button className="text-btn delete-link full" onClick={() => setDeleting(true)}>회원 탈퇴</button></>}</Modal>}
  </>;
}
