import { useRef } from 'react';
import { isOutside, productById, type DeskSetup } from '../lib/desk';
import { ProductArt } from './ProductArt';
import { useApp } from '../context';

export function DeskPreview({ setup }: { setup: DeskSetup }) {
  return <div className="saved-mini-desk" style={{ aspectRatio: `${setup.desk_width_mm}/${setup.desk_depth_mm}` }}>
    {setup.items.map(item => { const p = productById.get(item.product_id); return p && <span key={item.instance_id} style={{ left: `${item.x_mm / setup.desk_width_mm * 100}%`, top: `${item.y_mm / setup.desk_depth_mm * 100}%`, width: `${p.w / setup.desk_width_mm * 100}%`, height: `${p.d / setup.desk_depth_mm * 100}%` }}><ProductArt product={p} top /></span>; })}
  </div>;
}
export function DeskCanvas() {
  const { setup, setSetup, selectedId, setSelectedId } = useApp();
  const desk = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointer: number; startX: number; startY: number; x: number; y: number; scale: number } | null>(null);
  const move = (id: string, x: number, y: number) => setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === id ? { ...i, x_mm: Math.round(x), y_mm: Math.round(y) } : i) }));
  return <div className="desk-viewport"><div className="desk" ref={desk} role="group" aria-label="위에서 본 내 책상" style={{ aspectRatio: `${setup.desk_width_mm}/${setup.desk_depth_mm}` }}>
    {!setup.items.length && <div className="desk-empty"><span>YOUR DESK, YOUR WAY</span><p>좋아하는 제품을 하나 놓아볼까요?</p></div>}
    {setup.items.map(item => { const p = productById.get(item.product_id)!; const out = isOutside(item, setup); return <button type="button" key={item.instance_id} className={`object ${selectedId === item.instance_id ? 'chosen' : ''} ${out ? 'outside' : ''}`}
      aria-label={`${p.name}, 방향키로 이동${out ? ', 책상 밖' : ''}`} aria-pressed={selectedId === item.instance_id}
      style={{ left: `${item.x_mm / setup.desk_width_mm * 100}%`, top: `${item.y_mm / setup.desk_depth_mm * 100}%`, width: `${p.w / setup.desk_width_mm * 100}%`, height: `${p.d / setup.desk_depth_mm * 100}%`, zIndex: p.type === 'mat' || p.type === 'cork' ? 1 : selectedId === item.instance_id ? 5 : 2 }}
      onClick={() => setSelectedId(item.instance_id)}
      onPointerDown={e => {
        if (e.button !== 0 || drag.current) return;
        setSelectedId(item.instance_id);
        const r = desk.current!.getBoundingClientRect();
        drag.current = { id: item.instance_id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, x: item.x_mm, y: item.y_mm, scale: setup.desk_width_mm / r.width };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const d = drag.current;
        if (!d || d.id !== item.instance_id || d.pointer !== e.pointerId) return;
        move(d.id, Math.max(-p.w, Math.min(setup.desk_width_mm, d.x + (e.clientX - d.startX) * d.scale)), Math.max(-p.d, Math.min(setup.desk_depth_mm, d.y + (e.clientY - d.startY) * d.scale)));
      }}
      onPointerUp={e => { if (drag.current?.pointer === e.pointerId) drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={e => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
        const direction = delta[e.key];
        if (direction) { e.preventDefault(); setSelectedId(item.instance_id); move(item.instance_id, item.x_mm + direction[0] * (e.shiftKey ? 5 : 1), item.y_mm + direction[1] * (e.shiftKey ? 5 : 1)); }
      }}><ProductArt product={p} top /></button>; })}
  </div><div className="desk-label"><span />{setup.desk_width_mm.toLocaleString()} × {setup.desk_depth_mm.toLocaleString()} mm<span /></div></div>;
}
