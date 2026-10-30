import { useState } from 'react';
import { art, topArt } from '../lib/art';
import type { Product } from '../lib/desk';
export function ProductArt({ product, type, top = false }: { product?: Product; type?: string; top?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const chosenType = product?.type ?? type ?? 'stand';
  if (!top && product?.image_url && failedUrl !== product.image_url) {
    return <img className="product-photo" src={product.image_url} alt={product.name} loading="lazy" decoding="async" onError={() => setFailedUrl(product.image_url!)} />;
  }
  if (product && !product.sample) {
    const scale = Math.min(220 / product.w, 140 / product.d);
    const w = product.w * scale, h = product.d * scale;
    const fill = chosenType === 'cork' ? '#c6aa82' : chosenType === 'clock' ? '#d3b75e' : ['mat', 'metal'].includes(chosenType) ? '#656e69' : '#e9e7de';
    return <span className="illustration" aria-hidden="true"><svg viewBox={top ? `0 0 ${product.w} ${product.d}` : '0 0 280 210'} preserveAspectRatio={top ? 'none' : 'xMidYMid meet'}>
      {top ? <><rect x="1" y="1" width={product.w - 2} height={product.d - 2} rx="5" fill={fill} stroke="#6b766a" strokeWidth="2" /><path d={`M 8 8 H ${product.w - 8} V ${product.d - 8} H 8 Z`} fill="none" stroke="#ffffff88" strokeWidth="2" /></> : <>
        <rect x={(280 - w) / 2 + 3} y={(180 - h) / 2 + 6} width={w} height={h} rx="7" fill="#243b2410" />
        <rect x={(280 - w) / 2} y={(180 - h) / 2} width={w} height={h} rx="7" fill={fill} stroke="#85917e" />
        <rect x={(280 - w) / 2 + 5} y={(180 - h) / 2 + 5} width={Math.max(w - 10, 1)} height={Math.max(h - 10, 1)} rx="4" fill="none" stroke="#ffffff88" />
        <text x="140" y="192" textAnchor="middle" fill="#61715d" fontSize="12">{product.w} × {product.d} mm</text>
      </>}
    </svg></span>;
  }
  return <span className="illustration" aria-hidden="true" dangerouslySetInnerHTML={{ __html: top ? topArt({ type: chosenType }) : art(chosenType) }} />;
}
