import { useRef, useState } from 'react';
import { useApp } from '../context';
import { snapRotation } from '../lib/alignment';
import { rotateItem, type DeskItem } from '../lib/desk';

export function RotationControl({ item }: { item?: DeskItem }) {
  const { setSetup, beginEdit, endEdit } = useApp();
  const pointer = useRef(false);
  const [raw, setRaw] = useState<number | null>(null);
  const angle = item?.rotation ?? 0;
  function finish() {
    if (!pointer.current) return;
    pointer.current = false;
    setRaw(null);
    endEdit();
  }
  return <label className="rotation-control">회전
    <input type="range" min="0" max="360" step="1" disabled={!item}
      value={raw ?? angle} aria-label="제품 회전 각도" aria-valuetext={angle + '도'}
      onPointerDown={e => {
        pointer.current = true;
        beginEdit();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onBlur={finish}
      onChange={e => {
        const value = e.currentTarget.valueAsNumber;
        if (pointer.current) setRaw(value);
        const next = pointer.current ? snapRotation(value) : value;
        setSetup(s => ({ ...s, items: s.items.map(i => i.instance_id === item?.instance_id ? rotateItem(i, next) : i) }));
      }}
    /><output>{angle}°</output>
  </label>;
}
