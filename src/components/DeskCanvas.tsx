import { useRef, useState } from 'react';
import { footprint, unitSize, itemLabel, isOutside, productById, type DeskItem, type DeskSetup } from '../lib/desk';
import { ProductArt } from './ProductArt';
import { snapAxis } from '../lib/alignment';
import { useApp } from '../context';

function RotatedArt({ item, angle = item.rotation ?? 0 }: { item: DeskItem; angle?: number }) {
  const p = productById.get(item.product_id)!;
  const size = footprint({ ...item, rotation: angle });
  const unit = unitSize(item);
  return <span className="rotated-art" style={{ width: `${unit.w / size.w * 100}%`, height: `${unit.d / size.d * 100}%`, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}><ProductArt product={{ ...p, ...unit }} top />{p.passive_depth_mm && <span className="speaker-unit-mark">{item.passive_of ? 'P' : 'A'}</span>}</span>;
}

export function DeskPreview({ setup }: { setup: DeskSetup }) {
  return <div className="saved-mini-desk" style={{ aspectRatio: `${setup.desk_width_mm}/${setup.desk_depth_mm}` }}>
    {setup.items.map(item => { const p = productById.get(item.product_id); const size = footprint(item); return p && <span key={item.instance_id} style={{ left: `${item.x_mm / setup.desk_width_mm * 100}%`, top: `${item.y_mm / setup.desk_depth_mm * 100}%`, width: `${size.w / setup.desk_width_mm * 100}%`, height: `${size.d / setup.desk_depth_mm * 100}%` }}><RotatedArt item={item} /></span>; })}
  </div>;
}
export function DeskCanvas() {
  const { setup, setSetup, selectedId, setSelectedId, beginEdit, endEdit } = useApp();
  const desk = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointer: number; startX: number; startY: number; x: number; y: number; scale: number } | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  function finishDrag(pointer: number) {
    if (drag.current?.pointer !== pointer) return;
    drag.current = null;
    setGuides({});
    endEdit();
  }
  const move = (id: string, x: number, y: number) => setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === id ? { ...i, x_mm: x, y_mm: y } : i) }));
  return <div className="desk-viewport"><div className="desk" ref={desk} role="group" aria-label="위에서 본 내 책상" style={{ aspectRatio: `${setup.desk_width_mm}/${setup.desk_depth_mm}` }}>
    {!setup.items.length && <div className="desk-empty"><span>YOUR DESK, YOUR WAY</span><p>좋아하는 제품을 하나 놓아볼까요?</p></div>}
    {setup.items.map(item => { const p = productById.get(item.product_id)!; const out = isOutside(item, setup); const size = footprint(item); const unit = unitSize(item); return <button type="button" key={item.instance_id} className={`object ${selectedId === item.instance_id ? 'chosen' : ''} ${out ? 'outside' : ''}`}
      aria-label={`${itemLabel(item)}, 방향키로 이동${out ? ', 책상 밖' : ''}`} aria-pressed={selectedId === item.instance_id}
      style={{ left: `${(item.x_mm + size.w / 2) / setup.desk_width_mm * 100}%`, top: `${(item.y_mm + size.d / 2) / setup.desk_depth_mm * 100}%`, width: `${unit.w / setup.desk_width_mm * 100}%`, height: `${unit.d / setup.desk_depth_mm * 100}%`, transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg)`, zIndex: p.type === 'mat' || p.type === 'cork' ? 1 : selectedId === item.instance_id ? 5 : 2 }}
      onClick={() => setSelectedId(item.instance_id)}
      onPointerDown={e => {
        if (e.button !== 0 || drag.current) return;
        setSelectedId(item.instance_id);
        beginEdit();
        const r = desk.current!.getBoundingClientRect();
        drag.current = { id: item.instance_id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, x: item.x_mm, y: item.y_mm, scale: setup.desk_width_mm / r.width };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const d = drag.current;
        if (!d || d.id !== item.instance_id || d.pointer !== e.pointerId) return;
        const width = setup.desk_width_mm, depth = setup.desk_depth_mm;
        const xs = [0, width / 2, width], ys = [0, depth / 2, depth];
        for (const other of setup.items) {
          if (other.instance_id === d.id) continue;
          const bounds = footprint(other);
          xs.push(other.x_mm, other.x_mm + bounds.w / 2, other.x_mm + bounds.w);
          ys.push(other.y_mm, other.y_mm + bounds.d / 2, other.y_mm + bounds.d);
        }
        const x = Math.max(-size.w, Math.min(width, d.x + (e.clientX - d.startX) * d.scale));
        const y = Math.max(-size.d, Math.min(depth, d.y + (e.clientY - d.startY) * d.scale));
        const alignedX = snapAxis(x, size.w, xs, 4 * d.scale);
        const alignedY = snapAxis(y, size.d, ys, 4 * d.scale);
        setGuides({ x: alignedX.guide, y: alignedY.guide });
        move(d.id, alignedX.position, alignedY.position);
      }}
      onPointerUp={e => finishDrag(e.pointerId)}
      onPointerCancel={e => finishDrag(e.pointerId)}
      onLostPointerCapture={e => finishDrag(e.pointerId)}
      onKeyUp={e => { if (e.key.startsWith('Arrow')) endEdit(); }}
      onBlur={() => endEdit()}
      onKeyDown={e => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
        const direction = delta[e.key];
        if (direction) { e.preventDefault(); beginEdit(); setSelectedId(item.instance_id); move(item.instance_id, item.x_mm + direction[0] * (e.shiftKey ? 5 : 1), item.y_mm + direction[1] * (e.shiftKey ? 5 : 1)); }
      }}><RotatedArt item={item} angle={0} /></button>; })}
    {guides.x !== undefined && <i aria-hidden="true" className="alignment-guide vertical" style={{ left: `${guides.x / setup.desk_width_mm * 100}%` }} />}
    {guides.y !== undefined && <i aria-hidden="true" className="alignment-guide horizontal" style={{ top: `${guides.y / setup.desk_depth_mm * 100}%` }} />}
  </div><div className="desk-label"><span />{setup.desk_width_mm.toLocaleString()} × {setup.desk_depth_mm.toLocaleString()} mm<span /></div></div>;
}
