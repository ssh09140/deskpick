import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Plus, Trash2, Move, Check, Info, RotateCcw, RotateCw, Undo2, Redo2 } from 'lucide-react';
import { useApp } from '../context';
import { footprint, rotateItem, isOutside, money, newItem, productById, products, totalPrice, type DeskItem } from '../lib/desk';
import { ProductArt } from '../components/ProductArt';
import { Modal } from '../components/Modal';
import { DeskCanvas } from '../components/DeskCanvas';
import { SaveControls } from '../components/SaveControls';

function PositionEditor({ item }: { item: DeskItem }) {
  const { setSetup } = useApp();
  const [x, setX] = useState(String(item.x_mm));
  const [y, setY] = useState(String(item.y_mm));
  useEffect(() => { setX(String(item.x_mm)); setY(String(item.y_mm)); }, [item.x_mm, item.y_mm]);
  function submit(e: FormEvent) { e.preventDefault(); if (!x.trim() || !y.trim() || !Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) return; setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === item.instance_id ? { ...i, x_mm: Number(x), y_mm: Number(y) } : i) })); }
  return <form className="position-form" onSubmit={submit}><label>X 위치 (mm)<input type="number" step="any" required value={x} onChange={e => setX(e.target.value)} /></label><label>Y 위치 (mm)<input type="number" step="any" required value={y} onChange={e => setY(e.target.value)} /></label><button className="btn" type="submit">위치 적용</button></form>;
}
export function Studio() {
  const { setup, setSetup, selectedId, setSelectedId, notify, undo, redo, canUndo, canRedo } = useApp();
  const [width, setWidth] = useState(String(setup.desk_width_mm));
  const [depth, setDepth] = useState(String(setup.desk_depth_mm));
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  useEffect(() => { setWidth(String(setup.desk_width_mm)); setDepth(String(setup.desk_depth_mm)); }, [setup.desk_width_mm, setup.desk_depth_mm]);
  const selected = setup.items.find(i => i.instance_id === selectedId);
  const selectedProduct = selected ? productById.get(selected.product_id) : null;
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!(e.metaKey || e.ctrlKey) || e.altKey || target.closest('input, textarea, select, [contenteditable], [role="dialog"]') || document.querySelector('[role="dialog"]')) return;
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [undo, redo]);
  const warnings = setup.items.filter(i => isOutside(i, setup));
  function resize(e: FormEvent) { e.preventDefault(); const w = Number(width), d = Number(depth); if (!Number.isInteger(w) || !Number.isInteger(d) || w < 100 || w > 10000 || d < 100 || d > 10000) return; setSetup(s => ({ ...s, desk_width_mm: w, desk_depth_mm: d })); notify('책상 크기를 변경했어요. 제품의 실제 크기와 위치는 유지됩니다.'); }
  function add(id: string) { const item = newItem(productById.get(id)!, setup); setSetup(s => ({ ...s, items: [...s.items, item] })); setSelectedId(item.instance_id); setAddOpen(false); notify('제품을 추가했어요.'); }
  function remove(id: string) { setSetup(s => ({ ...s, items: s.items.filter(i => i.instance_id !== id) })); if (selectedId === id) setSelectedId(null); }
  function example() { const ids = ['ikea-80474783', 'ikea-30457663', 'ikea-80494880']; const coords = [[465, 40], [375, 330], [1120, 100]]; const items = ids.map((id, index) => ({ instance_id: crypto.randomUUID(), product_id: id, x_mm: coords[index][0], y_mm: coords[index][1] })); setSetup({ desk_width_mm: 1400, desk_depth_mm: 800, items }); setSelectedId(items[0].instance_id); }
  return <div className="studio-wrap"><div className="breadcrumbs"><Link to="/products"><ArrowLeft size={14} /> 제품 탐색으로 돌아가기</Link></div>
    <div className="studio-heading"><p className="eyebrow">MAKE ROOM FOR WHAT YOU LOVE</p><h1>내 책상 꾸미기</h1><p>마음에 드는 제품을 놓아보세요. 구매 전에, 내 공간에 어울리는지 가볍게 확인해요.</p><span className="guest-label">로그인 없이도 자유롭게 배치할 수 있어요</span></div>
    <SaveControls />
    <div className="studio-layout">
      <aside className="panel selected-panel"><div className="panel-title"><h2>선택한 제품 <span>{setup.items.length}</span></h2>{setup.items.length > 0 && <button className="icon-button" onClick={() => setClearOpen(true)} aria-label="전체 배치 비우기" title="배치 비우기"><RotateCcw size={15} /></button>}</div>
        <div className="selected-list">{setup.items.map(item => { const p = productById.get(item.product_id)!; return <div key={item.instance_id} className={`selected-item ${selectedId === item.instance_id ? 'selected-row' : ''}`}><button className="selected-top" onClick={() => setSelectedId(item.instance_id)}><div className="mini-art"><ProductArt product={p} /></div><div><strong>{p.name}</strong><small>{p.w} × {p.d} mm{p.sample ? ' · 기존 예시 상품' : ''}</small><span className="item-price">{money(p.price)}</span></div></button><div className="selected-actions"><button className="text-btn" onClick={() => setSelectedId(item.instance_id)}>{isOutside(item, setup) ? '책상 밖 · 위치 조정' : '제품 선택'}</button><button className="icon-button" onClick={() => remove(item.instance_id)} aria-label={`${p.name} 제품 제거`}><Trash2 size={14} /></button></div></div>; })}
          {!setup.items.length && <div className="empty-products"><Plus size={24} /><p>아직 놓아둔 제품이 없어요.<br />좋아하는 것부터 하나씩.</p><button className="text-btn" onClick={example}>예시 배치로 시작해보기 <ArrowRightSmall /></button></div>}
        </div><button className="btn" onClick={() => { setSearch(''); setAddOpen(true); }}><Plus size={16} /> 제품 추가</button><Link className="text-btn full discovery-return" to="/products">제품 탐색에서 더 찾아보기 ↗</Link>
      </aside>
      <section className="canvas-panel"><div className="canvas-toolbar"><div><h2>책상 크기 설정</h2><p>책상 상판의 가로와 깊이를 입력해 주세요.</p></div><span className="top-view-badge">TOP VIEW</span></div><form className="dimensions" onSubmit={resize}><label>가로 (mm)<input aria-label="책상 가로 (mm)" type="number" min="100" max="10000" step="1" required value={width} onChange={e => setWidth(e.target.value)} /></label><span className="dimension-times">×</span><label>깊이 (mm)<input aria-label="책상 깊이 (mm)" type="number" min="100" max="10000" step="1" required value={depth} onChange={e => setDepth(e.target.value)} /></label><button className="btn" type="submit">적용</button></form>
        <div className="edit-actions" role="group" aria-label="배치 편집">
          <button className="btn" disabled={!canUndo} onClick={undo} title="Ctrl/Cmd + Z"><Undo2 size={17} /> 실행 취소</button>
          <button className="btn" disabled={!canRedo} onClick={redo} title="Ctrl/Cmd + Shift + Z"><Redo2 size={17} /> 다시 실행</button>
          <button className="btn" disabled={!selected} onClick={() => setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === selectedId ? rotateItem(i) : i) }))}><RotateCw size={17} /> 90° 회전</button>
          <span>{selected ? `선택 제품 ${selected.rotation ?? 0}°` : '회전할 제품을 선택하세요'}</span>
        </div>
        <DeskCanvas />
        <div className="canvas-quick-actions"><button className="btn primary" onClick={() => { setSearch(''); setAddOpen(true); }}><Plus size={16} /> 제품 추가</button><Link className="btn" to="/guide">사용 가이드 <ArrowUpRight size={16} /></Link></div>
        <div className="canvas-hint"><Move size={16} /><p>제품을 드래그해 이동하세요.<br />방향키로 10 mm씩, Shift + 방향키로 50 mm씩 조정할 수 있어요.</p></div>
        {warnings.length > 0 && <div className="status warn" role="status"><Info size={15} /> {warnings.length}개 제품이 책상 영역을 벗어났어요. 목록에서 선택해 위치를 조정해 주세요.</div>}
      </section>
      <aside className="panel layout-info"><div className="price-summary"><div className="summary-caption"><strong>총 예상 가격</strong><span>제품 {setup.items.length}개</span></div><div className="total-price" aria-live="polite">{money(totalPrice(setup.items))}</div><p>{setup.items.some(i => productById.get(i.product_id)?.sample) ? '기존 예시 상품 가격이 포함된 합계예요.' : '확인일 기준 합계 · 실시간 가격이 아니에요.'}<br />배송비와 할인은 포함하지 않습니다.</p></div><h2>배치 정보</h2>
        {selected && selectedProduct ? <><div className="info-product-art"><ProductArt product={selectedProduct} /></div><h3>{selectedProduct.name}</h3><p className="info-dim">배치 가로 {footprint(selected).w} mm · 깊이 {footprint(selected).d} mm · {selected.rotation ?? 0}°</p>{selectedProduct.dimension_note && <p className="info-dim">{selectedProduct.dimension_note}</p>}<PositionEditor key={selected.instance_id} item={selected} /><div className={`status ${isOutside(selected, setup) ? 'warn' : ''}`}>{isOutside(selected, setup) ? <><Info size={14} /> 책상 영역을 벗어났어요</> : <><Check size={14} /> 책상 안에 배치되었어요</>}</div><button className="text-btn" onClick={() => setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === selected.instance_id ? { ...i, x_mm: Math.round((s.desk_width_mm - footprint(i).w) / 2), y_mm: Math.round((s.desk_depth_mm - footprint(i).d) / 2) } : i) }))}>책상 가운데로 이동</button><Link className="btn" to={`/products/${selectedProduct.id}`}>제품 상세보기 <ArrowUpRight size={15} /></Link></> : <div className="selection-placeholder"><Move size={24} /><p>제품을 선택하면 크기와<br />배치 상태를 확인할 수 있어요.</p></div>}
        <p className="mobile-help">위에서 본 설치 면적을 같은 축척으로 비교해요. 제품 높이, 물체 간 겹침, 케이블 공간은 별도로 확인해 주세요.</p>
      </aside>
    </div>
    {addOpen && <Modal title="책상에 놓을 제품 선택" onClose={() => setAddOpen(false)} wide><p className="eyebrow">ADD YOUR FAVORITES</p><h2>책상에 무엇을 놓을까요?</h2><p className="auth-copy">같은 제품도 여러 개 배치할 수 있어요. 실물 사진과 최신 가격은 판매처에서 확인해 주세요.</p><label className="field"><input aria-label="추가할 제품 검색" placeholder="제품 이름으로 검색" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="add-grid">{products.filter(p => p.name.includes(search.trim())).map(p => <button key={p.id} onClick={() => add(p.id)}><div className="mini-art"><ProductArt product={p} /></div><div><strong>{p.name}</strong><small>{p.w} × {p.d} mm · {money(p.price)}</small></div><Plus size={16} /></button>)}</div>{!products.some(p => p.name.includes(search.trim())) && <p className="auth-copy">검색 결과가 없어요.</p>}</Modal>}
    {clearOpen && <Modal title="현재 배치 비우기" onClose={() => setClearOpen(false)}><h2>현재 배치를 비울까요?</h2><p className="auth-copy">화면에 배치한 제품을 모두 제거합니다. 계정에 저장한 구성은 유지돼요.</p><div className="dialog-actions"><button className="btn" onClick={() => setClearOpen(false)}>취소</button><button className="btn danger" onClick={() => { setSetup(s => ({ ...s, items: [] })); setSelectedId(null); setClearOpen(false); }}>배치 비우기</button></div></Modal>}
  </div>;
}
function ArrowRightSmall() { return <span aria-hidden="true">→</span>; }
