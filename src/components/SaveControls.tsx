import { useRef, useState } from 'react';
import { Download, FolderOpen, ArrowRight, Trash2, Check } from 'lucide-react';
import { useApp } from '../context';
import { deleteSetup, fetchSetup, friendlyError, saveSetup } from '../lib/supabase';
import { money, sameSetup, totalPrice, type DeskSetup, type SavedSetup } from '../lib/desk';
import { Modal } from './Modal';
import { DeskPreview } from './DeskCanvas';

type Dialog = { type: 'saved'; data: SavedSetup | null } | { type: 'overwrite'; data: SavedSetup; draft: DeskSetup } | { type: 'load'; data: SavedSetup } | { type: 'delete'; data: SavedSetup };
export function SaveControls() {
  const { user, authReady, setAuthMode, setup, setSetup, setSelectedId, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<SavedSetup | null>(null);
  const owner = useRef(user?.id);
  owner.current = user?.id;
  const savedForUser = lastSaved?.user_id === user?.id ? lastSaved : null;
  const isSynced = savedForUser && sameSetup(setup, savedForUser);
  const dialogOwner = useRef<string | undefined>(undefined);
  const activeDialog = dialogOwner.current === user?.id ? dialog : null;
  function close() { if (!busy) { setDialog(null); setError(''); } }
  async function request(action: 'save' | 'load') {
    if (!authReady || busy) return;
    if (!user) { setAuthMode('login'); notify('로그인 후 저장하거나 불러올 수 있어요. 현재 배치는 유지돼요.'); return; }
    const userId = user.id;
    const draft = structuredClone(setup);
    setBusy(true); setError('');
    try {
      const saved = await fetchSetup(userId);
      if (owner.current !== userId) return;
      dialogOwner.current = userId;
      setLastSaved(saved);
      if (action === 'load') setDialog({ type: 'saved', data: saved });
      else if (saved) setDialog({ type: 'overwrite', data: saved, draft });
      else {
        const result = await saveSetup(userId, draft);
        if (owner.current !== userId) return;
        setLastSaved(result); notify('내 데스크를 계정에 저장했어요.');
      }
    } catch (err) { if (owner.current === userId) setError(friendlyError(err)); }
    finally { setBusy(false); }
  }
  async function commit(action: 'save' | 'delete') {
    if (!user || !activeDialog || busy) return;
    const userId = user.id;
    setBusy(true); setError('');
    try {
      if (action === 'save' && activeDialog.type === 'overwrite') {
        const result = await saveSetup(userId, activeDialog.draft);
        if (owner.current !== userId) return;
        setLastSaved(result); notify('변경한 구성을 저장했어요.');
      } else if (action === 'delete') {
        await deleteSetup(userId);
        if (owner.current !== userId) return;
        setLastSaved(null); notify('저장한 구성을 삭제했어요. 현재 배치는 유지됩니다.');
      }
      setDialog(null);
    } catch (err) { if (owner.current === userId) setError(friendlyError(err)); } finally { setBusy(false); }
  }
  function load(data: SavedSetup) { setSetup({ desk_width_mm: data.desk_width_mm, desk_depth_mm: data.desk_depth_mm, items: data.items }); setSelectedId(data.items[0]?.instance_id ?? null); setLastSaved(data); setDialog(null); notify('저장한 책상을 불러왔어요.'); }
  const date = (data: SavedSetup) => new Date(data.updated_at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return <>
    <section className="desk-save-bar"><div className="desk-save-copy"><span className="eyebrow">나의 책상, 다음에도 그대로</span><h2>내 데스크 구성 {isSynced && <Check size={17} />}</h2><p>{isSynced ? `${date(savedForUser!)}에 저장한 구성과 같아요.` : '좋아하는 배치를 저장하고, 다음에도 이어서 꾸며보세요.'}</p></div><div className="save-actions"><button className="btn" disabled={busy || !authReady} onClick={() => request('load')}><FolderOpen size={16} /> 저장한 구성</button><button className="btn primary" disabled={busy || !authReady} onClick={() => request('save')}>{busy ? '처리 중…' : '내 데스크 저장'} <Download size={16} /></button></div></section>
    {error && !activeDialog && <p className="inline-error" role="alert">{error}<button className="text-btn" onClick={() => setError('')}>닫기</button></p>}
    {activeDialog && <Modal title="내 데스크 저장 관리" onClose={close}>
      <p className="eyebrow">MY DESK</p>
      {activeDialog.type === 'saved' && (activeDialog.data ? <>
        <h2>저장한 나의 책상</h2><p className="auth-copy">{date(activeDialog.data)} 저장 · 계정당 구성 1개</p>
        <div className="saved-preview"><DeskPreview setup={activeDialog.data} /></div>
        <div className="saved-meta"><strong>{activeDialog.data.desk_width_mm} × {activeDialog.data.desk_depth_mm} mm</strong><span>{activeDialog.data.items.length}개 · {money(totalPrice(activeDialog.data.items))}</span></div>
        <button className="btn primary full saved-load" onClick={() => setDialog({ type: 'load', data: activeDialog.data! })}>이 구성 불러오기 <ArrowRight size={16} /></button>
        <button className="text-btn delete-link full" onClick={() => setDialog({ type: 'delete', data: activeDialog.data! })}>저장 구성 삭제</button>
      </> : <><h2>아직 저장한 책상이 없어요.</h2><p className="auth-copy">마음에 드는 제품을 배치하고<br />‘내 데스크 저장’을 눌러 주세요.</p><button className="btn primary full" onClick={close}>내 책상으로 돌아가기</button></>)}
      {activeDialog.type === 'overwrite' && <><h2>지금 구성으로 덮어쓸까요?</h2><p className="auth-copy">{date(activeDialog.data)}에 저장한 구성 대신 지금의 책상을 저장합니다.</p><div className="save-comparison"><div>저장한 구성<strong>{activeDialog.data.items.length}개 · {money(totalPrice(activeDialog.data.items))}</strong></div><ArrowRight size={18} /><div>현재 구성<strong>{activeDialog.draft.items.length}개 · {money(totalPrice(activeDialog.draft.items))}</strong></div></div><div className="dialog-actions"><button className="btn" disabled={busy} onClick={close}>취소</button><button className="btn primary" disabled={busy} onClick={() => commit('save')}>{busy ? '저장 중…' : '현재 구성으로 저장'}</button></div></>}
      {activeDialog.type === 'load' && <><h2>저장한 구성으로 바꿀까요?</h2><p className="auth-copy">현재 책상 크기와 제품 위치가 바뀝니다. 저장하지 않은 변경사항은 사라져요.</p><div className="dialog-actions"><button className="btn" onClick={close}>취소</button><button className="btn primary" onClick={() => load(activeDialog.data)}>불러오기</button></div></>}
      {activeDialog.type === 'delete' && <><h2>저장한 구성을 삭제할까요?</h2><p className="auth-copy">계정에 저장된 구성을 삭제합니다. 지금 편집 중인 배치는 유지되며, 삭제한 저장 구성은 되돌릴 수 없어요.</p><div className="dialog-actions"><button className="btn" disabled={busy} onClick={close}>취소</button><button className="btn danger" disabled={busy} onClick={() => commit('delete')}><Trash2 size={15} />{busy ? '삭제 중…' : '저장 구성 삭제'}</button></div></>}
      <p className="form-error" role="alert">{error}</p>
    </Modal>}
  </>;
}
