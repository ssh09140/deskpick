import { art, topArt } from '../lib/art';
import type { Product } from '../lib/desk';
export function ProductArt({ product, type, top = false }: { product?: Product; type?: string; top?: boolean }) {
  const chosenType = product?.type ?? type ?? 'stand';
  return <span className="illustration" aria-hidden="true" dangerouslySetInnerHTML={{ __html: top ? topArt({ type: chosenType }) : art(chosenType) }} />;
}
