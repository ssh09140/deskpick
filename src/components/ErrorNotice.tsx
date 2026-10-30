import { RefreshCw } from 'lucide-react';

export function ErrorNotice({ title, message, onRetry, busy = false, onDismiss }: {
  title: string; message: string; onRetry?: () => void; busy?: boolean; onDismiss?: () => void;
}) {
  return <div className="error-notice" role="alert">
    <div><strong>{title}</strong><p>{message}</p></div>
    {(onRetry || onDismiss) && <div className="error-notice-actions">
      {onRetry && <button type="button" className="btn" disabled={busy} onClick={onRetry}><RefreshCw size={16} />{busy ? '처리 중…' : '다시 시도'}</button>}
      {onDismiss && <button type="button" className="text-btn" disabled={busy} onClick={onDismiss}>닫기</button>}
    </div>}
  </div>;
}
