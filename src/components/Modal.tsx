import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closer = useRef(onClose);
  closer.current = onClose;
  useEffect(() => {
    const element = dialog.current!;
    const focus = document.activeElement as HTMLElement | null;
    element.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = old; if (focus?.isConnected) focus.focus(); };
  }, []);
  return <dialog ref={dialog} className={`app-dialog ${wide ? 'wide-dialog' : ''}`} aria-label={title}
    onCancel={e => { e.preventDefault(); closer.current(); }}
    onClick={e => { if (e.target !== e.currentTarget) return; const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closer.current(); }}>
    <button className="dialog-close" type="button" onClick={onClose} aria-label="닫기"><X size={20} /></button>
    {children}
  </dialog>;
}
