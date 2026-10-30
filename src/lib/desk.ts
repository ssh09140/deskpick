import productData from '../data/products.json';
import legacyData from '../data/legacy-products.json';

export type Product = {
  id: string; name: string; cat: number; price: number; w: number; d: number;
  type: string; desc: string; tag: string; why: string; sample: boolean;
  seller_name: string | null; seller_url: string | null; price_checked_at: string | null;
  image_source: string; image_url?: string; image_source_url?: string; manufacturer_code?: string; dimension_note?: string;
};
export const products: Product[] = productData;
export const categories = ['전체', '모니터 받침대', '키보드 · 마우스', '조명', '데스크매트', '수납 · 정리', '데스크 소품'];
// Keep old sample identities and dimensions for saved layouts; do not silently replace them.
export const productById = new Map<string, Product>([...legacyData, ...products].map(p => [p.id, p]));
export const availableCategories = categories.map((name, id) => ({ name, id })).filter(c => c.id === 0 || products.some(p => p.cat === c.id));
export type DeskItem = { instance_id: string; product_id: string; x_mm: number; y_mm: number; rotation?: 0 | 90 | 180 | 270 };
export type DeskSetup = { desk_width_mm: number; desk_depth_mm: number; items: DeskItem[] };
export type SavedSetup = DeskSetup & { user_id: string; created_at: string; updated_at: string };
export const emptySetup = (): DeskSetup => ({ desk_width_mm: 1400, desk_depth_mm: 800, items: [] });
export const money = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
export const totalPrice = (items: DeskItem[]) => items.reduce((sum, item) => sum + (productById.get(item.product_id)?.price ?? 0), 0);
export function footprint(item: DeskItem) {
  const p = productById.get(item.product_id)!;
  return item.rotation === 90 || item.rotation === 270 ? { w: p.d, d: p.w } : { w: p.w, d: p.d };
}
export function rotateItem(item: DeskItem): DeskItem {
  const before = footprint(item);
  const rotated = { ...item, rotation: ((item.rotation ?? 0) + 90) % 360 as DeskItem['rotation'] };
  const after = footprint(rotated);
  return { ...rotated, x_mm: item.x_mm + (before.w - after.w) / 2, y_mm: item.y_mm + (before.d - after.d) / 2 };
}
export const isOutside = (item: DeskItem, setup: DeskSetup) => {
  const product = productById.get(item.product_id);
  if (!product) return true;
  const size = footprint(item);
  return item.x_mm < 0 || item.y_mm < 0 || item.x_mm + size.w > setup.desk_width_mm || item.y_mm + size.d > setup.desk_depth_mm;
};
export function parseSetup(value: unknown): DeskSetup {
  if (!value || typeof value !== 'object') throw new Error('책상 구성 형식을 확인해 주세요.');
  const s = value as Record<string, unknown>;
  if (!Number.isInteger(s.desk_width_mm) || !Number.isInteger(s.desk_depth_mm) || Number(s.desk_width_mm) <= 0 || Number(s.desk_depth_mm) <= 0 || !Array.isArray(s.items)) throw new Error('책상 크기 또는 제품 목록이 올바르지 않아요.');
  const ids = new Set<string>();
  const items: DeskItem[] = s.items.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('배치 정보가 올바르지 않아요.');
    const item = raw as DeskItem;
    if (typeof item.instance_id !== 'string' || !item.instance_id.trim() || ids.has(item.instance_id) || typeof item.product_id !== 'string' || !productById.has(item.product_id) || typeof item.x_mm !== 'number' || typeof item.y_mm !== 'number' || !Number.isFinite(item.x_mm) || !Number.isFinite(item.y_mm)) throw new Error('저장된 구성에 지원하지 않는 제품이나 잘못된 좌표가 있어요. 현재 배치는 유지됩니다.');
    ids.add(item.instance_id);
    if (item.rotation !== undefined && ![0, 90, 180, 270].includes(item.rotation)) throw new Error('저장된 제품의 회전 각도가 올바르지 않아요.');
    return { instance_id: item.instance_id, product_id: item.product_id, x_mm: item.x_mm, y_mm: item.y_mm, ...(item.rotation ? { rotation: item.rotation } : {}) };
  });
  return { desk_width_mm: s.desk_width_mm as number, desk_depth_mm: s.desk_depth_mm as number, items };
}
export const sameSetup = (a: DeskSetup, b: DeskSetup) => JSON.stringify(parseSetup(a)) === JSON.stringify(parseSetup(b));
export function newItem(product: Product, setup: DeskSetup): DeskItem {
  const offset = (setup.items.filter(i => i.product_id === product.id).length % 5) * 25;
  return { instance_id: crypto.randomUUID(), product_id: product.id, x_mm: Math.round((setup.desk_width_mm - product.w) / 2 + offset), y_mm: Math.round((setup.desk_depth_mm - product.d) / 2 + offset) };
}
